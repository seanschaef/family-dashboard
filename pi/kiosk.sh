#!/usr/bin/env bash
# Launch the wall screen in Chromium kiosk mode on the Raspberry Pi.
# Serves the LOCAL build (so the wall can later reach Home Assistant on the LAN
# — a cloud HTTPS page is blocked from calling local devices) and opens it
# full-screen, no cursor, no chrome.
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/family-dashboard}"
PORT="${PORT:-4173}"
URL="http://localhost:${PORT}/"

cd "$APP_DIR"

# Pick whichever Chromium binary this Pi OS ships.
CHROME="$(command -v chromium-browser || command -v chromium || true)"
if [ -z "$CHROME" ]; then
  echo "Chromium not found. Run: sudo apt install -y chromium-browser" >&2
  exit 1
fi

# Share the graphical-session env with user services (so the display
# scheduler, family-display.service, can reach the screen).
systemctl --user import-environment DISPLAY WAYLAND_DISPLAY XAUTHORITY 2>/dev/null || true

# Keep the screen awake (works under X; harmless elsewhere).
if command -v xset >/dev/null 2>&1; then
  xset s off || true
  xset -dpms || true
  xset s noblank || true
fi
command -v unclutter >/dev/null 2>&1 && unclutter -idle 0.5 -root &

# Serve the built app locally if it is not already up.
if ! curl -sf -o /dev/null "http://localhost:${PORT}/"; then
  nohup npm run serve:wall >/tmp/family-wall-server.log 2>&1 &
  for _ in $(seq 1 30); do
    curl -sf -o /dev/null "http://localhost:${PORT}/" && break
    sleep 1
  done
fi

# Clear any "exited uncleanly" restore bubble from a power cut.
PROFILE="$HOME/.config/family-wall"
mkdir -p "$PROFILE"
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' \
  "$PROFILE/Default/Preferences" 2>/dev/null || true

# Chromium crashes (SIGTRAP) if it starts while the monitor is in power-save,
# e.g. after a reboot or update at night. Wake every output first and leave a
# marker so pi/display-keeper.py holds off re-sleeping it for a minute while
# Chromium comes up. (A running Chromium is fine when the monitor sleeps.)
touch "$PROFILE/kiosk-start"
if command -v wlopm >/dev/null 2>&1; then
  wlopm 2>/dev/null | awk '{print $1}' | while read -r o; do wlopm --on "$o" >/dev/null 2>&1 || true; done
  sleep 2
fi

exec "$CHROME" \
  --start-maximized \
  --app="$URL" \
  --user-data-dir="$PROFILE" \
  --noerrdialogs \
  --password-store=basic \
  --ozone-platform=wayland \
  --enable-wayland-ime \
  --wayland-text-input-version=3 \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --autoplay-policy=no-user-gesture-required
