import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, coursesTable, batchesTable, notificationsTable,
  lecturesTable, liveClassesTable, notesTable, certificatesTable,
  activityLogsTable, deviceSessionsTable, securityEventsTable, courseAccessTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// GET /dashboard/stats (admin/superadmin)
router.get("/stats", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const totalStudents = await db.$count(usersTable, eq(usersTable.role, "student"));
  const totalFaculty = await db.$count(usersTable, eq(usersTable.role, "faculty"));
  const totalCourses = await db.$count(coursesTable);
  const totalBatches = await db.$count(batchesTable);
  const totalNotifications = await db.$count(notificationsTable);
  const pendingApprovals = await db.$count(usersTable, eq(usersTable.status, "pending"));
  const blockedUsers = await db.$count(usersTable, eq(usersTable.status, "blocked"));
  const activeCourses = await db.$count(coursesTable, eq(coursesTable.status, "active"));
  const totalAdmins = await db.$count(usersTable, eq(usersTable.role, "admin"));

  res.json({ totalStudents, totalFaculty, totalCourses, totalBatches, totalNotifications, pendingApprovals, blockedUsers, activeCourses, totalAdmins });
});

// GET /dashboard/student-stats
router.get("/student-stats", requireAuth, requireRole("student"), async (req: AuthenticatedRequest, res) => {
  const now = new Date().toISOString();
  const access = await db.select().from(courseAccessTable).where(eq(courseAccessTable.studentId, req.user!.id));
  const enrolledCourses = access.length;
  const courseIds = access.map(a => a.courseId);

  const allLiveClasses = await db.select().from(liveClassesTable);
  const upcomingLiveClasses = allLiveClasses.filter(c => courseIds.includes(c.courseId) && c.scheduledAt >= now).length;
  const totalLectures = await db.$count(lecturesTable);
  const totalNotes = await db.$count(notesTable);
  const totalCertificates = await db.$count(certificatesTable, eq(certificatesTable.studentId, req.user!.id));
  const unreadNotifications = 0;

  res.json({ enrolledCourses, upcomingLiveClasses, totalLectures, totalNotes, totalCertificates, unreadNotifications });
});

// GET /dashboard/faculty-stats
router.get("/faculty-stats", requireAuth, requireRole("faculty"), async (req: AuthenticatedRequest, res) => {
  const now = new Date().toISOString();
  const assignedCourses = await db.$count(coursesTable, eq(coursesTable.facultyId, req.user!.id));
  const uploadedLectures = await db.$count(lecturesTable, eq(lecturesTable.facultyId, req.user!.id));
  const allLiveClasses = await db.select().from(liveClassesTable).where(eq(liveClassesTable.facultyId, req.user!.id));
  const upcomingLiveClasses = allLiveClasses.filter(c => c.scheduledAt >= now).length;
  const uploadedNotes = await db.$count(notesTable, eq(notesTable.facultyId, req.user!.id));
  const unreadNotifications = 0;

  res.json({ assignedCourses, uploadedLectures, upcomingLiveClasses, uploadedNotes, unreadNotifications });
});

// GET /dashboard/recent-activity
router.get("/recent-activity", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const limitNum = Math.min(50, parseInt((req.query.limit as string) ?? "20"));
  const logs = await db.select().from(activityLogsTable).limit(limitNum).orderBy(activityLogsTable.createdAt);
  res.json(logs);
});

// GET /dashboard/security-events
router.get("/security-events", requireAuth, requireRole("superadmin"), async (req, res) => {
  const failedLoginAttempts = await db.$count(securityEventsTable, eq(securityEventsTable.eventType, "failed_login"));
  const recentLoginLogs = await db.select().from(activityLogsTable)
    .where(eq(activityLogsTable.action, "LOGIN")).limit(10).orderBy(activityLogsTable.createdAt);
  const blockedUsers = await db.select().from(usersTable).where(eq(usersTable.status, "blocked"));
  const deviceChanges = await db.$count(securityEventsTable, eq(securityEventsTable.eventType, "device_change"));

  res.json({
    failedLoginAttempts,
    recentLogins: recentLoginLogs,
    blockedUsers: blockedUsers.map(({ passwordHash: _, ...u }) => u),
    deviceChanges,
  });
});

export default router;
