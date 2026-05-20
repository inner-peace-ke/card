// Shared helper that calculates current contact progress.
import { db, contactsTable, settingsTable } from "./_db";
import { eq, count } from "drizzle-orm";
import { config } from "../config";

export async function getStats() {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "target"));
  const target = row?.value ?? config.CONTACT_TARGET;
  const [countRow] = await db.select({ count: count() }).from(contactsTable);
  const contactCount = Number(countRow?.count ?? 0);
  const percentage = Math.min((contactCount / target) * 100, 100);
  return {
    count: contactCount,
    target,
    percentage: Math.round(percentage * 10) / 10,
    targetReached: contactCount >= target,
  };
}
