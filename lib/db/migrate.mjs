import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");

const client = new pg.Client({
  connectionString: url,
  ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
});

async function run() {
  await client.connect();
  console.log("Connected — running migrations…");

  await client.query(`
    CREATE TABLE IF NOT EXISTS plans (
      id           SERIAL PRIMARY KEY,
      name         TEXT    NOT NULL,
      max_contacts INTEGER NOT NULL DEFAULT 200,
      price_kes    INTEGER NOT NULL DEFAULT 0,
      features     TEXT    NOT NULL DEFAULT '[]',
      is_active    BOOLEAN NOT NULL DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      username      TEXT    NOT NULL UNIQUE,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      plan_id       INTEGER NOT NULL DEFAULT 1,
      is_active     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id        INTEGER PRIMARY KEY,
      card_name      TEXT    NOT NULL DEFAULT 'My VCF Card',
      bio            TEXT    NOT NULL DEFAULT '',
      whatsapp       TEXT    NOT NULL DEFAULT '',
      youtube        TEXT    NOT NULL DEFAULT '',
      wa_channel     TEXT    NOT NULL DEFAULT '',
      wa_group       TEXT    NOT NULL DEFAULT '',
      contact_target INTEGER NOT NULL DEFAULT 200
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id         TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  /* Add user_id column to contacts if it doesn't exist yet */
  await client.query(`
    ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id INTEGER;
  `);

  /* Drop old global unique on phone (single-tenant), add per-user unique */
  await client.query(`
    ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_phone_key;
    DROP INDEX IF EXISTS contacts_user_phone_unique;
    CREATE UNIQUE INDEX IF NOT EXISTS contacts_user_phone_unique
      ON contacts (user_id, phone)
      WHERE user_id IS NOT NULL;
  `);

  /* Seed free plan (id = 1) */
  await client.query(`
    INSERT INTO plans (id, name, max_contacts, price_kes, features, is_active)
    VALUES (1, 'Free', 200, 0, '["200 contacts","Shareable card link","VCF download"]', TRUE)
    ON CONFLICT (id) DO UPDATE
      SET name         = EXCLUDED.name,
          max_contacts = EXCLUDED.max_contacts,
          features     = EXCLUDED.features;
  `);

  /* Make sure the sequence is ahead of the seeded id */
  await client.query(`SELECT setval('plans_id_seq', GREATEST((SELECT MAX(id) FROM plans), 1));`);

  console.log("✓ Migration + seed complete");
  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
