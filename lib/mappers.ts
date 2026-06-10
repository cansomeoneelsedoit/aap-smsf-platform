import type {
  Stage as UiStage,
  MatterSummary,
  AdviserGroup as UiAdviserGroup,
  AuditEntry,
  Task,
  FileNote,
  MatterContacts,
  ContactPerson,
} from "@/lib/types";
import type {
  AdviserGroup as DbAdviserGroup,
  Matter,
  Party,
  PersonDetails,
  CompanyDetails,
  TrustDetails,
  PartyRelationship,
  User,
  StaffProfile,
  Task as DbTask,
  FileNote as DbFileNote,
  AuditEntry as DbAuditEntry,
  Stage,
} from "@/generated/prisma/client";

const STAGE_PILL_MAP: Record<Stage, string> = {
  Start: "pill-start",
  Prepare: "pill-prepare",
  Check: "pill-check",
  Lodge: "pill-lodge",
  Active: "pill-active",
};

function shortOwnerName(name: string): string {
  const parts = name.split(" ");
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts[1]}`;
}

export type PersonParty = Party & { person: PersonDetails | null };

export type TrusteeParty = Party & {
  person: PersonDetails | null;
  company: CompanyDetails | null;
  relationsOut: (PartyRelationship & { childParty: PersonParty })[];
};

export type ClientParty = Party & {
  adviserGroup: DbAdviserGroup | null;
  trust: TrustDetails | null;
  relationsOut: (PartyRelationship & { childParty: TrusteeParty })[];
};

export type MatterWithRelations = Matter & {
  client: Party & { adviserGroup: DbAdviserGroup | null };
  owner: (User & { staffProfile: StaffProfile | null }) | null;
};

export function mapMatterToSummary(matter: MatterWithRelations): MatterSummary {
  return {
    id: matter.displayId,
    name: matter.client.name,
    sub: `${matter.displayId} · ${matter.name}`,
    adviserGroup: matter.client.adviserGroup?.name ?? "—",
    cbClass: matter.client.adviserGroup?.cbClass ?? "cb-other",
    type: matter.matterType,
    stage: matter.stage as UiStage,
    pillClass: STAGE_PILL_MAP[matter.stage],
    owner: matter.owner ? shortOwnerName(matter.owner.name) : "Unassigned",
    due: matter.dueDate
      ? matter.dueDate.toLocaleDateString("en-AU", { day: "numeric", month: "short" })
      : "—",
  };
}

function mapPersonContact(
  party: PersonParty,
  role: ContactPerson["role"]
): ContactPerson {
  return {
    partyId: party.id,
    name: party.name,
    role,
    email: party.person?.email ?? null,
    phone: party.person?.phone ?? null,
  };
}

export function mapMatterContacts(client: ClientParty): MatterContacts {
  const contacts: MatterContacts = {
    trust: {
      partyId: client.id,
      name: client.name,
      abn: client.trust?.abn ?? null,
    },
    individualTrustees: [],
    corporateTrustees: [],
    authorisedParties: [],
  };

  for (const rel of client.relationsOut) {
    const party = rel.childParty;

    if (rel.role === "TRUSTEE" && party.type === "PERSON") {
      contacts.individualTrustees.push(mapPersonContact(party, "Trustee"));
    } else if (rel.role === "TRUSTEE" && party.type === "COMPANY") {
      contacts.corporateTrustees.push({
        partyId: party.id,
        name: party.name,
        acn: party.company?.acn ?? null,
        directors: party.relationsOut
          .filter((r) => r.role === "DIRECTOR" && r.childParty.type === "PERSON")
          .map((r) => mapPersonContact(r.childParty, "Director")),
      });
    } else if (rel.role === "AUTHORISED_PARTY" && party.type === "PERSON") {
      contacts.authorisedParties.push(mapPersonContact(party, "Authorised party"));
    }
  }

  return contacts;
}

export interface EditableParty {
  id: string;
  type: "PERSON" | "COMPANY" | "TRUST";
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  acn: string | null;
  abn: string | null;
}

export function mapPartyToEditable(
  party: Party & {
    person: PersonDetails | null;
    company: CompanyDetails | null;
    trust: TrustDetails | null;
  }
): EditableParty {
  return {
    id: party.id,
    type: party.type,
    name: party.name,
    firstName: party.person?.firstName ?? null,
    lastName: party.person?.lastName ?? null,
    email: party.person?.email ?? null,
    phone: party.person?.phone ?? null,
    acn: party.company?.acn ?? null,
    abn: party.trust?.abn ?? null,
  };
}

export function mapAdviserGroupToUi(
  group: DbAdviserGroup & { clients: { matters: { stage: Stage }[] }[] }
): UiAdviserGroup {
  const matters = group.clients.flatMap((c) => c.matters);
  const active = matters.filter((m) => m.stage === "Active").length;

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    clients: group.clients.length,
    active,
    contact: `${group.contactName} · ${group.contactEmail}`,
    letter: group.letter,
    bgColor: group.bgColor,
    textColor: group.textColor,
  };
}

export function mapAuditEntryToUi(entry: DbAuditEntry & { user: User | null }): AuditEntry {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = entry.createdAt;
  const timestamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return {
    id: entry.id,
    timestamp,
    user: entry.user?.email.split("@")[0] ?? "system",
    action: entry.action,
    detail: entry.detail,
    entity: entry.entity,
  };
}

export function mapTaskToUi(task: DbTask & { assignee: User | null }): Task {
  const duePart = task.dueDate
    ? `Due ${task.dueDate.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`
    : "Due —";
  const assigneePart = task.assignee?.name ?? "Unassigned";
  const statusPart = task.done ? "Completed" : "Pending";

  return {
    id: task.id,
    title: task.title,
    done: task.done,
    meta: `${duePart} · ${assigneePart} · ${statusPart}`,
  };
}

export function mapFileNoteToUi(note: DbFileNote & { author: User }): FileNote {
  const time = note.createdAt.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: note.id,
    type: note.type,
    subject: note.subject,
    body: note.body,
    author: note.author.name,
    time,
    tags: note.tags,
    pinned: note.pinned,
    draft: note.draft,
  };
}

export function mapStaffRoleToLabel(role: string): string {
  const labels: Record<string, string> = {
    MASTER_OWNER: "Master Owner",
    BOOKKEEPER: "Bookkeeper",
    COMPLIANCE_OFFICER: "Compliance Officer",
    TAX_AGENT: "Tax Agent (Registered)",
  };
  return labels[role] ?? role;
}

export const STAFF_COLOR_CLASSES: Record<string, string> = {
  MASTER_OWNER: "bg-brand-orange-light text-brand-orange",
  BOOKKEEPER: "bg-brand-purple-light text-brand-purple",
  COMPLIANCE_OFFICER: "bg-brand-green-light text-brand-green",
  TAX_AGENT: "bg-brand-red-light text-brand-red",
};
