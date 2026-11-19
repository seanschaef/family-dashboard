// import-recipe: given a recipe page's address, fetch the page (browsers
// can't, due to CORS) and read the recipe most sites publish for search
// engines (schema.org "Recipe" JSON-LD): title, ingredients, steps, photo,
// servings and time. Signed-in family members only. Nothing is stored here;
// the app saves what it gets back on the meal.
//
// Deploy: supabase functions deploy import-recipe

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const MAX_BYTES = 4_000_000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const { data: userData } = await admin.auth.getUser(jwt)
  if (!userData?.user) return json({ error: 'not signed in' }, 401)

  let url: URL
  try {
    const body = await req.json()
    url = new URL(String(body.url || '').trim())
  } catch {
    return json({ error: 'That isn’t a web address.' }, 400)
  }
  if (!/^https?:$/.test(url.protocol) || isPrivateHost(url.hostname)) return json({ error: 'That isn’t a public web address.' }, 400)

  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (family-dashboard recipe import)', Accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return json({ error: `That site wouldn’t share the page (${res.status}). Type or paste the ingredients instead.` }, 200)
    const buf = await res.arrayBuffer()
    html = new TextDecoder().decode(buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf)
  } catch {
    return json({ error: 'Couldn’t open that page.' }, 200)
  }

  const recipe = findRecipe(html, url)
  if (!recipe) return json({ error: 'No recipe found on that page. You can still type the ingredients.', title: pageTitle(html) }, 200)
  return json({ recipe: { ...recipe, source: url.hostname.replace(/^www\./, '') } })
})

function isPrivateHost(h: string): boolean {
  const host = h.toLowerCase()
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return true
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const [a, b] = host.split('.').map(Number)
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
  }
  return host.includes(':') // IPv6 literals
}

function pageTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return m ? decode(m[1]).trim() : null
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
}
const clean = (s: unknown) => decode(String(s ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

function isRecipe(node: any): boolean {
  const t = node?.['@type']
  return t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'))
}

function walk(node: any, out: any[]) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) return node.forEach((n) => walk(n, out))
  if (isRecipe(node)) out.push(node)
  if (node['@graph']) walk(node['@graph'], out)
  if (node.mainEntity) walk(node.mainEntity, out)
}

function findRecipe(html: string, page?: URL) {
  const found: any[] = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html))) {
    try {
      walk(JSON.parse(m[1].trim()), found)
    } catch {
      /* some sites ship broken JSON-LD; skip it */
    }
  }
  if (!found.length) return null
  // Pages often list related recipes too: prefer the one that is this page
  // (its url / @id), then the one named in the page title, then the fullest.
  const path = page ? page.pathname.replace(/\/$/, '') : ''
  const title = (pageTitle(html) || '').toLowerCase()
  const score = (x: any) =>
    (path && [x.url, x['@id'], x.mainEntityOfPage?.['@id'], x.mainEntityOfPage].some((u) => typeof u === 'string' && u.replace(/\/$/, '').endsWith(path)) ? 100 : 0) +
    (x.name && title.includes(clean(x.name).toLowerCase()) ? 50 : 0) +
    Math.min(20, (x.recipeIngredient || []).length)
  const r = found.reduce((best, x) => (score(x) > score(best) ? x : best), found[0])

  const steps: string[] = []
  const addSteps = (x: any) => {
    if (!x) return
    if (typeof x === 'string') return x.split(/\n+/).map(clean).filter(Boolean).forEach((s) => steps.push(s))
    if (Array.isArray(x)) return x.forEach(addSteps)
    if (x['@type'] === 'HowToSection') return addSteps(x.itemListElement)
    if (x.text) steps.push(clean(x.text))
    else if (x.name) steps.push(clean(x.name))
  }
  addSteps(r.recipeInstructions)

  const img = Array.isArray(r.image) ? r.image[0] : r.image
  const image = typeof img === 'string' ? img : img?.url || null
  const servings = Array.isArray(r.recipeYield) ? r.recipeYield[0] : r.recipeYield

  return {
    title: clean(r.name) || null,
    ingredients: (Array.isArray(r.recipeIngredient) ? r.recipeIngredient : []).map(clean).filter(Boolean).slice(0, 80),
    steps: steps.slice(0, 60),
    image: image && /^https?:\/\//.test(image) ? image : null,
    servings: servings ? clean(servings) : null,
    time: minutes(r.totalTime) || minutes(r.cookTime) || null,
  }
}

// ISO 8601 duration ("PT1H15M") to "1 h 15 min".
function minutes(d: unknown): string | null {
  const m = String(d || '').match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m || !(m[1] || m[2] || m[3])) return null
  const total = (+m[1] || 0) * 1440 + (+m[2] || 0) * 60 + (+m[3] || 0)
  if (!total) return null
  const h = Math.floor(total / 60)
  const mm = total % 60
  return [h ? `${h} h` : '', mm ? `${mm} min` : ''].filter(Boolean).join(' ')
}
