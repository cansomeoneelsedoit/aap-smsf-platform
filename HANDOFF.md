# SMSF Echo — Build Handoff

**Status:** Visual + functional v4 port complete and pushed to GitHub on `feat/real-app-scaffold`. The whole nav works against real Prisma data. Ready to merge.

## Quick links

- **GitHub branch:** [`feat/real-app-scaffold`](https://github.com/cansomeoneelsedoit/aap-smsf-platform/tree/feat/real-app-scaffold)
- **Open the PR:** <https://github.com/cansomeoneelsedoit/aap-smsf-platform/pull/new/feat/real-app-scaffold>
- **Local dev:** <http://localhost:3001> (server running)
- **Railway prod URL:** <https://aap-smsf-platform-production.up.railway.app/> (still on the old v4.html mockup until you merge the PR)

## What works right now (locally)

### Public routes (no signin)

- `/onboarding` — full 5-step wizard (service → package → fund → members → review) styled to match v4. Submits a server action that **creates a real Matter** with proper matter ref (M007, M008…), members, stage assignment, audit event. Redirects to `/onboarding/success`.
- `/onboarding/success` — confetti page with the new matter ID.
- `/signin` — credentials form, lists all 5 demo accounts.

### Authenticated routes (sign in first)

| Route | What it does |
|---|---|
| `/dashboard` | 4 stat cards (clients, handoffs, KYC, call drafts) + 5 stage tiles (Start/Prepare/Check/Lodge/Active) + pending-handoff alert + recent clients table + activity feed. |
| `/matters` | Searchable + filterable list of all matters. Company badges + stage pills. Search by ref / fund name / ABN. |
| `/matters/[id]` | Header card with 5-stage progress track. Ownership strip showing who owns each stage (current stage highlighted orange, completed stages green). Handoff alert when handoff pending. Tabs: **Overview / Documents / KYC / File Notes / Audit Log** — all rendering real Prisma data. |
| `/companies` | Referrer firm cards (Clime / Liberty / RiverX / AAP) with client counts. |
| `/queues/preparation`, `/queues/compliance`, `/queues/lodgement` | Stage-scoped matter queues. |
| `/kyc` | Global KYC dashboard. Identity / liveness / adverse-media result dots. Animated pulse for "RUNNING" checks. |
| `/audit` | Immutable audit log across all matters (grid layout matching v4). |
| `/staff` | Public-facing staff profile cards (avatar coloured by role, bio, hobbies). |
| `/notifications` | Recent-activity feed. |
| `/account` | Current user's account details. |

### Design system

The orange `#e8591a` Admin Autopilot palette is now in `src/app/globals.css` as CSS custom properties + utility classes:

- `.aap-stage-pill.{start,prepare,check,lodge,active}` — stage badges (blue/purple/orange/yellow/green)
- `.aap-company-badge.{clime,liberty,riverx,aap,other}` — referrer firm chips
- `.aap-stat-tag.{orange,amber,red,purple,green,blue,gray}` — small stat callouts
- `.aap-handoff-panel` — gradient orange handoff alert
- AAP logo SVG component at `src/components/shared/aap-logo.tsx`
- Inter + Instrument Serif + Dancing Script (signature pad) all wired in `src/app/layout.tsx`

## Demo data seeded

- 4 staff: sarah (Master Owner) · emma (Bookkeeper) · michael (Compliance) · rachel (Tax Agent)
- 1 client: john.smith@example.com (CLIENT role, portal access)
- 6 matters across all stages: M001 Smith Family (Check), M002 Johnson (Prepare, handoff pending), M003 Williams Corp (Lodge, handoff pending), M004 Brown Family (Start), M005 Chen Investment (Active), M006 Davis Investment (Check)
- 2 KYC checks on M001 (John PASSED, Mary IN_PROGRESS with RUNNING)
- 2 documents on M001 (Trust Deed SIGNED, Passport VERIFIED)
- 1 pinned file note from Echo Notes (3CX call, 8m14s, with recording URL)
- 4 audit events on M001
- 1 open task (follow up Mary's KYC)

All accounts: password `demo123`

## Local stack (still running)

- `smsf-echo-db-1` Postgres on host port **5433**, healthy
- Next dev server on **http://localhost:3001**
- Sign in URL: <http://localhost:3001/signin>
- Try onboarding at <http://localhost:3001/onboarding>

## Restart from scratch

```bash
cd C:\Users\boyds\Desktop\smsf-echo
docker compose up --build      # full stack on :3001 (Postgres on host 5433)

# OR host-only (faster on rebuilds):
docker compose up -d db
npm run dev
```

To reseed:

```bash
DATABASE_URL="postgresql://smsfecho:smsfecho@localhost:5433/smsfecho?schema=public" npx tsx prisma/seed.ts
```

## Next to ship to Railway prod

1. **Open the PR** at <https://github.com/cansomeoneelsedoit/aap-smsf-platform/pull/new/feat/real-app-scaffold> and merge to `main`.
2. **In the Railway dashboard** for `aap-smsf-platform-production`:
   - Add the **Postgres plugin** (auto-injects `DATABASE_URL`)
   - Set env vars:
     - `AUTH_SECRET` — run `openssl rand -base64 32`
     - `AUTH_URL` = `https://aap-smsf-platform-production.up.railway.app`
     - `AUTH_TRUST_HOST` = `true`
     - `NODE_ENV` = `production`
   - Leave `PORT` unset
3. Railway auto-builds on merge. The Dockerfile runs `prisma migrate deploy` then `next start` on the injected port. Healthcheck path is `/api/health` (180s timeout).
4. Verify: `curl https://aap-smsf-platform-production.up.railway.app/api/health` → 200.
5. Sign in on the live URL with `sarah@aap.com.au / demo123`.

## Commits on this branch (4)

- `8c5111f` — scaffold: Next.js + Prisma + Auth.js SMSF Echo app on port 3001
- `e4e02c9` — db: initial Prisma migration (init schema)
- `7250166` — docs: add HANDOFF.md with current scaffold status
- `4961332` — ui: port v4 design system + full feature pages

## What's still TODO (post-merge ideas)

- **3CX / Echo Notes webhook receiver** — endpoint that ingests call recordings and auto-creates draft file notes.
- **Signature pad** — connect the Dancing Script font to a canvas-based signature flow at `/matters/[id]/sign/[docId]`.
- **Document upload** — file upload to `UPLOAD_DIR` (Railway Volume in prod).
- **Stage advance + handoff accept** — actions for Master Owner to push a matter to the next stage; for incoming staff to accept.
- **Client portal** at `/portal` (separate role-gated layout for CLIENT users).
- **Notification de-duping** — currently uses the audit log as the notification feed; eventually wants its own table with read/unread state.
