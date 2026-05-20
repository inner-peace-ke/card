// POST /api/contacts — submit a new contact
import { db, contactsTable, ensureTables } from "../_db";
import { getStats } from "../_stats";

export default async function handler(req: any, res: any) {
  await ensureTables();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fullName, phone } = req.body ?? {};
  if (!fullName || !phone) {
    return res.status(422).json({ error: "Name and phone are required" });
  }

  try {
    const [inserted] = await db
      .insert(contactsTable)
      .values({ fullName: String(fullName).trim(), phone: String(phone).trim() })
      .returning({ id: contactsTable.id });

    const stats = await getStats();
    return res.status(201).json({ id: inserted.id, message: "Contact saved successfully", stats });
  } catch (err: any) {
    const msg = (err?.message ?? "").toLowerCase();
    const code = err?.code ?? err?.cause?.code ?? "";
    if (code === "23505" || msg.includes("unique") || msg.includes("duplicate")) {
      return res.status(409).json({ error: "This phone number has already been submitted" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
