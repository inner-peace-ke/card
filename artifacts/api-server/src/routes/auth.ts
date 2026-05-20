import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, userSettingsTable, sessionsTable, plansTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const router = Router();

const SESSION_DAYS = 30;

function sessionExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DAYS);
  return d;
}

/* POST /api/auth/signup */
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body ?? {};
  if (!username || !email || !password) {
    res.status(422).json({ error: "username, email and password are required" });
    return;
  }
  if (!/^[a-z0-9_]{3,30}$/i.test(username)) {
    res.status(422).json({ error: "Username must be 3–30 characters, letters/numbers/underscores only" });
    return;
  }
  if (password.length < 6) {
    res.status(422).json({ error: "Password must be at least 6 characters" });
    return;
  }
  try {
    const existing = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, username.toLowerCase()));
    if (existing.length > 0) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }
    const emailExists = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));
    if (emailExists.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
      planId: 1,
    }).returning({ id: usersTable.id, username: usersTable.username });

    await db.insert(userSettingsTable).values({
      userId: user.id,
      cardName: username,
    });

    const token = randomUUID();
    await db.insert(sessionsTable).values({
      id: token,
      userId: user.id,
      expiresAt: sessionExpiry(),
    });

    res.status(201).json({ token, username: user.username });
  } catch (err) {
    req.log.error({ err }, "Signup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /api/auth/login */
router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(422).json({ error: "username and password are required" });
    return;
  }
  try {
    const [user] = await db.select()
      .from(usersTable)
      .where(eq(usersTable.username, username.toLowerCase()));
    if (!user) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const token = randomUUID();
    await db.insert(sessionsTable).values({
      id: token,
      userId: user.id,
      expiresAt: sessionExpiry(),
    });
    res.json({ token, username: user.username });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /api/auth/logout */
router.post("/logout", async (req, res) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, token)).catch(() => {});
  }
  res.json({ success: true });
});

/* GET /api/auth/me */
router.get("/me", async (req, res) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) { res.status(401).json({ error: "No token" }); return; }
  try {
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, token));
    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ error: "Session expired" }); return;
    }
    const [user] = await db.select({ id: usersTable.id, username: usersTable.username, email: usersTable.email, planId: usersTable.planId })
      .from(usersTable).where(eq(usersTable.id, session.userId));
    if (!user) { res.status(401).json({ error: "User not found" }); return; }
    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, user.planId));
    res.json({ ...user, plan });
  } catch (err) {
    req.log.error({ err }, "Me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
