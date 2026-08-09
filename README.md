# Strategnosis Growth and Delivery Hub

Consultancy growth and project management system for Strategnosis Solutions OPC.
See [SPEC.md](./SPEC.md) for product scope and [TECH_DESIGN.md](./TECH_DESIGN.md) for
architecture. This file covers setup, deployment, and day-to-day operation.

## Stack

Next.js (static export) + TypeScript + Tailwind CSS + Supabase (Postgres, Auth, Storage),
deployed as static files to Cloudflare Pages. No custom backend server — see
TECH_DESIGN.md §1 for why, including the Vercel-vs-Cloudflare tradeoff.

---

## 1. Local setup

### Prerequisites

- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) account
- A free [Cloudflare](https://dash.cloudflare.com/sign-up) account (for deployment, not local dev)

### Install

```bash
npm install
```

### Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` after creating your Supabase project (§2 below).

### Run locally

```bash
npm run dev
```

Opens at `http://localhost:3000`. Client-side routing works the same as the deployed static
build; `npm run build` produces the actual static export into `/out` if you want to test that
exact artifact (see §5).

---

## 2. Database setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com) (free tier). Note the project
   URL and anon key from **Project Settings → API** — put them in `.env.local`.
2. Also copy the **service role key** into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`. This is
   only used by the local seed script (`scripts/seed.mjs`) and must never be committed or
   shipped to the browser.
3. Apply the migrations, in order, via the Supabase SQL editor (or the Supabase CLI — see
   below):
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_functions.sql`
   - `supabase/migrations/0003_rls.sql`
   - `supabase/migrations/0004_storage.sql`
4. In **Authentication → Providers**, enable **Google** (add your OAuth client ID/secret — see
   Google Cloud Console → Credentials → OAuth 2.0 Client, with the Supabase-provided redirect
   URL) and confirm **Email** sign-in is enabled.
5. Seed demo data:

   ```bash
   npm run seed
   ```

   This creates three demo logins (`owner@strategnosis.demo`, `core@strategnosis.demo`,
   `consultant@strategnosis.demo`, all password `Demo1234!`) plus sample clients,
   opportunities, a converted project, tasks, an invoice with a partial payment, and a public
   inquiry — enough to walk the full acceptance scenario in SPEC.md §8.

### Using the Supabase CLI instead of the SQL editor (optional, recommended for repeat use)

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

`db push` applies everything under `/supabase/migrations` in order.

---

## 3. Deployment (Cloudflare Pages)

1. Push this repository to GitHub (private repo recommended — it contains client business
   logic, even though it holds no secrets).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, select
   the repo.
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `out`
4. Add environment variables in the Pages project settings (**not** `.env.local` — that file
   never leaves your machine):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy. Every push to `main` redeploys automatically; pull requests get preview URLs.
6. In Supabase **Authentication → URL Configuration**, add your Cloudflare Pages URL (and any
   custom domain) to the allowed redirect URLs, or Google sign-in will fail after deployment.

A custom domain can be attached in Cloudflare Pages at no extra cost whenever you have one.

---

## 4. Backup procedure

The Supabase free tier has **no automatic backups** — this is a real gap, not a detail to
gloss over. Two options are built in or documented:

- **Quick export (built into the app):** as an owner, go to **Settings → Backup & Export** and
  click "Export all data (JSON)". Downloads every table as one dated JSON file. Do this weekly
  at minimum, and save the file somewhere durable (e.g. your own Google Drive).
- **Full database dump (recommended monthly, or before any risky change):**

  ```bash
  npx supabase login
  npx supabase link --project-ref <your-project-ref>
  npx supabase db dump -f backup-$(date +%Y-%m-%d).sql
  ```

  This is a complete, restorable Postgres dump — the JSON export above is not (it's for
  visibility and light recovery, not disaster recovery).

If the business outgrows the free tier, Supabase Pro (~$25/month) adds automatic daily backups
and point-in-time recovery — worth revisiting once revenue justifies it.

---

## 5. Email digest setup

A once-daily email (8:00 AM Asia/Manila) to every active owner/core-team user, listing
overdue opportunity follow-ups, stale opportunities, overdue tasks, overdue milestones,
overdue invoices, and what's due in the next 7 days — the same data the dashboard shows, just
pushed to your inbox so you don't have to remember to check. Free at this scale (see the cost
breakdown you already discussed). Setup, in order:

1. **Create a [Resend](https://resend.com) account** (free tier: ~3,000 emails/month). For
   real production sending you'd verify your own domain there; for now you can send from
   Resend's shared `onboarding@resend.dev` address, which works without any domain setup.
2. Grab your Resend **API key** from the dashboard.
3. **Deploy the Edge Function:**
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase functions deploy daily-digest
   ```
4. **Set the function's secrets** (Resend key, and optionally your live site URL so digest
   emails link back to the dashboard):
   ```bash
   npx supabase secrets set RESEND_API_KEY=<your-resend-api-key>
   npx supabase secrets set APP_URL=https://website-implementation.brianlc-veraque.workers.dev
   ```
5. **Store your service role key in Supabase Vault** (this is what lets the scheduled job
   call the function — never put the raw key in a migration file or commit it):
   - Supabase dashboard → **Project Settings → Vault** → New secret
   - Name: `service_role_key`, Value: your service role key (same one from `.env.local`)
6. **Run the last migration** (`supabase/migrations/0005_digest_cron.sql`) in the SQL editor,
   same routine as the earlier migrations — this schedules the daily job via `pg_cron`.
7. To test immediately instead of waiting until 8 AM:
   ```bash
   npx supabase functions invoke daily-digest
   ```

To change who receives it: it's automatic — anyone with an **active** `owner` or `core_team`
role in Settings → Users & Access gets it. No separate recipient list to maintain.

---

## 6. Testing

```bash
npm test         # Vitest unit tests (pure logic: date/currency formatting, status mapping)
npm run build    # Full static export build + TypeScript check
```

`npm test` covers the logic that doesn't depend on a live database. The access-control
boundary that matters most — a temporary consultant can't see other clients' data or financial
records — lives entirely in Postgres Row-Level Security policies, which need a real database
and real auth sessions to exercise. That couldn't be automated in this environment (no live
Supabase project was available while building). Instead, run
**`supabase/tests/rls_checks.sql`** in the Supabase SQL editor after seeding — it impersonates
each demo role and asserts what they can and can't see. Do this once after initial setup and
again after any RLS policy change.

### Manual test plan (acceptance scenario, SPEC.md §18)

1. Sign in as `owner@strategnosis.demo`.
2. Create a client, add a contact.
3. Create an opportunity for that client with a next action and due date; move it through
   pipeline stages.
4. Mark it **Won** — confirm a project is created automatically with the client already
   attached (no re-entry).
5. Add milestones and tasks; assign a task to `consultant@strategnosis.demo`.
6. Sign in as the temp consultant in a separate/incognito session — confirm they see only
   their assigned project and task, nothing else (no Clients/Opportunities/Billing nav items,
   dashboard shows only their own work).
7. Back as owner/core: mark a billing-trigger milestone complete, create an invoice, record a
   partial payment, confirm the outstanding balance updates.
8. Check the dashboard reflects overdue items, pipeline value, and outstanding receivables
   correctly.

---

## 7. User guide (core team)

- **Dashboard**: what needs attention (overdue) and what's coming up, at a glance.
- **Clients**: search/filter by status; click a row for full detail, contacts, and linked
  opportunities/projects.
- **Opportunities**: board view groups by pipeline stage — use the stage dropdown on a card to
  move it forward. List view is better for scanning/searching. Every opportunity needs a next
  action and due date; losing one requires a reason.
- **Projects**: tabs for Milestones, Tasks, Team, Documents, Billing. "Mark Won → Create
  Project" on an opportunity's detail page does the conversion for you.
- **Tasks**: your cross-project to-do list, grouped Overdue / This Week / Later.
- **Consultants**: your bench of temporary personnel — searchable by expertise.
- **Billing**: invoices and payments across all projects; outstanding total shown up top.
- **Settings** (owner only): activate new signups and assign roles, manage the service
  catalogue, and export data.

## 8. Administrator guide (owner)

- **New team member**: they sign up at `/login` (Google or email); their account is created
  inactive. Go to **Settings → Users & Access**, set their role, and check Active.
- **Roles**: Owner (full access), Core Team (everything except user/role management),
  Temporary Consultant (only their assigned project and tasks — enforced at the database level,
  not just hidden in the UI).
- **Deactivating someone**: uncheck Active in Settings — this blocks their access immediately
  without deleting their history (tasks, notes, etc. stay attributed to them).
- **Service catalogue**: seeded with the 18 categories validated against the CV; add, edit, or
  deactivate from Settings.

---

## 9. Known limitations (be upfront about these)

- **No automatic backups** on the Supabase free tier — see §4. This is the single biggest
  operational risk of the free-tier setup.
- **Column-level restriction on consultant rates** relies on row-level RLS (a temp consultant
  can only ever query their own consultant row, so they can never see anyone else's rate) —
  this is correct but worth knowing it's row-level reasoning, not a column-permission grant.
- **The email digest (§5) sends one shared email to all owner/core-team recipients**, not a
  personalized email per assignee — reasonable at 2-person scale, would need per-person
  filtering to make sense for a larger team.
- **No drag-and-drop on the opportunity board** — stage changes happen via a dropdown on each
  card, a deliberate simplification to avoid a fragile hand-rolled drag-and-drop implementation.
- **RLS has been verified against the live production database** — real login, dashboard, and
  role-restricted access were all confirmed working end-to-end after deployment. The formal
  per-role SQL test script (`supabase/tests/rls_checks.sql`) still hasn't been run, though — do
  that before making any further RLS policy changes, to catch regressions.
- **Public landing page ships with no named clients** per your instruction — only sector/service
  categories are shown until you explicitly approve specific engagements for publication.
- Proposal tracking is fields on an Opportunity, not a standalone versioned module; the
  consultant pool is a simple table, not a searchable marketplace. Both were deliberate MVP
  scope cuts — see SPEC.md §4.2 for the Phase 2 versions.

## 10. Phase 2 roadmap

See SPEC.md §4.2 for the full list. Highest-value next additions, roughly in order:
1. Full financial monitoring (receivables aging, project contribution margin)
2. Standalone Proposal module with versioning
3. Marketing content calendar and campaign tracking
4. Searchable consultant marketplace
5. Expanded reporting with CSV export across all tables
6. Public landing page content expansion (once specific case studies are approved for
   publication)
7. Per-person email digest filtering, once the team grows past 2 people
