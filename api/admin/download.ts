// GET /api/admin/download — export all contacts as a .vcf file (PIN required, always available)
import { db, contactsTable, ensureTables } from "../_db";
import { isAuthorized } from "../_auth";
import { buildVcf } from "../_vcf";

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (!(await isAuthorized(req))) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const contacts = await db.select().from(contactsTable).orderBy(contactsTable.createdAt);
    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="wolftech-contacts.vcf"');
    return res.send(buildVcf(contacts));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
