import "next-auth";
import "next-auth/jwt";
import type { SmsfRole } from "@/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: SmsfRole;
    };
  }

  interface User {
    role?: SmsfRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: SmsfRole;
  }
}
