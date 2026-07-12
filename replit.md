# Firebox

A service directory/marketplace app with a React frontend and Express API backend.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from `$PORT`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Required env vars

- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — secret for session signing
- `PORT` — port to listen on (set automatically on Railway and Replit)

## Railway Deployment

Single service — the Express server builds and serves the frontend static files.

**Steps:**
1. Create a new Railway project and connect the GitHub repo
2. Railway auto-detects `railway.toml` / `nixpacks.toml` at the root
3. Set these environment variables in the Railway service dashboard:
   - `DATABASE_URL` — your Postgres connection string (use Railway's Postgres plugin or external DB)
   - `SESSION_SECRET` — a long random string
4. Deploy — Railway runs the build then starts `node artifacts/api-server/dist/index.mjs`
5. The app (frontend + API) is served on a single Railway URL

**How it works:**
- Build: installs pnpm deps → builds Vite frontend (to `artifacts/firebox/dist/public/`) → bundles Express server with esbuild
- Start: Express serves `/api/...` routes and falls back to the React SPA for all other paths
- Health check: `GET /api/healthz`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Frontend: React 19, Vite 7, Tailwind CSS 4
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/firebox/` — React frontend (Vite)
- `artifacts/api-server/` — Express API server
- `lib/db/` — Drizzle ORM schema and client
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/` — generated React Query hooks (from Orval codegen)
- `lib/api-zod/` — generated Zod schemas (from Orval codegen)

## Architecture decisions

- Admin panel is hidden from the UI nav; accessible only at `/#admin` URL
- Frontend is served as static files from the Express server in production (single Railway service, no CORS issues)
- `BASE_PATH` defaults to `/` for production builds; set it explicitly for sub-path deployments

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing the OpenAPI spec, run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks/schemas
- `pnpm --filter @workspace/db run push` applies schema changes to the dev DB only; run it manually against prod `DATABASE_URL` when needed
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
