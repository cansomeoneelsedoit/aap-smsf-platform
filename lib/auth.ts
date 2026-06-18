import { betterAuth } from "better-auth";
import type { MicrosoftEntraIDProfile } from "better-auth/social-providers";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import { getBetterAuthSecret, getBetterAuthUrl, getTrustedOrigins } from "@/lib/env";
import { getMicrosoftAuthConfig } from "@/lib/microsoft-auth-config";
import { MICROSOFT_GRAPH_DELEGATED_SCOPES } from "@/lib/microsoft-graph/scopes";
import {
  deriveStaffInitials,
  getDefaultStaffColor,
} from "@/lib/staff-profile-utils";
import { AccountType, type StaffRole } from "@/generated/prisma/client";

const microsoftAuth = getMicrosoftAuthConfig();

function mapMicrosoftProfileToStaffUser(profile: MicrosoftEntraIDProfile) {
  return {
    accountType: AccountType.STAFF,
    image: undefined,
    email:
      profile.email ??
      profile.preferred_username ??
      profile.upn ??
      undefined,
  };
}

const authOptions = {
  database: prismaAdapter(prisma, { provider: "postgresql" as const }),
  secret: getBetterAuthSecret(),
  baseURL: getBetterAuthUrl(),
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  socialProviders: microsoftAuth
    ? {
        microsoft: {
          clientId: microsoftAuth.clientId,
          clientSecret: microsoftAuth.clientSecret,
          tenantId: microsoftAuth.tenantId,
          prompt: "select_account" as const,
          disableProfilePhoto: true,
          scope: [...MICROSOFT_GRAPH_DELEGATED_SCOPES],
          mapProfileToUser: mapMicrosoftProfileToStaffUser,
        },
      }
    : undefined,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["microsoft"],
    },
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
  databaseHooks: {
    user: {
      create: {
        after: async (user: { id: string; name: string; accountType?: string }) => {
          if (user.accountType !== AccountType.STAFF) return;

          const existingProfile = await prisma.staffProfile.findUnique({
            where: { userId: user.id },
          });
          if (existingProfile) return;

          await prisma.staffProfile.create({
            data: {
              userId: user.id,
              role: "BOOKKEEPER" satisfies StaffRole,
              initials: deriveStaffInitials(user.name),
              color: getDefaultStaffColor(),
            },
          });
        },
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
