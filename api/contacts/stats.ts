// GET /api/contacts/stats — returns the current contact count and target progress
import { ensureTables } from "../_db";
import { getStats } from "../_stats";

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stats = await getStats();
    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
