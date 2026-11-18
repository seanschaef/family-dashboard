import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import WallNav from '../components/WallNav.jsx'
import { buildWallNav } from '../config/people.js'
import { useMembers } from '../lib/members.jsx'
import { C } from '../theme.js'

const FRAME_W = 1080
const FRAME_H = 1920

// Minutes of no touches before the wall drifts back to the hub.
// OPEN ITEM in the brief: confirm this timing. Easy to change.
const IDLE_RETURN_MS = 120000
const SWIPE_THRESHOLD = 60 // px

export default function WallLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { members } = useMembers()
  const [scale, setScale] = useState(1)

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

  // ---- Swipe left/right to move between pages in nav order ----
  const order = buildWallNav(members).map((n) => n.to)
  const currentIndex = Math.max(
    0,
    order.findIndex((to) => location.pathname.startsWith(to)),
  )

  const goBy = useCallback(
    (delta) => {
      const next = currentIndex + delta
      if (next >= 0 && next < order.length) navigate(order[next])
    },
    [currentIndex, navigate, order],
  )

  const start = useRef(null)
  const onPointerDown = (e) => {
    start.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    start.current = null
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      goBy(dx < 0 ? 1 : -1) // swipe left -> next page
    }
  }

  // ---- Auto-return to hub after inactivity ----
  useEffect(() => {
    let timer
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (!location.pathname.endsWith('/hub')) navigate('/wall/hub')
      }, IDLE_RETURN_MS)
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
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
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
        </div>
      </div>
    </div>
  )
}
