// Parent PIN: stored only as SHA-256(familyId + ':' + pin), never in clear.
// (A 4-6 digit PIN won't stop someone with developer tools, but it stops
// a kid tapping around on the wall, which is the point.)
export async function hashPin(familyId, pin) {
  const bytes = new TextEncoder().encode(`${familyId}:${String(pin).trim()}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function checkPin(familyId, pin, hash) {
  if (!hash) return false
  return (await hashPin(familyId, pin)) === hash
}
