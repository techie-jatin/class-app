import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable, coursesTable, usersTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

// GET /notes
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { courseId } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (courseId) conditions.push(eq(notesTable.courseId, parseInt(courseId)));
  if (req.user!.role === "faculty") conditions.push(eq(notesTable.facultyId, req.user!.id));

  const notes = await db.select().from(notesTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  const enriched = await Promise.all(notes.map(async (n) => {
    const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, n.courseId)).limit(1);
    let facultyName: string | null = null;
    if (n.facultyId) {
      const [fac] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, n.facultyId)).limit(1);
      facultyName = fac?.fullName ?? null;
    }
    return { ...n, courseName: course?.name ?? null, facultyName };
  }));
  res.json(enriched);
});

// POST /notes
router.post("/", requireAuth, requireRole("superadmin", "admin", "faculty"), async (req: AuthenticatedRequest, res) => {
  const { fileName, courseId, driveFileId, driveViewUrl } = req.body;
  const [note] = await db.insert(notesTable).values({ fileName, courseId, driveFileId, driveViewUrl: driveViewUrl ?? null, facultyId: req.user!.id }).returning();
  res.status(201).json({ ...note, courseName: null, facultyName: req.user!.fullName });
});

// GET /notes/:id
router.get("/:id", requireAuth, async (req, res) => {
  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, parseInt(req.params.id as string))).limit(1);
  if (!note) { res.status(404).json({ error: "Not found" }); return; }
  const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, note.courseId)).limit(1);
  res.json({ ...note, courseName: course?.name ?? null, facultyName: null });
});

// DELETE /notes/:id
router.delete("/:id", requireAuth, requireRole("superadmin", "admin", "faculty"), async (req, res) => {
  await db.delete(notesTable).where(eq(notesTable.id, parseInt(req.params.id as string)));
  res.status(204).send();
});

export default router;
