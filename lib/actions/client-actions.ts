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

export interface SharePointDestinationInput {
  driveId: string;
  folderId: string;
  folderPath: string;
}

export interface CreateClientInput {
  name: string;
  organisationId: string;
  trusteeType: "individual" | "corporate";
  individualTrustees: PersonRef[];
  corporateTrustee?: {
    partyId?: string;
    newCompany?: NewCompanyInput;
    directors: PersonRef[];
  };
  sharepointDestination?: SharePointDestinationInput;
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
  if (!input.organisationId) return { error: "Organisation is required" };

  const organisation = await prisma.organisation.findUnique({
    where: { id: input.organisationId },
    include: { microsoftIntegration: true },
  });
  if (!organisation) return { error: "Organisation not found" };

  const orgHasSharePoint = Boolean(
    organisation.microsoftIntegration?.microsoftTenantId &&
      organisation.microsoftIntegration?.sharepointSiteId
  );
  if (orgHasSharePoint) {
    if (
      !input.sharepointDestination?.driveId?.trim() ||
      !input.sharepointDestination?.folderId?.trim()
    ) {
      return { error: "Select a SharePoint destination folder for this client" };
    }
  }

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
        organisationId: input.organisationId,
        sharepointDriveId: input.sharepointDestination?.driveId?.trim() || null,
        sharepointFolderId: input.sharepointDestination?.folderId?.trim() || null,
        sharepointFolderPath: input.sharepointDestination?.folderPath?.trim() || null,
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

  revalidatePath("/parties");
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
  matterDisplayId: string | null,
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

  revalidatePath("/parties");
  revalidatePath("/clients");
  revalidatePath(`/parties/${partyId}`);
  revalidatePath(`/clients/${partyId}`);
  if (matterDisplayId) revalidatePath(`/matters/${matterDisplayId}`);
  return { success: true };
}

export async function addTrusteeAction(
  clientPartyId: string,
  personRef?: PersonRef,
  companyRef?: { partyId?: string; newCompany?: NewCompanyInput }
) {
  await requireStaffSession();

  const client = await prisma.party.findUnique({
    where: { id: clientPartyId },
    include: { relationsOut: true },
  });
  if (!client || client.type !== "TRUST") return { error: "Client not found" };

  const trusteeCount = client.relationsOut.filter((r) => r.role === "TRUSTEE").length;
  if (trusteeCount >= 4) return { error: "A maximum of 4 trustees is allowed" };

  if (personRef) {
    const hasCorporate = await prisma.partyRelationship.count({
      where: {
        parentPartyId: clientPartyId,
        role: "TRUSTEE",
        childParty: { type: "COMPANY" },
      },
    });
    if (hasCorporate > 0) return { error: "Remove the corporate trustee before adding individuals" };

    const personPartyId = await prisma.$transaction((tx) => resolvePersonParty(tx, personRef));
    await prisma.partyRelationship.create({
      data: { parentPartyId: clientPartyId, childPartyId: personPartyId, role: "TRUSTEE" },
    });

    revalidatePartyPaths(clientPartyId);
    return { success: true, partyId: personPartyId };
  } else if (companyRef) {
    const hasIndividual = await prisma.partyRelationship.count({
      where: {
        parentPartyId: clientPartyId,
        role: "TRUSTEE",
        childParty: { type: "PERSON" },
      },
    });
    if (hasIndividual > 0) return { error: "Remove individual trustees before adding a corporate trustee" };

    let companyPartyId = companyRef.partyId;
    if (!companyPartyId) {
      if (!companyRef.newCompany?.name.trim()) return { error: "Company name is required" };
      const company = await prisma.party.create({
        data: {
          type: "COMPANY",
          name: companyRef.newCompany.name.trim(),
          company: { create: { acn: companyRef.newCompany.acn || null } },
        },
      });
      companyPartyId = company.id;
    }

    await prisma.partyRelationship.create({
      data: { parentPartyId: clientPartyId, childPartyId: companyPartyId, role: "TRUSTEE" },
    });

    revalidatePartyPaths(clientPartyId);
    return { success: true, partyId: companyPartyId };
  } else {
    return { error: "Invalid trustee reference" };
  }
}

export async function removeTrusteeAction(clientPartyId: string, childPartyId: string) {
  await requireStaffSession();

  const rel = await prisma.partyRelationship.findFirst({
    where: { parentPartyId: clientPartyId, childPartyId, role: "TRUSTEE" },
  });
  if (!rel) return { error: "Trustee not found" };

  await prisma.partyRelationship.delete({ where: { id: rel.id } });
  revalidatePartyPaths(clientPartyId);
  return { success: true };
}

export async function addDirectorAction(companyPartyId: string, personRef: PersonRef) {
  await requireStaffSession();

  const company = await prisma.party.findUnique({ where: { id: companyPartyId } });
  if (!company || company.type !== "COMPANY") return { error: "Company not found" };

  const personPartyId = await prisma.$transaction((tx) => resolvePersonParty(tx, personRef));
  await prisma.partyRelationship.upsert({
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

  const trustRel = await prisma.partyRelationship.findFirst({
    where: { childPartyId: companyPartyId, role: "TRUSTEE" },
  });
  if (trustRel) revalidatePartyPaths(trustRel.parentPartyId);
  return { success: true, partyId: personPartyId };
}

export async function removeDirectorAction(companyPartyId: string, personPartyId: string) {
  await requireStaffSession();

  const rel = await prisma.partyRelationship.findFirst({
    where: { parentPartyId: companyPartyId, childPartyId: personPartyId, role: "DIRECTOR" },
  });
  if (!rel) return { error: "Director not found" };

  await prisma.partyRelationship.delete({ where: { id: rel.id } });

  const trustRel = await prisma.partyRelationship.findFirst({
    where: { childPartyId: companyPartyId, role: "TRUSTEE" },
  });
  if (trustRel) revalidatePartyPaths(trustRel.parentPartyId);
  return { success: true };
}

function revalidatePartyPaths(partyId: string) {
  revalidatePath("/parties");
  revalidatePath("/clients");
  revalidatePath(`/parties/${partyId}`);
  revalidatePath(`/clients/${partyId}`);
}

export async function updateClientSharePointDestinationAction(
  clientPartyId: string,
  destination: SharePointDestinationInput
): Promise<{ success: true } | { error: string }> {
  const session = await requireStaffSession();

  const driveId = destination.driveId?.trim();
  const folderId = destination.folderId?.trim();
  const folderPath = destination.folderPath?.trim();

  if (!driveId || !folderId || !folderPath) {
    return { error: "Select a SharePoint destination folder" };
  }

  const client = await prisma.party.findUnique({
    where: { id: clientPartyId, type: "TRUST" },
    include: {
      organisation: { include: { microsoftIntegration: true } },
      matters: { select: { displayId: true } },
    },
  });

  if (!client) {
    return { error: "Client not found" };
  }

  if (!client.organisation?.microsoftIntegration?.microsoftTenantId) {
    return { error: "SharePoint is not configured for this client's organisation" };
  }

  if (!client.organisation.microsoftIntegration.sharepointSiteId?.trim()) {
    return {
      error:
        "SharePoint site ID is not configured for this organisation — set it in organisation settings",
    };
  }

  await prisma.party.update({
    where: { id: clientPartyId },
    data: {
      sharepointDriveId: driveId,
      sharepointFolderId: folderId,
      sharepointFolderPath: folderPath,
    },
  });

  await prisma.auditEntry.create({
    data: {
      id: crypto.randomUUID(),
      action: "CLIENT_SHAREPOINT_CONFIGURED",
      detail: folderPath,
      entity: client.name,
      userId: session.user.id,
    },
  });

  revalidatePartyPaths(clientPartyId);
  for (const matter of client.matters) {
    revalidatePath(`/matters/${matter.displayId}`);
  }

  return { success: true };
}
