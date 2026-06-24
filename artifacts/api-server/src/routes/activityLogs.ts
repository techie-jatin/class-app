import { Router } from "express";
import { db } from "@workspace/db";
import { activityLogsTable } from "@workspace/db";
import { eq, gte, lte, and, SQL } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth, requireRole("superadmin", "admin"), async (req, res) => {
  const { role, actionType, fromDate, toDate, page = "1", limit = "50" } = req.query as Record<string, string>;
  const conditions: SQL[] = [];
  if (role) conditions.push(eq(activityLogsTable.userRole, role));
  if (actionType) conditions.push(eq(activityLogsTable.action, actionType));
  if (fromDate) conditions.push(gte(activityLogsTable.createdAt, new Date(fromDate)));
  if (toDate) conditions.push(lte(activityLogsTable.createdAt, new Date(toDate)));

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const query = conditions.length > 0 ? and(...conditions) : undefined;
  const logs = await db.select().from(activityLogsTable).where(query).limit(limitNum).offset(offset).orderBy(activityLogsTable.createdAt);
  const total = await db.$count(activityLogsTable, query);
  res.json({ logs, total, page: pageNum, limit: limitNum });
});

export default router;
