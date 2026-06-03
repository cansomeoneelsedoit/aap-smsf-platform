"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { STAGES, STAGE_OWNER_MAP } from "@/lib/mock-data";
import type { Stage } from "@/generated/prisma/client";

async function requireStaffSession() {
  const { getAppSession } = await import("@/lib/auth");
  const session = await getAppSession();
  if (!session?.user || session.user.accountType !== "STAFF") {
    throw new Error("Unauthorised");
  }
  return session;
}

async function addAuditEntry(
  matterDisplayId: string | null,
  action: string,
  detail: string,
  entity: string,
  userId?: string
) {
  const matter = matterDisplayId
    ? await prisma.matter.findUnique({ where: { displayId: matterDisplayId } })
    : null;

  await prisma.auditEntry.create({
    data: {
      id: crypto.randomUUID(),
      action,
      detail,
      entity,
      userId,
      matterId: matter?.id,
    },
  });
}

export async function advanceStageAction(matterDisplayId: string) {
  const session = await requireStaffSession();
  const matter = await prisma.matter.findUnique({ where: { displayId: matterDisplayId } });
  if (!matter) throw new Error("Matter not found");

  const idx = STAGES.indexOf(matter.stage as (typeof STAGES)[number]);
  if (idx >= STAGES.length - 1) return { error: "Already in Active stage" };

  const nextStage = STAGES[idx + 1] as Stage;
  const ownerName = STAGE_OWNER_MAP[nextStage];
  const owner = await prisma.user.findFirst({
    where: { name: ownerName, accountType: "STAFF" },
  });

  await prisma.matter.update({
    where: { id: matter.id },
    data: { stage: nextStage, ownerId: owner?.id },
  });

  await addAuditEntry(
    matterDisplayId,
    "STAGE_ADVANCE",
    `${matter.stage} · Handoff to ${ownerName}`,
    matterDisplayId,
    session.user.id
  );

  revalidatePath("/clients");
  revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true, stage: nextStage };
}

export async function createMatterAction(name: string, companyName: string, type: string) {
  const session = await requireStaffSession();
  const count = await prisma.matter.count();
  const displayId = `M${String(count + 1).padStart(3, "0")}`;

  const company = await prisma.company.findFirst({
    where: { name: companyName },
  });
  if (!company) throw new Error("Company not found");

  const startOwner = await prisma.user.findFirst({
    where: { name: STAGE_OWNER_MAP.Start, accountType: "STAFF" },
  });

  await prisma.matter.create({
    data: {
      displayId,
      name,
      subtitle: `${displayId} · ${type}`,
      matterType: type.split(" ").slice(0, 2).join(" "),
      stage: "Start",
      companyId: company.id,
      ownerId: startOwner?.id,
    },
  });

  await addAuditEntry(displayId, "MATTER_CREATED", `${name} · ${companyName}`, displayId, session.user.id);
  revalidatePath("/clients");
  return { success: true, displayId };
}

export async function addCompanyAction(name: string) {
  await requireStaffSession();
  const colors = [
    { bg: "#dbeafe", text: "#1d4ed8" },
    { bg: "#dcfce7", text: "#15803d" },
    { bg: "#fdf4ff", text: "#7e22ce" },
    { bg: "#fff7ed", text: "#c2410c" },
  ];
  const pick = colors[Math.floor(Math.random() * colors.length)];
  const id = `co-${Date.now()}`;

  await prisma.company.create({
    data: {
      id,
      name,
      description: "New company · 0 clients",
      contactName: "No contact",
      contactEmail: "contact@example.com",
      letter: name[0].toUpperCase(),
      bgColor: pick.bg,
      textColor: pick.text,
      cbClass: "cb-other",
    },
  });

  revalidatePath("/companies");
  return { success: true };
}

export async function toggleTaskAction(taskId: string) {
  await requireStaffSession();
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  await prisma.task.update({
    where: { id: taskId },
    data: {
      done: !task.done,
      completedAt: !task.done ? new Date() : null,
    },
  });

  const matter = await prisma.matter.findUnique({ where: { id: task.matterId } });
  if (matter) revalidatePath(`/clients/${matter.displayId}`);
  return { success: true, done: !task.done };
}

export async function addTaskAction(matterDisplayId: string, title: string, assigneeName: string, due: string) {
  const session = await requireStaffSession();
  const matter = await prisma.matter.findUnique({ where: { displayId: matterDisplayId } });
  if (!matter) throw new Error("Matter not found");

  const assignee = await prisma.user.findFirst({
    where: { name: assigneeName, accountType: "STAFF" },
  });

  await prisma.task.create({
    data: {
      matterId: matter.id,
      title,
      assigneeId: assignee?.id,
      dueDate: due ? new Date(due) : null,
    },
  });

  await addAuditEntry(matterDisplayId, "TASK_ADDED", title, matterDisplayId, session.user.id);
  revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true };
}

export async function saveFileNoteAction(
  matterDisplayId: string,
  subject: string,
  body: string,
  type: string,
  tagsStr: string
) {
  const session = await requireStaffSession();
  const matter = await prisma.matter.findUnique({ where: { displayId: matterDisplayId } });
  if (!matter) throw new Error("Matter not found");

  const tags = tagsStr
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  await prisma.fileNote.create({
    data: {
      matterId: matter.id,
      authorId: session.user.id,
      type,
      subject,
      body,
      tags,
    },
  });

  await addAuditEntry(matterDisplayId, "FILE_NOTE_ADDED", `${type} · ${subject}`, matterDisplayId, session.user.id);
  revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true };
}

export async function approveFileNoteAction(noteId: string, matterDisplayId: string) {
  const session = await requireStaffSession();
  await prisma.fileNote.update({
    where: { id: noteId },
    data: { draft: false },
  });
  await addAuditEntry(matterDisplayId, "FILE_NOTE_APPROVED", "Call note published", matterDisplayId, session.user.id);
  revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true };
}

export async function addAuditEntryAction(matterDisplayId: string, action: string, detail: string) {
  const session = await requireStaffSession();
  await addAuditEntry(matterDisplayId, action, detail, matterDisplayId, session.user.id);
  revalidatePath("/audit-log");
  if (matterDisplayId) revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true };
}

export async function mockLodgeAction(matterDisplayId: string) {
  const session = await requireStaffSession();
  const ref = Math.floor(Math.random() * 90000 + 10000);
  await addAuditEntry(
    matterDisplayId,
    "LODGEMENT_SUBMITTED",
    `Mock · ref LOD-${ref}`,
    matterDisplayId,
    session.user.id
  );
  revalidatePath("/audit-log");
  revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true };
}

export async function approveMatterAction(matterDisplayId: string) {
  const session = await requireStaffSession();
  await addAuditEntry(matterDisplayId, "APPROVED", "Approved by admin", matterDisplayId, session.user.id);
  revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true };
}

export async function reassignMatterAction(matterDisplayId: string, stage: string, staffName: string) {
  const session = await requireStaffSession();
  const matter = await prisma.matter.findUnique({ where: { displayId: matterDisplayId } });
  if (!matter) throw new Error("Matter not found");

  const staff = await prisma.user.findFirst({
    where: { name: staffName, accountType: "STAFF" },
  });

  await prisma.matter.update({
    where: { id: matter.id },
    data: {
      stage: stage as Stage,
      ownerId: staff?.id,
    },
  });

  await addAuditEntry(matterDisplayId, "REASSIGNED", `${stage} → ${staffName}`, matterDisplayId, session.user.id);
  revalidatePath("/clients");
  revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true };
}

export async function approveKycAction(matterDisplayId: string) {
  const session = await requireStaffSession();
  await addAuditEntry(matterDisplayId, "KYC_APPROVED", "Manual approval", matterDisplayId, session.user.id);
  revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true };
}

export async function approveCallNoteAction(matterDisplayId: string) {
  const session = await requireStaffSession();
  await addAuditEntry(matterDisplayId, "CALL_NOTE_APPROVED", "Echo Notes approved", matterDisplayId, session.user.id);
  revalidatePath(`/clients/${matterDisplayId}`);
  return { success: true };
}

export async function saveStageAssignmentAction(stage: Stage, staffId: string) {
  await requireStaffSession();
  await prisma.stageAssignment.upsert({
    where: { stage },
    create: { stage, staffId },
    update: { staffId },
  });
  revalidatePath("/users");
  return { success: true };
}
