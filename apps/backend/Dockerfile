FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

# Install dependencies (cached until a package.json or the lockfile changes)
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
RUN pnpm install --frozen-lockfile

# Runtime: reuse the installed dependencies, add the source and generate the
# Prisma client. The app is run with tsx so the TypeScript workspace packages
# (@reviewsphere/db, @reviewsphere/types) and the generated client resolve directly.
FROM deps AS runner
ENV NODE_ENV=production
COPY . .
RUN pnpm --filter @reviewsphere/db db:generate

WORKDIR /app/apps/backend
EXPOSE 3001
CMD ["pnpm", "exec", "tsx", "src/index.ts"]
