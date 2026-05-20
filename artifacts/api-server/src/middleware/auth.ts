import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { sessionsTable, usersTable, plansTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthedRequest extends Request {
  user: { id: number; username: string; email: string; planId: number; planName: string; planMaxContacts: number };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "Authentication required" }); return; }
  try {
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, token));
    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ error: "Session expired" }); return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
    if (!user) { res.status(401).json({ error: "User not found" }); return; }
    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, user.planId));
    (req as AuthedRequest).user = {
      id: user.id,
      username: user.username,
      email: user.email,
      planId: user.planId,
      planName: plan?.name ?? "Free",
      planMaxContacts: plan?.maxContacts ?? 200,
    };
    next();
  } catch (err) {
    res.status(500).json({ error: "Auth error" });
  }
}
