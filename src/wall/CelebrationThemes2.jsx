import { Crest } from './CelebrationThemes.jsx'

// Eight more looks for the points celebration (see Celebration.jsx). Each
// fills the 1080×1920 wall frame. Their canvas effects are set up here
// (THEME2_FX) and drawn by Celebration.jsx's Effects with THEME2_SHAPES.
//   ninja    - rooftops under a big moon, shurikens, a spinning shell-framed crest
//   glam     - hot pink, glitter rays, rhinestones, "Fabulous!"
//   dogs     - a park, a happy dog peeking up, bones and paw prints
//   atomic   - a white flash, a cartoon mushroom cloud, a shockwave, "KA-BOOOM!"
//   robots   - a tech grid and scanner, a robot with blinking eyes
//   turbo    - a toy track loop, a car zooming past, nitro sparks
//   mountain - the crest on a flag planted on the summit, snow, "SUMMIT!"
//   zombies  - a foggy graveyard, cartoon zombie hands, bats, "BRAAAINS!"

export const THEME2_STYLES = ['ninja', 'glam', 'dogs', 'atomic', 'robots', 'turbo', 'mountain', 'zombies']

export const THEME2_WORDS = {
  ninja: ['HI-YAH!', 'NINJA STRIKE!', 'SHELL YEAH!', 'STEALTH MODE!', 'SENSEI APPROVED!'],
  glam: ['Fabulous!', 'Totally Iconic!', 'Dream Big!', 'Sparkle On!', 'You Did It!'],
  dogs: ['PAWSOME!', 'WOOF WOOF!', 'GOOD PUP!', 'WHO’S A GOOD HELPER?', 'TAIL WAGS!'],
  atomic: ['KA-BOOOM!', 'ATOMIC!', 'MEGATON!', 'NUCLEAR!', 'BLAST OFF!'],
  robots: ['TASK COMPLETE', 'BEEP BOOP!', 'SYSTEM UPGRADE', 'MISSION LOGGED', 'POWER LEVEL UP'],
  turbo: ['TURBO!', 'FULL THROTTLE!', 'NITRO BOOST!', 'ZOOM ZOOM!', 'SPEED DEMON!'],
  mountain: ['SUMMIT!', 'PEAK PERFORMANCE!', 'TOP OF THE WORLD!', 'YOU MADE IT!', 'NEW HEIGHTS!'],
  zombies: ['BRAAAINS!', 'IT’S ALIVE!', 'ZOMBIE APPROVED!', 'GRAVE JOB!', 'UNDEAD-ICATED!'],
}

export const THEME2_BACKDROP = {
  ninja: 'linear-gradient(180deg, #0b1330 0%, #1d2b5a 60%, #0b1330 100%)',
  glam: 'radial-gradient(ellipse at 50% 30%, #ffb3dd 0%, #ff4fa3 45%, #c2185b 85%)',
  dogs: 'linear-gradient(180deg, #8fd3ff 0%, #c9ecff 60%, #7ccf6a 60%, #4fae4a 100%)',
  atomic: 'linear-gradient(180deg, #2b0f00 0%, #7a2600 55%, #1a0a00 100%)',
  robots: 'radial-gradient(ellipse at 50% 40%, #0f3460 0%, #0a1a33 60%, #050b17 100%)',
  turbo: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 55%, #0f1c3d 100%)',
  mountain: 'linear-gradient(180deg, #3b7fd0 0%, #a9d4f5 55%, #e8f4fc 100%)',
  zombies: 'linear-gradient(180deg, #0d1b0f 0%, #1f3d23 55%, #0a120b 100%)',
}

export const THEME2_KEYFRAMES = `
@keyframes t2-flipin{0%{transform:rotateY(900deg) scale(.3);opacity:0}100%{transform:rotateY(0) scale(1);opacity:1}}
@keyframes t2-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes t2-flap{from{transform:rotate(-10deg)}to{transform:rotate(12deg)}}
@keyframes t2-lick{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.35)}}
@keyframes t2-peek{0%{transform:translateY(500px)}100%{transform:translateY(0)}}
@keyframes t2-flash{0%{opacity:1}100%{opacity:0}}
@keyframes t2-grow{0%{transform:scale(.08);opacity:.6}60%{opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes t2-ring{0%{transform:scale(.2);opacity:1}100%{transform:scale(7);opacity:0}}
@keyframes t2-scan{from{top:0}to{top:100%}}
@keyframes t2-blink{0%,88%,100%{transform:scaleY(1)}92%{transform:scaleY(.1)}}
@keyframes t2-eq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}
@keyframes t2-zoom{0%{transform:translateX(-420px)}100%{transform:translateX(1500px)}}
@keyframes t2-plant{0%{transform:translateY(-700px)}70%{transform:translateY(0)}85%{transform:translateY(-24px)}100%{transform:translateY(0)}}
@keyframes t2-hand{0%{transform:translateY(320px)}100%{transform:translateY(0)}}
@keyframes t2-wiggle{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
@keyframes t2-red{0%,100%{background:#ff1744;box-shadow:0 0 30px #ff1744}50%{background:#5a0010;box-shadow:none}}
`

const FULL = { position: 'absolute', inset: 0, overflow: 'hidden' }
const COLUMN = { position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }
const whoStyle = (color = '#FFFFFF', shadow = '0 2px 0 rgba(0,0,0,0.6)') => ({ fontSize: 32, fontWeight: 800, color, textShadow: shadow })
const circleCrest = (crest, t, size, ring, extra = {}) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', border: ring, ...extra }}>
    <Crest src={crest} house={t} size={size * 0.72} />
  </div>
)

// ---------- ninja ----------
export function Ninja({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bangers', 'Anton', sans-serif", letterSpacing: 3 }
  const sky = 'polygon(0 40%, 12% 40%, 12% 20%, 22% 20%, 22% 45%, 35% 45%, 35% 12%, 42% 0, 49% 12%, 49% 50%, 62% 50%, 62% 25%, 75% 25%, 75% 40%, 88% 40%, 88% 15%, 100% 15%, 100% 100%, 0 100%)'
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: '50%', top: 240, width: 720, height: 720, marginLeft: -360, borderRadius: '50%', background: 'radial-gradient(circle, #fffbe6 0%, #f3e7b0 60%, #d9c98a 100%)', opacity: 0.9 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 380, background: '#05081a', clipPath: sky }} />
      <div style={{ ...COLUMN, gap: 22, paddingTop: 300 }}>
        <div style={{ ...font, fontSize: 150, lineHeight: 1, maxWidth: 1000, color: '#7CFC00', WebkitTextStroke: '8px #0b3d0b', paintOrder: 'stroke fill', textShadow: '8px 8px 0 #000', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        {/* the crest in a turtle-shell ring, with bandana tails */}
        <div style={{ position: 'relative', perspective: 1200 }}>
          <div style={{ position: 'absolute', right: -120, top: 150, width: 190, height: 38, borderRadius: 19, background: t.fx[0], transformOrigin: 'left center', animation: 'th-sway 0.4s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', right: -110, top: 200, width: 160, height: 32, borderRadius: 16, background: t.fx[0], transformOrigin: 'left center', animation: 'th-sway 0.5s ease-in-out infinite alternate-reverse' }} />
          <div style={{ width: 470, height: 470, borderRadius: '50%', background: 'radial-gradient(circle, #6aa84f 0 55%, #3d7a2a 56% 100%)', border: '14px solid #2d5a1f', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 't2-flipin 1s cubic-bezier(.2,.9,.3,1) both' }}>
            {circleCrest(crest, t, 340, '8px solid #2d5a1f')}
          </div>
        </div>
        <div style={{ ...font, fontSize: 200, lineHeight: 1, color: '#FFFFFF', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill' }}>{big}</div>
        <div style={{ ...font, fontSize: 62, lineHeight: 1.1, color: '#7CFC00', textShadow: '4px 4px 0 #000', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle()}>{who}</div>
      </div>
    </div>
  )
}

// ---------- glam ----------
export function Glam({ t, big, line, crest, who, word }) {
  const script = { fontFamily: "'Pacifico', cursive" }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: '50%', top: '40%', width: 2400, height: 2400, margin: '-1200px 0 0 -1200px', background: 'repeating-conic-gradient(rgba(255,255,255,0.16) 0 8deg, transparent 8deg 20deg)', animation: 't2-spin 24s linear infinite' }} />
      <div style={{ ...COLUMN, gap: 16, paddingTop: 190 }}>
        <div style={{ ...script, fontSize: 140, lineHeight: 1.3, maxWidth: 1000, color: '#FFFFFF', textShadow: '0 0 24px #ffffff, 6px 6px 0 #c2185b', animation: 'hp-pop 800ms cubic-bezier(.2,1.5,.4,1) both' }}>{word}</div>
        <div style={{ animation: 'hp-pop 800ms 150ms both, th-beat 0.6s ease-in-out 1s infinite alternate' }}>
          <div style={{ width: 500, height: 500, borderRadius: '50%', background: '#ff80c0', border: '16px dotted #FFFFFF', boxSizing: 'border-box', boxShadow: '0 0 60px rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {circleCrest(crest, t, 370, '6px solid #ffd1e8')}
          </div>
        </div>
        <div style={{ ...script, fontSize: 180, lineHeight: 1.25, color: '#FFFFFF', textShadow: '6px 6px 0 #c2185b' }}>{big}</div>
        <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #c2185b', maxWidth: 960 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 2px 0 #c2185b')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- dogs ----------
function Dog() {
  return (
    <svg viewBox="0 0 400 360" width="720" height="648" aria-hidden="true" style={{ position: 'absolute', left: '50%', marginLeft: -360, bottom: -60, zIndex: 1, animation: 't2-peek 900ms 300ms cubic-bezier(.2,1.3,.4,1) both' }}>
      <g style={{ transformOrigin: '110px 110px', animation: 't2-flap 0.35s ease-in-out infinite alternate' }}>
        <ellipse cx="95" cy="160" rx="55" ry="105" fill="#8b5a2b" transform="rotate(20 95 160)" />
      </g>
      <g style={{ transformOrigin: '290px 110px', animation: 't2-flap 0.35s ease-in-out infinite alternate-reverse' }}>
        <ellipse cx="305" cy="160" rx="55" ry="105" fill="#8b5a2b" transform="rotate(-20 305 160)" />
      </g>
      <ellipse cx="200" cy="210" rx="150" ry="150" fill="#c68642" />
      <ellipse cx="200" cy="265" rx="95" ry="75" fill="#f1d1a6" />
      <circle cx="145" cy="180" r="20" fill="#2b1a0e" />
      <circle cx="255" cy="180" r="20" fill="#2b1a0e" />
      <circle cx="151" cy="173" r="7" fill="#FFFFFF" />
      <circle cx="261" cy="173" r="7" fill="#FFFFFF" />
      <ellipse cx="200" cy="232" rx="32" ry="22" fill="#2b1a0e" />
      <path d="M160 268 Q200 300 240 268" stroke="#2b1a0e" strokeWidth="7" fill="none" strokeLinecap="round" />
      <g style={{ transformOrigin: '200px 285px', animation: 't2-lick 0.5s ease-in-out infinite' }}>
        <path d="M182 282 Q182 340 200 340 Q218 340 218 282 Z" fill="#ff6f91" />
      </g>
    </svg>
  )
}

export function Dogs({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bangers', 'Anton', sans-serif", letterSpacing: 3 }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', right: 80, top: 90, width: 180, height: 180, borderRadius: '50%', background: '#ffe066', boxShadow: '0 0 60px #ffe066' }} />
      <Dog />
      <div style={{ ...COLUMN, gap: 18, paddingTop: 150 }}>
        <div style={{ ...font, fontSize: 124, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', WebkitTextStroke: '8px #6b3f1d', paintOrder: 'stroke fill', textShadow: '7px 7px 0 #6b3f1d', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ animation: 'hp-pop 700ms 150ms both, hp-wobble 1.4s ease-in-out 900ms infinite' }}>
          {circleCrest(crest, t, 380, '12px solid #6b3f1d')}
        </div>
        <div style={{ ...font, fontSize: 190, lineHeight: 1, color: '#ffd23f', WebkitTextStroke: '8px #6b3f1d', paintOrder: 'stroke fill' }}>{big}</div>
        <div style={{ ...font, fontSize: 60, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #6b3f1d', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 2px 0 #6b3f1d')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- atomic (cartoon) ----------
function Mushroom() {
  return (
    <svg viewBox="0 0 1080 1300" width="1080" height="1300" aria-hidden="true" style={{ position: 'absolute', left: 0, bottom: 0, transformOrigin: '50% 100%', animation: 't2-grow 1.6s cubic-bezier(.2,.8,.3,1) both' }}>
      <defs>
        <radialGradient id="fireball" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="35%" stopColor="#ffb347" />
          <stop offset="70%" stopColor="#ff4d00" />
          <stop offset="100%" stopColor="#8b1a00" />
        </radialGradient>
        <linearGradient id="stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff7b00" />
          <stop offset="100%" stopColor="#5a1500" />
        </linearGradient>
      </defs>
      <path d="M470 1300 C 480 1000, 470 760, 440 600 L 640 600 C 610 760, 600 1000, 610 1300 Z" fill="url(#stem)" />
      <ellipse cx="540" cy="820" rx="230" ry="60" fill="none" stroke="#ffb347" strokeWidth="26" opacity="0.8" />
      {[[540, 470, 300], [330, 540, 190], [750, 540, 190], [420, 380, 190], [660, 380, 190], [540, 300, 180]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="url(#fireball)" />
      ))}
      <ellipse cx="540" cy="1290" rx="520" ry="70" fill="#ff7b00" opacity="0.7" />
    </svg>
  )
}

export function Atomic({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Anton', 'Outfit', sans-serif", letterSpacing: 3 }
  return (
    <div style={{ ...FULL, animation: 'th-quake 0.25s linear 6' }}>
      <Mushroom />
      <div style={{ position: 'absolute', left: '50%', bottom: 60, width: 220, height: 80, marginLeft: -110, borderRadius: '50%', border: '18px solid #fff3b0', boxSizing: 'border-box', animation: 't2-ring 1.5s 300ms ease-out both' }} />
      <div style={{ ...COLUMN, gap: 14, paddingTop: 130 }}>
        <div style={{ ...font, fontSize: 150, lineHeight: 1, maxWidth: 1000, color: '#FFE600', textShadow: '0 8px 0 #000, 0 0 40px #ff4d00', animation: 'hp-slam 600ms 400ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 12, border: '8px solid #000', boxShadow: '0 0 60px #ff9f1c', animation: 'hp-slam 700ms 600ms cubic-bezier(.2,1.4,.4,1) both' }}>
          <Crest src={crest} house={t} size={300} />
        </div>
        <div style={{ ...font, fontSize: 220, lineHeight: 1, color: '#FFFFFF', textShadow: '0 10px 0 #000, 0 0 30px #ff4d00' }}>{big}</div>
        <div style={{ ...font, fontSize: 64, lineHeight: 1.1, color: '#FFFFFF', textShadow: '0 6px 0 #000', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 3px 0 #000')}>{who}</div>
      </div>
      {/* the white flash first */}
      <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', zIndex: 5, pointerEvents: 'none', animation: 't2-flash 900ms ease-out both' }} />
    </div>
  )
}

// ---------- robots ----------
export function Robots({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Orbitron', 'Russo One', sans-serif", fontWeight: 900 }
  const metal = 'linear-gradient(180deg, #d5dde8 0%, #9aa7ba 60%, #6f7c92 100%)'
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,229,255,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(0,229,255,0.12) 2px, transparent 2px)', backgroundSize: '60px 60px' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, height: 6, background: '#00e5ff', boxShadow: '0 0 30px #00e5ff', animation: 't2-scan 2.2s linear infinite', zIndex: 3 }} />
      <div style={{ ...COLUMN, gap: 18, paddingTop: 140 }}>
        <div style={{ ...font, fontSize: 92, lineHeight: 1.1, maxWidth: 1000, color: '#00e5ff', textShadow: '0 0 24px #00e5ff, 4px 4px 0 #002f3a', animation: 'hp-steps 900ms steps(6) both' }}>{word}</div>
        {/* robot head */}
        <div style={{ position: 'relative', width: 540, height: 380, marginTop: 50, animation: 'hp-pop 700ms 200ms both' }}>
          <div style={{ position: 'absolute', left: 262, top: -60, width: 16, height: 60, background: '#6f7c92' }} />
          <div style={{ position: 'absolute', left: 245, top: -95, width: 50, height: 50, borderRadius: '50%', animation: 't2-red 0.8s linear infinite' }} />
          {[-34, 540].map((x) => <div key={x} style={{ position: 'absolute', left: x, top: 130, width: 34, height: 120, borderRadius: 10, background: '#6f7c92' }} />)}
          <div style={{ position: 'absolute', inset: 0, background: metal, borderRadius: 60, border: '10px solid #3b4a63', boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', left: 50, right: 50, top: 50, bottom: 50, background: '#0a1422', borderRadius: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
            <div style={{ display: 'flex', gap: 120 }}>
              {[0, 1].map((k) => <div key={k} style={{ width: 80, height: 80, borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 40px #00e5ff', animation: 't2-blink 2.4s ease-in-out infinite' }} />)}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 50 }}>
              {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ width: 22, height: 50, background: '#7CFC00', borderRadius: 4, transformOrigin: 'bottom', animation: `t2-eq ${0.25 + (i % 4) * 0.08}s ease-in-out ${-(i % 3) * 0.1}s infinite alternate` }} />)}
            </div>
          </div>
        </div>
        {/* chest plate with the crest */}
        <div style={{ background: metal, borderRadius: 28, border: '10px solid #3b4a63', padding: 14, animation: 'hp-late-1 1300ms ease-out both' }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 8 }}>
            <Crest src={crest} house={t} size={230} />
          </div>
        </div>
        <div style={{ ...font, fontSize: 170, lineHeight: 1, color: '#FFFFFF', textShadow: '0 0 24px #00e5ff' }}>{big}</div>
        <div style={{ ...font, fontSize: 44, lineHeight: 1.25, color: '#7CFC00', textShadow: '0 0 16px #7CFC00', maxWidth: 980 }}>{line.toUpperCase()}</div>
        <div style={whoStyle('#cfe9ff', 'none')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- turbo (toy race track) ----------
function Car({ color }) {
  return (
    <svg viewBox="0 0 300 120" width="300" height="120" aria-hidden="true">
      <path d="M20 80 L40 50 Q60 30 110 28 L170 28 Q200 30 225 52 L270 60 Q290 64 290 84 L290 92 L20 92 Z" fill={color} stroke="#111" strokeWidth="6" />
      <path d="M90 36 L120 34 L120 54 L75 56 Z M132 34 L168 34 Q190 38 205 54 L132 54 Z" fill="#bfe9ff" stroke="#111" strokeWidth="4" />
      <circle cx="80" cy="94" r="22" fill="#111" /><circle cx="80" cy="94" r="9" fill="#ccc" />
      <circle cx="235" cy="94" r="22" fill="#111" /><circle cx="235" cy="94" r="9" fill="#ccc" />
    </svg>
  )
}

export function Turbo({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Russo One', 'Outfit', sans-serif", fontStyle: 'italic' }
  // (Padding: slanted letters lean past their box, and the flame fill stops at the box edge.)
  const flameText = { padding: '0 0.18em', backgroundImage: 'linear-gradient(180deg, #fff3b0 0%, #ffd23f 35%, #ff7b00 65%, #d00000 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(4px 4px 0 #111)' }
  return (
    <div style={FULL}>
      {/* the loop */}
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="540" cy="560" r="330" fill="none" stroke="#c45a00" strokeWidth="96" />
        <circle cx="540" cy="560" r="330" fill="none" stroke="#ff7a00" strokeWidth="76" />
        <circle cx="540" cy="560" r="330" fill="none" stroke="#ffd23f" strokeWidth="6" strokeDasharray="30 30" />
      </svg>
      {/* the straight and a car zooming along it */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1560, height: 90, background: '#ff7a00', borderTop: '10px solid #c45a00', borderBottom: '10px solid #c45a00', backgroundImage: 'repeating-linear-gradient(90deg, #ffd23f 0 40px, transparent 40px 80px)', backgroundSize: '100% 6px', backgroundRepeat: 'no-repeat', backgroundPosition: '0 50%' }} />
      <div style={{ position: 'absolute', left: 0, top: 1460, zIndex: 3, display: 'flex', alignItems: 'center', animation: 't2-zoom 1.3s cubic-bezier(.5,0,.5,1) infinite' }}>
        <div style={{ width: 240, height: 34, marginRight: -20, borderRadius: 17, background: 'linear-gradient(90deg, transparent, #ffd23f, #ff4d00)' }} />
        <Car color={t.fx[0]} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 60, ...COLUMN }}>
        <div style={{ ...font, ...flameText, fontSize: 116, lineHeight: 1.05, maxWidth: 1000, animation: 'hp-zoom-in 500ms cubic-bezier(.2,1.3,.4,1) both' }}>{word}</div>
      </div>
      <div style={{ position: 'absolute', left: 340, top: 360, width: 400, height: 400, zIndex: 2, animation: 'hp-pop 700ms 200ms both' }}>
        {circleCrest(crest, t, 400, '12px solid #111')}
      </div>
      <div style={{ ...COLUMN, position: 'absolute', left: 0, right: 0, top: 930, gap: 14 }}>
        <div style={{ ...font, ...flameText, fontSize: 200, lineHeight: 1.05 }}>{big}</div>
        <div style={{ ...font, fontSize: 60, lineHeight: 1.1, color: '#FFFFFF', textShadow: '5px 5px 0 #111', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 3px 0 #111')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- mountain ----------
export const SUMMIT = { x: 0.5, y: 940 / 1920 }

export function Mountain({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  return (
    <div style={FULL}>
      <svg viewBox="0 0 1080 1100" width="1080" height="1100" aria-hidden="true" style={{ position: 'absolute', left: 0, bottom: 0 }}>
        <polygon points="0,1100 0,620 200,420 380,700 520,520 700,760 880,460 1080,700 1080,1100" fill="#8fa3bf" />
        <polygon points="0,1100 300,520 540,120 780,520 1080,1100" fill="#4b5d78" />
        <polygon points="455,280 540,120 625,280 595,255 565,305 530,258 500,305" fill="#FFFFFF" />
        <polygon points="0,1100 160,900 330,1000 540,860 760,990 920,880 1080,980 1080,1100" fill="#e8f1fa" />
      </svg>
      {/* the flag, planted on the summit, with the crest on it */}
      <div style={{ position: 'absolute', left: 535, top: 560, width: 10, height: 390, zIndex: 2, animation: 't2-plant 1s 300ms cubic-bezier(.4,0,.5,1) both' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#3b2a1a', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 10, top: 0, width: 330, height: 230, background: t.bg, border: `6px solid ${t.edge}`, boxSizing: 'border-box', transformOrigin: 'left center', animation: 'hp-wave 0.8s ease-in-out infinite alternate', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {circleCrest(crest, t, 180, `4px solid ${t.edge}`)}
        </div>
      </div>
      <div style={{ ...COLUMN, gap: 14, paddingTop: 90 }}>
        <div style={{ ...font, fontSize: 110, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', textShadow: '6px 6px 0 #1f3b63', animation: 'hp-fade-up 700ms ease-out both' }}>{word}</div>
        <div style={{ ...font, fontSize: 170, lineHeight: 1, color: '#FFFFFF', textShadow: '7px 7px 0 #1f3b63' }}>{big}</div>
        <div style={{ ...font, fontSize: 52, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #1f3b63', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 2px 0 #1f3b63')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- zombies (cartoon) ----------
function Hand({ x, delay, flip }) {
  return (
    <svg viewBox="0 0 120 260" width="150" height="325" aria-hidden="true" style={{ position: 'absolute', left: x, bottom: 150, zIndex: 1, transform: flip ? 'scaleX(-1)' : undefined }}>
      <g style={{ animation: `t2-hand 900ms ${delay}ms cubic-bezier(.2,1.2,.4,1) both` }}>
        <g style={{ transformOrigin: '60px 250px', animation: `t2-wiggle 0.6s ease-in-out ${delay + 900}ms infinite alternate` }}>
          <path d="M40 260 L42 130 Q20 120 16 90 L14 50 Q14 40 22 40 Q30 40 30 50 L32 86 L34 30 Q34 20 43 20 Q52 20 52 30 L52 84 L56 18 Q56 8 65 8 Q74 8 74 18 L72 86 L78 34 Q79 24 88 25 Q97 26 96 36 L90 110 Q104 96 112 104 Q118 112 108 124 L84 150 L82 260 Z" fill="#7bc96f" stroke="#2f5e2a" strokeWidth="5" />
        </g>
      </g>
    </svg>
  )
}

export function Zombies({ t, big, line, crest, who, word }) {
  const creep = { fontFamily: "'Creepster', 'Bangers', cursive", letterSpacing: 3 }
  const stone = (x, h, label) => (
    <div key={x} style={{ position: 'absolute', left: x, bottom: 150, width: 150, height: h, background: 'linear-gradient(180deg, #8a8f8a, #5b605b)', borderRadius: '75px 75px 8px 8px', border: '5px solid #3a3e3a', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', paddingTop: 40, fontSize: 34, fontWeight: 900, color: '#3a3e3a' }}>{label}</div>
  )
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: 90, top: 90, width: 200, height: 200, borderRadius: '50%', background: '#e6f5c9', boxShadow: '0 0 80px #b8e986' }} />
      {stone(40, 230, 'RIP')}
      {stone(880, 200, 'RIP')}
      <Hand x={250} delay={300} />
      <Hand x={470} delay={700} flip />
      <Hand x={680} delay={500} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: 'linear-gradient(180deg, #2a3a22, #10180e)', zIndex: 2 }} />
      <div style={{ ...COLUMN, gap: 16, paddingTop: 170, zIndex: 3 }}>
        <div style={{ ...creep, fontSize: 150, lineHeight: 1, maxWidth: 1000, color: '#9cff57', textShadow: '0 6px 0 #000, 0 0 30px #4caf50', animation: 'hp-slam 700ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 12, border: '8px solid #2f5e2a', boxShadow: '0 0 50px #4caf50', animation: 'hp-pop 700ms 200ms both, hp-wobble 1.2s ease-in-out 900ms infinite' }}>
          <Crest src={crest} house={t} size={290} />
        </div>
        <div style={{ ...creep, fontSize: 200, lineHeight: 1, color: '#FFFFFF', textShadow: '0 8px 0 #000, 0 0 30px #4caf50' }}>{big}</div>
        <div style={{ ...creep, fontSize: 64, lineHeight: 1.1, color: '#9cff57', textShadow: '0 4px 0 #000', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#e6f5c9', '0 2px 0 #000')}>{who}</div>
      </div>
    </div>
  )
}

export const THEME2_VIEWS = { ninja: Ninja, glam: Glam, dogs: Dogs, atomic: Atomic, robots: Robots, turbo: Turbo, mountain: Mountain, zombies: Zombies }

// ---------- canvas shapes for these effects (drawn around 0,0 at size p.r) ----------
export const THEME2_SHAPES = {
  shuriken(ctx, p) {
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      const rr = i % 2 ? p.r * 0.3 : p.r
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
    }
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#1d2b5a'
    ctx.beginPath()
    ctx.arc(0, 0, p.r * 0.15, 0, Math.PI * 2)
    ctx.fill()
  },
  bone(ctx, p) {
    const r = p.r
    ctx.fillRect(-r, -r * 0.22, r * 2, r * 0.44)
    for (const [x, y] of [[-r, -r * 0.25], [-r, r * 0.25], [r, -r * 0.25], [r, r * 0.25]]) {
      ctx.beginPath()
      ctx.arc(x, y, r * 0.3, 0, Math.PI * 2)
      ctx.fill()
    }
  },
  paw(ctx, p) {
    const r = p.r
    ctx.beginPath()
    ctx.ellipse(0, r * 0.25, r * 0.5, r * 0.4, 0, 0, Math.PI * 2)
    ctx.fill()
    for (const [x, y] of [[-r * 0.55, -r * 0.2], [-r * 0.2, -r * 0.55], [r * 0.2, -r * 0.55], [r * 0.55, -r * 0.2]]) {
      ctx.beginPath()
      ctx.arc(x, y, r * 0.2, 0, Math.PI * 2)
      ctx.fill()
    }
  },
  gear(ctx, p) {
    const r = p.r
    for (let i = 0; i < 8; i++) {
      ctx.save()
      ctx.rotate((i * Math.PI) / 4)
      ctx.fillRect(-r * 0.16, -r * 1.05, r * 0.32, r * 0.4)
      ctx.restore()
    }
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0a1a33'
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2)
    ctx.fill()
  },
  bat(ctx, p) {
    const r = p.r
    const flap = Math.sin((p.ph += 0.35)) * r * 0.35
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(-r * 0.5, -r * 0.6 - flap, -r * 1.3, -r * 0.2 - flap)
    ctx.quadraticCurveTo(-r * 0.9, r * 0.1, -r * 0.7, r * 0.4)
    ctx.quadraticCurveTo(-r * 0.4, r * 0.1, 0, r * 0.35)
    ctx.quadraticCurveTo(r * 0.4, r * 0.1, r * 0.7, r * 0.4)
    ctx.quadraticCurveTo(r * 0.9, r * 0.1, r * 1.3, -r * 0.2 - flap)
    ctx.quadraticCurveTo(r * 0.5, -r * 0.6 - flap, 0, 0)
    ctx.fill()
  },
}

// ---------- effect setups: push particles for each style ----------
// Called by Effects with helpers; particles use the kinds above or the
// built-in ones ('c' confetti, 'star5', 'heart', 'flash', 'puff', 'flame',
// 'spark', 'streak', 'ember'; any other kind draws a plain dot).
export const THEME2_FX = {
  ninja({ w, h, parts, R }) {
    for (let i = 0; i < 26; i++) parts.push({ kind: 'shuriken', x: -R(60, 900), y: R(h * 0.05, h * 0.9), vx: R(18, 30), vy: R(-1, 1), r: R(18, 28), c: '#cfd8dc', rot: R(0, 6), spin: 0.45, life: 400, delay: Math.floor(R(0, 300)) })
    for (let i = 0; i < 30; i++) parts.push({ kind: 'puff', x: R(0, w), y: R(h * 0.2, h * 0.9), vx: R(-1, 1), vy: R(-1.5, -0.3), r: R(24, 46), c: '#7CFC00', life: 60, max: 60, delay: Math.floor(R(0, 330)) })
  },
  glam({ w, h, parts, R, rain, rise }) {
    rain(130, 'star5', ['#FFFFFF', '#FFD700', '#FFE4F2', '#FF8AD8'], { vy: 1.6, vyr: 2.5, r: 8, rr: 14, sw: 1.2, spread: 1.6, spin: 0.08 })
    rise(60, 'heart', ['#FFFFFF', '#FFD1E8', '#FF4FA3'], { vy: 1.5, vyr: 2.5, r: 12, rr: 14, sw: 1.2, delay: 300 })
    for (let i = 0; i < 30; i++) parts.push({ kind: 'flash', x: R(0, w), y: R(0, h), r: R(20, 40), c: '#FFFFFF', life: 18, max: 18, delay: Math.floor(R(0, 360)) })
  },
  dogs({ rain }) {
    rain(50, 'bone', ['#f5f0e6', '#efe4cf'], { vy: 2, vyr: 3, r: 22, rr: 10, sw: 0.8, spread: 1.5, spin: 0.08 })
    rain(60, 'paw', ['#6b3f1d', '#8b5a2b', '#3d2410'], { vy: 2, vyr: 3, r: 18, rr: 10, sw: 0.6, spread: 1.6, spin: 0.03 })
  },
  atomic({ w, h, parts, R }) {
    const fire = ['#FFF3B0', '#FFD23F', '#FF9F1C', '#FF4D00', '#B22222']
    for (let i = 0; i < 260; i++) {
      const a = R(Math.PI * 1.05, Math.PI * 1.95)
      const sp = R(4, 20)
      parts.push({ kind: 'flame', x: w / 2 + R(-60, 60), y: h * 0.78, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: R(18, 46), c: fire[i % fire.length], g: -0.04, life: R(70, 120), max: 120, delay: 12 })
    }
    for (let i = 0; i < 140; i++) {
      const a = R(Math.PI, Math.PI * 2)
      const sp = R(8, 26)
      parts.push({ kind: 'c', x: w / 2, y: h * 0.8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: R(5, 12), c: ['#3a2a1a', '#5a3a1a', '#ff9f1c', '#222'][i % 4], rot: R(0, 6), g: 0.45, life: 300, delay: 14 })
    }
  },
  robots({ w, h, parts, R, rain }) {
    rain(60, 'gear', ['#90a4ae', '#b0bec5', '#00e5ff', '#cfd8dc'], { vy: 2, vyr: 3, r: 14, rr: 14, sw: 0.6, spread: 1.5, spin: 0.08 })
    for (let k = 0; k < 7; k++) {
      const cx = R(w * 0.1, w * 0.9)
      const cy = R(h * 0.1, h * 0.8)
      for (let i = 0; i < 22; i++) {
        const a = R(0, Math.PI * 2)
        const sp = R(3, 10)
        parts.push({ kind: 'spark', x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: R(3, 6), c: i % 2 ? '#00e5ff' : '#FFFFFF', g: 0.15, life: 50, max: 50, delay: k * 45 })
      }
    }
  },
  turbo({ w, h, parts, R }) {
    for (let i = 0; i < 70; i++) parts.push({ kind: 'streak', x: -R(0, w * 2), y: R(0, h), vx: R(40, 70), vy: 0, r: R(120, 320), c: ['#FFFFFF', '#ffd23f', '#ff7a00'][i % 3], life: 500, delay: Math.floor(R(0, 200)) })
    for (let i = 0; i < 160; i++) parts.push({ kind: 'ember', x: R(0, w), y: h * 0.81, vx: R(-3, -0.5), vy: R(-7, -1), r: R(4, 9), c: ['#FFF3B0', '#FFD23F', '#FF9F1C', '#FF4D00'][i % 4], g: 0.15, life: 45, max: 45, delay: Math.floor(R(0, 360)) })
  },
  mountain({ w, h, parts, R, rain, colors }) {
    rain(220, 'snow', ['#FFFFFF', '#eef6ff'], { vy: 1, vyr: 1.6, r: 3, rr: 5, sw: 1.1, spread: 1.4 })
    for (let i = 0; i < 170; i++) {
      const a = R(Math.PI * 1.1, Math.PI * 1.9)
      const sp = R(6, 18)
      parts.push({ kind: 'c', x: w / 2, y: h * 0.49, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: R(5, 11), c: colors[i % colors.length], rot: R(0, 6), g: 0.35, life: 300, delay: 75 })
    }
  },
  zombies({ w, h, parts, R }) {
    for (let i = 0; i < 46; i++) parts.push({ kind: 'puff', x: R(0, w), y: h - R(80, 200), vx: R(-0.8, 0.8), vy: R(-1.6, -0.5), r: R(40, 80), c: '#7bd389', life: 120, max: 240, delay: Math.floor(R(0, 300)) })
    for (let i = 0; i < 14; i++) parts.push({ kind: 'bat', x: -R(40, 700), y: R(h * 0.04, h * 0.4), vx: R(5, 9), vy: R(-0.6, 0.6), r: R(22, 36), c: '#000000', ph: R(0, 6), life: 500, delay: Math.floor(R(0, 260)) })
  },
}
