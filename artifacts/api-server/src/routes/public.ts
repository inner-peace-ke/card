import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, contactsTable, userSettingsTable, sessionsTable, plansTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

const router = Router();

async function getUserByUsername(username: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username.toLowerCase()));
  return user ?? null;
}

async function getSettings(userId: number) {
  const [s] = await db.select().from(userSettingsTable).where(eq(userSettingsTable.userId, userId));
  return s;
}

async function getContactCount(userId: number) {
  const [row] = await db.select({ count: count() }).from(contactsTable).where(eq(contactsTable.userId, userId));
  return Number(row?.count ?? 0);
}

/* GET /api/u/:username — public card data */
router.get("/:username", async (req, res) => {
  const user = await getUserByUsername(req.params.username);
  if (!user) { res.status(404).json({ error: "Card not found" }); return; }
  const settings = await getSettings(user.id);
  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, user.planId));
  const contactCount = await getContactCount(user.id);
  const target = settings?.contactTarget ?? 200;
  const maxContacts = plan?.maxContacts ?? 200;
  res.json({
    username: user.username,
    cardName: settings?.cardName ?? user.username,
    bio: settings?.bio ?? "",
    whatsapp: settings?.whatsapp ?? "",
    youtube: settings?.youtube ?? "",
    waChannel: settings?.waChannel ?? "",
    waGroup: settings?.waGroup ?? "",
    count: contactCount,
    target: Math.min(target, maxContacts),
    maxContacts,
    percentage: Math.min(Math.round((contactCount / Math.min(target, maxContacts)) * 1000) / 10, 100),
    targetReached: contactCount >= Math.min(target, maxContacts),
    planName: plan?.name ?? "free",
  });
});

/* POST /api/u/:username/contact — submit a contact */
router.post("/:username/contact", async (req, res) => {
  const user = await getUserByUsername(req.params.username);
  if (!user) { res.status(404).json({ error: "Card not found" }); return; }

  const { fullName, phone, email, organization } = req.body ?? {};
  if (!fullName || !phone) {
    res.status(422).json({ error: "fullName and phone are required" });
    return;
  }

  const settings = await getSettings(user.id);
  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, user.planId));
  const maxContacts = plan?.maxContacts ?? 200;
  const contactCount = await getContactCount(user.id);

  if (contactCount >= maxContacts) {
    res.status(403).json({ error: "This card has reached its contact limit" });
    return;
  }

  try {
    const [inserted] = await db.insert(contactsTable).values({
      userId: user.id,
      fullName,
      phone,
      email: email ?? null,
      organization: organization ?? null,
    }).returning({ id: contactsTable.id });

    const newCount = contactCount + 1;
    const target = Math.min(settings?.contactTarget ?? 200, maxContacts);
    res.status(201).json({
      id: inserted.id,
      message: "Contact saved",
      count: newCount,
      target,
      percentage: Math.min(Math.round((newCount / target) * 1000) / 10, 100),
      targetReached: newCount >= target,
    });
  } catch (err: any) {
    const code = err?.code ?? err?.cause?.code ?? "";
    const msg = (err?.message ?? "").toLowerCase();
    if (code === "23505" || msg.includes("unique") || msg.includes("duplicate")) {
      res.status(409).json({ error: "This phone number is already in the list" });
      return;
    }
    req.log.error({ err }, "Contact insert error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /api/u/:username/download — VCF download (target must be reached) */
router.get("/:username/download", async (req, res) => {
  const user = await getUserByUsername(req.params.username);
  if (!user) { res.status(404).json({ error: "Card not found" }); return; }
  const settings = await getSettings(user.id);
  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, user.planId));
  const contactCount = await getContactCount(user.id);
  const target = Math.min(settings?.contactTarget ?? 200, plan?.maxContacts ?? 200);
  if (contactCount < target) {
    res.status(403).json({ error: `Target not reached yet. ${contactCount}/${target} contacts.` });
    return;
  }
  const contacts = await db.select().from(contactsTable).where(eq(contactsTable.userId, user.id));
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
