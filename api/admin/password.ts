// PUT /api/admin/password — change admin PIN (PIN required)
import { pool, ensureTables } from "../_db";
import { isAuthorized } from "../_auth";

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (!(await isAuthorized(req))) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });

  const { newPin } = req.body ?? {};
  if (!newPin || typeof newPin !== "string" || newPin.trim().length < 4) {
    return res.status(422).json({ error: "New PIN must be at least 4 characters" });
  }

  try {
    await pool.query(
      `INSERT INTO app_config (key, value) VALUES ('admin_pin', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [newPin.trim()]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
