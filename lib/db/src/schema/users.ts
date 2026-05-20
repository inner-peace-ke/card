import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const plansTable = pgTable("plans", {
  id:          serial("id").primaryKey(),
  name:        text("name").notNull(),
  maxContacts: integer("max_contacts").notNull().default(200),
  priceKes:    integer("price_kes").notNull().default(0),
  features:    text("features").notNull().default("[]"),
  isActive:    boolean("is_active").notNull().default(true),
});

export const usersTable = pgTable("users", {
  id:           serial("id").primaryKey(),
  username:     text("username").notNull().unique(),
  email:        text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  planId:       integer("plan_id").notNull().default(1),
  isActive:     boolean("is_active").notNull().default(true),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});
