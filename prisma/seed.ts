import {
  PrismaClient,
  UserRole,
  StaffRole,
  CompanyGroupType,
  MatterStage,
  MatterType,
  PackageTier,
  TrusteeStructure,
  KycStatus,
  CheckResult,
  KycProvider,
  HandoffStatus,
  DocumentCategory,
  DocumentSignStatus,
  FileNoteType,
  FileNoteSource,
  FileNoteDraftStatus,
  AuditActionType,
  TaskStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo123";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Company groups ---
  const companies = await Promise.all([
    upsertCompany("cg_aap", "Admin Autopilot", CompanyGroupType.INTERNAL, "team@aap.com.au"),
    upsertCompany("cg_clime", "Clime ASX", CompanyGroupType.REFERRER, "david@clime.com.au"),
    upsertCompany("cg_liberty", "Liberty", CompanyGroupType.REFERRER, "sarah@liberty.com.au"),
    upsertCompany("cg_riverx", "RiverX", CompanyGroupType.REFERRER, "mark@riverx.com.au"),
  ]);
  const [aap, clime, liberty, riverx] = companies;

  // --- Staff users ---
  const staffSeed = [
    {
      email: "sarah@aap.com.au",
      name: "Sarah Chen",
      userRole: UserRole.SUPERUSER,
      staffRole: StaffRole.MASTER_OWNER,
      experienceYears: 12,
      bio: "Master Owner. Sees everything, approves matters, assigns stages.",
      hobbies: "Trail running, sourdough",
      phone: "+61 2 1234 5670",
    },
    {
      email: "emma@aap.com.au",
      name: "Emma Wilson",
      userRole: UserRole.STAFF,
      staffRole: StaffRole.BOOKKEEPER,
      experienceYears: 6,
      bio: "Prepare stage owner — collects docs, manages uploads, drafts file notes.",
      hobbies: "Knitting, cycling",
      phone: "+61 2 1234 5671",
    },
    {
      email: "michael@aap.com.au",
      name: "Michael Torres",
      userRole: UserRole.STAFF,
      staffRole: StaffRole.COMPLIANCE_OFFICER,
      experienceYears: 9,
      bio: "Check stage owner — reviews KYC, verifies documents.",
      hobbies: "Chess, surfing",
      phone: "+61 2 1234 5672",
    },
    {
      email: "rachel@aap.com.au",
      name: "Rachel Park",
      userRole: UserRole.STAFF,
      staffRole: StaffRole.TAX_AGENT,
      experienceYears: 14,
      bio: "Lodge stage owner — submits ATO/ASIC, manages lodgement.",
      hobbies: "Mountain biking",
      phone: "+61 2 1234 5673",
    },
  ] as const;

  const staffByRole: Partial<Record<StaffRole, { staffId: string; userId: string }>> = {};
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
        phone: s.phone,
        companyGroupId: aap.id,
      },
      create: {
        userId: user.id,
        role: s.staffRole,
        experienceYears: s.experienceYears,
        bio: s.bio,
        hobbies: s.hobbies,
        phone: s.phone,
        companyGroupId: aap.id,
      },
    });
    staffByEmail[s.email] = { staffId: staff.id, userId: user.id };
    staffByRole[s.staffRole] = { staffId: staff.id, userId: user.id };
  }

  // --- Client user (portal access) ---
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

  // --- Sample matters ---
  type MatterSeed = {
    ref: string;
    fundName: string;
    stage: MatterStage;
    matterType: MatterType;
    packageTier: PackageTier;
    trusteeStructure: TrusteeStructure;
    company: string;
    abn?: string;
    acn?: string;
    primaryContactId?: string;
    members: Array<{ first: string; last: string; email?: string; isTrustee: boolean; primary?: boolean }>;
    ownerStaffRole: StaffRole;
    handoffPending?: boolean;
    daysAgo: number;
  };

  const matterSeeds: MatterSeed[] = [
    {
      ref: "M001",
      fundName: "Smith Family Superannuation Fund",
      stage: MatterStage.CHECK,
      matterType: MatterType.NEW_SMSF_SETUP,
      packageTier: PackageTier.DEFAULT_PLUS_ACCOUNTING,
      trusteeStructure: TrusteeStructure.INDIVIDUAL,
      company: liberty.id,
      abn: "12 345 678 901",
      primaryContactId: johnClient.id,
      members: [
        { first: "John", last: "Smith", email: "john.smith@example.com", isTrustee: true, primary: true },
        { first: "Mary", last: "Smith", email: "mary@example.com", isTrustee: true },
      ],
      ownerStaffRole: StaffRole.COMPLIANCE_OFFICER,
      daysAgo: 14,
    },
    {
      ref: "M002",
      fundName: "Johnson Retirement Fund",
      stage: MatterStage.PREPARE,
      matterType: MatterType.EXISTING_ONBOARDING,
      packageTier: PackageTier.UNLISTED_ASSETS,
      trusteeStructure: TrusteeStructure.INDIVIDUAL,
      company: clime.id,
      members: [{ first: "Linda", last: "Johnson", email: "linda@example.com", isTrustee: true, primary: true }],
      ownerStaffRole: StaffRole.BOOKKEEPER,
      handoffPending: true,
      daysAgo: 9,
    },
    {
      ref: "M003",
      fundName: "Williams Corp Trustee Fund",
      stage: MatterStage.LODGE,
      matterType: MatterType.CORPORATE_TRUSTEE_SETUP,
      packageTier: PackageTier.DEFAULT_PLUS_ACCOUNTING,
      trusteeStructure: TrusteeStructure.CORPORATE,
      company: aap.id,
      abn: "98 765 432 100",
      acn: "098 765 432",
      members: [{ first: "Tom", last: "Williams", email: "tom@example.com", isTrustee: true, primary: true }],
      ownerStaffRole: StaffRole.TAX_AGENT,
      handoffPending: true,
      daysAgo: 30,
    },
    {
      ref: "M004",
      fundName: "Brown Family Super",
      stage: MatterStage.START,
      matterType: MatterType.NEW_SMSF_SETUP,
      packageTier: PackageTier.BYOA,
      trusteeStructure: TrusteeStructure.INDIVIDUAL,
      company: riverx.id,
      members: [{ first: "Alex", last: "Brown", email: "alex@example.com", isTrustee: true, primary: true }],
      ownerStaffRole: StaffRole.BOOKKEEPER,
      daysAgo: 2,
    },
    {
      ref: "M005",
      fundName: "Chen Investment Fund",
      stage: MatterStage.ACTIVE,
      matterType: MatterType.EXISTING_ONBOARDING,
      packageTier: PackageTier.DEFAULT_PLUS_ACCOUNTING,
      trusteeStructure: TrusteeStructure.CORPORATE,
      company: clime.id,
      abn: "55 555 555 555",
      members: [{ first: "Wei", last: "Chen", email: "wei@example.com", isTrustee: true, primary: true }],
      ownerStaffRole: StaffRole.MASTER_OWNER,
      daysAgo: 180,
    },
    {
      ref: "M006",
      fundName: "Davis Investment Fund",
      stage: MatterStage.CHECK,
      matterType: MatterType.NEW_SMSF_SETUP,
      packageTier: PackageTier.DEFAULT_PLUS_ACCOUNTING,
      trusteeStructure: TrusteeStructure.INDIVIDUAL,
      company: liberty.id,
      members: [{ first: "Ben", last: "Davis", email: "ben@example.com", isTrustee: true, primary: true }],
      ownerStaffRole: StaffRole.MASTER_OWNER,
      daysAgo: 21,
    },
  ];

  for (const ms of matterSeeds) {
    const createdAt = new Date(Date.now() - ms.daysAgo * 86400_000);
    const matter = await prisma.matter.upsert({
      where: { matterRef: ms.ref },
      update: { stage: ms.stage },
      create: {
        matterRef: ms.ref,
        fundName: ms.fundName,
        stage: ms.stage,
        matterType: ms.matterType,
        packageTier: ms.packageTier,
        trusteeStructure: ms.trusteeStructure,
        abn: ms.abn,
        acn: ms.acn,
        establishmentDate: createdAt,
        companyGroupId: ms.company,
        primaryContactId: ms.primaryContactId ?? null,
        createdAt,
      },
    });

    // Members
    for (const m of ms.members) {
      const existing = await prisma.member.findFirst({
        where: { matterId: matter.id, firstName: m.first, lastName: m.last },
      });
      if (!existing) {
        await prisma.member.create({
          data: {
            matterId: matter.id,
            firstName: m.first,
            lastName: m.last,
            email: m.email ?? null,
            isTrustee: m.isTrustee,
          },
        });
      }
    }

    // Stage assignment for the current stage
    const owner = staffByRole[ms.ownerStaffRole];
    if (owner) {
      await prisma.stageAssignment.upsert({
        where: { matterId_stage: { matterId: matter.id, stage: ms.stage } },
        update: {
          staffId: owner.staffId,
          handoffStatus: ms.handoffPending ? HandoffStatus.PENDING : HandoffStatus.ACCEPTED,
        },
        create: {
          matterId: matter.id,
          stage: ms.stage,
          staffId: owner.staffId,
          handoffStatus: ms.handoffPending ? HandoffStatus.PENDING : HandoffStatus.ACCEPTED,
          acceptedAt: ms.handoffPending ? null : new Date(),
        },
      });
    }

    // Audit event: matter created
    const existingAudit = await prisma.auditAction.findFirst({
      where: { matterId: matter.id, action: AuditActionType.MATTER_CREATED },
    });
    if (!existingAudit) {
      await prisma.auditAction.create({
        data: {
          matterId: matter.id,
          userId: staffByRole.MASTER_OWNER?.userId ?? null,
          action: AuditActionType.MATTER_CREATED,
          details: `Created ${ms.fundName} (${ms.ref})`,
          createdAt,
        },
      });
    }
  }

  // --- Smith Family detail data: KYC + Document + FileNote + Audit ---
  const m001 = await prisma.matter.findUnique({ where: { matterRef: "M001" } });
  if (m001) {
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
    await prisma.kycCheck.upsert({
      where: { id: "kyc_m001_mary" },
      update: {},
      create: {
        id: "kyc_m001_mary",
        matterId: m001.id,
        memberName: "Mary Smith",
        status: KycStatus.IN_PROGRESS,
        identityCheck: CheckResult.PASS,
        livenessCheck: CheckResult.RUNNING,
        adverseMedia: CheckResult.RUNNING,
        provider: KycProvider.AAP_NATIVE,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
    });

    await prisma.document.upsert({
      where: { id: "doc_m001_trustdeed" },
      update: {},
      create: {
        id: "doc_m001_trustdeed",
        matterId: m001.id,
        fileName: "Smith Family Trust Deed.pdf",
        fileKey: "demo/trust-deed-m001.pdf",
        fileSize: 1_240_000,
        category: DocumentCategory.TRUST_DEED_ESTABLISHMENT,
        financialYear: "FY2026",
        signStatus: DocumentSignStatus.SIGNED,
        uploadedById: staffByRole.BOOKKEEPER?.staffId ?? null,
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
    });
    await prisma.document.upsert({
      where: { id: "doc_m001_id_john" },
      update: {},
      create: {
        id: "doc_m001_id_john",
        matterId: m001.id,
        fileName: "John Smith — Passport.pdf",
        fileKey: "demo/id-m001-john.pdf",
        fileSize: 410_000,
        category: DocumentCategory.KYC_IDENTITY,
        financialYear: "FY2026",
        signStatus: DocumentSignStatus.VERIFIED,
        uploadedById: staffByRole.BOOKKEEPER?.staffId ?? null,
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
      },
    });
    await prisma.document.upsert({
      where: { id: "doc_m001_acknowledgement" },
      update: {},
      create: {
        id: "doc_m001_acknowledgement",
        matterId: m001.id,
        fileName: "Trust Deed Acknowledgement.pdf",
        fileKey: "demo/ack-m001.pdf",
        fileSize: 240_000,
        category: DocumentCategory.SIGNED_AGREEMENT,
        financialYear: "FY2026",
        signStatus: DocumentSignStatus.AWAITING_SIGNATURE,
        uploadedById: staffByRole.BOOKKEEPER?.staffId ?? null,
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
    });

    await prisma.fileNote.upsert({
      where: { id: "fn_m001_call1" },
      update: {},
      create: {
        id: "fn_m001_call1",
        matterId: m001.id,
        authorStaffId: staffByRole.BOOKKEEPER?.staffId ?? null,
        type: FileNoteType.CALL,
        source: FileNoteSource.ECHO_NOTES,
        subject: "Trust deed review call — John Smith",
        body:
          "Walked John through the trust deed acknowledgement. Confirmed individual trustee structure preferred (no corporate trustee). John will sign the deed today and upload to portal. Mary's KYC still pending — Emma to follow up tomorrow.",
        tags: ["trust-deed", "kyc-delay"],
        pinned: true,
        draftStatus: FileNoteDraftStatus.PENDING_APPROVAL,
        threeCxRef: "#CX-4421",
        echoNotesRef: "#EN-2847",
        callDurationSec: 494,
        recordingUrl: "https://example.com/recordings/cx-4421",
        createdAt: new Date(Date.now() - 1000 * 60 * 22),
      },
    });

    // Audit trail
    await ensureAudit(m001.id, AuditActionType.KYC_APPROVED, "John Smith KYC passed (identity + liveness + adverse media)", staffByRole.COMPLIANCE_OFFICER?.userId);
    await ensureAudit(m001.id, AuditActionType.CALL_NOTE_RECEIVED, "Echo Notes draft ready — trust deed review call (8m14s)", null);
    await ensureAudit(m001.id, AuditActionType.DOCUMENT_UPLOAD, "Trust Deed uploaded by Emma Wilson", staffByRole.BOOKKEEPER?.userId);
    await ensureAudit(m001.id, AuditActionType.STAGE_ADVANCE, "Prepare → Check · Handoff to Michael Torres", staffByRole.MASTER_OWNER?.userId);

    // Task
    await prisma.task.upsert({
      where: { id: "task_m001_kyc_mary" },
      update: {},
      create: {
        id: "task_m001_kyc_mary",
        matterId: m001.id,
        assignedStaffId: staffByRole.BOOKKEEPER?.staffId ?? null,
        title: "Follow up Mary Smith KYC (liveness + adverse media)",
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  }

  console.log("Seed complete. Demo logins:");
  for (const s of staffSeed) {
    console.log(`  ${s.email} / ${DEMO_PASSWORD}  (${s.staffRole})`);
  }
  console.log(`  john.smith@example.com / ${DEMO_PASSWORD}  (CLIENT)`);
}

async function upsertCompany(id: string, name: string, type: CompanyGroupType, email: string) {
  return prisma.companyGroup.upsert({
    where: { id },
    update: { name, type, contactEmail: email },
    create: { id, name, type, contactEmail: email },
  });
}

async function ensureAudit(matterId: string, action: AuditActionType, details: string, userId: string | null | undefined) {
  const existing = await prisma.auditAction.findFirst({ where: { matterId, action, details } });
  if (existing) return existing;
  return prisma.auditAction.create({
    data: { matterId, action, details, userId: userId ?? null },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
