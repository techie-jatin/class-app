# Trading Academy Learning Platform

A full-stack trading education platform with 4 roles: superadmin, admin, faculty, and student. Bloomberg Terminal-inspired dark UI. Desktop-optimized for staff roles; fully responsive for students.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/trading-academy run dev` — run the frontend (served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + shadcn/ui + Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/api-client-react/src/generated/` — auto-generated hooks (do not edit)
- `lib/db/src/schema/` — Drizzle ORM schema files (users, courses, batches, lectures, etc.)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/trading-academy/src/pages/` — frontend pages by role (superadmin, admin, faculty, student)
- `artifacts/trading-academy/src/hooks/useAuth.ts` — auth state: JWT in `ta_token`, user in `ta_user` localStorage

## Architecture decisions

- **Contract-first API**: OpenAPI spec drives all generated hooks and Zod schemas. Edit `openapi.yaml` → run codegen → use generated hooks.
- **JWT auth**: Token stored in `localStorage` as `ta_token`. All API calls include it via `custom-fetch.ts`.
- **4 role layouts**: Separate `SuperAdminLayout`, `AdminLayout`, `FacultyLayout`, `StudentLayout` with role-gated `ProtectedRoute`.
- **No Firebase/Supabase**: Uses existing monorepo stack only (Express + Drizzle + PostgreSQL).
- **Array-direct API responses**: List endpoints return plain arrays (not `{ items: [] }` wrappers).

## Demo Credentials

| Role       | Email                              | Password       |
|------------|------------------------------------|----------------|
| SuperAdmin | superadmin@tradingacademy.com      | superadmin123  |
| Admin      | admin@tradingacademy.com           | admin123       |
| Faculty    | john.faculty@tradingacademy.com    | faculty123     |
| Student    | alice@student.com                  | student123     |

## Product

- **SuperAdmin**: Manage admins, all users, courses, batches, device sessions, security events, activity logs, notifications, system settings
- **Admin**: Manage students, faculty, courses, batches, certificates, notifications, activity logs
- **Faculty**: View assigned courses, manage lectures (YouTube embed), schedule live classes, upload notes
- **Student**: Access enrolled courses with YouTube lecture player, join live classes, download notes/certificates, view notifications, manage profile

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any change to `openapi.yaml`.
- Password seeding uses bcrypt; seed script at `artifacts/api-server/src/seed.ts` (run from api-server context).
- The `settings` route uses `await import("drizzle-orm")` dynamically to avoid circular issues.
- All routes use `/api` base path via the Replit proxy; frontend hooks auto-prepend this.
- `useGetMe` requires `queryKey` in its query options — pass `queryKey: ["getMe"]` or use `as any`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
