import { prisma } from "@/lib/db";
import { getMicrosoftAuthConfig } from "@/lib/microsoft-auth-config";
import { MicrosoftGraphAuthError } from "./errors";
import {
  formatGraphScopesForDisplay,
  hasRequiredGraphScopes,
} from "./scope-utils";
import { getMicrosoftGraphDelegatedScopeString } from "./scopes";

const TOKEN_REFRESH_BUFFER_MS = 60_000;

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

function buildRefreshScopes(): string {
  return [
    "openid",
    "profile",
    "email",
    "User.Read",
    "offline_access",
    getMicrosoftGraphDelegatedScopeString(),
  ].join(" ");
}

function missingScopesMessage(scope: string | null | undefined): string {
  return (
    "Microsoft account is missing SharePoint permissions on its token " +
    `(current scopes: ${formatGraphScopesForDisplay(scope)}). ` +
    "Use “Reconnect Microsoft” in the SharePoint folder picker, or sign out and sign in " +
    "with Microsoft again. If the consent screen does not appear, remove this app from " +
    "https://myaccount.microsoft.com/apps and sign in again."
  );
}

async function refreshUserAccessToken(refreshToken: string): Promise<TokenResponse> {
  const config = getMicrosoftAuthConfig();
  if (!config) {
    throw new MicrosoftGraphAuthError("Microsoft auth is not configured");
  }

  const response = await fetch(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        scope: buildRefreshScopes(),
      }),
    }
  );

  if (!response.ok) {
    throw new MicrosoftGraphAuthError(
      "Failed to refresh Microsoft Graph access token — reconnect your Microsoft account"
    );
  }

  return (await response.json()) as TokenResponse;
}

export async function getMicrosoftAccountForUser(userId: string) {
  return prisma.account.findFirst({
    where: { userId, providerId: "microsoft" },
  });
}

export async function userHasMicrosoftGraphAccess(userId: string): Promise<boolean> {
  const account = await getMicrosoftAccountForUser(userId);
  return Boolean(account?.refreshToken);
}

export async function getMicrosoftGraphConnectionStatus(userId: string) {
  const account = await getMicrosoftAccountForUser(userId);
  return {
    linked: Boolean(account?.refreshToken),
    scopesOk: hasRequiredGraphScopes(account?.scope),
    scopes: account?.scope ?? null,
  };
}

export async function resetMicrosoftGraphConnection(userId: string): Promise<void> {
  await prisma.account.deleteMany({
    where: { userId, providerId: "microsoft" },
  });
}

/**
 * Returns a valid delegated Graph access token for the given staff user.
 * Refreshes and persists tokens on the linked Microsoft account when expired.
 */
export async function getUserGraphAccessToken(userId: string): Promise<string> {
  const account = await getMicrosoftAccountForUser(userId);
  if (!account) {
    throw new MicrosoftGraphAuthError(
      "No Microsoft account linked — sign in with Microsoft to access SharePoint"
    );
  }

  const canUseCachedToken =
    account.accessToken &&
    account.accessTokenExpiresAt &&
    account.accessTokenExpiresAt.getTime() > Date.now() + TOKEN_REFRESH_BUFFER_MS &&
    hasRequiredGraphScopes(account.scope);

  if (canUseCachedToken && account.accessToken) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    throw new MicrosoftGraphAuthError(missingScopesMessage(account.scope));
  }

  const tokens = await refreshUserAccessToken(account.refreshToken);

  await prisma.account.update({
    where: { id: account.id },
    data: {
      accessToken: tokens.access_token,
      accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
      ...(tokens.scope ? { scope: tokens.scope } : {}),
    },
  });

  if (!hasRequiredGraphScopes(tokens.scope ?? account.scope)) {
    throw new MicrosoftGraphAuthError(missingScopesMessage(tokens.scope ?? account.scope));
  }

  return tokens.access_token;
}
