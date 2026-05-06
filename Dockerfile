# syntax=docker/dockerfile:1.7

# ---------- Build stage ----------
FROM node:24-slim AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app

# Build-time public env for the Vite frontend. These are baked into the bundle.
ARG VITE_CLERK_PUBLISHABLE_KEY=""
ARG VITE_CLERK_PROXY_URL="/api/__clerk"
ARG BASE_PATH="/"

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PROXY_URL=$VITE_CLERK_PROXY_URL
ENV BASE_PATH=$BASE_PATH
# Required by vite.config.ts at build time but unused in static output.
ENV PORT=8080
# NOTE: Do NOT set NODE_ENV=production here — pnpm would skip devDependencies
# (vite, esbuild, typescript, etc.) and the build would fail. NODE_ENV is set
# in the runtime stage instead.

# Install all workspace dependencies (including dev) so we can build.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.base.json tsconfig.json ./
COPY artifacts/api-server/package.json artifacts/api-server/package.json
COPY artifacts/vet-triage/package.json artifacts/vet-triage/package.json
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/package.json
COPY lib/api-client-react/package.json lib/api-client-react/package.json
COPY lib/api-spec/package.json lib/api-spec/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
COPY lib/db/package.json lib/db/package.json
COPY scripts/package.json scripts/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts=false

# Copy the rest of the workspace and build everything.
COPY . .

# Build composite libs, then the api-server bundle and the vet-triage static site.
RUN pnpm run typecheck:libs
RUN pnpm --filter @workspace/api-server run build
RUN pnpm --filter @workspace/vet-triage run build

# ---------- Runtime stage ----------
FROM node:24-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
# Where the API server should look for the built frontend (SPA + assets).
ENV STATIC_DIR=/app/public

# Bundled API server (esbuild output, fully self-contained).
COPY --from=builder /app/artifacts/api-server/dist ./dist
# Built frontend (Vite output).
COPY --from=builder /app/artifacts/vet-triage/dist/public ./public

EXPOSE 8080

CMD ["node", "--enable-source-maps", "dist/index.mjs"]
