import { useState } from 'react'
import { C, card } from '../theme.js'
import Icon from '../components/Icon.jsx'

export function PhoneHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 30, fontWeight: 800 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 15, color: C.muted }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

export function Pill({ active, color = C.meals, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        background: active ? color : C.card,
        color: active ? '#FFFFFF' : C.ink,
        border: active ? 'none' : `2px solid ${C.border}`,
        borderRadius: 999,
        padding: '8px 14px',
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  )
}

export function PhoneCard({ children, style }) {
  return <div style={card({ borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 6, ...style })}>{children}</div>
}

// Compact tap-to-check row for the phone (28px circle). Toggles locally.
export function PhoneCheck({ label, sub, done = false, color = C.meals }) {
  const [checked, setChecked] = useState(done)
  return (
    <button
      type="button"
      aria-label={`${label}, ${checked ? 'done' : 'not done'}`}
      aria-pressed={checked}
      onClick={() => setChecked((v) => !v)}
      style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', minHeight: 44 }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: 14,
          boxSizing: 'border-box',
          background: checked ? color : 'transparent',
          border: checked ? 'none' : `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} />}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 17, color: checked ? C.muted : C.ink, textDecoration: checked ? 'line-through' : 'none' }}>
          {label}
        </span>
        {sub && <span style={{ fontSize: 13, color: C.muted }}>{sub}</span>}
      </span>
    </button>
  )
}
