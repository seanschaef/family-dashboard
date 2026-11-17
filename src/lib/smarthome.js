import { useCallback, useEffect, useState } from 'react'

// Home Assistant lives on the LAN, so only the wall (same network) can reach it.
// These are set in the WALL build only. A public HTTPS page is blocked from
// calling a local http device anyway, so they stay empty everywhere else.
const HA_URL = (import.meta.env.VITE_HA_URL || '').replace(/\/$/, '')
const HA_TOKEN = import.meta.env.VITE_HA_TOKEN || ''

export const haConfigured = () => Boolean(HA_URL && HA_TOKEN)

async function ha(path, opts = {}) {
  const res = await fetch(HA_URL + path, {
    headers: { Authorization: `Bearer ${HA_TOKEN}`, 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`HA ${res.status}`)
  return res.json()
}

const fetchStates = () => ha('/api/states')
const callService = (domain, service, body) =>
  ha(`/api/services/${domain}/${service}`, { method: 'POST', body: JSON.stringify(body) })

// --- sample home (HA-shaped) so the page is alive without a backend ---
const S = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes })
export const SAMPLE_STATES = [
  S('scene.good_morning', 'scening', { friendly_name: 'Good morning' }),
  S('scene.movie', 'scening', { friendly_name: 'Movie' }),
  S('scene.away', 'scening', { friendly_name: 'Away' }),
  S('scene.good_night', 'scening', { friendly_name: 'Good night' }),
  S('light.kitchen', 'on', { friendly_name: 'Kitchen', brightness: 204 }),
  S('light.living_room', 'on', { friendly_name: 'Living room', brightness: 153 }),
  S('light.hallway', 'off', { friendly_name: 'Hallway' }),
  S('light.bedroom', 'on', { friendly_name: 'Bedroom', brightness: 255 }),
  S('light.office', 'off', { friendly_name: 'Office' }),
  S('switch.porch', 'off', { friendly_name: 'Porch' }),
  S('climate.main', 'heat', { friendly_name: 'Thermostat', current_temperature: 21, temperature: 21, hvac_action: 'heating' }),
  S('lock.front_door', 'locked', { friendly_name: 'Front door' }),
  S('lock.back_door', 'locked', { friendly_name: 'Back door' }),
  S('cover.garage', 'open', { friendly_name: 'Garage' }),
]

const domainOf = (id) => id.split('.')[0]
export const brightnessPct = (s) =>
  s.state === 'on' ? (s.attributes.brightness ? `${Math.round((s.attributes.brightness / 255) * 100)}%` : 'On') : 'Off'

export function classify(states) {
  return {
    scenes: states.filter((s) => domainOf(s.entity_id) === 'scene'),
    lights: states.filter((s) => ['light', 'switch'].includes(domainOf(s.entity_id))),
    climate: states.filter((s) => domainOf(s.entity_id) === 'climate'),
    security: states.filter((s) => ['lock', 'cover'].includes(domainOf(s.entity_id))),
  }
}

// Secure/good states per domain, for the colour of a status row.
export function isSecure(s) {
  const d = domainOf(s.entity_id)
  if (d === 'lock') return s.state === 'locked'
  if (d === 'cover') return s.state === 'closed'
  return true
}
export const statusLabel = (s) => {
  const d = domainOf(s.entity_id)
  if (d === 'cover') return s.state === 'open' ? 'Open' : 'Closed'
  return s.state.charAt(0).toUpperCase() + s.state.slice(1)
}

export function useSmartHome() {
  const configured = haConfigured()
  const [states, setStates] = useState(configured ? [] : SAMPLE_STATES)
  const [connected, setConnected] = useState(!configured)
  const [loading, setLoading] = useState(configured)

  const refresh = useCallback(async () => {
    if (!configured) return
    try {
      const data = await fetchStates()
      setStates(data)
      setConnected(true)
    } catch {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }, [configured])

  useEffect(() => {
    if (!configured) return undefined
    refresh()
    const id = setInterval(refresh, 15000)
    return () => clearInterval(id)
  }, [configured, refresh])

  // Optimistic local update for the sample/demo path.
  const patch = (entity_id, changes) =>
    setStates((prev) => prev.map((s) => (s.entity_id === entity_id ? { ...s, ...changes } : s)))

  async function toggleLight(s) {
    const next = s.state === 'on' ? 'off' : 'on'
    if (!configured) return patch(s.entity_id, { state: next })
    await callService(domainOf(s.entity_id), 'toggle', { entity_id: s.entity_id })
    return refresh()
  }

  async function activateScene(s) {
    if (!configured) return undefined
    await callService('scene', 'turn_on', { entity_id: s.entity_id })
    return refresh()
  }

  async function nudgeTemp(s, delta) {
    const target = Math.round((s.attributes.temperature ?? s.attributes.current_temperature ?? 20) + delta)
    if (!configured) return patch(s.entity_id, { attributes: { ...s.attributes, temperature: target } })
    await callService('climate', 'set_temperature', { entity_id: s.entity_id, temperature: target })
    return refresh()
  }

  return { configured, connected, loading, ...classify(states), toggleLight, activateScene, nudgeTemp }
}
