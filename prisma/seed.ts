import { PrismaClient, UserRole, StaffRole, CompanyGroupType, MatterStage, MatterType, PackageTier, TrusteeStructure, KycStatus, CheckResult, KycProvider } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo123";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const aap = await prisma.companyGroup.upsert({
    where: { id: "cg_aap" },
    update: {},
    create: {
      id: "cg_aap",
      name: "Admin Autopilot",
      type: CompanyGroupType.INTERNAL,
      contactEmail: "team@aap.com.au",
    },
  });

  const clime = await prisma.companyGroup.upsert({
    where: { id: "cg_clime" },
    update: {},
    create: {
      id: "cg_clime",
      name: "Clime ASX",
      type: CompanyGroupType.REFERRER,
      contactName: "Clime Partner",
      contactEmail: "partner@clime.example.com",
    },
  });

  const staffSeed = [
    {
      email: "sarah@aap.com.au",
      name: "Sarah Chen",
      userRole: UserRole.SUPERUSER,
      staffRole: StaffRole.MASTER_OWNER,
      experienceYears: 12,
      bio: "Master Owner — sees everything, approves matters, assigns stages.",
      hobbies: "Trail running, sourdough",
    },
    {
      email: "emma@aap.com.au",
      name: "Emma Wilson",
      userRole: UserRole.STAFF,
      staffRole: StaffRole.BOOKKEEPER,
      experienceYears: 6,
      bio: "Prepare stage owner — collects docs, manages uploads, drafts file notes.",
      hobbies: "Knitting",
    },
    {
      email: "michael@aap.com.au",
      name: "Michael Torres",
      userRole: UserRole.STAFF,
      staffRole: StaffRole.COMPLIANCE_OFFICER,
      experienceYears: 9,
      bio: "Check stage owner — reviews KYC, verifies documents.",
      hobbies: "Chess",
    },
    {
      email: "rachel@aap.com.au",
      name: "Rachel Park",
      userRole: UserRole.STAFF,
      staffRole: StaffRole.TAX_AGENT,
      experienceYears: 14,
      bio: "Lodge stage owner — submits ATO/ASIC, manages lodgement.",
      hobbies: "Cycling",
    },
  ] as const;

  const staffByEmail: Record<string, { staffId: string; userId: string }> = {};

  for (const s of staffSeed) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, role: s.userRole, passwordHash },
      create: { email: s.email, name: s.name, role: s.userRole, passwordHash },
    });

    const staff = await prisma.staff.upsert({
      where: { userId: user.id },
      update: {
        role: s.staffRole,
        experienceYears: s.experienceYears,
        bio: s.bio,
        hobbies: s.hobbies,
        companyGroupId: aap.id,
      },
      create: {
        userId: user.id,
        role: s.staffRole,
        experienceYears: s.experienceYears,
        bio: s.bio,
        hobbies: s.hobbies,
        companyGroupId: aap.id,
      },
    });

    staffByEmail[s.email] = { staffId: staff.id, userId: user.id };
  }

  const johnUser = await prisma.user.upsert({
    where: { email: "john.smith@example.com" },
    update: {},
    create: {
      email: "john.smith@example.com",
      name: "John Smith",
      role: UserRole.CLIENT,
      passwordHash,
    },
  });

  const johnClient = await prisma.client.upsert({
    where: { userId: johnUser.id },
    update: {},
    create: {
      userId: johnUser.id,
      fullName: "John Smith",
      email: "john.smith@example.com",
      phone: "+61 400 000 000",
    },
  });

  const m001 = await prisma.matter.upsert({
    where: { matterRef: "M001" },
    update: {},
    create: {
      matterRef: "M001",
      fundName: "Smith Family Superannuation Fund",
      stage: MatterStage.PREPARE,
      matterType: MatterType.NEW_SMSF_SETUP,
      packageTier: PackageTier.DEFAULT_PLUS_ACCOUNTING,
      trusteeStructure: TrusteeStructure.INDIVIDUAL,
      abn: "12 345 678 901",
      companyGroupId: clime.id,
      primaryContactId: johnClient.id,
    },
  });

  await prisma.stageAssignment.upsert({
    where: { matterId_stage: { matterId: m001.id, stage: MatterStage.PREPARE } },
    update: {},
    create: {
      matterId: m001.id,
      stage: MatterStage.PREPARE,
      staffId: staffByEmail["emma@aap.com.au"].staffId,
    },
  });

  const m002 = await prisma.matter.upsert({
    where: { matterRef: "M002" },
    update: {},
    create: {
      matterRef: "M002",
      fundName: "Tran Retirement Fund",
      stage: MatterStage.LODGE,
      matterType: MatterType.EXISTING_ONBOARDING,
      packageTier: PackageTier.UNLISTED_ASSETS,
      trusteeStructure: TrusteeStructure.CORPORATE,
      abn: "98 765 432 100",
      companyGroupId: aap.id,
    },
  });

  await prisma.stageAssignment.upsert({
    where: { matterId_stage: { matterId: m002.id, stage: MatterStage.LODGE } },
    update: {},
    create: {
      matterId: m002.id,
      stage: MatterStage.LODGE,
      staffId: staffByEmail["rachel@aap.com.au"].staffId,
    },
  });

  await prisma.kycCheck.upsert({
    where: { id: "kyc_m001_john" },
    update: {},
    create: {
      id: "kyc_m001_john",
      matterId: m001.id,
      memberName: "John Smith",
      status: KycStatus.PASSED,
      identityCheck: CheckResult.PASS,
      livenessCheck: CheckResult.PASS,
      adverseMedia: CheckResult.CLEAR,
      provider: KycProvider.AAP_NATIVE,
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
    },
  });

  console.log("Seed complete. Demo logins:");
  for (const s of staffSeed) {
    console.log(`  ${s.email} / ${DEMO_PASSWORD}  (${s.staffRole})`);
  }
  console.log(`  john.smith@example.com / ${DEMO_PASSWORD}  (CLIENT)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
