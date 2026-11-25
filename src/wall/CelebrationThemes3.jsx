import { Crest } from './CelebrationThemes.jsx'

// Ten more looks for the points celebration (see Celebration.jsx). Each fills
// the 1080×1920 wall frame. Canvas effects are set up in THEME3_FX and drawn by
// Celebration.jsx's Effects with THEME3_SHAPES.
//   football - a field, goalposts, a ball spiralling through, "TOUCHDOWN!"
//   hockey   - the rink, a puck into the net, the goal light
//   monster  - an old black-and-white creature feature with a title card
//   kaiju    - a giant (original, cartoon) lizard over a city skyline
//   sheep    - green hills, a fluffy sheep jumping the fence
//   snow     - a snowman wearing the crest, snowflakes
//   sun      - a big sun with turning rays, sunglasses drop onto the crest
//   waves    - rolling sea, the crest on a bobbing life ring
//   surfing  - a curling wave and a surfboard carrying the crest
//   wakeup   - sunrise in the window, a ringing alarm clock

export const THEME3_STYLES = ['football', 'hockey', 'monster', 'kaiju', 'sheep', 'snow', 'sun', 'waves', 'surfing', 'wakeup']

export const THEME3_WORDS = {
  football: ['TOUCHDOWN!', 'FIELD GOAL!', 'END ZONE!', 'FIRST DOWN!', 'HUT HUT HIKE!'],
  hockey: ['GOAL!', 'TOP SHELF!', 'HAT TRICK!', 'LIGHT THE LAMP!', 'SHOOTS AND SCORES!'],
  monster: ['IT CAME FROM THE KITCHEN!', 'ATTACK OF THE CHORE CHAMP!', 'THE CREATURE DID IT!', 'NOW SHOWING!', 'A MONSTER EFFORT!'],
  kaiju: ['ROOOAR!', 'KAIJU-SIZED!', 'MONSTER MOVE!', 'STOMP STOMP!', 'CITY SAVED!'],
  sheep: ['EWE DID IT!', 'BAA-RILLIANT!', 'SHEER GENIUS!', 'WOOL DONE!', 'BAAA-RAVO!'],
  snow: ['SNOW-MAZING!', 'COOL MOVE!', 'CHILL CHAMP!', 'FLAKE-TASTIC!', 'ICE WORK!'],
  sun: ['SUNSATIONAL!', 'RAY OF SUNSHINE!', 'BRIGHT IDEA!', 'HOT STUFF!', 'SHINE ON!'],
  waves: ['MAKING WAVES!', 'TIDE’S IN!', 'OCEAN OF AWESOME!', 'SHORE THING!', 'WAVE HELLO!'],
  surfing: ['SURF’S UP!', 'HANG TEN!', 'TOTALLY TUBULAR!', 'RIDE THE WAVE!', 'GNARLY!'],
  wakeup: ['RISE AND SHINE!', 'GOOD MORNING!', 'UP AND AT ’EM!', 'WIDE AWAKE!', 'EARLY BIRD!'],
}

export const THEME3_BACKDROP = {
  football: 'repeating-linear-gradient(180deg, #2e8b3a 0 150px, #34a043 150px 300px)',
  hockey: 'linear-gradient(180deg, #eef7ff 0%, #d6ebfa 100%)',
  monster: 'radial-gradient(ellipse at 50% 40%, #6b6b6b 0%, #2a2a2a 60%, #0d0d0d 100%)',
  kaiju: 'linear-gradient(180deg, #0a0f2c 0%, #23305e 55%, #3c2a4d 100%)',
  sheep: 'linear-gradient(180deg, #7ec8ff 0%, #bfe6ff 55%, #8fd16a 55%, #5fae45 100%)',
  snow: 'linear-gradient(180deg, #2f5fa7 0%, #7fb0e6 60%, #eaf4ff 60%, #ffffff 100%)',
  sun: 'radial-gradient(circle at 50% 40%, #fff6b0 0%, #ffd23f 35%, #ff9f1c 70%, #ff6b00 100%)',
  waves: 'linear-gradient(180deg, #8fd8ff 0%, #c8eeff 45%, #1f8fd1 45%, #0b4f8a 100%)',
  surfing: 'linear-gradient(180deg, #ff9a5a 0%, #ffcf6b 35%, #7fd3e8 60%, #1a7fb5 100%)',
  wakeup: 'linear-gradient(180deg, #f7d9a8 0%, #f2b8a0 100%)',
}

export const THEME3_KEYFRAMES = `
@keyframes t3-kick{0%{transform:translate(0,0) scale(1.6) rotate(0)}100%{transform:translate(0,-1180px) scale(.45) rotate(1080deg)}}
@keyframes t3-slide{0%{transform:translateX(-900px)}80%{transform:translateX(0)}100%{transform:translateX(0)}}
@keyframes t3-rise{0%{transform:translateY(900px)}100%{transform:translateY(0)}}
@keyframes t3-hop{0%,100%{transform:translate(-260px,0) rotate(0)}50%{transform:translate(0,-260px) rotate(-8deg)}99%{transform:translate(260px,0) rotate(0)}}
@keyframes t3-bob{from{transform:translateY(-14px) rotate(-4deg)}to{transform:translateY(14px) rotate(4deg)}}
@keyframes t3-surf{0%{transform:translate(-700px,260px) rotate(-14deg)}100%{transform:translate(0,0) rotate(-8deg)}}
@keyframes t3-ring{0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}75%{transform:rotate(9deg)}}
@keyframes t3-drop{0%{transform:translateY(-900px)}80%{transform:translateY(10px)}100%{transform:translateY(0)}}
@keyframes t3-swell{from{transform:translateX(0)}to{transform:translateX(-540px)}}
@keyframes t3-grain{0%,100%{opacity:.18}50%{opacity:.08}}
@keyframes t3-roll{from{background-position:0 0}to{background-position:0 120px}}
@keyframes t3-sunup{0%{transform:translateY(300px)}100%{transform:translateY(0)}}
`

const FULL = { position: 'absolute', inset: 0, overflow: 'hidden' }
const COLUMN = { position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }
export const whoStyle = (color = '#FFFFFF', shadow = '0 2px 0 rgba(0,0,0,0.6)') => ({ fontSize: 32, fontWeight: 800, color, textShadow: shadow })
export const circleCrest = (crest, t, size, ring, extra = {}) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', border: ring, ...extra }}>
    <Crest src={crest} house={t} size={size * 0.72} />
  </div>
)
export const outlined = (stroke, width = 8) => ({ WebkitTextStroke: `${width}px ${stroke}`, paintOrder: 'stroke fill' })

// ---------- football ----------
function Football({ size = 150 }) {
  return (
    <svg viewBox="0 0 200 120" width={size} height={size * 0.6} aria-hidden="true">
      <ellipse cx="100" cy="60" rx="95" ry="55" fill="#8b4513" stroke="#3d1f08" strokeWidth="6" />
      <path d="M30 40 Q20 60 30 80 M170 40 Q180 60 170 80" stroke="#FFFFFF" strokeWidth="7" fill="none" />
      <path d="M60 60 L140 60" stroke="#FFFFFF" strokeWidth="6" />
      {[72, 88, 104, 120].map((x) => <path key={x} d={`M${x} 50 L${x} 70`} stroke="#FFFFFF" strokeWidth="5" />)}
    </svg>
  )
}

export function FootballView({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Graduate', 'Anton', serif" }
  return (
    <div style={FULL}>
      {/* yard lines and goalposts */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 146px, rgba(255,255,255,0.7) 146px 152px)' }} />
      <svg viewBox="0 0 1080 700" width="1080" height="700" aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x="530" y="420" width="20" height="280" fill="#ffd400" />
        <rect x="290" y="410" width="500" height="22" fill="#ffd400" />
        <rect x="290" y="40" width="20" height="392" fill="#ffd400" />
        <rect x="770" y="40" width="20" height="392" fill="#ffd400" />
      </svg>
      <div style={{ position: 'absolute', left: 465, top: 1500, zIndex: 3, animation: 't3-kick 1.4s cubic-bezier(.2,.7,.4,1) both' }}><Football /></div>
      <div style={{ ...COLUMN, gap: 16, paddingTop: 520 }}>
        <div style={{ ...font, fontSize: 130, lineHeight: 1, maxWidth: 1000, color: '#FFFFFF', ...outlined('#0b3d14', 10), textShadow: '8px 8px 0 #0b3d14', animation: 'hp-slam 600ms 900ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ animation: 'hp-pop 700ms 1100ms both' }}>{circleCrest(crest, t, 380, '14px solid #8b4513')}</div>
        <div style={{ ...font, fontSize: 190, lineHeight: 1, color: '#ffd400', ...outlined('#0b3d14', 10) }}>{big}</div>
        <div style={{ ...font, fontSize: 56, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #0b3d14', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 2px 0 #0b3d14')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- hockey ----------
export function Hockey({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Graduate', 'Anton', serif" }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 960, height: 22, background: '#d32f2f' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, height: 18, background: '#1565c0' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1300, height: 18, background: '#1565c0' }} />
      <div style={{ position: 'absolute', left: '50%', top: 790, width: 360, height: 360, marginLeft: -180, borderRadius: '50%', border: '10px solid #1565c0', boxSizing: 'border-box' }} />
      {/* goal light */}
      <div style={{ position: 'absolute', left: '50%', top: 40, width: 120, height: 120, marginLeft: -60, borderRadius: '50%', zIndex: 3, animation: 't2-red 0.5s linear infinite' }} />
      {/* the net and a puck sliding in */}
      <div style={{ position: 'absolute', left: 330, bottom: 60, width: 420, height: 250, border: '18px solid #d32f2f', borderBottom: 'none', borderRadius: '40px 40px 0 0', boxSizing: 'border-box', backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.18) 0 3px, transparent 3px 26px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.18) 0 3px, transparent 3px 26px)', animation: 'th-net 500ms 900ms ease-out both' }} />
      <div style={{ position: 'absolute', left: 480, bottom: 90, width: 120, height: 44, borderRadius: '50%', background: '#111', zIndex: 3, animation: 't3-slide 900ms cubic-bezier(.3,.8,.4,1) both' }} />
      <div style={{ ...COLUMN, gap: 16, paddingTop: 190 }}>
        <div style={{ ...font, fontSize: 140, lineHeight: 1, maxWidth: 1000, color: '#d32f2f', ...outlined('#FFFFFF', 10), textShadow: '7px 7px 0 #0d2b5a', animation: 'hp-slam 600ms 800ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ animation: 'hp-pop 700ms 900ms both' }}>{circleCrest(crest, t, 380, '14px solid #0d2b5a')}</div>
        <div style={{ ...font, fontSize: 190, lineHeight: 1, color: '#0d2b5a', ...outlined('#FFFFFF', 10) }}>{big}</div>
        <div style={{ ...font, fontSize: 56, lineHeight: 1.1, color: '#0d2b5a', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#0d2b5a', 'none')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- monster movie (old black-and-white creature feature) ----------
function Creature() {
  return (
    <svg viewBox="0 0 600 520" width="900" height="780" aria-hidden="true" style={{ position: 'absolute', left: 90, bottom: -80, zIndex: 1, animation: 't3-rise 1.6s 300ms cubic-bezier(.3,.8,.4,1) both' }}>
      <path d="M40 220 L0 140 L90 190 Z M560 220 L600 140 L510 190 Z" fill="#5d6b5a" />
      <path d="M90 520 L90 240 Q90 60 300 60 Q510 60 510 240 L510 520 Z" fill="#7d8c78" stroke="#2c332b" strokeWidth="10" />
      {[150, 220, 300, 380, 450].map((x, i) => <path key={x} d={`M${x} ${70 - (i === 2 ? 30 : 10)} L${x + 20} ${i === 2 ? 0 : 30} L${x + 40} ${70 - (i === 2 ? 30 : 10)} Z`} fill="#5d6b5a" />)}
      <ellipse cx="215" cy="230" rx="62" ry="70" fill="#f4f4e0" stroke="#2c332b" strokeWidth="8" />
      <ellipse cx="385" cy="230" rx="62" ry="70" fill="#f4f4e0" stroke="#2c332b" strokeWidth="8" />
      <circle cx="225" cy="245" r="26" fill="#111" />
      <circle cx="375" cy="245" r="26" fill="#111" />
      <path d="M190 380 Q300 450 410 380" stroke="#2c332b" strokeWidth="14" fill="none" strokeLinecap="round" />
      {[225, 265, 335, 375].map((x) => <path key={x} d={`M${x} ${x < 300 ? 396 : 396} l12 26 l12 -24`} fill="#f4f4e0" />)}
    </svg>
  )
}

export function MonsterMovie({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Limelight', 'Playfair Display', serif" }
  const sprockets = (side) => (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 70, background: '#000', zIndex: 4, backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 30px, #d9d9d9 30px 70px, transparent 70px 100px)', backgroundSize: '34px 100px', backgroundRepeat: 'repeat-y', backgroundPosition: 'center 0', animation: 't3-roll 0.4s linear infinite' }} />
  )
  return (
    <div style={{ ...FULL, filter: 'grayscale(1) contrast(1.15)' }}>
      <Creature />
      {sprockets('left')}
      {sprockets('right')}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.5px)', backgroundSize: '7px 9px', animation: 't3-grain 0.15s steps(2) infinite' }} />
      <div style={{ ...COLUMN, gap: 16, paddingTop: 120, animation: 'hp-flicker 0.3s linear infinite' }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 10, color: '#e8e8e8' }}>NOW SHOWING</div>
        <div style={{ ...font, fontSize: 110, lineHeight: 1.05, maxWidth: 900, color: '#FFFFFF', textShadow: '6px 6px 0 #000, 0 0 30px #FFFFFF', animation: 'hp-zoom-in 700ms cubic-bezier(.2,1.2,.4,1) both' }}>{word}</div>
        <div style={{ background: '#FFFFFF', padding: 12, border: '10px double #000', animation: 'hp-pop 700ms 300ms both' }}>
          <Crest src={crest} house={t} size={260} />
        </div>
        <div style={{ ...font, fontSize: 190, lineHeight: 1, color: '#FFFFFF', textShadow: '8px 8px 0 #000' }}>{big}</div>
        <div style={{ ...font, fontSize: 56, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #000', maxWidth: 900 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 3px 0 #000')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- kaiju (an original cartoon giant lizard) ----------
function Lizard() {
  return (
    <svg viewBox="0 0 700 900" width="840" height="1080" aria-hidden="true" style={{ position: 'absolute', left: 120, bottom: 120, zIndex: 1, animation: 't3-rise 1.4s cubic-bezier(.3,.8,.4,1) both' }}>
      {[[300, 260], [340, 340], [370, 430], [390, 520]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l70 -70 l10 100 Z`} fill="#7fd3ff" stroke="#0c3d27" strokeWidth="8" />)}
      <path d="M180 900 L190 560 Q170 420 230 330 L260 250 Q240 150 320 110 Q420 70 470 150 Q520 230 450 290 L380 300 Q420 420 420 560 L430 900 Z" fill="#3fa66b" stroke="#0c3d27" strokeWidth="10" />
      <path d="M380 210 Q440 250 470 230 L470 260 Q420 280 380 250 Z" fill="#0c3d27" />
      <circle cx="395" cy="160" r="22" fill="#fff3b0" stroke="#0c3d27" strokeWidth="6" />
      <circle cx="400" cy="162" r="9" fill="#0c3d27" />
      <path d="M210 540 Q120 560 110 470 L150 470 Q160 510 210 500 Z" fill="#3fa66b" stroke="#0c3d27" strokeWidth="8" />
      <path d="M230 600 Q300 640 360 600 L360 860 Q300 880 230 860 Z" fill="#a8e6b8" opacity="0.7" />
    </svg>
  )
}

export function Kaiju({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  const city = 'polygon(0 100%, 0 40%, 6% 40%, 6% 20%, 14% 20%, 14% 50%, 22% 50%, 22% 10%, 30% 10%, 30% 45%, 38% 45%, 38% 25%, 48% 25%, 48% 55%, 58% 55%, 58% 15%, 66% 15%, 66% 40%, 76% 40%, 76% 5%, 84% 5%, 84% 35%, 92% 35%, 92% 20%, 100% 20%, 100% 100%)'
  return (
    <div style={{ ...FULL, animation: 'th-quake 0.3s linear 1s 5' }}>
      <div style={{ position: 'absolute', right: 100, top: 160, width: 160, height: 160, borderRadius: '50%', background: '#fff8d6', boxShadow: '0 0 60px #fff8d6' }} />
      <Lizard />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 420, background: '#0b0f22', clipPath: city, zIndex: 2, backgroundImage: 'radial-gradient(#ffd54f 3px, transparent 4px)', backgroundSize: '44px 56px' }} />
      <div style={{ ...COLUMN, gap: 14, paddingTop: 110, zIndex: 3 }}>
        <div style={{ ...font, fontSize: 140, lineHeight: 1, maxWidth: 1000, color: '#7fd3ff', textShadow: '0 0 30px #7fd3ff, 6px 6px 0 #000', animation: 'hp-slam 600ms 900ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ animation: 'hp-pop 700ms 1000ms both' }}>{circleCrest(crest, t, 340, '12px solid #3fa66b')}</div>
      </div>
      <div style={{ ...COLUMN, position: 'absolute', left: 0, right: 0, bottom: 80, gap: 10, zIndex: 3 }}>
        <div style={{ ...font, fontSize: 180, lineHeight: 1, color: '#FFFFFF', textShadow: '0 0 30px #7fd3ff, 8px 8px 0 #000' }}>{big}</div>
        <div style={{ ...font, fontSize: 52, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #000', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#cfeaff', '0 2px 0 #000')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- sheep ----------
function Sheep() {
  return (
    <svg viewBox="0 0 320 240" width="360" height="270" aria-hidden="true">
      {[[90, 110], [140, 85], [195, 90], [235, 120], [200, 150], [130, 155], [80, 140]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="48" fill="#FFFFFF" stroke="#d8d8d8" strokeWidth="4" />)}
      <ellipse cx="270" cy="95" rx="36" ry="44" fill="#2b2b2b" />
      <ellipse cx="240" cy="70" rx="20" ry="10" fill="#2b2b2b" transform="rotate(-30 240 70)" />
      <circle cx="282" cy="86" r="8" fill="#FFFFFF" />
      <circle cx="284" cy="87" r="4" fill="#111" />
      {[100, 140, 180, 220].map((x) => <rect key={x} x={x} y="185" width="16" height="50" rx="6" fill="#2b2b2b" />)}
    </svg>
  )
}

export function SheepView({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: -200, right: -200, top: 980, height: 600, borderRadius: '50%', background: '#7cc95a' }} />
      {/* the fence and a sheep hopping over it, again and again */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 260, height: 170, zIndex: 1, backgroundImage: 'repeating-linear-gradient(90deg, #8b5a2b 0 22px, transparent 22px 150px)' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 30, height: 20, background: '#8b5a2b' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 100, height: 20, background: '#8b5a2b' }} />
      </div>
      <div style={{ position: 'absolute', left: 360, bottom: 280, zIndex: 2, animation: 't3-hop 1.6s ease-in-out infinite' }}><Sheep /></div>
      <div style={{ ...COLUMN, gap: 16, paddingTop: 130 }}>
        <div style={{ ...font, fontSize: 130, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', ...outlined('#2b5a1f', 9), textShadow: '6px 6px 0 #2b5a1f', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ animation: 'hp-pop 700ms 150ms both, hp-wobble 1.6s ease-in-out 900ms infinite' }}>
          {circleCrest(crest, t, 360, '16px dotted #FFFFFF', { boxShadow: '0 0 0 10px #e9e9e9' })}
        </div>
        <div style={{ ...font, fontSize: 180, lineHeight: 1, color: '#FFFFFF', ...outlined('#2b5a1f', 9) }}>{big}</div>
        <div style={{ ...font, fontSize: 52, lineHeight: 1.1, color: '#2b5a1f', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#2b5a1f', 'none')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- snow ----------
export function Snow({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  const ball = (size, top, extra = {}) => <div style={{ position: 'absolute', left: '50%', top, width: size, height: size, marginLeft: -size / 2, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #e6f0fb 70%, #c5d8ee 100%)', boxShadow: '0 10px 30px rgba(0,40,90,0.25)', ...extra }} />
  return (
    <div style={FULL}>
      <div style={{ ...COLUMN, gap: 10, paddingTop: 110 }}>
        <div style={{ ...font, fontSize: 130, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', textShadow: '0 0 30px #bfe3ff, 6px 6px 0 #1d3f73', animation: 'hp-fade-up 700ms ease-out both' }}>{word}</div>
      </div>
      {/* a snowman, the crest on its middle */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, height: 900, animation: 't3-drop 1s 200ms cubic-bezier(.3,.9,.4,1) both' }}>
        {ball(500, 400)}
        {ball(380, 150)}
        {ball(260, 0)}
        <div style={{ position: 'absolute', left: '50%', top: 90, marginLeft: -60, display: 'flex', gap: 70 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#222' }} /><div style={{ width: 26, height: 26, borderRadius: '50%', background: '#222' }} />
        </div>
        <div style={{ position: 'absolute', left: '50%', top: 130, width: 0, height: 0, borderTop: '18px solid transparent', borderBottom: '18px solid transparent', borderLeft: '90px solid #ff7a1a' }} />
        <div style={{ position: 'absolute', left: '50%', top: 225, width: 300, height: 50, marginLeft: -150, background: t.bg, borderRadius: 20, border: `4px solid ${t.edge}`, boxSizing: 'border-box' }} />
        <div style={{ position: 'absolute', left: '50%', top: 210, marginLeft: -150 + 40, marginTop: 0, width: 50, height: 160, background: t.bg, borderRadius: 12, transform: 'rotate(8deg)', transformOrigin: 'top', border: `4px solid ${t.edge}`, boxSizing: 'border-box' }} />
        <div style={{ position: 'absolute', left: '50%', top: 220, marginLeft: -110 }}>{circleCrest(crest, t, 220, '8px solid #c5d8ee')}</div>
      </div>
      <div style={{ ...COLUMN, position: 'absolute', left: 0, right: 0, bottom: 90, gap: 10 }}>
        <div style={{ ...font, fontSize: 180, lineHeight: 1, color: '#2f5fa7', textShadow: '6px 6px 0 #bcd6f2' }}>{big}</div>
        <div style={{ ...font, fontSize: 52, lineHeight: 1.1, color: '#1d3f73', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#1d3f73', 'none')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- sun ----------
export function Sun({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: '50%', top: 760, width: 2600, height: 2600, margin: '-1300px 0 0 -1300px', background: 'repeating-conic-gradient(rgba(255,255,255,0.35) 0 7deg, transparent 7deg 18deg)', animation: 't2-spin 30s linear infinite' }} />
      <div style={{ ...COLUMN, gap: 18, paddingTop: 150 }}>
        <div style={{ ...font, fontSize: 108, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', textShadow: '6px 6px 0 #c2410c', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        <div style={{ position: 'relative', animation: 'hp-pop 800ms 150ms both' }}>
          <div style={{ width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, #fff7c2 0%, #ffd23f 70%, #ffb300 100%)', boxShadow: '0 0 120px #fff3b0, 0 0 0 24px rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {circleCrest(crest, t, 380, '10px solid #ff9f1c')}
          </div>
          {/* sunglasses drop onto the crest */}
          <svg viewBox="0 0 400 120" width="420" height="126" aria-hidden="true" style={{ position: 'absolute', left: 70, top: 150, animation: 't3-drop 700ms 1000ms cubic-bezier(.3,.9,.4,1) both' }}>
            <path d="M10 30 L390 30" stroke="#111" strokeWidth="14" />
            <path d="M20 30 L180 30 L170 90 Q100 120 40 90 Z M220 30 L380 30 L360 90 Q300 120 230 90 Z" fill="#111" />
            <path d="M50 45 L110 45" stroke="#555" strokeWidth="10" strokeLinecap="round" />
            <path d="M250 45 L310 45" stroke="#555" strokeWidth="10" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ ...font, fontSize: 190, lineHeight: 1, color: '#FFFFFF', textShadow: '8px 8px 0 #c2410c' }}>{big}</div>
        <div style={{ ...font, fontSize: 54, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #c2410c', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 2px 0 #c2410c')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- waves ----------
const wavePath = (y, amp) => `M0 ${y} ${Array.from({ length: 8 }, (_, i) => `Q${i * 270 + 67} ${y - amp} ${i * 270 + 135} ${y} T${i * 270 + 270} ${y}`).join(' ')} L2160 600 L0 600 Z`

export function Waves({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  const band = (top, color, amp, dur, z) => (
    <svg viewBox="0 0 2160 600" width="2160" height="600" aria-hidden="true" style={{ position: 'absolute', left: 0, top, zIndex: z, animation: `t3-swell ${dur}s linear infinite` }}>
      <path d={wavePath(60, amp)} fill={color} />
    </svg>
  )
  return (
    <div style={FULL}>
      {band(820, '#4fb3e8', 50, 6, 1)}
      {band(1080, '#2a8fd0', 60, 4.5, 3)}
      {band(1360, '#13649e', 70, 3.5, 4)}
      {/* the crest on a bobbing life ring */}
      <div style={{ position: 'absolute', left: 270, top: 640, zIndex: 2, animation: 't3-bob 1.3s ease-in-out infinite alternate' }}>
        <div style={{ width: 540, height: 540, borderRadius: '50%', background: 'repeating-conic-gradient(#ff3b30 0 45deg, #FFFFFF 45deg 90deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 0 rgba(0,0,0,0.2)', animation: 'hp-pop 700ms 150ms both' }}>
          {circleCrest(crest, t, 330, '8px solid #b71c1c')}
        </div>
      </div>
      <div style={{ ...COLUMN, gap: 10, paddingTop: 120 }}>
        <div style={{ ...font, fontSize: 130, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', textShadow: '6px 6px 0 #0b4f8a', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
      </div>
      <div style={{ ...COLUMN, position: 'absolute', left: 0, right: 0, bottom: 110, gap: 10, zIndex: 5 }}>
        <div style={{ ...font, fontSize: 190, lineHeight: 1, color: '#FFFFFF', textShadow: '8px 8px 0 #06345c' }}>{big}</div>
        <div style={{ ...font, fontSize: 54, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #06345c', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#e3f4ff', '0 2px 0 #06345c')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- surfing ----------
export function Surfing({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bangers', 'Anton', sans-serif", letterSpacing: 3 }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: 120, top: 120, width: 220, height: 220, borderRadius: '50%', background: '#fff3b0', boxShadow: '0 0 80px #ffd23f' }} />
      {/* the curling wave */}
      <svg viewBox="0 0 1080 1300" width="1080" height="1300" aria-hidden="true" style={{ position: 'absolute', left: 0, bottom: 0 }}>
        <path d="M0 1300 L0 700 Q300 640 560 560 Q860 460 980 260 Q1040 160 940 140 Q840 130 860 230 Q880 300 960 300 L1080 300 L1080 1300 Z" fill="#1a7fb5" />
        <path d="M560 560 Q860 460 980 260 Q1040 160 940 140 Q860 140 870 220" fill="none" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
        <path d="M0 760 Q300 700 560 620" fill="none" stroke="#8fd8ff" strokeWidth="14" />
        <path d="M0 1300 L0 1000 Q540 920 1080 1000 L1080 1300 Z" fill="#0d5c8a" />
      </svg>
      {/* the board carrying the crest */}
      <div style={{ position: 'absolute', left: 160, top: 880, zIndex: 2, animation: 't3-surf 1.2s cubic-bezier(.2,.8,.3,1) both' }}>
        <div style={{ position: 'relative', width: 760, height: 200, borderRadius: '50%', background: `linear-gradient(90deg, ${t.bg}, ${t.fx[0]})`, border: '10px solid #FFFFFF', boxSizing: 'border-box', animation: 't3-bob 0.9s ease-in-out infinite alternate' }}>
          <div style={{ position: 'absolute', left: 270, top: -130 }}>{circleCrest(crest, t, 230, '8px solid #FFFFFF')}</div>
        </div>
      </div>
      <div style={{ ...COLUMN, gap: 14, paddingTop: 380 }}>
        <div style={{ ...font, fontSize: 150, lineHeight: 1, maxWidth: 1000, color: '#FFFFFF', ...outlined('#0d5c8a', 9), textShadow: '7px 7px 0 #0d5c8a', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
      </div>
      <div style={{ ...COLUMN, position: 'absolute', left: 0, right: 0, bottom: 100, gap: 10, zIndex: 3 }}>
        <div style={{ ...font, fontSize: 200, lineHeight: 1, color: '#ffd23f', ...outlined('#06345c', 10) }}>{big}</div>
        <div style={{ ...font, fontSize: 62, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #06345c', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 2px 0 #06345c')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- waking up ----------
export function WakeUp({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  return (
    <div style={FULL}>
      {/* the window with the sun coming up */}
      <div style={{ position: 'absolute', left: 190, top: 70, width: 700, height: 520, borderRadius: 20, overflow: 'hidden', border: '22px solid #FFFFFF', boxSizing: 'border-box', background: 'linear-gradient(180deg, #7fc4ff 0%, #ffd6a0 70%, #ffb07a 100%)' }}>
        <div style={{ position: 'absolute', left: '50%', bottom: -120, width: 260, height: 260, marginLeft: -130, borderRadius: '50%', background: '#ffd23f', boxShadow: '0 0 80px #ffe680', animation: 't3-sunup 1.6s ease-out both' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, background: '#7cc95a' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 18, marginLeft: -9, background: '#FFFFFF' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 18, marginTop: -9, background: '#FFFFFF' }} />
      </div>
      {/* curtains */}
      <div style={{ position: 'absolute', left: 120, top: 40, width: 170, height: 640, background: 'repeating-linear-gradient(90deg, #e86a6a 0 30px, #d95656 30px 60px)', borderRadius: '0 0 60px 0' }} />
      <div style={{ position: 'absolute', right: 120, top: 40, width: 170, height: 640, background: 'repeating-linear-gradient(90deg, #e86a6a 0 30px, #d95656 30px 60px)', borderRadius: '0 0 0 60px' }} />
      <div style={{ ...COLUMN, gap: 10, paddingTop: 640 }}>
        <div style={{ ...font, fontSize: 120, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', ...outlined('#7a3b1d', 9), textShadow: '6px 6px 0 #7a3b1d', animation: 'hp-slam 600ms 300ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        {/* the alarm clock (the crest is its face), ringing */}
        <div style={{ position: 'relative', marginTop: 50, animation: 'hp-pop 600ms both, t3-ring 0.12s linear 700ms 14' }}>
          {[-1, 1].map((s) => <div key={s} style={{ position: 'absolute', top: -50, left: s < 0 ? 20 : 260, width: 120, height: 80, borderRadius: '60px 60px 10px 10px', background: '#d7263d', border: '8px solid #7a1020', boxSizing: 'border-box' }} />)}
          {circleCrest(crest, t, 400, '26px solid #d7263d', { boxShadow: '0 0 0 8px #7a1020' })}
          {[-1, 1].map((s) => <div key={`l${s}`} style={{ position: 'absolute', bottom: -40, left: s < 0 ? 70 : 290, width: 40, height: 70, background: '#7a1020', borderRadius: 10, transform: `rotate(${s * 25}deg)` }} />)}
        </div>
        <div style={{ ...font, fontSize: 170, lineHeight: 1, marginTop: 40, color: '#d7263d', ...outlined('#FFFFFF', 9) }}>{big}</div>
        <div style={{ ...font, fontSize: 50, lineHeight: 1.1, color: '#7a3b1d', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#7a3b1d', 'none')}>{who}</div>
      </div>
    </div>
  )
}

export const THEME3_VIEWS = { football: FootballView, hockey: Hockey, monster: MonsterMovie, kaiju: Kaiju, sheep: SheepView, snow: Snow, sun: Sun, waves: Waves, surfing: Surfing, wakeup: WakeUp }

// ---------- canvas shapes (drawn around 0,0 at size p.r) ----------
export const THEME3_SHAPES = {
  football(ctx, p) {
    const r = p.r
    ctx.beginPath()
    ctx.ellipse(0, 0, r, r * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = r * 0.12
    ctx.beginPath()
    ctx.moveTo(-r * 0.4, 0)
    ctx.lineTo(r * 0.4, 0)
    for (let i = -2; i <= 2; i++) {
      ctx.moveTo(i * r * 0.15, -r * 0.15)
      ctx.lineTo(i * r * 0.15, r * 0.15)
    }
    ctx.stroke()
  },
  puck(ctx, p) {
    ctx.beginPath()
    ctx.ellipse(0, 0, p.r, p.r * 0.45, 0, 0, Math.PI * 2)
    ctx.fill()
  },
  flake(ctx, p) {
    ctx.strokeStyle = p.c
    ctx.lineWidth = Math.max(2, p.r * 0.14)
    ctx.lineCap = 'round'
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3
      const x = Math.cos(a) * p.r
      const y = Math.sin(a) * p.r
      ctx.moveTo(0, 0)
      ctx.lineTo(x, y)
      ctx.moveTo(x * 0.6 + Math.cos(a + 0.6) * p.r * 0.3, y * 0.6 + Math.sin(a + 0.6) * p.r * 0.3)
      ctx.lineTo(x * 0.6, y * 0.6)
      ctx.lineTo(x * 0.6 + Math.cos(a - 0.6) * p.r * 0.3, y * 0.6 + Math.sin(a - 0.6) * p.r * 0.3)
    }
    ctx.stroke()
  },
  bubble(ctx, p) {
    ctx.strokeStyle = p.c
    ctx.lineWidth = Math.max(2, p.r * 0.12)
    ctx.beginPath()
    ctx.arc(0, 0, p.r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.beginPath()
    ctx.arc(-p.r * 0.35, -p.r * 0.35, p.r * 0.2, 0, Math.PI * 2)
    ctx.fill()
  },
  fish(ctx, p) {
    const r = p.r
    ctx.beginPath()
    ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(-r * 0.8, 0)
    ctx.lineTo(-r * 1.5, -r * 0.55)
    ctx.lineTo(-r * 1.5, r * 0.55)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(r * 0.5, -r * 0.12, r * 0.12, 0, Math.PI * 2)
    ctx.fill()
  },
  duck(ctx, p) {
    const r = p.r
    ctx.beginPath()
    ctx.ellipse(0, r * 0.25, r, r * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(r * 0.45, -r * 0.45, r * 0.45, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ff7a1a'
    ctx.beginPath()
    ctx.moveTo(r * 0.85, -r * 0.5)
    ctx.lineTo(r * 1.3, -r * 0.35)
    ctx.lineTo(r * 0.85, -r * 0.25)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(r * 0.55, -r * 0.55, r * 0.09, 0, Math.PI * 2)
    ctx.fill()
  },
  plus(ctx, p) {
    const r = p.r
    ctx.fillRect(-r, -r * 0.33, r * 2, r * 0.66)
    ctx.fillRect(-r * 0.33, -r, r * 0.66, r * 2)
  },
  leaf(ctx, p) {
    const r = p.r
    ctx.beginPath()
    ctx.moveTo(0, -r)
    ctx.quadraticCurveTo(r * 0.8, 0, 0, r)
    ctx.quadraticCurveTo(-r * 0.8, 0, 0, -r)
    ctx.fill()
  },
  rocket(ctx, p) {
    const r = p.r
    ctx.beginPath()
    ctx.moveTo(0, -r)
    ctx.quadraticCurveTo(r * 0.5, -r * 0.3, r * 0.35, r * 0.6)
    ctx.lineTo(-r * 0.35, r * 0.6)
    ctx.quadraticCurveTo(-r * 0.5, -r * 0.3, 0, -r)
    ctx.fill()
    ctx.fillStyle = '#ff9f1c'
    ctx.beginPath()
    ctx.moveTo(-r * 0.25, r * 0.6)
    ctx.lineTo(0, r * 1.2)
    ctx.lineTo(r * 0.25, r * 0.6)
    ctx.fill()
  },
}

// ---------- effect setups ----------
export const THEME3_FX = {
  football({ w, h, parts, R, rain, colors }) {
    for (let i = 0; i < 180; i++) {
      const a = R(Math.PI * 1.15, Math.PI * 1.85)
      const sp = R(8, 22)
      parts.push({ kind: 'c', x: w / 2, y: h * 0.18, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: R(6, 12), c: colors[i % colors.length], rot: R(0, 6), g: 0.4, life: 300, delay: 80 })
    }
    rain(16, 'football', ['#8b4513', '#a0522d'], { vy: 3, vyr: 3, r: 22, rr: 10, spread: 1.6, spin: 0.1, delay: 200 })
  },
  hockey({ w, h, parts, R, rain, colors }) {
    for (let i = 0; i < 120; i++) parts.push({ kind: 'spark', x: w / 2 + R(-120, 120), y: h - 140, vx: R(-9, 9), vy: R(-14, -4), r: R(3, 6), c: '#FFFFFF', g: 0.35, life: 60, max: 60, delay: 50 + Math.floor(R(0, 20)) })
    rain(120, 'c', colors, { vy: 2, vyr: 3, r: 6, rr: 6, spread: 1.4, delay: 120 })
  },
  monster({ w, h, parts, R }) {
    for (let i = 0; i < 40; i++) parts.push({ kind: 'puff', x: R(0, w), y: h - R(40, 220), vx: R(-0.8, 0.8), vy: R(-1, -0.2), r: R(50, 90), c: '#bdbdbd', life: 150, max: 300, delay: Math.floor(R(0, 300)) })
    for (let i = 0; i < 4; i++) parts.push({ kind: 'flash', x: R(w * 0.2, w * 0.8), y: R(h * 0.1, h * 0.4), r: 300, c: '#FFFFFF', life: 12, max: 12, delay: 60 + i * 90 })
  },
  kaiju({ w, h, parts, R }) {
    for (let i = 0; i < 140; i++) parts.push({ kind: 'c', x: R(0, w), y: h - R(100, 380), vx: R(-6, 6), vy: R(-16, -5), r: R(6, 14), c: ['#3a3f5c', '#5a6080', '#2a2d40', '#ffd54f'][i % 4], rot: R(0, 6), g: 0.45, life: 200, delay: 60 + Math.floor(R(0, 120)) })
    for (let i = 0; i < 60; i++) parts.push({ kind: 'spark', x: w * 0.62, y: h * 0.3, vx: R(4, 16), vy: R(-4, 4), r: R(4, 9), c: i % 2 ? '#7fd3ff' : '#FFFFFF', life: 60, max: 60, delay: 90 + Math.floor(R(0, 100)) })
  },
  sheep({ rain, rise }) {
    rain(30, 'puff', ['#FFFFFF', '#f2f2f2'], { vy: 1, vyr: 1.5, r: 18, rr: 18, sw: 1.2, spread: 1.4, life: 600 })
    rise(40, 'flower', ['#FFFFFF', '#ffe066', '#ffb3d1'], { vy: 1.5, vyr: 2, r: 12, rr: 8, sw: 1, delay: 200 })
  },
  snow({ rain }) {
    rain(120, 'flake', ['#FFFFFF', '#e6f3ff', '#cfe8ff'], { vy: 1, vyr: 2, r: 10, rr: 16, sw: 1.2, spread: 1.5, spin: 0.02 })
    rain(160, 'snow', ['#FFFFFF'], { vy: 1.5, vyr: 2, r: 3, rr: 4, sw: 1, spread: 1.5 })
  },
  sun({ w, h, parts, R, rise }) {
    for (let i = 0; i < 40; i++) parts.push({ kind: 'flash', x: R(0, w), y: R(0, h), r: R(20, 50), c: '#FFFFFF', life: 20, max: 20, delay: Math.floor(R(0, 360)) })
    rise(70, 'spark', ['#FFFFFF', '#fff3b0', '#ffd23f'], { vy: 2, vyr: 3, r: 5, rr: 6, sw: 1 })
  },
  waves({ rise, rain }) {
    rise(70, 'bubble', ['#FFFFFF', '#bfe9ff'], { vy: 1.5, vyr: 2.5, r: 8, rr: 18, sw: 1.2 })
    rain(40, 'c', ['#FFFFFF', '#ff3b30'], { vy: 2, vyr: 2, r: 6, rr: 6, spread: 1.4, delay: 150 })
  },
  surfing({ w, h, parts, R }) {
    for (let i = 0; i < 220; i++) parts.push({ kind: 'spark', x: R(w * 0.1, w * 0.85), y: h * 0.55, vx: R(-6, 4), vy: R(-15, -4), r: R(3, 7), c: i % 3 ? '#FFFFFF' : '#bfe9ff', g: 0.35, life: 70, max: 70, delay: Math.floor(R(30, 300)) })
  },
  wakeup({ rise, rain }) {
    rise(30, 'note', ['#7a3b1d', '#d7263d', '#3a6ea5'], { vy: 1.5, vyr: 2, r: 18, rr: 10, sw: 1.4, delay: 200 })
    rain(80, 'star5', ['#FFFFFF', '#ffd23f'], { vy: 1.5, vyr: 2, r: 8, rr: 10, sw: 1, spread: 1.5, spin: 0.08, delay: 100 })
  },
}
