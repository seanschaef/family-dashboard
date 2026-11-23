import { useEffect, useRef, useState } from 'react'
import { C } from '../theme.js'
import { popIn, fadeIn } from '../lib/popIn.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import {
  usePhotoCollections,
  activeCollectionsFor,
  fetchFolderImages,
  photoAgentConfigured,
  SAMPLE_IMAGES,
} from '../lib/photos.js'

const SECONDS = 8

function shuffle(a) {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

// Ambient photo slideshow for the wall. memberKey null = the hub (family,
// seasonal and time-of-day collections); a member key = that person's page.
// Images come from the Pi's NAS agent; in the unconfigured demo it shows sample
// frames, and on a real deployment with no agent yet it shows a gentle hint.
// eslint-disable-next-line no-unused-vars
export default function PhotoFrame({ memberKey = null, height = 380, radius = 36, fit = 'contain', seconds = SECONDS }) {
  const { rows: collections } = usePhotoCollections()
  const [images, setImages] = useState([])
  const [idx, setIdx] = useState(0)
  const [full, setFull] = useState(null) // index of the photo shown full screen

  const matching = activeCollectionsFor(collections, { memberKey })
  const label = matching.map((c) => c.name).join(' · ')
  const folderKey = matching.map((c) => c.folder).join('|')

  useEffect(() => {
    let active = true
    async function load() {
      if (photoAgentConfigured()) {
        const lists = await Promise.all(matching.map((c) => fetchFolderImages(c.folder)))
        if (active) setImages(shuffle(lists.flat()))
      } else if (!isSupabaseConfigured) {
        setImages(matching.length ? SAMPLE_IMAGES : [])
      } else {
        setImages([])
      }
    }
    load()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderKey])

  useEffect(() => {
    setIdx(0)
  }, [folderKey])

  useEffect(() => {
    if (images.length < 2) return undefined
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), (seconds || SECONDS) * 1000)
    return () => clearInterval(t)
  }, [images, seconds])

  const frame = {
    height,
    borderRadius: radius,
    overflow: 'hidden',
    position: 'relative',
    background: C.border,
    border: `10px solid ${C.card}`,
    boxSizing: 'border-box',
  }

  if (!images.length) {
    return (
      <div style={{ ...frame, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 24, color: C.muted, textAlign: 'center', padding: 24 }}>
          {label ? `${label} — photos appear here from your NAS` : 'No photos set for now'}
        </div>
      </div>
    )
  }

  // Always the whole photo (never cropped); the leftover space gets a soft,
  // blurred copy of the same photo instead of bars. (`fit` is ignored now.)
  const contain = true
  return (
    <>
    <div style={{ ...frame, cursor: 'pointer' }} onClick={() => setFull(idx)} role="button" aria-label="Show this photo full screen">
      {contain && (
        <img
          key={`bg-${idx}`}
          src={images[idx]}
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: -20, width: 'calc(100% + 40px)', height: 'calc(100% + 40px)', objectFit: 'cover', filter: 'blur(24px) brightness(0.8)' }}
        />
      )}
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: contain ? 'contain' : 'cover',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }}
        />
      ))}
    </div>
    {full !== null && <FullPhoto images={images} start={full} onClose={() => setFull(null)} />}
    </>
  )
}

// Tap a photo: it fills the whole screen. Swipe (or tap the sides) for the
// next / previous one; tap the middle to close. Closes itself after a minute.
function FullPhoto({ images, start, onClose }) {
  const [i, setI] = useState(start)
  const down = useRef(null)
  const n = images.length
  const go = (d) => setI((x) => (x + d + n) % n)
  useEffect(() => {
    const t = setTimeout(onClose, 60000)
    return () => clearTimeout(t)
  }, [i, onClose])
  return (
    <div
      ref={fadeIn}
      onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY } }}
      onPointerUp={(e) => {
        const d = down.current
        down.current = null
        if (!d) return
        const dx = e.clientX - d.x
        if (Math.abs(dx) > 60 && n > 1) return go(dx < 0 ? 1 : -1)
        // A tap: the outer fifths flip photos, the middle closes.
        const r = e.currentTarget.getBoundingClientRect()
        const at = (e.clientX - r.left) / r.width
        if (n > 1 && at < 0.2) go(-1)
        else if (n > 1 && at > 0.8) go(1)
        else onClose()
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 150, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <img ref={popIn} key={images[i]} src={images[i]} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
      {n > 1 && <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 24, fontWeight: 700 }}>{i + 1} / {n} · swipe for more · tap to close</div>}
    </div>
  )
}
