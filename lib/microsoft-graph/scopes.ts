/**
 * Delegated Graph scopes requested during Microsoft sign-in (beyond better-auth defaults).
 *
 * Files.ReadWrite — read/write files the signed-in user can access (SharePoint + OneDrive).
 * Sites.ReadWrite.All — create folders and upload in SharePoint sites the user can access.
 *
 * Sites.Selected only covers explicitly registered sites and blocks writes without a
 * Graph site-permission grant. Files.ReadWrite.Selected requires Microsoft's official picker.
 */
export const MICROSOFT_GRAPH_DELEGATED_SCOPES = [
  "Files.ReadWrite",
  "Sites.ReadWrite.All",
] as const;

export function getMicrosoftGraphDelegatedScopeString(): string {
  return MICROSOFT_GRAPH_DELEGATED_SCOPES.join(" ");
}
