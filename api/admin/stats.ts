// GET /api/admin/stats — admin dashboard stats (PIN required)
import { ensureTables } from "../_db";
import { isAuthorized } from "../_auth";
import { getStats } from "../_stats";

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (!(await isAuthorized(req))) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    return res.json(await getStats());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
