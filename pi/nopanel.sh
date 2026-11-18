#!/bin/sh
# Stop the desktop top panel on the wall. Pi OS (labwc) starts it from the
# system autostart through lwrespawn, so kill the respawner first, then the
# panel. Run from ~/.config/labwc/autostart (see docs/PI_HANDOVER.md).
sleep 2
pkill -f "lwrespawn /usr/bin/wf-panel-pi"
pkill -x wf-panel-pi
exit 0
