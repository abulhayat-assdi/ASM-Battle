# syntax=docker/dockerfile:1

# ---------- deps: install node_modules (+ prisma client via postinstall) ----------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
# prisma schema is copied before `npm ci` so the `postinstall` (prisma generate) works
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---------- builder: build the Next.js app ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `npm run build` = prisma generate && next build
RUN npm run build

# ---------- runner: production image ----------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# On every start: sync the schema to Postgres, ensure the seed admin exists, then run Next.
# Both prisma db push and the seed (upsert) are idempotent, so this is safe to re-run.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node prisma/seed.mjs && npm run start"]
