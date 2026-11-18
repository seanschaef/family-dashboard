#!/usr/bin/env bash
# Pull the latest code and rebuild the wall. The Pi can run this on a timer or
# on demand. Restarts the kiosk service so the new build shows.
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/family-dashboard}"
cd "$APP_DIR"

echo "Updating family dashboard in $APP_DIR"
git pull --ff-only
npm ci
npm run build

# Restart the wall if it is managed by systemd (see pi/README.md).
if systemctl --user is-enabled family-wall.service >/dev/null 2>&1; then
  # The app is a PWA: drop the wall profile's cached service worker so the new
  # build shows instead of the old one. Sign-in (local storage) is kept.
  systemctl --user stop family-wall.service
  rm -rf "$HOME/.config/family-wall/Default/Service Worker"
  systemctl --user start family-wall.service
  echo "Restarted family-wall.service"
else
  echo "Rebuilt. Restart the kiosk to pick up changes."
fi
