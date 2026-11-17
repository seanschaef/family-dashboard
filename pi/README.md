# Raspberry Pi wall screen

The wall runs the **same app** as the phone, but served **locally** on the Pi
and shown full-screen in Chromium kiosk mode. Local hosting matters: a browser
on the public HTTPS site is blocked from calling local devices, so the wall has
to run on the Pi to reach Home Assistant on your LAN later (step 6).

Target: Raspberry Pi 4, Raspberry Pi OS (Bookworm, 64-bit), portrait
1080 x 1920 touchscreen.

## One-time setup

1. Flash Raspberry Pi OS and boot to the desktop. Set the Pi to auto-login to
   the desktop (`sudo raspi-config` → System Options → Boot / Auto Login →
   Desktop Autologin).

2. Install packages:
   ```bash
   sudo apt update
   sudo apt install -y git chromium-browser unclutter
   ```
   (Install Node 20+ via your preferred method, e.g. `nodesource` or `nvm`.)

3. Clone and build:
   ```bash
   cd ~
   git clone <this-repo-url> family-dashboard
   cd family-dashboard
   npm ci
   cp .env.example .env.local
   # Edit .env.local: set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
   # and VITE_DEVICE_MODE=wall   (boots straight to /wall/hub)
   npm run build
   ```

4. Sign in once: run `bash pi/kiosk.sh`, log in with the family account you want
   the wall to use (e.g. a shared "wall" account). The session persists, so the
   wall lands on the hub on every future boot.

5. Enable the kiosk at boot:
   ```bash
   mkdir -p ~/.config/systemd/user
   cp ~/family-dashboard/pi/family-wall.service ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now family-wall.service
   sudo loginctl enable-linger "$USER"
   ```

## Portrait rotation

Rotate the display to portrait depending on your Pi OS session:

- **Wayland (Bookworm default)**: Screen Configuration app (`wlr-randr`), or add
  to `~/.config/wayfire.ini` / `labwc` autostart.
- **X11**: `xrandr --output HDMI-1 --rotate right` in an autostart script.
- **Display-manager agnostic**: add `video=HDMI-A-1:1080x1920@60,rotate=90` to
  `/boot/firmware/cmdline.txt` (single line).

Match the touch input orientation to the display if taps land in the wrong
place (libinput `CalibrationMatrix`, or the touchscreen's own setting).

## Monitor auto on/off (like DAKboard)

The wall turns its monitor off and on at set times. Two ways:

### App-controlled (recommended)

Set the schedule from the phone app (Today → Wall display): weekday/weekend on
and off times, and power-off vs blank. The Pi applies it within a minute.

1. Create a dedicated wall account (or reuse the one the kiosk logs in with) and
   add it to `~/family-dashboard/.env.local`:
   ```
   WALL_EMAIL=wall@yourfamily.example
   WALL_PASSWORD=...
   ```
2. Install the scheduler service:
   ```bash
   cp ~/family-dashboard/pi/family-display.service ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now family-display.service
   ```

If Supabase isn't set up yet, the agent falls back to
`~/.config/family-wall/display.conf` (same keys as the defaults in
`pi/display-agent.mjs`) or built-in defaults (on 06:30 / off 22:00, weekends
08:00 / 22:30).

### Simple cron (no backend)

If you'd rather hard-code times and skip the agent:
```cron
30 6  * * 1-5  MODE=power bash $HOME/family-dashboard/pi/display.sh on
0  22 * * *    MODE=power bash $HOME/family-dashboard/pi/display.sh off
0  8  * * 0,6  MODE=power bash $HOME/family-dashboard/pi/display.sh on
```
Run `crontab -e` as the desktop user (not root) so it has display access.

### How it powers the screen

`pi/display.sh on|off` tries, in order: `wlr-randr` (Wayland), `xset`/`xrandr`
(X11), `vcgencmd display_power`, and HDMI-CEC (`cec-client`) for TVs. "Blank"
mode just sleeps the output; "power" mode also sends CEC standby so a TV fully
powers down. Test it directly: `bash pi/display.sh off` then `... on`.

## Updating

The Pi pulls new code from the repo:

```bash
bash ~/family-dashboard/pi/update.sh
```

Add it to a cron/systemd timer if you want hands-off updates. It rebuilds and
restarts `family-wall.service`.

## Notes

- The wall never types; it is tap-to-check and swipe only. The app auto-returns
  to the hub after inactivity.
- `kiosk.sh` serves the build on `localhost:4173` (`npm run serve:wall`) and
  opens Chromium against it.
