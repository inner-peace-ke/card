import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set. Check config.ts at the project root.");
}

// Enable SSL automatically when the connection string requires it (e.g. Neon, Supabase)
const ssl = connectionString.includes("sslmode=require")
  ? { rejectUnauthorized: false }
  : false;

export const pool = new Pool({ connectionString, ssl });
export const db = drizzle(pool, { schema });

export * from "./schema";
