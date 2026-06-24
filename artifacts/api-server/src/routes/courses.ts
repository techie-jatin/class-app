import { Router } from "express";
import { db } from "@workspace/db";
import { coursesTable, courseAccessTable, usersTable } from "@workspace/db";
import { eq, ilike, and, SQL, inArray } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activityLogger";

const router = Router();

// GET /courses
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { status, search, facultyId } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (status) conditions.push(eq(coursesTable.status, status as any));
  if (facultyId) conditions.push(eq(coursesTable.facultyId, parseInt(facultyId)));
  if (search) conditions.push(ilike(coursesTable.name, `%${search}%`));

  // For students: only show assigned courses
  if (req.user!.role === "student") {
    const access = await db.select().from(courseAccessTable).where(eq(courseAccessTable.studentId, req.user!.id));
    const courseIds = access.map(a => a.courseId);
    if (courseIds.length === 0) { res.json([]); return; }
    conditions.push(inArray(coursesTable.id, courseIds));
  }

  // For faculty: only show their courses
  if (req.user!.role === "faculty") {
    conditions.push(eq(coursesTable.facultyId, req.user!.id));
  }

  const query = conditions.length > 0 ? and(...conditions) : undefined;
  const courses = await db.select().from(coursesTable).where(query);

  // Enrich with faculty name, counts
  const enriched = await Promise.all(courses.map(async (c) => {
    let facultyName: string | null = null;
    if (c.facultyId) {
      const [fac] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, c.facultyId)).limit(1);
      facultyName = fac?.fullName ?? null;
    }
    const studentCount = await db.$count(courseAccessTable, eq(courseAccessTable.courseId, c.id));
    return { ...c, facultyName, studentCount, lectureCount: 0 };
  }));

  res.json(enriched);
});

// POST /courses
router.post("/", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const { name, description, thumbnail, facultyId, status = "active" } = req.body;
  const [course] = await db.insert(coursesTable).values({ name, description, thumbnail, facultyId: facultyId ?? null, status }).returning();
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "CREATE_COURSE", `Created course: ${name}`);
  res.status(201).json({ ...course, facultyName: null, studentCount: 0, lectureCount: 0 });
});

// GET /courses/:id
router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, parseInt(req.params.id))).limit(1);
  if (!course) { res.status(404).json({ error: "Not found" }); return; }

  let facultyName: string | null = null;
  if (course.facultyId) {
    const [fac] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, course.facultyId)).limit(1);
    facultyName = fac?.fullName ?? null;
  }
  const studentCount = await db.$count(courseAccessTable, eq(courseAccessTable.courseId, course.id));
  res.json({ ...course, facultyName, studentCount, lectureCount: 0 });
});

// PATCH /courses/:id
router.patch("/:id", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const { name, description, thumbnail, facultyId, status } = req.body;
  const updates: any = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (thumbnail !== undefined) updates.thumbnail = thumbnail;
  if (facultyId !== undefined) updates.facultyId = facultyId;
  if (status !== undefined) updates.status = status;

  const [updated] = await db.update(coursesTable).set(updates).where(eq(coursesTable.id, parseInt(req.params.id))).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "UPDATE_COURSE", `Updated course: ${updated.name}`);
  res.json({ ...updated, facultyName: null, studentCount: 0, lectureCount: 0 });
});

// DELETE /courses/:id
router.delete("/:id", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  await db.delete(coursesTable).where(eq(coursesTable.id, parseInt(req.params.id)));
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "DELETE_COURSE", `Deleted course ID ${req.params.id}`);
  res.status(204).send();
});

// POST /courses/:id/assign-students
router.post("/:id/assign-students", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const courseId = parseInt(req.params.id);
  const { studentIds } = req.body;
  // Remove existing
  await db.delete(courseAccessTable).where(eq(courseAccessTable.courseId, courseId));
  if (studentIds?.length > 0) {
    await db.insert(courseAccessTable).values(studentIds.map((sid: number) => ({ courseId, studentId: sid })));
  }
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "ASSIGN_COURSE", `Assigned ${studentIds?.length ?? 0} students to course ${courseId}`);
  res.json({ success: true });
});

// GET /courses/:id/students
router.get("/:id/students", requireAuth, requireRole("superadmin", "admin"), async (req, res) => {
  const access = await db.select().from(courseAccessTable).where(eq(courseAccessTable.courseId, parseInt(req.params.id)));
  if (access.length === 0) { res.json([]); return; }
  const students = await db.select().from(usersTable).where(inArray(usersTable.id, access.map(a => a.studentId)));
  res.json(students.map(({ passwordHash: _, ...u }) => u));
});

export default router;
