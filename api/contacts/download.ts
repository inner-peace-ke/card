// GET /api/contacts/download — public VCF download, only unlocks once the target is reached
import { db, contactsTable, ensureTables } from "../_db";
import { getStats } from "../_stats";
import { buildVcf } from "../_vcf";

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stats = await getStats();
    if (!stats.targetReached) {
      return res.status(403).json({
        error: `Target not yet reached. ${stats.count}/${stats.target} contacts collected.`,
      });
    }

    const contacts = await db.select().from(contactsTable).orderBy(contactsTable.createdAt);
    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="wolfxnode-contacts.vcf"');
    return res.send(buildVcf(contacts));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
