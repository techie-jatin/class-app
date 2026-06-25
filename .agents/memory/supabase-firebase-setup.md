---
name: Supabase & Firebase Integration
description: How Supabase is connected as the database and Firebase is initialized in the frontend.
---

# Supabase & Firebase Setup

## Supabase Database Connection

**Why:** The Replit-provisioned DATABASE_URL resolves only to IPv6, so an external Supabase DB is used instead.

**Connection URL:** Must be the **Session Pooler** URL (port 5432) or **Transaction Pooler** (port 6543).
- Direct connection host (`db.[ref].supabase.co:5432`) resolves only to IPv6 — unreachable from Replit.
- Pooler host (`aws-1-ap-southeast-1.pooler.supabase.com:6543`) resolves to IPv4 — works.

**Secret key:** `SUPABASE_DATABASE_URL` — read before `DATABASE_URL` in `lib/db/src/index.ts`.

**SSL:** Supabase poolers use a self-signed cert chain. `ssl: { rejectUnauthorized: false }` is required — the connection is still TLS-encrypted.

**Password special chars:** Password contains `/`, `+`, `!`. `new URL()` and `pg`'s built-in parser both fail. Use the manual regex parser in `lib/db/src/index.ts` (`buildPoolConfig`) which passes raw password bytes directly to pg connection params, avoiding any URL-decode ambiguity.

**Drizzle config:** `lib/db/drizzle.config.ts` uses `encodePasswordInUrl()` to percent-encode the password before passing the URL to drizzle-kit. Detects already-encoded passwords (`/%[0-9A-Fa-f]{2}/`) to avoid double-encoding.

**How to apply:** Any time DATABASE_URL is referenced in db/config code, check for SUPABASE_DATABASE_URL first. Never call `new URL()` on these connection strings — use `buildPoolConfig()`.

## Firebase

**Initialized in:** `artifacts/trading-academy/src/lib/firebase.ts` — imported from `main.tsx` so analytics starts on app boot.

**Config env vars (all set as shared VITE_ env vars):**
- `VITE_FIREBASE_API_KEY` — secret
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

Firebase project: `application-7f61f`, region `ap-southeast-1`.

## Seed

Full seed at `scripts/src/seedSupabase.mjs` — connects to Supabase pooler via parsed URL params (not raw connection string). Run with `SUPABASE_DATABASE_URL=$SUPABASE_DATABASE_URL node scripts/src/seedSupabase.mjs` from workspace root. Uses absolute pnpm-store paths for bcryptjs and pg imports (no package.json in scripts/ for these deps).
