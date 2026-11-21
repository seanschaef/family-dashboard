// Pop-ups grow out of the spot you tapped (or the middle of the screen if
// there was no recent tap), with a little overshoot, and their dark backdrop
// fades in. Use as a ref on the card and the backdrop:
//   <div ref={fadeIn} …backdrop…><div ref={popIn} role="dialog" …card…>
// Plain callback refs: they run once when the pop-up appears.

let last = null
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => { last = { x: e.clientX, y: e.clientY, t: Date.now() } }, true)
}

export function popIn(el) {
  if (!el || el.dataset.popped || !el.animate) return
  el.dataset.popped = '1'
  const r = el.getBoundingClientRect()
  // The wall is drawn scaled to fit the screen: convert screen pixels back
  // into the card's own units.
  const scale = el.offsetWidth ? r.width / el.offsetWidth : 1
  let dx = 0
  let dy = 0
  if (last && Date.now() - last.t < 1500) {
    dx = (last.x - (r.left + r.width / 2)) / scale
    dy = (last.y - (r.top + r.height / 2)) / scale
  }
  el.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(0.06)`, opacity: 0 },
      { transform: 'translate(0, 0) scale(1.03)', opacity: 1, offset: 0.75 },
      { transform: 'none', opacity: 1 },
    ],
    { duration: 380, easing: 'cubic-bezier(.2,.8,.3,1)' },
  )
}

export function fadeIn(el) {
  if (!el || el.dataset.faded || !el.animate) return
  el.dataset.faded = '1'
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' })
}
