-- Settings + admin: a pet name and a hub layout on the family, an is-admin
-- helper, and a family-edit policy for admins.
--
-- Note: database-level admin gating of the members table (so only admins can
-- edit other people's member rows) needs the existing permissive members_all
-- policy dropped and replaced, which triggers a destructive-change prompt.
-- That tightening is deferred to a later migration; for now the app gates roster
-- editing to admins in the UI, and members_all still allows family members to
-- edit the roster at the DB level.

alter table public.families
  add column if not exists pet_name text,
  add column if not exists wall_layout jsonb;   -- hub block order/size/visibility

-- True when the signed-in user's profile is flagged admin.
create or replace function public.auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;
revoke execute on function public.auth_is_admin() from public;
grant execute on function public.auth_is_admin() to authenticated;

-- families: anyone in the family reads it; only admins change it.
create policy families_update on public.families
  for update using (id = public.auth_family_id() and public.auth_is_admin())
  with check (id = public.auth_family_id() and public.auth_is_admin());
