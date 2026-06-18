import { encodeDrivePath, graphFetch } from "./client";
import { MicrosoftGraphError } from "./errors";

export interface SharePointDestinationConfig {
  microsoftTenantId: string;
  sharepointDriveId: string;
  /** Drive item ID of the client root folder selected at client creation. */
  sharepointFolderId: string;
}

interface DriveItem {
  id: string;
  name: string;
  webUrl: string;
  driveType?: string;
  size?: number;
  lastModifiedDateTime?: string;
  folder?: Record<string, never>;
  file?: Record<string, never>;
}

interface DriveItemListResponse {
  value: DriveItem[];
}

export interface SharePointBrowseItem {
  id: string;
  name: string;
  webUrl: string;
  isFolder: boolean;
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

function buildDrivePath(driveId: string): string {
  return `/drives/${driveId.trim()}`;
}

function normalizeFolderId(folderId: string, driveId: string): "root" | string {
  if (folderId === "root" || folderId === driveId) {
    return "root";
  }
  return folderId;
}

function buildChildrenUrl(driveId: string, parentId: "root" | string): string {
  return parentId === "root"
    ? `${buildDrivePath(driveId)}/root/children`
    : `${buildDrivePath(driveId)}/items/${parentId}/children`;
}

function buildItemPathUrl(driveId: string, parentId: "root" | string, itemPath: string): string {
  return parentId === "root"
    ? `${buildDrivePath(driveId)}/root:/${itemPath}:`
    : `${buildDrivePath(driveId)}/items/${parentId}:/${itemPath}:`;
}

function buildItemUploadPath(driveId: string, folderId: string, fileName: string): string {
  return `${buildDrivePath(driveId)}/items/${folderId}:/${encodeDrivePath(fileName)}:/content`;
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
    "SharePoint access denied. Ensure the Azure app has the Files.ReadWrite delegated permission " +
    "with admin consent granted, then sign out and sign in with Microsoft again."
  );
}

function folderWriteDeniedMessage(folderName: string): string {
  return (
    `Cannot create folder "${folderName}" in SharePoint. Your Microsoft account may lack write ` +
    "permission on this folder, or the app may need the Files.ReadWrite delegated permission " +
    "with admin consent — sign out and sign in with Microsoft after permissions are updated."
  );
}

async function listFolderChildren(
  accessToken: string,
  driveId: string,
  parentId: "root" | string
): Promise<DriveItem[]> {
  const url =
    parentId === "root"
      ? `${buildDrivePath(driveId)}/root/children`
      : `${buildDrivePath(driveId)}/items/${parentId}/children`;

  const response = await graphFetch(accessToken, url);

  if (!response.ok) {
    await throwGraphError(response, "Failed to list folder contents");
  }

  const data = (await response.json()) as DriveItemListResponse;
  return data.value;
}

async function getOrCreateChildFolder(
  accessToken: string,
  driveId: string,
  parentId: "root" | string,
  folderName: string
): Promise<string> {
  const children = await listFolderChildren(accessToken, driveId, parentId);
  const existing = children.find((item) => item.folder && item.name === folderName);
  if (existing) {
    return existing.id;
  }

  const response = await graphFetch(accessToken, buildChildrenUrl(driveId, parentId), {
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

  if (response.status === 401 || response.status === 403) {
    throw new MicrosoftGraphError(folderWriteDeniedMessage(folderName));
  }

  if (response.status === 409 || code === "namealreadyexists") {
    const retryChildren = await listFolderChildren(accessToken, driveId, parentId);
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
  accessToken: string,
  driveId: string,
  parentFolderId: string,
  segments: string[]
): Promise<string> {
  let parentId = normalizeFolderId(parentFolderId, driveId);

  for (const segment of segments) {
    parentId = await getOrCreateChildFolder(accessToken, driveId, parentId, segment);
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

async function assertFolderAccess(
  accessToken: string,
  driveId: string,
  folderId: string
): Promise<void> {
  const normalizedFolderId = normalizeFolderId(folderId, driveId);
  const url =
    normalizedFolderId === "root"
      ? `${buildDrivePath(driveId)}/root`
      : `${buildDrivePath(driveId)}/items/${normalizedFolderId}`;

  const response = await graphFetch(accessToken, url);

  if (response.ok) {
    return;
  }

  if (response.status === 401 || response.status === 403) {
    throw new MicrosoftGraphError(permissionDeniedMessage());
  }

  await throwGraphError(response, "Cannot access SharePoint folder — check the folder ID");
}

async function getDriveItemByPath(
  accessToken: string,
  driveId: string,
  parentFolderId: string,
  itemPath: string
): Promise<DriveItem | null> {
  const parentId = normalizeFolderId(parentFolderId, driveId);
  const response = await graphFetch(
    accessToken,
    buildItemPathUrl(driveId, parentId, encodeDrivePath(itemPath))
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

export async function getSharePointSite(
  accessToken: string,
  siteId: string
): Promise<{ id: string; name: string; webUrl: string }> {
  const response = await graphFetch(
    accessToken,
    `/sites/${encodeURIComponent(siteId)}?$select=displayName,webUrl`
  );

  if (!response.ok) {
    await throwGraphError(response, "Failed to load SharePoint site");
  }

  const site = (await response.json()) as { id: string; displayName: string; webUrl: string };
  return { id: site.id, name: site.displayName, webUrl: site.webUrl };
}

export async function listSharePointSiteDrives(
  accessToken: string,
  siteId: string
): Promise<SharePointBrowseItem[]> {
  const response = await graphFetch(accessToken, `/sites/${encodeURIComponent(siteId)}/drives`);

  if (!response.ok) {
    await throwGraphError(response, "Failed to list SharePoint document libraries");
  }

  const data = (await response.json()) as { value: DriveItem[] };
  return data.value
    .filter((drive) => drive.driveType === "documentLibrary")
    .map((drive) => ({
      id: drive.id,
      name: drive.name,
      webUrl: drive.webUrl,
      isFolder: true,
    }));
}

/** @deprecated Use listSharePointSiteDrives with an organisation site ID */
export async function listSharePointDrives(accessToken: string): Promise<SharePointBrowseItem[]> {
  const response = await graphFetch(accessToken, "/me/drives");

  if (!response.ok) {
    await throwGraphError(response, "Failed to list SharePoint drives");
  }

  const data = (await response.json()) as { value: DriveItem[] };
  return data.value.map((drive) => ({
    id: drive.id,
    name: drive.name,
    webUrl: drive.webUrl,
    isFolder: true,
  }));
}

export async function listSharePointFolderChildren(
  accessToken: string,
  driveId: string,
  folderId: "root" | string
): Promise<SharePointBrowseItem[]> {
  const children = await listFolderChildren(accessToken, driveId, folderId);

  return children
    .filter((item) => item.folder)
    .map((item) => ({
      id: item.id,
      name: item.name,
      webUrl: item.webUrl,
      isFolder: true,
    }));
}

export async function getSharePointFolderDetails(
  accessToken: string,
  driveId: string,
  folderId: string
): Promise<{ id: string; name: string; webUrl: string }> {
  const normalizedFolderId = normalizeFolderId(folderId, driveId);
  const url =
    normalizedFolderId === "root"
      ? `${buildDrivePath(driveId)}/root`
      : `${buildDrivePath(driveId)}/items/${normalizedFolderId}`;

  const response = await graphFetch(accessToken, url);

  if (!response.ok) {
    await throwGraphError(response, "Failed to load SharePoint folder");
  }

  const item = (await response.json()) as DriveItem;
  return { id: item.id, name: item.name, webUrl: item.webUrl };
}

export async function uploadMatterDocument(
  accessToken: string,
  config: SharePointDestinationConfig,
  matterDisplayId: string,
  financialYear: string,
  fileName: string,
  content: ArrayBuffer,
  contentType: string
): Promise<UploadedDocument> {
  await assertFolderAccess(accessToken, config.sharepointDriveId, config.sharepointFolderId);

  const folderId = await ensureFolderPath(
    accessToken,
    config.sharepointDriveId,
    config.sharepointFolderId,
    [matterDisplayId, financialYear]
  );

  const response = await graphFetch(
    accessToken,
    buildItemUploadPath(config.sharepointDriveId, folderId, fileName),
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
  accessToken: string,
  config: SharePointDestinationConfig,
  matterDisplayId: string
): Promise<MatterDocumentItem[]> {
  try {
    const matterFolder = await getDriveItemByPath(
      accessToken,
      config.sharepointDriveId,
      config.sharepointFolderId,
      encodeDrivePath(matterDisplayId)
    );
    if (!matterFolder) {
      return [];
    }

    const fyFolders = await listFolderChildren(
      accessToken,
      config.sharepointDriveId,
      matterFolder.id
    );
    const documents: MatterDocumentItem[] = [];

    for (const item of fyFolders) {
      if (!item.folder) {
        continue;
      }

      const files = await listFolderChildren(accessToken, config.sharepointDriveId, item.id);

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

/** @deprecated Use SharePointDestinationConfig */
export type SharePointIntegrationConfig = SharePointDestinationConfig;
