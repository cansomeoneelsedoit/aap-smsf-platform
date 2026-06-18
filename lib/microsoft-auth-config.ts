export type MicrosoftAuthConfig = {
  clientId: string;
  clientSecret: string;
  tenantId: string;
};

export function getMicrosoftAuthConfig(): MicrosoftAuthConfig | null {
  const clientId = process.env.MICROSOFT_CLIENT_ID?.trim();
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET?.trim();
  const tenantId = process.env.MICROSOFT_TENANT_ID?.trim();

  if (!clientId || !clientSecret || !tenantId) {
    return null;
  }

  return { clientId, clientSecret, tenantId };
}
