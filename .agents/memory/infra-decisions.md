---
name: Infrastructure & Auth Decisions
description: User's chosen stack for auth, database, and hosting — replaces all Replit dependencies
---

# Infrastructure Decisions

**Decision date:** 2026-06-26

## Auth
- Google OAuth only (no email/password)
- Implemented via Supabase Auth (handles OAuth flow, issues JWTs)
- No Firebase, no Replit Auth, no custom bcrypt login

## Database
- Supabase PostgreSQL for ALL data: users, profiles, roles, courses, batches, lectures, notes, certificates, notifications, activity, etc.
- Drizzle ORM stays as the query layer (pointed at Supabase DB)
- User roles (`superadmin`, `admin`, `faculty`, `student`) stored in `profiles` table linked to `auth.users`

## Hosting (target)
- Project will be hosted live on the internet (not on Replit)
- Frontend: static build (Vite) → recommended Vercel or Netlify
- Backend: Node/Express → recommended Railway or Render
- Database: Supabase (already hosted)

## Replit dependencies to remove
- `@replit/vite-plugin-cartographer`
- `@replit/vite-plugin-dev-banner`
- `@replit/vite-plugin-runtime-error-modal`
- Replit DB (`DATABASE_URL` from Replit secrets) → replaced by Supabase `DATABASE_URL`
- `REPL_ID` environment checks in Vite config

## Backend JWT verification
- Verify Supabase-issued JWTs using `SUPABASE_JWT_SECRET` (found in Supabase dashboard → Project Settings → API → JWT Secret)
- Replace `jsonwebtoken` + custom `SESSION_SECRET` with Supabase JWT verification

## Environment variables needed
- `SUPABASE_URL` — project URL (https://xxxx.supabase.co)
- `SUPABASE_ANON_KEY` — public anon key (safe in frontend as VITE_SUPABASE_ANON_KEY)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only secret for admin operations
- `SUPABASE_JWT_SECRET` — for verifying JWTs in Express middleware
- `DATABASE_URL` — Supabase PostgreSQL connection string (pooler URL for serverless)
- Google OAuth: configured inside Supabase dashboard (no separate env vars needed)

**Why:**
User explicitly requested Google OAuth + Supabase, removal of all Replit dependencies, and live internet hosting.
