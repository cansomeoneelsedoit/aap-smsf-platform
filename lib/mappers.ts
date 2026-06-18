import type {
  Stage as UiStage,
  MatterSummary,
  Organisation as UiOrganisation,
  AuditEntry,
  Task,
  FileNote,
  MatterDocument,
  MatterContacts,
  ContactPerson,
  ClientSummary,
  ClientMatterSummary,
} from "@/lib/types";
import type { MatterDocumentItem } from "@/lib/microsoft-graph/sharepoint";
import type {
  Organisation as DbOrganisation,
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
  organisation: DbOrganisation | null;
  trust: TrustDetails | null;
  relationsOut: (PartyRelationship & { childParty: TrusteeParty })[];
};

export type MatterWithRelations = Matter & {
  client: Party & { organisation: DbOrganisation | null };
  owner: (User & { staffProfile: StaffProfile | null }) | null;
};

export function mapMatterToSummary(matter: MatterWithRelations): MatterSummary {
  return {
    id: matter.displayId,
    name: matter.client.name,
    sub: `${matter.displayId} · ${matter.name}`,
    organisation: matter.client.organisation?.name ?? "—",
    cbClass: matter.client.organisation?.cbClass ?? "cb-other",
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

export type ClientPartyListItem = Party & {
  organisation: DbOrganisation | null;
  trust: TrustDetails | null;
  matters: { id: string }[];
};

export type ClientPartyDetail = ClientParty & {
  matters: (Matter & { owner: (User & { staffProfile: StaffProfile | null }) | null })[];
};

export interface ClientPartyDetailUi {
  id: string;
  name: string;
  abn: string | null;
  organisation: string;
  organisationId: string | null;
  cbClass: string;
  contacts: MatterContacts;
  currentMatters: ClientMatterSummary[];
  previousMatters: ClientMatterSummary[];
}

export function mapClientPartyToSummary(party: ClientPartyListItem): ClientSummary {
  return {
    id: party.id,
    name: party.name,
    abn: party.trust?.abn ?? null,
    organisation: party.organisation?.name ?? "—",
    cbClass: party.organisation?.cbClass ?? "cb-other",
    matterCount: party.matters.length,
  };
}

function mapClientMatterSummary(matter: Matter): ClientMatterSummary {
  return {
    id: matter.displayId,
    name: matter.name,
    type: matter.matterType,
    stage: matter.stage as UiStage,
    pillClass: STAGE_PILL_MAP[matter.stage],
  };
}

export function mapClientPartyWithMatters(party: ClientPartyDetail): ClientPartyDetailUi {
  const matters = party.matters.map(mapClientMatterSummary);
  return {
    id: party.id,
    name: party.name,
    abn: party.trust?.abn ?? null,
    organisation: party.organisation?.name ?? "—",
    organisationId: party.organisationId,
    cbClass: party.organisation?.cbClass ?? "cb-other",
    contacts: mapMatterContacts(party),
    currentMatters: matters.filter((m) => m.stage !== "Active"),
    previousMatters: matters.filter((m) => m.stage === "Active"),
  };
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

export function mapOrganisationToUi(
  group: DbOrganisation & { clients: { matters: { stage: Stage }[] }[] }
): UiOrganisation {
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mapMatterDocumentToUi(document: MatterDocumentItem): MatterDocument {
  return {
    id: document.id,
    name: document.name,
    financialYear: document.financialYear,
    sizeLabel: formatFileSize(document.size),
    modifiedAt: new Date(document.modifiedAt).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    webUrl: document.webUrl,
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
