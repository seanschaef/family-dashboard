import { useRef } from 'react'

// Drag-to-scroll for the wall. Its touchscreen reaches Chromium as mouse input
// (labwc mouse emulation), so a finger drag never scrolls on its own. Spread
// the returned props on a scrollable element:
//   const drag = useDragScroll({ onSwipeX: (dir) => ... })
//   <div ref={drag.ref} {...drag.handlers} style={drag.style}>...</div>
// - vertical drag scrolls it;
// - a quick horizontal swipe calls onSwipeX(+1 for left, -1 for right);
// - a drag never counts as a tap on whatever it started on.
// A swipe this element handles (onSwipeX) stops here, so a combined window
// around it doesn't also change; anything else bubbles up to it.

const MOVE = 8 // px before a press becomes a drag
const SWIPE = 60 // px for a horizontal swipe

export function useDragScroll({ onSwipeX } = {}) {
  const ref = useRef(null)
  const st = useRef(null)
  const suppressClick = useRef(false)

  const handlers = {
    onPointerDown(e) {
      st.current = { x: e.clientX, y: e.clientY, top: ref.current?.scrollTop ?? 0, mode: null, id: e.pointerId }
    },
    onPointerMove(e) {
      const s = st.current
      if (!s || (e.pointerType === 'mouse' && e.buttons === 0)) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (!s.mode && Math.max(Math.abs(dx), Math.abs(dy)) > MOVE) {
        s.mode = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x'
        try {
          e.currentTarget.setPointerCapture(s.id)
        } catch {
          /* pointer already gone */
        }
      }
      if (s.mode === 'y' && ref.current) ref.current.scrollTop = s.top - dy
    },
    onPointerUp(e) {
      const s = st.current
      st.current = null
      if (!s) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (s.mode === 'x' && Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) && onSwipeX) {
        onSwipeX(dx < 0 ? 1 : -1)
        e.stopPropagation()
      }
      if (s.mode) {
        suppressClick.current = true
        setTimeout(() => {
          suppressClick.current = false
        }, 0)
      }
    },
    onPointerCancel() {
      st.current = null
    },
    onClickCapture(e) {
      if (suppressClick.current) {
        e.stopPropagation()
        e.preventDefault()
      }
    },
  }

  const style = { overflowY: 'auto', touchAction: 'pan-y', overscrollBehavior: 'contain' }
  return { ref, handlers, style, className: 'no-scrollbar' }
}
