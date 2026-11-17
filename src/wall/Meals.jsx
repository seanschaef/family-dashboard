import { QRCodeSVG } from 'qrcode.react'
import { C, card } from '../theme.js'
import { Clock, CheckItem } from './parts.jsx'
import { weekDinners, staples, grocerySections } from '../data/sample.js'

// Monday of the current week, formatted "Week of November 16".
function weekOfLabel(now = new Date()) {
  const d = new Date(now)
  const day = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - day)
  return `Week of ${d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}`
}

// The phone grocery list this QR opens. Prefer the public URL once deployed.
const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL
const GROCERY_URL = `${PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/app/groceries`

function Staple({ label }) {
  return (
    <button
      type="button"
      style={{
        all: 'unset',
        cursor: 'pointer',
        background: C.card,
        border: `2px solid ${C.border}`,
        borderRadius: 999,
        padding: '12px 20px',
        fontSize: 21,
        fontWeight: 600,
      }}
    >
      + {label}
    </button>
  )
}

export default function Meals() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 110 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 62, fontWeight: 800 }}>Meals</div>
          <div style={{ fontSize: 24, color: C.muted }}>{weekOfLabel()}</div>
        </div>
        <Clock />
      </div>

      {/* Dinner this week */}
      <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 10 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Dinner this week</div>
          <button type="button" style={{ all: 'unset', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: C.tealText }}>
            Add ingredients to list
          </button>
        </div>
        {weekDinners.map((d) => (
          <div
            key={d.day}
            style={{
              background: d.highlight ? C.meals : C.cream,
              color: d.highlight ? '#FFFFFF' : C.ink,
              borderRadius: 18,
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, width: 80 }}>{d.day}</span>
            <span style={{ fontSize: 24, flexGrow: 1 }}>{d.meal}</span>
            <span style={{ fontSize: 18, color: d.highlight ? C.tealTint : C.muted }}>Recipe ›</span>
          </div>
        ))}
      </div>

      {/* Grocery list */}
      <div style={card({ flexGrow: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Grocery list</div>
          <div style={{ fontSize: 20, color: C.muted }}>Synced to everyone's phone</div>
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'center', background: C.tealTint, borderRadius: 18, padding: '16px 20px' }}>
          <div
            style={{
              width: 84,
              height: 84,
              flexShrink: 0,
              borderRadius: 10,
              background: '#FFFFFF',
              border: `2px solid ${C.border}`,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QRCodeSVG value={GROCERY_URL} size={68} bgColor="#FFFFFF" fgColor={C.meals} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 23, fontWeight: 700 }}>Add from your phone</div>
            <div style={{ fontSize: 19, color: C.muted }}>
              Scan to open the family list. Tap a staple below if you're standing here.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {staples.map((s) => (
            <Staple key={s} label={s} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px 24px' }}>
          {grocerySections.map((section) => (
            <div key={section.name} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.muted, letterSpacing: 1 }}>{section.name}</div>
              {section.items.map((it, i) => (
                <CheckItem key={i} label={it.label} sub={`· ${it.note}`} done={it.done} color={C.meals} size={40} fontSize={22} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
