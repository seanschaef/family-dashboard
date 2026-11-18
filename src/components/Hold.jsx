import { useLongPress } from '../lib/longPress.js'

// Wrap anything to give it a press-and-hold action (the tap still reaches the
// child unless the hold fired).
export default function Hold({ onHold, children, style }) {
  const lp = useLongPress(onHold)
  return (
    <div {...lp} style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none', ...style }}>
      {children}
    </div>
  )
}
