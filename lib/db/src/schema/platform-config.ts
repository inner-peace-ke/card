import { pgTable, text } from "drizzle-orm/pg-core";

export const platformConfigTable = pgTable("platform_config", {
  key:   text("key").primaryKey(),
  value: text("value").notNull(),
});
