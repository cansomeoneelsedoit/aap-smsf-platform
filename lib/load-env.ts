import "dotenv/config";
import { config } from "dotenv";

// Next.js keeps local secrets in .env.local; load after .env so overrides apply.
config({ path: ".env.local", override: true });
