// Shared database connection used by all API functions.
// Tables are created automatically on first request — no manual migrations needed.
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { config } from "../config";

const connectionString = process.env.DATABASE_URL || config.DATABASE_URL;
export const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

export const contactsTable = pgTable("contacts", {
  id:           serial("id").primaryKey(),
  fullName:     text("full_name").notNull(),
  phone:        text("phone").notNull().unique(),
  email:        text("email"),
  organization: text("organization"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export const settingsTable = pgTable("settings", {
  id:    serial("id").primaryKey(),
  key:   text("key").notNull().unique(),
  value: integer("value").notNull(),
});

export const appConfigTable = pgTable("app_config", {
  id:    serial("id").primaryKey(),
  key:   text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const db = drizzle(pool, { schema: { contactsTable, settingsTable, appConfigTable } });

// Creates tables the first time the app runs — no manual setup needed
let ready = false;
export async function ensureTables() {
  if (ready) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id           SERIAL PRIMARY KEY,
      full_name    TEXT NOT NULL,
      phone        TEXT NOT NULL UNIQUE,
      email        TEXT,
      organization TEXT,
      created_at   TIMESTAMP DEFAULT NOW() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      id    SERIAL PRIMARY KEY,
      key   TEXT NOT NULL UNIQUE,
      value INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_config (
      id    SERIAL PRIMARY KEY,
      key   TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );
    INSERT INTO settings (key, value)
      VALUES ('target', ${config.CONTACT_TARGET})
      ON CONFLICT (key) DO NOTHING;
  `);
  ready = true;
}
