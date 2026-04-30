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
- **Queue ordering**: staff dashboard supports drag-to-reorder via `@dnd-kit/core` + `@dnd-kit/sortable`. The `POST /patients/reorder` endpoint runs in a `SERIALIZABLE` transaction, requires the submitted IDs to exactly match the current *waiting* set (active patients excluding any currently in consult), and returns `409` (mapped to a "queue changed, please refresh" toast) on conflict — including PostgreSQL `40001` serialization failures from concurrent waiting-queue mutations. Frontend ignores overlapping reorder mutations while one is in flight (`reorderMut.isPending`).
- **Patient row actions**: each row in the staff dashboard has a dropdown with Edit, "Mark in consult" / "End consult" (toggle based on `inConsult`), and "Departed" (destructive, soft-removes via the existing `DELETE /patients/:id`). In-consult patients render with a pistachio-tinted card, an "In consult" pill badge, and a disabled drag handle so they can't be reordered; they're rendered above the sortable waiting list and excluded from `/public/queue` and `/triage/summary`. Start-consult, mark-seen, and departed all run in serializable transactions and atomically decrement the consultation order of any waiting patients behind the removed one — so the next person in line is always promoted to position 1 without manual reordering. All three handlers translate `40001` into `409`.
- **Hover card**: patient names in the dashboard show an "Additional notes" hover card with a `StickyNote` indicator when notes exist.
- **Public client display (`/display`)**: hides individual patient wait times. Shows an overall "Avg. wait" stat in the header (`PublicQueue.averageWaitMinutes`, rounded across the waiting set, `—` when empty). Each queue row is colour-coded by triage class via a thick left bar, a coloured ring around the position number, and a coloured dot + label below the patient's name (uses the existing `--triage-{red,orange,yellow,green,blue}` CSS vars). The hero "Next to be seen" card shows the triage label as a pill instead of a wait estimate. `PublicQueueEntry.triageClass` and `PublicQueue.averageWaitMinutes` are required fields in the OpenAPI contract.
