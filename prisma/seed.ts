import { StaffRole, Stage, AccountType, PartyRole } from "@/generated/prisma/client";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "@/lib/db";
import {
  DEMO_ACCOUNTS,
  INITIAL_ADVISER_GROUPS,
  INITIAL_AUDIT_LOG,
  INITIAL_FILE_NOTES,
  INITIAL_TASKS,
  SEED_MATTERS,
  STAGE_OWNER_MAP,
  STAGES,
} from "../lib/mock-data";

const DEMO_PASSWORD = "demo123";

const ROLE_MAP: Record<string, StaffRole> = {
  "Master Owner": StaffRole.MASTER_OWNER,
  Bookkeeper: StaffRole.BOOKKEEPER,
  "Compliance Officer": StaffRole.COMPLIANCE_OFFICER,
  "Tax Agent (Registered)": StaffRole.TAX_AGENT,
};

const STAFF_EXTRA = [
  {
    email: "rachel@aap.com.au",
    name: "Rachel Park",
    role: "Tax Agent (Registered)" as const,
    initials: "RP",
    color: "#dc2626",
    hobbies: "art, photography",
  },
];

const OWNER_NAME_TO_EMAIL: Record<string, string> = {
  "Sarah Chen": "sarah@aap.com.au",
  "Emma Wilson": "emma@aap.com.au",
  "Michael Torres": "michael@aap.com.au",
  "Rachel Park": "rachel@aap.com.au",
};

function parseDueDate(due: string): Date | null {
  if (due === "—" || due === "TBD") return null;
  const match = due.match(/^(\d{1,2}) Mar$/);
  if (!match) return null;
  return new Date(`2026-03-${match[1].padStart(2, "0")}T00:00:00.000Z`);
}

function parseAuditTimestamp(ts: string): Date {
  const [datePart, timePart] = ts.split(" ");
  return new Date(`${datePart}T${timePart}:00.000Z`);
}

function parseFileNoteTime(time: string): Date {
  const match = time.match(/^(\d{1,2}) Mar 2026 · (\d{2}):(\d{2})$/);
  if (!match) return new Date();
  return new Date(`2026-03-${match[1].padStart(2, "0")}T${match[2]}:${match[3]}:00.000Z`);
}

function generateId(): string {
  return crypto.randomUUID();
}

async function upsertStaffUser(
  email: string,
  name: string,
  roleLabel: string,
  initials: string,
  color: string,
  hobbies?: string
) {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const userId = generateId();

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      id: userId,
      name,
      email,
      emailVerified: true,
      accountType: AccountType.STAFF,
      accounts: {
        create: {
          id: generateId(),
          accountId: email,
          providerId: "credential",
          password: passwordHash,
        },
      },
      staffProfile: {
        create: {
          role: ROLE_MAP[roleLabel],
          initials,
          color,
          hobbies,
        },
      },
    },
    update: {
      name,
      emailVerified: true,
      accountType: AccountType.STAFF,
      staffProfile: {
        upsert: {
          create: {
            role: ROLE_MAP[roleLabel],
            initials,
            color,
            hobbies,
          },
          update: {
            role: ROLE_MAP[roleLabel],
            initials,
            color,
            hobbies,
          },
        },
      },
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        id: generateId(),
        accountId: email,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });
  } else {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: passwordHash },
    });
  }

  return user;
}

async function upsertClientUser(email: string, name: string, phone?: string) {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      id: generateId(),
      name,
      email,
      emailVerified: true,
      phone,
      accountType: AccountType.CLIENT,
      accounts: {
        create: {
          id: generateId(),
          accountId: email,
          providerId: "credential",
          password: passwordHash,
        },
      },
    },
    update: {
      name,
      emailVerified: true,
      phone,
      accountType: AccountType.CLIENT,
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        id: generateId(),
        accountId: email,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });
  } else {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: passwordHash },
    });
  }

  return user;
}

interface SeedPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  userId?: string;
}

async function upsertPersonParty(person: SeedPerson) {
  const name = `${person.firstName} ${person.lastName}`;
  return prisma.party.upsert({
    where: { id: person.id },
    create: {
      id: person.id,
      type: "PERSON",
      name,
      person: {
        create: {
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          phone: person.phone,
          userId: person.userId,
        },
      },
    },
    update: {
      name,
      person: {
        update: {
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          phone: person.phone,
          userId: person.userId,
        },
      },
    },
  });
}

async function upsertRelationship(parentPartyId: string, childPartyId: string, role: PartyRole) {
  await prisma.partyRelationship.upsert({
    where: {
      parentPartyId_childPartyId_role: { parentPartyId, childPartyId, role },
    },
    create: { parentPartyId, childPartyId, role },
    update: {},
  });
}

async function main() {
  console.log("Seeding database...");

  for (const group of INITIAL_ADVISER_GROUPS) {
    const [contactName, contactEmail] = group.contact.split(" · ");
    await prisma.adviserGroup.upsert({
      where: { id: group.id },
      create: {
        id: group.id,
        name: group.name,
        description: group.description,
        contactName,
        contactEmail,
        letter: group.letter,
        bgColor: group.bgColor,
        textColor: group.textColor,
        cbClass: `cb-${group.id}`,
      },
      update: {
        name: group.name,
        description: group.description,
        contactName,
        contactEmail,
        letter: group.letter,
        bgColor: group.bgColor,
        textColor: group.textColor,
        cbClass: `cb-${group.id}`,
      },
    });
  }

  await prisma.adviserGroup.upsert({
    where: { id: "aap" },
    create: {
      id: "aap",
      name: "AAP",
      description: "Internal · Direct clients",
      contactName: "Admin Autopilot",
      contactEmail: "admin@aap.com.au",
      letter: "A",
      bgColor: "#fff7ed",
      textColor: "#c2410c",
      cbClass: "cb-aap",
    },
    update: {},
  });

  const staffUsers: Record<string, { id: string }> = {};

  for (const account of DEMO_ACCOUNTS) {
    const user = await upsertStaffUser(
      account.email,
      account.name,
      account.role,
      account.initials,
      account.color
    );
    staffUsers[account.email] = user;
  }

  for (const extra of STAFF_EXTRA) {
    const user = await upsertStaffUser(
      extra.email,
      extra.name,
      extra.role,
      extra.initials,
      extra.color,
      extra.hobbies
    );
    staffUsers[extra.email] = user;
  }

  for (const stage of STAGES) {
    const ownerName = STAGE_OWNER_MAP[stage];
    const email = OWNER_NAME_TO_EMAIL[ownerName];
    const staff = staffUsers[email];
    if (!staff) continue;

    await prisma.stageAssignment.upsert({
      where: { stage: stage as Stage },
      create: { stage: stage as Stage, staffId: staff.id },
      update: { staffId: staff.id },
    });
  }

  // Client (trust) parties and their matters
  const matterRecords: Record<string, { id: string }> = {};
  const trustParties: Record<string, { id: string }> = {};

  for (const seed of SEED_MATTERS) {
    const trustPartyId = `party-trust-${seed.id.toLowerCase()}`;

    const trust = await prisma.party.upsert({
      where: { id: trustPartyId },
      create: {
        id: trustPartyId,
        type: "TRUST",
        name: seed.clientName,
        adviserGroupId: seed.adviserGroupId,
        trust: { create: { abn: seed.abn } },
      },
      update: {
        name: seed.clientName,
        adviserGroupId: seed.adviserGroupId,
        trust: {
          upsert: { create: { abn: seed.abn }, update: { abn: seed.abn } },
        },
      },
    });
    trustParties[seed.id] = trust;

    const stageOwnerName = STAGE_OWNER_MAP[seed.stage];
    const ownerEmail = OWNER_NAME_TO_EMAIL[stageOwnerName];
    const owner = staffUsers[ownerEmail];

    const matter = await prisma.matter.upsert({
      where: { displayId: seed.id },
      create: {
        displayId: seed.id,
        name: seed.matterName,
        matterType: seed.type,
        stage: seed.stage as Stage,
        dueDate: parseDueDate(seed.due),
        clientId: trust.id,
        ownerId: owner?.id,
      },
      update: {
        name: seed.matterName,
        matterType: seed.type,
        stage: seed.stage as Stage,
        dueDate: parseDueDate(seed.due),
        clientId: trust.id,
        ownerId: owner?.id,
      },
    });

    matterRecords[seed.id] = matter;
  }

  // Smith Family Superannuation Fund (M001): individual trustees with portal logins
  const john = await upsertClientUser("john@smithfamily.com.au", "John Smith", "0412 345 678");
  const mary = await upsertClientUser("mary@smithfamily.com.au", "Mary Smith", "0413 987 654");

  const johnParty = await upsertPersonParty({
    id: "party-person-john-smith",
    firstName: "John",
    lastName: "Smith",
    email: "john@smithfamily.com.au",
    phone: "0412 345 678",
    userId: john.id,
  });
  const maryParty = await upsertPersonParty({
    id: "party-person-mary-smith",
    firstName: "Mary",
    lastName: "Smith",
    email: "mary@smithfamily.com.au",
    phone: "0413 987 654",
    userId: mary.id,
  });

  const smithTrust = trustParties["M001"];
  if (smithTrust) {
    await upsertRelationship(smithTrust.id, johnParty.id, PartyRole.TRUSTEE);
    await upsertRelationship(smithTrust.id, maryParty.id, PartyRole.TRUSTEE);
  }

  // Brown Family Super (M004): corporate trustee with a director
  const brownCompany = await prisma.party.upsert({
    where: { id: "party-company-brown-family" },
    create: {
      id: "party-company-brown-family",
      type: "COMPANY",
      name: "Brown Family Pty Ltd",
      company: { create: { acn: "634 789 123" } },
    },
    update: {
      name: "Brown Family Pty Ltd",
      company: {
        upsert: {
          create: { acn: "634 789 123" },
          update: { acn: "634 789 123" },
        },
      },
    },
  });

  const davidParty = await upsertPersonParty({
    id: "party-person-david-brown",
    firstName: "David",
    lastName: "Brown",
    email: "david@brownfamily.com.au",
    phone: "0421 555 010",
  });

  const brownTrust = trustParties["M004"];
  if (brownTrust) {
    await upsertRelationship(brownTrust.id, brownCompany.id, PartyRole.TRUSTEE);
    await upsertRelationship(brownCompany.id, davidParty.id, PartyRole.DIRECTOR);
  }

  const m001 = matterRecords["M001"];
  if (m001) {
    for (const task of INITIAL_TASKS) {
      const assigneeName = task.meta.includes("Michael Torres")
        ? "Michael Torres"
        : "Emma Wilson";
      const assigneeEmail = OWNER_NAME_TO_EMAIL[assigneeName];
      const assignee = staffUsers[assigneeEmail];

      await prisma.task.upsert({
        where: { id: task.id },
        create: {
          id: task.id,
          matterId: m001.id,
          title: task.title,
          done: task.done,
          assigneeId: assignee?.id,
          completedAt: task.done ? new Date("2026-03-19T00:00:00.000Z") : null,
          dueDate: task.meta.includes("22 Mar")
            ? new Date("2026-03-22T00:00:00.000Z")
            : task.meta.includes("25 Mar")
              ? new Date("2026-03-25T00:00:00.000Z")
              : null,
        },
        update: {
          title: task.title,
          done: task.done,
          assigneeId: assignee?.id,
        },
      });
    }

    for (const note of INITIAL_FILE_NOTES) {
      const authorEmail =
        note.author === "Emma Wilson"
          ? "emma@aap.com.au"
          : "michael@aap.com.au";
      const author = staffUsers[authorEmail];

      if (!author) continue;

      await prisma.fileNote.upsert({
        where: { id: note.id },
        create: {
          id: note.id,
          matterId: m001.id,
          authorId: author.id,
          type: note.type,
          subject: note.subject,
          body: note.body,
          tags: note.tags,
          pinned: note.pinned ?? false,
          draft: note.draft ?? false,
          createdAt: parseFileNoteTime(note.time),
        },
        update: {
          subject: note.subject,
          body: note.body,
          tags: note.tags,
          pinned: note.pinned ?? false,
          draft: note.draft ?? false,
        },
      });
    }
  }

  for (const entry of INITIAL_AUDIT_LOG) {
    const userEmail = entry.user.includes("emma")
      ? "emma@aap.com.au"
      : entry.user.includes("michael")
        ? "michael@aap.com.au"
        : null;
    const user = userEmail ? staffUsers[userEmail] : null;
    const matter = matterRecords[entry.entity];

    await prisma.auditEntry.upsert({
      where: { id: entry.id },
      create: {
        id: entry.id,
        action: entry.action,
        detail: entry.detail,
        entity: entry.entity,
        createdAt: parseAuditTimestamp(entry.timestamp),
        userId: user?.id,
        matterId: matter?.id,
      },
      update: {
        action: entry.action,
        detail: entry.detail,
        entity: entry.entity,
        userId: user?.id,
        matterId: matter?.id,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
