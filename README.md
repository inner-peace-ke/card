<div align="center">
  <img src="https://i.ibb.co/0jvxFXQR/Chat-GPT-Image-Mar-28-2026-09-15-11-AM.png" alt="WOLF TECH" width="160" style="border-radius: 50%;" />

  <h1>WOLF TECH VCF</h1>
  <p><strong>Digital contact card with a crowd-sourced VCF unlock system.</strong></p>
  <p>Visitors submit their name and phone number. Once a target contact count is reached, a VCF file containing all contacts is unlocked for download. Built for Vercel + Neon PostgreSQL.</p>

  <img src="https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-green?logo=postgresql" />
  <img src="https://img.shields.io/badge/React-Vite-blue?logo=react" />
</div>

---

## Features

- Dark green cyber / matrix theme
- International phone input with country flag selector and E.164 format validation
- Progress bar tracking toward an admin-set contact target
- VCF file unlocks and becomes downloadable only when the target is reached
- Success popup after submission — prompts users to follow the channel and join the group (where the VCF will be shared)
- Duplicate phone number detection with a friendly message
- PIN-protected admin panel at `/admin`
  - View all collected contacts
  - Delete individual contacts
  - Update the target count in real time
  - Download the VCF at any time regardless of target status
- Serverless API functions (Vercel) + Express dev server (local)
- One config file to rule everything

---

## Quick Deploy to Vercel

### 1. Fork / clone the repo

```bash
git clone https://github.com/your-username/wolftech-vcf.git
cd wolftech-vcf
```

### 2. Create a Neon database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project and database
3. Copy the **connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

### 3. Edit `config.ts`

This is the **only file you need to edit**. It lives at the project root:

```ts
// config.ts
export const config = {
  DATABASE_URL: "postgresql://your-neon-connection-string-here",
  ADMIN_PIN: "your-secret-pin",   // PIN to access /admin
  CONTACT_TARGET: 100,             // number of contacts needed to unlock VCF
};
```

| Field | Description |
|---|---|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `ADMIN_PIN` | A PIN only you know — protects the admin panel at `/admin` |
| `CONTACT_TARGET` | How many contacts must be collected before VCF is available |

> **Tables are auto-created on first deployment** — no migration commands needed.

### 4. Push to GitHub

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

### 5. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository**
2. Select your repo
3. **Root Directory** — leave it **blank** (project root)
4. **Build & Output Settings** — leave as default (the `vercel.json` handles it)
5. Click **Deploy**

That's it. Your site will be live on a `.vercel.app` domain.

---

## Local Development

```bash
# Install dependencies
pnpm install

# Push schema to your Neon database (first time only)
cd lib/db && pnpm db:push && cd ../..

# Start all servers
pnpm --filter @workspace/api-server run dev    # Express API on :8080
pnpm --filter @workspace/vcf-card run dev      # React frontend
```

Visit `http://localhost:5173` (or the port shown in terminal).

---

## Admin Panel

Go to `/admin` on your deployed site.

- Enter your `ADMIN_PIN` from `config.ts`
- **View contacts** — see everyone who submitted
- **Delete** — remove any contact
- **Set target** — change the unlock threshold live
- **Download VCF** — download all contacts as a `.vcf` file anytime

---

## Project Structure

```
.
├── api/                        # Vercel serverless functions
│   ├── contacts/               #   POST, GET stats, download
│   ├── admin/                  #   Protected admin endpoints
│   ├── _db.ts                  #   Shared DB + auto-table creation
│   ├── _auth.ts                #   PIN auth helper
│   └── _vcf.ts                 #   VCF file generator
│
├── artifacts/
│   ├── vcf-card/               # React + Vite frontend
│   │   ├── src/pages/
│   │   │   ├── DigitalCard.tsx #   Public contact card
│   │   │   └── Admin.tsx       #   Admin panel
│   │   └── public/             #   Favicon, OG image
│   │
│   └── api-server/             # Express server (local dev only)
│
├── lib/
│   ├── db/                     # Drizzle ORM + schema
│   └── api-zod/                # Zod validation schemas
│
├── config.ts                   # ← EDIT THIS ONLY
├── vercel.json                 # Vercel build config
└── README.md
```

---

## VCF Format

Contacts are stored and exported in **E.164 international format** (e.g. `+254713046497`). This format is recognised by every phone, OS, and contact app worldwide. The VCF file is compatible with:

- Android (Contacts app, WhatsApp)
- iPhone (Contacts app)
- Google Contacts
- Outlook

---

## Stay Updated

The VCF file is shared exclusively on:

- 📡 **WhatsApp Channel** — [Follow for updates](https://whatsapp.com/channel/0029Vb6dn9nEQIaqEMNclK3Y)
- 👥 **WhatsApp Group** — [Join the community](https://chat.whatsapp.com/HjFc3pud3IA0R0WGr1V2Xu)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7 + TailwindCSS 4 |
| Routing | Wouter |
| Phone input | react-phone-number-input |
| Backend (Vercel) | Vercel Serverless Functions (TypeScript) |
| Backend (local) | Express.js |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Validation | Zod |
| Monorepo | pnpm workspaces |

---

<div align="center">
  <sub>Built by <strong>WOLF TECH</strong> · I explore systems</sub>
</div>
