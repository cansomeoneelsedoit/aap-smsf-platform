import { getMicrosoftAppCredentials } from "./config";
import { MicrosoftGraphAuthError } from "./errors";

const GRAPH_SCOPE = "https://graph.microsoft.com/.default";

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/**
 * Application (client credentials) token. Retained for transitional use only —
 * SharePoint operations should use delegated user tokens via auth-user.ts.
 */
export async function getAppAccessToken(tenantId: string): Promise<string> {
  const cached = tokenCache.get(tenantId);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const { clientId, clientSecret } = getMicrosoftAppCredentials();

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: GRAPH_SCOPE,
        grant_type: "client_credentials",
      }),
    }
  );

  if (!response.ok) {
    throw new MicrosoftGraphAuthError("Failed to obtain Microsoft Graph application token");
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };

  tokenCache.set(tenantId, {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });

  return data.access_token;
}
