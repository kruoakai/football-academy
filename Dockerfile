# syntax=docker/dockerfile:1

# ---------- deps: install dependencies (cached layer) ----------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---------- builder: generate Prisma client + build the app ----------
# Also used as-is (via `docker compose run migrate`) to run
# `prisma migrate deploy`, since the Prisma CLI needs devDependencies
# that are deliberately left out of the slim runner image below.
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

# ---------- runner: minimal production image ----------
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Belt-and-suspenders: the generated Prisma client lives at a custom path
# (src/generated/prisma, not node_modules), and Next's standalone file
# tracer doesn't reliably pick up custom-output generator paths. The
# client code itself gets bundled into the server chunks, but copy the
# source too in case anything resolves it by path at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
