import { useEffect, useRef, useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'

const WALL_W = 1080
const WALL_H = 1920

function Chip({ active, color = C.meals, children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ all: 'unset', cursor: 'pointer', whiteSpace: 'nowrap', background: active ? color : C.card, color: active ? '#FFFFFF' : C.ink, border: active ? 'none' : `2px solid ${C.border}`, borderRadius: 999, padding: '8px 14px', fontSize: 14, fontWeight: 600 }}>
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
  const src =
    screen === 'hub' ? '/wall/hub'
      : screen === 'meals' ? '/wall/meals'
        : screen === 'home' ? '/wall/home'
          : `/wall/member/${screen}`

  const tabs = [
    { key: 'hub', label: 'Hub' },
    ...members.map((m) => ({ key: m.key, label: m.name, color: m.color })),
    { key: 'meals', label: 'Meals' },
    { key: 'home', label: 'Home' },
  ]

  return (
    <>
      <PhoneHeader title="Wall preview" subtitle="How the wall looks right now" />

      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map((t) => (
          <Chip key={t.key} active={screen === t.key} color={t.color} onClick={() => setScreen(t.key)}>{t.label}</Chip>
        ))}
      </div>

      <div ref={ref} style={{ width: '100%', height: scale ? WALL_H * scale : 0, position: 'relative', borderRadius: 18, overflow: 'hidden', border: `3px solid ${C.ink}`, background: C.cream }}>
        {scale > 0 && (
          <iframe
            key={screen}
            title="Wall preview"
            src={src}
            style={{ width: WALL_W, height: WALL_H, border: 'none', transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}
          />
        )}
      </div>

      <div style={{ fontSize: 13, color: C.muted }}>This is the actual wall page, scaled down. Change people or screens with the chips above.</div>
    </>
  )
}
