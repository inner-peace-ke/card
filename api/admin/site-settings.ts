// GET /api/admin/site-settings — read social link URLs (PIN required)
// PUT /api/admin/site-settings — update social link URLs (PIN required)
import { pool, ensureTables } from "../_db";
import { isAuthorized } from "../_auth";

const FORBIDDEN_KEYS = ["admin_pin"];

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (!(await isAuthorized(req))) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT key, value FROM app_config");
      const settings: Record<string, string> = {};
      for (const row of result.rows) {
        if (!FORBIDDEN_KEYS.includes(row.key)) settings[row.key] = row.value;
      }
      return res.json({ settings });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    const updates = req.body?.settings as Record<string, string> | undefined;
    if (!updates || typeof updates !== "object") {
      return res.status(422).json({ error: "Provide a settings object" });
    }
    const sanitized = Object.entries(updates).filter(
      ([k, v]) => !FORBIDDEN_KEYS.includes(k) && typeof v === "string"
    );
    try {
      for (const [key, value] of sanitized) {
        await pool.query(
          `INSERT INTO app_config (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, value]
        );
      }
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
