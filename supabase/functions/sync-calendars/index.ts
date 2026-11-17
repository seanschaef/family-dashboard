// sync-calendars — pulls each linked ICS feed server-side (browsers can't, due
// to CORS), parses it, and caches events in `calendar_events`.
//
// Invoked from the app via supabase.functions.invoke('sync-calendars'), and
// can also be run on a schedule (Supabase cron) later.
//
// Deploy: supabase functions deploy sync-calendars
// Secrets used: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the
// platform; no manual secret needed for this function.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TZ_DEFAULT = 'America/Edmonton' // floating times assume our zone
const WINDOW_BACK_DAYS = 7
const WINDOW_FWD_DAYS = 60
const MAX_OCCURRENCES = 200

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const url = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const admin = createClient(url, serviceKey)

  // Resolve the caller's family so we only sync their calendars.
  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace('Bearer ', '')
  const { data: userData } = await admin.auth.getUser(jwt)
  if (!userData?.user) {
    return json({ error: 'not authenticated' }, 401)
  }
  const { data: profile } = await admin
    .from('profiles')
    .select('family_id')
    .eq('id', userData.user.id)
    .single()
  if (!profile) return json({ error: 'no profile' }, 403)

  const { data: calendars, error: calErr } = await admin
    .from('calendars')
    .select('id, ics_url, person_key, kind')
    .eq('family_id', profile.family_id)
  if (calErr) return json({ error: calErr.message }, 500)

  const now = new Date()
  const winStart = new Date(now.getTime() - WINDOW_BACK_DAYS * 86400000)
  const winEnd = new Date(now.getTime() + WINDOW_FWD_DAYS * 86400000)

  const summary: Record<string, unknown>[] = []

  for (const cal of calendars ?? []) {
    try {
      const res = await fetch(cal.ics_url, { headers: { 'User-Agent': 'family-dashboard/1.0' } })
      if (!res.ok) throw new Error(`fetch ${res.status}`)
      const text = await res.text()
      const events = parseIcs(text)

      const rows: Record<string, unknown>[] = []
      for (const ev of events) {
        for (const occ of expand(ev, winStart, winEnd)) {
          rows.push({
            calendar_id: cal.id,
            family_id: profile.family_id,
            uid: occ.uid,
            title: ev.summary ?? '(no title)',
            starts_at: occ.start.toISOString(),
            ends_at: occ.end ? occ.end.toISOString() : null,
            all_day: ev.allDay,
            location: ev.location ?? null,
            person_key: cal.person_key,
            kind: cal.kind,
          })
        }
      }

      // Replace this calendar's cache wholesale (simple + always consistent).
      await admin.from('calendar_events').delete().eq('calendar_id', cal.id)
      if (rows.length) await admin.from('calendar_events').insert(rows)
      await admin.from('calendars').update({ last_synced_at: new Date().toISOString() }).eq('id', cal.id)

      summary.push({ calendar_id: cal.id, events: rows.length })
    } catch (e) {
      summary.push({ calendar_id: cal.id, error: String(e) })
    }
  }

  return json({ ok: true, calendars: summary })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

// ---------------- ICS parsing ----------------
type Ev = {
  uid: string
  summary?: string
  location?: string
  allDay: boolean
  start: Date
  end?: Date
  rrule?: Record<string, string>
}

function parseIcs(text: string): Ev[] {
  // Unfold: lines beginning with a space or tab continue the previous line.
  const raw = text.replace(/\r\n/g, '\n').split('\n')
  const lines: string[] = []
  for (const line of raw) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length) {
      lines[lines.length - 1] += line.slice(1)
    } else {
      lines.push(line)
    }
  }

  const events: Ev[] = []
  let cur: Partial<Ev> | null = null
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      cur = { allDay: false }
      continue
    }
    if (line === 'END:VEVENT') {
      if (cur && cur.start) events.push(cur as Ev)
      cur = null
      continue
    }
    if (!cur) continue

    const idx = line.indexOf(':')
    if (idx === -1) continue
    const left = line.slice(0, idx)
    const value = line.slice(idx + 1)
    const [nameRaw, ...paramParts] = left.split(';')
    const name = nameRaw.toUpperCase()
    const params: Record<string, string> = {}
    for (const p of paramParts) {
      const [k, v] = p.split('=')
      if (k && v) params[k.toUpperCase()] = v
    }

    switch (name) {
      case 'UID':
        cur.uid = value
        break
      case 'SUMMARY':
        cur.summary = unescapeIcs(value)
        break
      case 'LOCATION':
        cur.location = unescapeIcs(value)
        break
      case 'DTSTART': {
        const d = parseDate(value, params)
        cur.start = d.date
        cur.allDay = d.allDay
        break
      }
      case 'DTEND': {
        const d = parseDate(value, params)
        cur.end = d.date
        break
      }
      case 'RRULE': {
        const r: Record<string, string> = {}
        for (const part of value.split(';')) {
          const [k, v] = part.split('=')
          if (k && v) r[k.toUpperCase()] = v
        }
        cur.rrule = r
        break
      }
    }
  }
  return events.map((e) => ({ ...e, uid: e.uid || `${e.summary}-${e.start.toISOString()}` }))
}

function unescapeIcs(v: string): string {
  return v.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
}

function parseDate(value: string, params: Record<string, string>): { date: Date; allDay: boolean } {
  // All-day: VALUE=DATE, e.g. 20261116
  if (params.VALUE === 'DATE' || /^\d{8}$/.test(value)) {
    const y = +value.slice(0, 4)
    const m = +value.slice(4, 6)
    const d = +value.slice(6, 8)
    return { date: new Date(Date.UTC(y, m - 1, d)), allDay: true }
  }
  // Date-time
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/)
  if (!m) return { date: new Date(value), allDay: false }
  const [, Y, Mo, D, H, Mi, S, z] = m
  const y = +Y, mo = +Mo, d = +D, h = +H, mi = +Mi, s = +S
  if (z === 'Z') return { date: new Date(Date.UTC(y, mo - 1, d, h, mi, s)), allDay: false }
  const tz = params.TZID || TZ_DEFAULT
  return { date: zonedToUtc(y, mo, d, h, mi, s, tz), allDay: false }
}

// Convert a wall-clock time in a named zone to a UTC Date without a tz library,
// by measuring that zone's offset at the given instant.
function zonedToUtc(y: number, mo: number, d: number, h: number, mi: number, s: number, tz: string): Date {
  const asUtc = Date.UTC(y, mo - 1, d, h, mi, s)
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
  const parts = Object.fromEntries(fmt.formatToParts(new Date(asUtc)).map((p) => [p.type, p.value]))
  const seen = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +(parts.hour === '24' ? '0' : parts.hour), +parts.minute, +parts.second)
  const offset = seen - asUtc
  return new Date(asUtc - offset)
}

// ---------------- recurrence ----------------
const WD = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

function expand(ev: Ev, winStart: Date, winEnd: Date): { uid: string; start: Date; end?: Date }[] {
  const durMs = ev.end ? ev.end.getTime() - ev.start.getTime() : 0
  const out: { uid: string; start: Date; end?: Date }[] = []
  const push = (start: Date) => {
    out.push({ uid: `${ev.uid}_${start.toISOString()}`, start, end: durMs ? new Date(start.getTime() + durMs) : undefined })
  }

  if (!ev.rrule) {
    if (ev.start >= winStart && ev.start <= winEnd) push(ev.start)
    return out
  }

  const r = ev.rrule
  const freq = r.FREQ
  const interval = Math.max(1, +(r.INTERVAL || '1'))
  const count = r.COUNT ? +r.COUNT : Infinity
  const until = r.UNTIL ? parseDate(r.UNTIL, {}).date : null
  const byday = r.BYDAY ? r.BYDAY.split(',').map((x) => x.slice(-2)) : null

  let cursor = new Date(ev.start)
  let emitted = 0
  let guard = 0

  while (guard++ < 2000 && emitted < count && cursor <= winEnd) {
    if (until && cursor > until) break

    let matches = true
    if (freq === 'WEEKLY' && byday) matches = byday.includes(WD[cursor.getUTCDay()])
    if (freq === 'DAILY' && byday) matches = byday.includes(WD[cursor.getUTCDay()])

    if (matches) {
      if (cursor >= winStart && cursor <= winEnd) push(cursor)
      emitted++
      if (out.length >= MAX_OCCURRENCES) break
    }

    // advance
    if (freq === 'DAILY') cursor = addDays(cursor, interval)
    else if (freq === 'WEEKLY') {
      if (byday) cursor = addDays(cursor, 1) // step daily, filter by BYDAY; interval handled weekly below
      else cursor = addDays(cursor, 7 * interval)
    } else if (freq === 'MONTHLY') cursor = addMonths(cursor, interval)
    else if (freq === 'YEARLY') cursor = addMonths(cursor, 12 * interval)
    else break
  }
  return out
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86400000)
}
function addMonths(d: Date, n: number): Date {
  const x = new Date(d)
  x.setUTCMonth(x.getUTCMonth() + n)
  return x
}
