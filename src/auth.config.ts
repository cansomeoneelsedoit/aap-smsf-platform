import type { NextAuthConfig } from "next-auth";

export type SmsfRole =
  | "SUPERUSER"
  | "STAFF"
  | "CLIENT";

/**
 * Edge-safe Auth.js config. No adapter, no DB-touching providers. Imported by
 * src/proxy.ts so the middleware bundle stays edge-compatible. The full config
 * (PrismaAdapter + Credentials.authorize) lives in src/auth.ts.
 */
export default {
  pages: { signIn: "/signin" },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        const r = (user as { role?: SmsfRole }).role;
        token.role = r ?? "STAFF";
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        session.user.role = (token.role as SmsfRole | undefined) ?? "STAFF";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
