import { QRCodeSVG } from 'qrcode.react'
import { C, card } from '../theme.js'
import { Clock, LiveCheck } from './parts.jsx'
import { todayISO } from '../lib/db.js'
import { useMeals, mealFor, weekDates, useGroceries, addGrocery, toggleGrocery, addIngredientsToGroceries, GROCERY_SECTIONS, removeGrocery } from '../lib/kitchen.js'
import { useLongPress } from '../lib/longPress.js'
import ConfirmSheet from '../components/ConfirmSheet.jsx'
import { useState } from 'react'
import { useMembers } from '../lib/members.jsx'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STAPLES = ['Milk', 'Eggs', 'Bread', 'Bananas', 'Dog food']

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL
const GROCERY_URL = `${PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/app/groceries`

function weekOfLabel() {
  const d = new Date(weekDates()[0] + 'T00:00:00')
  return `Week of ${d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}`
}

export default function Meals() {
  const { me } = useMembers()
  const { rows: meals } = useMeals()
  const { rows: groceries } = useGroceries()
  const [removing, setRemoving] = useState(null)
  const week = weekDates()
  const T = todayISO()

  const bySection = {}
  for (const it of groceries) (bySection[it.section || 'Other'] ||= []).push(it)
  // Shelf order, like the phone list.
  const sections = GROCERY_SECTIONS.filter((s) => bySection[s]?.length)

  async function addStaple(label) {
    // No section given: addGrocery files it automatically from the name.
    await addGrocery({ label, added_by_member_key: me?.key, source: 'manual' })
  }
  async function pushIngredients() {
    for (const iso of week) {
      const m = mealFor(meals, iso)
      if (m?.ingredients) await addIngredientsToGroceries(m.ingredients, me?.key)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 110 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 62, fontWeight: 800 }}>Meals</div>
          <div style={{ fontSize: 24, color: C.muted }}>{weekOfLabel()}</div>
        </div>
        <Clock />
      </div>

      <div style={card({ padding: 28, display: 'flex', flexDirection: 'column', gap: 10 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Dinner This Week</div>
          <button type="button" onClick={pushIngredients} style={{ all: 'unset', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: C.tealText }}>Add ingredients to list</button>
        </div>
        {week.map((iso, i) => {
          const m = mealFor(meals, iso)
          const isToday = iso === T
          return (
            <div key={iso} style={{ background: isToday ? C.meals : C.cream, color: isToday ? '#FFFFFF' : C.ink, borderRadius: 18, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 800, width: 80 }}>{DOW[i]}</span>
              <span style={{ fontSize: 24, flexGrow: 1 }}>{m?.title || 'Not planned'}</span>
            </div>
          )
        })}
      </div>

      <div style={card({ flexGrow: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>Grocery List</div>
          <div style={{ fontSize: 20, color: C.muted }}>Synced to everyone's phone</div>
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'center', background: C.tealTint, borderRadius: 18, padding: '16px 20px' }}>
          <div style={{ width: 84, height: 84, flexShrink: 0, borderRadius: 10, background: '#FFFFFF', border: `2px solid ${C.border}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QRCodeSVG value={GROCERY_URL} size={68} bgColor="#FFFFFF" fgColor={C.meals} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 23, fontWeight: 700 }}>Add from your phone</div>
            <div style={{ fontSize: 19, color: C.muted }}>Scan to open the family list. Tap a staple below if you're standing here.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {STAPLES.map((s) => (
            <button key={s} type="button" onClick={() => addStaple(s)} style={{ all: 'unset', cursor: 'pointer', background: C.card, border: `2px solid ${C.border}`, borderRadius: 999, padding: '12px 20px', fontSize: 21, fontWeight: 600 }}>+ {s}</button>
          ))}
        </div>

        {groceries.length === 0 ? (
          <div style={{ fontSize: 22, color: C.muted }}>List is empty.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px 24px' }}>
            {sections.map((name) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>{name}</div>
                {bySection[name].map((it) => (
                  <WallGroceryItem key={it.id} it={it} onAskRemove={setRemoving} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmSheet
        open={!!removing}
        scale={2}
        title={removing ? `Remove ${removing.label}?` : ''}
        detail="It comes off everyone's list."
        onCancel={() => setRemoving(null)}
        onConfirm={async () => { const id = removing.id; setRemoving(null); await removeGrocery(id) }}
      />
    </>
  )
}

// Tap to tick; press and hold to remove. Shows the quantity when more than one.
function WallGroceryItem({ it, onAskRemove }) {
  const lp = useLongPress(() => onAskRemove(it))
  const qty = it.qty || 1
  return (
    <div {...lp}>
      <LiveCheck label={qty > 1 ? `${it.label} ×${qty}` : it.label} sub={it.source === 'meal' ? '· Meal plan' : undefined} done={it.done} color={C.meals} size={40} fontSize={22} onToggle={() => toggleGrocery(it.id, !it.done)} />
    </div>
  )
}
