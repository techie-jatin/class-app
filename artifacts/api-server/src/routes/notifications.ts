import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, notificationReadsTable, courseAccessTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activityLogger";

const router = Router();

// GET /notifications (admin view — newest first)
router.get("/", requireAuth, requireRole("superadmin", "admin"), async (req, res) => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt));
  res.json(notifications.map(n => ({ ...n, isRead: false })));
});

// POST /notifications
router.post("/", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const { title, message, imageUrl, target } = req.body;
  const [notif] = await db
    .insert(notificationsTable)
    .values({ title, message, imageUrl: imageUrl ?? null, target, sentById: req.user!.id })
    .returning();
  await logActivity(
    req.user!.id,
    req.user!.fullName,
    req.user!.role,
    "SEND_NOTIFICATION",
    `Sent notification: "${title}" to ${target}`
  );
  res.status(201).json({ ...notif, isRead: false });
});

// GET /notifications/my
router.get("/my", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { unreadOnly } = req.query as Record<string, string>;
  const role = req.user!.role;
  const userId = req.user!.id;

  const allNotifs = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt));

  // Pre-fetch enrolled course IDs for students (avoids N+1)
  let enrolledCourseIds = new Set<number>();
  if (role === "student") {
    const access = await db
      .select()
      .from(courseAccessTable)
      .where(eq(courseAccessTable.studentId, userId));
    enrolledCourseIds = new Set(access.map(a => a.courseId));
  }

  const applicable = allNotifs.filter(n => {
    if (n.target === "all") return true;
    if (n.target === "students" && role === "student") return true;
    if (n.target === "faculty" && role === "faculty") return true;
    if (n.target.startsWith("course:")) {
      const courseId = parseInt(n.target.split(":")[1]);
      return role === "student" && enrolledCourseIds.has(courseId);
    }
    if (n.target.startsWith("user:")) {
      const targetUserId = parseInt(n.target.split(":")[1]);
      return targetUserId === userId;
    }
    return false;
  });

  const reads = await db
    .select()
    .from(notificationReadsTable)
    .where(eq(notificationReadsTable.userId, userId));
  const readIds = new Set(reads.map(r => r.notificationId));

  const withRead = applicable.map(n => ({ ...n, isRead: readIds.has(n.id) }));
  const result = unreadOnly === "true" ? withRead.filter(n => !n.isRead) : withRead;
  res.json(result);
});

// PATCH /notifications/:id/read
router.patch("/:id/read", requireAuth, async (req: AuthenticatedRequest, res) => {
  const notifId = parseInt(req.params.id as string);
  const existing = await db
    .select()
    .from(notificationReadsTable)
    .where(and(
      eq(notificationReadsTable.notificationId, notifId),
      eq(notificationReadsTable.userId, req.user!.id)
    ))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(notificationReadsTable).values({
      notificationId: notifId,
      userId: req.user!.id,
    });
  }
  res.json({ success: true });
});

export default router;
