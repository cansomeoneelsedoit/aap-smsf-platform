# syntax=docker/dockerfile:1.6
# Production multi-stage build for the SMSF Echo Next.js + Prisma app.
# Build:   docker build -t smsf-echo .
# Run:     docker run -p 3001:3001 --env-file .env smsf-echo

ARG NODE_VERSION=22-alpine

# ---------- 1. deps ----------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# ---------- 2. builder ----------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ---------- 3. runner ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat openssl tini \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Run as root so Railway-mounted Volumes (e.g. /data) remain writable.
EXPOSE 3001
ENV PORT=3001
ENTRYPOINT ["/sbin/tini", "--"]
CMD sh -c "mkdir -p \"${UPLOAD_DIR:-./uploads}\" && chmod 777 \"${UPLOAD_DIR:-./uploads}\" && npx prisma migrate deploy && npm run start"
