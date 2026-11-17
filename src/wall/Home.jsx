import { C, card } from '../theme.js'
import { Clock } from './parts.jsx'
import { scenes, lights, doors } from '../data/sample.js'

// Smart home (step 6). This is a visual placeholder. Real device control is
// wired later and ONLY in the Pi's local copy talking to Home Assistant on the
// LAN — never on the public Vercel deployment.
function Toggle({ on }) {
  return (
    <span
      style={{
        width: 72,
        height: 40,
        borderRadius: 20,
        background: on ? C.home : C.toggleOff,
        display: 'flex',
        alignItems: 'center',
        padding: 4,
        boxSizing: 'border-box',
        justifyContent: on ? 'flex-end' : 'flex-start',
      }}
    >
      <span style={{ width: 32, height: 32, borderRadius: 16, background: '#FFFFFF' }} />
    </span>
  )
}

export default function Home() {
  const onCount = lights.filter((l) => l.on).length
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 120 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 62, fontWeight: 800 }}>Home</div>
          <div style={{ fontSize: 24, color: C.muted }}>[Platform] · all devices</div>
        </div>
        <Clock />
      </div>

      {/* Scenes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Scenes</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          {scenes.map((s, i) => (
            <button
              key={s}
              type="button"
              style={{
                all: 'unset',
                cursor: 'pointer',
                background: i === 0 ? C.home : C.card,
                color: i === 0 ? '#FFFFFF' : C.ink,
                border: i === 0 ? 'none' : `2px solid ${C.border}`,
                borderRadius: 22,
                padding: 22,
                fontSize: 24,
                fontWeight: 700,
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Lights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Lights</div>
          <div style={{ fontSize: 20, color: C.muted }}>{onCount} on</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          {lights.map((l) => (
            <button
              key={l.name}
              type="button"
              aria-label={`${l.name} lights, ${l.on ? 'on' : 'off'}`}
              aria-pressed={l.on}
              style={{
                all: 'unset',
                cursor: 'pointer',
                background: l.on ? C.lightOn : C.card,
                border: `2px solid ${C.border}`,
                borderRadius: 24,
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxSizing: 'border-box',
              }}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 24, fontWeight: 700 }}>{l.name}</span>
                <Toggle on={l.on} />
              </span>
              <span style={{ fontSize: 20, color: C.muted }}>{l.level}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Thermostat + doors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24, height: 340 }}>
        <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center' })}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Thermostat</div>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <button type="button" aria-label="Lower temperature" style={roundBtn}>−</button>
            <div style={{ fontSize: 88, fontWeight: 800 }}>[##]°</div>
            <button type="button" aria-label="Raise temperature" style={roundBtn}>+</button>
          </div>
          <div style={{ fontSize: 20, color: C.muted }}>Inside [##]° · Heating</div>
        </div>

        <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 })}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Doors and locks</div>
          {doors.map((d) => (
            <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24 }}>
              <div>{d.name}</div>
              <div style={{ fontWeight: 700, color: d.ok ? C.green : C.rust }}>{d.state}</div>
            </div>
          ))}
        </div>
      </div>

      {/* More devices */}
      <div
        style={card({
          flexGrow: 1,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'center',
          borderStyle: 'dashed',
        })}
      >
        <div style={{ fontSize: 26, fontWeight: 800 }}>[More devices]</div>
        <div style={{ fontSize: 22, color: C.muted }}>Cameras, speakers, plugs, blinds: whatever your system has</div>
      </div>
    </>
  )
}

const roundBtn = {
  all: 'unset',
  cursor: 'pointer',
  width: 72,
  height: 72,
  borderRadius: 36,
  border: `2px solid ${C.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 40,
  fontWeight: 700,
}
