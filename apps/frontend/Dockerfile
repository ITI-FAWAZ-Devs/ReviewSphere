FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/types/package.json ./packages/types/package.json
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY . .
RUN pnpm --filter @reviewsphere/frontend build

# Serve the built app with Vite's preview server
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend ./apps/frontend
COPY --from=builder /app/packages/types ./packages/types

WORKDIR /app/apps/frontend
EXPOSE 4173
CMD ["pnpm", "exec", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
