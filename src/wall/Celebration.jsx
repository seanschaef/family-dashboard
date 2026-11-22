import { useEffect, useRef, useState } from 'react'
import { useMembers } from '../lib/members.jsx'
import { useChoreLogs, useChores } from '../lib/chores.js'
import { Crest, THEME_STYLES, THEME_WORDS, THEME_BACKDROP, THEME_KEYFRAMES, THEME_VIEWS, GOLF_HOLE, IRISH_POT } from './CelebrationThemes.jsx'

// The points celebration: whenever someone earns points (a chore ticked on the
// wall or on any phone), the wall shows "10 Points for Gryffindor!" big and
// loud, in their house colours with a house crest. Each time it picks a style
// at random (never the same twice in a row) and a crest at random from that
// house's set:
//   banner  - the crest on a house-colour banner, confetti and fireworks
//   lasers  - laser beams sweeping a dark screen, neon text
//   comic   - halftone burst, "KAPOW!", speech bubble, shaking crest
//   magic   - a starry night, glowing crest, swirling sparkles
//   pixel   - 8-bit arcade: chunky pixels, "LEVEL UP!", scanlines
//   eighties- synthwave: neon grid, striped sunset, chrome "RADICAL!"
//   race    - chequered flags, speed lines, a podium "VICTORY LAP!"
//   hero    - action movie: explosion, debris, "MISSION COMPLETE"
// plus eight more in CelebrationThemes.jsx (wrestling, construction, Hawaii,
// soccer, golf, K-pop, Irish, rock and roll).
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
const STYLES = ['banner', 'lasers', 'comic', 'magic', 'pixel', 'eighties', 'race', 'hero', ...THEME_STYLES]
const PIXEL_WORDS = ['LEVEL UP!', 'HIGH SCORE!', 'POWER UP!', '1UP!', 'BONUS!']
const EIGHTIES_WORDS = ['RADICAL!', 'TOTALLY TUBULAR!', 'GNARLY!', 'BODACIOUS!', 'AWESOME!']
const RACE_WORDS = ['VICTORY LAP!', 'CHECKERED FLAG!', 'POLE POSITION!', 'FIRST PLACE!']
const HERO_WORDS = ['MISSION COMPLETE', 'NAILED IT', 'HERO OF THE DAY', 'BOOM. DONE.']
const COMIC_WORDS = ['KAPOW!', 'BAM!', 'WHAM!', 'ZAP!', 'BOOM!', 'POW!', 'SHAZAM!']
const SHOW_MS = 6500

// Read at page load: the wall's router may tidy the address before members load.
const DEMO = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('celebrate') : null
let crestList = null // loaded once from /crests/index.json
let lastStyle = null
const pick = (a) => a[Math.floor(Math.random() * a.length)]

// Canvas shapes for the themed effects, drawn around (0, 0) at size p.r.
function heart(ctx, cx, cy, r) {
  ctx.moveTo(cx, cy + r)
  ctx.bezierCurveTo(cx - r * 1.3, cy + r * 0.15, cx - r * 0.95, cy - r * 0.95, cx, cy - r * 0.35)
  ctx.bezierCurveTo(cx + r * 0.95, cy - r * 0.95, cx + r * 1.3, cy + r * 0.15, cx, cy + r)
}
const SHAPES = {
  star5(ctx, p) {
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5
      const rr = i % 2 ? p.r * 0.45 : p.r
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
    }
    ctx.closePath()
    ctx.fill()
  },
  hex(ctx, p) {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) ctx.lineTo(Math.cos((i * Math.PI) / 3) * p.r, Math.sin((i * Math.PI) / 3) * p.r)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#4a4f55'
    ctx.beginPath()
    ctx.arc(0, 0, p.r * 0.42, 0, Math.PI * 2)
    ctx.fill()
  },
  flower(ctx, p) {
    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI * 2) / 5
      ctx.beginPath()
      ctx.ellipse(Math.cos(a) * p.r * 0.5, Math.sin(a) * p.r * 0.5, p.r * 0.55, p.r * 0.38, a, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#FFD23F'
    ctx.beginPath()
    ctx.arc(0, 0, p.r * 0.28, 0, Math.PI * 2)
    ctx.fill()
  },
  heart(ctx, p) {
    ctx.beginPath()
    heart(ctx, 0, 0, p.r)
    ctx.fill()
  },
  shamrock(ctx, p) {
    ctx.strokeStyle = p.c
    ctx.lineWidth = p.r * 0.16
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(p.r * 0.1, p.r * 0.7, p.r * 0.4, p.r * 1.1)
    ctx.stroke()
    for (let k = 0; k < 3; k++) {
      ctx.save()
      ctx.rotate((k * Math.PI * 2) / 3)
      ctx.beginPath()
      heart(ctx, 0, -p.r * 0.55, p.r * 0.5)
      ctx.fill()
      ctx.restore()
    }
  },
  note(ctx, p) {
    ctx.beginPath()
    ctx.ellipse(0, p.r * 0.6, p.r * 0.45, p.r * 0.32, -0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(p.r * 0.3, -p.r * 0.9, p.r * 0.14, p.r * 1.5)
    ctx.beginPath()
    ctx.moveTo(p.r * 0.44, -p.r * 0.9)
    ctx.quadraticCurveTo(p.r * 0.9, -p.r * 0.5, p.r * 0.7, -p.r * 0.05)
    ctx.quadraticCurveTo(p.r * 0.75, -p.r * 0.45, p.r * 0.44, -p.r * 0.55)
    ctx.fill()
  },
  coin(ctx, p) {
    // A spinning coin: squash it sideways as it turns.
    ctx.rotate(-p.rot)
    ctx.scale(Math.abs(Math.cos(p.rot)) * 0.9 + 0.1, 1)
    ctx.beginPath()
    ctx.arc(0, 0, p.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#B8860B'
    ctx.lineWidth = p.r * 0.18
    ctx.beginPath()
    ctx.arc(0, 0, p.r * 0.66, 0, Math.PI * 2)
    ctx.stroke()
  },
  flash(ctx, p) {
    p.r *= 1.05
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, p.r, 0, Math.PI * 2)
    ctx.fill()
  },
  puff(ctx, p) {
    p.r *= 1.02
    ctx.beginPath()
    ctx.arc(0, 0, p.r, 0, Math.PI * 2)
    ctx.fill()
  },
}

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
    const R = (a, b) => a + Math.random() * (b - a)
    // Falling (rain) or rising (rise) shapes across the screen, starting at random times.
    const rain = (n, kind, cols, o = {}) => {
      for (let i = 0; i < n; i++) parts.push({ kind, x: R(0, w), y: -R(20, h * (o.spread || 1)), vx: R(-1, 1) * (o.vx || 1.5), vy: R(o.vy || 2, (o.vy || 2) + (o.vyr || 3)), r: R(o.r || 12, (o.r || 12) + (o.rr || 10)), c: cols[i % cols.length], rot: R(0, 6), spin: R(-1, 1) * (o.spin || 0.06), sw: o.sw || 0, ph: R(0, 6), g: o.g || 0, life: o.life || 700, delay: o.delay ? Math.floor(R(0, o.delay)) : 0 })
    }
    const rise = (n, kind, cols, o = {}) => {
      for (let i = 0; i < n; i++) parts.push({ kind, x: R(0, w), y: h + R(20, 120), vx: R(-1, 1) * (o.vx || 1), vy: -R(o.vy || 2, (o.vy || 2) + (o.vyr || 3)), r: R(o.r || 12, (o.r || 12) + (o.rr || 10)), c: cols[i % cols.length], rot: R(-0.3, 0.3), spin: 0, sw: o.sw || 0, ph: R(0, 6), g: 0, life: o.life || 700, delay: o.delay ? Math.floor(R(0, o.delay)) : 0 })
    }
    const BEAMS = { kpop: ['#FF4FA3', '#B44CFF', '#5CE1E6', '#FF8AD8'], rock: ['#FFFFFF', '#FFC14D', '#FF4D00', '#FFFFFF'] }[mode]

    if (mode === 'macho') {
      rain(120, 'star5', ['#FFD700', '#FF4FA3', '#B44CFF', '#FFFFFF', ...colors], { vy: 2, vyr: 3, r: 10, rr: 14, sw: 1.2, spread: 1.6, spin: 0.08 })
      for (let i = 0; i < 40; i++) parts.push({ kind: 'flash', x: R(0, w), y: R(0, h * 0.9), r: R(25, 45), c: '#FFFFFF', life: 18, max: 18, delay: Math.floor(R(0, 360)) })
    }
    if (mode === 'construction') {
      rain(60, 'hex', ['#9AA0A6', '#C0C4C8', '#7A7F85'], { vy: 5, vyr: 5, r: 10, rr: 8, g: 0.25, spread: 1.2, spin: 0.15 })
      for (let i = 0; i < 30; i++) parts.push({ kind: 'puff', x: w / 2 + R(-460, 460), y: h * 0.6, vx: R(-4, 4), vy: R(-2, -0.4), r: R(22, 44), c: '#C9B79C', life: 80, max: 80, delay: 88 })
      for (let i = 0; i < 90; i++) parts.push({ kind: 'c', x: w / 2 + R(-300, 300), y: h * 0.6, vx: R(-14, 14), vy: R(-22, -6), r: R(5, 11), c: ['#FFC400', '#111111', '#FF7A00', ...colors][i % 6], rot: R(0, 6), g: 0.5, life: 300, delay: 90 })
    }
    if (mode === 'hawaii') rain(110, 'flower', ['#FF5D8F', '#FFFFFF', '#FFD23F', '#FF8C42', '#E83F6F'], { vy: 1.4, vyr: 2, r: 14, rr: 12, sw: 1.6, spread: 1.6, spin: 0.03 })
    if (mode === 'soccer') {
      for (let i = 0; i < 200; i++) {
        const a = R(0.1, Math.PI - 0.1)
        const sp = R(6, 20)
        parts.push({ kind: 'c', x: w / 2 + R(-200, 200), y: h * 0.1, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, r: R(5, 11), c: col(i), rot: R(0, 6), g: 0.3, life: 400, delay: 50 })
      }
      rain(90, 'c', colors, { vy: 3, vyr: 4, r: 6, rr: 6, sw: 0.8, delay: 200 })
    }
    if (mode === 'golf') {
      for (let i = 0; i < 46; i++) {
        const a = R(Math.PI, Math.PI * 2)
        const sp = R(3, 10)
        parts.push({ kind: 'star5', x: w * GOLF_HOLE.x, y: h * GOLF_HOLE.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: R(8, 16), c: ['#FFD700', '#FFFFFF', '#FFF3B0'][i % 3], rot: R(0, 6), spin: 0.1, g: 0.12, life: 90, max: 90, delay: 96 })
      }
      rain(80, 'c', ['#FFFFFF', '#FFD700', ...colors], { vy: 2, vyr: 3, r: 6, rr: 6, sw: 1, delay: 220 })
    }
    if (mode === 'kpop') rise(100, 'heart', ['#FF4FA3', '#FF8AD8', '#B44CFF', '#5CE1E6', ...colors], { vy: 1.6, vyr: 2.6, r: 12, rr: 16, sw: 1.2, delay: 320 })
    if (mode === 'irish') {
      rain(110, 'shamrock', ['#1E9E4A', '#34C759', '#0B6B2E', '#7BD389'], { vy: 1.6, vyr: 2, r: 16, rr: 14, sw: 1.3, spread: 1.5, spin: 0.04 })
      for (const d of [20, 110, 200]) {
        for (let i = 0; i < 45; i++) parts.push({ kind: 'coin', x: w * IRISH_POT.x, y: h * IRISH_POT.y, vx: R(-11, 3), vy: R(-24, -12), r: R(13, 20), c: '#FFD23F', rot: R(0, 6), spin: 0.18, g: 0.5, life: 300, delay: d })
      }
    }
    if (mode === 'rock') rise(80, 'note', ['#FFFFFF', '#FFD23F', '#FF7B00', ...colors], { vy: 2, vyr: 2.5, r: 16, rr: 14, sw: 1, delay: 320 })

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
    if (mode === 'pixel') {
      // Chunky pixel bursts, snapped to an 18 px grid, a few waves.
      for (let k = 0; k < 6; k++) {
        const cx = w * (0.15 + Math.random() * 0.7)
        const cy = h * (0.12 + Math.random() * 0.6)
        for (let i = 0; i < 40; i++) {
          const a = (i / 40) * Math.PI * 2
          const sp = Math.random() * 9 + 4
          parts.push({ kind: 'px', x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 18, c: col(i + k), g: 0.25, delay: k * 28, life: 120, max: 120 })
        }
      }
    }
    if (mode === 'race') {
      // Chequered squares fluttering down plus speed streaks across.
      for (let i = 0; i < 160; i++) parts.push({ kind: 'c', x: Math.random() * w, y: -Math.random() * h, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 5 + 3, r: Math.random() * 8 + 8, c: i % 2 ? '#111111' : '#FFFFFF', rot: Math.random() * 6, g: 0.05, life: 500 })
      for (let i = 0; i < 70; i++) parts.push({ kind: 'streak', x: -Math.random() * w * 2, y: Math.random() * h, vx: Math.random() * 30 + 40, vy: 0, r: Math.random() * 200 + 120, c: col(i), life: 500, delay: Math.floor(Math.random() * 200) })
    }
    if (mode === 'hero') {
      // One big blast from the middle: fire, then house-colour debris.
      const fire = ['#FFF3B0', '#FFD23F', '#FF9F1C', '#FF4D00', '#B22222']
      for (let i = 0; i < 220; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = Math.random() * 16 + 3
        parts.push({ kind: 'flame', x: w / 2, y: h * 0.5, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: Math.random() * 30 + 18, c: fire[i % fire.length], g: -0.05, life: 70 + Math.random() * 40, max: 110 })
      }
      for (let i = 0; i < 140; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = Math.random() * 22 + 6
        parts.push({ kind: 'c', x: w / 2, y: h * 0.5, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6, r: Math.random() * 10 + 4, c: col(i), rot: Math.random() * 6, g: 0.5, life: 300, delay: 6 })
      }
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

      if (BEAMS && frame < 380) {
        // Stage spotlights sweeping from the top.
        ctx.globalCompositeOperation = 'lighter'
        BEAMS.forEach((c, k) => {
          const ox = w * (0.14 + k * 0.24)
          const ang = Math.PI / 2 + Math.sin(frame / 38 + k * 1.3) * 0.38
          const len = h * 1.15
          const g = ctx.createLinearGradient(ox, 0, ox + Math.cos(ang) * len, Math.sin(ang) * len)
          g.addColorStop(0, c)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = g
          ctx.globalAlpha = 0.32
          ctx.beginPath()
          ctx.moveTo(ox, -10)
          ctx.lineTo(ox + Math.cos(ang - 0.13) * len, Math.sin(ang - 0.13) * len)
          ctx.lineTo(ox + Math.cos(ang + 0.13) * len, Math.sin(ang + 0.13) * len)
          ctx.closePath()
          ctx.fill()
        })
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }
      if (mode === 'rock' && frame < 380) {
        // Fire sparks shooting up from the stage.
        for (let s = 0; s < 3; s++) parts.push({ kind: 'ember', x: R(0, w), y: h + 10, vx: R(-1.5, 1.5), vy: R(-14, -6), r: R(5, 12), c: ['#FFF3B0', '#FFD23F', '#FF9F1C', '#FF4D00'][s % 4], g: 0.12, life: 70, max: 70 })
      }

      let alive = mode === 'lasers' || BEAMS ? frame < 380 : 0
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
        p.x += p.vx + (p.sw ? Math.sin(frame / 18 + p.ph) * p.sw : 0)
        p.y += p.vy
        if (p.kind === 'f' || p.kind === 'flame') {
          p.vx *= p.kind === 'flame' ? 0.92 : 0.97
          p.vy *= p.kind === 'flame' ? 0.92 : 0.97
        }
        if ((p.vy > 0 && p.y > h + 60) || p.y < -h * 2) continue
        ctx.fillStyle = p.c
        ctx.globalAlpha = p.max ? Math.max(0, p.life / p.max) : 1
        if (p.kind === 'px') {
          ctx.fillRect(Math.round(p.x / 18) * 18, Math.round(p.y / 18) * 18, p.r, p.r)
        } else if (p.kind === 'streak') {
          ctx.globalAlpha = 0.55
          ctx.fillRect(p.x, p.y, p.r, 6)
        } else if (p.kind === 'flame') {
          p.r *= 1.015
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
        } else if (SHAPES[p.kind]) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rot += p.spin || 0))
          SHAPES[p.kind](ctx, p)
          ctx.restore()
        } else if (p.kind === 'c') {
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
@keyframes hp-steps{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes hp-blink{0%{opacity:1}100%{opacity:.25}}
@keyframes hp-grid{from{background-position:0 0}to{background-position:0 90px}}
@keyframes hp-wave{from{transform:skewY(-6deg) scaleX(.96)}to{transform:skewY(6deg) scaleX(1)}}
@keyframes hp-zoom-in{0%{transform:translateX(-1200px) skewX(-12deg)}100%{transform:translateX(0) skewX(0)}}
@keyframes hp-bar-down{from{transform:translateY(-170px)}to{transform:translateY(0)}}
@keyframes hp-bar-up{from{transform:translateY(170px)}to{transform:translateY(0)}}
@keyframes hp-blast{0%{transform:scale(.1);opacity:1}60%{opacity:1}100%{transform:scale(1.1);opacity:.85}}
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

function Pixel({ t, pts, crest, who, word }) {
  const px = { fontFamily: "'Press Start 2P', monospace" }
  const blocky = (c) => `6px 0 0 ${c}, -6px 0 0 ${c}, 0 6px 0 ${c}, 0 -6px 0 ${c}, 6px 6px 0 #000`
  return (
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34, textAlign: 'center', animation: 'hp-steps 900ms steps(6) both' }}>
      <div style={{ ...px, fontSize: 76, color: '#FFE600', textShadow: blocky('#000'), animation: 'hp-blink 0.6s steps(2) infinite' }}>{word}</div>
      <div style={{ background: '#FFFFFF', padding: 18, border: '12px solid #000', boxShadow: `12px 12px 0 ${t.fx[0]}`, imageRendering: 'pixelated' }}>
        <Crest src={crest} house={t} size={340} style={{ imageRendering: 'pixelated' }} />
      </div>
      <div style={{ ...px, fontSize: 150, lineHeight: 1, color: t.fx[2], textShadow: blocky('#000') }}>+{pts}</div>
      <div style={{ ...px, fontSize: 40, lineHeight: 1.5, color: '#FFFFFF', textShadow: '5px 5px 0 #000', maxWidth: 940 }}>{pts} POINTS FOR {t.name.toUpperCase()}!</div>
      <div style={{ ...px, fontSize: 22, color: '#BBBBBB' }}>{who.toUpperCase()}</div>
    </div>
  )
}

function Eighties({ t, pts, crest, who, word }) {
  const chrome = { backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #9fd8ff 38%, #1b1b5e 50%, #ff8ad8 62%, #ffffff 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '3px #2a0845' }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* striped sunset and the neon grid */}
      <div style={{ position: 'absolute', left: '50%', top: 520, width: 760, height: 760, marginLeft: -380, borderRadius: '50%', background: 'linear-gradient(180deg, #ffe66d 0%, #ff7eb3 55%, #ff3cac 100%)', WebkitMaskImage: 'repeating-linear-gradient(180deg, #000 0 46px, transparent 46px 60px)', maskImage: 'repeating-linear-gradient(180deg, #000 0 46px, transparent 46px 60px)' }} />
      <div style={{ position: 'absolute', left: -400, right: -400, bottom: -40, height: 900, transform: 'perspective(900px) rotateX(55deg)', transformOrigin: 'bottom', backgroundImage: 'linear-gradient(#ff3cac 3px, transparent 3px), linear-gradient(90deg, #ff3cac 3px, transparent 3px)', backgroundSize: '90px 90px', animation: 'hp-grid 0.6s linear infinite', boxShadow: 'inset 0 200px 200px -100px #12002b' }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 120, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Monoton', cursive", fontSize: 120, color: '#ff3cac', textShadow: '0 0 20px #ff3cac, 0 0 50px #ff3cac', animation: 'hp-flicker 1.6s linear infinite' }}>{word}</div>
        <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 14, boxShadow: '0 0 40px #00e5ff, 0 0 80px #ff3cac', animation: 'hp-pop 800ms ease-out both' }}>
          <Crest src={crest} house={t} size={330} />
        </div>
        <div style={{ fontFamily: "'Anton', 'Outfit', sans-serif", fontSize: 230, lineHeight: 1, ...chrome }}>+{pts}</div>
        <div style={{ fontFamily: "'Anton', 'Outfit', sans-serif", fontSize: 72, lineHeight: 1.05, color: '#00e5ff', textShadow: '0 0 18px #00e5ff, 4px 4px 0 #2a0845', maxWidth: 960 }}>{pts} POINTS FOR {t.name.toUpperCase()}!</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#ffffff' }}>{who}</div>
      </div>
    </div>
  )
}

function Race({ t, pts, crest, who, word }) {
  const font = { fontFamily: "'Russo One', 'Outfit', sans-serif" }
  const checks = { backgroundImage: 'conic-gradient(#111 25%, #fff 0 50%, #111 0 75%, #fff 0)', backgroundSize: '60px 60px' }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 120, ...checks }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, ...checks }} />
      {/* two waving flags */}
      <div style={{ position: 'absolute', left: 30, top: 180, width: 300, height: 200, ...checks, backgroundSize: '50px 50px', transformOrigin: 'left center', animation: 'hp-wave 0.5s ease-in-out infinite alternate', border: '6px solid #111' }} />
      <div style={{ position: 'absolute', right: 30, top: 180, width: 300, height: 200, ...checks, backgroundSize: '50px 50px', transformOrigin: 'right center', animation: 'hp-wave 0.5s ease-in-out infinite alternate-reverse', border: '6px solid #111' }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingTop: 420, textAlign: 'center' }}>
        <div style={{ ...font, fontSize: 96, fontStyle: 'italic', color: '#FFFFFF', background: t.bg, padding: '6px 40px', transform: 'skewX(-12deg)', border: `8px solid ${t.edge}`, animation: 'hp-zoom-in 500ms cubic-bezier(.2,1.3,.4,1) both' }}>{word}</div>
        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 14, border: '8px solid #111', animation: 'hp-zoom-in 700ms cubic-bezier(.2,1.3,.4,1) both' }}>
          <Crest src={crest} house={t} size={320} />
        </div>
        {/* podium */}
        <div style={{ ...font, width: 520, background: 'linear-gradient(180deg, #ffd700, #c9a400)', border: '8px solid #111', borderRadius: '18px 18px 0 0', paddingTop: 10 }}>
          <div style={{ fontSize: 190, lineHeight: 1, color: '#111' }}>+{pts}</div>
          <div style={{ fontSize: 34, color: '#111', paddingBottom: 12 }}>1ST PLACE</div>
        </div>
        <div style={{ ...font, fontSize: 60, fontStyle: 'italic', color: '#FFFFFF', textShadow: '5px 5px 0 #111', maxWidth: 960 }}>{pts} Points for {t.name}!</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>{who}</div>
      </div>
    </div>
  )
}

function Hero({ t, pts, crest, who, word }) {
  const font = { fontFamily: "'Anton', 'Outfit', sans-serif", letterSpacing: 4 }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* letterbox bars, like a movie */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: '#000', zIndex: 4, animation: 'hp-bar-down 500ms ease-out both' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: '#000', zIndex: 4, animation: 'hp-bar-up 500ms ease-out both' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 1400, height: 1400, margin: '-700px 0 0 -700px', borderRadius: '50%', background: 'radial-gradient(circle, #fff3b0 0%, #ffb347 22%, #ff4d00 42%, rgba(120,20,0,0.6) 60%, transparent 72%)', animation: 'hp-blast 1.2s ease-out both' }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, height: '100%', textAlign: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 14, boxShadow: '0 0 60px #ff9f1c', animation: 'hp-slam 700ms cubic-bezier(.2,1.4,.4,1) both' }}>
          <Crest src={crest} house={t} size={360} />
        </div>
        <div style={{ ...font, fontSize: 110, color: '#FFFFFF', textShadow: '0 8px 0 #000, 0 0 30px #ff4d00', animation: 'hp-late-1 1000ms ease-out both' }}>{word}</div>
        <div style={{ ...font, fontSize: 230, lineHeight: 0.95, color: t.fx[2], textShadow: '0 10px 0 #000' }}>+{pts}</div>
        <div style={{ ...font, fontSize: 70, color: '#FFFFFF', textShadow: '0 6px 0 #000', maxWidth: 960 }}>{pts} POINTS FOR {t.name.toUpperCase()}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', textShadow: '0 3px 0 #000' }}>Starring {who}</div>
      </div>
    </div>
  )
}

const BACKDROP = {
  banner: 'rgba(10, 8, 6, 0.72)',
  lasers: 'rgba(0, 0, 0, 0.92)',
  comic: 'rgba(255, 255, 255, 0.15)',
  magic: 'radial-gradient(ellipse at 50% 35%, #1b2448 0%, #070a18 70%)',
  pixel: '#1a1440',
  eighties: 'linear-gradient(180deg, #12002b 0%, #3a0ca3 45%, #12002b 70%)',
  race: '#2b2b2b',
  hero: '#120806',
  ...THEME_BACKDROP,
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

  // Preview: /wall/hub?celebrate=macho (or ?celebrate=any) plays one for a
  // random person with a house a few seconds after the wall loads. Nothing is
  // saved and no points are given. The kiosk can open this once (pi/kiosk.sh).
  const demoDone = useRef(false)
  useEffect(() => {
    if (demoDone.current || !members.length) return undefined
    const want = DEMO
    if (!want) return undefined
    demoDone.current = true
    const people = members.filter((m) => m.house)
    const m = pick(people.length ? people : members)
    const t = setTimeout(() => setQueue((q) => [...q, { id: `demo-${Date.now()}`, member_key: m.key, points: 10, chore_title: 'Preview', style: STYLES.includes(want) ? want : null }]), 4000)
    return () => clearTimeout(t)
  }, [members])

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
    const style = current.style || (STYLES.includes(window.__celebrationStyle) ? window.__celebrationStyle : null) || pick(STYLES.filter((s) => s !== lastStyle))
    lastStyle = style
    const words = { pixel: PIXEL_WORDS, eighties: EIGHTIES_WORDS, race: RACE_WORDS, hero: HERO_WORDS, ...THEME_WORDS }[style] || COMIC_WORDS
    setLook({ id: current.id, style, crest: list.length ? pick(list) : null, word: pick(words) })
    const t = setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS)
    return () => clearTimeout(t)
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!current || !members.length || !look || look.id !== current.id) return null
  const person = byKey(current.member_key)
  const house = person?.house ? HOUSES[person.house] : null
  const chore = chores.find((c) => c.id === current.chore_id)
  const t = house || { name: person?.name || 'the family', bg: person?.color || '#7F0909', edge: '#FFFFFF', text: '#FFFFFF', fx: [person?.color || '#F1B400', '#FFFFFF', '#F1B400', '#FFD34D', '#FFFFFF'] }
  const props = { t, pts: current.points, crest: house ? look.crest : null, who: [person?.name, chore?.title || current.chore_title].filter(Boolean).join(' · '), word: look.word }
  const View = { banner: Banner, lasers: Lasers, comic: Comic, magic: Magic, pixel: Pixel, eighties: Eighties, race: Race, hero: Hero, ...THEME_VIEWS }[look.style]
  const fx = look.style === 'comic' || look.style === 'eighties' ? null : look.style
  const comicBg = look.style === 'comic' ? { backgroundImage: `radial-gradient(${t.fx[1]} 22%, transparent 24%)`, backgroundSize: '34px 34px', backgroundColor: t.fx[3] } : {}

  return (
    <div onClick={() => setQueue((q) => q.slice(1))} style={{ position: 'fixed', inset: 0, zIndex: 200, background: BACKDROP[look.style], ...comicBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <style>{KEYFRAMES + THEME_KEYFRAMES}</style>
      <View key={current.id} {...props} />
      {fx && <Effects key={`fx-${current.id}`} mode={fx} colors={t.fx} />}
    </div>
  )
}
