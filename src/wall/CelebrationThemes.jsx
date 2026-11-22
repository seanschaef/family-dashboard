import { useState } from 'react'

// More looks for the points celebration (see Celebration.jsx). Each one fills
// the 1080×1920 wall frame. Canvas effects for them live in Celebration.jsx.
//   macho        - pro wrestling: ring ropes, a gold title belt, "OHHH YEAH!"
//   construction - hazard stripes, a crane swinging the crest, a steel beam drops
//   hawaii       - sunset, palms, waves, a flower lei, falling hibiscus
//   soccer       - the ball flies into the net, "GOOOOAL!", a scoreboard
//   golf         - a putt rolls into the hole, a leaderboard
//   kpop         - stage lights, waving light sticks, rising hearts
//   irish        - rainbow, pot of gold, shamrocks, the crest does a jig
//   rock         - speaker stacks, lightning, fire, "ROCK ON!"

export const THEME_STYLES = ['macho', 'construction', 'hawaii', 'soccer', 'golf', 'kpop', 'irish', 'rock']

export const THEME_WORDS = {
  macho: ['OHHH YEAH!', 'DIG IT!', 'THE CHAMP IS HERE!', 'FROM THE TOP ROPE!', 'BODY SLAM!'],
  construction: ['JOB DONE!', 'BUILT TOUGH!', 'NAILED IT!', 'WORK ZONE CLEAR!', 'HARD HAT HERO!'],
  hawaii: ['Aloha!', 'Mahalo!', "Surf's Up!", 'Hang Loose!'],
  soccer: ['GOOOOAL!', 'TOP CORNER!', 'BACK OF THE NET!', 'WHAT A STRIKE!'],
  golf: ['Hole in One!', 'Birdie!', 'Eagle!', 'Albatross!', 'Right Down the Middle!'],
  kpop: ['DAEBAK!', 'FIGHTING!', 'SARANGHAE!', 'ENCORE!', 'SLAY!'],
  irish: ['SLÁINTE!', "LUCK O' THE IRISH!", "TOP O' THE MORNIN'!", 'GRAND JOB!', 'BRILLIANT!'],
  rock: ['ROCK ON!', 'ENCORE!', 'LEGENDARY!', 'TURN IT UP!', 'ROCK STAR!'],
}

export const THEME_BACKDROP = {
  macho: 'radial-gradient(ellipse at 50% 30%, #ff4fa3 0%, #6a0dad 45%, #16002b 80%)',
  construction: 'linear-gradient(180deg, #8ecae6 0%, #d6eef8 52%, #b5b5b5 52%, #8a8a8a 100%)',
  hawaii: 'linear-gradient(180deg, #ffcf6b 0%, #ff9a3c 25%, #ff5e62 50%, #a8327a 68%)',
  soccer: 'repeating-linear-gradient(180deg, #2e8b3e 0 120px, #267a35 120px 240px)',
  golf: 'linear-gradient(180deg, #87CEEB 0%, #cdeefd 40%, #7cc576 40%, #3f9b4a 100%)',
  kpop: 'radial-gradient(ellipse at 50% 20%, #ff4fa3 0%, #7b2ff7 35%, #1a0533 75%)',
  irish: 'linear-gradient(180deg, #8fd694 0%, #2e8b57 45%, #0b5d2a 100%)',
  rock: 'radial-gradient(ellipse at 50% 100%, #8b0000 0%, #2a0000 45%, #050505 80%)',
}

export const THEME_KEYFRAMES = `
@keyframes th-shine{from{background-position:150% 0}to{background-position:-50% 0}}
@keyframes th-hazard{from{background-position:0 0}to{background-position:141px 0}}
@keyframes th-lower{0%{transform:translateY(-700px)}100%{transform:translateY(0)}}
@keyframes th-swing{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}
@keyframes th-drop{0%{transform:translateY(-1500px)}70%{transform:translateY(0)}82%{transform:translateY(-36px)}100%{transform:translateY(0)}}
@keyframes th-waves{from{background-position:0 0}to{background-position:80px 0}}
@keyframes th-sway{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
@keyframes th-shot{0%{transform:translateY(1650px) scale(1.6) rotate(0)}100%{transform:translateY(130px) scale(.6) rotate(900deg)}}
@keyframes th-net{0%,100%{transform:translateY(0) scaleY(1)}30%{transform:translateY(-16px) scaleY(.94)}60%{transform:translateY(6px) scaleY(1.03)}}
@keyframes th-putt{0%{transform:translateX(90px)}85%{transform:translateX(755px)}100%{transform:translateX(757px) translateY(16px) scale(.2);opacity:0}}
@keyframes th-stick{from{transform:rotate(-16deg)}to{transform:rotate(16deg)}}
@keyframes th-beat{from{transform:scale(1)}to{transform:scale(1.06)}}
@keyframes th-jig{0%{transform:translateY(0) rotate(-7deg)}50%{transform:translateY(-55px) rotate(0)}100%{transform:translateY(0) rotate(7deg)}}
@keyframes th-thump{from{transform:scale(1)}to{transform:scale(1.1)}}
@keyframes th-quake{0%,100%{transform:translate(0,0)}25%{transform:translate(-6px,4px)}50%{transform:translate(5px,-4px)}75%{transform:translate(-4px,-3px)}}
`

export function Crest({ src, house, size = 420, style }) {
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

const label = (pts, name) => `${pts} ${pts === 1 ? 'Point' : 'Points'} for ${name}!`
const FULL = { position: 'absolute', inset: 0, overflow: 'hidden' }
const COLUMN = { position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }
const goldText = { backgroundImage: 'linear-gradient(180deg, #FFF6B0 0%, #FFD700 45%, #B8860B 55%, #FFE066 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }

// ---------- pro wrestling ----------
export function Macho({ t, pts, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  const rope = (top, c) => <div style={{ position: 'absolute', left: 0, right: 0, top, height: 28, borderRadius: 14, background: c, boxShadow: 'inset 0 -9px 0 rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.4)' }} />
  const post = (side) => (
    <div style={{ position: 'absolute', [side]: 24, top: 1440, width: 64, bottom: -20, background: 'linear-gradient(90deg, #8d8d8d, #e6e6e6, #8d8d8d)', borderRadius: 10 }}>
      {[50, 140, 230].map((y) => <div key={y} style={{ position: 'absolute', top: y, left: -14, width: 92, height: 66, borderRadius: 14, background: '#1a1a1a' }} />)}
    </div>
  )
  return (
    <div style={FULL}>
      {post('left')}
      {post('right')}
      {rope(1500, '#FF2D95')}
      {rope(1590, '#FFE600')}
      {rope(1680, '#8A2BE2')}
      <div style={{ ...COLUMN, gap: 18, paddingTop: 280 }}>
        <div style={{ ...font, fontSize: 124, lineHeight: 1, maxWidth: 1000, color: '#FFE600', WebkitTextStroke: '8px #6a00b0', paintOrder: 'stroke fill', textShadow: '9px 9px 0 #FF2D95', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        {/* the title belt */}
        <div style={{ position: 'relative', width: 1040, height: 470, animation: 'hp-pop 800ms 200ms cubic-bezier(.2,1.5,.4,1) both' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 120, height: 230, background: '#1a1a1a', borderRadius: 40, border: '6px solid #FFD700', boxSizing: 'border-box' }} />
          {[60, 830].map((x) => <div key={x} style={{ position: 'absolute', left: x, top: 155, width: 150, height: 160, borderRadius: '50%', background: 'linear-gradient(135deg, #FFF6B0, #FFD700 35%, #B8860B 60%, #FFE066)', border: '6px solid #8B6914' }} />)}
          <div style={{ position: 'absolute', left: 230, width: 580, top: 0, height: 470, borderRadius: '50% / 42%', background: 'linear-gradient(135deg, #FFF6B0, #FFD700 30%, #B8860B 55%, #FFE066 75%, #B8860B)', border: '12px solid #8B6914', boxSizing: 'border-box', boxShadow: '0 0 70px rgba(255, 215, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{ width: 330, height: 330, borderRadius: '50%', background: '#FFFFFF', border: '8px solid #8B6914', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crest src={crest} house={t} size={250} />
            </div>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.75) 50%, transparent 60%)', backgroundSize: '250% 100%', animation: 'th-shine 1.8s linear infinite' }} />
          </div>
        </div>
        <div style={{ ...font, fontSize: 200, lineHeight: 1, ...goldText, WebkitTextStroke: '4px #5a2d00' }}>+{pts}</div>
        <div style={{ ...font, fontSize: 58, lineHeight: 1.1, color: '#FFFFFF', textShadow: '5px 5px 0 #6a00b0', maxWidth: 980 }}>{label(pts, t.name)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>{who}</div>
      </div>
    </div>
  )
}

// ---------- construction ----------
export function Construction({ t, pts, crest, who, word }) {
  const stencil = { fontFamily: "'Saira Stencil One', 'Anton', sans-serif" }
  const hazard = { backgroundImage: 'repeating-linear-gradient(45deg, #FFC400 0 50px, #111 50px 100px)', backgroundSize: '141px 141px', animation: 'th-hazard 1s linear infinite' }
  const lattice = { backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 18px, #E8A300 18px 26px), repeating-linear-gradient(-45deg, transparent 0 18px, #E8A300 18px 26px)', border: '8px solid #E8A300', boxSizing: 'border-box' }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 80, ...hazard, zIndex: 3 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 80, ...hazard, zIndex: 3 }} />
      {/* the crane */}
      <div style={{ position: 'absolute', left: 60, top: 130, width: 70, bottom: 80, ...lattice }} />
      <div style={{ position: 'absolute', left: 40, right: 30, top: 130, height: 60, ...lattice }} />
      <div style={{ position: 'absolute', left: 20, top: 190, width: 140, height: 100, background: '#E8A300', borderRadius: 10 }}>
        <div style={{ position: 'absolute', left: 20, top: 16, width: 70, height: 46, background: '#bfe3f2', borderRadius: 6 }} />
      </div>
      {/* the crest, lowered on the hook and swinging */}
      <div style={{ position: 'absolute', left: 'calc(50% - 220px)', top: 190, width: 440, zIndex: 2, animation: 'th-lower 1s cubic-bezier(.3,1.3,.5,1) both' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transformOrigin: '50% 0', animation: 'th-swing 1.5s ease-in-out infinite alternate' }}>
          <div style={{ width: 8, height: 110, background: '#222' }} />
          <div style={{ width: 46, height: 46, border: '10px solid #444', borderTopColor: 'transparent', borderRadius: '50%', marginTop: -14 }} />
          <div style={{ background: '#FFFFFF', border: '10px solid #111', borderRadius: 16, padding: 12, marginTop: -6 }}>
            <Crest src={crest} house={t} size={290} />
          </div>
        </div>
      </div>
      <div style={{ ...COLUMN, position: 'absolute', left: 0, right: 0, top: 790, gap: 26 }}>
        <div style={{ ...stencil, fontSize: 100, lineHeight: 1.05, maxWidth: 960, color: '#111', background: '#FFC400', border: '10px solid #111', borderRadius: 18, padding: '8px 40px', transform: 'rotate(-2deg)', animation: 'hp-pop 700ms 300ms ease-out both' }}>{word}</div>
        {/* a steel beam drops in with the points */}
        <div style={{ width: 920, height: 230, boxSizing: 'border-box', borderTop: '22px solid #7c2d12', borderBottom: '22px solid #7c2d12', backgroundImage: 'radial-gradient(circle, #5a1e08 9px, transparent 10px), linear-gradient(180deg, #c2410c, #ea580c 25%, #9a3412 50%, #ea580c 75%, #c2410c)', backgroundSize: '92px 50%, 100% 100%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'th-drop 1s 500ms ease-in both' }}>
          <div style={{ ...stencil, fontSize: 180, lineHeight: 1, color: '#FFFFFF', textShadow: '7px 7px 0 #431407' }}>+{pts}</div>
        </div>
        <div style={{ ...stencil, fontSize: 60, lineHeight: 1.1, color: '#111', textShadow: '0 3px 0 rgba(255,255,255,0.7)', maxWidth: 980 }}>{label(pts, t.name)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#111' }}>{who}</div>
      </div>
    </div>
  )
}

// ---------- Hawaii ----------
function Palm({ flip }) {
  const leaf = 'M272 250 Q 360 160 480 225 Q 370 200 272 264 Z'
  return (
    <svg viewBox="0 0 400 1000" width="420" height="1050" style={{ position: 'absolute', top: 640, [flip ? 'right' : 'left']: -60, overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      <g style={{ transformOrigin: '210px 1000px', animation: 'th-sway 3s ease-in-out infinite alternate' }}>
        <path d="M180 1000 C 195 720, 228 420, 258 250 L 288 256 C 262 430, 238 720, 236 1000 Z" fill="#3b1a3a" />
        {[-25, 10, 45, 135, 170, 205].map((a) => <path key={a} d={leaf} fill="#3b1a3a" transform={`rotate(${a} 272 250)`} />)}
      </g>
    </svg>
  )
}

export function Hawaii({ t, pts, crest, who, word }) {
  const script = { fontFamily: "'Pacifico', cursive" }
  const flowers = ['#FF5D8F', '#FFFFFF', '#FF8C42', '#E83F6F', '#FFD23F']
  const wave = (top, speed, op) => <div style={{ position: 'absolute', left: 0, right: 0, top, height: 40, opacity: op, backgroundImage: 'radial-gradient(circle at 50% 0, transparent 22px, #ffffff 23px, #ffffff 28px, transparent 29px)', backgroundSize: '80px 40px', animation: `th-waves ${speed}s linear infinite` }} />
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: '50%', top: 1180, width: 640, height: 640, marginLeft: -320, borderRadius: '50%', background: 'linear-gradient(#fff3b0, #ffd23f)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1320, bottom: 0, background: 'linear-gradient(180deg, #1b9aaa, #0b4f6c)' }} />
      {wave(1360, 2.2, 0.55)}
      {wave(1480, 1.6, 0.45)}
      {wave(1620, 1.2, 0.35)}
      {wave(1760, 0.9, 0.3)}
      <Palm />
      <Palm flip />
      <div style={{ ...COLUMN, gap: 10, paddingTop: 130 }}>
        <div style={{ ...script, fontSize: 140, lineHeight: 1.3, maxWidth: 1000, color: '#FFFFFF', textShadow: '6px 6px 0 #a8327a', animation: 'hp-pop 800ms cubic-bezier(.2,1.5,.4,1) both' }}>{word}</div>
        {/* the crest in a flower lei */}
        <div style={{ position: 'relative', width: 560, height: 560, animation: 'hp-rise 900ms 200ms cubic-bezier(.2,.9,.3,1) both' }}>
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2
            return <div key={i} style={{ position: 'absolute', left: 245 + Math.cos(a) * 245, top: 245 + Math.sin(a) * 245, width: 72, height: 72, marginLeft: -1, borderRadius: '50%', background: `radial-gradient(circle, #FFD23F 0 18%, ${flowers[i % flowers.length]} 20%)`, boxShadow: '0 4px 8px rgba(0,0,0,0.25)' }} />
          })}
          <div style={{ position: 'absolute', left: 90, top: 90, width: 380, height: 380, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crest src={crest} house={t} size={280} />
          </div>
        </div>
        <div style={{ ...script, fontSize: 170, lineHeight: 1.25, color: '#FFF3B0', textShadow: '6px 6px 0 #a8327a' }}>+{pts}</div>
        <div style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #a8327a', maxWidth: 960 }}>{label(pts, t.name)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', marginTop: 6 }}>{who}</div>
      </div>
    </div>
  )
}

// ---------- soccer ----------
function SoccerBall({ size = 120 }) {
  const pent = (cx, cy, r, rot = -90) => Array.from({ length: 5 }, (_, k) => {
    const a = ((rot + k * 72) * Math.PI) / 180
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`
  }).join(' ')
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <defs><clipPath id="ballclip"><circle cx="60" cy="60" r="56" /></clipPath></defs>
      <circle cx="60" cy="60" r="56" fill="#FFFFFF" />
      <g clipPath="url(#ballclip)" fill="#111">
        <polygon points={pent(60, 60, 20)} />
        {[0, 1, 2, 3, 4].map((k) => {
          const a = ((-90 + k * 72) * Math.PI) / 180
          return <polygon key={k} points={pent(60 + Math.cos(a) * 52, 60 + Math.sin(a) * 52, 15, 90 + k * 72)} />
        })}
      </g>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#111" strokeWidth="4" />
    </svg>
  )
}

export function Soccer({ t, pts, crest, who, word }) {
  const font = { fontFamily: "'Graduate', 'Anton', serif" }
  const line = 'rgba(255,255,255,0.85)'
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: 130, right: 130, top: 0, height: 540, border: `8px solid ${line}`, borderTop: 'none' }} />
      <div style={{ position: 'absolute', left: 320, right: 320, top: 0, height: 220, border: `8px solid ${line}`, borderTop: 'none' }} />
      <div style={{ position: 'absolute', left: '50%', top: 1640, width: 520, height: 520, marginLeft: -260, borderRadius: '50%', border: `8px solid ${line}` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1896, height: 8, background: line }} />
      {/* the goal: it shakes when the ball hits the net */}
      <div style={{ position: 'absolute', left: 190, right: 190, top: 10, height: 270, border: '16px solid #FFFFFF', borderBottom: 'none', boxShadow: '0 6px 0 rgba(0,0,0,0.25)', backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.55) 0 3px, transparent 3px 30px), repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 3px, transparent 3px 30px)', transformOrigin: 'top', animation: 'th-net 450ms 820ms ease-out both' }} />
      <div style={{ position: 'absolute', left: 'calc(50% - 60px)', top: 0, zIndex: 3, animation: 'th-shot 850ms cubic-bezier(.2,.7,.3,1) both' }}>
        <SoccerBall />
      </div>
      <div style={{ ...COLUMN, position: 'absolute', left: 0, right: 0, top: 340, gap: 24 }}>
        <div style={{ ...font, fontSize: 140, lineHeight: 1, maxWidth: 1000, color: '#FFFFFF', WebkitTextStroke: '6px #111', paintOrder: 'stroke fill', textShadow: '8px 8px 0 #111', animation: 'hp-slam 600ms 750ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ background: '#FFFFFF', border: '8px solid #111', borderRadius: 24, padding: 12, animation: 'hp-late-1 1300ms ease-out both' }}>
          <Crest src={crest} house={t} size={300} />
        </div>
        {/* scoreboard */}
        <div style={{ ...font, display: 'flex', alignItems: 'center', gap: 34, background: '#111', border: '8px solid #444', borderRadius: 18, padding: '12px 36px', animation: 'hp-late-2 1500ms ease-out both' }}>
          <div style={{ fontSize: 48, color: '#FFFFFF' }}>{t.name.toUpperCase()}</div>
          <div style={{ fontSize: 150, lineHeight: 1, color: '#FFD60A', textShadow: '0 0 22px #FFB000' }}>+{pts}</div>
        </div>
        <div style={{ ...font, fontSize: 54, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #111', maxWidth: 980 }}>{label(pts, t.name)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', textShadow: '0 2px 0 #111' }}>{who}</div>
      </div>
    </div>
  )
}

// ---------- golf ----------
export const GOLF_HOLE = { x: 775 / 1080, y: 1705 / 1920 } // where the ball drops (for the sparkles)

export function Golf({ t, pts, crest, who, word }) {
  const serif = { fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 900 }
  const green = '#1f5f2a'
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: -240, right: -240, top: 720, height: 520, borderRadius: '50%', background: '#5fb85f' }} />
      <div style={{ position: 'absolute', left: 120, right: -80, top: 1520, height: 380, borderRadius: '50%', background: '#58c55a', border: '10px solid #4aa84c' }} />
      <div style={{ position: 'absolute', left: 740, top: 1690, width: 70, height: 30, borderRadius: '50%', background: '#0d2b12' }} />
      <div style={{ position: 'absolute', left: 770, top: 1290, width: 10, height: 415, background: '#f5f5f5' }} />
      <div style={{ position: 'absolute', left: 780, top: 1290, width: 210, height: 130, background: t.bg, clipPath: 'polygon(0 0, 100% 50%, 0 100%)', transformOrigin: 'left center', animation: 'hp-wave 0.7s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', left: 0, top: 1676, width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 4px 6px rgba(0,0,0,0.35), inset -4px -4px 0 #dcdcdc', animation: 'th-putt 1.6s cubic-bezier(.25,.8,.4,1) both' }} />
      <div style={{ ...COLUMN, gap: 22, paddingTop: 130 }}>
        <div style={{ ...serif, fontSize: 116, lineHeight: 1.1, maxWidth: 1000, color: '#FFFFFF', textShadow: `4px 4px 0 ${green}`, animation: 'hp-fade-up 800ms ease-out both' }}>{word}</div>
        <div style={{ background: '#FFFFFF', border: `8px solid ${green}`, borderRadius: 24, padding: 12, animation: 'hp-pop 800ms 200ms ease-out both' }}>
          <Crest src={crest} house={t} size={290} />
        </div>
        <div style={{ width: 760, background: '#FFFFFF', border: `10px solid ${green}`, boxSizing: 'border-box', animation: 'hp-late-1 1300ms ease-out both' }}>
          <div style={{ background: green, color: '#FFFFFF', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, fontSize: 38, letterSpacing: 8, padding: '6px 0' }}>LEADERBOARD</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 30px' }}>
            <div style={{ fontSize: 46, fontWeight: 800, color: '#1f2f1f' }}>{t.name.toUpperCase()}</div>
            <div style={{ ...serif, fontStyle: 'normal', fontSize: 110, lineHeight: 1.1, color: '#C8102E' }}>+{pts}</div>
          </div>
        </div>
        <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.1, color: '#FFFFFF', textShadow: `3px 3px 0 ${green}`, maxWidth: 960 }}>{label(pts, t.name)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', textShadow: `0 2px 0 ${green}` }}>{who}</div>
      </div>
    </div>
  )
}

// ---------- K-pop ----------
export function Kpop({ t, pts, crest, who, word }) {
  const font = { fontFamily: "'Bungee', 'Anton', sans-serif" }
  const glow = ['#FF4FA3', '#5CE1E6', t.fx[0], '#FFE66D']
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 480, background: 'linear-gradient(180deg, #2a0a4a, #0d0218)' }} />
      {/* the crowd's light sticks */}
      {Array.from({ length: 12 }, (_, i) => {
        const c = glow[i % glow.length]
        return (
          <div key={i} style={{ position: 'absolute', left: 30 + i * 88, bottom: -40 - (i % 3) * 30, width: 16, height: 300, background: '#d9d9d9', borderRadius: 8, transformOrigin: '50% 100%', animation: `th-stick 0.8s ease-in-out ${-(i % 4) * 0.2}s infinite alternate` }}>
            <div style={{ position: 'absolute', top: -76, left: -37, width: 90, height: 90, borderRadius: '50%', background: c, boxShadow: `0 0 30px ${c}, 0 0 70px ${c}` }} />
          </div>
        )
      })}
      <div style={{ ...COLUMN, gap: 20, paddingTop: 160 }}>
        <div style={{ ...font, fontSize: 130, lineHeight: 1.05, maxWidth: 1000, backgroundImage: 'linear-gradient(90deg, #FF8AD8, #FFFFFF, #5CE1E6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 18px #ff4fa3)', animation: 'hp-pop 700ms cubic-bezier(.2,1.5,.4,1) both' }}>{word}</div>
        <div style={{ background: '#FFFFFF', borderRadius: 40, padding: 16, boxShadow: '0 0 50px #ff4fa3, 0 0 110px #7b2ff7', animation: 'hp-pop 700ms 150ms both, th-beat 0.48s ease-in-out 900ms infinite alternate' }}>
          <Crest src={crest} house={t} size={320} />
        </div>
        <div style={{ ...font, fontSize: 190, lineHeight: 1.05, color: '#FFFFFF', textShadow: '0 0 20px #ff4fa3, 0 0 50px #ff4fa3' }}>+{pts}</div>
        <div style={{ ...font, fontSize: 50, lineHeight: 1.15, color: '#FFE66D', textShadow: '0 0 16px #ff4fa3', maxWidth: 980 }}>{label(pts, t.name)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>{who}</div>
      </div>
    </div>
  )
}

// ---------- Irish ----------
export const IRISH_POT = { x: 0.82, y: 0.87 } // the pot of gold (coins burst from it)

export function Irish({ t, pts, crest, who, word }) {
  const celtic = { fontFamily: "'Uncial Antiqua', Georgia, serif" }
  const gold = { color: '#FFD700', WebkitTextStroke: '4px #0b3d1a', paintOrder: 'stroke fill', textShadow: '5px 5px 0 #0b3d1a' }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: '50%', top: 300, width: 1560, height: 1560, marginLeft: -780, borderRadius: '50%', opacity: 0.75, clipPath: 'inset(0 0 50% 0)', background: 'radial-gradient(circle, transparent 0 50%, #8f3fff 50% 53%, #3f51ff 53% 56%, #1fa2ff 56% 59%, #2ecc40 59% 62%, #ffe600 62% 65%, #ff8c00 65% 68%, #ff2d2d 68% 71%, transparent 71%)' }} />
      {/* pot of gold */}
      <div style={{ position: 'absolute', right: 60, bottom: 90, width: 260, height: 220, zIndex: 1 }}>
        <div style={{ position: 'absolute', top: 0, left: 20, width: 220, height: 90, borderRadius: '50% 50% 10px 10px', background: 'radial-gradient(circle at 40% 30%, #FFF6B0, #FFD700 40%, #B8860B)' }} />
        <div style={{ position: 'absolute', top: 54, left: 0, width: 260, height: 166, borderRadius: '30% 30% 45% 45%', background: '#1a1a1a' }} />
        <div style={{ position: 'absolute', top: 42, left: -12, width: 284, height: 34, borderRadius: 17, background: '#2e2e2e' }} />
      </div>
      <div style={{ ...COLUMN, gap: 20, paddingTop: 140 }}>
        <div style={{ ...celtic, ...gold, fontSize: 104, lineHeight: 1.1, maxWidth: 980, animation: 'hp-pop 800ms cubic-bezier(.2,1.5,.4,1) both' }}>{word}</div>
        <div style={{ animation: 'hp-pop 700ms 150ms both' }}>
          <div style={{ background: '#FFFFFF', border: '8px solid #FFD700', borderRadius: 24, padding: 12, animation: 'th-jig 0.42s ease-in-out 800ms infinite alternate' }}>
            <Crest src={crest} house={t} size={300} />
          </div>
        </div>
        <div style={{ ...celtic, ...gold, fontSize: 190, lineHeight: 1.1 }}>+{pts}</div>
        <div style={{ ...celtic, fontSize: 54, lineHeight: 1.15, color: '#FFFFFF', textShadow: '4px 4px 0 #0b3d1a', maxWidth: 960 }}>{label(pts, t.name)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', textShadow: '0 2px 0 #0b3d1a' }}>{who}</div>
      </div>
    </div>
  )
}

// ---------- rock and roll ----------
export function Rock({ t, pts, crest, who, word }) {
  const metal = { fontFamily: "'Metal Mania', 'Anton', serif" }
  const cone = (key) => <div key={key} style={{ width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, #555 0 14%, #111 15% 55%, #2a2a2a 56% 62%, #0a0a0a 63%)', animation: 'th-thump 0.45s ease-in-out infinite alternate' }} />
  const stack = (side) => (
    <div style={{ position: 'absolute', [side]: 16, bottom: 40, width: 230, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[0, 1].map((k) => (
        <div key={k} style={{ height: 380, background: '#151515', border: '6px solid #333', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
          {cone('a')}{cone('b')}
        </div>
      ))}
    </div>
  )
  const bolt = 'polygon(55% 0, 15% 55%, 45% 55%, 30% 100%, 85% 40%, 55% 40%, 75% 0)'
  return (
    <div style={FULL}>
      {stack('left')}
      {stack('right')}
      <div style={{ position: 'absolute', left: 60, top: 280, width: 180, height: 420, background: '#FFE600', clipPath: bolt, filter: 'drop-shadow(0 0 20px #ffe600)', animation: 'hp-flicker 0.9s linear infinite' }} />
      <div style={{ position: 'absolute', right: 60, top: 280, width: 180, height: 420, background: '#FFE600', clipPath: bolt, transform: 'scaleX(-1)', animation: 'hp-flicker 1.1s linear infinite' }} />
      <div style={{ ...COLUMN, gap: 18, paddingTop: 150, animation: 'th-quake 0.3s linear 4' }}>
        <div style={{ ...metal, fontSize: 146, lineHeight: 1.1, maxWidth: 980, backgroundImage: 'linear-gradient(180deg, #fff3b0 0%, #ffd23f 30%, #ff7b00 60%, #d00000 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 18px #ff4d00)', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '8px solid #111', padding: 12, boxShadow: '0 0 50px #ff4d00', animation: 'hp-pop 600ms 150ms both, th-beat 0.45s ease-in-out 800ms infinite alternate' }}>
          <Crest src={crest} house={t} size={310} />
        </div>
        <div style={{ ...metal, fontSize: 210, lineHeight: 1.05, backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #d9d9d9 40%, #555 50%, #e6e6e6 60%, #ffffff 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '3px #000' }}>+{pts}</div>
        <div style={{ ...metal, fontSize: 62, lineHeight: 1.1, color: '#FFFFFF', textShadow: '0 0 20px #ff4d00, 4px 4px 0 #000', maxWidth: 580 }}>{label(pts, t.name)}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', maxWidth: 600 }}>{who}</div>
      </div>
    </div>
  )
}

export const THEME_VIEWS = { macho: Macho, construction: Construction, hawaii: Hawaii, soccer: Soccer, golf: Golf, kpop: Kpop, irish: Irish, rock: Rock }
