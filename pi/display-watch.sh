#!/usr/bin/env bash
# Runs the display schedule agent once a minute, inside the graphical session so
# it can reach the display (DISPLAY / WAYLAND_DISPLAY). Managed by
# family-display.service.
set -uo pipefail
cd "${APP_DIR:-$HOME/family-dashboard}"
while true; do
  node pi/display-agent.mjs || true
  sleep 60
done
