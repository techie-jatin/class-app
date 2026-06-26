import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyFirebaseToken } from "../lib/firebaseAdmin";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    status: string;
    fullName: string;
    firebaseUid: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const idToken = authHeader.slice(7);

  try {
    const decoded = await verifyFirebaseToken(idToken);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.firebaseUid, decoded.uid))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found. Please complete registration." });
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

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.fullName,
      firebaseUid: decoded.uid,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
