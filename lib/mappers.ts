import type { Stage as UiStage, Client, Company, AuditEntry, Task, FileNote } from "@/lib/types";
import type { Company as DbCompany, Matter, User, StaffProfile, Task as DbTask, FileNote as DbFileNote, AuditEntry as DbAuditEntry, Stage } from "@/generated/prisma/client";

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

type MatterWithRelations = Matter & {
  company: DbCompany;
  owner: (User & { staffProfile: StaffProfile | null }) | null;
};

export function mapMatterToClient(matter: MatterWithRelations): Client {
  return {
    id: matter.displayId,
    name: matter.name,
    sub: matter.subtitle ?? matter.displayId,
    company: matter.company.name,
    cbClass: matter.company.cbClass,
    type: matter.matterType,
    stage: matter.stage as UiStage,
    pillClass: STAGE_PILL_MAP[matter.stage],
    owner: matter.owner ? shortOwnerName(matter.owner.name) : "Unassigned",
    due: matter.dueDate
      ? matter.dueDate.toLocaleDateString("en-AU", { day: "numeric", month: "short" })
      : "—",
  };
}

export function mapCompanyToUi(
  company: DbCompany & { matters: { stage: Stage }[] }
): Company {
  const clients = company.matters.length;
  const active = company.matters.filter((m) => m.stage === "Active").length;

  return {
    id: company.id,
    name: company.name,
    description: company.description,
    clients,
    active,
    contact: `${company.contactName} · ${company.contactEmail}`,
    letter: company.letter,
    bgColor: company.bgColor,
    textColor: company.textColor,
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
