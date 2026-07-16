# Sprint 1 — Foundation: Real Database + Real Auth

This sprint replaces the MVP's in-browser mock data with a real Supabase
database (Postgres + Auth + Storage) and adds a first, keyword-only search API.
Nothing from the MVP UI breaks — the app still runs and looks the same;
signup/login and search are now backed by a real database instead of mock state.

## Step 1 — Create your Supabase project

1. Go to https://supabase.com, sign up/log in (GitHub login is easiest), and click **New Project**.
2. Pick a name (e.g. `onepaperpreparation`), a database password (save it somewhere safe), and a region close to Pakistan (e.g. Singapore).
3. Wait ~2 minutes for the project to finish provisioning.

## Step 2 — Run the database migration

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/migrations/0001_init.sql` from this project, copy its entire contents, paste into the SQL editor, and click **Run**.
3. You should see "Success. No rows returned." This creates all tables (`profiles`, `mcqs`, `documents`, `attempts`, `practice_days`) and their security policies.

## Step 3 — Get your API keys

1. In Supabase: **Project Settings → API**.
2. Copy the **Project URL**, the **anon public** key, and the **service_role** key (click "Reveal" — keep this one secret).
3. Copy `.env.local.example` to `.env.local` in this project folder and paste the three values in.

## Step 4 — Install dependencies and seed the MCQ data

```bash
npm install
npm run seed
```

You should see: `Done. Inserted 31 MCQs into the mcqs table.` This migrates the
same 31 sample questions the MVP shipped with — from in-browser mock data into
your real database.

## Step 5 — Run it

```bash
npm run dev
```

Open http://localhost:3000, click **Create free account**, sign up with a real
email + password. If your Supabase project has email confirmation enabled by
default (it does, out of the box), check your inbox and confirm before logging
in — or turn confirmation off for faster local testing at **Authentication →
Providers → Email → "Confirm email"** toggle in the Supabase dashboard.

Once logged in, you're using a real account backed by Supabase Auth — refresh
the page and you'll stay logged in (session persists via cookies).

## Step 6 — Test the search API

```bash
curl "http://localhost:3000/api/search?q=Indus"
```

You should get back a JSON result with the "longest river of Pakistan" MCQ —
this is hitting the real database via Postgres full-text search (keyword-only
for now; semantic/vector search is Sprint 2).

## What's still mock in the frontend after this sprint

The Practice, Quiz Builder, Leaderboard, and Analytics *pages* still read from
the in-browser `SUBJECTS` mock array in `components/AppShell.jsx` — only auth
and the new `/api/search` endpoint are wired to the real database so far.
Sprint 2 rewires the Search page (and later sprints rewire the rest) to use
the real data now sitting in Supabase. This is intentional: it lets us verify
the database + auth foundation works correctly before touching the rest of
the UI.

## Troubleshooting

- **"Missing NEXT_PUBLIC_SUPABASE_URL" error when running `npm run seed`** — you
  haven't created `.env.local` yet, or it's missing a value. Check Step 3.
- **Signup succeeds but you're not logged in** — email confirmation is likely
  required; check your inbox, or disable confirmation for local testing (Step 5).
- **`npm run seed` says "Insert failed: new row violates row-level security policy"**
  — you're using the anon key instead of the service_role key in `.env.local`;
  only the service_role key bypasses RLS, which the seed script needs.
