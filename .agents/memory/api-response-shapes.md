---
name: API Response Shapes
description: Which list endpoints return plain arrays vs wrapped objects — critical for using generated hooks correctly.
---

# API Response Shapes

**Why:** The OpenAPI spec defines different response shapes for different list endpoints. Getting this wrong causes TypeScript errors and runtime `undefined` data.

## Plain Array Responses (`T[]`)
These hooks return the data directly as an array. Use `data?.map(...)` or `data?.length`.

| Hook | Endpoint | Returns |
|---|---|---|
| `useListCourses` | GET /courses | `Course[]` |
| `useListBatches` | GET /batches | `Batch[]` |
| `useListLectures` | GET /lectures | `Lecture[]` |
| `useListLiveClasses` | GET /live-classes | `LiveClass[]` |
| `useListNotes` | GET /notes | `Note[]` |
| `useListCertificates` | GET /certificates | `Certificate[]` |
| `useListNotifications` | GET /notifications | `Notification[]` |
| `useListDeviceSessions` | GET /device-sessions | `DeviceSession[]` |
| `useListSettings` | GET /settings | `SystemSetting[]` |
| `useGetRecentActivity` | GET /dashboard/recent-activity | `ActivityLog[]` |
| `useListAdmins` | GET /admins | `Admin[]` |

## Wrapped Object Responses
These hooks return an object with a nested array plus pagination metadata.

| Hook | Endpoint | Returns |
|---|---|---|
| `useListUsers` | GET /users | `UserList { users: User[], total, page, limit }` |
| `useListActivityLogs` | GET /activity-logs | `ActivityLogList { logs: ActivityLog[], total, page, limit }` |

**How to apply:** When you write frontend code using list hooks, check this file first. Accessing `.users` on a `Course[]` hook or forgetting `.logs` on `ActivityLogList` are the two most common bugs.
