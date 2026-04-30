# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **`@workspace/api-server`** — Express 5 + Drizzle API for the CARE Triage product. Mounted at `/api`.
- **`@workspace/vet-triage`** — React + Vite staff/client UI for "CARE Triage" (carevet.com.au veterinary clinic).
- **`@workspace/mockup-sandbox`** — design preview server for canvas iframes.

## CARE Triage product notes

- **Branding**: secondary CARE brandmark at `artifacts/vet-triage/public/brand/care-logo.png`. Palette tokens: Kelly Green `#2AB573`, Charcoal `#333234`, Tangerine `#F25928`, Pistachio `#C4F7CE`. No emojis.
- **Auth**: Clerk. Both server (`requireAuth` middleware) and client (`StaffGuard`) restrict access to `@carevet.com.au` emails. Non-matching emails get HTTP 403 / "Access restricted" page. Admin user: `admin@carevet.com.au`.
- **Queue ordering**: staff dashboard supports drag-to-reorder via `@dnd-kit/core` + `@dnd-kit/sortable`. The `POST /patients/reorder` endpoint runs in a `SERIALIZABLE` transaction, requires the submitted IDs to exactly match the current active set, and returns `409` (mapped to a "queue changed, please refresh" toast) on conflict — including PostgreSQL `40001` serialization failures from concurrent active-queue mutations. Frontend ignores overlapping reorder mutations while one is in flight (`reorderMut.isPending`).
- **Hover card**: patient names in the dashboard show an "Additional notes" hover card with a `StickyNote` indicator when notes exist.
