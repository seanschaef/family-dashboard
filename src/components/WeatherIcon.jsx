import { C } from '../theme.js'

// Line-style weather glyphs keyed off WMO codes. SVG (not emoji) so they render
// identically on the Pi, which may ship no colour-emoji font.
function iconFor(code) {
  if (code === 0) return 'sun'
  if (code === 1 || code === 2) return 'partly'
  if (code === 3) return 'cloud'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'rain'
  if (code >= 61 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'rain'
  if (code >= 85 && code <= 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'cloud'
}

const sun = C.starFill
const cloudC = C.muted

export default function WeatherIcon({ code, size = 48 }) {
  const kind = iconFor(code)
  const common = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {kind === 'sun' && (
        <g stroke={sun} strokeWidth="2.5" {...common}>
          <circle cx="24" cy="24" r="9" fill={sun} fillOpacity="0.18" />
          {[...Array(8)].map((_, i) => {
            const a = (i * Math.PI) / 4
            const x1 = 24 + Math.cos(a) * 15
            const y1 = 24 + Math.sin(a) * 15
            const x2 = 24 + Math.cos(a) * 19
            const y2 = 24 + Math.sin(a) * 19
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
        </g>
      )}
      {kind === 'partly' && (
        <g {...common}>
          <g stroke={sun} strokeWidth="2.2">
            <circle cx="18" cy="18" r="6" fill={sun} fillOpacity="0.18" />
            {[...Array(8)].map((_, i) => {
              const a = (i * Math.PI) / 4
              return <line key={i} x1={18 + Math.cos(a) * 9} y1={18 + Math.sin(a) * 9} x2={18 + Math.cos(a) * 12} y2={18 + Math.sin(a) * 12} />
            })}
          </g>
          <path d="M14 34 a7 7 0 0 1 1-13 a9 9 0 0 1 17 2 a6 6 0 0 1 -1 11 Z" strokeWidth="2.5" style={{ fill: C.card, stroke: cloudC }} />
        </g>
      )}
      {kind === 'cloud' && (
        <path d="M14 34 a7 7 0 0 1 1-13 a9 9 0 0 1 17 2 a6 6 0 0 1 -1 11 Z" stroke={cloudC} strokeWidth="2.5" {...common} style={{ fill: C.card, stroke: cloudC }} />
      )}
      {kind === 'fog' && (
        <g {...common} strokeWidth="2.5" style={{ stroke: cloudC }}>
          <path d="M14 28 a7 7 0 0 1 1-13 a9 9 0 0 1 17 2 a6 6 0 0 1 -1 11 Z" style={{ fill: C.card }} />
          <line x1="12" y1="36" x2="34" y2="36" />
          <line x1="16" y1="41" x2="38" y2="41" />
        </g>
      )}
      {kind === 'rain' && (
        <g {...common}>
          <path d="M14 30 a7 7 0 0 1 1-13 a9 9 0 0 1 17 2 a6 6 0 0 1 -1 11 Z" strokeWidth="2.5" style={{ fill: C.card, stroke: cloudC }} />
          <g stroke={C.blue} strokeWidth="2.5">
            <line x1="18" y1="35" x2="16" y2="41" />
            <line x1="25" y1="35" x2="23" y2="41" />
            <line x1="32" y1="35" x2="30" y2="41" />
          </g>
        </g>
      )}
      {kind === 'snow' && (
        <g {...common}>
          <path d="M14 30 a7 7 0 0 1 1-13 a9 9 0 0 1 17 2 a6 6 0 0 1 -1 11 Z" strokeWidth="2.5" style={{ fill: C.card, stroke: cloudC }} />
          <g fill={C.blue}>
            <circle cx="18" cy="38" r="1.8" />
            <circle cx="25" cy="40" r="1.8" />
            <circle cx="32" cy="38" r="1.8" />
          </g>
        </g>
      )}
      {kind === 'storm' && (
        <g {...common}>
          <path d="M14 28 a7 7 0 0 1 1-13 a9 9 0 0 1 17 2 a6 6 0 0 1 -1 11 Z" strokeWidth="2.5" style={{ fill: C.card, stroke: cloudC }} />
          <path d="M24 31 l-5 8 h5 l-2 7 l7 -10 h-5 l3 -5 Z" fill={sun} stroke={sun} strokeWidth="1.5" />
        </g>
      )}
    </svg>
  )
}
