import { prisma } from "@/lib/db";
import {
  listMatterDocuments,
  type SharePointIntegrationConfig,
} from "@/lib/microsoft-graph/sharepoint";
import {
  isMicrosoftGraphConfigError,
  isMicrosoftGraphError,
} from "@/lib/microsoft-graph/errors";

export interface MatterSharePointContext {
  matterId: string;
  matterDisplayId: string;
  config: SharePointIntegrationConfig;
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
  if (
    !integration?.microsoftTenantId ||
    !integration.sharepointSiteId ||
    !integration.sharepointDriveId
  ) {
    return null;
  }

  return {
    matterId: matter.id,
    matterDisplayId: matter.displayId,
    config: {
      microsoftTenantId: integration.microsoftTenantId.trim(),
      sharepointSiteId: integration.sharepointSiteId.trim(),
      sharepointDriveId: integration.sharepointDriveId.trim(),
    },
  };
}

export async function getMatterDocumentsFromSharePoint(matterDisplayId: string) {
  try {
    const context = await getMatterSharePointContext(matterDisplayId);
    if (!context) {
      return [];
    }

    return listMatterDocuments(context.config, context.matterDisplayId);
  } catch (error) {
    if (isMicrosoftGraphConfigError(error) || isMicrosoftGraphError(error)) {
      console.error("Failed to load matter documents from SharePoint:", error);
      return [];
    }
    throw error;
  }
}
