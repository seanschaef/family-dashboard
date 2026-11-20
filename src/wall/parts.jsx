import { useState } from 'react'
import { C } from '../theme.js'
import Icon from '../components/Icon.jsx'
import { clockParts, useNow } from '../lib/time.js'

// A 12-hour time with a smaller am/pm beside it: "9:04 am".
export function ClockText({ now, size, weight = 800, style }) {
  const { time, ap } = clockParts(now)
  return (
    <div style={{ fontSize: size, fontWeight: weight, lineHeight: 1, whiteSpace: 'nowrap', ...style }}>
      {time}
      <span style={{ fontSize: Math.round(size * 0.36), fontWeight: 700, marginLeft: Math.round(size * 0.08), letterSpacing: 1 }}>{ap}</span>
    </div>
  )
}

// Live clock used in page headers.
export function Clock({ size = 56, weight = 700 }) {
  const now = useNow()
  return <ClockText now={now} size={size} weight={weight} />
}

// Coloured bar + time + title (+ optional sub), used in "Today" lists.
export function EventRow({ time, title, sub, color = C.ink }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 18,
        alignItems: 'center',
        background: C.cream,
        borderRadius: 16,
        padding: '12px 18px',
      }}
    >
      <div style={{ width: 8, height: 46, borderRadius: 4, background: color }} />
      <div style={{ fontSize: 22, color: C.muted, width: 90 }}>{time}</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 25, fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ fontSize: 19, color: C.muted }}>{sub}</div>}
      </div>
    </div>
  )
}

// Tap-to-check row. Toggles locally so the wall feels responsive; writing the
// change back to Supabase arrives with the chores/pet features (step 2).
export function CheckItem({ label, sub, done = false, color = C.ink, size = 44, fontSize = 23 }) {
  const [checked, setChecked] = useState(done)
  return (
    <button
      type="button"
      aria-label={`Mark ${label} ${checked ? 'not done' : 'done'}`}
      aria-pressed={checked}
      onClick={() => setChecked((v) => !v)}
      style={{ all: 'unset', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer' }}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          boxSizing: 'border-box',
          background: checked ? color : 'transparent',
          border: checked ? 'none' : `3px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {checked && <Icon name="check" size={size * 0.46} color="#FFFFFF" strokeWidth={3} />}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize,
            color: checked ? C.muted : C.ink,
            textDecoration: checked ? 'line-through' : 'none',
          }}
        >
          {label}
        </span>
        {sub && <span style={{ fontSize: fontSize - 6, color: C.muted }}>{sub}</span>}
      </span>
    </button>
  )
}

// Controlled tap-to-check row (parent owns `done`, from the database).
// other: done by someone else (shared chore) — shown grey, not in this
// person's colour, so it doesn't look like they did it.
export function LiveCheck({ label, sub, done = false, other = false, color = C.ink, size = 44, fontSize = 23, onToggle }) {
  if (other) color = C.muted
  return (
    <button
      type="button"
      aria-label={`Mark ${label} ${done ? 'not done' : 'done'}`}
      aria-pressed={done}
      onClick={() => onToggle && onToggle(!done)}
      style={{ all: 'unset', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer' }}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          boxSizing: 'border-box',
          background: done ? color : 'transparent',
          border: done ? 'none' : `3px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {done && <Icon name="check" size={size * 0.46} color="#FFFFFF" strokeWidth={3} />}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize, color: done ? C.muted : C.ink, textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
        {sub && <span style={{ fontSize: fontSize - 6, color: C.muted }}>{sub}</span>}
      </span>
    </button>
  )
}

// Per-person progress bar on the hub.
export function ProgressRow({ name, done, total, color }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 21 }}>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ color: C.muted }}>
          {done} of {total}
        </div>
      </div>
      <div style={{ height: 14, borderRadius: 7, background: C.track }}>
        <div style={{ width: `${pct}%`, height: 14, borderRadius: 7, background: color }} />
      </div>
    </div>
  )
}
