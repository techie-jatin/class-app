import { Router } from "express";
import { db } from "@workspace/db";
import { batchesTable, batchMembersTable, coursesTable, usersTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activityLogger";

const router = Router();

async function enrichBatch(b: typeof batchesTable.$inferSelect) {
  const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, b.courseId)).limit(1);
  const members = await db.select().from(batchMembersTable).where(eq(batchMembersTable.batchId, b.id));
  const studentCount = members.filter(m => m.role === "student").length;
  const facultyCount = members.filter(m => m.role === "faculty").length;
  return { ...b, courseName: course?.name ?? null, studentCount, facultyCount };
}

// GET /batches
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { courseId, search } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (courseId) conditions.push(eq(batchesTable.courseId, parseInt(courseId)));
  if (search) conditions.push(ilike(batchesTable.name, `%${search}%`));
  const batches = await db.select().from(batchesTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  const enriched = await Promise.all(batches.map(enrichBatch));
  res.json(enriched);
});

// POST /batches
router.post("/", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const { name, courseId, startDate, endDate } = req.body;
  const [batch] = await db.insert(batchesTable).values({ name, courseId, startDate, endDate }).returning();
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "CREATE_BATCH", `Created batch: ${name}`);
  res.status(201).json(await enrichBatch(batch));
});

// GET /batches/:id
router.get("/:id", requireAuth, async (req, res) => {
  const [batch] = await db.select().from(batchesTable).where(eq(batchesTable.id, parseInt(req.params.id as string))).limit(1);
  if (!batch) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichBatch(batch));
});

// PATCH /batches/:id
router.patch("/:id", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const { name, courseId, startDate, endDate } = req.body;
  const updates: any = { updatedAt: new Date() };
  if (name) updates.name = name;
  if (courseId) updates.courseId = courseId;
  if (startDate) updates.startDate = startDate;
  if (endDate) updates.endDate = endDate;
  const [updated] = await db.update(batchesTable).set(updates).where(eq(batchesTable.id, parseInt(req.params.id as string))).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichBatch(updated));
});

// DELETE /batches/:id
router.delete("/:id", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  await db.delete(batchesTable).where(eq(batchesTable.id, parseInt(req.params.id as string)));
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "DELETE_BATCH", `Deleted batch ID ${req.params.id}`);
  res.status(204).send();
});

// POST /batches/:id/assign
router.post("/:id/assign", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const batchId = parseInt(req.params.id as string);
  const { studentIds = [], facultyIds = [] } = req.body;
  await db.delete(batchMembersTable).where(eq(batchMembersTable.batchId, batchId));
  const entries = [
    ...studentIds.map((id: number) => ({ batchId, userId: id, role: "student" })),
    ...facultyIds.map((id: number) => ({ batchId, userId: id, role: "faculty" })),
  ];
  if (entries.length > 0) {
    await db.insert(batchMembersTable).values(entries);
  }
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "ASSIGN_BATCH", `Assigned ${entries.length} members to batch ${batchId}`);
  res.json({ success: true });
});

export default router;
