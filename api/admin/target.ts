// PUT /api/admin/target — update the contact target number (PIN required)
import { db, settingsTable, ensureTables } from "../_db";
import { isAuthorized } from "../_auth";

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (!(await isAuthorized(req))) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });

  const target = Number(req.body?.target);
  if (!Number.isInteger(target) || target < 1 || target > 100000) {
    return res.status(422).json({ error: "Target must be a whole number between 1 and 100,000" });
  }

  try {
    await db
      .insert(settingsTable)
      .values({ key: "target", value: target })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: target } });
    return res.json({ success: true, target });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
