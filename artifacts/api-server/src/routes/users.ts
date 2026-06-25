import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, deviceSessionsTable } from "@workspace/db";
import { eq, ilike, and, or, inArray, SQL } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activityLogger";

const router = Router();

// GET /users
router.get("/", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const { role, status, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (role) conditions.push(eq(usersTable.role, role as any));
  if (status) conditions.push(eq(usersTable.status, status as any));
  if (search) conditions.push(or(ilike(usersTable.fullName, `%${search}%`), ilike(usersTable.email, `%${search}%`))!);

  // Admins can only see students and faculty — never superadmins or other admins
  if (req.user!.role === "admin") {
    if (role) {
      // If admin passed a role filter, ensure it's only student or faculty
      if (role !== "student" && role !== "faculty") {
        res.status(403).json({ error: "Forbidden" }); return;
      }
      // The role condition is already added above on line 15; no extra condition needed
    } else {
      // No role filter given — default to showing student + faculty only
      conditions.push(inArray(usersTable.role, ["student", "faculty"]));
    }
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const query = conditions.length > 0 ? and(...conditions) : undefined;

  const allUsers = await db.select().from(usersTable).where(query).limit(limitNum).offset(offset);
  const total = await db.$count(usersTable, query);

  const safeUsers = allUsers.map(({ passwordHash: _, ...u }) => u);
  res.json({ users: safeUsers, total, page: pageNum, limit: limitNum });
});

// GET /users/:id
router.get("/:id", requireAuth, requireRole("superadmin", "admin"), async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parseInt(req.params.id as string))).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

// PATCH /users/:id
router.patch("/:id", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const updates = { ...req.body };
  delete updates.passwordHash;
  delete updates.role;
  delete updates.id;
  const [updated] = await db.update(usersTable).set({ ...updates, updatedAt: new Date() })
    .where(eq(usersTable.id, parseInt(req.params.id as string))).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...safeUser } = updated;
  res.json(safeUser);
});

// DELETE /users/:id
router.delete("/:id", requireAuth, requireRole("superadmin"), async (req: AuthenticatedRequest, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, parseInt(req.params.id as string)));
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "DELETE_USER", `Deleted user ID ${req.params.id}`);
  res.status(204).send();
});

// PATCH /users/:id/status
router.patch("/:id/status", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const { status, reason } = req.body;
  const [updated] = await db.update(usersTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(usersTable.id, parseInt(req.params.id as string)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, `USER_${status.toUpperCase()}`, `User ${updated.fullName} status changed to ${status}${reason ? `: ${reason}` : ""}`);
  const { passwordHash: _, ...safeUser } = updated;
  res.json(safeUser);
});

// POST /users/:id/reset-device
router.post("/:id/reset-device", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  await db.delete(deviceSessionsTable).where(eq(deviceSessionsTable.userId, parseInt(req.params.id as string)));
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "RESET_DEVICE", `Device reset for user ID ${req.params.id}`);
  res.json({ success: true });
});

export default router;
