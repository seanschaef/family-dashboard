import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../theme.js'

// Shared building blocks for the phone app's settings screens, so every
// screen looks and behaves the same:
//   PageHeader  title, one-line description, and a back button that returns to
//               wherever you came from (or Settings if you opened it directly)
//   Section     a card with a heading, optional note, and its rows/fields
//   NavRow      a tappable row: title, current state at a glance, ›
//   Toggle      an on/off switch row
//   ColorField  "match the person" / any colour from the picker / one tap on a
//               colour already in use
//   SaveToast   the small "Saved ✓" that confirms a change saved by itself

export function PageHeader({ title, subtitle, back = true, backTo = '/app/settings', backLabel = 'Settings', action }) {
  const navigate = useNavigate()
  const goBack = () => {
    // React Router keeps a history index; > 0 means there's a page to go back to.
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate(backTo)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {back && (
        <button type="button" onClick={goBack} style={{ all: 'unset', cursor: 'pointer', alignSelf: 'flex-start', fontSize: 15, fontWeight: 700, color: C.tealText, padding: '4px 0' }}>
          ‹ {backLabel}
        </button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 15, color: C.muted }}>{subtitle}</div>}
        </div>
        {action}
      </div>
    </div>
  )
}

export function Section({ title, note, action, children, style }) {
  return (
    <section style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          {title && <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{title}</h2>}
          {action}
        </div>
      )}
      {note && <div style={{ fontSize: 13, color: C.muted, marginTop: -6 }}>{note}</div>}
      {children}
    </section>
  )
}

// A group of NavRows inside a Section, separated by thin lines.
export function RowList({ children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', margin: '-4px 0' }}>{children}</div>
}

export function NavRow({ to, title, summary, locked, onClick }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={onClick || (() => navigate(to))}
      style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: `1px solid ${C.border}`, minHeight: 28 }}
    >
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{title}</span>
        {summary && <span style={{ fontSize: 13, color: C.muted, overflowWrap: 'anywhere' }}>{summary}</span>}
      </span>
      {locked && <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Parents</span>}
      <span aria-hidden="true" style={{ fontSize: 22, color: C.muted, lineHeight: 1 }}>›</span>
    </button>
  )
}

export function Toggle({ label, sub, on, onChange, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={() => onChange(!on)} style={{ all: 'unset', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, opacity: disabled ? 0.6 : 1 }}>
      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{label}</span>
        {sub && <span style={{ fontSize: 13, color: C.muted }}>{sub}</span>}
      </span>
      <span style={{ width: 50, height: 30, borderRadius: 15, background: on ? C.meals : C.border, position: 'relative', flexShrink: 0, transition: 'background 150ms' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: 12, background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 150ms' }} />
      </span>
    </button>
  )
}

// Colour: an optional automatic choice (e.g. "Person's colour", value null),
// any colour from the system picker, or a colour that's already in use.
export function ColorField({ value, onChange, auto, autoLabel = "Person's colour", used = [], disabled }) {
  const current = value || auto || '#2F6A9E'
  const norm = (c) => String(c || '').toLowerCase()
  const recent = [...new Set(used.filter(Boolean).map(norm))].filter((c) => c !== norm(value)).slice(0, 14)
  const swatch = (col, size = 24) => ({ all: 'unset', cursor: disabled ? 'default' : 'pointer', width: size, height: size, borderRadius: size / 2, background: col, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)', flexShrink: 0, display: 'inline-block' })
  const pill = (active) => ({ cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: active ? C.ink : C.muted, border: `2px solid ${active ? C.ink : C.border}`, borderRadius: 999, padding: '6px 14px 6px 6px', position: 'relative', overflow: 'hidden', opacity: disabled ? 0.6 : 1 })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {auto !== undefined && (
          <button type="button" disabled={disabled} onClick={() => onChange(null)} aria-pressed={!value} style={{ all: 'unset', ...pill(!value) }}>
            <span style={swatch(auto || '#B0A89E')} />
            {autoLabel}
          </button>
        )}
        <label style={pill(!!value || auto === undefined)}>
          <span style={swatch(current)} />
          {value || auto === undefined ? 'Change colour' : 'Pick a colour'}
          <input type="color" disabled={disabled} aria-label="Pick a colour" value={current} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
        </label>
      </div>
      {recent.length > 0 && !disabled && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Already used:</span>
          {recent.map((col) => (
            <button key={col} type="button" aria-label={`Use colour ${col}`} onClick={() => onChange(col)} style={swatch(col, 28)} />
          ))}
        </div>
      )}
    </div>
  )
}

// const { savedAt, flash } = useSaved(); ... <SaveToast at={savedAt} />
export function useSaved() {
  const [savedAt, setSavedAt] = useState(0)
  return { savedAt, flash: () => setSavedAt(Date.now()) }
}

export function SaveToast({ at, text = 'Saved ✓' }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!at) return undefined
    setShow(true)
    const t = setTimeout(() => setShow(false), 1800)
    return () => clearTimeout(t)
  }, [at])
  if (!show) return null
  return (
    <div role="status" style={{ position: 'fixed', top: 'calc(14px + env(safe-area-inset-top))', left: '50%', transform: 'translateX(-50%)', background: C.tealText, color: '#FFFFFF', borderRadius: 999, padding: '8px 18px', fontSize: 14, fontWeight: 700, zIndex: 300, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{text}</div>
  )
}

export const fieldLabel = { fontSize: 14, fontWeight: 700, color: C.muted }
export const textInput = { font: 'inherit', fontSize: 16, padding: '10px 12px', borderRadius: 12, border: `2px solid ${C.border}`, background: C.card, color: C.ink, width: '100%', boxSizing: 'border-box' }
