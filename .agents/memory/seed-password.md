---
name: Seed & Password Pattern
description: How to run the seed script and hash passwords in this monorepo environment.
---

# Seed & Password Pattern

## The Problem
`bcryptjs` is installed in the pnpm monorepo but Node module resolution doesn't find it directly when running scripts outside the workspace package context.

## Seed Script
Located at: `artifacts/api-server/src/seed.ts`
Run with: `pnpm --filter @workspace/api-server run seed` (if script exists in package.json) OR directly via `tsx`.

## Demo Credentials (seeded)
| Role | Email | Password |
|------|-------|----------|
| SuperAdmin | superadmin@tradingacademy.com | superadmin123 |
| Admin | admin@tradingacademy.com | admin123 |
| Faculty | john.faculty@tradingacademy.com | faculty123 |
| Faculty | jane.faculty@tradingacademy.com | faculty123 |
| Student | alice@student.com | student123 |
| Student | bob@student.com | student123 |
| Student | carol@student.com | student123 |
| Student | david@student.com | student123 |

## Re-seeding
If you need to re-seed: connect to the DB and truncate all tables first, then run the seed. The seed uses `INSERT` not `INSERT OR IGNORE`, so duplicate keys will error if you seed twice without clearing.
