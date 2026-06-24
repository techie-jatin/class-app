import { Router } from "express";
import { db } from "@workspace/db";
import { liveClassesTable, coursesTable, usersTable } from "@workspace/db";
import { eq, gte, and, SQL } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// GET /live-classes
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { courseId, upcoming } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (courseId) conditions.push(eq(liveClassesTable.courseId, parseInt(courseId)));
  if (req.user!.role === "faculty") conditions.push(eq(liveClassesTable.facultyId, req.user!.id));

  const classes = await db.select().from(liveClassesTable).where(conditions.length > 0 ? and(...conditions) : undefined);

  let filtered = classes;
  if (upcoming === "true") {
    const now = new Date().toISOString();
    filtered = classes.filter(c => c.scheduledAt >= now);
  }

  const enriched = await Promise.all(filtered.map(async (c) => {
    const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, c.courseId)).limit(1);
    let facultyName: string | null = null;
    if (c.facultyId) {
      const [fac] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, c.facultyId)).limit(1);
      facultyName = fac?.fullName ?? null;
    }
    return { ...c, courseName: course?.name ?? null, facultyName };
  }));
  res.json(enriched);
});

// POST /live-classes
router.post("/", requireAuth, requireRole("superadmin", "admin", "faculty"), async (req: AuthenticatedRequest, res) => {
  const { title, description, courseId, scheduledAt, youtubeUrl } = req.body;
  const [cls] = await db.insert(liveClassesTable).values({ title, description, courseId, scheduledAt, youtubeUrl, facultyId: req.user!.id }).returning();
  res.status(201).json({ ...cls, courseName: null, facultyName: req.user!.fullName });
});

// GET /live-classes/:id
router.get("/:id", requireAuth, async (req, res) => {
  const [cls] = await db.select().from(liveClassesTable).where(eq(liveClassesTable.id, parseInt(req.params.id))).limit(1);
  if (!cls) { res.status(404).json({ error: "Not found" }); return; }
  const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, cls.courseId)).limit(1);
  res.json({ ...cls, courseName: course?.name ?? null, facultyName: null });
});

// PATCH /live-classes/:id
router.patch("/:id", requireAuth, requireRole("superadmin", "admin", "faculty"), async (req: AuthenticatedRequest, res) => {
  const updates: any = { updatedAt: new Date() };
  const allowed = ["title", "description", "courseId", "scheduledAt", "youtubeUrl"];
  for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
  const [updated] = await db.update(liveClassesTable).set(updates).where(eq(liveClassesTable.id, parseInt(req.params.id))).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, courseName: null, facultyName: null });
});

// DELETE /live-classes/:id
router.delete("/:id", requireAuth, requireRole("superadmin", "admin", "faculty"), async (req, res) => {
  await db.delete(liveClassesTable).where(eq(liveClassesTable.id, parseInt(req.params.id)));
  res.status(204).send();
});

export default router;
