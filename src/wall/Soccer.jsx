import { C } from '../theme.js'

// The family's soccer site, shown inside the wall. Set VITE_SOCCER_URL to
// change it.
//
// The site must allow being embedded by the wall: its Content-Security-Policy
// needs `frame-ancestors` to include the wall's address (http://localhost:4173
// on the Pi) and it must not send `X-Frame-Options: SAMEORIGIN`. Until then
// Chromium shows a "refused to connect" placeholder in the frame.
const SOCCER_URL = import.meta.env.VITE_SOCCER_URL || 'https://www.kickabout.ca/'

export default function Soccer() {
  return (
    <div style={{ flexGrow: 1, minHeight: 0, borderRadius: 28, overflow: 'hidden', border: `2px solid ${C.border}`, background: '#FFFFFF' }}>
      <iframe
        title="Soccer"
        src={SOCCER_URL}
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        allow="fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
