import { Router, Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable, plansTable, platformConfigTable, contactsTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

const router = Router();

function superAuth(req: Request, res: Response, next: NextFunction) {
  const email = process.env["SUPER_ADMIN_EMAIL"];
  const password = process.env["SUPER_ADMIN_PASSWORD"];
  if (!email || !password) {
    res.status(503).json({ error: "Super-admin not configured on this server" }); return;
  }
  const provided = req.headers["x-super-token"];
  const expected = Buffer.from(`${email}:${password}`).toString("base64");
  if (provided !== expected) {
    res.status(401).json({ error: "Unauthorized" }); return;
  }
  next();
}

router.use(superAuth);

/* POST /api/super/login — verify credentials, return base64 token */
router.post("/login", (req, res) => {
  res.json({ success: true });
});

/* GET /api/super/stats */
router.get("/stats", async (req, res) => {
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [contactCount] = await db.select({ count: count() }).from(contactsTable);
  res.json({
    users: Number(userCount?.count ?? 0),
    contacts: Number(contactCount?.count ?? 0),
  });
});

/* GET /api/super/users */
router.get("/users", async (req, res) => {
  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    email: usersTable.email,
    planId: usersTable.planId,
    isActive: usersTable.isActive,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.createdAt);
  res.json({ users });
});

/* GET /api/super/plans */
router.get("/plans", async (req, res) => {
  const plans = await db.select().from(plansTable);
  res.json({ plans });
});

/* POST /api/super/plans */
router.post("/plans", async (req, res) => {
  const { name, maxContacts, priceKes, features } = req.body ?? {};
  if (!name || !maxContacts) { res.status(422).json({ error: "name and maxContacts required" }); return; }
  const [plan] = await db.insert(plansTable).values({
    name,
    maxContacts: Number(maxContacts),
    priceKes: Number(priceKes ?? 0),
    features: JSON.stringify(features ?? []),
  }).returning();
  res.status(201).json({ plan });
});

/* PUT /api/super/plans/:id */
router.put("/plans/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, maxContacts, priceKes, features, isActive } = req.body ?? {};
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (maxContacts !== undefined) updates.maxContacts = Number(maxContacts);
  if (priceKes !== undefined) updates.priceKes = Number(priceKes);
  if (features !== undefined) updates.features = JSON.stringify(features);
  if (isActive !== undefined) updates.isActive = Boolean(isActive);
  await db.update(plansTable).set(updates).where(eq(plansTable.id, id));
  res.json({ success: true });
});

/* PUT /api/super/users/:id/plan */
router.put("/users/:id/plan", async (req, res) => {
  const id = Number(req.params.id);
  const { planId } = req.body ?? {};
  await db.update(usersTable).set({ planId: Number(planId) }).where(eq(usersTable.id, id));
  res.json({ success: true });
});

/* GET /api/super/paystack */
router.get("/paystack", async (req, res) => {
  const rows = await db.select().from(platformConfigTable);
  const cfg: Record<string, string> = {};
  for (const r of rows) cfg[r.key] = r.value;
  res.json({
    publicKey: cfg["paystack_public_key"] ?? "",
    secretKey: cfg["paystack_secret_key"] ? "***set***" : "",
    testMode: cfg["paystack_test_mode"] ?? "true",
  });
});

/* PUT /api/super/paystack */
router.put("/paystack", async (req, res) => {
  const { publicKey, secretKey, testMode } = req.body ?? {};
  const upsert = async (key: string, value: string) => {
    await db.insert(platformConfigTable).values({ key, value })
      .onConflictDoUpdate({ target: platformConfigTable.key, set: { value } });
  };
  if (publicKey !== undefined) await upsert("paystack_public_key", publicKey);
  if (secretKey !== undefined && secretKey !== "***set***") await upsert("paystack_secret_key", secretKey);
  if (testMode !== undefined) await upsert("paystack_test_mode", String(testMode));
  res.json({ success: true });
});

export default router;
