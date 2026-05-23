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

/* GET /api/u/:username/og-image — dynamic OG image for social share */
router.get("/:username/og-image", async (req, res) => {
  const user = await getUserByUsername(req.params.username);
  const settings = user ? await getSettings(user.id) : null;
  const cardName = settings?.cardName ?? req.params.username;
  const username = req.params.username;
  const bio = settings?.bio ?? "WolfVCF Digital Card";

  const initials = cardName.split(" ").map((w: string) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || username.slice(0, 2).toUpperCase();

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#001200"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="av" x1="0" y1="0" x2="0" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#003300"/>
      <stop offset="100%" stop-color="#001100"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="24" y="24" width="1152" height="582" rx="20" fill="none" stroke="#00ff00" stroke-opacity="0.15" stroke-width="1.5"/>
  <line x1="24" y1="540" x2="1176" y2="540" stroke="#00ff00" stroke-opacity="0.1" stroke-width="1"/>

  <!-- Avatar circle -->
  <circle cx="160" cy="260" r="100" fill="url(#av)" stroke="#00ff00" stroke-opacity="0.4" stroke-width="2"/>
  <text x="160" y="278" font-family="Arial, sans-serif" font-weight="900" font-size="72" fill="#00ff00" text-anchor="middle">${initials}</text>

  <!-- Card name -->
  <text x="308" y="220" font-family="Arial Black, sans-serif" font-weight="900" font-size="72" fill="#ffffff" letter-spacing="-1">${cardName.slice(0, 20)}</text>
  <!-- Username -->
  <text x="312" y="278" font-family="monospace" font-size="30" fill="#00ff00" fill-opacity="0.7" letter-spacing="1">@${username}</text>
  <!-- Bio -->
  <text x="312" y="328" font-family="monospace" font-size="26" fill="#ffffff" fill-opacity="0.4">${bio.slice(0, 55)}</text>

  <!-- CTA -->
  <rect x="308" y="370" width="380" height="58" rx="10" fill="#00ff00" fill-opacity="0.08" stroke="#00ff00" stroke-opacity="0.3" stroke-width="1.5"/>
  <text x="498" y="406" font-family="monospace" font-size="22" fill="#00ff00" fill-opacity="0.85" text-anchor="middle" letter-spacing="2">JOIN MY NETWORK</text>

  <!-- WolfVCF brand -->
  <text x="600" y="585" font-family="monospace" font-size="18" fill="#00ff00" fill-opacity="0.25" text-anchor="middle" letter-spacing="4">WOLFVCF — DIGITAL CONTACT CARD</text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(svg);
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
