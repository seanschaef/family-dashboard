import { useEffect, useState } from 'react'
import { useFamilyTable, insertRow, updateRow, deleteRow, deleteWhere, todayISO } from './db.js'
import { supabase, isSupabaseConfigured } from './supabase.js'

// Monday of the current week as YYYY-MM-DD, and the 7 day ISO strings.
export function weekDates(from = new Date()) {
  const d = new Date(from)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  // Local calendar dates. (toISOString() is UTC, which in Edmonton rolls to
  // tomorrow after 5 or 6 pm and shifted every dinner by a day each evening.)
  const pad = (n) => String(n).padStart(2, '0')
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
  })
}

const W = weekDates()
export const SAMPLE_MEALS = [
  { id: 'me1', meal_date: W[0], title: 'Butter chicken', ingredients: 'onions, cream, rice' },
  { id: 'me2', meal_date: W[1], title: 'Tacos', ingredients: 'tortillas, beef, salsa' },
  { id: 'me4', meal_date: W[4], title: 'Pizza night', ingredients: '' },
]

export const useMeals = () => useFamilyTable('meals', { order: { column: 'meal_date' }, sample: SAMPLE_MEALS })
export const mealFor = (meals, iso) => meals.find((m) => m.meal_date === iso)

// Save a day's dinner: { title, ingredients, recipe_url, recipe }.
export async function setMeal(existingId, meal_date, fields) {
  const patch = {
    title: fields.title,
    ingredients: fields.ingredients || null,
    recipe_url: fields.recipe_url || null,
    recipe: fields.recipe || null,
  }
  if (existingId) await updateRow('meals', existingId, patch)
  else await insertRow('meals', { meal_date, ...patch })
}
export const removeMeal = (id) => deleteRow('meals', id)

// Move a dinner to another day. If that day already has one, they swap.
// (One dinner per day is enforced by the database, so the swap parks the first
// one on a placeholder date for a moment.)
export async function moveMeal(meal, toIso, meals) {
  if (!meal?.id || !toIso || meal.meal_date === toIso) return
  const other = mealFor(meals, toIso)
  if (other) {
    await updateRow('meals', meal.id, { meal_date: '1900-01-01' })
    await updateRow('meals', other.id, { meal_date: meal.meal_date })
  }
  await updateRow('meals', meal.id, { meal_date: toIso })
}

// Monday-start weeks: the 7 dates of the week `offset` weeks from this one.
export function weekAt(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset * 7)
  return weekDates(d)
}

// Every dinner planned before, once each (by name), most used first, then
// most recent; each carries its latest ingredients and recipe.
export function pastMeals(meals) {
  const byName = new Map()
  for (const m of [...meals].sort((a, b) => (a.meal_date < b.meal_date ? -1 : 1))) {
    if (!m.title?.trim()) continue
    const key = m.title.trim().toLowerCase()
    const prev = byName.get(key)
    byName.set(key, { title: m.title.trim(), ingredients: m.ingredients || prev?.ingredients || '', recipe_url: m.recipe_url || prev?.recipe_url || null, recipe: m.recipe || prev?.recipe || null, count: (prev?.count || 0) + 1, last: m.meal_date })
  }
  return [...byName.values()].sort((a, b) => b.count - a.count || (a.last < b.last ? 1 : -1))
}

// Read a recipe from a web page (server-side; see the import-recipe function).
// Returns { recipe } or { error }.
export async function importRecipe(url) {
  if (!isSupabaseConfigured) return { error: 'Not connected.' }
  const { data, error } = await supabase.functions.invoke('import-recipe', { body: { url } })
  if (error) return { error: 'Couldn’t read that page.' }
  return data || { error: 'Couldn’t read that page.' }
}

// Recipe lines ("2 cups (250 g) all-purpose flour, sifted") to grocery names
// ("all-purpose flour"): drop amounts, units, notes in brackets and anything
// after a comma.
const UNITS = new Set('cup cups c tbsp tbs tablespoon tablespoons tsp teaspoon teaspoons g gram grams kg ml l litre litres liter liters lb lbs pound pounds oz ounce ounces can cans package packages pkg jar jars clove cloves pinch dash bunch bunches slice slices stick sticks large medium small whole of x handful sprig sprigs piece pieces fl'.split(' '))
export function groceryNames(lines) {
  const out = []
  for (const line of lines || []) {
    let t = String(line).toLowerCase().replace(/\([^)]*\)/g, ' ').split(',')[0]
    t = t.replace(/[¼-¾⅐-⅞]/g, ' ').replace(/\d+([./-]\d+)?/g, ' ')
    const words = t.split(/\s+/).filter(Boolean)
    while (words.length && UNITS.has(words[0].replace(/\.$/, ''))) words.shift()
    const name = words.join(' ').replace(/^(of|a|an)\s+/, '').trim()
    if (name && name.length < 40 && !out.includes(name)) out.push(name)
  }
  return out
}

// ---------- saved meal plans ----------
export const useMealPlans = () => useFamilyTable('meal_plans', { order: { column: 'created_at', ascending: false }, sample: [] })
export const deleteMealPlan = (id) => deleteRow('meal_plans', id)

// Save a week (its 7 dates) as a named plan.
export function saveMealPlan(name, week, meals) {
  const days = week
    .map((iso, dow) => ({ dow, m: mealFor(meals, iso) }))
    .filter((d) => d.m?.title)
    .map(({ dow, m }) => ({ dow, title: m.title, ingredients: m.ingredients || '', recipe_url: m.recipe_url || null, recipe: m.recipe || null }))
  return insertRow('meal_plans', { name: String(name).trim().slice(0, 80), days })
}

// Put a plan's dinners into a week. Days that already have a dinner are kept
// unless replace is true. Returns how many days were filled.
export async function applyMealPlan(plan, week, meals, { replace = false } = {}) {
  let n = 0
  for (const d of plan.days || []) {
    const iso = week[d.dow]
    const existing = mealFor(meals, iso)
    if (existing?.title && !replace) continue
    await setMeal(existing?.id, iso, d)
    n++
  }
  return n
}

// ---------- groceries ----------
// Store sections in a shelf-friendly order.
export const GROCERY_SECTIONS = ['Produce', 'Dairy & eggs', 'Meat & fish', 'Bakery', 'Frozen', 'Pantry', 'Drinks', 'Household', 'Other']

// Keyword → section. The LONGEST matching keyword wins, so specific phrases
// beat generic words: "garlic bread" is Bakery (not Produce for "garlic"),
// "peanut butter" is Pantry (not Dairy for "butter"), "dog food" is Household.
const SECTION_KEYWORDS = [
  ['Household', ['paper towel', 'toilet', 'detergent', 'soap', 'dish soap', 'dishwasher', 'cleaner', 'bleach', 'garbage', 'trash bag', 'foil', 'plastic wrap', 'saran', 'ziploc', 'freezer bag', 'diaper', 'wipes', 'shampoo', 'conditioner', 'toothpaste', 'toothbrush', 'deodorant', 'dog food', 'cat food', 'dog treat', 'litter', 'batteries', 'napkin', 'tissue', 'kleenex', 'sponge', 'light bulb', 'lotion', 'sunscreen', 'vitamin']],
  ['Produce', ['apple', 'banana', 'lettuce', 'romaine', 'iceberg', 'arugula', 'spinach', 'onion', 'shallot', 'tomato', 'potato', 'yam', 'carrot', 'pepper', 'jalapeno', 'cucumber', 'zucchini', 'squash', 'pumpkin', 'berry', 'berries', 'grape', 'orange', 'clementine', 'mandarin', 'lemon', 'lime', 'avocado', 'broccoli', 'cauliflower', 'cabbage', 'celery', 'mushroom', 'garlic', 'ginger', 'kale', 'salad', 'fruit', 'veg', 'cilantro', 'parsley', 'basil', 'herb', 'corn', 'peas', 'green bean', 'bean sprout', 'asparagus', 'pear', 'peach', 'plum', 'melon', 'watermelon', 'cantaloupe', 'pineapple', 'mango', 'kiwi', 'cherr', 'radish', 'beet', 'leek', 'sweet potato']],
  ['Dairy & eggs', ['milk', 'cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'butter', 'yogurt', 'yoghurt', 'cream', 'egg', 'sour cream', 'cottage', 'cream cheese', 'whipping cream', 'half and half', 'kefir', 'margarine']],
  ['Meat & fish', ['chicken', 'beef', 'pork', 'bacon', 'sausage', 'turkey', 'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'prawn', 'ham', 'ground beef', 'ground pork', 'ground turkey', 'ground chicken', 'steak', 'meat', 'roast', 'ribs', 'lamb', 'deli', 'salami', 'pepperoni', 'hot dog', 'wiener', 'meatball']],
  ['Bakery', ['bread', 'garlic bread', 'bun', 'buns', 'bagel', 'tortilla', 'wrap', 'croissant', 'muffin', 'roll', 'pita', 'naan', 'english muffin', 'cake', 'donut', 'baguette', 'sourdough', 'crouton', 'stuffing']],
  ['Frozen', ['frozen', 'ice cream', 'popsicle', 'frozen pizza', 'frozen fries', 'fries', 'waffle', 'perogies', 'pierogi', 'bag of ice', 'ice cubes']],
  ['Drinks', ['juice', 'soda', 'pop', 'coffee', 'tea', 'sparkling', 'water', 'wine', 'beer', 'cola', 'gatorade', 'kombucha', 'lemonade', 'iced tea', 'iced coffee']],
  ['Pantry', ['pasta', 'spaghetti', 'macaroni', 'rice', 'flour', 'sugar', 'salt', 'oil', 'olive oil', 'sauce', 'pasta sauce', 'beans', 'black bean', 'kidney bean', 'chickpea', 'lentil', 'soup', 'cereal', 'cracker', 'granola', 'snack', 'chips', 'tortilla chip', 'cookie', 'spice', 'canned', 'peanut butter', 'peanut', 'jam', 'honey', 'syrup', 'oatmeal', 'oats', 'noodle', 'ketchup', 'mustard', 'mayo', 'relish', 'vinegar', 'broth', 'stock', 'baking', 'yeast', 'chocolate', 'nuts', 'almond', 'popcorn', 'pickle', 'salsa', 'dressing', 'taco seasoning']],
]

// Best-guess section for a label; 'Other' when nothing matches.
export function guessSection(label) {
  const t = String(label || '').toLowerCase()
  let best = 'Other'
  let bestLen = 0
  for (const [section, words] of SECTION_KEYWORDS) {
    for (const w of words) {
      if (w.length > bestLen && t.includes(w)) {
        best = section
        bestLen = w.length
      }
    }
  }
  return best
}

export const SAMPLE_GROCERIES = [
  { id: 'g1', label: 'Apples', section: 'Produce', added_by_member_key: 'm4', source: 'manual', done: false },
  { id: 'g2', label: 'Spinach', section: 'Produce', added_by_member_key: null, source: 'meal', done: false },
  { id: 'g3', label: 'Milk', section: 'Dairy & eggs', added_by_member_key: 'm1', source: 'manual', done: false },
  { id: 'g4', label: 'Pasta', section: 'Pantry', added_by_member_key: null, source: 'meal', done: false },
  { id: 'g5', label: 'Granola bars', section: 'Pantry', added_by_member_key: 'm3', source: 'manual', done: false },
  { id: 'g6', label: 'Dog food', section: 'Household', added_by_member_key: 'm1', source: 'manual', done: false },
]

// Ticked items stay on the list (ticked) until midnight Edmonton time, then
// clear. The database deletes them hourly (cron job clear-checked-groceries);
// screens hide them right at midnight so nothing lingers until that runs.
const edmontonDay = (ts) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton' }).format(new Date(ts))
export function useGroceries() {
  const res = useFamilyTable('grocery_items', { order: { column: 'created_at' }, sample: SAMPLE_GROCERIES })
  const [today, setToday] = useState(todayISO)
  useEffect(() => {
    const t = setInterval(() => setToday(todayISO()), 60000)
    return () => clearInterval(t)
  }, [])
  const rows = res.rows.filter((it) => !(it.done && it.done_at && edmontonDay(it.done_at) < today))
  return { ...res, rows }
}
// "3 apples", "apples x3", "apples ×3" -> { label: 'apples', qty: 3 }.
export function parseQty(text) {
  const t = String(text || '').trim()
  let m = t.match(/^(\d{1,2})\s*[x×]?\s+(.+)$/i)
  if (m) return { label: m[2].trim(), qty: Math.min(99, Math.max(1, +m[1])) }
  m = t.match(/^(.+?)\s*[x×]\s*(\d{1,2})$/i)
  if (m) return { label: m[1].trim(), qty: Math.min(99, Math.max(1, +m[2])) }
  return { label: t, qty: 1 }
}

// Amounts: a volume, weight or size typed with the item, e.g. "2L milk",
// "500 g butter", "1 dozen eggs", "flour 2 kg". Units are tidied ("2l" -> "2 L").
const UNIT = 'kg|g|mg|ml|l|litres?|liters?|lbs?|oz|dozen|doz|packs?|pk|bags?|cans?|bottles?|boxes|box|bunch(?:es)?|jars?|loaf|loaves|cartons?|tubs?|blocks?|heads?'
const NUM = '\\d+(?:[.,]\\d+)?|\\d+\\/\\d+|½|¼'
const LEAD_AMOUNT = new RegExp(`^(${NUM})\\s*(${UNIT})\\.?\\s+(?:of\\s+)?(.+)$`, 'i')
const TRAIL_AMOUNT = new RegExp(`^(.+?)\\s+(${NUM})\\s*(${UNIT})\\.?$`, 'i')
const UNIT_NAMES = { ml: 'mL', l: 'L', litre: 'L', litres: 'L', liter: 'L', liters: 'L', lbs: 'lb', doz: 'dozen', pk: 'pack' }
export function tidyAmount(num, unit) {
  const u = String(unit).toLowerCase()
  return `${num} ${UNIT_NAMES[u] || u}`
}

// "2L milk x2" -> { label: 'milk', amount: '2 L', qty: 2 }. Anything without a
// unit stays a count ("3 apples" -> 3 apples).
export function parseItem(text) {
  let t = String(text || '').trim()
  let qty = 1
  const tail = t.match(/^(.+?)\s*[x×]\s*(\d{1,2})$/i)
  if (tail) {
    t = tail[1].trim()
    qty = Math.min(99, Math.max(1, +tail[2]))
  }
  let m = t.match(LEAD_AMOUNT)
  if (m) return { label: m[3].trim(), amount: tidyAmount(m[1], m[2]), qty }
  m = t.match(TRAIL_AMOUNT)
  if (m) return { label: m[1].trim(), amount: tidyAmount(m[2], m[3]), qty }
  const counted = parseQty(t)
  return { label: counted.label, amount: null, qty: tail ? qty : counted.qty }
}

// How an item reads in a list: "Milk (2 L) ×2".
export function groceryText(it, times = '×') {
  const qty = it.qty || 1
  return `${it.label}${it.amount ? ` (${it.amount})` : ''}${qty > 1 ? ` ${times}${qty}` : ''}`
}

// Add an item. If the same item is already on the list (not checked off), its
// quantity goes up instead of adding a second line (and a new amount replaces
// the old one).
export async function addGrocery({ label, section, added_by_member_key, source, qty = 1, amount = null }) {
  const name = String(label || '').trim()
  if (!name) return null
  if (isSupabaseConfigured) {
    const { data: existing } = await supabase
      .from('grocery_items')
      .select('id, qty, amount')
      .ilike('label', name.replace(/[%_]/g, '\\$&'))
      .eq('done', false)
      .limit(1)
      .maybeSingle()
    if (existing) {
      await updateRow('grocery_items', existing.id, { qty: Math.min(99, (existing.qty || 1) + qty), ...(amount ? { amount: String(amount).slice(0, 30) } : {}) })
      return existing
    }
  }
  return insertRow('grocery_items', { label: name, qty: Math.min(99, Math.max(1, qty)), amount: amount ? String(amount).trim().slice(0, 30) || null : null, section: section || guessSection(name), added_by_member_key: added_by_member_key || null, source: source || 'manual' })
}
export const setGroceryAmount = (id, amount) => updateRow('grocery_items', id, { amount: String(amount || '').trim().slice(0, 30) || null })
export const setGroceryQty = (id, qty) => updateRow('grocery_items', id, { qty: Math.min(99, Math.max(1, qty)) })
export const removeGrocery = (id) => deleteRow('grocery_items', id)
export const toggleGrocery = (id, done) => updateRow('grocery_items', id, { done })
export const updateGrocerySection = (id, section) => updateRow('grocery_items', id, { section })
export const clearCheckedGroceries = () => deleteWhere('grocery_items', { done: true })

// Push a meal's comma-separated ingredients onto the grocery list.
export async function addIngredientsToGroceries(ingredients, memberKey) {
  const items = String(ingredients || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  for (const label of items) {
    await addGrocery({ label, added_by_member_key: memberKey, source: 'meal' })
  }
  return items.length
}

// ---------- recurring staples ----------
export const SAMPLE_STAPLES = [
  { id: 's1', label: 'Milk', section: 'Dairy & eggs' },
  { id: 's2', label: 'Eggs', section: 'Dairy & eggs' },
  { id: 's3', label: 'Bread', section: 'Bakery' },
  { id: 's4', label: 'Bananas', section: 'Produce' },
  { id: 's5', label: 'Dog food', section: 'Household' },
]
export const useStaples = () => useFamilyTable('grocery_staples', { order: { column: 'label' }, sample: SAMPLE_STAPLES })
export const addStaple = (label) => insertRow('grocery_staples', { label: String(label).trim(), section: guessSection(label) })
export const removeStaple = (id) => deleteRow('grocery_staples', id)
