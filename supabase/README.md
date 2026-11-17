# Supabase

Project region: **Canada (Central) `ca-central-1`**. RLS is enabled and forced
on every table.

## Contents

- `migrations/0001_foundation.sql` — families, profiles (one per auth user,
  auto-created on signup), calendars, calendar_events, plus RLS policies and
  realtime.
- `functions/sync-calendars/` — Deno Edge Function that fetches each linked ICS
  feed server-side, parses events (handles common recurrences), and caches them
  in `calendar_events`.

## Applying

Either path works; this project was set up via the Supabase tooling directly.

**Via CLI:**
```bash
supabase link --project-ref <your-ref>
supabase db push                 # applies migrations/
supabase functions deploy sync-calendars
```

**Via dashboard:** paste `migrations/0001_foundation.sql` into the SQL editor
and run it; create the function in Edge Functions and paste
`functions/sync-calendars/index.ts`.

## After first deploy

- Each family member signs up (or is invited). A `profiles` row is created
  automatically and attached to the single family.
- Set each profile's `person_key` (`sandi`/`sean`/`lewis`/`elliot`), `role`
  (`parent`/`teen`/`child`) and `color` so pages map to the right person.
- Add calendar ICS links in the app (Today → Calendar links), then "Refresh
  events now" to populate `calendar_events`.

## Recurrence support (sync-calendars)

Handles non-recurring events and `RRULE` FREQ `DAILY`, `WEEKLY` (with `BYDAY`),
`MONTHLY`, `YEARLY` with `INTERVAL`/`COUNT`/`UNTIL`, expanded over a window of
−7 to +60 days. Weekly-with-interval>1 plus `BYDAY` is approximate; file a note
if a specific repeating event looks off and we will extend the parser.
