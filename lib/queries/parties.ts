import { prisma } from "@/lib/db";
import type { PartyType } from "@/generated/prisma/client";

export async function searchParties(type: PartyType, query: string) {
  return prisma.party.findMany({
    where: { type, name: { contains: query, mode: "insensitive" } },
    include: { person: true, company: true, trust: true },
    orderBy: { name: "asc" },
    take: 8,
  });
}

export async function getPartyById(partyId: string) {
  return prisma.party.findUnique({
    where: { id: partyId },
    include: { person: true, company: true, trust: true },
  });
}

/** All client (trust) parties, for pickers such as the new-matter dialog. */
export async function getClientParties() {
  return prisma.party.findMany({
    where: { type: "TRUST" },
    include: { adviserGroup: true, trust: true },
    orderBy: { name: "asc" },
  });
}
