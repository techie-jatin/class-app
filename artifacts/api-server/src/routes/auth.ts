import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, deviceSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, requireAuth, AuthenticatedRequest } from "../middlewares/auth";
import { logActivity } from "../lib/activityLogger";

const router = Router();

// POST /auth/login
router.post("/login", async (req: AuthenticatedRequest, res) => {
  const { email, password, deviceFingerprint } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (user.status === "blocked") {
    res.status(403).json({ error: "Account is blocked" });
    return;
  }
  if (user.status === "pending") {
    res.status(403).json({ error: "Account pending approval" });
    return;
  }
  if (user.status === "rejected") {
    res.status(403).json({ error: "Account has been rejected" });
    return;
  }

  const token = generateToken(user.id, user.role, user.email);

  // Device session management (for non-superadmin)
  if (deviceFingerprint) {
    const [existingSession] = await db
      .select()
      .from(deviceSessionsTable)
      .where(eq(deviceSessionsTable.userId, user.id))
      .limit(1);

    if (existingSession && existingSession.deviceFingerprint !== deviceFingerprint && user.role !== "superadmin") {
      res.status(403).json({ error: "Another device is already logged in. Contact admin to reset." });
      return;
    }

    await db.delete(deviceSessionsTable).where(eq(deviceSessionsTable.userId, user.id));
    await db.insert(deviceSessionsTable).values({
      userId: user.id,
      deviceFingerprint,
      token,
    });
  }

  await logActivity(user.id, user.fullName, user.role, "LOGIN", `${user.fullName} logged in`);

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

// POST /auth/register
router.post("/register", async (req, res) => {
  const { email, password, fullName, mobileNumber, role, ...rest } = req.body;
  if (!email || !password || !fullName || !role) {
    res.status(400).json({ error: "Required fields missing" });
    return;
  }
  if (!["student", "faculty"].includes(role)) {
    res.status(400).json({ error: "Public registration only for student or faculty" });
    return;
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const [newUser] = await db
    .insert(usersTable)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      mobileNumber,
      role,
      status: "pending",
      ...rest,
    })
    .returning();

  await logActivity(newUser.id, newUser.fullName, newUser.role, "REGISTER", `${newUser.fullName} registered as ${role}`);

  const token = generateToken(newUser.id, newUser.role, newUser.email);
  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token });
});

// POST /auth/logout
router.post("/logout", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (req.user) {
    await db.delete(deviceSessionsTable).where(eq(deviceSessionsTable.userId, req.user.id));
    await logActivity(req.user.id, req.user.fullName, req.user.role, "LOGOUT", `${req.user.fullName} logged out`);
  }
  res.json({ success: true });
});

// GET /auth/me
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

// PATCH /auth/me/profile
router.patch("/me/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
  const updates = req.body;
  delete updates.passwordHash;
  delete updates.role;
  delete updates.status;
  delete updates.email;
  const [updated] = await db
    .update(usersTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.id))
    .returning();
  const { passwordHash: _, ...safeUser } = updated;
  res.json(safeUser);
});

// POST /auth/change-password
router.post("/change-password", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }
  const newHash = await bcrypt.hash(newPassword, 12);
  await db.update(usersTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(usersTable.id, req.user!.id));
  res.json({ success: true });
});

export default router;
