"use server";

import { prisma } from "@/lib/db";
import {
  getMicrosoftGraphConnectionStatus,
  getUserGraphAccessToken,
  resetMicrosoftGraphConnection,
} from "@/lib/microsoft-graph/auth-user";
import {
  isMicrosoftGraphAuthError,
  isMicrosoftGraphConfigError,
  isMicrosoftGraphError,
} from "@/lib/microsoft-graph/errors";
import {
  getSharePointFolderDetails,
  getSharePointSite,
  listSharePointFolderChildren,
  listSharePointSiteDrives,
  type SharePointBrowseItem,
} from "@/lib/microsoft-graph/sharepoint";

async function requireStaffSession() {
  const { getAppSession } = await import("@/lib/auth");
  const session = await getAppSession();
  if (!session?.user || session.user.accountType !== "STAFF") {
    throw new Error("Unauthorised");
  }
  return session;
}

async function withUserGraphToken<T>(
  fn: (accessToken: string) => Promise<T>
): Promise<{ data: T } | { error: string }> {
  try {
    const session = await requireStaffSession();
    const accessToken = await getUserGraphAccessToken(session.user.id);
    const data = await fn(accessToken);
    return { data };
  } catch (error) {
    if (isMicrosoftGraphAuthError(error)) {
      return { error: error.message };
    }
    if (isMicrosoftGraphConfigError(error) || isMicrosoftGraphError(error)) {
      return { error: error.message };
    }
    throw error;
  }
}

async function getOrganisationSharePointSiteId(
  organisationId: string
): Promise<{ siteId: string } | { error: string }> {
  const integration = await prisma.organisationMicrosoftIntegration.findUnique({
    where: { organisationId },
    select: { sharepointSiteId: true, microsoftTenantId: true },
  });

  if (!integration?.microsoftTenantId) {
    return { error: "SharePoint is not configured for this organisation" };
  }

  const siteId = integration.sharepointSiteId?.trim();
  if (!siteId) {
    return {
      error:
        "SharePoint site ID is not configured for this organisation — set it in organisation settings",
    };
  }

  return { siteId };
}

export async function checkMicrosoftGraphAccessAction(): Promise<{
  linked: boolean;
  hasGraphAccess: boolean;
  scopesOk: boolean;
  scopes: string | null;
}> {
  const session = await requireStaffSession();
  const status = await getMicrosoftGraphConnectionStatus(session.user.id);
  return {
    linked: status.linked,
    hasGraphAccess: status.linked,
    scopesOk: status.scopesOk,
    scopes: status.scopes,
  };
}

export async function resetMicrosoftGraphConnectionAction(): Promise<{ success: true }> {
  const session = await requireStaffSession();
  await resetMicrosoftGraphConnection(session.user.id);
  return { success: true };
}

export async function listSharePointDrivesAction(
  organisationId: string
): Promise<
  { data: { siteName: string; drives: SharePointBrowseItem[] } } | { error: string }
> {
  const siteResult = await getOrganisationSharePointSiteId(organisationId);
  if ("error" in siteResult) {
    return siteResult;
  }

  return withUserGraphToken(async (accessToken) => {
    const [site, drives] = await Promise.all([
      getSharePointSite(accessToken, siteResult.siteId),
      listSharePointSiteDrives(accessToken, siteResult.siteId),
    ]);

    return { siteName: site.name, drives };
  });
}

export async function listSharePointFolderChildrenAction(
  driveId: string,
  folderId: "root" | string
): Promise<{ data: SharePointBrowseItem[] } | { error: string }> {
  return withUserGraphToken((accessToken) =>
    listSharePointFolderChildren(accessToken, driveId, folderId)
  );
}

export async function validateSharePointFolderAction(
  driveId: string,
  folderId: string
): Promise<
  | { data: { driveId: string; folderId: string; folderName: string; folderPath: string } }
  | { error: string }
> {
  const result = await withUserGraphToken((accessToken) =>
    getSharePointFolderDetails(accessToken, driveId, folderId)
  );

  if ("error" in result) {
    return result;
  }

  return {
    data: {
      driveId,
      folderId,
      folderName: result.data.name,
      folderPath: result.data.webUrl,
    },
  };
}
