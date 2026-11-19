import { useEffect, useRef, useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'

const WALL_W = 1080
const WALL_H = 1920

// Same size whether selected or not (the border just changes colour), so the
// row doesn't jump, and nothing gets clipped.
function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        boxSizing: 'border-box',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
        padding: '0 14px',
        whiteSpace: 'nowrap',
        background: active ? color : C.card,
        color: active ? '#FFFFFF' : C.ink,
        border: `2px solid ${active ? color : C.border}`,
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  )
}

// Shows the real wall screens, scaled to fit the phone. The iframe is same-origin
// so it renders with the signed-in session and live data. Pointer events are off
// so it stays a clean preview; use the chips to switch screens.
export default function WallPreview() {
  const { members } = useMembers()
  const [screen, setScreen] = useState('hub')
  const ref = useRef(null)
  const [w, setW] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const scale = w ? w / WALL_W : 0
  // Same screens as the wall's bottom bar (Soccer is left out: that site only
  // lets the wall itself embed it).
  const fixed = { hub: '/wall/hub', calendar: '/wall/calendar', meals: '/wall/meals' }
  const src = fixed[screen] || `/wall/member/${screen}`

  const tabs = [
    { key: 'hub', label: 'Family', color: C.family },
    { key: 'calendar', label: 'Calendar' },
    ...members.map((m) => ({ key: m.key, label: m.name, color: m.color })),
    { key: 'meals', label: 'Meals' },
  ]

  return (
    <>
      <PhoneHeader title="Wall Preview" subtitle="How the wall looks right now" />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tabs.map((t) => (
          <Chip key={t.key} active={screen === t.key} color={t.color} onClick={() => setScreen(t.key)}>{t.label}</Chip>
        ))}
      </div>

      <div ref={ref} style={{ width: '100%', height: scale ? WALL_H * scale : 0, position: 'relative', borderRadius: 18, overflow: 'hidden', border: `3px solid ${C.ink}`, background: C.cream }}>
        {scale > 0 && (
          <iframe
            key={screen}
            title="Wall Preview"
            src={src}
            style={{ width: WALL_W, height: WALL_H, border: 'none', transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}
          />
        )}
      </div>

      <div style={{ fontSize: 13, color: C.muted }}>This is the actual wall page, scaled down. Change people or screens with the chips above.</div>
    </>
  )
}
