# Admin Autopilot — SMSF Platform

Next.js application for the AAP SMSF administration platform.

## Features

- Client onboarding wizard (5 steps)
- Staff portal with stage management (`(main)` route group — clean URLs)
- Stage ownership & handoff workflow
- Staff profiles (visible to clients)
- Company groups / referrer tracking
- KYC management
- Document management (by year + type)
- File notes with 3CX/Echo Notes integration (simulated)
- Digital signature pad
- Client portal
- PostgreSQL schema (see `/docs`) — step 2

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/onboard`).

The original single-file demo remains at [http://localhost:3000/index.html](http://localhost:3000/index.html) for reference.

## Demo accounts

- sarah@aap.com.au / demo123 (Master Owner)
- emma@aap.com.au / demo123 (Bookkeeper)
- michael@aap.com.au / demo123 (Compliance)

Use quick-pick buttons on `/login`.

## Routes

| Area | Paths |
|------|--------|
| Onboarding | `/onboard` |
| Staff login | `/login` |
| Staff app | `/dashboard`, `/clients`, `/clients/[id]`, `/companies`, `/preparation`, `/compliance`, `/lodgement`, `/kyc`, `/users`, `/notifications`, `/audit-log` |
| Client portal | `/portal`, `/portal/team`, `/portal/actions`, `/portal/documents`, `/portal/messages` |

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Radix primitives)
- Zustand (mock state, persisted to localStorage)

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server (uses `PORT` env var)

## Deployment

See [docs/RAILWAY_DEPLOY.md](docs/RAILWAY_DEPLOY.md).
