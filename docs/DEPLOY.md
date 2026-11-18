# Local + deploy handover

How to run this app on a computer and deploy it. Covers two cases: developing
against the **existing** backend, and standing up a **fresh** instance (new
Supabase + new Vercel). For the Raspberry Pi wall, see `docs/PI_HANDOVER.md`.

No secrets live in this file (the repo is public). Real values — keys, tokens —
go only in `.env.local` (gitignored) or your host's env settings. Placeholders
look like `<this>`.

## For the assistant resuming this

- The app is React 19 + Vite 6 (no TypeScript in `src/`), Supabase for
  auth/db/realtime/storage, deployed as a PWA on Vercel. One codebase serves
  both the phone app (`/app/*`) and the wall (`/wall/*`).
- You can run `npm` and `git` where you have a shell; you cannot click through
  the Supabase or Vercel dashboards — give the user exact steps for those.
- Work one numbered step at a time; use the **Check** line before moving on.
- Secrets never go in the repo. The Supabase anon/publishable key is a public
  client key and is safe in `.env.local` and in the browser bundle; the
  service_role key is never used client-side and never committed.

## Prerequisites

- Node 20+ and npm (`node -v`).
- git, and access to the GitHub repo `seanschaef/family-dashboard`.
- A Supabase project and a Vercel account (for deploying).

## 1. Clone and install

```bash
git clone https://github.com/seanschaef/family-dashboard.git
cd family-dashboard
npm ci
```

**Check:** `npm run lint` and `npm run build` both finish without errors.

## 2. Configure `.env.local`

```bash
cp .env.example .env.local
```

Set these (get the URL + anon key from Supabase → Project Settings → API):

```
VITE_SUPABASE_URL=<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon / publishable key>
VITE_WEATHER_LAT=53.5461
VITE_WEATHER_LON=-113.4938
```

Leave `VITE_DEVICE_MODE` unset on a computer (the wall sets it to `wall`). The
`VITE_PHOTO_AGENT_URL` and `VITE_HA_*` lines are Pi-only.

**Check:** `grep VITE_SUPABASE .env.local` shows both values filled.

## 3. Run locally

```bash
npm run dev          # http://localhost:5173
```

Open it, sign in with an account that exists in that Supabase project (create
one in Supabase → Authentication → Users → Add user, Auto Confirm). The app
loads the family roster from the database.

**Check:** you can sign in and the phone app (`/app/today`) renders.

To preview a production build instead:

```bash
npm run build && npm run preview     # http://localhost:4173
```

## 4. Deploy to Vercel

The repo is already set up for Vercel (`vercel.json` sets SPA rewrites and the
`yul1` region).

**Dashboard way:**
1. Vercel → Add New → Project → import the GitHub repo.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
3. Add environment variables (same names as `.env.local`): `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, `VITE_WEATHER_LAT`, `VITE_WEATHER_LON`.
4. Deploy. Pushing to `main` redeploys.

**CLI way:**
```bash
npm i -g vercel
vercel            # first run links the project
vercel --prod     # production deploy
```

**Check:** the deployed URL shows the login screen, and signing in works.

## 5. Standing up a FRESH backend (only if not reusing the existing one)

Skip this if you're pointing at the existing Supabase project.

1. Create a Supabase project (region `ca-central-1` for Edmonton).
2. Apply the migrations in `supabase/migrations/` **in order** (0001 → 0010).
   - With the Supabase CLI: `supabase link --project-ref <ref>` then
     `supabase db push`.
   - Or paste each file into the Supabase SQL editor, oldest first.
   - Note: `0010` documents one policy change that was applied without its
     `DROP` to avoid a destructive prompt; applying the file as-is is fine on a
     fresh database.
3. Deploy the edge function that fetches calendar ICS feeds:
   ```bash
   supabase functions deploy sync-calendars
   ```
   Schedule it (Supabase → Database → Cron, or an external scheduler) to run
   every 15–30 min so calendars stay fresh.
4. Seed the family and roster (no personal data ships in the repo):
   ```sql
   insert into public.families (name, pet_name) values ('<Family name>', '<Pet>');
   -- then one row per person; family_id defaults to the family above via RLS
   -- only when inserted by a signed-in member, so seed as the service role or
   -- set family_id explicitly to the row you just created:
   insert into public.members (family_id, key, name, color, role, birthday, sort_order)
   values ((select id from public.families limit 1), 'm1', '<Name>', '#7B4B8A', 'parent', null, 1);
   -- repeat for m2, m3, ...
   ```
5. Create accounts (Supabase → Authentication → Users → Add user, Auto Confirm),
   then link each to a member and make one an admin:
   ```sql
   update public.profiles set member_id = (select id from public.members where key='m1'),
     is_admin = true where id = (select id from auth.users where email='<you>');
   ```
6. Turn **off** open sign-ups (Supabase → Authentication → Sign In / Providers)
   so strangers with the URL can't join the family.
7. Point `.env.local` (and Vercel env) at the new project and redeploy.

**Check:** a signed-in user lands on their family's data; a second random signup
is refused.

## What is safe vs secret

- Safe in the repo / browser: the Supabase **URL** and **anon/publishable** key,
  the weather coordinates.
- Never in the repo: the Supabase **service_role** key, any account password,
  Home Assistant tokens, NAS credentials. These live in `.env.local`
  (gitignored) or the host's secret settings.
- RLS is forced on every table; data is scoped to the signed-in user's family.
