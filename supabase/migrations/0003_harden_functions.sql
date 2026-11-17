-- Tighten EXECUTE on the SECURITY DEFINER helpers (Supabase advisor 0028/0029).
-- handle_new_user is trigger-only; triggers run it regardless of EXECUTE grants,
-- so no role needs it.
revoke execute on function public.handle_new_user() from public;

-- auth_family_id is used inside RLS policies, so the authenticated role must be
-- able to execute it; anon has no use for it over the REST API.
revoke execute on function public.auth_family_id() from public;
grant execute on function public.auth_family_id() to authenticated;
