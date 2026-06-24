import { Router } from "express";
import { db } from "@workspace/db";
import { lecturesTable, liveClassesTable, coursesTable, usersTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// ── Recorded Lectures ────────────────────────────────────────────────────
// GET /lectures
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { courseId, search } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (courseId) conditions.push(eq(lecturesTable.courseId, parseInt(courseId)));
  if (search) conditions.push(ilike(lecturesTable.title, `%${search}%`));
  if (req.user!.role === "faculty") conditions.push(eq(lecturesTable.facultyId, req.user!.id));

  const lectures = await db.select().from(lecturesTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  const enriched = await Promise.all(lectures.map(async (l) => {
    const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, l.courseId)).limit(1);
    let facultyName: string | null = null;
    if (l.facultyId) {
      const [fac] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, l.facultyId)).limit(1);
      facultyName = fac?.fullName ?? null;
    }
    return { ...l, courseName: course?.name ?? null, facultyName };
  }));
  res.json(enriched);
});

// POST /lectures
router.post("/", requireAuth, requireRole("superadmin", "admin", "faculty"), async (req: AuthenticatedRequest, res) => {
  const { title, description, courseId, youtubeVideoId, thumbnail } = req.body;
  const [lecture] = await db.insert(lecturesTable).values({ title, description, courseId, youtubeVideoId, thumbnail: thumbnail ?? null, facultyId: req.user!.id }).returning();
  res.status(201).json({ ...lecture, courseName: null, facultyName: req.user!.fullName });
});

// GET /lectures/:id
router.get("/:id", requireAuth, async (req, res) => {
  const [lecture] = await db.select().from(lecturesTable).where(eq(lecturesTable.id, parseInt(req.params.id))).limit(1);
  if (!lecture) { res.status(404).json({ error: "Not found" }); return; }
  const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, lecture.courseId)).limit(1);
  res.json({ ...lecture, courseName: course?.name ?? null, facultyName: null });
});

// PATCH /lectures/:id
router.patch("/:id", requireAuth, requireRole("superadmin", "admin", "faculty"), async (req: AuthenticatedRequest, res) => {
  const updates: any = { updatedAt: new Date() };
  const allowed = ["title", "description", "courseId", "youtubeVideoId", "thumbnail"];
  for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
  const [updated] = await db.update(lecturesTable).set(updates).where(eq(lecturesTable.id, parseInt(req.params.id))).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, courseName: null, facultyName: null });
});

// DELETE /lectures/:id
router.delete("/:id", requireAuth, requireRole("superadmin", "admin", "faculty"), async (req, res) => {
  await db.delete(lecturesTable).where(eq(lecturesTable.id, parseInt(req.params.id)));
  res.status(204).send();
});

export default router;
