import { Router, Request } from "express";
import { db } from "@workspace/db";
import { contactsTable, userSettingsTable, sessionsTable } from "@workspace/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";
import { usersTable } from "@workspace/db/schema";

const router = Router();
router.use(requireAuth);

function authed(req: Request) { return (req as AuthedRequest).user; }

async function getStats(userId: number, target: number, maxContacts: number) {
  const [row] = await db.select({ count: count() }).from(contactsTable).where(eq(contactsTable.userId, userId));
  const n = Number(row?.count ?? 0);
  const effectiveTarget = Math.min(target, maxContacts);
  return {
    count: n,
    target: effectiveTarget,
    maxContacts,
    percentage: Math.min(Math.round((n / effectiveTarget) * 1000) / 10, 100),
    targetReached: n >= effectiveTarget,
  };
}

/* GET /api/dashboard/stats */
router.get("/stats", async (req, res) => {
  const user = authed(req);
  const [settings] = await db.select().from(userSettingsTable).where(eq(userSettingsTable.userId, user.id));
  const stats = await getStats(user.id, settings?.contactTarget ?? 200, user.planMaxContacts);
  res.json({ ...stats, planName: user.planName });
});

/* GET /api/dashboard/contacts */
router.get("/contacts", async (req, res) => {
  const user = authed(req);
  const contacts = await db.select().from(contactsTable)
    .where(eq(contactsTable.userId, user.id))
    .orderBy(desc(contactsTable.createdAt));
  res.json({ contacts });
});

/* GET /api/dashboard/settings */
router.get("/settings", async (req, res) => {
  const user = authed(req);
  const [settings] = await db.select().from(userSettingsTable).where(eq(userSettingsTable.userId, user.id));
  res.json({ settings: settings ?? {} });
});

/* PUT /api/dashboard/settings */
router.put("/settings", async (req, res) => {
  const user = authed(req);
  const { cardName, bio, whatsapp, youtube, waChannel, waGroup, contactTarget } = req.body ?? {};
  const updates: Record<string, any> = {};
  if (cardName !== undefined) updates.cardName = cardName;
  if (bio !== undefined) updates.bio = bio;
  if (whatsapp !== undefined) updates.whatsapp = whatsapp;
  if (youtube !== undefined) updates.youtube = youtube;
  if (waChannel !== undefined) updates.waChannel = waChannel;
  if (waGroup !== undefined) updates.waGroup = waGroup;
  if (contactTarget !== undefined) {
    const t = Number(contactTarget);
    if (!Number.isInteger(t) || t < 1 || t > 100000) {
      res.status(422).json({ error: "contactTarget must be 1–100000" }); return;
    }
    updates.contactTarget = Math.min(t, user.planMaxContacts);
  }
  await db.update(userSettingsTable).set(updates).where(eq(userSettingsTable.userId, user.id));
  res.json({ success: true });
});

/* PUT /api/dashboard/password */
router.put("/password", async (req, res) => {
  const user = authed(req);
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    res.status(422).json({ error: "currentPassword and newPassword required" }); return;
  }
  if (newPassword.length < 6) {
    res.status(422).json({ error: "New password must be at least 6 characters" }); return;
  }
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));
  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }
  const hash = await bcrypt.hash(newPassword, 12);
  await db.update(usersTable).set({ passwordHash: hash }).where(eq(usersTable.id, user.id));
  res.json({ success: true });
});

/* DELETE /api/dashboard/contacts/:id */
router.delete("/contacts/:id", async (req, res) => {
  const user = authed(req);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(422).json({ error: "Invalid id" }); return; }
  await db.delete(contactsTable)
    .where(eq(contactsTable.id, id));
  res.json({ success: true });
});

/* DELETE /api/dashboard/contacts */
router.delete("/contacts", async (req, res) => {
  const user = authed(req);
  await db.delete(contactsTable).where(eq(contactsTable.userId, user.id));
  res.json({ success: true, cleared: true });
});

/* GET /api/dashboard/download — always available */
router.get("/download", async (req, res) => {
  const user = authed(req);
  const contacts = await db.select().from(contactsTable)
    .where(eq(contactsTable.userId, user.id))
    .orderBy(contactsTable.createdAt);
  const vcf = contacts.map(c => {
    const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${c.fullName}`, `N:${c.fullName};;;`, `TEL;TYPE=CELL,VOICE:${c.phone}`];
    if (c.email) lines.push(`EMAIL:${c.email}`);
    if (c.organization) lines.push(`ORG:${c.organization}`);
    lines.push("END:VCARD");
    return lines.join("\r\n");
  }).join("\r\n");
  res.setHeader("Content-Type", "text/vcard; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${user.username}-contacts.vcf"`);
  res.send(vcf);
});

export default router;
