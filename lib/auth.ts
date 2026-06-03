import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import { getBetterAuthSecret, getBetterAuthUrl, getTrustedOrigins } from "@/lib/env";
import type { StaffRole } from "@/generated/prisma/client";

const authOptions = {
  database: prismaAdapter(prisma, { provider: "postgresql" as const }),
  secret: getBetterAuthSecret(),
  baseURL: getBetterAuthUrl(),
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      accountType: {
        type: "string" as const,
        required: true,
        input: false,
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { staffProfile: true },
      });

      return {
        user: {
          ...user,
          accountType: dbUser?.accountType ?? "CLIENT",
          staffRole: dbUser?.staffProfile?.role ?? null,
          initials: dbUser?.staffProfile?.initials ?? null,
          color: dbUser?.staffProfile?.color ?? null,
        },
        session,
      };
    }),
    nextCookies(),
  ],
};

export const auth = betterAuth(authOptions);

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  accountType: "STAFF" | "CLIENT";
  staffRole: StaffRole | null;
  initials: string | null;
  color: string | null;
};

export type Session = {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
};

export async function getAppSession(): Promise<Session | null> {
  const { headers } = await import("next/headers");
  const result = await auth.api.getSession({ headers: await headers() });
  return result as Session | null;
}
