import "./lib/load-env";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.DEMO_MODE === "true"
        ? env("DEMO_DATABASE_URL")
        : env("DATABASE_URL"),
  },
});
