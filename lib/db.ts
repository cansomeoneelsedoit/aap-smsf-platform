import "@/lib/load-env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseUrl } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  const connectionString = getDatabaseUrl();
  const isRemote =
    !connectionString.includes("localhost") &&
    !connectionString.includes("127.0.0.1");

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      // Keep one warm connection so remote round-trips are not paid on every cold start.
      min: 1,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
    });

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
