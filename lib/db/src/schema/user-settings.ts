import { pgTable, integer, text } from "drizzle-orm/pg-core";

export const userSettingsTable = pgTable("user_settings", {
  userId:        integer("user_id").primaryKey(),
  cardName:      text("card_name").notNull().default("My VCF Card"),
  bio:           text("bio").notNull().default(""),
  whatsapp:      text("whatsapp").notNull().default(""),
  youtube:       text("youtube").notNull().default(""),
  waChannel:     text("wa_channel").notNull().default(""),
  waGroup:       text("wa_group").notNull().default(""),
  contactTarget: integer("contact_target").notNull().default(200),
});
