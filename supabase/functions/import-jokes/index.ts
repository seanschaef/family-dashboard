// import-jokes: one-time (re-runnable) fill of the jokes table from two free,
// clean sources, filtered again here for a family wall:
//   - icanhazdadjoke.com: every dad joke (curated clean)
//   - JokeAPI: only jokes it marks safe (safe-mode), English
// Only the scheduler's secret can run it (x-cron-secret, as sync-calendars).
// Nothing about the family is sent anywhere; it only downloads jokes.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const UA = 'family-dashboard (private family wall display)'

// Words a family wall doesn't need, even in a "clean" joke.
const BLOCK = /\b(sex\w*|drunk|beer|beers|wine|vodka|whiskey|booze|bar ?tender|alcohol\w*|hangover|naked|nude|boob\w*|bra|bras|kill\w*|murder\w*|dead|die|died|dies|death|gun|guns|shoot\w*|drug\w*|weed|cocaine|hell|damn|crap|piss\w*|suicid\w*|divorc\w*|wife|husband|girlfriend|boyfriend|dating|date night|religio\w*|god|jesus|church|pope|politic\w*|trump|biden|fat|ugly|stupid|idiot|blonde|nazi|hitler|bomb\w*|terror\w*|cancer|funeral|grave|corpse|kiss\w*|pregnan\w*|baby daddy|rehab|prison|jail)\b/i

const clean = (s: string) => s.replace(/\s+/g, ' ').trim()
const ok = (...parts: (string | null | undefined)[]) => parts.every((p) => !p || (!BLOCK.test(p) && p.length < 220))

// "Why did X? Because Y." -> ["Why did X?", "Because Y."]; one-liners stay whole.
function split(joke: string): [string, string | null] {
  const m = joke.match(/^(.+?\?)\s+(.+)$/)
  return m ? [clean(m[1]), clean(m[2])] : [clean(joke), null]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

Deno.serve(async (req) => {
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const sent = req.headers.get('x-cron-secret')
  const { data: allowed } = sent ? await admin.rpc('check_cron_secret', { s: sent }) : { data: false }
  if (allowed !== true) return new Response(JSON.stringify({ error: 'not allowed' }), { status: 401 })

  const rows: { setup: string; punchline: string | null; source: string; source_id: string }[] = []
  let dadTotal = 0
  let apiTotal = 0

  // icanhazdadjoke: all pages of the search endpoint (30 per page).
  for (let page = 1; page <= 60; page++) {
    const res = await fetch(`https://icanhazdadjoke.com/search?limit=30&page=${page}`, { headers: { Accept: 'application/json', 'User-Agent': UA } })
    if (!res.ok) break
    const j = await res.json()
    for (const r of j.results || []) {
      dadTotal++
      const [setup, punchline] = split(String(r.joke || ''))
      if (setup && ok(setup, punchline)) rows.push({ setup, punchline, source: 'icanhazdadjoke', source_id: String(r.id) })
    }
    if (!j.next_page || j.next_page === page) break
    await sleep(250)
  }

  // JokeAPI: walk the id range in small slices so every safe joke is seen.
  const info = await (await fetch('https://v2.jokeapi.dev/info')).json()
  const maxId = info?.jokes?.idRange?.en?.[1] ?? 1400
  // About 1 in 8 jokes is marked safe, so a slice of 20 ids rarely holds more
  // than the 10 a request can return.
  for (let a = 0; a <= maxId; a += 20) {
    const res = await fetch(`https://v2.jokeapi.dev/joke/Misc,Pun,Spooky,Christmas?lang=en&safe-mode&idRange=${a}-${a + 19}&amount=10`)
    if (res.ok) {
      const j = await res.json()
      const list = j.jokes || (j.id != null ? [j] : [])
      for (const r of list) {
        if (r.error) continue
        apiTotal++
        const [setup, punchline] = r.type === 'twopart' ? [clean(r.setup || ''), clean(r.delivery || '')] : split(String(r.joke || ''))
        if (setup && ok(setup, punchline)) rows.push({ setup, punchline, source: 'jokeapi', source_id: String(r.id) })
      }
    }
    await sleep(550) // JokeAPI allows about 120 requests a minute
  }

  // Drop near-duplicates (same setup) and save.
  const seen = new Set<string>()
  const unique = rows.filter((r) => {
    const k = r.setup.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  for (let i = 0; i < unique.length; i += 500) {
    const { error } = await admin.from('jokes').upsert(unique.slice(i, i + 500), { onConflict: 'source,source_id', ignoreDuplicates: true })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  return new Response(JSON.stringify({ ok: true, fetched: { icanhazdadjoke: dadTotal, jokeapi: apiTotal }, kept: unique.length }), { headers: { 'Content-Type': 'application/json' } })
})
