# Project conventions (for Claude / contributors)

Family wall dashboard + phone app. DAKboard replacement. See `README.md` and
`BUILD_STATUS.md`.

## Conventions

- Be direct; give constructive criticism. Flag every assumption; don't make one
  unless there is no other option. Never lie.
- Mountain Time context (`America/Edmonton`, `ca-central-1`, `yul1`).
- Never use Arial. Avoid em dashes in prose. The app font is Outfit.
- Before anything that costs money, show the cost and get approval first.

## Stack

- React 19 + Vite 6, **no TypeScript** in `src/` (Edge Functions are Deno/TS).
- Supabase for auth/db/realtime/storage. **RLS on and forced** on every table.
- Styling: tokens in `src/theme.js` + `index.css`, inline style objects in
  components. Keep member colours consistent.
- Wall is tap + swipe only; no typing on the wall. Data entry is the phone app.
- The household roster (names, colours, birthdays) lives in the database
  (`public.members`), never hardcoded. Placeholder/sample content is generic and
  lives only in `src/data/`.

## Build order

Foundation+calendars → chores/points/reminders/pet log → groceries/meals →
photos → weather/birthdays → smart home. Work one step at a time.

## Confidentiality

A member's calendar can be marked `kind='work'`. A work calendar must never
appear on the family hub, only on that member's own page, and whether it shows
event titles or just "Busy" is configurable. Don't surface work event details on
shared screens without confirming.

## Checks before pushing

```bash
npm run lint && npm run build
```
