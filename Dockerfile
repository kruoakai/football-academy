# syntax=docker/dockerfile:1

# ---------- deps: install dependencies (cached layer) ----------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---------- builder: generate Prisma client + build the app ----------
# Also used as-is (via `docker compose run migrate`) to run
# `prisma migrate deploy`. The runner image below also ends up with the
# Prisma CLI available (it copies node_modules wholesale), but migrations
# stay a separate one-off step so they never run implicitly on app boot.
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `prisma generate` reads DATABASE_URL via prisma.config.ts but doesn't
# need a reachable database — a placeholder avoids a build-time failure.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate
RUN npm run build

# ---------- runner: production image, runs via `next start` ----------
# Deliberately NOT using Next's `output: "standalone"` — that mode breaks
# `next start` outright ("next start does not work with output: standalone
# configuration"), which matters here because the same codebase is also
# deployed without Docker via PM2 running `next start`/`npm start`. Keeping
# one code path (full node_modules + full .next build + `next start`) for
# both Docker and PM2 avoids the two deployment methods silently diverging.
# Bigger image than a true standalone build, but far less fragile.
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# Pre-create the runtime uploads dir with nextjs ownership before it ever gets
# a volume mounted over it (docker-compose.prod.yml mounts a named volume here).
# Without this, Docker initializes a brand-new named volume's mountpoint as
# root:root, and the app (running as the unprivileged `nextjs` user below)
# gets EACCES on every upload — confirmed by testing a fresh volume directly.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
