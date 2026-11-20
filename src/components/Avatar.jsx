import { C } from '../theme.js'

// A person's round picture: their profile photo if they have one, otherwise
// their initial on their colour. ring: draws their colour around a photo so
// people stay easy to tell apart.
export default function Avatar({ member, size = 40, ring = true, style }) {
  const color = member?.color || C.muted
  const base = { width: size, height: size, borderRadius: size / 2, flexShrink: 0, boxSizing: 'border-box', ...style }
  if (member?.avatar) {
    return <img src={member.avatar} alt={member.name || ''} style={{ ...base, objectFit: 'cover', display: 'block', border: ring ? `${Math.max(2, Math.round(size / 22))}px solid ${color}` : 'none', background: color }} />
  }
  return (
    <span aria-hidden="true" style={{ ...base, background: color, color: '#FFFFFF', fontSize: Math.round(size * 0.47), fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
      {((member?.name || '?')[0] || '?').toUpperCase()}
    </span>
  )
}
