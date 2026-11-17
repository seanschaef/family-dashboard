# Setup guide

How to get the family dashboard running on everyone's phones and on the
Raspberry Pi wall. Two parts; do Part A first.

- Live app: https://family-dashboard-sean-schaefer-s-projects.vercel.app
- The household (names, colours, birthdays) is already set up in the database.
  The first time each person signs in, their account joins the household
  automatically.

---

## Part A - Phones and computers (the app)

Everyone does this on their own phone. Takes about two minutes each.

### 1. Open the app and sign in

1. Open the live app link above in your browser (Safari on iPhone, Chrome on
   Android).
2. Tap **"Use an email sign-in link instead"**.
3. Enter your email and tap **Send sign-in link**.
4. Open the email and tap the link. You are now signed in, and your account is
   attached to the household. (There is no separate "sign up" - the link both
   creates your account and signs you in.)

### 2. Install it like an app (optional but nice)

- **iPhone (Safari):** Share button -> **Add to Home Screen**.
- **Android (Chrome):** menu (three dots) -> **Install app** / **Add to Home
  Screen**.

It then opens full-screen like a normal app and works offline for the grocery
list.

### 3. One-time household setup (any one phone can do these)

**Calendar feeds** - Today -> **Calendar links**:
1. Paste a person's private ICS link (see "Getting ICS links" below).
2. Choose whose calendar it is, choose Personal or Work, tap **Add calendar**.
3. Repeat for each person/calendar.
4. Tap **Refresh events now**. Events then appear on the wall and in the
   Calendar tab, colour-coded by person. Work calendars stay off the shared
   hub.

**Wall widgets** - Today -> **Wall widgets**: for each person pick what shows in
the open slot on their wall page (Weather, Countdown, Next up, Note, or None),
then **Save**.

**Wall display schedule** - Today -> **Wall display**: set the on/off times for
the monitor (weekday and weekend). The Pi applies this.

### Getting ICS links

- **Google Calendar (computer):** Settings -> click the calendar on the left ->
  **Integrate calendar** -> copy the **Secret address in iCal format** (ends in
  `.ics`). Treat it like a password.
- **Outlook / Office 365 (web):** Calendar -> **Settings** -> **Shared
  calendars** -> under Publish a calendar, pick the calendar and **Publish**,
  then copy the **ICS** link.

---

## Part B - The Raspberry Pi wall

One-time setup on the Pi. The wall runs the same app, served locally, full
screen. (The short version of `pi/README.md`.)

**You need:** Raspberry Pi 4, Raspberry Pi OS (64-bit), the portrait
touchscreen, and the Supabase URL + anon key (ask me, or copy from the app's
Vercel project env vars - the anon key is a public client key, not a secret).

### 1. Prepare the Pi

1. Flash **Raspberry Pi OS (64-bit)** and boot to the desktop.
2. Set it to log in to the desktop automatically: `sudo raspi-config` -> System
   Options -> Boot / Auto Login -> **Desktop Autologin**.
3. Install packages:
   ```bash
   sudo apt update
   sudo apt install -y git chromium-browser unclutter
   ```
   Install **Node.js 20+** (e.g. with `nvm`, or the NodeSource installer).

### 2. Get the code and configure it

```bash
cd ~
git clone https://github.com/seanschaef/family-dashboard.git
cd family-dashboard
npm ci
cp .env.example .env.local
nano .env.local
```

In `.env.local` set:
```
VITE_SUPABASE_URL=https://hzecmuqnjcabmkmhctkh.supabase.co
VITE_SUPABASE_ANON_KEY=<the anon key>
VITE_DEVICE_MODE=wall
```
`VITE_DEVICE_MODE=wall` makes the Pi boot straight to the wall. Then build:
```bash
npm run build
```

### 3. Sign the wall in once

```bash
bash pi/kiosk.sh
```
Chromium opens full screen. Sign in with the account you want the wall to use
(a shared "wall" account is tidy - see step 5). The session is remembered, so
it lands on the hub on every future boot. Press `Ctrl+W` / `Alt+F4` to close for
now.

### 4. Make it start on boot

```bash
mkdir -p ~/.config/systemd/user
cp ~/family-dashboard/pi/family-wall.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now family-wall.service
sudo loginctl enable-linger "$USER"
```

### 5. Portrait rotation

Rotate the display to portrait (the method depends on your Pi OS version) -
Screen Configuration app on Wayland, `xrandr --output HDMI-1 --rotate right` on
X11, or add `video=HDMI-A-1:1080x1920@60,rotate=90` to
`/boot/firmware/cmdline.txt`. Full detail in `pi/README.md`.

### 6. Monitor auto on/off

Two options (full detail in `pi/README.md`):

- **Simple:** add two cron lines that call `pi/display.sh on` / `off` at fixed
  times. No account needed.
- **App-controlled (recommended):** so you can change the times from the phone.
  Create a dedicated **wall account with a password** in Supabase (Dashboard ->
  Authentication -> Users -> Add user), add `WALL_EMAIL` / `WALL_PASSWORD` to
  `.env.local`, then:
  ```bash
  cp ~/family-dashboard/pi/family-display.service ~/.config/systemd/user/
  systemctl --user daemon-reload
  systemctl --user enable --now family-display.service
  ```

### 7. Updating the wall later

When the app changes, update the Pi with:
```bash
bash ~/family-dashboard/pi/update.sh
```
It pulls the latest code, rebuilds, and restarts the wall.

---

## Quick reference

| What | Where |
|---|---|
| App (phones/computers) | the live link at the top |
| Add calendars | Today -> Calendar links |
| Choose wall widgets | Today -> Wall widgets |
| Monitor on/off times | Today -> Wall display |
| Pi deep setup / display scripts | `pi/README.md` |
| Database region | Supabase `ca-central-1` |
