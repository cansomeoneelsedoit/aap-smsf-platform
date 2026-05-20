# SMSF Echo — Admin Autopilot

Self-managed super fund administration platform. Next.js 16 + Prisma 6 + Postgres + Auth.js v5, deployed on Railway.

The Railway prod URL is <https://aap-smsf-platform-production.up.railway.app/>. The GitHub repo is [`cansomeoneelsedoit/aap-smsf-platform`](https://github.com/cansomeoneelsedoit/aap-smsf-platform).

## Quickstart (Docker, recommended)

You'll need Docker Desktop running.

```bash
cp .env.example .env
# Generate an AUTH_SECRET and paste it into .env:
#   openssl rand -base64 32

docker compose up --build
```

The web app comes up on <http://localhost:3001>. Postgres is exposed on host port **5433** (not 5432) to avoid clashing with the Sparmanik Farm stack that runs on the same machine.

When the container starts it runs `prisma migrate deploy` and seeds demo data automatically. Sign in with one of:

| Email | Password | Role |
|---|---|---|
| sarah@aap.com.au | `demo123` | Master Owner |
| emma@aap.com.au | `demo123` | Bookkeeper |
| michael@aap.com.au | `demo123` | Compliance Officer |
| rachel@aap.com.au | `demo123` | Tax Agent |
| john.smith@example.com | `demo123` | Client |

## Quickstart (host install)

```bash
npm install
cp .env.example .env
# Edit DATABASE_URL if your local Postgres lives elsewhere
npx prisma migrate dev
npm run db:seed
npm run dev    # http://localhost:3001
```

## Useful commands

```bash
npm run dev            # Next dev server on :3001
npm run build          # Prisma generate + Next build
npm run typecheck      # tsc --noEmit
npm run test           # vitest run
npm run db:seed        # tsx prisma/seed.ts
npm run prisma:migrate # prisma migrate dev (interactive)
npm run prisma:studio  # browse the DB in a UI
```

## Endpoints

- `/` — redirects to `/dashboard`
- `/signin` — credentials form (NextAuth)
- `/dashboard` — auth-protected; lists matters grouped by stage
- `/api/health` — Railway healthcheck (`{"status":"healthy"}`)
- `/api/auth/*` — NextAuth handlers

## Stack

- **Next.js 16** (App Router, server components, server actions)
- **React 19**
- **Prisma 6** + **Postgres 16**
- **Auth.js v5** (Credentials + optional Google OAuth, JWT sessions)
- **Tailwind 4** + **shadcn/ui** primitives
- **Vitest** for tests
- **Docker** locally, **Railway** in prod

## Project layout

```
prisma/
  schema.prisma           # data model (auth + SMSF domain)
  seed.ts                 # demo accounts + sample matters
src/
  app/
    (auth)/signin/        # signin route group
    (app)/                # auth-gated routes (dashboard + future pages)
    api/health/           # Railway healthcheck
    api/auth/[...nextauth]/
    layout.tsx
    globals.css
  auth.ts                 # full NextAuth config (Prisma adapter)
  auth.config.ts          # edge-safe config (used by proxy.ts)
  auth-handlers.ts        # GET/POST re-export
  proxy.ts                # middleware (NextAuth v5)
  lib/
    prisma.ts             # singleton PrismaClient
    utils.ts
  components/
    ui/                   # shadcn primitives
    shared/               # Sidebar, Topbar, ThemeToggle
  types/next-auth.d.ts
docs/                     # deploy + schema notes
Dockerfile                # multi-stage prod build
Dockerfile.dev            # bind-mounted dev build
docker-compose.yml        # local Postgres + web
railway.json              # Railway build + healthcheck
```

## Deploying to Railway

See [`docs/RAILWAY_DEPLOY.md`](docs/RAILWAY_DEPLOY.md).
