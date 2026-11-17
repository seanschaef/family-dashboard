#!/usr/bin/env bash
# Turn the wall monitor on or off. Tries several methods because Pi OS varies
# (Wayland vs X11, KMS, HDMI-CEC). Usage:
#   display.sh on | off | toggle | status
# Env:
#   MODE=power|blank   (default power) — 'power' also tries HDMI-CEC for TVs.
set -uo pipefail

ACTION="${1:-status}"
MODE="${MODE:-power}"
STATE_FILE="${STATE_FILE:-$HOME/.config/family-wall/display.state}"
mkdir -p "$(dirname "$STATE_FILE")"

log() { echo "[display] $*"; }

wlr_output() { command -v wlr-randr >/dev/null 2>&1 && wlr-randr 2>/dev/null | awk '/^[^ ]/{print $1; exit}'; }
x_output() { command -v xrandr >/dev/null 2>&1 && DISPLAY="${DISPLAY:-:0}" xrandr 2>/dev/null | awk '/ connected/{print $1; exit}'; }

turn_on() {
  local done=0
  if command -v wlr-randr >/dev/null 2>&1; then
    local o; o="$(wlr_output)"; [ -n "$o" ] && wlr-randr --output "$o" --on >/dev/null 2>&1 && done=1 && log "wlr-randr on ($o)"
  fi
  if [ "$done" = 0 ] && command -v xset >/dev/null 2>&1; then
    DISPLAY="${DISPLAY:-:0}" xset dpms force on >/dev/null 2>&1 && done=1 && log "xset on"
  fi
  if [ "$done" = 0 ] && command -v xrandr >/dev/null 2>&1; then
    local o; o="$(x_output)"; [ -n "$o" ] && DISPLAY="${DISPLAY:-:0}" xrandr --output "$o" --auto >/dev/null 2>&1 && done=1 && log "xrandr on ($o)"
  fi
  command -v vcgencmd >/dev/null 2>&1 && vcgencmd display_power 1 >/dev/null 2>&1 && done=1
  if [ "$MODE" = power ] && command -v cec-client >/dev/null 2>&1; then
    echo 'on 0' | cec-client -s -d 1 >/dev/null 2>&1 && log "cec on"
  fi
  echo on > "$STATE_FILE"
  [ "$done" = 1 ] || log "no display method succeeded (on)"
}

turn_off() {
  local done=0
  # CEC standby for a real TV (full power), only in power mode.
  if [ "$MODE" = power ] && command -v cec-client >/dev/null 2>&1; then
    echo 'standby 0' | cec-client -s -d 1 >/dev/null 2>&1 && log "cec standby"
  fi
  if command -v wlr-randr >/dev/null 2>&1; then
    local o; o="$(wlr_output)"; [ -n "$o" ] && wlr-randr --output "$o" --off >/dev/null 2>&1 && done=1 && log "wlr-randr off ($o)"
  fi
  if [ "$done" = 0 ] && command -v xset >/dev/null 2>&1; then
    DISPLAY="${DISPLAY:-:0}" xset dpms force off >/dev/null 2>&1 && done=1 && log "xset off"
  fi
  if [ "$done" = 0 ] && command -v xrandr >/dev/null 2>&1; then
    local o; o="$(x_output)"; [ -n "$o" ] && DISPLAY="${DISPLAY:-:0}" xrandr --output "$o" --off >/dev/null 2>&1 && done=1 && log "xrandr off ($o)"
  fi
  command -v vcgencmd >/dev/null 2>&1 && vcgencmd display_power 0 >/dev/null 2>&1 && done=1
  echo off > "$STATE_FILE"
  [ "$done" = 1 ] || log "no display method succeeded (off)"
}

case "$ACTION" in
  on) turn_on ;;
  off) turn_off ;;
  toggle) [ "$(cat "$STATE_FILE" 2>/dev/null)" = off ] && turn_on || turn_off ;;
  status) cat "$STATE_FILE" 2>/dev/null || echo unknown ;;
  *) echo "usage: display.sh on|off|toggle|status" >&2; exit 2 ;;
esac
