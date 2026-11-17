-- Wall display schedule (auto monitor on/off), editable from the phone app and
-- applied by the Pi's display agent. One row per family.

create table if not exists public.wall_settings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  display_enabled boolean not null default true,     -- auto on/off at all?
  mode text not null default 'power',                -- 'power' (cut output) | 'blank' (black screen)
  on_time text not null default '06:30',             -- weekday HH:MM (24h, local)
  off_time text not null default '22:00',
  weekend_on_time text not null default '08:00',
  weekend_off_time text not null default '22:30',
  updated_at timestamptz not null default now(),
  unique (family_id)
);

alter table public.wall_settings enable row level security;
alter table public.wall_settings force row level security;

drop policy if exists wall_settings_all on public.wall_settings;
create policy wall_settings_all on public.wall_settings
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.wall_settings;
