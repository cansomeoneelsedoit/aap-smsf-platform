import { prisma } from "@/lib/db";
import { mapClientPartyToSummary, mapClientPartyWithMatters } from "@/lib/mappers";
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
    include: { organisation: true, trust: true },
    orderBy: { name: "asc" },
  });
}

const clientListInclude = {
  organisation: true,
  trust: true,
  matters: { select: { id: true } },
} as const;

/** Top-level client parties for the clients list page. */
export async function getClientPartySummaries() {
  const parties = await prisma.party.findMany({
    where: { type: "TRUST" },
    include: clientListInclude,
    orderBy: { name: "asc" },
  });

  return parties.map(mapClientPartyToSummary);
}

const clientDetailInclude = {
  organisation: {
    include: { microsoftIntegration: true },
  },
  trust: true,
  matters: {
    include: { owner: { include: { staffProfile: true } } },
    orderBy: { displayId: "desc" as const },
  },
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

/** Full client party with matters and trustee graph for the detail page. */
export async function getClientPartyDetail(partyId: string) {
  const party = await prisma.party.findUnique({
    where: { id: partyId, type: "TRUST" },
    include: clientDetailInclude,
  });

  if (!party) return null;
  return mapClientPartyWithMatters(party);
}
