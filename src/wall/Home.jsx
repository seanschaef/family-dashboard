import { C, card } from '../theme.js'
import { Clock } from './parts.jsx'
import { useSmartHome, brightnessPct, isSecure, statusLabel } from '../lib/smarthome.js'

// Smart home. Talks to Home Assistant on the LAN from the wall build
// (VITE_HA_URL + VITE_HA_TOKEN). Off the Pi it shows a sample home so the page
// is alive in the demo. Nest/Google devices come in via Home Assistant's Nest
// integration, so this one panel covers them too.
function Toggle({ on }) {
  return (
    <span style={{ width: 72, height: 40, borderRadius: 20, background: on ? C.home : C.toggleOff, display: 'flex', alignItems: 'center', padding: 4, boxSizing: 'border-box', justifyContent: on ? 'flex-end' : 'flex-start' }}>
      <span style={{ width: 32, height: 32, borderRadius: 16, background: '#FFFFFF' }} />
    </span>
  )
}

const roundBtn = { all: 'unset', cursor: 'pointer', width: 72, height: 72, borderRadius: 36, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700 }

export default function Home() {
  const { configured, connected, loading, scenes, lights, climate, security, toggleLight, activateScene, nudgeTemp } = useSmartHome()
  const onCount = lights.filter((l) => l.state === 'on').length
  const thermostat = climate[0]

  const subtitle = !configured
    ? 'Demo · sample devices'
    : connected
      ? `Home Assistant · ${onCount} ${onCount === 1 ? 'light' : 'lights'} on`
      : loading
        ? 'Home Assistant · connecting…'
        : 'Home Assistant · not reachable'

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 120 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 62, fontWeight: 800 }}>Home</div>
          <div style={{ fontSize: 24, color: C.muted }}>{subtitle}</div>
        </div>
        <Clock />
      </div>

      {configured && !connected && !loading ? (
        <div style={card({ flexGrow: 1, padding: 40, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' })}>
          <div style={{ fontSize: 30, fontWeight: 800 }}>Can’t reach Home Assistant</div>
          <div style={{ fontSize: 22, color: C.muted, textAlign: 'center', maxWidth: 680 }}>
            Check that Home Assistant is running and that VITE_HA_URL and VITE_HA_TOKEN in the wall’s .env.local are correct. See pi/README.md.
          </div>
        </div>
      ) : (
        <>
          {scenes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>Scenes</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
                {scenes.map((s) => (
                  <button key={s.entity_id} type="button" onClick={() => activateScene(s)} style={{ all: 'unset', cursor: 'pointer', background: C.card, color: C.ink, border: `2px solid ${C.border}`, borderRadius: 22, padding: 22, fontSize: 24, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}>
                    {s.attributes.friendly_name || s.entity_id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {lights.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 26, fontWeight: 800 }}>Lights</div>
                <div style={{ fontSize: 20, color: C.muted }}>{onCount} on</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                {lights.map((l) => {
                  const on = l.state === 'on'
                  return (
                    <button key={l.entity_id} type="button" aria-label={`${l.attributes.friendly_name || l.entity_id}, ${on ? 'on' : 'off'}`} aria-pressed={on} onClick={() => toggleLight(l)}
                      style={{ all: 'unset', cursor: 'pointer', background: on ? C.lightOn : C.card, border: `2px solid ${C.border}`, borderRadius: 24, padding: 22, display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box' }}>
                      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 24, fontWeight: 700 }}>{l.attributes.friendly_name || l.entity_id}</span>
                        <Toggle on={on} />
                      </span>
                      <span style={{ fontSize: 20, color: C.muted }}>{brightnessPct(l)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24, flexGrow: 1 }}>
            <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center' })}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{thermostat?.attributes.friendly_name || 'Thermostat'}</div>
              {thermostat ? (
                <>
                  <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
                    <button type="button" aria-label="Lower temperature" onClick={() => nudgeTemp(thermostat, -1)} style={roundBtn}>−</button>
                    <div style={{ fontSize: 88, fontWeight: 800 }}>{Math.round(thermostat.attributes.temperature ?? thermostat.attributes.current_temperature)}°</div>
                    <button type="button" aria-label="Raise temperature" onClick={() => nudgeTemp(thermostat, 1)} style={roundBtn}>+</button>
                  </div>
                  <div style={{ fontSize: 20, color: C.muted }}>
                    Inside {Math.round(thermostat.attributes.current_temperature)}° · {(thermostat.attributes.hvac_action || thermostat.state).replace(/^\w/, (c) => c.toUpperCase())}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 22, color: C.muted }}>No thermostat</div>
              )}
            </div>

            <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 })}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>Doors and locks</div>
              {security.length ? (
                security.map((d) => (
                  <div key={d.entity_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24 }}>
                    <div>{d.attributes.friendly_name || d.entity_id}</div>
                    <div style={{ fontWeight: 700, color: isSecure(d) ? C.green : C.rust }}>{statusLabel(d)}</div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 22, color: C.muted }}>No locks or doors</div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
