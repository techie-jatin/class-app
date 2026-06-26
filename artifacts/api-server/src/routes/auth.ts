import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth";
import { verifyFirebaseToken } from "../lib/firebaseAdmin";
import { logActivity } from "../lib/activityLogger";

const router = Router();

/**
 * POST /auth/firebase-login
 * Called after Firebase sign-in on the frontend.
 * Verifies the ID token, returns user or { needsRegistration: true }.
 */
router.post("/firebase-login", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) { res.status(400).json({ error: "idToken required" }); return; }

  try {
    const decoded = await verifyFirebaseToken(idToken);
    const { uid, email, name, picture } = decoded;

    if (!email) { res.status(400).json({ error: "Firebase token has no email" }); return; }

    // Check by firebase UID first
    const [byUid] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, uid)).limit(1);
    if (byUid) {
      if (byUid.status === "blocked") { res.status(403).json({ error: "Account is blocked" }); return; }
      if (byUid.status === "pending") { res.status(403).json({ error: "Account pending approval" }); return; }
      await logActivity(byUid.id, byUid.fullName, byUid.role, "LOGIN", `${byUid.fullName} logged in via Firebase`);
      const { passwordHash: _, ...safe } = byUid;
      res.json({ user: safe });
      return;
    }

    // Check by email — link existing account
    const [byEmail] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (byEmail) {
      await db.update(usersTable).set({ firebaseUid: uid, profilePhoto: picture ?? byEmail.profilePhoto }).where(eq(usersTable.id, byEmail.id));
      if (byEmail.status === "blocked") { res.status(403).json({ error: "Account is blocked" }); return; }
      if (byEmail.status === "pending") { res.status(403).json({ error: "Account pending approval" }); return; }
      await logActivity(byEmail.id, byEmail.fullName, byEmail.role, "LOGIN", `${byEmail.fullName} linked Google and logged in`);
      const { passwordHash: _, ...safe } = byEmail;
      res.json({ user: { ...safe, firebaseUid: uid } });
      return;
    }

    // New user — needs registration
    res.json({ needsRegistration: true, firebaseUid: uid, email, fullName: name ?? "", profilePhoto: picture ?? null });
  } catch (err) {
    console.error("firebase-login error", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

/**
 * POST /auth/register
 * Completes registration for a Firebase-authenticated user.
 */
router.post("/register", async (req, res) => {
  const { idToken, fullName, mobileNumber, role, ...rest } = req.body;
  if (!idToken || !fullName || !role) { res.status(400).json({ error: "idToken, fullName and role required" }); return; }
  if (!["student", "faculty"].includes(role)) { res.status(400).json({ error: "Only student or faculty allowed" }); return; }

  try {
    const decoded = await verifyFirebaseToken(idToken);
    const { uid, email, picture } = decoded;
    if (!email) { res.status(400).json({ error: "Firebase account has no email" }); return; }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, uid)).limit(1);
    if (existing) { res.status(409).json({ error: "User already registered" }); return; }

    const [newUser] = await db.insert(usersTable).values({
      firebaseUid: uid, email: email.toLowerCase(), fullName, mobileNumber, role,
      status: "pending", profilePhoto: picture ?? null, ...rest,
    }).returning();

    await logActivity(newUser.id, newUser.fullName, newUser.role, "REGISTER", `${newUser.fullName} registered as ${role}`);
    const { passwordHash: _, ...safe } = newUser;
    res.status(201).json({ user: safe });
  } catch (err) {
    console.error("register error", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

/** POST /auth/logout */
router.post("/logout", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (req.user) await logActivity(req.user.id, req.user.fullName, req.user.role, "LOGOUT", `${req.user.fullName} logged out`);
  res.json({ success: true });
});

/** GET /auth/me */
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const { passwordHash: _, ...safe } = user;
  res.json(safe);
});

/** PATCH /auth/me/profile */
router.patch("/me/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
  const updates = { ...req.body };
  delete updates.passwordHash; delete updates.role; delete updates.status;
  delete updates.email; delete updates.firebaseUid;
  const [updated] = await db.update(usersTable).set({ ...updates, updatedAt: new Date() }).where(eq(usersTable.id, req.user!.id)).returning();
  const { passwordHash: _, ...safe } = updated;
  res.json(safe);
});

export default router;
