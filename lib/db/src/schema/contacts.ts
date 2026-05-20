import { pgTable, serial, text, timestamp, integer, unique } from "drizzle-orm/pg-core";

export const contactsTable = pgTable("contacts", {
  id:           serial("id").primaryKey(),
  userId:       integer("user_id").notNull(),
  fullName:     text("full_name").notNull(),
  phone:        text("phone").notNull(),
  email:        text("email"),
  organization: text("organization"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique("contacts_user_phone_unique").on(t.userId, t.phone)]);
