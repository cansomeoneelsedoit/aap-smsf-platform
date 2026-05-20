# CLAUDE.md — SMSF Echo

This file is loaded by Claude Code at the start of every session in this repo. It captures the things you can't tell from just reading the code: the project's purpose, the workflow, the gotchas, and Boyd's standing instructions.

## Project at a glance

- **What:** Admin Autopilot SMSF Platform — an Australian self-managed super fund administration tool. Staff (Master Owner, Bookkeeper, Compliance Officer, Tax Agent) manage matters through a 5-stage workflow: Start → Prepare → Check → Lodge → Active. Clients access a portal for KYC, document upload, and team visibility.
- **Stack:** Next.js 16 (App Router) · React 19 · Prisma 6 · Postgres 16 · Auth.js v5 · Tailwind 4 · shadcn/ui · Vitest · Docker · Railway.
- **Local port:** **3001** (Sparmanik Farm owns :3000 on Boyd's machine). Postgres on host port **5433** for the same reason.
- **Canonical project path:** `C:\Users\boyds\Desktop\smsf-echo` (NOT under OneDrive — OneDrive sync causes git file-lock issues, lesson learned from Sparmanik Farm).
- **Courtesy mirror:** `C:\Users\boyds\OneDrive\Desktop\SMSF ECHO\CLAUDE.md` is kept in sync but **no development happens there**.
- **GitHub:** [`cansomeoneelsedoit/aap-smsf-platform`](https://github.com/cansomeoneelsedoit/aap-smsf-platform).
- **Railway prod:** <https://aap-smsf-platform-production.up.railway.app/> (auto-deploys on push to `main`).

## Local-first workflow (standing rule)

Every code or schema change goes **local → git → Railway**, never the other way:

1. Edit on local at `C:\Users\boyds\Desktop\smsf-echo`.
2. Verify locally: `docker compose up --build`, hit http://localhost:3001.
3. Commit + push. Railway auto-deploys.

After pulling someone else's commits that touch the schema or `package.json`:

```bash
docker compose exec web npx prisma migrate deploy
docker compose exec web npx prisma generate
docker compose restart web
# If deps changed:
docker compose up --build
```

When Boyd says **"Upload and Save"**, that means: commit AND push so Railway redeploys.

Never edit the Railway container's filesystem directly — fix it in the repo and push.

## Schema overview (high level)

- **Auth.js tables:** `User`, `Account`, `Session`, `VerificationToken`. `UserRole` is the coarse RBAC (`SUPERUSER` / `STAFF` / `CLIENT`).
- **Staff** (1:1 with User) carries the finer `StaffRole` (`MASTER_OWNER` / `BOOKKEEPER` / `COMPLIANCE_OFFICER` / `TAX_AGENT` / `ADMIN`) plus bio, hobbies, SMTP credentials.
- **Client** (1:1 with User) for portal users — fundamentally different from Staff.
- **Matter** is the SMSF case (M001, M002…). Has a `stage`, a `MatterType`, a `PackageTier`, trustee structure, ABN/TFN, primary contact (Client), and a CompanyGroup (referrer firm).
- **Member** = trustees on a Matter (up to 6).
- **StageAssignment** maps `(matterId, stage) → staffId` with handoff status — this is the source of truth for "who owns the current stage."
- **KycCheck** — identity / liveness / adverse media for each member.
- **Document** — file uploads, organized by year + category.
- **FileNote** — call notes, email summaries, internal notes. Can be sourced from `MANUAL`, `THREE_CX`, `ECHO_NOTES`, `BIZ_GPT`.
- **SignatureRequest** + **SignatureEvent** — captures the document + signer + IP + timestamp.
- **AuditAction** — immutable log of every meaningful action.
- **OnboardingSubmission** — raw 5-step wizard payload.

The schema lives in `prisma/schema.prisma`. Migrations are committed.

## Authentication

- `src/auth.ts` — full Auth.js config with Prisma adapter, Credentials provider (bcrypt), and optional Google OAuth (env-gated).
- `src/auth.config.ts` — edge-safe split, no DB. Used by `src/proxy.ts` (middleware).
- JWT sessions. Role flows from `User.role` → session callback → `session.user.role`.
- Middleware in `src/proxy.ts` redirects unauthenticated requests to `/signin?callbackUrl=…`.

## Common gotchas (carry-over from Sparmanik Farm)

1. **Don't develop under OneDrive.** OneDrive sync grabs file locks while git is mid-write and breaks operations randomly. Canonical path is `C:\Users\boyds\Desktop\smsf-echo`.
2. **Port 3000 is taken** by sparmanikfarm. Use 3001 for everything in this project. The dev script (`next dev -p 3001`), Docker (`EXPOSE 3001`), and compose port mapping all reflect this. Postgres uses host port 5433.
3. **Prisma client drift.** If you pull schema changes, you must `prisma migrate deploy && prisma generate && restart` — the running container won't pick them up automatically.
4. **`AUTH_TRUST_HOST=true`** is required on Railway (otherwise Auth.js refuses to issue tokens behind the Railway proxy).
5. **Healthcheck path** is `/api/health` and it does a `SELECT 1` against the database. If the DB is unreachable the deploy will fail healthcheck and roll back.
6. **Docker `web` service runs as root** so Railway's mounted Volume (e.g. `/data`) stays writable. Intentional — see the comment in `Dockerfile`.
7. **Next.js 16** has breaking changes from training data. When in doubt, read `node_modules/next/dist/docs/`. There's also an `AGENTS.md` at repo root reminding you of this.
8. **Cache headers are aggressive (`no-store`).** Configured in `next.config.mjs` so a deploy is visible without a hard refresh. Don't be surprised by lack of caching in dev tools.

## Demo accounts (all password `demo123`)

| Email | Role |
|---|---|
| sarah@aap.com.au | Master Owner (SUPERUSER) |
| emma@aap.com.au | Bookkeeper |
| michael@aap.com.au | Compliance Officer |
| rachel@aap.com.au | Tax Agent |
| john.smith@example.com | Client |

Seeded by `prisma/seed.ts`. Don't ship these passwords to prod without rotating.

## Railway env vars (production)

Set these in the Railway service dashboard:

- `DATABASE_URL` — Railway Postgres plugin connection string (the plugin adds it automatically)
- `AUTH_SECRET` — `openssl rand -base64 32`
- `AUTH_URL` — `https://aap-smsf-platform-production.up.railway.app`
- `AUTH_TRUST_HOST` — `true`
- `NODE_ENV` — `production`
- (Optional) `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` if you wire up Google sign-in

`PORT` is injected by Railway automatically — leave it unset.
