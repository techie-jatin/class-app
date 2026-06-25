---
name: Auth & JWT Pattern
description: How auth works — JWT storage, hook quirks, login flow, role routing.
---

# Auth & JWT Pattern

## Storage
- JWT token: `localStorage.getItem("ta_token")`
- User object: `localStorage.getItem("ta_user")` (JSON stringified)
- Keys: `ta_token`, `ta_user`

## Login Flow
1. POST `/api/auth/login` → returns `{ token, user }`
2. Store token + user in localStorage
3. Detect `user.role` → redirect to `/superadmin`, `/admin`, `/faculty`, or `/student`

## `useGetMe` Quirk
The generated `useGetMe` hook has a type mismatch on the `queryKey` option. Use:
```ts
const { data: user } = useGetMe({ queryKey: ["getMe"] } as any);
```
**Why:** Orval-generated options type doesn't exactly match the `queryKey` type required by React Query. The `as any` cast is the accepted workaround until codegen is updated.

## Custom Fetch
`artifacts/trading-academy/src/lib/custom-fetch.ts` auto-injects `Authorization: Bearer <ta_token>` on every API call. No need to manually pass headers.

## JWT Secret
Env var: `SESSION_SECRET`. Fallback: `"trading-academy-secret-key"` for dev. 7-day expiry.

## `ProtectedRoute`
Checks `ta_token` + `ta_user` from localStorage. If missing → redirect to `/login`. If role mismatch → redirect to correct role dashboard. Wraps all role-specific routes.
