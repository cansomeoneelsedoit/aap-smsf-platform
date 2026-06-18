import { MicrosoftGraphConfigError } from "./errors";

export { MAX_UPLOAD_BYTES } from "./constants";

export function getMicrosoftAppCredentials() {
  const clientId = process.env.MICROSOFT_CLIENT_ID?.trim();
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new MicrosoftGraphConfigError("Microsoft app credentials are not configured");
  }

  return { clientId, clientSecret };
}
