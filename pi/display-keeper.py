#!/usr/bin/env python3
"""Keep the wall monitor asleep at night, and wake it on a touch.

Why this exists: on Pi OS (labwc/Wayland) a monitor put to sleep with DPMS
(wlopm --off) briefly drops its HDMI link, and labwc treats the reconnect as a
new screen and powers it straight back on. This loop notices that and puts it
back to sleep; in practice it happens once, then the monitor stays off.

- The schedule decides on/off: pi/display-agent.mjs (via display-watch.sh)
  writes "on" or "off" to ~/.config/family-wall/display.state once a minute.
- While the state is "off", the monitor is kept in power-save.
- A touch on the touchscreen wakes it for WAKE_SECONDS (the wall shows its
  black night screen; tap again to see the dashboard).

Run by family-display-keeper.service. No dependencies beyond Python.
"""
import glob
import os
import select
import struct
import subprocess
import time

STATE = os.path.expanduser('~/.config/family-wall/display.state')
WAKE_SECONDS = 120
POLL = 0.25
# Putting the monitor to sleep makes the touchscreen (powered through it)
# spit out events; ignore input for this long after a sleep.
SLEEP_GRACE = 6.0

# struct input_event on 64-bit Linux: timeval (2 x long), type u16, code u16,
# value s32. A real tap is EV_KEY / BTN_TOUCH pressed.
EVENT = struct.Struct('llHHi')
EV_KEY, BTN_TOUCH, BTN_LEFT = 1, 0x14A, 0x110


def tapped(data):
    for off in range(0, len(data) - EVENT.size + 1, EVENT.size):
        _, _, etype, code, value = EVENT.unpack_from(data, off)
        if etype == EV_KEY and code in (BTN_TOUCH, BTN_LEFT) and value == 1:
            return True
    return False

os.environ.setdefault('XDG_RUNTIME_DIR', f'/run/user/{os.getuid()}')
os.environ.setdefault('WAYLAND_DISPLAY', 'wayland-0')


def touch_device():
    """The touchscreen's event device (first touch-looking device found)."""
    for pattern in ('/dev/input/by-id/*Touch*event*', '/dev/input/by-id/*touch*event*'):
        hits = sorted(glob.glob(pattern))
        if hits:
            return os.path.realpath(hits[0])
    return None


def want_off():
    try:
        with open(STATE) as f:
            return f.read().strip() == 'off'
    except OSError:
        return False


def output_power():
    """{output: 'on'|'off'} for real outputs, from wlopm."""
    try:
        out = subprocess.run(['wlopm'], capture_output=True, text=True, timeout=5).stdout
    except (OSError, subprocess.TimeoutExpired):
        return {}
    power = {}
    for line in out.splitlines():
        parts = line.split()
        if len(parts) >= 2 and not parts[0].startswith(('NOOP', 'HEADLESS')):
            power[parts[0]] = parts[1]
    return power


def set_power(name, state):
    subprocess.run(['wlopm', f'--{state}', name], capture_output=True, timeout=5)


def main():
    dev_path = touch_device()
    fd = None
    wake_until = 0.0
    slept_at = 0.0
    last_log = None

    while True:
        # (Re)open the touchscreen if needed; it can vanish on USB hiccups.
        if fd is None and dev_path:
            try:
                fd = os.open(dev_path, os.O_RDONLY | os.O_NONBLOCK)
            except OSError:
                fd = None

        if fd is not None:
            ready, _, _ = select.select([fd], [], [], POLL)
            if ready:
                data = b''
                try:
                    while True:
                        chunk = os.read(fd, 4096)
                        if not chunk:
                            break
                        data += chunk
                except BlockingIOError:
                    pass
                except OSError:
                    os.close(fd)
                    fd = None
                if tapped(data) and want_off() and time.time() - slept_at > SLEEP_GRACE:
                    wake_until = time.time() + WAKE_SECONDS
        else:
            time.sleep(POLL)
            dev_path = dev_path or touch_device()

        target = 'off' if want_off() and time.time() >= wake_until else 'on'
        for name, state in output_power().items():
            if state != target:
                set_power(name, target)
                if target == 'off':
                    slept_at = time.time()
                msg = f'{name} -> {target}'
                if msg != last_log:
                    print(f'[display-keeper] {time.strftime("%H:%M:%S")} {msg}', flush=True)
                    last_log = msg


if __name__ == '__main__':
    main()
