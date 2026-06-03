# Railway Deployment

## Steps

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select this repo
3. Add a **PostgreSQL** plugin to the project
4. Railway auto-detects Node.js and runs `npm run build` then `npm start`
5. Settings → Networking → Generate Domain → get your public URL

## Build & start

- **Build command:** `npm run build`
- **Start command:** `npm run start`
- The app listens on `PORT` (set automatically by Railway)
- **Node.js 20.19+** required (Prisma 7); set via `engines.node` in `package.json` and `.nvmrc`

## Database setup

This app uses two logical databases on a **single Railway Postgres instance**:

1. **Production database** — Railway creates this automatically (usually named `railway`)
2. **Demo database** — create manually on the same instance:

```sql
CREATE DATABASE aap_demo;
```

Then run migrations against both:

```bash
# Production
DATABASE_URL="postgresql://..." npm run db:migrate:deploy

# Demo (after creating aap_demo)
DEMO_MODE=true DEMO_DATABASE_URL="postgresql://.../aap_demo" npm run db:migrate:deploy
DEMO_MODE=true DEMO_DATABASE_URL="postgresql://.../aap_demo" npm run db:seed
```

The connection strings share the same host, user, and password — only the database name differs.

## Environment variables

| Variable | Production | Demo deployment |
|----------|------------|-----------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/railway` | Same |
| `DEMO_DATABASE_URL` | `postgresql://user:pass@host:5432/aap_demo` | Same |
| `DEMO_MODE` | `false` | `true` |
| `BETTER_AUTH_SECRET` | Random secret (`openssl rand -base64 32`) | Same |
| `BETTER_AUTH_URL` | Your Railway public URL | Same |

Copy [`.env.example`](../.env.example) to `.env.local` for local development.

Prisma 7 does not load `.env.local` automatically. This project uses [`lib/load-env.ts`](../lib/load-env.ts) so `prisma migrate` and `prisma db seed` pick up the same variables as Next.js.

## Reference demo

The original HTML demo is still available at `/index.html` on your deployed domain. The Next.js app serves `/` and all application routes.

When `DEMO_MODE=true`, an orange banner appears at the top: **"You're in demo mode"**.
