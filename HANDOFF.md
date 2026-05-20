# SMSF Echo — Scaffold Handoff

**Status:** scaffold complete, locally verified, pushed to GitHub on `feat/real-app-scaffold`.

## Where things live now

- **Canonical project:** `C:\Users\boyds\Desktop\smsf-echo` (do all work here)
- **OneDrive courtesy mirror:** `C:\Users\boyds\OneDrive\Desktop\SMSF ECHO\CLAUDE.md` — kept in sync, NOT for development
- **GitHub branch:** [`feat/real-app-scaffold`](https://github.com/cansomeoneelsedoit/aap-smsf-platform/tree/feat/real-app-scaffold) (pushed, not yet merged)
- **Open a PR:** <https://github.com/cansomeoneelsedoit/aap-smsf-platform/pull/new/feat/real-app-scaffold>
- **Railway prod URL:** <https://aap-smsf-platform-production.up.railway.app/> (still serving the old v4.html mockup — switches over once the PR merges to `main`)

## What was built

1. Replaced the static Express + v4.html prototype with a real Next.js 16 + Prisma 6 + Postgres + Auth.js v5 app, mirroring the Sparmanik Farm stack.
2. **Port 3001** locally (Sparmanik owns 3000). Host Postgres on **5433** (Sparmanik owns 5432).
3. **Prisma schema** reverse-engineered from `v4-reference.html.bak` (the saved v4 prototype): Matter (5 stages), Staff (5 roles), Client, CompanyGroup, KycCheck, Document, FileNote (with 3CX/Echo Notes/BizGPT sourcing), SignatureRequest+Event, AuditAction, Task, OnboardingSubmission.
4. **Demo data seeded:**

   | Email | Password | Role |
   |---|---|---|
   | sarah@aap.com.au | `demo123` | Master Owner (SUPERUSER) |
   | emma@aap.com.au | `demo123` | Bookkeeper |
   | michael@aap.com.au | `demo123` | Compliance Officer |
   | rachel@aap.com.au | `demo123` | Tax Agent |
   | john.smith@example.com | `demo123` | Client |

   Plus two sample matters: **M001** (Smith Family Super Fund, PREPARE stage, Emma assigned) and **M002** (Tran Retirement Fund, LODGE stage, Rachel assigned).
5. **UI shell:** `/signin` page with credentials form (lists demo accounts), auth-gated `/dashboard` showing matters grouped by stage, role-aware sidebar, dark-mode toggle.

## Local stack — currently running

When I left:
- `smsf-echo-db-1` Postgres container is **up and healthy** on host port 5433
- Next dev server is **listening on 3001**
- `/api/health` returns `{"status":"healthy"}`
- `/signin` renders (200)
- `/dashboard` unauthed → 307 redirects to `/signin` (middleware working)

## Try it

Open <http://localhost:3001/signin> and sign in as `sarah@aap.com.au` / `demo123`.

## Restart from scratch

```bash
cd C:\Users\boyds\Desktop\smsf-echo
docker compose up --build      # full stack on :3001 (also boots Postgres on host 5433)
# OR for host dev:
docker compose up -d db        # just Postgres
npm run dev                    # next dev -p 3001
```

## What's NEXT to ship to Railway prod

1. **Open the PR** at <https://github.com/cansomeoneelsedoit/aap-smsf-platform/pull/new/feat/real-app-scaffold> and merge to `main` (your "Upload and Save" workflow).
2. **In the Railway dashboard** for the `aap-smsf-platform-production` service:
   - Add the **Postgres plugin** (it'll inject `DATABASE_URL` automatically) if not already there
   - Set env vars:
     - `AUTH_SECRET` — run `openssl rand -base64 32` to generate
     - `AUTH_URL` = `https://aap-smsf-platform-production.up.railway.app`
     - `AUTH_TRUST_HOST` = `true`
     - `NODE_ENV` = `production`
   - Leave `PORT` unset (Railway injects)
3. Railway will auto-build on merge. The Dockerfile runs `prisma migrate deploy` then `next start` on the injected port. Healthcheck path is `/api/health` (180s timeout).
4. **Verify:** `curl https://aap-smsf-platform-production.up.railway.app/api/health` should return 200 once the deploy is green.
5. **Log in** on the live URL with `sarah@aap.com.au / demo123` — same seed data is created on first run.

## Files touched (what's in the commit)

Two commits on `feat/real-app-scaffold`:
- `8c5111f` — scaffold: Next.js + Prisma + Auth.js SMSF Echo app on port 3001 (51 files)
- `e4e02c9` — db: initial Prisma migration (init schema)

Deleted from prior prototype: `server.js`, `public/index.html`, original `package.json`/`README.md`/`.gitignore`, `docs/schema.sql`.

## Build dependencies for future feature pages

The shadcn primitives currently shipped:
- `button`, `input`, `label`, `card`, `badge`, `table`, `dropdown-menu`, `sonner` (toast)

Add more as you build feature pages — `npx shadcn add <name>` works because `components.json` is set up.
