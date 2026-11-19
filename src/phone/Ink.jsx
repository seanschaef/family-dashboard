import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import InkBoard from '../components/InkBoard.jsx'

// The same drawing board as the wall's Ink window: draw here and it shows on
// the wall (and the other way round).
export default function Ink() {
  return (
    <>
      <PhoneHeader title="Ink" subtitle="Draw or write on the wall’s board" />
      <div style={{ height: 'min(70vh, 560px)' }}>
        <InkBoard title="" />
      </div>
      <div style={{ fontSize: 12, color: C.muted }}>Show it on the wall with the Ink window in Settings › Arrange the Wall.</div>
    </>
  )
}
