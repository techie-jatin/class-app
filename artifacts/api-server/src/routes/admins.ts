import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, ilike, and, or, SQL } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activityLogger";

const router = Router();

// GET /admins
router.get("/", requireAuth, requireRole("superadmin"), async (req, res) => {
  const { status, search } = req.query as Record<string, string>;
  const conditions: SQL[] = [eq(usersTable.role, "admin")];
  if (status) conditions.push(eq(usersTable.status, status as any));
  if (search) conditions.push(or(ilike(usersTable.fullName, `%${search}%`), ilike(usersTable.email, `%${search}%`))!);

  const admins = await db.select().from(usersTable).where(and(...conditions));
  const safeAdmins = admins.map(({ passwordHash: _, ...u }) => u);
  res.json(safeAdmins);
});

// POST /admins
router.post("/", requireAuth, requireRole("superadmin"), async (req: AuthenticatedRequest, res) => {
  const { email, password, fullName, mobileNumber } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const [admin] = await db.insert(usersTable).values({
    email: email.toLowerCase(), passwordHash, fullName, mobileNumber, role: "admin", status: "active",
  }).returning();
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "CREATE_ADMIN", `Created admin ${fullName}`);
  const { passwordHash: _, ...safeAdmin } = admin;
  res.status(201).json(safeAdmin);
});

// GET /admins/:id
router.get("/:id", requireAuth, requireRole("superadmin"), async (req, res) => {
  const [admin] = await db.select().from(usersTable)
    .where(and(eq(usersTable.id, parseInt(req.params.id as string)), eq(usersTable.role, "admin"))).limit(1);
  if (!admin) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...safeAdmin } = admin;
  res.json(safeAdmin);
});

// PATCH /admins/:id
router.patch("/:id", requireAuth, requireRole("superadmin"), async (req: AuthenticatedRequest, res) => {
  const { fullName, mobileNumber } = req.body;
  const [updated] = await db.update(usersTable).set({ fullName, mobileNumber, updatedAt: new Date() })
    .where(and(eq(usersTable.id, parseInt(req.params.id as string)), eq(usersTable.role, "admin"))).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...safeAdmin } = updated;
  res.json(safeAdmin);
});

// DELETE /admins/:id
router.delete("/:id", requireAuth, requireRole("superadmin"), async (req: AuthenticatedRequest, res) => {
  await db.delete(usersTable).where(and(eq(usersTable.id, parseInt(req.params.id as string)), eq(usersTable.role, "admin")));
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "DELETE_ADMIN", `Deleted admin ID ${req.params.id}`);
  res.status(204).send();
});

// PATCH /admins/:id/status
router.patch("/:id/status", requireAuth, requireRole("superadmin"), async (req: AuthenticatedRequest, res) => {
  const { status } = req.body;
  const [updated] = await db.update(usersTable).set({ status, updatedAt: new Date() })
    .where(and(eq(usersTable.id, parseInt(req.params.id as string)), eq(usersTable.role, "admin"))).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, `ADMIN_${status.toUpperCase()}`, `Admin ${updated.fullName} status set to ${status}`);
  const { passwordHash: _, ...safeAdmin } = updated;
  res.json(safeAdmin);
});

// POST /admins/:id/reset-password
router.post("/:id/reset-password", requireAuth, requireRole("superadmin"), async (req: AuthenticatedRequest, res) => {
  const { newPassword } = req.body;
  const newHash = await bcrypt.hash(newPassword, 12);
  await db.update(usersTable).set({ passwordHash: newHash, updatedAt: new Date() })
    .where(and(eq(usersTable.id, parseInt(req.params.id as string)), eq(usersTable.role, "admin")));
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "RESET_ADMIN_PASSWORD", `Reset password for admin ID ${req.params.id}`);
  res.json({ success: true });
});

export default router;
