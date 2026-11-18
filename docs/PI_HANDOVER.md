# Pi setup handover

A runbook to take the Raspberry Pi from a freshly flashed card to the finished
family wall, then wire in the NAS photos and (later) Home Assistant. Written so
the assistant and the user can work through it together over SSH.

No secrets live in this file (the repo is public). Real values — passwords,
tokens, the NAS address — go only in the Pi's **gitignored** files
(`.env.local`, `/etc/family-wall-nas.cred`). Placeholders look like `<this>`.

## For the assistant resuming this

- This repo is already built and deployed (Vercel + Supabase are live). The job
  here is the **Pi**: it currently runs DAKboard and is being reflashed to run
  this app instead.
- You cannot flash a card or reach the Pi from a cloud container. The user
  drives a terminal; you provide exact commands to paste. If the user runs
  `claude remote-control` on the Pi, you can operate it directly.
- Work one numbered step at a time. After each, use the **Check** line before
  moving on. Do not fabricate results you can't see — ask the user to paste
  output.
- `pi/README.md` has the fuller reference for each piece; this is the ordered
  path.

## Current status

Done:
- App builds/lints clean; PWA; live on Vercel.
- Supabase live (roster, calendars, chores/points/reminders/pet, meals/
  groceries, photo collections). RLS forced on every table.
- NAS (Synology DS918+): `WallPhotos` shared folder created, read-only
  `wallphotos` user, SMB enabled, NAS IP reserved in the router.

Pending (this runbook):
1. Flash + first boot of the Pi 5 (user, on their PC).
2. App install + kiosk.
3. NAS mount + photo agent.
4. Home Assistant token (whenever HA is running).

## Values to have on hand

| Placeholder | What it is | Secret? | Where it goes |
|---|---|---|---|
| `<pi-user>` | the Pi login you set in Imager | — | — |
| `<NAS-IP>` | the reserved NAS address, e.g. 192.168.1.50 | no | fstab |
| `<wallphotos-pass>` | the read-only NAS user's password | **yes** | `/etc/family-wall-nas.cred` |
| `<SUPABASE_URL>` / `<SUPABASE_ANON_KEY>` | from Supabase → Project Settings → API (the anon/publishable key is a public client key; safe on the Pi) | no | `.env.local` |
| `<HA_TOKEN>` | Home Assistant long-lived token (later) | **yes** | `.env.local` |

---

## 1. Flash and first boot (user, on the PC)

Raspberry Pi Imager → Device: Raspberry Pi 5 · OS: Raspberry Pi OS (64-bit,
full desktop) · Storage: the microSD card. In **Edit Settings** set: hostname
`familywall`, enable **SSH** (password), username/password, Wi-Fi SSID/password
+ country `CA`, time zone `America/Edmonton`. Write, insert card, power on, wait
2–3 minutes.

**Check:** from the PC, `ping familywall.local` responds.

## 2. SSH in

From the PC terminal (Windows: PowerShell/Terminal; macOS: Terminal):

```bash
ssh <pi-user>@familywall.local
```

**Check:** you get a shell prompt on the Pi.

## 3. Prerequisites

```bash
sudo apt update
sudo apt install -y git chromium-browser unclutter cifs-utils
# Node 20+ :
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # expect v20+
```

**Check:** `node -v` prints v20 or newer; `git --version` works.

## 4. Clone and configure

```bash
cd ~
git clone https://github.com/seanschaef/family-dashboard.git
cd family-dashboard
npm ci
cp .env.example .env.local
nano .env.local
```

Set in `.env.local` (leave the NAS/HA lines until their steps):

```
VITE_SUPABASE_URL=<SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
VITE_DEVICE_MODE=wall
VITE_WEATHER_LAT=53.5461
VITE_WEATHER_LON=-113.4938
```

```bash
npm run build
```

**Check:** `npm run build` ends with "built in …" and no errors.

## 5. Kiosk at boot

```bash
# sign in once so the wall holds its session:
bash pi/kiosk.sh        # logs into the app; use the family/wall account, then confirm the hub shows
# (close it, then install the service)
mkdir -p ~/.config/systemd/user
cp ~/family-dashboard/pi/family-wall.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now family-wall.service
sudo loginctl enable-linger "$USER"
```

**Check:** the wall shows the hub full-screen, and it returns after a reboot.

Portrait rotation (1080×1920), if the display is landscape: Pi 5 is Wayland —
use the Screen Configuration app, or see `pi/README.md` → Portrait rotation.

### Pi OS (trixie, labwc) kiosk notes

Learned on the real Pi 5 (Debian 13 trixie, labwc). Do these as part of step 5.

- **Start at boot.** labwc on this image never activates
  `graphical-session.target`, so the user service alone won't start at login.
  Add it to the desktop's autostart:
  `echo 'systemctl --user start family-wall.service &' >> ~/.config/labwc/autostart`
- **No top panel.** labwc runs the system autostart (`/etc/xdg/labwc/autostart`)
  as well as yours, so the panel can't be removed there, and auto-hide leaves a
  gap. Stop it after login with `pi/nopanel.sh`:
  `echo '~/family-dashboard/pi/nopanel.sh &' >> ~/.config/labwc/autostart`
- **On-screen keyboard.** `--kiosk` (fullscreen) draws above Squeekboard, so the
  keyboard opens hidden behind the app. `kiosk.sh` therefore runs Chromium
  maximized with the Wayland input flags. Add a window rule so it has no title
  bar: inside `<openbox_config>` in `~/.config/labwc/rc.xml`:

  ```xml
  <windowRules>
    <windowRule identifier="chrom*" serverDecoration="no">
      <action name="Maximize"/>
    </windowRule>
  </windowRules>
  ```

  then `labwc --reconfigure`.
- **Keyring prompt.** `kiosk.sh` passes `--password-store=basic` so Chromium
  doesn't block on a "new keyring" password dialog.
- **Time zone.** Edmonton is UTC-6 year round now. If Imager set another zone:
  `sudo timedatectl set-timezone America/Edmonton`.
- **Stale build after an update.** The app is a PWA, so Chromium can keep
  showing the previous build. `pi/update.sh` clears the wall profile's service
  worker cache (the sign-in is kept).

## 6. Monitor on/off schedule (optional, DAKboard-style)

Set the times from the phone app (Today → Wall display), then:

```bash
# add the wall account to ~/family-dashboard/.env.local: WALL_EMAIL / WALL_PASSWORD
cp ~/family-dashboard/pi/family-display.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now family-display.service
```

**Check:** `bash pi/display.sh off` then `bash pi/display.sh on` switch the panel.

## 7. NAS photos

```bash
sudo mkdir -p /mnt/wallphotos
sudo install -m 600 /dev/null /etc/family-wall-nas.cred
sudoedit /etc/family-wall-nas.cred     # two lines:
#   username=wallphotos
#   password=<wallphotos-pass>

# add the mount (uid/gid = this user's; check with: id -u ; id -g):
echo '//<NAS-IP>/WallPhotos /mnt/wallphotos cifs credentials=/etc/family-wall-nas.cred,ro,uid=1000,gid=1000,iocharset=utf8,vers=3.0,nofail,x-systemd.automount 0 0' | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
sudo mount -a
ls /mnt/wallphotos          # should list Family, Christmas, …

# run the photo agent:
mkdir -p ~/.config/family-wall
echo /mnt/wallphotos > ~/.config/family-wall/photos.conf
cp ~/family-dashboard/pi/family-photos.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now family-photos.service
curl -s localhost:8787/health      # {"ok":true,"root":"/mnt/wallphotos","exists":true}

# point the wall at the agent and rebuild:
# add to ~/family-dashboard/.env.local:  VITE_PHOTO_AGENT_URL=http://localhost:8787
cd ~/family-dashboard && npm run build
systemctl --user restart family-wall.service
```

Then on the phone, Photos tab → add a collection per subfolder.

**Check:** `ls /mnt/wallphotos` lists the folders; the health check says
`exists:true`; the wall hub shows photos instead of the hint.

## 8. Home Assistant (later, when HA is running)

HA → profile → Security → create a long-lived token. Add to `.env.local`:

```
VITE_HA_URL=http://homeassistant.local:8123
VITE_HA_TOKEN=<HA_TOKEN>
```

```bash
cd ~/family-dashboard && npm run build
systemctl --user restart family-wall.service
```

**Check:** the wall Home page lists real devices (not "Demo · sample devices").
Nest/Google devices appear once HA's Nest integration is added.

## Updating the Pi later

```bash
bash ~/family-dashboard/pi/update.sh   # pulls, rebuilds, restarts the wall
```

## Verification checklist

- [ ] Hub shows greeting, clock, weather with forecast, calendar, dinner,
      chores, pet, reminders, birthdays.
- [ ] Phone changes (a chore, a reminder) appear on the wall within ~1s.
- [ ] Photos cycle on the hub; a member with a collection shows theirs.
- [ ] Monitor turns off/on at the scheduled times.
- [ ] (When HA is up) Home page toggles a light.
