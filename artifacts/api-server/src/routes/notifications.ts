import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, notificationReadsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activityLogger";

const router = Router();

// GET /notifications (admin view)
router.get("/", requireAuth, requireRole("superadmin", "admin"), async (req, res) => {
  const notifications = await db.select().from(notificationsTable).orderBy(notificationsTable.createdAt);
  res.json(notifications.map(n => ({ ...n, isRead: false })));
});

// POST /notifications
router.post("/", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const { title, message, imageUrl, target } = req.body;
  const [notif] = await db.insert(notificationsTable).values({ title, message, imageUrl: imageUrl ?? null, target, sentById: req.user!.id }).returning();
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "SEND_NOTIFICATION", `Sent notification: ${title} to ${target}`);
  res.status(201).json({ ...notif, isRead: false });
});

// GET /notifications/my
router.get("/my", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { unreadOnly } = req.query as Record<string, string>;
  const role = req.user!.role;
  const allNotifs = await db.select().from(notificationsTable);

  // Filter by target
  const applicable = allNotifs.filter(n =>
    n.target === "all" ||
    (n.target === "students" && role === "student") ||
    (n.target === "faculty" && role === "faculty")
  );

  // Get read receipts
  const reads = await db.select().from(notificationReadsTable).where(eq(notificationReadsTable.userId, req.user!.id));
  const readIds = new Set(reads.map(r => r.notificationId));

  const withRead = applicable.map(n => ({ ...n, isRead: readIds.has(n.id) }));
  const result = unreadOnly === "true" ? withRead.filter(n => !n.isRead) : withRead;
  res.json(result);
});

// PATCH /notifications/:id/read
router.patch("/:id/read", requireAuth, async (req: AuthenticatedRequest, res) => {
  const notifId = parseInt(req.params.id as string);
  const existing = await db.select().from(notificationReadsTable)
    .where(and(eq(notificationReadsTable.notificationId, notifId), eq(notificationReadsTable.userId, req.user!.id)))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(notificationReadsTable).values({ notificationId: notifId, userId: req.user!.id });
  }
  res.json({ success: true });
});

export default router;
