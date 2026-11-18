import { supabase, isSupabaseConfigured } from './supabase.js'

// Calls the admin-users Edge Function, which runs server-side with the
// service_role key and verifies the caller is a family admin. The browser never
// sees that key.
async function call(body) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.functions.invoke('admin-users', { body })
  if (error) {
    let msg = error.message
    try {
      const ctx = await error.context?.json?.()
      if (ctx?.error) msg = ctx.error
    } catch {
      /* keep default message */
    }
    throw new Error(msg)
  }
  if (data?.error) throw new Error(data.error)
  return data
}

export const listAccounts = () => call({ action: 'list' })
export const createAccount = (email, password, member_id, is_admin) =>
  call({ action: 'create', email, password, member_id, is_admin })
export const resetPassword = (user_id, password) => call({ action: 'set_password', user_id, password })
export const setAccountAdmin = (user_id, is_admin) => call({ action: 'set_admin', user_id, is_admin })
export const setAccountMember = (user_id, member_id) => call({ action: 'set_member', user_id, member_id })
export const deleteAccount = (user_id) => call({ action: 'delete', user_id })
