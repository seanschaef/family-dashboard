import { useEffect, useState } from 'react'
import { C } from '../theme.js'
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
export default function PhotoFrame({ memberKey = null, height = 380, radius = 36 }) {
  const { rows: collections } = usePhotoCollections()
  const [images, setImages] = useState([])
  const [idx, setIdx] = useState(0)

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
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), SECONDS * 1000)
    return () => clearInterval(t)
  }, [images])

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

  return (
    <div style={frame}>
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
            objectFit: 'cover',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }}
        />
      ))}
    </div>
  )
}
