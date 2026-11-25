import { Crest } from './CelebrationThemes.jsx'
import { whoStyle, circleCrest, outlined } from './CelebrationThemes3.jsx'

// Ten more looks for the points celebration (see Celebration.jsx). Canvas
// effects are set up in THEME4_FX (shapes come from THEME3_SHAPES and the
// built-in ones).
//   astronaut - stars, a ringed planet, the crest in a helmet visor, a rocket
//   aquanaut  - the deep sea, light rays, the crest in a brass diving helmet
//   lumberjack- plaid, a log slice with the crest in its rings, a chopping axe
//   ballroom  - spotlights, a chandelier, judges' "10" cards
//   cowboys   - a desert sunset, cacti, a WANTED poster
//   nurses    - a heart monitor line, a beating heart, a stethoscope
//   lawyers   - a courtroom, a gavel banging, "EXHIBIT A"
//   toilet    - bathroom tiles, a flushing swirl, rubber ducks, loo-roll streamers
//   babies    - pastel dots, stacking ABC blocks, a shaking rattle
//   barbers   - spinning barber poles, a mirror, snipping scissors

export const THEME4_STYLES = ['astronaut', 'aquanaut', 'lumberjack', 'ballroom', 'cowboys', 'nurses', 'lawyers', 'toilet', 'babies', 'barbers']

export const THEME4_WORDS = {
  astronaut: ['LIFTOFF!', 'ONE GIANT LEAP!', 'OUT OF THIS WORLD!', 'MISSION COMPLETE!', 'TO THE MOON!', 'ALL SYSTEMS GO!', 'BLAST OFF!', 'ZERO GRAVITY!', 'STELLAR!', 'ORBIT ACHIEVED!', 'COSMIC!'],
  aquanaut: ['DEEP DIVE!', 'FIN-TASTIC!', 'TREASURE FOUND!', 'OFF THE DEEP END!', 'SEA-RIOUSLY GOOD!', 'O-FISH-ALLY AWESOME!', 'WHALE DONE!', 'CLAM-TASTIC!', 'BUBBLE TROUBLE!', 'DEEP SEA HERO!', 'JAWSOME!'],
  lumberjack: ['TIMBER!', 'CHOP CHOP!', 'AXE-CELLENT!', 'SPLIT DECISION!', 'WOOD YOU LOOK AT THAT!', 'TREE-MENDOUS!', 'LOG JAM!', 'BRANCHING OUT!', 'SAWSOME!', 'BARK OF APPROVAL!', 'OAK-AY!'],
  ballroom: ['Perfect Ten!', 'Bravo!', 'Dazzling!', 'What Footwork!', 'Encore!', 'Magnificent!', 'Elegant!', 'Showstopper!', 'Shall We Dance?', 'Graceful!', 'Standing Ovation!'],
  cowboys: ['YEE-HAW!', 'GIDDY UP!', 'ROOTIN’ TOOTIN’!', 'BEST IN THE WEST!', 'HOWDY, PARTNER!', 'SHERIFF APPROVED!', 'LASSOED IT!', 'HIGH NOON!', 'RIDE ’EM!', 'TOP HAND!', 'WANTED: MORE OF THIS!'],
  nurses: ['VITALS: AWESOME!', 'TOP-NOTCH CARE!', 'STAT!', 'NURSE APPROVED!', 'HEALTHY HUSTLE!', 'HEART OF GOLD!', 'PULSE: POUNDING!', 'CODE AWESOME!', 'ALL BETTER!', 'GOOD AS NEW!', 'PRESCRIPTION: PRAISE!'],
  lawyers: ['CASE CLOSED!', 'OBJECTION OVERRULED!', 'VERDICT: AWESOME!', 'MOTION GRANTED!', 'ORDER IN THE COURT!', 'SUSTAINED!', 'ALL RISE!', 'NO FURTHER QUESTIONS!', 'JUDGMENT FOR YOU!', 'RULED IN YOUR FAVOUR!', 'COSTS AWARDED!', 'AFFIDAVIT OF AWESOME!'],
  toilet: ['FLUSHED WITH SUCCESS!', 'ROYAL FLUSH!', 'NUMBER ONE!', 'POTTY PARTY!', 'SQUEAKY CLEAN!', 'BOWL-D MOVE!', 'GO WITH THE FLOW!', 'THRONE ROOM!', 'WIPE OUT!', 'PLUNGER POWER!', 'LOO-TASTIC!'],
  babies: ['GOO GOO GA GA!', 'BIG KID MOVE!', 'BABY STEPS!', 'WAH-HOO!', 'NAP TIME EARNED!', 'BOTTLE’S UP!', 'PEEKABOO!', 'DIAPER DANDY!', 'BABY GENIUS!', 'TINY BUT MIGHTY!', 'CUTIE PATOOTIE!'],
  barbers: ['FRESH CUT!', 'LOOKING SHARP!', 'CLEAN FADE!', 'SNIP SNIP!', 'TOP OF THE CHOPS!', 'SHEAR GENIUS!', 'HAIR-RAISING!', 'CUT ABOVE!', 'LINED UP!', 'NEXT, PLEASE!', 'TRIMMED TO PERFECTION!'],
}

export const THEME4_BACKDROP = {
  astronaut: 'radial-gradient(ellipse at 30% 30%, #1b1f4a 0%, #0a0c24 55%, #03040d 100%)',
  aquanaut: 'linear-gradient(180deg, #1b8fb0 0%, #0d5470 40%, #062a40 75%, #021320 100%)',
  lumberjack: '#b71c1c',
  ballroom: 'radial-gradient(ellipse at 50% 20%, #6d1b3a 0%, #3a0b20 55%, #1a040e 100%)',
  cowboys: 'linear-gradient(180deg, #ff8a3d 0%, #ffb35c 40%, #f6d38a 62%, #d9a05b 62%, #b97a3a 100%)',
  nurses: 'linear-gradient(180deg, #d9f5f1 0%, #a6e3da 100%)',
  lawyers: 'linear-gradient(180deg, #5a3a22 0%, #3d2615 100%)',
  toilet: '#d8f0fa',
  babies: '#fde7f0',
  barbers: 'linear-gradient(180deg, #f4efe6 0%, #e2d9c8 100%)',
}

export const THEME4_KEYFRAMES = `
@keyframes t4-launch{0%{transform:translateY(0)}100%{transform:translateY(-2400px)}}
@keyframes t4-float{from{transform:translateY(-16px) rotate(-3deg)}to{transform:translateY(16px) rotate(3deg)}}
@keyframes t4-chop{0%,100%{transform:rotate(-55deg)}45%{transform:rotate(12deg)}55%{transform:rotate(10deg)}}
@keyframes t4-card{0%{transform:translateY(600px) rotate(-10deg)}100%{transform:translateY(0) rotate(0)}}
@keyframes t4-beam{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
@keyframes t4-ekg{from{stroke-dashoffset:2400}to{stroke-dashoffset:0}}
@keyframes t4-beat{0%,100%{transform:scale(1)}15%{transform:scale(1.12)}30%{transform:scale(1)}45%{transform:scale(1.08)}}
@keyframes t4-gavel{0%,100%{transform:rotate(-40deg)}40%{transform:rotate(8deg)}50%{transform:rotate(4deg)}}
@keyframes t4-swirl{from{transform:rotate(0) scale(1)}to{transform:rotate(-1080deg) scale(.15)}}
@keyframes t4-stack{0%{transform:translateY(-1400px)}75%{transform:translateY(0)}88%{transform:translateY(-30px)}100%{transform:translateY(0)}}
@keyframes t4-rattle{from{transform:rotate(-18deg)}to{transform:rotate(18deg)}}
@keyframes t4-pole{from{background-position:0 0}to{background-position:0 160px}}
@keyframes t4-snip{0%,100%{transform:rotate(0)}50%{transform:rotate(-22deg)}}
@keyframes t4-snip2{0%,100%{transform:rotate(0)}50%{transform:rotate(22deg)}}
@keyframes t4-tumble{0%{transform:translateX(-300px) rotate(0)}100%{transform:translateX(1400px) rotate(1080deg)}}
`

const FULL = { position: 'absolute', inset: 0, overflow: 'hidden' }
const COLUMN = { position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }

// ---------- astronaut ----------
export function Astronaut({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Orbitron', 'Russo One', sans-serif", fontWeight: 900 }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', right: -120, top: 120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #ffcf8a 0%, #e0794a 60%, #8a3a1f 100%)' }} />
      <div style={{ position: 'absolute', right: -260, top: 290, width: 700, height: 90, borderRadius: '50%', border: '16px solid rgba(255,220,170,0.75)', transform: 'rotate(-14deg)', boxSizing: 'border-box' }} />
      {/* a rocket blasting off the bottom */}
      <svg viewBox="0 0 120 300" width="140" height="350" aria-hidden="true" style={{ position: 'absolute', left: 110, bottom: -60, zIndex: 3, animation: 't4-launch 2.4s 400ms cubic-bezier(.6,0,.8,1) both' }}>
        <path d="M60 0 Q110 60 100 200 L20 200 Q10 60 60 0 Z" fill="#eceff1" stroke="#455a64" strokeWidth="6" />
        <circle cx="60" cy="90" r="20" fill="#4fc3f7" stroke="#455a64" strokeWidth="6" />
        <path d="M20 160 L0 220 L24 200 Z M100 160 L120 220 L96 200 Z" fill="#e53935" />
        <path d="M35 200 L60 300 L85 200 Z" fill="#ffb300" />
      </svg>
      <div style={{ ...COLUMN, gap: 16, paddingTop: 140 }}>
        <div style={{ ...font, fontSize: 100, lineHeight: 1.1, maxWidth: 1000, color: '#FFFFFF', textShadow: '0 0 30px #7fb6ff, 5px 5px 0 #1a237e', animation: 'hp-zoom-in 600ms cubic-bezier(.2,1.2,.4,1) both' }}>{word}</div>
        {/* the helmet: the crest shows in the gold visor */}
        <div style={{ animation: 'hp-pop 700ms 200ms both, t4-float 2s ease-in-out 900ms infinite alternate' }}>
          <div style={{ width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle at 40% 30%, #FFFFFF 0%, #e0e0e0 70%, #9e9e9e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(127,182,255,0.6)' }}>
            <div style={{ width: 420, height: 400, borderRadius: '45%', background: 'linear-gradient(135deg, #ffe082 0%, #ffb300 40%, #6d4c00 100%)', border: '12px solid #616161', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {circleCrest(crest, t, 290, '6px solid #ffe082')}
            </div>
          </div>
        </div>
        <div style={{ ...font, fontSize: 170, lineHeight: 1, color: '#FFFFFF', textShadow: '0 0 30px #7fb6ff' }}>{big}</div>
        <div style={{ ...font, fontSize: 46, lineHeight: 1.25, color: '#cfe2ff', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#cfe2ff', 'none')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- aquanaut ----------
export function Aquanaut({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  const brass = 'radial-gradient(circle at 35% 30%, #ffe9a8 0%, #d4a437 45%, #8a5a12 100%)'
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: '50%', top: -200, width: 2000, height: 1600, marginLeft: -1000, background: 'repeating-conic-gradient(from 160deg at 50% 0%, rgba(255,255,255,0.10) 0 4deg, transparent 4deg 10deg)', transformOrigin: '50% 0', animation: 't4-beam 6s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 200, background: '#c2a26a', borderRadius: '50% 50% 0 0 / 40px 40px 0 0' }} />
      {[[80, 1640, '#2e7d32', 260], [940, 1600, '#388e3c', 320], [860, 1680, '#1b5e20', 220]].map(([x, y, c, hgt], i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: y - hgt + 200, width: 40, height: hgt, background: c, borderRadius: 20, transformOrigin: 'bottom', animation: `th-sway ${1.6 + i * 0.3}s ease-in-out infinite alternate` }} />
      ))}
      <div style={{ ...COLUMN, gap: 18, paddingTop: 140 }}>
        <div style={{ ...font, fontSize: 120, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', textShadow: '0 0 30px #4dd0e1, 6px 6px 0 #021320', animation: 'hp-fade-up 700ms ease-out both' }}>{word}</div>
        {/* the brass diving helmet, the crest behind its porthole */}
        <div style={{ position: 'relative', animation: 'hp-pop 800ms 200ms both, t4-float 2.4s ease-in-out 1s infinite alternate' }}>
          <div style={{ width: 580, height: 580, borderRadius: '50%', background: brass, border: '14px solid #6b4410', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[[0, 50], [50, 0], [100, 50], [50, 100]].map(([x, y], i) => <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 50, height: 50, margin: '-25px 0 0 -25px', borderRadius: '50%', background: '#8a5a12', border: '6px solid #ffe9a8', boxSizing: 'border-box' }} />)}
            <div style={{ width: 380, height: 380, borderRadius: '50%', background: '#bfe9ff', border: '22px solid #8a5a12', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 40px rgba(0,60,90,0.5)' }}>
              <Crest src={crest} house={t} size={250} />
            </div>
          </div>
        </div>
        <div style={{ ...font, fontSize: 180, lineHeight: 1, color: '#FFFFFF', textShadow: '0 0 30px #4dd0e1, 7px 7px 0 #021320' }}>{big}</div>
        <div style={{ ...font, fontSize: 52, lineHeight: 1.1, color: '#b2ebf2', textShadow: '3px 3px 0 #021320', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#e0f7fa', '0 2px 0 #021320')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- lumberjack ----------
export function Lumberjack({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  const plaid = 'repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0 120px, transparent 120px 240px), repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0 120px, transparent 120px 240px)'
  return (
    <div style={{ ...FULL, backgroundImage: plaid }}>
      <div style={{ ...COLUMN, gap: 30, paddingTop: 300 }}>
        <div style={{ ...font, fontSize: 150, lineHeight: 1, maxWidth: 1000, color: '#FFFFFF', ...outlined('#2b1a0e', 10), textShadow: '8px 8px 0 #2b1a0e', animation: 'hp-slam 600ms 500ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        {/* a log slice, the crest in its rings, with an axe chopping beside it */}
        <div style={{ position: 'relative', animation: 'hp-pop 700ms both' }}>
          <div style={{ width: 600, height: 600, borderRadius: '50%', background: 'repeating-radial-gradient(circle, #e6c08a 0 18px, #c9965a 18px 24px)', border: '30px solid #6b4423', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 0 #3d2410' }}>
            {circleCrest(crest, t, 330, '10px solid #8b5a2b')}
          </div>
          <div style={{ position: 'absolute', right: -170, top: 40, width: 120, height: 520, transformOrigin: '60px 500px', animation: 't4-chop 0.7s ease-in 300ms 4' }}>
            <div style={{ position: 'absolute', left: 45, top: 60, width: 30, height: 460, background: 'linear-gradient(90deg, #a0662e, #6b4423)', borderRadius: 14 }} />
            <svg viewBox="0 0 160 140" width="190" height="166" aria-hidden="true" style={{ position: 'absolute', left: -110, top: 0 }}>
              <path d="M150 30 L150 100 L70 120 Q20 70 70 10 Z" fill="#b0bec5" stroke="#37474f" strokeWidth="8" />
              <path d="M70 10 Q20 70 70 120" fill="none" stroke="#eceff1" strokeWidth="8" />
            </svg>
          </div>
        </div>
        <div style={{ ...font, fontSize: 190, lineHeight: 1, color: '#FFFFFF', ...outlined('#2b1a0e', 10) }}>{big}</div>
        <div style={{ ...font, fontSize: 54, lineHeight: 1.1, color: '#FFFFFF', textShadow: '4px 4px 0 #2b1a0e', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#FFFFFF', '0 3px 0 #2b1a0e')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- ballroom ----------
export function Ballroom({ t, big, line, crest, who, word }) {
  const script = { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 900 }
  const beam = (left, delay) => (
    <div style={{ position: 'absolute', left, top: -100, width: 260, height: 2000, background: 'linear-gradient(180deg, rgba(255,240,200,0.45), rgba(255,240,200,0))', clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)', transformOrigin: '50% 0', animation: `t4-beam 3s ease-in-out ${delay}s infinite alternate` }} />
  )
  return (
    <div style={FULL}>
      {beam(120, 0)}
      {beam(700, 1.2)}
      {/* chandelier */}
      <svg viewBox="0 0 400 200" width="480" height="240" aria-hidden="true" style={{ position: 'absolute', left: 300, top: -20 }}>
        <path d="M200 0 L200 60" stroke="#d4af37" strokeWidth="8" />
        <path d="M60 110 Q200 190 340 110" stroke="#d4af37" strokeWidth="10" fill="none" />
        {[60, 130, 200, 270, 340].map((x, i) => <g key={x}><path d={`M${x} ${i === 2 ? 150 : 115} l0 -40`} stroke="#d4af37" strokeWidth="8" /><ellipse cx={x} cy={i === 2 ? 60 : 68} rx="10" ry="18" fill="#fff3b0" /></g>)}
        {[90, 160, 240, 310].map((x) => <path key={x} d={`M${x} 140 l-8 22 l8 14 l8 -14 Z`} fill="#e3f2fd" />)}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: 'repeating-linear-gradient(90deg, #8d5a32 0 90px, #a66d3f 90px 180px)', borderTop: '10px solid #d4af37' }} />
      {/* judges' cards */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center', gap: 50, zIndex: 3 }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ width: 190, height: 230, background: '#FFFFFF', borderRadius: 16, border: '8px solid #d4af37', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', ...script, fontSize: 130, color: '#6d1b3a', animation: `t4-card 600ms ${900 + k * 250}ms cubic-bezier(.2,1.3,.4,1) both` }}>10</div>
        ))}
      </div>
      <div style={{ ...COLUMN, gap: 16, paddingTop: 230 }}>
        <div style={{ ...script, fontSize: 140, lineHeight: 1.1, maxWidth: 1000, color: '#ffe6a8', textShadow: '0 0 30px rgba(255,215,0,0.6), 5px 5px 0 #1a040e', animation: 'hp-fade-up 800ms ease-out both' }}>{word}</div>
        <div style={{ animation: 'hp-pop 800ms 200ms both' }}>
          <div style={{ width: 420, height: 500, borderRadius: '50%', background: '#FFFFFF', border: '18px solid #d4af37', boxShadow: '0 0 0 8px #8a6d1a, 0 0 60px rgba(255,215,0,0.5)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crest src={crest} house={t} size={300} />
          </div>
        </div>
        <div style={{ ...script, fontSize: 180, lineHeight: 1.05, color: '#FFFFFF', textShadow: '6px 6px 0 #1a040e' }}>{big}</div>
        <div style={{ ...script, fontSize: 58, lineHeight: 1.15, color: '#ffe6a8', textShadow: '3px 3px 0 #1a040e', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#ffe6a8', '0 2px 0 #1a040e')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- cowboys ----------
function Cactus({ x, h, flip }) {
  return (
    <div style={{ position: 'absolute', left: x, bottom: 640, width: 70, height: h, background: '#2f6b3a', borderRadius: 35, transform: flip ? 'scaleX(-1)' : undefined }}>
      <div style={{ position: 'absolute', left: -60, top: h * 0.3, width: 60, height: 30, background: '#2f6b3a', borderRadius: '15px 0 0 15px' }} />
      <div style={{ position: 'absolute', left: -60, top: h * 0.1, width: 30, height: h * 0.3, background: '#2f6b3a', borderRadius: 15 }} />
      <div style={{ position: 'absolute', right: -55, top: h * 0.45, width: 55, height: 28, background: '#2f6b3a', borderRadius: '0 14px 14px 0' }} />
      <div style={{ position: 'absolute', right: -55, top: h * 0.25, width: 28, height: h * 0.25, background: '#2f6b3a', borderRadius: 14 }} />
    </div>
  )
}

export function Cowboys({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Rye', 'Bowlby One SC', serif" }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', left: '50%', top: 980, width: 520, height: 520, marginLeft: -260, borderRadius: '50%', background: '#ffe08a', opacity: 0.85 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 640, height: 160, background: '#9c5b2e', clipPath: 'polygon(0 100%, 0 40%, 10% 40%, 14% 0, 30% 0, 34% 40%, 60% 40%, 63% 10%, 80% 10%, 84% 50%, 100% 50%, 100% 100%)' }} />
      <Cactus x={70} h={330} />
      <Cactus x={930} h={260} flip />
      {/* a tumbleweed rolling past */}
      <div style={{ position: 'absolute', left: 0, bottom: 520, width: 150, height: 150, borderRadius: '50%', border: '10px dashed #8a6a3a', boxSizing: 'border-box', zIndex: 3, animation: 't4-tumble 3s linear 600ms infinite' }} />
      <div style={{ ...COLUMN, gap: 16, paddingTop: 120 }}>
        <div style={{ ...font, fontSize: 130, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', textShadow: '6px 6px 0 #5a2d0c', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        {/* the WANTED poster */}
        <div style={{ width: 520, padding: '30px 30px 24px', background: '#f3e2b8', border: '6px solid #8a6a3a', boxShadow: '0 12px 30px rgba(0,0,0,0.35)', transform: 'rotate(-3deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, animation: 'hp-pop 800ms 200ms both' }}>
          <div style={{ ...font, fontSize: 92, lineHeight: 1, color: '#3d2010' }}>WANTED</div>
          <div style={{ background: '#FFFFFF', padding: 8, border: '4px solid #3d2010' }}><Crest src={crest} house={t} size={250} /></div>
          <div style={{ ...font, fontSize: 34, color: '#3d2010' }}>FOR BEING AWESOME</div>
        </div>
        <div style={{ ...font, fontSize: 180, lineHeight: 1, color: '#FFFFFF', textShadow: '7px 7px 0 #5a2d0c' }}>{big}</div>
        <div style={{ ...font, fontSize: 52, lineHeight: 1.15, color: '#FFFFFF', textShadow: '4px 4px 0 #5a2d0c', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#fff3d6', '0 2px 0 #5a2d0c')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- nurses ----------
export function Nurses({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bowlby One SC', 'Anton', sans-serif" }
  const ekg = 'M0 120 L260 120 L300 120 L330 40 L370 210 L400 0 L440 160 L470 120 L700 120 L740 120 L770 40 L810 210 L840 0 L880 160 L910 120 L1200 120'
  return (
    <div style={FULL}>
      <svg viewBox="0 0 1200 240" width="1080" height="216" aria-hidden="true" style={{ position: 'absolute', left: 0, top: 120 }}>
        <path d={ekg} fill="none" stroke="#00897b" strokeWidth="12" strokeLinejoin="round" strokeDasharray="2400" style={{ animation: 't4-ekg 1.8s linear infinite' }} />
      </svg>
      <div style={{ ...COLUMN, gap: 18, paddingTop: 360 }}>
        <div style={{ ...font, fontSize: 120, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', ...outlined('#00695c', 9), textShadow: '6px 6px 0 #00695c', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        {/* a beating heart with the crest, and a stethoscope around it */}
        <div style={{ position: 'relative', animation: 'hp-pop 700ms 150ms both' }}>
          <svg viewBox="0 0 600 560" width="600" height="560" aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, animation: 't4-beat 1s ease-in-out infinite' }}>
            <path d="M300 540 C 80 400, 0 270, 40 150 C 80 30, 240 20, 300 130 C 360 20, 520 30, 560 150 C 600 270, 520 400, 300 540 Z" fill="#ff5c8a" stroke="#c2185b" strokeWidth="14" />
          </svg>
          <div style={{ position: 'relative', width: 600, height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 60, boxSizing: 'border-box' }}>
            {circleCrest(crest, t, 290, '10px solid #c2185b')}
          </div>
          <svg viewBox="0 0 300 400" width="240" height="320" aria-hidden="true" style={{ position: 'absolute', right: -170, top: 60 }}>
            <path d="M60 0 L60 140 Q60 260 160 260 Q260 260 260 160 L260 120" fill="none" stroke="#37474f" strokeWidth="16" strokeLinecap="round" />
            <circle cx="260" cy="100" r="40" fill="#b0bec5" stroke="#37474f" strokeWidth="12" />
          </svg>
        </div>
        <div style={{ ...font, fontSize: 180, lineHeight: 1, color: '#00695c', ...outlined('#FFFFFF', 9) }}>{big}</div>
        <div style={{ ...font, fontSize: 52, lineHeight: 1.1, color: '#00695c', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#004d40', 'none')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- lawyers ----------
export function Lawyers({ t, big, line, crest, who, word }) {
  const serif = { fontFamily: "'Playfair Display', serif", fontWeight: 900 }
  return (
    <div style={FULL}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 6px, transparent 6px 180px)' }} />
      {/* the scales */}
      <svg viewBox="0 0 400 300" width="420" height="315" aria-hidden="true" style={{ position: 'absolute', left: 330, top: 40, opacity: 0.9 }}>
        <path d="M200 20 L200 280 M120 280 L280 280 M60 70 L340 70" stroke="#d4af37" strokeWidth="12" strokeLinecap="round" />
        <path d="M60 70 L20 170 M60 70 L100 170 M340 70 L300 170 M340 70 L380 170" stroke="#d4af37" strokeWidth="5" />
        <path d="M10 170 Q60 220 110 170 Z M290 170 Q340 220 390 170 Z" fill="#d4af37" />
      </svg>
      <div style={{ ...COLUMN, gap: 16, paddingTop: 370 }}>
        <div style={{ ...serif, fontSize: 110, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', textShadow: '5px 5px 0 #1f1209', animation: 'hp-fade-up 700ms 600ms ease-out both' }}>{word}</div>
        {/* the crest as Exhibit A */}
        <div style={{ position: 'relative', background: '#fffdf5', padding: '26px 30px 20px', border: '4px solid #c9b88a', boxShadow: '0 14px 30px rgba(0,0,0,0.4)', transform: 'rotate(2deg)', animation: 'hp-pop 700ms both' }}>
          <div style={{ position: 'absolute', right: -30, top: -26, background: '#ffd23f', color: '#3d2615', ...serif, fontSize: 34, padding: '6px 18px', transform: 'rotate(8deg)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>EXHIBIT A</div>
          <Crest src={crest} house={t} size={280} />
        </div>
        <div style={{ ...serif, fontSize: 190, lineHeight: 1, color: '#ffd23f', textShadow: '7px 7px 0 #1f1209' }}>{big}</div>
        <div style={{ ...serif, fontSize: 56, lineHeight: 1.1, color: '#FFFFFF', textShadow: '3px 3px 0 #1f1209', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#f1e2c6', '0 2px 0 #1f1209')}>{who}</div>
      </div>
      {/* the gavel coming down on its block */}
      <div style={{ position: 'absolute', right: 90, bottom: 110, width: 260, height: 60, background: '#6b4423', borderRadius: 16, boxShadow: '0 8px 0 #3d2615', zIndex: 3 }} />
      <div style={{ position: 'absolute', right: 150, bottom: 150, width: 360, height: 120, zIndex: 3, transformOrigin: '340px 60px', animation: 't4-gavel 0.6s ease-in 3' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 110, height: 120, background: 'linear-gradient(90deg, #8b5a2b, #5a3a1a)', borderRadius: 18, border: '6px solid #d4af37', boxSizing: 'border-box' }} />
        <div style={{ position: 'absolute', left: 100, top: 45, width: 260, height: 30, background: '#8b5a2b', borderRadius: 15 }} />
      </div>
    </div>
  )
}

// ---------- toilet ----------
export function Toilet({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Bangers', 'Anton', sans-serif", letterSpacing: 3 }
  return (
    <div style={{ ...FULL, backgroundImage: 'linear-gradient(rgba(255,255,255,0.9) 4px, transparent 4px), linear-gradient(90deg, rgba(255,255,255,0.9) 4px, transparent 4px)', backgroundSize: '120px 120px' }}>
      {/* loo-roll streamers */}
      {[60, 300, 760, 980].map((x, i) => <div key={x} style={{ position: 'absolute', left: x, top: -20, width: 60, height: 700 + (i % 2) * 300, background: 'repeating-linear-gradient(180deg, #FFFFFF 0 60px, #f1f1f1 60px 64px)', boxShadow: '2px 0 6px rgba(0,0,0,0.15)', transformOrigin: 'top', animation: `th-sway ${1.2 + i * 0.2}s ease-in-out infinite alternate`, borderRadius: '0 0 10px 10px' }} />)}
      <div style={{ ...COLUMN, gap: 10, paddingTop: 120 }}>
        <div style={{ ...font, fontSize: 130, lineHeight: 1.05, maxWidth: 1000, color: '#FFFFFF', ...outlined('#1565c0', 10), textShadow: '6px 6px 0 #1565c0', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        {/* the toilet: the crest spins away in the bowl, then pops back up */}
        <svg viewBox="0 0 600 640" width="600" height="640" aria-hidden="true" style={{ marginTop: 10, animation: 'hp-pop 600ms both' }}>
          <rect x="140" y="0" width="320" height="190" rx="30" fill="#FFFFFF" stroke="#90a4ae" strokeWidth="10" />
          <rect x="370" y="30" width="60" height="20" rx="10" fill="#b0bec5" />
          <ellipse cx="300" cy="320" rx="260" ry="120" fill="#FFFFFF" stroke="#90a4ae" strokeWidth="10" />
          <ellipse cx="300" cy="320" rx="200" ry="80" fill="#4fc3f7" />
          <path d="M120 360 Q150 560 230 600 L370 600 Q450 560 480 360" fill="#FFFFFF" stroke="#90a4ae" strokeWidth="10" />
          <rect x="200" y="590" width="200" height="40" rx="14" fill="#eceff1" stroke="#90a4ae" strokeWidth="8" />
        </svg>
        <div style={{ position: 'relative', marginTop: -470, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ animation: 't4-swirl 1.1s 500ms ease-in both, hp-pop 700ms 1700ms forwards' }}>
            {circleCrest(crest, t, 240, '8px solid #1565c0')}
          </div>
        </div>
        <div style={{ ...font, fontSize: 190, lineHeight: 1, marginTop: 230, color: '#ffd23f', ...outlined('#1565c0', 10) }}>{big}</div>
        <div style={{ ...font, fontSize: 60, lineHeight: 1.1, color: '#1565c0', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#0d47a1', 'none')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- babies ----------
export function Babies({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Pacifico', cursive" }
  const block = (letter, color, delay, rot) => (
    <div style={{ width: 200, height: 200, background: color, borderRadius: 22, border: '10px solid #FFFFFF', boxShadow: '0 8px 0 rgba(0,0,0,0.12)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bowlby One SC', sans-serif", fontSize: 120, color: '#FFFFFF', transform: `rotate(${rot}deg)`, animation: `t4-stack 900ms ${delay}ms cubic-bezier(.3,.9,.4,1) both` }}>{letter}</div>
  )
  return (
    <div style={{ ...FULL, backgroundImage: 'radial-gradient(#ffc1d9 18px, transparent 19px), radial-gradient(#bfe3ff 18px, transparent 19px)', backgroundSize: '140px 140px', backgroundPosition: '0 0, 70px 70px' }}>
      {/* the rattle */}
      <div style={{ position: 'absolute', right: 70, top: 110, width: 200, height: 400, transformOrigin: '100px 380px', animation: 't4-rattle 0.18s ease-in-out infinite alternate' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #fff59d, #ffca28)', border: '10px solid #ff8f00', boxSizing: 'border-box' }} />
        <div style={{ position: 'absolute', left: 82, top: 190, width: 36, height: 180, background: '#4fc3f7', borderRadius: 18 }} />
        <div style={{ position: 'absolute', left: 60, top: 350, width: 80, height: 50, borderRadius: '50%', background: '#4fc3f7' }} />
      </div>
      <div style={{ ...COLUMN, gap: 24, paddingTop: 470 }}>
        <div style={{ ...font, fontSize: 112, lineHeight: 1.35, maxWidth: 1000, color: '#FFFFFF', textShadow: '5px 5px 0 #e57399', animation: 'hp-pop 800ms cubic-bezier(.2,1.5,.4,1) both' }}>{word}</div>
        {/* stacking blocks; the top one carries the crest */}
        <div style={{ marginTop: 10, animation: 't4-stack 900ms 900ms cubic-bezier(.3,.9,.4,1) both' }}>
          {circleCrest(crest, t, 300, '14px solid #FFFFFF', { boxShadow: '0 0 0 10px #ffb3d1' })}
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {block('A', '#ff8fb8', 300, -4)}
          {block('B', '#7cc4ff', 500, 3)}
          {block('C', '#9be29b', 700, -2)}
        </div>
        <div style={{ ...font, fontSize: 170, lineHeight: 1.3, color: '#e57399', textShadow: '5px 5px 0 #FFFFFF' }}>{big}</div>
        <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, color: '#6a7bd0', maxWidth: 980 }}>{line}</div>
        <div style={whoStyle('#6a7bd0', 'none')}>{who}</div>
      </div>
    </div>
  )
}

// ---------- barbers ----------
function Pole({ side }) {
  return (
    <div style={{ position: 'absolute', top: 160, [side]: 40, width: 110, height: 1100, zIndex: 1 }}>
      <div style={{ position: 'absolute', left: -10, right: -10, top: -50, height: 60, background: '#c0c0c0', borderRadius: '30px 30px 6px 6px' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden', border: '6px solid #c0c0c0', backgroundImage: 'repeating-linear-gradient(135deg, #d32f2f 0 40px, #FFFFFF 40px 80px, #1565c0 80px 120px, #FFFFFF 120px 160px)', backgroundSize: '160px 160px', animation: 't4-pole 0.8s linear infinite' }} />
      <div style={{ position: 'absolute', left: -10, right: -10, bottom: -50, height: 60, background: '#c0c0c0', borderRadius: '6px 6px 30px 30px' }} />
    </div>
  )
}

export function Barbers({ t, big, line, crest, who, word }) {
  const font = { fontFamily: "'Graduate', 'Anton', serif" }
  return (
    <div style={FULL}>
      <Pole side="left" />
      <Pole side="right" />
      <div style={{ ...COLUMN, gap: 26, paddingTop: 330 }}>
        <div style={{ ...font, fontSize: 116, lineHeight: 1.05, maxWidth: 820, color: '#d32f2f', ...outlined('#FFFFFF', 8), textShadow: '6px 6px 0 #1565c0', animation: 'hp-slam 600ms cubic-bezier(.2,1.4,.4,1) both' }}>{word}</div>
        {/* the mirror, with scissors snipping at its corner */}
        <div style={{ position: 'relative', animation: 'hp-pop 700ms 150ms both' }}>
          <div style={{ width: 480, height: 580, borderRadius: '50% 50% 46% 46%', background: 'linear-gradient(135deg, #f5fbff 0%, #d6e6f2 60%, #b8cfe0 100%)', border: '22px solid #b8860b', boxShadow: '0 0 0 8px #6b4f12, 0 20px 40px rgba(0,0,0,0.3)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {circleCrest(crest, t, 320, '8px solid #b8860b')}
          </div>
          <svg viewBox="0 0 220 220" width="260" height="260" aria-hidden="true" style={{ position: 'absolute', right: -170, top: 90 }}>
            <g style={{ transformOrigin: '110px 110px', animation: 't4-snip 0.35s ease-in-out infinite' }}>
              <path d="M110 110 L215 40" stroke="#90a4ae" strokeWidth="16" strokeLinecap="round" />
              <circle cx="60" cy="160" r="34" fill="none" stroke="#d32f2f" strokeWidth="14" />
              <path d="M84 136 L110 110" stroke="#d32f2f" strokeWidth="14" />
            </g>
            <g style={{ transformOrigin: '110px 110px', animation: 't4-snip2 0.35s ease-in-out infinite' }}>
              <path d="M110 110 L215 180" stroke="#b0bec5" strokeWidth="16" strokeLinecap="round" />
              <circle cx="160" cy="60" r="0" fill="none" />
              <circle cx="60" cy="60" r="34" fill="none" stroke="#d32f2f" strokeWidth="14" />
              <path d="M84 84 L110 110" stroke="#d32f2f" strokeWidth="14" />
            </g>
          </svg>
        </div>
        <div style={{ ...font, fontSize: 180, lineHeight: 1, color: '#1565c0', ...outlined('#FFFFFF', 9) }}>{big}</div>
        <div style={{ ...font, fontSize: 50, lineHeight: 1.15, color: '#3d2615', maxWidth: 780 }}>{line}</div>
        <div style={whoStyle('#3d2615', 'none')}>{who}</div>
      </div>
    </div>
  )
}

export const THEME4_VIEWS = { astronaut: Astronaut, aquanaut: Aquanaut, lumberjack: Lumberjack, ballroom: Ballroom, cowboys: Cowboys, nurses: Nurses, lawyers: Lawyers, toilet: Toilet, babies: Babies, barbers: Barbers }

// ---------- effect setups ----------
export const THEME4_FX = {
  astronaut({ w, h, parts, R, rain }) {
    for (let i = 0; i < 140; i++) parts.push({ kind: 'star', x: R(0, w), y: R(0, h), r: R(0.8, 3), ph: R(0, 6), c: '#FFFFFF', life: 9999 })
    for (let i = 0; i < 90; i++) parts.push({ kind: 'flame', x: 180 + R(-20, 20), y: h - 40, vx: R(-3, 3), vy: R(2, 6), r: R(14, 30), c: ['#FFF3B0', '#FFD23F', '#FF9F1C'][i % 3], life: 50, max: 50, delay: 24 + Math.floor(R(0, 60)) })
    rain(40, 'star5', ['#ffe082', '#FFFFFF', '#7fb6ff'], { vy: 1, vyr: 2, r: 8, rr: 10, sw: 0.8, spread: 1.6, spin: 0.05, delay: 200 })
  },
  aquanaut({ rise, w, parts, R }) {
    rise(90, 'bubble', ['#FFFFFF', '#b2ebf2'], { vy: 1.5, vyr: 2.5, r: 6, rr: 16, sw: 1.4 })
    for (let i = 0; i < 12; i++) parts.push({ kind: 'fish', x: -R(60, 900), y: R(300, 1700), vx: R(3, 6), vy: 0, r: R(20, 34), c: ['#ff8a65', '#ffd54f', '#4dd0e1', '#f06292'][i % 4], rot: 0, spin: 0, sw: 0.8, ph: R(0, 6), life: 500, delay: Math.floor(R(0, 200)) })
    void w
  },
  lumberjack({ w, h, parts, R, rain }) {
    for (let i = 0; i < 150; i++) parts.push({ kind: 'c', x: w * 0.72, y: h * 0.33, vx: R(-14, 10), vy: R(-16, -2), r: R(5, 11), c: ['#e6c08a', '#c9965a', '#8b5a2b'][i % 3], rot: R(0, 6), g: 0.5, life: 200, delay: 20 + Math.floor(R(0, 4)) * 42 })
    rain(50, 'leaf', ['#2e7d32', '#ef6c00', '#c62828', '#f9a825'], { vy: 1.5, vyr: 2, r: 14, rr: 8, sw: 1.6, spread: 1.5, spin: 0.08, delay: 150 })
  },
  ballroom({ rain, w, h, parts, R }) {
    rain(90, 'heart', ['#c2185b', '#e53950', '#ff8a80'], { vy: 1.2, vyr: 1.8, r: 10, rr: 8, sw: 1.4, spread: 1.5, spin: 0.04 })
    for (let i = 0; i < 40; i++) parts.push({ kind: 'flash', x: R(0, w), y: R(0, h * 0.6), r: R(18, 36), c: '#FFFFFF', life: 18, max: 18, delay: Math.floor(R(0, 360)) })
    rain(50, 'star5', ['#ffd54f', '#fff3b0'], { vy: 1.5, vyr: 2, r: 8, rr: 8, sw: 0.8, spread: 1.4, spin: 0.08, delay: 120 })
  },
  cowboys({ w, h, parts, R, rain }) {
    for (let i = 0; i < 40; i++) parts.push({ kind: 'puff', x: R(0, w), y: h - R(450, 650), vx: R(-1.2, 1.2), vy: R(-0.6, -0.1), r: R(30, 60), c: '#d9b07a', life: 120, max: 240, delay: Math.floor(R(0, 300)) })
    rain(40, 'star5', ['#ffd23f', '#f0b429'], { vy: 2, vyr: 3, r: 14, rr: 10, sw: 0.6, spread: 1.5, spin: 0.08, delay: 100 })
  },
  nurses({ rise, rain }) {
    rise(60, 'heart', ['#ff5c8a', '#f48fb1', '#FFFFFF'], { vy: 1.6, vyr: 2.2, r: 10, rr: 12, sw: 1.2 })
    rain(50, 'plus', ['#00897b', '#4db6ac', '#FFFFFF'], { vy: 1.5, vyr: 2, r: 10, rr: 8, sw: 0.8, spread: 1.5, spin: 0.04, delay: 150 })
  },
  lawyers({ rain }) {
    rain(70, 'c', ['#fffdf5', '#f3ecd8', '#FFFFFF'], { vy: 1.8, vyr: 2, r: 16, rr: 10, sw: 1.6, spread: 1.6 })
    rain(40, 'star5', ['#ffd23f', '#d4af37'], { vy: 2, vyr: 2, r: 10, rr: 8, sw: 0.8, spread: 1.4, spin: 0.08, delay: 200 })
  },
  toilet({ rise, rain }) {
    rise(70, 'bubble', ['#FFFFFF', '#b3e5fc'], { vy: 1.5, vyr: 2.5, r: 8, rr: 16, sw: 1.2 })
    rain(16, 'duck', ['#ffd23f', '#ffca28'], { vy: 2, vyr: 2, r: 24, rr: 10, sw: 1, spread: 1.5, spin: 0.03, delay: 150 })
  },
  babies({ rain, rise }) {
    rain(70, 'heart', ['#ff8fb8', '#ffc1d9', '#7cc4ff'], { vy: 1.2, vyr: 1.8, r: 10, rr: 10, sw: 1.2, spread: 1.5 })
    rise(50, 'bubble', ['#7cc4ff', '#ff8fb8', '#9be29b'], { vy: 1.5, vyr: 2, r: 10, rr: 16, sw: 1.2, delay: 150 })
    rain(50, 'star5', ['#fff59d', '#FFFFFF'], { vy: 1.5, vyr: 2, r: 8, rr: 8, sw: 0.8, spread: 1.4, spin: 0.08, delay: 250 })
  },
  barbers({ w, h, parts, R, rain }) {
    for (let i = 0; i < 160; i++) parts.push({ kind: 'c', x: w * 0.8, y: h * 0.25, vx: R(-6, 4), vy: R(-4, 2), r: R(2, 5), c: ['#3d2615', '#5a3a1a', '#1f1209', '#8d6e63'][i % 4], rot: R(0, 6), g: 0.25, life: 300, delay: Math.floor(R(0, 300)) })
    rain(40, 'star5', ['#ffd23f', '#FFFFFF'], { vy: 1.5, vyr: 2, r: 8, rr: 8, sw: 0.8, spread: 1.4, spin: 0.08, delay: 200 })
  },
}
