import { QRCodeSVG } from 'qrcode.react'
import { C } from '../theme.js'
import { useDragScroll } from './dragScroll.js'

// Tap a dinner on the wall: the recipe in a big card. Ingredients and steps
// (when the recipe was read from a web page), the photo, time and servings,
// and a QR code to open the original page on a phone while you cook.
export default function RecipePopover({ meal, onClose }) {
  const drag = useDragScroll()
  if (!meal) return null
  const r = meal.recipe || {}
  const ingredients = r.ingredients?.length ? r.ingredients : String(meal.ingredients || '').split(',').map((s) => s.trim()).filter(Boolean)
  const steps = r.steps || []
  const facts = [r.time, r.servings && `Serves ${r.servings}`, r.source].filter(Boolean)
  const date = new Date(meal.meal_date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(43, 36, 32, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 40 }}>
      <div
        role="dialog"
        aria-label={meal.title}
        onClick={(e) => e.stopPropagation()}
        style={{ background: C.card, borderRadius: 28, border: `2px solid ${C.border}`, borderTop: `12px solid ${C.meals}`, width: 'min(920px, 94%)', maxHeight: '86%', boxSizing: 'border-box', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexShrink: 0 }}>
          {r.image && <img src={r.image} alt="" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 18, flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, color: C.muted, fontWeight: 600 }}>{date}</div>
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>{meal.title}</div>
            {facts.length > 0 && <div style={{ fontSize: 22, color: C.muted, marginTop: 6 }}>{facts.join(' · ')}</div>}
          </div>
          <button type="button" aria-label="Close" onClick={onClose} style={{ all: 'unset', cursor: 'pointer', width: 60, height: 60, borderRadius: 30, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, flexShrink: 0 }}>
            ×
          </button>
        </div>

        <div ref={drag.ref} {...drag.handlers} className={drag.className} style={{ ...drag.style, flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {ingredients.length > 0 && (
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Ingredients</div>
              <div style={{ columnCount: 2, columnGap: 32 }}>
                {ingredients.map((x, i) => (
                  <div key={i} style={{ fontSize: 22, lineHeight: 1.35, padding: '4px 0', breakInside: 'avoid', display: 'flex', gap: 10 }}>
                    <span style={{ color: C.meals, fontWeight: 800 }}>•</span>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {steps.length > 0 && (
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Steps</div>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, fontSize: 22, lineHeight: 1.4, padding: '6px 0' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, background: C.tealTint, fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
          {!ingredients.length && !steps.length && (
            <div style={{ fontSize: 22, color: C.muted }}>No recipe saved for this dinner. Add a recipe link on the phone (Meals).</div>
          )}
        </div>

        {meal.recipe_url && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: C.tealTint, borderRadius: 18, padding: '14px 18px', flexShrink: 0 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 6, display: 'flex' }}>
              <QRCodeSVG value={meal.recipe_url} size={96} bgColor="#FFFFFF" fgColor="#2B2420" />
            </div>
            <div style={{ fontSize: 21 }}>
              <div style={{ fontWeight: 800 }}>Open the Full Recipe on Your Phone</div>
              <div style={{ color: C.muted, fontSize: 18 }}>Scan with the camera{r.source ? ` · ${r.source}` : ''}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
