export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function getDatabaseUrl(): string {
  const url = isDemoMode()
    ? process.env.DEMO_DATABASE_URL
    : process.env.DATABASE_URL;

  if (!url) {
    return "postgresql://localhost:5432/aap";
  }

  return url;
}

export function getBetterAuthSecret(): string {
  return process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production";
}

export function getBetterAuthUrl(): string {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

/** Origins allowed for Better Auth (must include the URL you open in the browser). */
export function getTrustedOrigins(): string[] {
  const base = getBetterAuthUrl();
  const origins = new Set<string>([base]);

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://localhost:3001");
  }

  return [...origins];
}
