---
name: Admin Role Filter Bug
description: Original users route bug that forced admins to only see students; fix and why.
---

# Admin Role Filter Bug

## The Bug
Original `artifacts/api-server/src/routes/users.ts` had:
```ts
if (req.user!.role === "admin") {
  conditions.push(eq(usersTable.role, role as any ?? "student"));
}
```
When admin makes `GET /users` with no `role` query param, this added `role = "student"` to conditions. This meant admins could never see faculty users without explicitly filtering by `role=faculty`.

## The Fix
Replaced with `inArray` — when admin and no specific role filter given, show both student and faculty:
```ts
if (req.user!.role === "admin") {
  if (role) {
    // specific role filter already added above — no-op, but ensure only student/faculty
    if (role !== "student" && role !== "faculty") {
      res.status(403).json({ error: "Forbidden" }); return;
    }
  } else {
    // no role filter — admin sees student + faculty only (not superadmin/admin)
    conditions.push(inArray(usersTable.role, ["student", "faculty"]));
  }
}
```

**Why:** Admins should manage students AND faculty, not just students. Superadmins remain hidden from admin view.
**How to apply:** Any future route that scopes admin access should use `inArray` not a role default.
