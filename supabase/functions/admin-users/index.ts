// admin-users — lets a family admin manage logins from the app: list accounts,
// create a login, reset a password, grant/revoke admin, relink to a member,
// delete. Runs server-side with the service_role key (which must never reach the
// browser). Every call verifies the CALLER is an admin via their own JWT, and
// every target is checked to be in the caller's family.
//
// Invoked from the app via supabase.functions.invoke('admin-users', { body }).
// Deploy: supabase functions deploy admin-users
// Secrets: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY are
// injected by the platform.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (status: number, obj: unknown) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify the caller from their own token.
    const authHeader = req.headers.get('Authorization') || ''
    const asUser = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: uerr } = await asUser.auth.getUser()
    if (uerr || !user) return json(401, { error: 'Not signed in.' })
    const { data: prof } = await asUser.from('profiles').select('is_admin, family_id').eq('id', user.id).single()
    if (!prof?.is_admin) return json(403, { error: 'Admins only.' })
    const familyId = prof.family_id

    const admin = createClient(url, serviceKey)
    const body = await req.json().catch(() => ({}))
    const action = body.action as string

    const sameFamily = async (uid: string) => {
      const { data } = await admin.from('profiles').select('family_id').eq('id', uid).single()
      return data?.family_id === familyId
    }

    if (action === 'list') {
      const { data: profs } = await admin.from('profiles').select('id, member_id, is_admin, must_change_password').eq('family_id', familyId)
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const emailById = new Map((list?.users || []).map((u) => [u.id, u.email]))
      const { data: members } = await admin.from('members').select('id, name, key').eq('family_id', familyId).order('sort_order', { ascending: true })
      const mById = new Map((members || []).map((m) => [m.id, m]))
      const users = (profs || []).map((p) => ({
        user_id: p.id,
        email: emailById.get(p.id) || '',
        is_admin: p.is_admin,
        must_change_password: p.must_change_password,
        member_id: p.member_id,
        member_name: p.member_id ? (mById.get(p.member_id)?.name || '') : '',
      }))
      return json(200, { users, members })
    }

    if (action === 'create') {
      const { email, password, member_id, is_admin } = body
      if (!email || !password) return json(400, { error: 'Email and password are required.' })
      const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
      if (error) return json(400, { error: error.message })
      const uid = created.user!.id
      await admin.from('profiles').update({ family_id: familyId, member_id: member_id || null, is_admin: !!is_admin, must_change_password: true }).eq('id', uid)
      return json(200, { ok: true, user_id: uid })
    }

    if (action === 'set_password') {
      const { user_id, password } = body
      if (!password) return json(400, { error: 'A new password is required.' })
      if (!(await sameFamily(user_id))) return json(403, { error: 'Not in your family.' })
      const { error } = await admin.auth.admin.updateUserById(user_id, { password })
      if (error) return json(400, { error: error.message })
      await admin.from('profiles').update({ must_change_password: true }).eq('id', user_id)
      return json(200, { ok: true })
    }

    if (action === 'set_admin') {
      const { user_id, is_admin } = body
      if (!(await sameFamily(user_id))) return json(403, { error: 'Not in your family.' })
      if (user_id === user.id && !is_admin) return json(400, { error: 'You can\'t remove your own admin.' })
      await admin.from('profiles').update({ is_admin: !!is_admin }).eq('id', user_id)
      return json(200, { ok: true })
    }

    if (action === 'set_member') {
      const { user_id, member_id } = body
      if (!(await sameFamily(user_id))) return json(403, { error: 'Not in your family.' })
      await admin.from('profiles').update({ member_id: member_id || null }).eq('id', user_id)
      return json(200, { ok: true })
    }

    if (action === 'delete') {
      const { user_id } = body
      if (!(await sameFamily(user_id))) return json(403, { error: 'Not in your family.' })
      if (user_id === user.id) return json(400, { error: 'You can\'t delete your own account.' })
      const { error } = await admin.auth.admin.deleteUser(user_id)
      if (error) return json(400, { error: error.message })
      return json(200, { ok: true })
    }

    return json(400, { error: 'Unknown action.' })
  } catch (e) {
    return json(500, { error: String((e as Error)?.message || e) })
  }
})
