import { encodeDrivePath, graphFetch } from "./client";
import { MicrosoftGraphError } from "./errors";

export interface SharePointIntegrationConfig {
  microsoftTenantId: string;
  sharepointSiteId: string;
  sharepointDriveId: string;
}

interface DriveItem {
  id: string;
  name: string;
  webUrl: string;
  size?: number;
  lastModifiedDateTime?: string;
  folder?: Record<string, never>;
  file?: Record<string, never>;
}

interface DriveItemListResponse {
  value: DriveItem[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  webUrl: string;
}

export interface MatterDocumentItem {
  id: string;
  name: string;
  size: number;
  financialYear: string;
  modifiedAt: string;
  webUrl: string;
}

interface GraphErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

function buildDrivePath(config: SharePointIntegrationConfig): string {
  return `/drives/${config.sharepointDriveId.trim()}`;
}

function buildDriveItemPath(config: SharePointIntegrationConfig, itemPath: string): string {
  return `${buildDrivePath(config)}/root:/${itemPath}:`;
}

function buildItemUploadPath(
  config: SharePointIntegrationConfig,
  folderId: string,
  fileName: string
): string {
  return `${buildDrivePath(config)}/items/${folderId}:/${encodeDrivePath(fileName)}:/content`;
}

function formatGraphErrorMessage(fallback: string, body: GraphErrorBody | null): string {
  const code = body?.error?.code;
  const message = body?.error?.message;

  if (code && message) {
    return `${fallback} (${code}): ${message}`;
  }

  if (message) {
    return `${fallback}: ${message}`;
  }

  return fallback;
}

function permissionDeniedMessage(): string {
  return (
    "SharePoint access denied. The Azure app needs Microsoft Graph application permissions " +
    "(e.g. Sites.ReadWrite.All) with admin consent granted. Delegated permissions are not " +
    "sufficient for server-side uploads."
  );
}

async function listFolderChildren(
  config: SharePointIntegrationConfig,
  parentId: "root" | string
): Promise<DriveItem[]> {
  const url =
    parentId === "root"
      ? `${buildDrivePath(config)}/root/children`
      : `${buildDrivePath(config)}/items/${parentId}/children`;

  const response = await graphFetch(config.microsoftTenantId, url);

  if (!response.ok) {
    await throwGraphError(response, "Failed to list folder contents");
  }

  const data = (await response.json()) as DriveItemListResponse;
  return data.value;
}

async function getOrCreateChildFolder(
  config: SharePointIntegrationConfig,
  parentId: "root" | string,
  folderName: string
): Promise<string> {
  const children = await listFolderChildren(config, parentId);
  const existing = children.find((item) => item.folder && item.name === folderName);
  if (existing) {
    return existing.id;
  }

  const createUrl =
    parentId === "root"
      ? `${buildDrivePath(config)}/root/children`
      : `${buildDrivePath(config)}/items/${parentId}/children`;

  const response = await graphFetch(config.microsoftTenantId, createUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: folderName,
      folder: {},
      "@microsoft.graph.conflictBehavior": "fail",
    }),
  });

  if (response.ok) {
    const item = (await response.json()) as DriveItem;
    return item.id;
  }

  const body = await readGraphErrorBody(response);
  const code = body?.error?.code?.toLowerCase();

  if (response.status === 409 || code === "namealreadyexists") {
    const retryChildren = await listFolderChildren(config, parentId);
    const retryExisting = retryChildren.find((item) => item.folder && item.name === folderName);
    if (retryExisting) {
      return retryExisting.id;
    }
  }

  const message = body?.error?.message;
  throw new MicrosoftGraphError(
    message
      ? `Failed to create folder ${folderName}: ${message}`
      : `Failed to create folder ${folderName}`
  );
}

async function ensureFolderPath(
  config: SharePointIntegrationConfig,
  segments: string[]
): Promise<string> {
  let parentId: "root" | string = "root";

  for (const segment of segments) {
    parentId = await getOrCreateChildFolder(config, parentId, segment);
  }

  return parentId;
}

async function readGraphErrorBody(response: Response): Promise<GraphErrorBody | null> {
  try {
    return (await response.json()) as GraphErrorBody;
  } catch {
    return null;
  }
}

function isMissingItemResponse(response: Response, body: GraphErrorBody | null): boolean {
  if (response.status === 404) {
    return true;
  }

  const code = body?.error?.code?.toLowerCase();
  if (code === "itemnotfound") {
    return true;
  }

  const message = body?.error?.message?.toLowerCase() ?? "";
  if (message.includes("general exception")) {
    return true;
  }

  return false;
}

async function throwGraphError(response: Response, fallback: string): Promise<never> {
  const body = await readGraphErrorBody(response);

  if (response.status === 401 || response.status === 403) {
    throw new MicrosoftGraphError(permissionDeniedMessage());
  }

  throw new MicrosoftGraphError(formatGraphErrorMessage(fallback, body));
}

async function assertDriveAccess(config: SharePointIntegrationConfig): Promise<void> {
  const response = await graphFetch(config.microsoftTenantId, buildDrivePath(config));

  if (response.ok) {
    return;
  }

  if (response.status === 401 || response.status === 403) {
    throw new MicrosoftGraphError(permissionDeniedMessage());
  }

  await throwGraphError(response, "Cannot access SharePoint drive — check the drive ID");
}

async function getDriveItemByPath(
  config: SharePointIntegrationConfig,
  itemPath: string
): Promise<DriveItem | null> {
  const response = await graphFetch(
    config.microsoftTenantId,
    buildDriveItemPath(config, itemPath)
  );

  if (response.ok) {
    return (await response.json()) as DriveItem;
  }

  const body = await readGraphErrorBody(response);
  if (isMissingItemResponse(response, body)) {
    return null;
  }

  const message = body?.error?.message;
  throw new MicrosoftGraphError(
    message ? `Failed to access SharePoint folder: ${message}` : "Failed to access SharePoint folder"
  );
}

async function listDriveItemChildren(
  config: SharePointIntegrationConfig,
  itemId: string
): Promise<DriveItem[]> {
  return listFolderChildren(config, itemId);
}

export async function uploadMatterDocument(
  config: SharePointIntegrationConfig,
  matterDisplayId: string,
  financialYear: string,
  fileName: string,
  content: ArrayBuffer,
  contentType: string
): Promise<UploadedDocument> {
  await assertDriveAccess(config);

  const folderId = await ensureFolderPath(config, [matterDisplayId, financialYear]);
  const response = await graphFetch(
    config.microsoftTenantId,
    buildItemUploadPath(config, folderId, fileName),
    {
      method: "PUT",
      headers: { "Content-Type": contentType || "application/octet-stream" },
      body: content,
    }
  );

  if (!response.ok) {
    await throwGraphError(response, "Failed to upload document");
  }

  const item = (await response.json()) as DriveItem;
  return { id: item.id, name: item.name, webUrl: item.webUrl };
}

export async function listMatterDocuments(
  config: SharePointIntegrationConfig,
  matterDisplayId: string
): Promise<MatterDocumentItem[]> {
  try {
    const matterFolder = await getDriveItemByPath(config, encodeDrivePath(matterDisplayId));
    if (!matterFolder) {
      return [];
    }

    const fyFolders = await listDriveItemChildren(config, matterFolder.id);
    const documents: MatterDocumentItem[] = [];

    for (const item of fyFolders) {
      if (!item.folder) {
        continue;
      }

      const files = await listDriveItemChildren(config, item.id);

      for (const file of files) {
        if (!file.file) {
          continue;
        }

        documents.push({
          id: file.id,
          name: file.name,
          size: file.size ?? 0,
          financialYear: item.name,
          modifiedAt: file.lastModifiedDateTime ?? new Date().toISOString(),
          webUrl: file.webUrl,
        });
      }
    }

    return documents.sort(
      (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    );
  } catch (error) {
    console.error("Failed to list matter documents from SharePoint:", error);
    return [];
  }
}
