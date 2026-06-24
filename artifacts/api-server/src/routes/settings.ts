import { Router } from "express";
import { db } from "@workspace/db";
import { systemSettingsTable } from "@workspace/db";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

async function getOrCreateSettings() {
  const [settings] = await db.select().from(systemSettingsTable).limit(1);
  if (settings) return settings;
  const [created] = await db.insert(systemSettingsTable).values({}).returning();
  return created;
}

router.get("/", requireAuth, async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ ...settings, maintenanceMode: settings.maintenanceMode === "true" });
});

router.patch("/", requireAuth, requireRole("superadmin"), async (req: AuthenticatedRequest, res) => {
  const settings = await getOrCreateSettings();
  const updates: any = { updatedAt: new Date() };
  const allowed = ["platformName", "platformLogo", "supportEmail", "contactNumber"];
  for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
  if (req.body.maintenanceMode !== undefined) updates.maintenanceMode = req.body.maintenanceMode ? "true" : "false";
  const { eq } = await import("drizzle-orm");
  const [updated] = await db.update(systemSettingsTable).set(updates).where(eq(systemSettingsTable.id, settings.id)).returning();
  res.json({ ...updated, maintenanceMode: updated.maintenanceMode === "true" });
});

export default router;
