import { C } from '../theme.js'
import { popIn, fadeIn } from '../lib/popIn.js'

// A small "are you sure" card, used after a long press. `scale` makes it
// bigger for the wall.
export default function ConfirmSheet({ open, title, detail, confirmLabel = 'Remove', onConfirm, onCancel, scale = 1 }) {
  if (!open) return null
  const f = (n) => n * scale
  return (
    <div ref={fadeIn} onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(43, 36, 32, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: 24 }}>
      <div ref={popIn} role="alertdialog" aria-label={title} onClick={(e) => e.stopPropagation()} style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: f(20), padding: f(20), width: `min(${f(360)}px, 100%)`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: f(14) }}>
        <div style={{ fontSize: f(18), fontWeight: 800 }}>{title}</div>
        {detail && <div style={{ fontSize: f(14), color: C.muted }}>{detail}</div>}
        <div style={{ display: 'flex', gap: f(10), justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ all: 'unset', cursor: 'pointer', padding: `${f(10)}px ${f(16)}px`, borderRadius: f(12), border: `2px solid ${C.border}`, fontSize: f(15), fontWeight: 700 }}>Cancel</button>
          <button type="button" onClick={onConfirm} style={{ all: 'unset', cursor: 'pointer', padding: `${f(10)}px ${f(16)}px`, borderRadius: f(12), background: '#B4532A', color: '#FFFFFF', fontSize: f(15), fontWeight: 700 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
