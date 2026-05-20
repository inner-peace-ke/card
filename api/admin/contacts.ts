// GET  /api/admin/contacts       — list all contacts (PIN required)
// DELETE /api/admin/contacts?id=X — delete one contact by id (PIN required)
import { db, contactsTable, ensureTables } from "../_db";
import { isAuthorized } from "../_auth";
import { eq, desc } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (!(await isAuthorized(req))) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const contacts = await db
        .select()
        .from(contactsTable)
        .orderBy(desc(contactsTable.createdAt));
      return res.json({ contacts });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    const id = req.query?.id;

    // No id = clear ALL contacts
    if (!id) {
      try {
        await db.delete(contactsTable);
        return res.json({ success: true, cleared: true });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    const numId = Number(id);
    if (!Number.isInteger(numId) || numId < 1) {
      return res.status(422).json({ error: "Provide a valid ?id= query param" });
    }
    try {
      await db.delete(contactsTable).where(eq(contactsTable.id, numId));
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
