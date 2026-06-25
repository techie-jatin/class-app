import { Router } from "express";
import { db } from "@workspace/db";
import { deviceSessionsTable, usersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activityLogger";

const router = Router();

router.get("/", requireAuth, requireRole("superadmin"), async (req, res) => {
  const { search } = req.query as Record<string, string>;
  const sessions = await db.select().from(deviceSessionsTable);
  const enriched = await Promise.all(sessions.map(async (s) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, s.userId)).limit(1);
    return {
      id: s.id,
      userId: s.userId,
      userName: user?.fullName ?? "Unknown",
      userEmail: user?.email ?? "",
      userRole: user?.role ?? "",
      deviceFingerprint: s.deviceFingerprint,
      lastLoginAt: s.lastLoginAt.toISOString(),
    };
  }));
  const result = search
    ? enriched.filter(s => s.userName.toLowerCase().includes(search.toLowerCase()) || s.userEmail.toLowerCase().includes(search.toLowerCase()))
    : enriched;
  res.json(result);
});

router.delete("/:id", requireAuth, requireRole("superadmin"), async (req: AuthenticatedRequest, res) => {
  await db.delete(deviceSessionsTable).where(eq(deviceSessionsTable.id, parseInt(req.params.id as string)));
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "REMOVE_DEVICE", `Removed device session ${req.params.id}`);
  res.status(204).send();
});

export default router;
