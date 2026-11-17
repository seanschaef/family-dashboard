# Build status

Build order (from the handoff):

1. **Foundation (repo, Supabase, Vercel, auth, Pi kiosk) and calendars** ← here
2. Chores, points and rewards, reminders, pet log
3. Groceries and meals
4. Photos
5. Weather and birthday countdowns
6. Smart home

## Step 1 — done in code

- Vite + React 19 app; builds clean, lints clean, installable PWA (offline
  shell, service worker).
- Design system (Style C) as tokens + shared components. Outfit font.
- Auth: login (password or email magic link), session persistence, route gate.
  Each family member gets their own account.
- Routing: wall (`/wall/*`) and phone (`/app/*`), device-aware home route.
- Wall shell: 1080x1920 frame scaled to any screen, bottom nav on every page,
  **swipe left/right between pages**, **tap-to-check**, **auto-return to hub**
  after inactivity.
- All seven wall pages and all phone tabs built to match the mockups.
- **Calendars**: `calendars` + `calendar_events` tables, a settings screen to
  paste private ICS links (per person, personal/work, show-on-hub), and the
  `sync-calendars` Edge Function that fetches + parses + caches ICS server-side.
  a member's work calendar is modelled as `kind='work'` and is never shown on the
  hub.
- Pi kiosk: `pi/` scripts (serve local build + Chromium kiosk), a systemd user
  service, an update script, and a setup guide.
- Vercel config: SPA rewrites, `yul1` region.

## Added after step 1 (your requests)

- **Calendar views** — Day / Week / Month on **both** the phone (Calendar tab)
  and the **wall** (new Calendar page in the bottom nav). Colour-coded by person,
  prev/next/Today, shared model (`src/lib/calendar.js`), same `calendar_events`
  source. Wall interaction: tap the Day/Week/Month buttons and `‹ ›`, plus
  swipe — horizontal on the calendar body moves the date, vertical switches the
  view zoom (the wall's page-swipe is suppressed over the calendar body so they
  don't fight; change pages via the bottom nav there).
- **Wall display auto on/off** (DAKboard-style monitor control):
  - Phone screen (Today → Wall display) to set weekday/weekend on+off times and
    power-off vs blank, stored in a new `wall_settings` table (migration 0002).
  - Pi side: `pi/display.sh` (multi-method: wlr-randr / xset / xrandr / vcgencmd
    / HDMI-CEC), `pi/display-agent.mjs` applying the schedule every minute via
    `family-display.service`, plus a no-backend cron option. Documented in
    `pi/README.md`.

## Roster in the database (privacy)

The household roster (names, colours, birthdays) lives in `public.members`, not
in the source. The app loads it via `useMembers()`; nav, member pages, calendar
colours and pickers are all derived from it. The committed source and sample
data contain only generic placeholders, so the repository can be public with no
personal data. Git history was squashed to a single commit for the same reason.

## Placeholder (intentional, filled in later steps)

- Chores/pet/reminders tap state is **local only** right now (toggles in the
  UI but does not persist). Persistence + rotation + points land in step 2.
- Groceries add/check/clear works locally; realtime sync + offline store is
  step 3.
- Meals, Photos, Weather, Smart home pages render with sample data; wiring is
  steps 3–6.
- All sample content lives in `src/data/sample.js`. None of it is real family
  data.

## Needs you (so I can finish wiring step 1)

- [ ] Create empty GitHub repo `seanschaef/family-dashboard` → I connect + push.
- [ ] Create a new **free** Supabase org → I create the project in
      `ca-central-1`, apply the migration, deploy the function.
      (Heads-up: Supabase may limit free projects per account; if a 3rd free
      project is blocked, options are upgrading to Pro ~$25 USD/mo or pausing an
      unused project. I'll flag it the moment it comes up.)
- [ ] Vercel: I can create the project and set the env vars; linking it to the
      new repo for auto-deploy needs the repo to exist first.

## Open items from the brief (still to confirm)

- Work event titles vs "Busy" on the work-calendar owner's page (confidentiality). Modelled; final
  behaviour TBD before his page shows real data.
- Auto-return timing (default 120s — easy to change in `WallLayout.jsx`).
- the youngest child's login approach (own vs shared/parent-managed).
- Widget for the adult pages' open slot.
- Whether to keep one-tap staples on the wall.
- Calendar ICS links from each person (the plumbing is ready; just paste them
  into Today → Calendar links).
- ManageSoccer: no public API; need to check for an ICS subscription link.

## Decisions I made (flagging, per your preference)

- **Stable Vite 6**, not soccer-manager's rolldown-vite. Rolldown-vite is still
  experimental; for a brand-new project I went with the stable release to keep
  risk low. Same React 19 / npm / Supabase / Vercel otherwise. Say the word and
  I'll switch to rolldown to match exactly.
- PWA icon is an inline SVG mark (no binary assets shipped). Swap in 192/512
  PNGs later if you want App Store-grade icons.
- Calendars assign a person via a `person_key` string for now, rather than a
  hard link to a profile row, so the feature works before profiles are seeded.
