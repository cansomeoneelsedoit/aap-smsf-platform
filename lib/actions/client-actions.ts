"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { searchParties } from "@/lib/queries/parties";
import type { PartySearchResult } from "@/lib/types";
import type { PartyType, Prisma } from "@/generated/prisma/client";

async function requireStaffSession() {
  const { getAppSession } = await import("@/lib/auth");
  const session = await getAppSession();
  if (!session?.user || session.user.accountType !== "STAFF") {
    throw new Error("Unauthorised");
  }
  return session;
}

export interface NewPersonInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface NewCompanyInput {
  name: string;
  acn: string;
}

/** Either an existing party id or details for a person to create. */
export interface PersonRef {
  partyId?: string;
  newPerson?: NewPersonInput;
}

export interface CreateClientInput {
  name: string;
  adviserGroupId: string;
  trusteeType: "individual" | "corporate";
  individualTrustees: PersonRef[];
  corporateTrustee?: {
    partyId?: string;
    newCompany?: NewCompanyInput;
    directors: PersonRef[];
  };
}

async function resolvePersonParty(
  tx: Prisma.TransactionClient,
  ref: PersonRef
): Promise<string> {
  if (ref.partyId) return ref.partyId;
  if (!ref.newPerson) throw new Error("Invalid person reference");

  const { firstName, lastName, email, phone } = ref.newPerson;
  const party = await tx.party.create({
    data: {
      type: "PERSON",
      name: `${firstName} ${lastName}`.trim(),
      person: {
        create: {
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
        },
      },
    },
  });
  return party.id;
}

export async function createClientAction(input: CreateClientInput) {
  const session = await requireStaffSession();

  if (!input.name.trim()) return { error: "Client name is required" };
  if (!input.adviserGroupId) return { error: "Adviser group is required" };

  if (input.trusteeType === "individual") {
    if (input.individualTrustees.length === 0) {
      return { error: "At least one individual trustee is required" };
    }
    if (input.individualTrustees.length > 4) {
      return { error: "A maximum of 4 individual trustees is allowed" };
    }
  } else if (!input.corporateTrustee?.partyId && !input.corporateTrustee?.newCompany) {
    return { error: "A corporate trustee is required" };
  }

  const clientPartyId = await prisma.$transaction(async (tx) => {
    const trust = await tx.party.create({
      data: {
        type: "TRUST",
        name: input.name.trim(),
        adviserGroupId: input.adviserGroupId,
        trust: { create: {} },
      },
    });

    if (input.trusteeType === "individual") {
      for (const ref of input.individualTrustees) {
        const personPartyId = await resolvePersonParty(tx, ref);
        await tx.partyRelationship.create({
          data: { parentPartyId: trust.id, childPartyId: personPartyId, role: "TRUSTEE" },
        });
      }
    } else if (input.corporateTrustee) {
      let companyPartyId = input.corporateTrustee.partyId;

      if (!companyPartyId) {
        const company = await tx.party.create({
          data: {
            type: "COMPANY",
            name: input.corporateTrustee.newCompany!.name.trim(),
            company: { create: { acn: input.corporateTrustee.newCompany!.acn || null } },
          },
        });
        companyPartyId = company.id;
      }

      await tx.partyRelationship.create({
        data: { parentPartyId: trust.id, childPartyId: companyPartyId, role: "TRUSTEE" },
      });

      for (const ref of input.corporateTrustee.directors) {
        const personPartyId = await resolvePersonParty(tx, ref);
        await tx.partyRelationship.upsert({
          where: {
            parentPartyId_childPartyId_role: {
              parentPartyId: companyPartyId,
              childPartyId: personPartyId,
              role: "DIRECTOR",
            },
          },
          create: { parentPartyId: companyPartyId, childPartyId: personPartyId, role: "DIRECTOR" },
          update: {},
        });
      }
    }

    return trust.id;
  });

  await prisma.auditEntry.create({
    data: {
      id: crypto.randomUUID(),
      action: "CLIENT_CREATED",
      detail: `${input.name} · ${input.trusteeType === "individual" ? "Individual trustees" : "Corporate trustee"}`,
      entity: input.name,
      userId: session.user.id,
    },
  });

  revalidatePath("/clients");
  return { success: true, clientPartyId };
}

export async function searchPartiesAction(
  type: PartyType,
  query: string
): Promise<PartySearchResult[]> {
  await requireStaffSession();
  if (!query.trim()) return [];

  const parties = await searchParties(type, query.trim());

  return parties.map((p) => ({
    partyId: p.id,
    type: p.type,
    name: p.name,
    detail:
      p.type === "PERSON"
        ? (p.person?.email ?? p.person?.phone ?? null)
        : p.type === "COMPANY"
          ? p.company?.acn
            ? `ACN ${p.company.acn}`
            : null
          : p.trust?.abn
            ? `ABN ${p.trust.abn}`
            : null,
  }));
}

export interface UpdatePartyInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  name?: string;
  acn?: string;
  abn?: string;
}

export async function updatePartyAction(
  partyId: string,
  matterDisplayId: string,
  input: UpdatePartyInput
) {
  const session = await requireStaffSession();

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: { person: true, company: true, trust: true },
  });
  if (!party) return { error: "Party not found" };

  if (party.type === "PERSON") {
    const firstName = input.firstName?.trim() ?? party.person?.firstName ?? "";
    const lastName = input.lastName?.trim() ?? party.person?.lastName ?? "";
    if (!firstName || !lastName) return { error: "First and last name are required" };

    await prisma.party.update({
      where: { id: partyId },
      data: {
        name: `${firstName} ${lastName}`,
        person: {
          update: {
            firstName,
            lastName,
            email: input.email?.trim() || null,
            phone: input.phone?.trim() || null,
          },
        },
      },
    });
  } else {
    const name = input.name?.trim() ?? party.name;
    if (!name) return { error: "Name is required" };

    await prisma.party.update({
      where: { id: partyId },
      data: {
        name,
        ...(party.type === "COMPANY"
          ? { company: { update: { acn: input.acn?.trim() || null } } }
          : { trust: { update: { abn: input.abn?.trim() || null } } }),
      },
    });
  }

  await prisma.auditEntry.create({
    data: {
      id: crypto.randomUUID(),
      action: "PARTY_UPDATED",
      detail: `${party.name} · details updated`,
      entity: matterDisplayId || party.name,
      userId: session.user.id,
    },
  });

  revalidatePath("/clients");
  if (matterDisplayId) revalidatePath(`/matter/${matterDisplayId}`);
  return { success: true };
}
