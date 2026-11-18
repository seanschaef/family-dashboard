import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { C } from '../theme.js'
import { PhoneHeader } from './parts.jsx'
import { useMembers } from '../lib/members.jsx'
import {
  normalizeHubLayout,
  HUB_BLOCK_LABELS,
  SIZES,
  WIDTH_LABELS,
  WIDTH_SPAN,
  withSize,
  widthOptions,
  entryLabel,
  combineEntries,
  separateEntry,
} from '../wall/hubLayout.js'
import { PERSON_BLOCK_LABELS, normalizePersonLayout } from '../wall/personLayout.js'

// Schematic heights for the preview (roughly proportional to the wall).
const schemHeight = (size) => ({ s: 34, m: 64, l: 80, xl: 112 })[size] || 64
const INTERVALS = [5, 10, 15, 20, 30, 60]
const TRANSITIONS = [
  { v: 'fade', label: 'Fade' },
  { v: 'slide', label: 'Slide' },
  { v: 'none', label: 'Instant' },
]

function Pick({ active, disabled, onClick, children }) {
  return (
    <button type="button" aria-pressed={active} disabled={disabled} onClick={onClick} style={{ all: 'unset', cursor: disabled ? 'default' : 'pointer', boxSizing: 'border-box', minWidth: 34, height: 30, padding: '0 10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: active ? C.meals : C.cream, color: active ? '#FFF' : C.ink, border: `2px solid ${active ? C.meals : C.border}`, borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
      {children}
    </button>
  )
}

function IconBtn({ children, onClick, disabled, label }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} disabled={disabled} style={{ all: 'unset', cursor: disabled ? 'default' : 'pointer', width: 34, height: 34, borderRadius: 10, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: disabled ? C.border : C.ink }}>
      {children}
    </button>
  )
}

const rowLabel = { fontSize: 12, fontWeight: 700, color: C.muted, marginTop: 8, marginBottom: 4 }

export default function Arrange() {
  const { wallLayout, updateFamily, updateMember, isAdmin, members, me } = useMembers()
  // Which page: the family hub, or one person's page (?who=<member key>).
  const [params, setParams] = useSearchParams()
  const who = params.get('who') || 'hub'
  const person = who === 'hub' ? null : members.find((m) => m.key === who)
  const labels = person ? PERSON_BLOCK_LABELS : HUB_BLOCK_LABELS
  const short = (id) => labels[id].replace(/ \(.*\)$/, '')
  const load = () => (person ? normalizePersonLayout(person.page_layout, person.role) : normalizeHubLayout(wallLayout))
  // You can arrange your own page; admins can arrange the hub and anyone's.
  const canEdit = person ? isAdmin || me?.id === person.id : isAdmin

  const [items, setItems] = useState(load)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    setItems(load())
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallLayout, who, person?.page_layout, person?.role])

  const change = (next) => { setItems(next); setSaved(false) }
  const patch = (i, p) => change(items.map((b, k) => (k === i ? { ...b, ...p } : b)))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    change(next)
  }

  const store = (value) => (person ? updateMember(person.id, { page_layout: value }) : updateFamily({ wall_layout: value }))
  const save = async () => { await store(items); setSaved(true) }
  const reset = async () => { await store(null); setSaved(true) }

  const visible = items.filter((b) => b.visible)

  return (
    <>
      <PhoneHeader title="Arrange the wall" subtitle="Reorder, resize, combine and hide windows" action={<Link to="/app/settings" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>‹ Settings</Link>} />

      {/* Which page to arrange */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[{ key: 'hub', name: 'Family hub', color: C.family }, ...members].map((m) => {
          const active = who === m.key
          return (
            <button key={m.key} type="button" aria-pressed={active} onClick={() => setParams(m.key === 'hub' ? {} : { who: m.key })} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', height: 36, padding: '0 14px', display: 'inline-flex', alignItems: 'center', background: active ? m.color : C.card, color: active ? '#FFFFFF' : C.ink, border: `2px solid ${active ? m.color : C.border}`, borderRadius: 999, fontSize: 14, fontWeight: 700 }}>
              {m.key === 'hub' ? m.name : `${m.name}'s page`}
            </button>
          )
        })}
      </div>

      {/* Live schematic of the hub grid (4 columns: full / half / quarter) */}
      <div style={{ background: C.cream, border: `3px solid ${C.ink}`, borderRadius: 16, padding: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoFlow: 'row dense', gap: 6 }}>
          {visible.map((b) => (
            <div key={b.id} style={{ gridColumn: `span ${WIDTH_SPAN[b.width] || 4}`, height: schemHeight(b.size), background: b.group ? C.tealTint : C.card, border: `2px ${b.group ? 'dashed' : 'solid'} ${b.group ? C.meals : C.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 4, fontSize: b.width === 'quarter' ? 10 : 12, fontWeight: 700, color: C.ink, overflow: 'hidden', boxSizing: 'border-box' }}>
              {b.group ? `${entryLabel(b, labels)} ⟳` : short(b.id)}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 6, textAlign: 'center' }}>Dashed = combined window that rotates (⟳)</div>
      </div>

      {!canEdit && <div style={{ fontSize: 13, color: C.muted }}>{person ? `Only ${person.name} or an admin can change this page.` : 'Only an admin can change the hub.'} This is a preview.</div>}
      {person && <div style={{ fontSize: 13, color: C.muted }}>Big job tiles with stars suit younger kids; the chores list suits everyone else. Photos show when {person.name} has a photo collection.</div>}

      {items.map((b, i) => (
        <div key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: C.card, border: `2px solid ${b.group ? C.meals : C.border}`, borderRadius: 14, padding: 10, opacity: b.visible ? 1 : 0.5 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={!canEdit || i === 0}>↑</IconBtn>
            <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={!canEdit || i === items.length - 1}>↓</IconBtn>
          </div>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{b.group ? `Combined: ${entryLabel(b, labels)}` : labels[b.id]}</div>

            <div style={rowLabel}>Size</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SIZES.map((s) => (
                <Pick key={s.v} active={b.size === s.v} disabled={!canEdit} onClick={() => change(items.map((x, k) => (k === i ? withSize(x, s.v) : x)))}>{s.label}</Pick>
              ))}
              {widthOptions(b.size).length > 1 ? (
                widthOptions(b.size).map((w) => (
                  <Pick key={w} active={b.width === w} disabled={!canEdit} onClick={() => patch(i, { width: w })}>{WIDTH_LABELS[w]}</Pick>
                ))
              ) : (
                <span style={{ fontSize: 12, color: C.muted, alignSelf: 'center' }}>{WIDTH_LABELS[b.width]} width</span>
              )}
            </div>

            {b.id === 'photo' && (
              <>
                <div style={rowLabel}>Photo</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Pick active={b.fit !== 'contain'} disabled={!canEdit} onClick={() => patch(i, { fit: 'cover' })}>Fill (crop)</Pick>
                  <Pick active={b.fit === 'contain'} disabled={!canEdit} onClick={() => patch(i, { fit: 'contain' })}>Fit (whole photo)</Pick>
                </div>
              </>
            )}

            {b.group && (
              <>
                <div style={rowLabel}>Rotates between (tap one to take it out)</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {b.group.map((id) => (
                    <button key={id} type="button" disabled={!canEdit} onClick={() => change(separateEntry(items, i, id))} title="Take out of this window" style={{ all: 'unset', cursor: canEdit ? 'pointer' : 'default', background: C.tealTint, color: C.ink, borderRadius: 999, padding: '5px 10px', fontSize: 13, fontWeight: 600 }}>
                      {short(id)} <span aria-hidden="true" style={{ color: C.muted }}>×</span>
                    </button>
                  ))}
                </div>
                <div style={rowLabel}>Change every</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {INTERVALS.map((s) => (
                    <Pick key={s} active={b.interval === s} disabled={!canEdit} onClick={() => patch(i, { interval: s })}>{s < 60 ? `${s}s` : '1 min'}</Pick>
                  ))}
                </div>
                <div style={rowLabel}>Transition</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TRANSITIONS.map((t) => (
                    <Pick key={t.v} active={b.transition === t.v} disabled={!canEdit} onClick={() => patch(i, { transition: t.v })}>{t.label}</Pick>
                  ))}
                </div>
              </>
            )}

            {canEdit && items.length > 1 && (
              <>
                <div style={rowLabel}>{b.group ? 'Add another window' : 'Combine with (rotates in this spot)'}</div>
                <select
                  aria-label="Combine with"
                  value=""
                  onChange={(e) => {
                    const j = items.findIndex((x) => x.id === e.target.value)
                    if (j >= 0) change(combineEntries(items, i, j))
                  }}
                  style={{ font: 'inherit', fontSize: 14, padding: '6px 8px', borderRadius: 10, border: `2px solid ${C.border}`, background: C.cream, color: C.ink, maxWidth: '100%' }}
                >
                  <option value="">Choose a window…</option>
                  {items.filter((x, k) => k !== i).map((x) => (
                    <option key={x.id} value={x.id}>{x.group ? `Combined: ${entryLabel(x, labels)}` : short(x.id)}</option>
                  ))}
                </select>
              </>
            )}
          </div>
          <button type="button" disabled={!canEdit} onClick={() => patch(i, { visible: !b.visible })} style={{ all: 'unset', cursor: canEdit ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, color: b.visible ? C.tealText : C.muted }}>{b.visible ? 'Hide' : 'Show'}</button>
        </div>
      ))}

      {canEdit && (
        <div style={{ position: 'sticky', bottom: 92, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, zIndex: 5 }}>
          <button type="button" onClick={save} style={{ all: 'unset', cursor: 'pointer', background: C.meals, color: '#FFF', borderRadius: 14, padding: '12px 22px', fontSize: 16, fontWeight: 700 }}>Save to wall</button>
          <button type="button" onClick={reset} style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: C.muted }}>Reset to default</button>
          {saved && <span style={{ fontSize: 14, color: C.tealText }}>Saved</span>}
        </div>
      )}
      <Link to="/app/wall-preview" style={{ fontSize: 14, fontWeight: 700, color: C.tealText }}>Open full wall preview ›</Link>
    </>
  )
}
