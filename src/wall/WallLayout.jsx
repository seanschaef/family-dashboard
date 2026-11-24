import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import WallNav from '../components/WallNav.jsx'
import { C } from '../theme.js'
import { useWallNightTheme } from '../lib/theme.jsx'
import NightScreen from './NightScreen.jsx'
import Celebration from './Celebration.jsx'
import { useDbOffline } from '../lib/offlineCache.js'

const FRAME_W = 1080
const FRAME_H = 1920

// Minutes of no touches before the wall drifts back to the hub.
// OPEN ITEM in the brief: confirm this timing. Easy to change.
const IDLE_RETURN_MS = 120000
const SOCCER_IDLE_RETURN_MS = 10 * 60 * 1000

export default function WallLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [scale, setScale] = useState(1)
  const dbOffline = useDbOffline()
  useWallNightTheme() // dark at night, per the schedule set on the phone

  // Scale the fixed 1080x1920 frame to fit whatever viewport we are on.
  // On the Pi at native portrait resolution this is 1:1; in a browser it
  // shrinks to fit so the layout stays pixel-faithful.
  useEffect(() => {
    const recompute = () => {
      const s = Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H)
      setScale(s)
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [])

  // Pages change only from the tabs at the bottom (no page swipe), so a
  // swipe is always for the window under your finger: a combined window, or a
  // calendar's previous/next period.

  // ---- Auto-return to hub after inactivity ----
  useEffect(() => {
    let timer
    const reset = () => {
      clearTimeout(timer)
      // The soccer page is an embedded site: touches inside it never reach this
      // window, so give it a longer leash before drifting back to the hub.
      const wait = location.pathname.startsWith('/wall/soccer') ? SOCCER_IDLE_RETURN_MS : IDLE_RETURN_MS
      timer = setTimeout(() => {
        if (!location.pathname.endsWith('/hub')) navigate('/wall/hub')
      }, wait)
    }
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel']
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }))
    reset()
    return () => {
      clearTimeout(timer)
      events.forEach((ev) => window.removeEventListener(ev, reset))
    }
  }, [location.pathname, navigate])

  return (
    <div
      className="kiosk"
      style={{
        position: 'fixed',
        inset: 0,
        background: C.cream,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          width: FRAME_W,
          height: FRAME_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: FRAME_W,
            height: FRAME_H,
            boxSizing: 'border-box',
            padding: '52px 52px 36px',
            background: C.cream,
            color: C.ink,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            position: 'relative',
          }}
        >
          {/* Page content takes the space left above the nav and can never push
              it off-screen: it shrinks/clips instead of growing the frame. */}
          <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Outlet />
          </div>
          <div style={{ flexShrink: 0 }}>
            <WallNav />
          </div>
          {/* While the database isn't answering, the wall shows its saved copy. */}
          {dbOffline && (
            <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', padding: '6px 16px', borderRadius: 999, background: C.card, border: `1px solid ${C.border}`, color: C.muted, fontSize: 17, fontWeight: 600, zIndex: 5, whiteSpace: 'nowrap' }}>
              Can't reach the database · showing saved info
            </div>
          )}
          {/* Points celebration: on top of every wall page. */}
          <Celebration />
        </div>
      </div>
      <NightScreen />
    </div>
  )
}
