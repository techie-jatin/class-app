---
name: Trading Academy Platform — Progress Tracker
description: Detailed step-by-step log of every task completed and remaining for the Trading Academy Learning Platform.
---

# Trading Academy — Full Build Progress Tracker
Last updated: 2026-06-25

---

## ✅ COMPLETED STEPS

### PHASE 1 — Project Foundation
- [x] **Monorepo structure** — pnpm workspaces with `artifacts/api-server`, `artifacts/trading-academy`, `lib/db`, `lib/api-spec`, `lib/api-client-react` packages
- [x] **TypeScript config** — `tsconfig.base.json` (shared strict defaults), `tsconfig.json` (root solution for libs), composite builds for lib packages
- [x] **Tailwind + shadcn/ui** — Bloomberg Terminal dark theme; full component set installed (accordion, alert, avatar, badge, button, card, calendar, carousel, chart, checkbox, command, context-menu, dialog, drawer, dropdown-menu, form, input, label, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, skeleton, slider, switch, table, tabs, textarea, toast, toggle, tooltip)
- [x] **Custom theme** — dark amber/orange primary (#f59e0b), dark background (#0a0a0a), muted green for secondary accents; applied in `globals.css` and `tailwind.config.ts`
- [x] **Vite + React** — SPA with Wouter router; `custom-fetch.ts` auto-injects `Authorization: Bearer <ta_token>` on all API calls; BASE_URL from env

### PHASE 2 — Database Schema
- [x] **PostgreSQL schema pushed** — all 12 tables in Drizzle ORM:
  - `users` — id, email, passwordHash, fullName, role (superadmin/admin/faculty/student), status (pending/active/blocked/rejected), mobileNumber, profilePhoto, dateOfBirth, gender, address, occupation, interestedCourse, qualification, experience, expertise, createdAt, updatedAt
  - `courses` — id, title, description, shortDescription, facultyId, thumbnailUrl, status (draft/active/archived), category, level, duration, createdAt, updatedAt
  - `batches` — id, name, courseId, startDate, endDate, maxStudents, status, createdAt, updatedAt
  - `lectures` — id, courseId, facultyId, title, description, youtubeUrl, duration, order, isPublished, createdAt
  - `live_classes` — id, courseId, facultyId, title, description, meetLink, scheduledAt, duration, status, createdAt
  - `notes` — id, courseId, facultyId, title, fileUrl, description, createdAt
  - `certificates` — id, studentId, courseId, issuedAt, certificateUrl, createdAt
  - `notifications` — id, title, message, targetRole, targetUserId, isRead, createdAt
  - `activity_logs` — id, userId, userName, userRole, action, description, ipAddress, createdAt
  - `device_sessions` — id, userId, deviceFingerprint, userAgent, ipAddress, lastSeen, isActive, createdAt
  - `system_settings` — id, key, value, description, updatedAt
  - `security_events` — id, eventType, userId, description, ipAddress, createdAt
  - `course_access` — id, studentId, courseId, enrolledAt, batchId

### PHASE 3 — Database Seeding
- [x] **Seed script** at `artifacts/api-server/src/seed.ts`
  - SuperAdmin: `superadmin@tradingacademy.com` / `superadmin123` (id=1)
  - Admin: `admin@tradingacademy.com` / `admin123` (id=2)
  - Faculty: `john.faculty@tradingacademy.com` / `faculty123` (id=3)
  - Faculty: `jane.faculty@tradingacademy.com` / `faculty123` (id=4)
  - Students: alice@student.com, bob@student.com, carol@student.com, david@student.com / `student123` each
  - 4 courses (Technical Analysis, Options Trading, Algo Trading, Risk Management)
  - 3 batches linked to courses
  - 4 lectures with YouTube embed URLs
  - 3 live classes with Google Meet links
  - 3 system notifications
  - System settings (platform name, support email, max devices, registration toggle)
  - Course access records linking students to courses

### PHASE 4 — OpenAPI Spec + Codegen
- [x] **OpenAPI spec** at `lib/api-spec/openapi.yaml` — contract-first; all schemas defined
  - Schemas: User, UserList, Course, Batch, Lecture, LiveClass, Note, Certificate, Notification, ActivityLog, ActivityLogList, SecurityEvents, DashboardStats, FacultyDashboardStats, StudentDashboardStats, SystemSetting, DeviceSession, Admin
  - Endpoints: auth (login, register, me, updateProfile), users (CRUD + status + resetDevice), admins (CRUD), courses (CRUD), batches (CRUD), lectures (CRUD), liveClasses (CRUD), notes (CRUD), certificates (CRUD), notifications (CRUD), activityLogs (list), deviceSessions (list, revoke), settings (list, update), dashboard (stats, studentStats, facultyStats, recentActivity, securityEvents)
- [x] **Codegen** — `pnpm --filter @workspace/api-spec run codegen` generates React Query hooks + Zod schemas in `lib/api-client-react/src/generated/`
- [x] **API client** — barrel exports from `lib/api-client-react/src/index.ts`; all hooks exported

### PHASE 5 — API Server (Express 5)
- [x] **Server entrypoint** — `artifacts/api-server/src/index.ts` — Express with helmet, CORS, JSON body parsing; all route modules mounted at `/api` prefix
- [x] **Auth middleware** — `requireAuth` (JWT verify), `requireRole(...roles)` — in `middlewares/auth.ts`
- [x] **Activity logger** — `lib/activityLogger.ts` — logs to `activity_logs` table
- [x] **Route files** (16 total):
  - `auth.ts` — POST /login (bcrypt compare, JWT sign), POST /register (create user with status=pending), GET /me (return current user), PATCH /me (update own profile)
  - `users.ts` — GET / (list with role/status/search filters, pagination), GET /:id, PATCH /:id, DELETE /:id (superadmin only), PATCH /:id/status, POST /:id/reset-device
  - `admins.ts` — CRUD for admin users (superadmin only)
  - `courses.ts` — CRUD; GET / returns Course[]
  - `batches.ts` — CRUD; GET / returns Batch[]
  - `lectures.ts` — CRUD; GET / returns Lecture[]
  - `liveClasses.ts` — CRUD; GET / returns LiveClass[]
  - `notes.ts` — CRUD; GET / returns Note[]
  - `certificates.ts` — CRUD; GET / returns Certificate[]
  - `notifications.ts` — CRUD; GET / returns Notification[]
  - `activityLogs.ts` — GET / returns ActivityLogList { logs, total, page, limit }
  - `deviceSessions.ts` — GET / returns DeviceSession[], DELETE /:id (revoke)
  - `settings.ts` — GET / returns SystemSetting[], PATCH /:key (update value); uses dynamic `await import("drizzle-orm")` to avoid circular imports
  - `dashboard.ts` — GET /stats (admin+superadmin), GET /student-stats, GET /faculty-stats, GET /recent-activity, GET /security-events
  - `health.ts` — GET /healthz
  - `index.ts` — router aggregator
- [x] **Workflow** — API Server workflow configured, running on port 8080, served at `/api` path

### PHASE 6 — Frontend Pages

#### Auth Pages
- [x] **Login** (`src/pages/auth/login.tsx`) — Split-panel Bloomberg Terminal design; JWT stored on success; redirects to role dashboard
- [x] **Register** (`src/pages/auth/register.tsx`) — Multi-step form with role-specific fields (student: DOB, gender, occupation, interestedCourse; faculty: qualification, experience, expertise); success state shows "pending approval" message

#### SuperAdmin Portal (9 pages)
- [x] **SuperAdminLayout** — Fixed sidebar with logo, nav links (Dashboard, Users, Admins, Courses, Batches, Devices, Security, Activity Logs, Notifications, Settings); top bar with user avatar; Bloomberg Terminal styling
- [x] **Dashboard** (`superadmin/dashboard.tsx`) — Stats grid (students, faculty, admins, active courses); recent activity feed; security overview panel with failed logins, blocked users, device changes
- [x] **Users** (`superadmin/users.tsx`) — Full user table with role/status filters + search; approve/reject/block/unblock actions; uses `useListUsers` → `UserList { users[], total, page, limit }`
- [x] **Admins** (`superadmin/admins.tsx`) — Admin management; create/delete admins
- [x] **Courses** (`superadmin/courses.tsx`) — Course list with status badges; view/edit/delete
- [x] **Batches** (`superadmin/batches.tsx`) — Batch list with course association; status management
- [x] **Device Management** (`superadmin/device-management.tsx`) — Active device sessions; revoke session capability
- [x] **Security Center** (`superadmin/security.tsx`) — Failed login count, device changes count, blocked users list, recent suspicious logins; uses `useGetSecurityEvents`
- [x] **Activity Logs** (`superadmin/activity-logs.tsx`) — Full audit log table with role filter; uses `useListActivityLogs` → `ActivityLogList { logs[], total }`
- [x] **Notifications** (`superadmin/notifications.tsx`) — Send platform-wide or role-targeted notifications
- [x] **Settings** (`superadmin/settings.tsx`) — System settings key-value editor

#### Admin Portal (8 pages)
- [x] **AdminLayout** — Sidebar with nav (Dashboard, Students, Faculty, Courses, Batches, Certificates, Notifications, Activity Logs)
- [x] **Dashboard** (`admin/dashboard.tsx`) — Stats (students, faculty, pending approvals, courses, batches, notifications); recent activity feed
- [x] **Students** (`admin/students.tsx`) — Student table; approve/reject/block actions; search filter; uses `useListUsers({role:"student"})`
- [x] **Faculty** (`admin/faculty.tsx`) — Faculty table; approve/reject/block; shows expertise field; uses `useListUsers({role:"faculty"})`
- [x] **Courses** (`admin/courses.tsx`) — Course management for admin
- [x] **Batches** (`admin/batches.tsx`) — Batch management for admin
- [x] **Certificates** (`admin/certificates.tsx`) — Issue and list certificates; uses `useListCertificates`
- [x] **Notifications** (`admin/notifications.tsx`) — Send and manage notifications
- [x] **Activity Logs** (`admin/activity-logs.tsx`) — Activity log table (faculty/student filter); uses `useListActivityLogs`

#### Faculty Portal (5 pages)
- [x] **FacultyLayout** — Sidebar with nav (Dashboard, My Courses, Lectures, Live Classes, Study Materials)
- [x] **Dashboard** (`faculty/dashboard.tsx`) — Stats (assigned courses, uploaded lectures, upcoming live classes, uploaded notes, unread notifications); uses `useGetFacultyDashboardStats`
- [x] **Courses** (`faculty/courses.tsx`) — View assigned courses; uses `useListCourses({facultyId})`
- [x] **Lectures** (`faculty/lectures.tsx`) — Manage lectures (add YouTube URL, title, description, order); uses `useListLectures`, `useCreateLecture`
- [x] **Live Classes** (`faculty/live-classes.tsx`) — Schedule live classes with Meet link, date/time; uses `useListLiveClasses`, `useCreateLiveClass`
- [x] **Notes** (`faculty/notes.tsx`) — Upload study notes (URL-based); uses `useListNotes`, `useCreateNote`

#### Student Portal (9 pages)
- [x] **StudentLayout** — Responsive sidebar/bottom-nav; nav (Dashboard, My Courses, Live Classes, Study Materials, Certificates, Notifications, Profile)
- [x] **Dashboard** (`student/dashboard.tsx`) — Stats (enrolled courses, upcoming live classes, total lectures, notes, certificates); uses `useGetStudentDashboardStats`
- [x] **Courses** (`student/courses.tsx`) — Enrolled course cards; uses `useListCourses`
- [x] **Course Detail** (`student/course-detail.tsx`) — Course overview + lecture list with YouTube player; uses `useGetCourse`, `useListLectures`
- [x] **Live Classes** (`student/live-classes.tsx`) — Upcoming live classes with join links; uses `useListLiveClasses`
- [x] **Notes** (`student/notes.tsx`) — Study material downloads; uses `useListNotes`
- [x] **Certificates** (`student/certificates.tsx`) — Earned certificates; uses `useListCertificates`
- [x] **Notifications** (`student/notifications.tsx`) — Platform notifications; uses `useListNotifications`
- [x] **Profile** (`student/profile.tsx`) — Profile editor (name, mobile, address, occupation); avatar display; uses `useGetMe`, `useUpdateMyProfile`

### PHASE 7 — Auth Flow
- [x] **ProtectedRoute** — wraps role-checked routes; redirects to /login if unauthenticated; redirects to correct dashboard if wrong role
- [x] **useAuth hook** — reads JWT from `ta_token`, user from `ta_user` localStorage; `logout()` clears both; uses `useGetMe` with `queryKey: ["getMe"] as any` workaround for generated type
- [x] **App.tsx routing** — Wouter routes for /login, /register, /superadmin/*, /admin/*, /faculty/*, /student/*

### PHASE 8 — Bug Fixes & TypeScript Cleanup (2026-06-25)
- [x] **Array-direct hooks** — Fixed 13+ pages that used `data?.courses`, `data?.batches`, `data?.lectures`, etc. These hooks return plain `T[]` not wrapped objects. Corrected to use `data` (or `data?.map(...)`) directly:
  - superadmin/courses.tsx, superadmin/batches.tsx, admin/courses.tsx, admin/batches.tsx, faculty/courses.tsx, faculty/lectures.tsx, faculty/live-classes.tsx, faculty/notes.tsx, student/courses.tsx, student/course-detail.tsx, student/live-classes.tsx, student/notes.tsx, student/certificates.tsx
- [x] **Wrapped object hooks** — Confirmed `useListUsers` → `UserList { users[], total }` and `useListActivityLogs` → `ActivityLogList { logs[], total }` — pages correctly use `data?.users` and `data?.logs`
- [x] **TypeScript typecheck** — `pnpm run typecheck` passes clean (0 errors) across all packages
- [x] **Admin users route bug** — Fixed June 25: original code forced `role="student"` for admin requests when no role filter provided; fixed to use `inArray(usersTable.role, ["student", "faculty"])` when admin has no specific role filter
- [x] **Activity log empty state** — Fixed: `data?.logs?.length === 0` was falsy when data undefined; corrected to `(data?.logs?.length ?? 0) === 0`
- [x] **`req.params.id as string` casts** — All route files (`users.ts`, `liveClasses.ts`, `notes.ts`, `notifications.ts`, `courses.ts`, `batches.ts`, `lectures.ts`, `certificates.ts`, `admins.ts`, `deviceSessions.ts`) — Express 5 types `req.params[key]` can be `string | string[]`; added `as string` cast to all `parseInt(req.params.id)` calls
- [x] **seed.ts excluded from typecheck** — `src/seed.ts` excluded from api-server tsconfig; `seedPasswords.ts` excluded from scripts tsconfig — these one-time utilities import `pg` directly which has no types in the workspace, but are not part of production build

### PHASE 9 — Feature Completions (2026-06-25)
- [x] **Interactive course-detail YouTube player** — `student/course-detail.tsx` rewritten: `useState(selectedLectureIdx)` drives player iframe (key prop forces re-render on change); clickable sidebar lecture list highlights active; Previous/Next buttons; YouTube thumbnail fallback
- [x] **Note download links in course-detail** — "View" (ExternalLink) and "Download" buttons using `note.driveViewUrl`; proper fallback when no URL
- [x] **SuperAdmin Admins page — Create Admin dialog** — Full dialog form (fullName, email, mobileNumber, password) using `useCreateAdmin`; plus Block/Unblock actions using `useUpdateUserStatus`
- [x] **Admin Courses page — Create Course dialog** — Dialog with name, description, faculty selector (from `useListUsers({role:"faculty", status:"active"})`), status dropdown; uses `useCreateCourse`; added studentCount column to table
- [x] **Faculty Live Classes — Schedule Class dialog** — Dialog with title, description, course selector, datetime-local, meet link; uses `useCreateLiveClass` with ISO scheduledAt
- [x] **Faculty Lectures — Upload Lecture dialog** — Dialog with title, description, course selector, YouTube URL; extractYoutubeId() helper parses full URL or bare ID; YouTube thumbnail preview via `img.youtube.com/vi/...`; "Watch on YouTube" hover link; uses `useCreateLecture`
- [x] **Faculty Notes — Upload + Delete** — Dialog with fileName, course selector, Google Drive URL; uses `useCreateNote`; added delete button (Trash2) using `useDeleteNote` with confirmation; `getListNotesQueryKey` invalidation

---

## 🔲 REMAINING / TO-DO

### High Priority
- [x] **Student course enrollment filtering** — DONE: `GET /courses` for students filters by `course_access` table (lines 19-24 in courses.ts); returns only enrolled courses
- [x] **Interactive YouTube lecture player** — DONE: course-detail fully interactive with lecture index state
- [x] **Faculty course auto-filtering** — DONE: API auto-filters by `facultyId = req.user.id` for faculty role
- [ ] **Certificate download** — Certificates page shows cards but no actual PDF; `certificateUrl` field exists in schema but no generation logic; need certificate PDF generation or manual URL upload

### Medium Priority
- [ ] **Pagination UI** — Users, activity logs list pages have API pagination (`page`, `limit`, `total`) but frontend shows all results with no Next/Prev controls
- [ ] **Profile photo upload** — Student/faculty profile page has avatar placeholder icon; no image upload yet
- [ ] **Password change** — No "change password" feature in any profile page
- [ ] **Batch enrollment assignment** — Batch management pages exist but no UI to assign students to specific batches
- [ ] **Course search in more pages** — Activity logs page has only role filter; no text/date search
- [ ] **Admin courses page — Edit Course dialog** — Edit button exists but no edit dialog; only create dialog implemented

### Low Priority
- [ ] **Admin batches page — Create Batch dialog** — Similar to courses, "Add Batch" button exists but no dialog
- [ ] **SuperAdmin courses page — Create Course dialog** — Same as admin courses but for superadmin view
- [ ] **SuperAdmin batches page — Create Batch dialog**
- [ ] **Notification mark-as-read for faculty** — Student notifications page has this; faculty portal notifications page may not
- [ ] **Dark/light mode toggle** — Currently hardcoded dark theme

### Nice-to-Have
- [ ] **Student registration approval workflow** — Email/in-app notification to admins when new student registers (currently only status change triggers activity log)
- [ ] **Bulk actions** — Select multiple students for bulk approve/reject
- [ ] **CSV export** — Export user lists or activity logs to CSV
- [ ] **Charts in dashboards** — Line/bar charts for enrollment trends

---

## KEY ARCHITECTURAL DECISIONS

| Decision | Details |
|---|---|
| API response shapes | List endpoints return plain `T[]` EXCEPT: `/users` → `UserList{users,total,page,limit}`, `/activity-logs` → `ActivityLogList{logs,total,page,limit}` |
| Auth | JWT in `ta_token` localStorage; 7-day expiry; signed with `SESSION_SECRET` env var |
| Role routing | Login → detect role → redirect to `/superadmin`, `/admin`, `/faculty`, or `/student` |
| OpenAPI first | Edit `openapi.yaml` → run codegen → use generated hooks. Never edit generated files |
| DB migrations | `pnpm --filter @workspace/db run push` for dev; schema in `lib/db/src/schema/` |
| Settings route | Uses `await import("drizzle-orm")` dynamically to avoid circular dep with `eq` |
| Admin scope | Admin can only see students and faculty (not superadmins or other admins) |
| Student dashboard stats | `useGetStudentDashboardStats` calls `/api/dashboard/student-stats` |
| Faculty dashboard stats | `useGetFacultyDashboardStats` calls `/api/dashboard/faculty-stats` |

---

## DEMO CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| SuperAdmin | superadmin@tradingacademy.com | superadmin123 |
| Admin | admin@tradingacademy.com | admin123 |
| Faculty | john.faculty@tradingacademy.com | faculty123 |
| Student | alice@student.com | student123 |
