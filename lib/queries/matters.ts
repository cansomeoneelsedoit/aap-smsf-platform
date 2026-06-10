import { prisma } from "@/lib/db";
import { mapMatterToSummary } from "@/lib/mappers";
import type { Stage } from "@/generated/prisma/client";

const matterSummaryInclude = {
  client: { include: { adviserGroup: true } },
  owner: { include: { staffProfile: true } },
} as const;

/** Client (trust) party with trustees and, for corporate trustees, their directors. */
const clientContactsInclude = {
  adviserGroup: true,
  trust: true,
  relationsOut: {
    include: {
      childParty: {
        include: {
          person: true,
          company: true,
          relationsOut: {
            include: { childParty: { include: { person: true } } },
          },
        },
      },
    },
  },
} as const;

export async function getMatters() {
  const matters = await prisma.matter.findMany({
    include: matterSummaryInclude,
    orderBy: { displayId: "asc" },
  });

  return matters.map(mapMatterToSummary);
}

export async function getMatterByDisplayId(displayId: string) {
  return prisma.matter.findUnique({
    where: { displayId },
    include: {
      client: { include: clientContactsInclude },
      owner: { include: { staffProfile: true } },
    },
  });
}

export async function getMattersByStage(stage: Stage) {
  const matters = await prisma.matter.findMany({
    where: { stage },
    include: matterSummaryInclude,
    orderBy: { displayId: "asc" },
  });

  return matters.map(mapMatterToSummary);
}

export async function getAdviserGroups() {
  return prisma.adviserGroup.findMany({
    include: { clients: { include: { matters: { select: { stage: true } } } } },
    orderBy: { name: "asc" },
  });
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

/**
 * Finds the matter a portal user can access by walking the party graph:
 * the user's person party is a trustee / authorised party of the client
 * trust, or a director of its corporate trustee.
 */
export async function getClientPortalMatter(userId: string) {
  return prisma.matter.findFirst({
    where: {
      client: {
        relationsOut: {
          some: {
            OR: [
              { childParty: { person: { userId } } },
              {
                childParty: {
                  relationsOut: { some: { childParty: { person: { userId } } } },
                },
              },
            ],
          },
        },
      },
    },
    include: {
      client: { include: clientContactsInclude },
      owner: { include: { staffProfile: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
