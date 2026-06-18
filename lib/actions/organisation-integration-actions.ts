"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

async function requireMasterOwnerSession() {
  const { getAppSession } = await import("@/lib/auth");
  const session = await getAppSession();
  if (!session?.user || session.user.accountType !== "STAFF") {
    throw new Error("Unauthorised");
  }
  if (session.user.staffRole !== "MASTER_OWNER") {
    throw new Error("Unauthorised");
  }
  return session;
}

export interface OrganisationIntegrationInput {
  organisationId: string;
  microsoftTenantId?: string;
  sharepointSiteId?: string;
  sharepointDriveId?: string;
}

export async function saveOrganisationMicrosoftIntegrationAction(
  input: OrganisationIntegrationInput
) {
  await requireMasterOwnerSession();

  const microsoftTenantId = input.microsoftTenantId?.trim() || null;
  const sharepointSiteId = input.sharepointSiteId?.trim() || null;
  const sharepointDriveId = input.sharepointDriveId?.trim() || null;

  await prisma.organisationMicrosoftIntegration.upsert({
    where: { organisationId: input.organisationId },
    create: {
      organisationId: input.organisationId,
      microsoftTenantId,
      sharepointSiteId,
      sharepointDriveId,
    },
    update: {
      microsoftTenantId,
      sharepointSiteId,
      sharepointDriveId,
    },
  });

  revalidatePath("/admin/organisations");
  revalidatePath(`/admin/organisations/${input.organisationId}`);
  return { success: true };
}
