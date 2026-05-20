// Checks the admin PIN on incoming requests.
// Reads from app_config DB table first (so password changes sync immediately),
// then falls back to env var / config default.
import { pool, ensureTables } from "./_db";
import { config } from "../config";

async function getAdminPin(): Promise<string> {
  try {
    await ensureTables();
    const result = await pool.query(
      "SELECT value FROM app_config WHERE key = 'admin_pin' LIMIT 1"
    );
    if (result.rows.length > 0) return result.rows[0].value as string;
  } catch {
    // fall through to default
  }
  return process.env.ADMIN_PIN || config.ADMIN_PIN;
}

export async function isAuthorized(req: any): Promise<boolean> {
  const pin = (req.headers["x-admin-pin"] as string) || (req.query?.pin as string);
  const adminPin = await getAdminPin();
  return pin === adminPin;
}
