import { prisma } from "@/lib/db";
import { mapMatterToClient } from "@/lib/mappers";
import type { Stage } from "@/generated/prisma/client";

export async function getMatters() {
  const matters = await prisma.matter.findMany({
    include: {
      company: true,
      owner: { include: { staffProfile: true } },
    },
    orderBy: { displayId: "asc" },
  });

  return matters.map(mapMatterToClient);
}

export async function getMatterByDisplayId(displayId: string) {
  return prisma.matter.findUnique({
    where: { displayId },
    include: {
      company: true,
      owner: { include: { staffProfile: true } },
    },
  });
}

export async function getMattersByStage(stage: Stage) {
  const matters = await prisma.matter.findMany({
    where: { stage },
    include: {
      company: true,
      owner: { include: { staffProfile: true } },
    },
    orderBy: { displayId: "asc" },
  });

  return matters.map(mapMatterToClient);
}

export async function getCompanies() {
  const companies = await prisma.company.findMany({
    include: { matters: { select: { stage: true } } },
    orderBy: { name: "asc" },
  });

  return companies;
}

export async function getAuditLog() {
  return prisma.auditEntry.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStaffProfiles() {
  return prisma.staffProfile.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });
}

export async function getStageAssignments() {
  return prisma.stageAssignment.findMany({
    include: { staff: true },
  });
}

export async function getMatterTasks(matterId: string) {
  return prisma.task.findMany({
    where: { matterId },
    include: { assignee: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getMatterFileNotes(matterId: string) {
  return prisma.fileNote.findMany({
    where: { matterId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientPortalMatter(userId: string) {
  const membership = await prisma.matterMember.findFirst({
    where: { userId },
    include: {
      matter: {
        include: {
          company: true,
          owner: { include: { staffProfile: true } },
          members: { include: { user: true } },
        },
      },
    },
    orderBy: { isPrimary: "desc" },
  });

  return membership?.matter ?? null;
}
