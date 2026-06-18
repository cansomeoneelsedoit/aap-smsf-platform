import { prisma } from "@/lib/db";
import { getUserGraphAccessToken } from "@/lib/microsoft-graph/auth-user";
import {
  listMatterDocuments,
  type SharePointDestinationConfig,
} from "@/lib/microsoft-graph/sharepoint";
import {
  isMicrosoftGraphAuthError,
  isMicrosoftGraphConfigError,
  isMicrosoftGraphError,
} from "@/lib/microsoft-graph/errors";

export interface MatterSharePointContext {
  matterId: string;
  matterDisplayId: string;
  config: SharePointDestinationConfig;
}

export async function getMatterSharePointContext(
  matterDisplayId: string
): Promise<MatterSharePointContext | null> {
  const matter = await prisma.matter.findUnique({
    where: { displayId: matterDisplayId },
    include: {
      client: {
        include: {
          organisation: {
            include: { microsoftIntegration: true },
          },
        },
      },
    },
  });

  if (!matter) {
    return null;
  }

  const integration = matter.client.organisation?.microsoftIntegration;
  const client = matter.client;

  if (
    !integration?.microsoftTenantId ||
    !client.sharepointDriveId ||
    !client.sharepointFolderId
  ) {
    return null;
  }

  return {
    matterId: matter.id,
    matterDisplayId: matter.displayId,
    config: {
      microsoftTenantId: integration.microsoftTenantId.trim(),
      sharepointDriveId: client.sharepointDriveId.trim(),
      sharepointFolderId: client.sharepointFolderId.trim(),
    },
  };
}

export async function getMatterDocumentsFromSharePoint(
  matterDisplayId: string,
  userId: string
) {
  try {
    const context = await getMatterSharePointContext(matterDisplayId);
    if (!context) {
      return [];
    }

    const accessToken = await getUserGraphAccessToken(userId);
    return listMatterDocuments(accessToken, context.config, context.matterDisplayId);
  } catch (error) {
    if (
      isMicrosoftGraphConfigError(error) ||
      isMicrosoftGraphError(error) ||
      isMicrosoftGraphAuthError(error)
    ) {
      console.error("Failed to load matter documents from SharePoint:", error);
      return [];
    }
    throw error;
  }
}
