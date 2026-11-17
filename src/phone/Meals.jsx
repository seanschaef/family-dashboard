import { useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import { useMeals, mealFor, setMeal, weekDates, addIngredientsToGroceries } from '../lib/kitchen.js'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const input = { font: 'inherit', fontSize: 16, padding: '10px 12px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink, width: '100%', boxSizing: 'border-box' }

export default function Meals() {
  const { me } = useMembers()
  const { rows: meals } = useMeals()
  const week = weekDates()
  const [editing, setEditing] = useState(null) // iso date
  const [title, setTitle] = useState('')
  const [ing, setIng] = useState('')
  const [status, setStatus] = useState(null)

  function open(iso) {
    const m = mealFor(meals, iso)
    setEditing(iso)
    setTitle(m?.title || '')
    setIng(m?.ingredients || '')
  }
  async function save() {
    const m = mealFor(meals, editing)
    await setMeal(m?.id, editing, title.trim(), ing.trim())
    setEditing(null)
  }
  async function pushIngredients() {
    let n = 0
    for (const iso of week) {
      const m = mealFor(meals, iso)
      if (m?.ingredients) n += await addIngredientsToGroceries(m.ingredients, me?.key)
    }
    setStatus(`Added ${n} item${n === 1 ? '' : 's'} to groceries`)
  }

  return (
    <>
      <PhoneHeader title="Meals" subtitle="Dinner this week" />

      {week.map((iso, i) => {
        const m = mealFor(meals, iso)
        const isEditing = editing === iso
        return (
          <div key={iso} style={{ background: m ? C.tealTint : C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: isEditing ? 14 : '12px 14px' }}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{DOW[i]}</div>
                <input aria-label="Meal" placeholder="Dinner" value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
                <input aria-label="Ingredients" placeholder="Ingredients (comma separated)" value={ing} onChange={(e) => setIng(e.target.value)} style={input} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={save} style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFFFFF', borderRadius: 10, padding: '8px 16px', fontSize: 14, fontWeight: 700 }}>Save</button>
                  <button type="button" onClick={() => setEditing(null)} style={{ all: 'unset', cursor: 'pointer', color: C.muted, padding: '8px 10px', fontSize: 14, fontWeight: 700 }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => open(iso)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
                <span style={{ fontSize: 15, fontWeight: 800, width: 40 }}>{DOW[i]}</span>
                <span style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: 17 }}>{m?.title || '+ Plan a dinner'}</span>
                  {m?.ingredients && <span style={{ fontSize: 13, color: C.muted }}>{m.ingredients}</span>}
                </span>
                <span style={{ fontSize: 20, color: C.muted }}>›</span>
              </button>
            )}
          </div>
        )
      })}

      <button type="button" onClick={pushIngredients} style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFFFFF', borderRadius: 14, padding: 14, textAlign: 'center', fontSize: 16, fontWeight: 700 }}>
        Add week's ingredients to groceries
      </button>
      {status && <div style={{ fontSize: 14, color: C.tealText, textAlign: 'center' }}>{status}</div>}
    </>
  )
}
