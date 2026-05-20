# Railway Deployment — SMSF Echo

The Railway service `aap-smsf-platform-production` auto-builds + deploys whenever `main` advances on GitHub. The service was created against the same repo back when it was a static HTML mockup, so the GitHub linkage already exists — no need to re-connect.

## First-time setup (one-off)

1. **Add a Postgres plugin** to the Railway project if one isn't there yet. The plugin will inject a `DATABASE_URL` env var into the web service automatically.
2. **Set service env vars** on the web service (Settings → Variables):
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `AUTH_URL` — `https://aap-smsf-platform-production.up.railway.app`
   - `AUTH_TRUST_HOST` — `true`
   - `NODE_ENV` — `production`
   - (Optional) `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Leave `PORT` unset — Railway injects it.
3. **Build configuration** — Railway uses `railway.json` at the repo root:
   - Builder: Nixpacks (detects Node from `package.json`)
   - Build command: `npm ci && npx prisma generate && npm run build`
   - Start command: `npm run start:prod` (runs `prisma migrate deploy` then `next start`)
   - Healthcheck: `GET /api/health` returning HTTP 200 within 180s
4. If Nixpacks misdetects the build, point Railway at the `Dockerfile` instead by setting `RAILWAY_DOCKERFILE_PATH=Dockerfile` in the service variables.

## Pushing a change

```bash
git checkout main
git pull
# ...edits...
git commit -am "..."
git push
```

Railway detects the push, kicks off a build, and only swaps the running revision once the new healthcheck passes. If the migration fails, the deploy rolls back — your previous version stays live.

## Verifying after a deploy

```bash
curl https://aap-smsf-platform-production.up.railway.app/api/health
# → {"status":"healthy"}
```

Then sign in on the live URL.

## Persistent storage

For uploaded documents (signatures, ID copies), attach a Railway Volume to the web service mounted at `/data`, and set `UPLOAD_DIR=/data/uploads`. The Dockerfile already runs as root so the mount stays writable.
