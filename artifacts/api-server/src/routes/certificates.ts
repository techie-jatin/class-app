import { Router } from "express";
import { db } from "@workspace/db";
import { certificatesTable, coursesTable, usersTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activityLogger";

const router = Router();

// GET /certificates
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { studentId, courseId } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (studentId) conditions.push(eq(certificatesTable.studentId, parseInt(studentId)));
  if (courseId) conditions.push(eq(certificatesTable.courseId, parseInt(courseId)));
  if (req.user!.role === "student") conditions.push(eq(certificatesTable.studentId, req.user!.id));

  const certs = await db.select().from(certificatesTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  const enriched = await Promise.all(certs.map(async (c) => {
    const [student] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, c.studentId)).limit(1);
    const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, c.courseId)).limit(1);
    return { ...c, studentName: student?.fullName ?? null, courseName: course?.name ?? null };
  }));
  res.json(enriched);
});

// POST /certificates
router.post("/", requireAuth, requireRole("superadmin", "admin"), async (req: AuthenticatedRequest, res) => {
  const { studentId, courseId, certificateNumber, issueDate, driveFileId, driveViewUrl } = req.body;
  const [cert] = await db.insert(certificatesTable).values({ studentId, courseId, certificateNumber, issueDate, driveFileId: driveFileId ?? null, driveViewUrl: driveViewUrl ?? null }).returning();
  await logActivity(req.user!.id, req.user!.fullName, req.user!.role, "CREATE_CERTIFICATE", `Issued certificate ${certificateNumber}`);
  res.status(201).json({ ...cert, studentName: null, courseName: null });
});

// GET /certificates/:id
router.get("/:id", requireAuth, async (req, res) => {
  const [cert] = await db.select().from(certificatesTable).where(eq(certificatesTable.id, parseInt(req.params.id as string))).limit(1);
  if (!cert) { res.status(404).json({ error: "Not found" }); return; }
  const [student] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, cert.studentId)).limit(1);
  const [course] = await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, cert.courseId)).limit(1);
  res.json({ ...cert, studentName: student?.fullName ?? null, courseName: course?.name ?? null });
});

// DELETE /certificates/:id
router.delete("/:id", requireAuth, requireRole("superadmin", "admin"), async (req, res) => {
  await db.delete(certificatesTable).where(eq(certificatesTable.id, parseInt(req.params.id as string)));
  res.status(204).send();
});

export default router;
