# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
Project: **WOLFVCF** — a multi-user SaaS platform where each user gets a public digital contact card, collects contacts crowd-style, and downloads a VCF when target is reached.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: Replit PostgreSQL + Drizzle ORM
- **Validation**: Zod
- **Frontend**: React 19 + Vite 7 + TailwindCSS 4 + Wouter
- **Auth**: bcryptjs + UUID session tokens (stored in DB)

## Structure

```text
.
├── artifacts/
│   ├── vcf-card/           # React + Vite frontend (port 25326)
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── Landing.tsx       # /
│   │       │   ├── Signup.tsx        # /signup
│   │       │   ├── Login.tsx         # /login
│   │       │   ├── Dashboard.tsx     # /dashboard  (auth-protected)
│   │       │   ├── PublicCard.tsx    # /u/:username
│   │       │   └── SuperAdmin.tsx    # /super
│   │       ├── components/
│   │       │   └── Particles.tsx     # Animated particle background
│   │       └── lib/
│   │           └── api.ts            # Fetch helpers + token management
│   └── api-server/         # Express API server (port 8080)
│       └── src/
│           ├── middleware/auth.ts     # requireAuth middleware
│           └── routes/
│               ├── auth.ts            # signup, login, logout, me
│               ├── public.ts          # GET/POST /u/:username, VCF download
│               ├── dashboard.ts       # Authenticated user CRUD
│               ├── super.ts           # Super-admin panel routes
│               └── health.ts          # /healthz
│
├── lib/
│   ├── db/                 # Drizzle ORM + schema
│   │   ├── src/schema/
│   │   │   ├── contacts.ts          # contacts (user_id FK + per-user phone unique)
│   │   │   ├── users.ts             # users + plans tables
│   │   │   ├── user-settings.ts     # per-user card settings
│   │   │   ├── sessions.ts          # auth sessions
│   │   │   └── platform-config.ts   # key/value store (Paystack keys etc.)
│   │   └── migrate.mjs              # Direct SQL migration script
│   └── api-zod/            # Zod validation schemas
│
└── config.ts               # Reads DATABASE_URL, ADMIN_PIN from env
```

## Applications

### `artifacts/vcf-card` — WOLFVCF Frontend

Dark black + bright green (#00ff00) WOLFBOT-style UI using Orbitron + JetBrains Mono fonts.

**Pages:**
- `/` — Landing page with feature highlights and CTA
- `/signup` — Register (username, email, password) → creates user + settings + session
- `/login` — Login → returns session token stored in localStorage
- `/dashboard` — Authenticated: stats, contacts list, card settings, password change, VCF export
- `/u/:username` — Public shareable card: progress bar, contact form (with phone flag selector), social links, VCF download when target reached
- `/super` — Super-admin panel: stats, user management, plan CRUD, Paystack config

**Auth storage:** `wolf_token` + `wolf_user` in localStorage.

### `artifacts/api-server` — Express API Server

Runs on port 8080. Frontend Vite dev server proxies `/api` → `http://localhost:8080`.

**Route groups:**
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login, get session token
- `POST /api/auth/logout` — Invalidate session
- `GET  /api/auth/me` — Get current user + plan info
- `GET  /api/u/:username` — Public card data
- `POST /api/u/:username/contact` — Submit a contact
- `GET  /api/u/:username/download` — Download VCF (when target reached)
- `GET  /api/dashboard/*` — Authenticated dashboard routes
- `PUT  /api/dashboard/settings` — Update card settings
- `PUT  /api/dashboard/password` — Change password
- `GET  /api/dashboard/download` — Download VCF (always available to owner)
- `DELETE /api/dashboard/contacts/:id` — Delete single contact
- `DELETE /api/dashboard/contacts` — Clear all contacts
- `GET/PUT /api/super/*` — Super-admin routes (x-super-token auth)

## Database Schema

### `plans` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | 1 = Free (seeded) |
| name | text | "Free", "Pro", etc. |
| max_contacts | integer | Default 200 |
| price_kes | integer | Price in KES |
| features | text | JSON array string |
| is_active | boolean | |

### `users` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| username | text UNIQUE | lowercase, a-z/0-9/_ |
| email | text UNIQUE | |
| password_hash | text | bcrypt hash |
| plan_id | integer | FK → plans.id |
| is_active | boolean | |
| created_at | timestamp | |

### `user_settings` table
| Column | Type | Notes |
|---|---|---|
| user_id | integer PK | FK → users.id |
| card_name | text | Display name on public card |
| bio | text | Tagline/bio |
| whatsapp | text | URL |
| youtube | text | URL |
| wa_channel | text | URL |
| wa_group | text | URL |
| contact_target | integer | How many contacts to unlock VCF |

### `contacts` table
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| user_id | integer | FK → users.id |
| full_name | text | Required |
| phone | text | E.164 format |
| email | text | Optional |
| organization | text | Optional |
| created_at | timestamp | |

Unique constraint: `(user_id, phone)` — prevents per-card duplicates.

### `sessions` table
| Column | Type | Notes |
|---|---|---|
| id | text PK | UUID token |
| user_id | integer | FK → users.id |
| expires_at | timestamp | 30 days |
| created_at | timestamp | |

### `platform_config` table
Key/value store. Current keys: `paystack_public_key`, `paystack_secret_key`, `paystack_test_mode`.

## Environment Variables / Secrets

All sensitive values in Replit Secrets:
- `DATABASE_URL` — auto-provided by Replit PostgreSQL
- `SUPER_ADMIN_EMAIL` — super-admin login email (set in Secrets)
- `SUPER_ADMIN_PASSWORD` — super-admin login password (set in Secrets)

## Database Migrations

Run the migration script to apply schema changes and seed data:
```bash
node lib/db/migrate.mjs
```

## Workflows

- **artifacts/vcf-card: web** — Vite dev server for the frontend
- **artifacts/api-server: API Server** — Express backend

## TypeScript

Every package extends `tsconfig.base.json` with `composite: true`.
Run `pnpm run typecheck` from the root to check all packages.

## Deployment

Build command: `pnpm --filter @workspace/vcf-card run build`
API server is built via esbuild in `artifacts/api-server/build.mjs`
