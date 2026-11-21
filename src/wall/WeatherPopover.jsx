import { C } from '../theme.js'
import { popIn, fadeIn } from '../lib/popIn.js'
import WeatherIcon from '../components/WeatherIcon.jsx'
import { useForecast, wearHint, useAqhi, aqhiRisk } from '../lib/weather.js'
import { sunTimes, sunText } from '../lib/sun.js'

// Tap the weather on the hub: the full picture in a big card. Now, feels
// like, wind, what to wear, sunrise/sunset, air quality, the next 12 hours and
// the coming days.
export default function WeatherPopover({ open, onClose }) {
  const { data: f } = useForecast()
  const { current: air, forecast: airFc } = useAqhi()
  if (!open) return null
  const sun = sunTimes(new Date())
  const aqhi = air?.aqhi != null ? Math.round(air.aqhi) : null
  const risk = aqhiRisk(aqhi)
  const tile = { background: C.cream, borderRadius: 18, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 2 }
  const small = { fontSize: 18, color: C.muted, fontWeight: 600 }
  const big = { fontSize: 28, fontWeight: 800 }

  return (
    <div ref={fadeIn} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(43, 36, 32, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 40 }}>
      <div ref={popIn} role="dialog" aria-label="Weather" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 28, border: `2px solid ${C.border}`, borderTop: `5px solid ${C.tealText}`, width: 'min(920px, 94%)', boxSizing: 'border-box', padding: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, color: C.muted, fontWeight: 600 }}>Edmonton · now</div>
            {f ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <WeatherIcon code={f.now.code} size={84} />
                <div>
                  <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1 }}>{f.now.temp}°</div>
                  <div style={{ fontSize: 24 }}>{f.now.conditions} · feels like {f.now.feels}°</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 24, color: C.muted }}>Loading…</div>
            )}
          </div>
          <button type="button" aria-label="Close" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', width: 60, height: 60, borderRadius: 30, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, flexShrink: 0 }}>×</button>
        </div>

        {f && <div style={{ fontSize: 26, fontWeight: 800, color: C.rust }}>{wearHint(f)}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
          <div style={tile}><span style={small}>Wind</span><span style={big}>{f ? `${f.now.wind} km/h` : '—'}</span></div>
          <div style={tile}><span style={small}>Sunrise</span><span style={big}>{sunText(sun.sunrise)}</span></div>
          <div style={tile}><span style={small}>Sunset</span><span style={big}>{sunText(sun.sunset)}</span></div>
          <div style={tile}>
            <span style={small}>Air quality</span>
            <span style={{ ...big, color: risk.color }}>{aqhi ?? '—'} <span style={{ fontSize: 18 }}>{aqhi != null ? risk.label.replace(' risk', '') : ''}</span></span>
            {airFc?.max != null && <span style={{ fontSize: 15, color: C.muted }}>Forecast up to {airFc.max}</span>}
          </div>
        </div>

        {f && (
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Next 12 Hours</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: 4 }}>
              {f.hours.map((h) => (
                <div key={h.t.toISOString()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 17 }}>
                  <span style={{ color: C.muted, fontWeight: 700 }}>{h.label}</span>
                  <WeatherIcon code={h.code} size={30} />
                  <span style={{ fontWeight: 800 }}>{h.temp}°</span>
                  <span style={{ color: C.muted, fontSize: 14 }}>{h.feels}°</span>
                  <span style={{ color: C.tealText, fontSize: 14, minHeight: 18 }}>{h.pop >= 20 ? `${h.pop}%` : ''}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Second number is feels-like; percent is the chance of rain or snow.</div>
          </div>
        )}

        {f && (
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Coming Days</div>
            {f.days.map((d) => (
              <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '90px 44px 80px minmax(0, 1fr) 70px 70px', alignItems: 'center', gap: 12, fontSize: 22, padding: '8px 0', borderTop: `2px solid ${C.border}` }}>
                <span style={{ fontWeight: 800 }}>{d.label}</span>
                <WeatherIcon code={d.code} size={32} />
                <span style={{ color: C.tealText, fontSize: 18 }}>{d.pop >= 20 ? `${d.pop}%` : ''}</span>
                <span />
                <span style={{ fontWeight: 800, textAlign: 'right' }}>{d.high}°</span>
                <span style={{ color: C.muted, textAlign: 'right' }}>{d.low}°</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
