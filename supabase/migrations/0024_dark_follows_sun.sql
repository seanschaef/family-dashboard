-- The wall's dark colours can follow Edmonton's sunset and sunrise (worked
-- out on the wall, no lookup) instead of fixed times. On by default.
alter table public.wall_settings
  add column if not exists dark_follow_sun boolean not null default true;
update public.wall_settings set dark_follow_sun = true;
