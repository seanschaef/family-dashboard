import { useEffect, useRef, useState } from 'react'
import { useMembers } from '../lib/members.jsx'
import { useChoreLogs, useChores } from '../lib/chores.js'

// The points celebration: whenever someone earns points (a chore ticked on the
// wall or on any phone), the wall shows a big banner in their house colours
// with the house crest, "10 Points for Gryffindor!", who did what, and
// fireworks and confetti bursting IN FRONT of it. About 6 seconds; a tap
// closes it sooner. Several in a row play one after another.
//
// Crest pictures live only on the wall (public/crests/, never committed: they
// are someone else's artwork). Without one, a plain shield in the colours shows.

const HOUSES = {
  gryffindor: { name: 'Gryffindor', crest: '/crests/gryffindor.webp', bg: '#7F0909', edge: '#F1B400', text: '#FFD34D', fx: ['#C8102E', '#AE0001', '#F1B400', '#FFD34D', '#FFFFFF'] },
  hufflepuff: { name: 'Hufflepuff', crest: '/crests/hufflepuff.webp', bg: '#F0C419', edge: '#3D3D3D', text: '#1F1F1F', fx: ['#FFD800', '#F0C419', '#3D3D3D', '#BDBDBD', '#FFFFFF'] },
  ravenclaw: { name: 'Ravenclaw', crest: '/crests/ravenclaw.webp', bg: '#0E2A6B', edge: '#E0A526', text: '#F3C45A', fx: ['#2A5BA8', '#4C8BD6', '#E0A526', '#C0C0C0', '#FFFFFF'] },
  slytherin: { name: 'Slytherin', crest: '/crests/slytherin.png', bg: '#1A472A', edge: '#C0C0C0', text: '#E6E6E6', fx: ['#2A7A48', '#1A472A', '#C0C0C0', '#E0A526', '#FFFFFF'] },
}

const SHOW_MS = 6500

function Fireworks({ colors }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return undefined
    const w = (cv.width = cv.clientWidth)
    const h = (cv.height = cv.clientHeight)
    const ctx = cv.getContext('2d')
    const parts = []
    const pick = (i) => colors[i % colors.length]
    // Confetti from the middle, then fireworks bursting over the banner.
    for (let i = 0; i < 260; i++) {
      parts.push({ kind: 'c', x: w / 2 + (Math.random() - 0.5) * 200, y: h * 0.55, vx: (Math.random() - 0.5) * 26, vy: -Math.random() * 26 - 8, r: Math.random() * 9 + 5, c: pick(i), rot: Math.random() * 6, g: 0.45, life: 400 })
    }
    for (let k = 0; k < 9; k++) {
      const cx = w * (0.15 + Math.random() * 0.7)
      const cy = h * (0.15 + Math.random() * 0.55)
      const delay = 10 + k * 22
      for (let i = 0; i < 80; i++) {
        const a = (i / 80) * Math.PI * 2
        const s = Math.random() * 7 + 4
        parts.push({ kind: 'f', x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 4, c: pick(i + k), g: 0.06, delay, life: 110, max: 110 })
      }
    }
    let raf
    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      let alive = 0
      for (const p of parts) {
        if (p.delay > 0) {
          p.delay--
          alive++
          continue
        }
        if (--p.life <= 0) continue
        p.vy += p.g
        p.x += p.vx
        p.y += p.vy
        if (p.kind === 'f') {
          p.vx *= 0.97
          p.vy *= 0.97
        }
        if (p.y > h + 30) continue
        alive++
        ctx.fillStyle = p.c
        ctx.globalAlpha = p.kind === 'f' ? Math.max(0, p.life / p.max) : 1
        if (p.kind === 'c') {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rot += 0.12))
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
          ctx.restore()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      if (alive) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [colors])
  // In front of the banner, but taps go through to it.
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }} />
}

function Crest({ house }) {
  const [broken, setBroken] = useState(false)
  if (!broken) {
    return <img src={house.crest} alt="" onError={() => setBroken(true)} style={{ width: 420, height: 460, objectFit: 'contain', display: 'block' }} />
  }
  return (
    <svg width="300" height="350" viewBox="0 0 120 140" aria-hidden="true">
      <path d="M10 8h100v60c0 38-26 58-50 68C36 126 10 106 10 68z" fill={house.bg} stroke={house.edge} strokeWidth="6" />
      <text x="60" y="84" textAnchor="middle" fontSize="48" fontWeight="800" fill={house.edge}>{house.name[0]}</text>
    </svg>
  )
}

export default function Celebration() {
  const { members, byKey } = useMembers()
  const { rows: logs } = useChoreLogs()
  const { rows: chores } = useChores()
  const seen = useRef(null)
  const [queue, setQueue] = useState([])
  const current = queue[0] || null

  // New chore_logs with points (not ones that were already there when the
  // wall loaded, and not old ones arriving late) join the queue.
  useEffect(() => {
    if (!logs.length && seen.current === null) return
    if (seen.current === null) {
      seen.current = new Set(logs.map((l) => l.id))
      return
    }
    const fresh = logs.filter((l) => !seen.current.has(l.id))
    fresh.forEach((l) => seen.current.add(l.id))
    const worth = fresh.filter((l) => (l.points || 0) > 0 && (!l.created_at || Date.now() - new Date(l.created_at).getTime() < 3 * 60000))
    if (worth.length) setQueue((q) => [...q, ...worth])
  }, [logs])

  useEffect(() => {
    if (!current) return undefined
    const t = setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS)
    return () => clearTimeout(t)
  }, [current])

  if (!current || !members.length) return null
  const person = byKey(current.member_key)
  const house = person?.house ? HOUSES[person.house] : null
  const chore = chores.find((c) => c.id === current.chore_id)
  const theme = house || { name: person?.name || 'the family', bg: person?.color || '#7F0909', edge: '#FFFFFF', text: '#FFFFFF', fx: [person?.color || '#F1B400', '#FFFFFF', '#F1B400'] }
  const pts = current.points

  return (
    <div onClick={() => setQueue((q) => q.slice(1))} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10, 8, 6, 0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <style>{'@keyframes hp-pop{0%{transform:scale(.2) rotate(-8deg);opacity:0}60%{transform:scale(1.08) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0)}}@keyframes hp-wobble{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}'}</style>
      <div key={current.id} style={{ position: 'relative', zIndex: 2, width: 900, boxSizing: 'border-box', background: theme.bg, border: `14px solid ${theme.edge}`, borderRadius: 48, padding: '36px 40px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', animation: 'hp-pop 800ms cubic-bezier(.2,1.5,.4,1) both' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 36, padding: 18, animation: 'hp-wobble 1.6s ease-in-out infinite' }}>
          <Crest house={house || theme} />
        </div>
        <div style={{ fontSize: 210, fontWeight: 900, lineHeight: 0.95, color: theme.text, marginTop: 10 }}>+{pts}</div>
        <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.05, color: theme.text }}>
          {pts} {pts === 1 ? 'Point' : 'Points'} for {theme.name}!
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: theme.text, opacity: 0.85, marginTop: 6 }}>
          {[person?.name, chore?.title].filter(Boolean).join(' · ')}
        </div>
      </div>
      <Fireworks key={`fx-${current.id}`} colors={theme.fx} />
    </div>
  )
}
