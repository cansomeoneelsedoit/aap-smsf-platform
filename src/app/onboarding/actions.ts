"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  MatterStage,
  MatterType,
  PackageTier,
  TrusteeStructure,
  AuditActionType,
  HandoffStatus,
  CompanyGroupType,
  StaffRole,
} from "@prisma/client";
import { defaultReturnDueDate } from "@/lib/dates";

const submissionSchema = z.object({
  service: z.enum(["full-service", "byoa"]),
  packageTier: z.enum(["DEFAULT_PLUS_ACCOUNTING", "UNLISTED_ASSETS", "BYOA"]),
  fundName: z.string().min(2),
  matterType: z.enum(["NEW_SMSF_SETUP", "EXISTING_ONBOARDING", "CORPORATE_TRUSTEE_SETUP"]),
  trusteeStructure: z.enum(["INDIVIDUAL", "CORPORATE"]),
  companyGroup: z.string().optional(),
  abn: z.string().optional(),
  tfn: z.string().optional(),
  referrerName: z.string().optional(),
  establishmentDate: z.string().optional(),
  returnDueDate: z.string().optional(),
  members: z
    .array(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        mobile: z.string().optional(),
      }),
    )
    .min(1)
    .max(6),
});

export async function submitOnboarding(formData: FormData) {
  const raw = {
    service: formData.get("service")?.toString() ?? "full-service",
    packageTier: formData.get("packageTier")?.toString() ?? "DEFAULT_PLUS_ACCOUNTING",
    fundName: formData.get("fundName")?.toString() ?? "",
    matterType: formData.get("matterType")?.toString() ?? "NEW_SMSF_SETUP",
    trusteeStructure: formData.get("trusteeStructure")?.toString() ?? "INDIVIDUAL",
    companyGroup: formData.get("companyGroup")?.toString() ?? "",
    abn: formData.get("abn")?.toString() ?? "",
    tfn: formData.get("tfn")?.toString() ?? "",
    referrerName: formData.get("referrerName")?.toString() ?? "",
    establishmentDate: formData.get("establishmentDate")?.toString() ?? "",
    returnDueDate: formData.get("returnDueDate")?.toString() ?? "",
    members: [] as Array<{ firstName: string; lastName: string; email: string; mobile: string }>,
  };
  // Parse member rows (1..6)
  for (let i = 1; i <= 6; i++) {
    const fn = formData.get(`members.${i}.firstName`)?.toString();
    const ln = formData.get(`members.${i}.lastName`)?.toString();
    if (!fn && !ln) continue;
    raw.members.push({
      firstName: fn ?? "",
      lastName: ln ?? "",
      email: formData.get(`members.${i}.email`)?.toString() ?? "",
      mobile: formData.get(`members.${i}.mobile`)?.toString() ?? "",
    });
  }

  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().formErrors.join(" · ") || "Validation failed" };
  }
  const data = parsed.data;

  // Pick or create the CompanyGroup (referrer)
  let companyGroupId: string | null = null;
  if (data.companyGroup) {
    const existing = await prisma.companyGroup.findFirst({ where: { name: data.companyGroup } });
    companyGroupId =
      existing?.id ??
      (await prisma.companyGroup.create({
        data: {
          name: data.companyGroup,
          type: CompanyGroupType.REFERRER,
        },
      })).id;
  }

  // Generate next matter ref: M001, M002, ...
  const last = await prisma.matter.findFirst({ orderBy: { createdAt: "desc" }, select: { matterRef: true } });
  let nextNumber = 1;
  if (last?.matterRef?.match(/^M(\d+)$/)) {
    nextNumber = parseInt(last.matterRef.slice(1), 10) + 1;
  }
  const matterRef = `M${nextNumber.toString().padStart(3, "0")}`;

  // Create the Matter
  const matter = await prisma.matter.create({
    data: {
      matterRef,
      fundName: data.fundName,
      stage: MatterStage.START,
      matterType: data.matterType as MatterType,
      packageTier: data.packageTier as PackageTier,
      trusteeStructure: data.trusteeStructure as TrusteeStructure,
      abn: data.abn || null,
      tfn: data.tfn || null,
      referrerName: data.referrerName || null,
      establishmentDate: data.establishmentDate ? new Date(data.establishmentDate) : null,
      // If the client didn't supply a due date, fall through to the 1 May
      // default at read time by leaving this null. (Stored null = "use default".)
      returnDueDate: data.returnDueDate ? new Date(data.returnDueDate) : null,
      companyGroupId,
      members: {
        create: data.members.map((m) => ({
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email || null,
          mobile: m.mobile || null,
          isTrustee: true,
        })),
      },
      onboardingSubmission: {
        create: { payload: data as unknown as object },
      },
    },
  });

  // Auto-assign default Prepare stage to a Bookkeeper if one exists.
  const bookkeeper = await prisma.staff.findFirst({ where: { role: StaffRole.BOOKKEEPER } });
  if (bookkeeper) {
    await prisma.stageAssignment.create({
      data: {
        matterId: matter.id,
        stage: MatterStage.PREPARE,
        staffId: bookkeeper.id,
        handoffStatus: HandoffStatus.PENDING,
      },
    });
  }

  await prisma.auditAction.create({
    data: {
      matterId: matter.id,
      action: AuditActionType.MATTER_CREATED,
      details: `Onboarded ${data.fundName} via the 5-step wizard`,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/matters");
  redirect(`/onboarding/success?matter=${matter.matterRef}`);
}
