// instacart-list: turn the family's grocery list into an Instacart shopping
// list page (Instacart Developer Platform, "Create shopping list page") and
// return its link. On Instacart you pick the store (e.g. Real Canadian
// Superstore), adjust items and check out yourself; nothing is ordered or
// paid for here.
//
// Secrets (Supabase dashboard › Edge Functions › Secrets):
//   INSTACART_API_KEY  the key from the Instacart Developer Dashboard
//   INSTACART_ENV      "production" (default) or "development" (test key)
//
// Deploy: supabase functions deploy instacart-list

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const url = Deno.env.get('SUPABASE_URL')!
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!
  const authHeader = req.headers.get('Authorization') ?? ''
  // Read the list as the signed-in user, so row-level security limits it to
  // their own family.
  const db = createClient(url, anon, { global: { headers: { Authorization: authHeader } } })
  const { data: userData } = await db.auth.getUser(authHeader.replace('Bearer ', ''))
  if (!userData?.user) return json({ error: 'not signed in' }, 401)

  const key = Deno.env.get('INSTACART_API_KEY')
  if (!key) return json({ error: 'Instacart isn’t set up yet (no API key).', setup: true }, 200)
  const base = Deno.env.get('INSTACART_ENV') === 'development' ? 'https://connect.dev.instacart.tools' : 'https://connect.instacart.com'

  const { data: items, error } = await db.from('grocery_items').select('label, qty, amount, done').eq('done', false).order('created_at')
  if (error) return json({ error: error.message }, 500)
  if (!items?.length) return json({ error: 'The grocery list is empty.' }, 200)

  let linkback: string | undefined
  try {
    const body = await req.json()
    if (typeof body?.linkback === 'string' && /^https:\/\//.test(body.linkback)) linkback = body.linkback
  } catch {
    /* no body */
  }

  const payload = {
    title: `Family groceries · ${new Date().toLocaleDateString('en-CA', { month: 'short', day: 'numeric', timeZone: 'America/Edmonton' })}`,
    link_type: 'shopping_list',
    expires_in: 30,
    line_items: items.slice(0, 200).map((g) => ({
      name: String(g.label).slice(0, 100),
      display_text: `${g.label}${g.amount ? ` (${g.amount})` : ''}${g.qty > 1 ? ` × ${g.qty}` : ''}`,
      line_item_measurements: [{ quantity: Math.max(1, g.qty || 1), unit: 'each' }],
    })),
    ...(linkback ? { landing_page_configuration: { partner_linkback_url: linkback } } : {}),
  }

  const res = await fetch(`${base}/idp/v1/products/products_link`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  if (!res.ok) {
    console.error(`instacart ${res.status}: ${text.slice(0, 500)}`)
    return json({ error: `Instacart said no (${res.status}).` }, 200)
  }
  let out: { products_link_url?: string } = {}
  try {
    out = JSON.parse(text)
  } catch {
    /* fall through */
  }
  if (!out.products_link_url) return json({ error: 'Instacart didn’t return a link.' }, 200)
  return json({ url: out.products_link_url, items: payload.line_items.length })
})
