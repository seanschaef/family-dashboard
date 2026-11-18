-- Admin flag and a "must change password" flag on profiles.
--   is_admin: can edit the roster, family settings and other people's wall.
--   must_change_password: set on a seeded/temp account; the app forces a new
--     password on next sign-in, then clears it.
alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists must_change_password boolean not null default false;
