import { useEffect, useRef, useState } from 'react'
import { useMembers } from '../lib/members.jsx'
import { useChoreLogs, useChores } from '../lib/chores.js'

// The points celebration: whenever someone earns points (a chore ticked on the
// wall or on any phone), the wall shows "10 Points for Gryffindor!" big and
// loud, in their house colours with a house crest. Each time it picks a style
// at random (never the same twice in a row) and a crest at random from that
// house's set:
//   banner  - the crest on a house-colour banner, confetti and fireworks
//   lasers  - laser beams sweeping a dark screen, neon text
//   comic   - halftone burst, "KAPOW!", speech bubble, shaking crest
//   magic   - a starry night, glowing crest, swirling sparkles
// About 6½ seconds; a tap closes it sooner. Several in a row play in turn.
//
// Crest pictures live only on the wall (public/crests/, listed in
// crests/index.json; never committed: they are someone else's artwork).
// Without them a plain shield in the house colours shows.

const HOUSES = {
  gryffindor: { name: 'Gryffindor', bg: '#7F0909', edge: '#F1B400', text: '#FFD34D', fx: ['#C8102E', '#AE0001', '#F1B400', '#FFD34D', '#FFFFFF'] },
  hufflepuff: { name: 'Hufflepuff', bg: '#F0C419', edge: '#3D3D3D', text: '#1F1F1F', fx: ['#FFD800', '#F0C419', '#3D3D3D', '#BDBDBD', '#FFFFFF'] },
  ravenclaw: { name: 'Ravenclaw', bg: '#0E2A6B', edge: '#E0A526', text: '#F3C45A', fx: ['#2A5BA8', '#4C8BD6', '#E0A526', '#C0C0C0', '#FFFFFF'] },
  slytherin: { name: 'Slytherin', bg: '#1A472A', edge: '#C0C0C0', text: '#E6E6E6', fx: ['#2A7A48', '#3FAF6B', '#C0C0C0', '#E0A526', '#FFFFFF'] },
}
const FALLBACK_CRESTS = { gryffindor: ['/crests/gryffindor.webp'], hufflepuff: ['/crests/hufflepuff.webp'], ravenclaw: ['/crests/ravenclaw.webp'], slytherin: ['/crests/slytherin.png'] }
const STYLES = ['banner', 'lasers', 'comic', 'magic']
const COMIC_WORDS = ['KAPOW!', 'BAM!', 'WHAM!', 'ZAP!', 'BOOM!', 'POW!', 'SHAZAM!']
const SHOW_MS = 6500

let crestList = null // loaded once from /crests/index.json
let lastStyle = null
const pick = (a) => a[Math.floor(Math.random() * a.length)]

// ---------- effects (canvas, drawn IN FRONT of the card, taps pass through) ----------
function Effects({ mode, colors }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return undefined
    const w = (cv.width = cv.clientWidth)
    const h = (cv.height = cv.clientHeight)
    const ctx = cv.getContext('2d')
    const col = (i) => colors[i % colors.length]
    const parts = []
    let frame = 0

    if (mode === 'banner') {
      for (let i = 0; i < 260; i++) parts.push({ kind: 'c', x: w / 2 + (Math.random() - 0.5) * 200, y: h * 0.55, vx: (Math.random() - 0.5) * 26, vy: -Math.random() * 26 - 8, r: Math.random() * 9 + 5, c: col(i), rot: Math.random() * 6, g: 0.45, life: 400 })
      for (let k = 0; k < 9; k++) {
        const cx = w * (0.15 + Math.random() * 0.7)
        const cy = h * (0.15 + Math.random() * 0.55)
        for (let i = 0; i < 80; i++) {
          const a = (i / 80) * Math.PI * 2
          const s = Math.random() * 7 + 4
          parts.push({ kind: 'f', x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 4, c: col(i + k), g: 0.06, delay: 10 + k * 22, life: 110, max: 110 })
        }
      }
    }
    if (mode === 'magic') {
      for (let i = 0; i < 140; i++) parts.push({ kind: 'star', x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2.5 + 0.8, ph: Math.random() * 6, c: '#FFFFFF', life: 9999 })
    }

    let raf
    const tick = () => {
      frame++
      ctx.clearRect(0, 0, w, h)

      if (mode === 'lasers' && frame < 380) {
        // Beams from the bottom corners and the top, sweeping back and forth.
        ctx.globalCompositeOperation = 'lighter'
        const origins = [[0, h], [w, h], [w / 2, 0], [0, h * 0.4], [w, h * 0.4]]
        origins.forEach(([ox, oy], k) => {
          for (let j = 0; j < 3; j++) {
            const ang = Math.sin(frame / (22 + k * 5) + j * 1.7 + k) * 0.9 + Math.atan2(h * 0.45 - oy, w / 2 - ox)
            const len = Math.hypot(w, h)
            ctx.strokeStyle = col(k + j)
            ctx.shadowColor = col(k + j)
            ctx.shadowBlur = 30
            ctx.lineWidth = 7
            ctx.globalAlpha = 0.85
            ctx.beginPath()
            ctx.moveTo(ox, oy)
            ctx.lineTo(ox + Math.cos(ang) * len, oy + Math.sin(ang) * len)
            ctx.stroke()
          }
        })
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }

      if (mode === 'magic' && frame < 380) {
        // Sparkles spiralling out from the crest.
        for (let s = 0; s < 6; s++) {
          const a = frame * 0.12 + s * ((Math.PI * 2) / 6)
          const rad = 60 + (frame % 120) * 3
          parts.push({ kind: 'spark', x: w / 2 + Math.cos(a) * rad, y: h * 0.4 + Math.sin(a) * rad, vx: Math.cos(a) * 1.5, vy: Math.sin(a) * 1.5 - 0.6, r: Math.random() * 4 + 2, c: col(s), life: 60, max: 60 })
        }
      }

      let alive = mode === 'lasers' ? frame < 380 : 0
      for (const p of parts) {
        if (p.delay > 0) {
          p.delay--
          alive++
          continue
        }
        if (--p.life <= 0) continue
        alive++
        if (p.kind === 'star') {
          ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(frame / 15 + p.ph))
          ctx.fillStyle = p.c
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
          continue
        }
        p.vy += p.g || 0
        p.x += p.vx
        p.y += p.vy
        if (p.kind === 'f') {
          p.vx *= 0.97
          p.vy *= 0.97
        }
        if (p.y > h + 30) continue
        ctx.fillStyle = p.c
        ctx.globalAlpha = p.max ? Math.max(0, p.life / p.max) : 1
        if (p.kind === 'c') {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rot += 0.12))
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
          ctx.restore()
        } else if (p.kind === 'spark') {
          // four-point twinkle
          ctx.beginPath()
          ctx.moveTo(p.x, p.y - p.r * 2)
          ctx.lineTo(p.x + p.r * 0.5, p.y)
          ctx.lineTo(p.x, p.y + p.r * 2)
          ctx.lineTo(p.x - p.r * 0.5, p.y)
          ctx.closePath()
          ctx.fill()
          ctx.fillRect(p.x - p.r * 2, p.y - p.r * 0.25, p.r * 4, p.r * 0.5)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      if (alive || frame < 400) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [mode, colors])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }} />
}

function Crest({ src, house, size = 420, style }) {
  const [broken, setBroken] = useState(false)
  if (src && !broken) {
    return <img src={src} alt="" onError={() => setBroken(true)} style={{ width: size, height: size * 1.1, objectFit: 'contain', display: 'block', ...style }} />
  }
  return (
    <svg width={size * 0.72} height={size * 0.84} viewBox="0 0 120 140" aria-hidden="true" style={style}>
      <path d="M10 8h100v60c0 38-26 58-50 68C36 126 10 106 10 68z" fill={house.bg} stroke={house.edge} strokeWidth="6" />
      <text x="60" y="84" textAnchor="middle" fontSize="48" fontWeight="800" fill={house.edge}>{house.name[0]}</text>
    </svg>
  )
}

// ---------- the four looks ----------
const KEYFRAMES = `
@keyframes hp-pop{0%{transform:scale(.2) rotate(-8deg);opacity:0}60%{transform:scale(1.08) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes hp-wobble{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes hp-flicker{0%,100%{opacity:1}45%{opacity:1}50%{opacity:.55}55%{opacity:1}}
@keyframes hp-slam{0%{transform:scale(3) rotate(-20deg);opacity:0}55%{transform:scale(.9) rotate(4deg);opacity:1}75%{transform:scale(1.08) rotate(-3deg)}100%{transform:scale(1) rotate(-6deg)}}
@keyframes hp-shake{0%,100%{transform:translate(0,0) rotate(-6deg)}20%{transform:translate(-10px,6px) rotate(-8deg)}40%{transform:translate(8px,-6px) rotate(-4deg)}60%{transform:translate(-6px,-4px) rotate(-7deg)}80%{transform:translate(6px,4px) rotate(-5deg)}}
@keyframes hp-spin-burst{from{transform:rotate(0)}to{transform:rotate(30deg)}}
@keyframes hp-rise{0%{transform:translateY(120px) scale(.6);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes hp-glow{0%,100%{filter:drop-shadow(0 0 18px var(--glow))}50%{filter:drop-shadow(0 0 48px var(--glow))}}
@keyframes hp-fade-up{0%{transform:translateY(40px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes hp-late-1{0%,40%{transform:translateY(40px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes hp-late-2{0%,55%{transform:translateY(40px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes hp-late-3{0%,65%{transform:translateY(40px);opacity:0}100%{transform:translateY(0);opacity:1}}
`

function Banner({ t, pts, crest, who }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, width: 900, boxSizing: 'border-box', background: t.bg, border: `14px solid ${t.edge}`, borderRadius: 48, padding: '36px 40px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', animation: 'hp-pop 800ms cubic-bezier(.2,1.5,.4,1) both' }}>
      <div style={{ background: '#FFFFFF', borderRadius: 36, padding: 18, animation: 'hp-wobble 1.6s ease-in-out infinite' }}>
        <Crest src={crest} house={t} />
      </div>
      <div style={{ fontSize: 210, fontWeight: 900, lineHeight: 0.95, color: t.text, marginTop: 10 }}>+{pts}</div>
      <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.05, color: t.text }}>{pts} {pts === 1 ? 'Point' : 'Points'} for {t.name}!</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: t.text, opacity: 0.85, marginTop: 6 }}>{who}</div>
    </div>
  )
}

function Lasers({ t, pts, crest, who }) {
  const neon = (c, blur = 30) => `0 0 ${blur / 3}px #fff, 0 0 ${blur}px ${c}, 0 0 ${blur * 2}px ${c}`
  return (
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', animation: 'hp-pop 700ms ease-out both' }}>
      <div style={{ '--glow': t.fx[2], animation: 'hp-glow 1.2s ease-in-out infinite', background: 'rgba(255,255,255,0.95)', borderRadius: 32, padding: 16, border: `6px solid ${t.fx[2]}` }}>
        <Crest src={crest} house={t} size={380} />
      </div>
      <div style={{ fontSize: 240, fontWeight: 900, lineHeight: 0.9, color: '#FFFFFF', textShadow: neon(t.fx[0], 40), animation: 'hp-flicker 1.4s linear infinite' }}>+{pts}</div>
      <div style={{ fontSize: 70, fontWeight: 900, lineHeight: 1.05, color: '#FFFFFF', textShadow: neon(t.fx[2], 26), maxWidth: 960 }}>{pts} {pts === 1 ? 'Point' : 'Points'} for {t.name}!</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: '#FFFFFF', opacity: 0.85 }}>{who}</div>
    </div>
  )
}

function Comic({ t, pts, crest, who, word }) {
  const comic = { fontFamily: "'Bangers', 'Outfit', sans-serif", letterSpacing: 2 }
  // A 16-point starburst.
  const burst = Array.from({ length: 32 }, (_, i) => {
    const r = i % 2 ? 0.62 : 1
    const a = (i / 32) * Math.PI * 2
    return `${50 + Math.cos(a) * 50 * r}% ${50 + Math.sin(a) * 50 * r}%`
  }).join(',')
  return (
    <div style={{ position: 'relative', zIndex: 2, width: 1000, height: 1500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* the burst, spinning slowly behind everything */}
      <div style={{ position: 'absolute', width: 1300, height: 1300, top: 40, clipPath: `polygon(${burst})`, background: t.edge, animation: 'hp-spin-burst 6s linear infinite alternate' }} />
      <div style={{ position: 'absolute', width: 1080, height: 1080, top: 150, clipPath: `polygon(${burst})`, background: t.bg, animation: 'hp-spin-burst 6s linear infinite alternate-reverse' }} />
      <div style={{ position: 'relative', ...comic, fontSize: 210, lineHeight: 1, color: '#FFE600', WebkitTextStroke: '10px #111', paintOrder: 'stroke fill', textShadow: '12px 12px 0 #111', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
      <div style={{ position: 'relative', background: '#FFFFFF', border: '10px solid #111', borderRadius: 30, padding: 16, boxShadow: '16px 16px 0 #111', animation: 'hp-shake 0.5s ease-in-out 4', transform: 'rotate(-6deg)', marginTop: 10 }}>
        <Crest src={crest} house={t} size={340} />
      </div>
      {/* speech bubble */}
      <div style={{ position: 'relative', marginTop: 50, background: '#FFFFFF', border: '10px solid #111', borderRadius: 60, padding: '24px 46px', boxShadow: '14px 14px 0 #111', textAlign: 'center', animation: 'hp-late-1 1000ms ease-out both' }}>
        <div style={{ position: 'absolute', top: -46, left: 120, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: '46px solid #111' }} />
        <div style={{ ...comic, fontSize: 96, lineHeight: 1, color: t.bg === '#F0C419' ? '#111' : t.bg }}>+{pts} for {t.name}!</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#111', marginTop: 6 }}>{who}</div>
      </div>
    </div>
  )
}

function Magic({ t, pts, crest, who }) {
  const serif = { fontFamily: "'Cinzel', Georgia, serif" }
  return (
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
      <div style={{ '--glow': t.fx[2], animation: 'hp-rise 900ms cubic-bezier(.2,.9,.3,1) both, hp-glow 1.8s ease-in-out infinite' }}>
        <div style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.95) 55%, rgba(255,255,255,0) 72%)', borderRadius: '50%', padding: 70 }}>
          <Crest src={crest} house={t} size={400} />
        </div>
      </div>
      <div style={{ ...serif, fontSize: 200, fontWeight: 900, lineHeight: 0.9, color: t.fx[2], textShadow: `0 0 30px ${t.fx[2]}`, animation: 'hp-late-1 1300ms ease-out both' }}>+{pts}</div>
      <div style={{ ...serif, fontSize: 64, fontWeight: 900, lineHeight: 1.1, color: '#FFFFFF', textShadow: `0 0 20px ${t.fx[0]}`, maxWidth: 960, animation: 'hp-late-2 1600ms ease-out both' }}>{pts} {pts === 1 ? 'Point' : 'Points'} for {t.name}!</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: '#FFFFFF', opacity: 0.85, animation: 'hp-late-3 1800ms ease-out both' }}>{who}</div>
    </div>
  )
}

const BACKDROP = {
  banner: 'rgba(10, 8, 6, 0.72)',
  lasers: 'rgba(0, 0, 0, 0.92)',
  comic: 'rgba(255, 255, 255, 0.15)',
  magic: 'radial-gradient(ellipse at 50% 35%, #1b2448 0%, #070a18 70%)',
}

export default function Celebration() {
  const { members, byKey } = useMembers()
  const { rows: logs } = useChoreLogs()
  const { rows: chores } = useChores()
  const seen = useRef(null)
  const [queue, setQueue] = useState([])
  const [look, setLook] = useState(null) // { id, style, crest, word }
  const current = queue[0] || null

  useEffect(() => {
    if (crestList) return
    fetch('/crests/index.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { crestList = j || FALLBACK_CRESTS })
      .catch(() => { crestList = FALLBACK_CRESTS })
  }, [])

  // New chore_logs with points (not ones already there when the wall loaded,
  // and not old ones arriving late) join the queue.
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

  // Each celebration: pick its style (not the same as last time) and crest.
  useEffect(() => {
    if (!current) return undefined
    const person = byKey(current.member_key)
    const list = (crestList || FALLBACK_CRESTS)[person?.house] || []
    // (window.__celebrationStyle forces one, for testing.)
    const style = STYLES.includes(window.__celebrationStyle) ? window.__celebrationStyle : pick(STYLES.filter((s) => s !== lastStyle))
    lastStyle = style
    setLook({ id: current.id, style, crest: list.length ? pick(list) : null, word: pick(COMIC_WORDS) })
    const t = setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS)
    return () => clearTimeout(t)
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!current || !members.length || !look || look.id !== current.id) return null
  const person = byKey(current.member_key)
  const house = person?.house ? HOUSES[person.house] : null
  const chore = chores.find((c) => c.id === current.chore_id)
  const t = house || { name: person?.name || 'the family', bg: person?.color || '#7F0909', edge: '#FFFFFF', text: '#FFFFFF', fx: [person?.color || '#F1B400', '#FFFFFF', '#F1B400', '#FFD34D', '#FFFFFF'] }
  const props = { t, pts: current.points, crest: house ? look.crest : null, who: [person?.name, chore?.title || current.chore_title].filter(Boolean).join(' · '), word: look.word }
  const View = { banner: Banner, lasers: Lasers, comic: Comic, magic: Magic }[look.style]
  const fx = { banner: 'banner', lasers: 'lasers', magic: 'magic' }[look.style]
  const comicBg = look.style === 'comic' ? { backgroundImage: `radial-gradient(${t.fx[1]} 22%, transparent 24%)`, backgroundSize: '34px 34px', backgroundColor: t.fx[3] } : {}

  return (
    <div onClick={() => setQueue((q) => q.slice(1))} style={{ position: 'fixed', inset: 0, zIndex: 200, background: BACKDROP[look.style], ...comicBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <style>{KEYFRAMES}</style>
      <View key={current.id} {...props} />
      {fx && <Effects key={`fx-${current.id}`} mode={fx} colors={t.fx} />}
    </div>
  )
}
