"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuditActionType } from "@prisma/client";

const updateDueSchema = z.object({
  matterId: z.string().min(1),
  // Empty string = clear the explicit date (revert to 1 May default).
  returnDueDate: z.string().optional(),
});

export async function updateReturnDueDate(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized" };
  if (session.user.role === "CLIENT") return { ok: false as const, error: "Forbidden" };

  const parsed = updateDueSchema.safeParse({
    matterId: formData.get("matterId")?.toString() ?? "",
    returnDueDate: formData.get("returnDueDate")?.toString() ?? "",
  });
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };

  const newDate = parsed.data.returnDueDate ? new Date(parsed.data.returnDueDate) : null;

  const before = await prisma.matter.findUnique({
    where: { id: parsed.data.matterId },
    select: { returnDueDate: true, fundName: true },
  });
  if (!before) return { ok: false as const, error: "Matter not found" };

  await prisma.matter.update({
    where: { id: parsed.data.matterId },
    data: { returnDueDate: newDate },
  });

  await prisma.auditAction.create({
    data: {
      matterId: parsed.data.matterId,
      userId: session.user.id,
      action: AuditActionType.REASSIGNED, // closest existing action type
      details: newDate
        ? `Return due date set to ${newDate.toLocaleDateString("en-AU")} (was ${before.returnDueDate ? new Date(before.returnDueDate).toLocaleDateString("en-AU") : "1 May default"})`
        : `Return due date cleared — reverting to 1 May default`,
    },
  });

  revalidatePath(`/matters/${parsed.data.matterId}`);
  revalidatePath("/matters");
  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
