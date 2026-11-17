# Family Dashboard

A family wall dashboard for a portrait touchscreen on a Raspberry Pi 4, plus a
phone/computer web app for entering data. Replaces DAKboard.

One codebase, two deployments:

- **Vercel** serves the installable phone/computer PWA (region Montreal `yul1`).
- **The Raspberry Pi** serves the same build locally in Chromium kiosk mode for
  the wall (so it can later reach Home Assistant on the LAN).

## Stack

- React 19 + Vite 6, no TypeScript.
- Supabase (Postgres + Auth + Realtime + Storage), region `ca-central-1`.
- `vite-plugin-pwa` for the installable, offline-capable PWA.
- Everything behind login; each household member has their own account. The
  household roster (names, colours, birthdays) lives in the database
  (`public.members`), not in the source.

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in Supabase URL + anon key
npm run dev                     # http://localhost:5173
```

Routes:

- `/app/*` — phone/computer app (Today, Calendar, Groceries, Meals, Chores,
  Photos). Default on phones/computers.
- `/wall/*` — wall screen (Hub, Calendar, member pages, Meals, Home). The Pi
  sets `VITE_DEVICE_MODE=wall` so `/` boots straight to `/wall/hub`.

## Layout

```
src/
  wall/        Wall screens (1080x1920, tap + swipe, auto-return to hub)
  phone/       Phone app tabs
  components/  Shared UI (nav bars, icons, auth gate)
  lib/         Supabase client, auth, members, time, calendars
  config/      Navigation structure
  data/        SAMPLE placeholder data (generic; replaced feature-by-feature)
  theme.js     Palette + style helpers (Style C "warm and family-friendly")
supabase/      Migrations + the ICS sync Edge Function
pi/            Raspberry Pi kiosk + display scripts and setup guide
```

## Design

Style C "warm and family-friendly": cream `#FBF5EC`, white cards with `#EFE3D2`
borders, ink `#2B2420`, Outfit font. Each member gets an accent colour from the
palette, assigned in the database.

See `BUILD_STATUS.md` for what is done, what is placeholder, and what is next.
