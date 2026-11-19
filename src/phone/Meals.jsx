import { useMemo, useState } from 'react'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import {
  useMeals, mealFor, setMeal, removeMeal, weekAt, addIngredientsToGroceries, pastMeals, importRecipe, groceryNames,
  useMealPlans, saveMealPlan, applyMealPlan, deleteMealPlan,
} from '../lib/kitchen.js'

// Dinner planning: any week, as far ahead as you like. Fill a day from a
// previous dinner (with its ingredients and recipe), from a recipe link, or
// by typing. Save a week as a plan and drop it into any other week.

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const input = { font: 'inherit', fontSize: 16, padding: '10px 12px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.card, color: C.ink, width: '100%', boxSizing: 'border-box' }
const btn = (bg = C.meals) => ({ all: 'unset', cursor: 'pointer', background: bg, color: '#FFFFFF', borderRadius: 10, padding: '9px 16px', fontSize: 14, fontWeight: 700, textAlign: 'center' })
const linkBtn = { all: 'unset', cursor: 'pointer', color: C.tealText, fontSize: 14, fontWeight: 700 }
const label = { fontSize: 12, fontWeight: 700, color: C.muted }

function weekTitle(week, offset) {
  const d = new Date(week[0] + 'T12:00:00')
  const date = d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })
  if (offset === 0) return `This Week · ${date}`
  if (offset === 1) return `Next Week · ${date}`
  if (offset === -1) return `Last Week · ${date}`
  return `Week of ${date}`
}

function DayEditor({ iso, dow, meal, previous, onDone }) {
  const [title, setTitle] = useState(meal?.title || '')
  const [ing, setIng] = useState(meal?.ingredients || '')
  const [url, setUrl] = useState(meal?.recipe_url || '')
  const [recipe, setRecipe] = useState(meal?.recipe || null)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const matches = previous.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase())).slice(0, search ? 20 : 8)

  function pick(p) {
    setTitle(p.title)
    setIng(p.ingredients || '')
    setUrl(p.recipe_url || '')
    setRecipe(p.recipe || null)
    setSearch('')
    setMsg('')
  }
  async function fetchRecipe() {
    if (!url.trim()) return
    setBusy(true)
    setMsg('Reading the recipe…')
    const res = await importRecipe(url.trim())
    setBusy(false)
    if (!res.recipe) {
      setMsg(res.error || 'Couldn’t read that page.')
      if (!title && res.title) setTitle(res.title.split('|')[0].trim())
      return
    }
    const r = res.recipe
    setRecipe(r)
    if (!title.trim() && r.title) setTitle(r.title)
    if (!ing.trim() && r.ingredients?.length) setIng(groceryNames(r.ingredients).join(', '))
    setMsg(`Got it: ${r.ingredients?.length || 0} ingredients, ${r.steps?.length || 0} steps.`)
  }
  async function save() {
    if (!title.trim()) return
    await setMeal(meal?.id, iso, { title: title.trim(), ingredients: ing.trim(), recipe_url: url.trim() || null, recipe })
    onDone()
  }
  async function clear() {
    if (meal?.id) await removeMeal(meal.id)
    onDone()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{DOW[dow]} · {new Date(iso + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</div>

      {previous.length > 0 && (
        <>
          <div style={label}>Pick a previous dinner</div>
          <input aria-label="Search previous dinners" placeholder="Search previous dinners" value={search} onChange={(e) => setSearch(e.target.value)} style={input} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {matches.map((p) => (
              <button key={p.title} type="button" onClick={() => pick(p)} style={{ all: 'unset', cursor: 'pointer', background: title === p.title ? C.meals : C.cream, color: title === p.title ? '#FFFFFF' : C.ink, border: `2px solid ${title === p.title ? C.meals : C.border}`, borderRadius: 999, padding: '6px 12px', fontSize: 14, fontWeight: 600 }}>
                {p.title}
                {p.recipe && ' 📖'}
              </button>
            ))}
            {!matches.length && <span style={{ fontSize: 13, color: C.muted }}>No match. Type it below.</span>}
          </div>
        </>
      )}

      <div style={label}>Dinner</div>
      <input aria-label="Meal" placeholder="Dinner" value={title} onChange={(e) => setTitle(e.target.value)} style={input} />

      <div style={label}>Recipe link (optional)</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input aria-label="Recipe link" type="url" inputMode="url" placeholder="Paste a recipe web address" value={url} onChange={(e) => { setUrl(e.target.value); setMsg('') }} style={{ ...input, flex: 1, minWidth: 0 }} />
        <button type="button" disabled={busy || !url.trim()} onClick={fetchRecipe} style={{ ...btn(C.tealText), opacity: url.trim() ? 1 : 0.5, whiteSpace: 'nowrap' }}>Get Recipe</button>
      </div>
      {msg && <div style={{ fontSize: 13, color: C.muted }}>{msg}</div>}
      {recipe && (
        <div style={{ fontSize: 13, color: C.ink, background: C.cream, borderRadius: 10, padding: 10 }}>
          📖 <b>{recipe.title || title}</b>
          {[recipe.time, recipe.servings && `serves ${recipe.servings}`, recipe.source].filter(Boolean).length > 0 && ` · ${[recipe.time, recipe.servings && `serves ${recipe.servings}`, recipe.source].filter(Boolean).join(' · ')}`}
          <div style={{ color: C.muted }}>{recipe.ingredients?.length || 0} ingredients, {recipe.steps?.length || 0} steps. Shows on the wall when you tap this dinner.</div>
          <button type="button" onClick={() => setRecipe(null)} style={{ ...linkBtn, color: C.danger, fontSize: 13 }}>Remove recipe</button>
        </div>
      )}

      <div style={label}>Grocery ingredients (comma separated)</div>
      <input aria-label="Ingredients" placeholder="e.g. chicken thighs, cream, rice" value={ing} onChange={(e) => setIng(e.target.value)} style={input} />
      {recipe?.ingredients?.length > 0 && (
        <button type="button" onClick={() => setIng(groceryNames(recipe.ingredients).join(', '))} style={{ ...linkBtn, alignSelf: 'flex-start' }}>Use the recipe&apos;s ingredients</button>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={save} disabled={!title.trim()} style={{ ...btn(), opacity: title.trim() ? 1 : 0.5 }}>Save</button>
        <button type="button" onClick={onDone} style={{ all: 'unset', cursor: 'pointer', color: C.muted, padding: '8px 10px', fontSize: 14, fontWeight: 700 }}>Cancel</button>
        {meal?.id && <button type="button" onClick={clear} style={{ ...linkBtn, color: C.danger, marginLeft: 'auto' }}>Clear Day</button>}
      </div>
    </div>
  )
}

export default function Meals() {
  const { me } = useMembers()
  const { rows: meals } = useMeals()
  const { rows: plans } = useMealPlans()
  const [offset, setOffset] = useState(0)
  const week = weekAt(offset)
  const [editing, setEditing] = useState(null) // iso date
  const [status, setStatus] = useState(null)
  const [planName, setPlanName] = useState('')
  const [naming, setNaming] = useState(false)
  const [replace, setReplace] = useState(false)
  const previous = useMemo(() => pastMeals(meals), [meals])
  const planned = week.filter((iso) => mealFor(meals, iso)?.title).length

  const say = (s) => {
    setStatus(s)
    setTimeout(() => setStatus(null), 5000)
  }
  async function pushIngredients() {
    let n = 0
    for (const iso of week) {
      const m = mealFor(meals, iso)
      if (m?.ingredients) n += await addIngredientsToGroceries(m.ingredients, me?.key)
    }
    say(`Added ${n} item${n === 1 ? '' : 's'} to groceries`)
  }
  async function savePlan() {
    if (!planName.trim()) return
    await saveMealPlan(planName, week, meals)
    setPlanName('')
    setNaming(false)
    say('Saved as a plan')
  }
  async function applyPlan(p) {
    const n = await applyMealPlan(p, week, meals, { replace })
    say(n ? `Filled ${n} day${n === 1 ? '' : 's'} from “${p.name}”` : 'Every day in that plan is already planned this week')
  }
  async function repeatLastWeek() {
    const prevWeek = weekAt(offset - 1)
    const plan = { days: prevWeek.map((iso, dow) => ({ dow, m: mealFor(meals, iso) })).filter((d) => d.m?.title).map(({ dow, m }) => ({ dow, title: m.title, ingredients: m.ingredients, recipe_url: m.recipe_url, recipe: m.recipe })) }
    const n = await applyMealPlan(plan, week, meals, { replace: false })
    say(n ? `Copied ${n} dinner${n === 1 ? '' : 's'} from the week before` : 'Nothing to copy (or those days are already planned)')
  }

  const navBtn = { all: 'unset', cursor: 'pointer', width: 40, height: 40, borderRadius: 20, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, background: C.card }

  return (
    <>
      <PhoneHeader title="Meals" subtitle="Plan dinners for any week" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" aria-label="Previous week" onClick={() => { setOffset((o) => o - 1); setEditing(null) }} style={navBtn}>‹</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{weekTitle(week, offset)}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{planned} of 7 dinners planned</div>
        </div>
        <button type="button" aria-label="Next week" onClick={() => { setOffset((o) => o + 1); setEditing(null) }} style={navBtn}>›</button>
      </div>
      {offset !== 0 && (
        <button type="button" onClick={() => { setOffset(0); setEditing(null) }} style={{ ...linkBtn, alignSelf: 'center' }}>Back to this week</button>
      )}

      {week.map((iso, i) => {
        const m = mealFor(meals, iso)
        const isEditing = editing === iso
        return (
          <div key={iso} style={{ background: m ? C.tealTint : C.card, border: `2px solid ${isEditing ? C.meals : C.border}`, borderRadius: 16, padding: isEditing ? 14 : '12px 14px' }}>
            {isEditing ? (
              <DayEditor iso={iso} dow={i} meal={m} previous={previous} onDone={() => setEditing(null)} />
            ) : (
              <button type="button" onClick={() => setEditing(iso)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
                <span style={{ width: 44 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 800 }}>{DOW[i]}</span>
                  <span style={{ display: 'block', fontSize: 11, color: C.muted }}>{new Date(iso + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 17 }}>
                    {m?.title || '+ Plan a dinner'}
                    {m?.recipe && ' 📖'}
                  </span>
                  {m?.ingredients && <span style={{ fontSize: 13, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.ingredients}</span>}
                </span>
                <span style={{ fontSize: 20, color: C.muted }}>›</span>
              </button>
            )}
          </div>
        )
      })}

      <button type="button" onClick={pushIngredients} disabled={!planned} style={{ ...btn(), padding: 14, fontSize: 16, borderRadius: 14, opacity: planned ? 1 : 0.5 }}>
        Add This Week&apos;s Ingredients to Groceries
      </button>
      {status && <div role="status" style={{ fontSize: 14, color: C.tealText, textAlign: 'center', fontWeight: 700 }}>{status}</div>}

      <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 17, fontWeight: 800 }}>Meal Plans</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={repeatLastWeek} style={btn(C.tealText)}>Repeat the Week Before</button>
          {planned > 0 && !naming && <button type="button" onClick={() => setNaming(true)} style={btn()}>Save This Week as a Plan</button>}
        </div>
        {naming && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input aria-label="Plan name" placeholder="Plan name, e.g. Busy weeknights" value={planName} onChange={(e) => setPlanName(e.target.value)} style={{ ...input, flex: 1, minWidth: 0 }} />
            <button type="button" onClick={savePlan} disabled={!planName.trim()} style={{ ...btn(), opacity: planName.trim() ? 1 : 0.5 }}>Save</button>
            <button type="button" onClick={() => setNaming(false)} style={{ all: 'unset', cursor: 'pointer', color: C.muted, fontSize: 14, fontWeight: 700 }}>Cancel</button>
          </div>
        )}
        {plans.length === 0 ? (
          <div style={{ fontSize: 13, color: C.muted }}>No saved plans yet. Plan a week, then save it here to use again.</div>
        ) : (
          <>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: C.muted }}>
              <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
              Replace dinners already planned this week
            </label>
            {plans.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.cream, borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(p.days || []).map((d) => `${DOW[d.dow]} ${d.title}`).join(' · ')}</div>
                </div>
                <button type="button" onClick={() => applyPlan(p)} style={btn()}>Use</button>
                <button type="button" onClick={() => { if (window.confirm(`Delete the plan “${p.name}”?`)) deleteMealPlan(p.id) }} style={{ ...linkBtn, color: C.danger }}>Delete</button>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}
