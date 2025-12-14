# ====================================
# 1. Base Image
# ====================================
FROM oven/bun:1 AS base
WORKDIR /app

# ====================================
# 2. Install Dependencies (Cached)
# ====================================
FROM base AS deps
COPY package.json bun.lock ./

# Use BuildKit cache for much faster installs
RUN --mount=type=cache,target=/root/.bun \
    bun install --frozen-lockfile

# ====================================
# 3. Build Stage
# ====================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env variables
ARG API_BASE
ENV API_BASE=$API_BASE
ARG APP_BASE
ENV APP_BASE=$APP_BASE

RUN bun run build

# ====================================
# 4. Runtime Stage
# ====================================
FROM oven/bun:1-slim AS release
WORKDIR /app

# Only copy needed files
COPY --from=builder /app/.output ./.output
COPY package.json bun.lock ./

# Install ONLY prod dependencies (cached!)
RUN --mount=type=cache,target=/root/.bun \
    bun install --production --frozen-lockfile

# App Runtime
USER bun
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
