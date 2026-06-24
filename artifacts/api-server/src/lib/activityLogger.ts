import { db } from "@workspace/db";
import { activityLogsTable } from "@workspace/db";

export async function logActivity(
  userId: number | null,
  userName: string,
  userRole: string,
  action: string,
  description: string,
) {
  try {
    await db.insert(activityLogsTable).values({
      userId: userId ?? undefined,
      userName,
      userRole,
      action,
      description,
    });
  } catch {
    // Non-fatal
  }
}
