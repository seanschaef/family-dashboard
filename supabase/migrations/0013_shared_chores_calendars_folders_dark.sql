-- Shared chores and calendars, NAS folder list from the Pi, and the wall's
-- night-time dark mode. All additive: existing rows keep working.

-- ---------- chores: several assignees + how a shared chore completes ----------
-- member_keys: everyone the chore is assigned to (empty = anyone).
-- shared_mode: 'each' = every assignee ticks their own (and earns their own
--   points); 'any' = one tick by any assignee clears it for all of them.
-- member_key stays for older clients; it mirrors the first assignee.
alter table public.chores
  add column if not exists member_keys text[] not null default '{}',
  add column if not exists shared_mode text not null default 'each';

update public.chores
  set member_keys = array[member_key]
  where member_key is not null and member_keys = '{}';

alter table public.chores drop constraint if exists chores_shared_mode_check;
alter table public.chores
  add constraint chores_shared_mode_check check (shared_mode in ('each', 'any'));

-- A completion is now per chore, per day, per person (so 'each' chores can be
-- ticked by every assignee). 'any' chores still write a single row; the app
-- enforces that. NULLS NOT DISTINCT keeps "anyone" chores to one row a day.
alter table public.chore_logs drop constraint if exists chore_logs_chore_id_log_date_key;
alter table public.chore_logs drop constraint if exists chore_logs_chore_date_member_key;
alter table public.chore_logs
  add constraint chore_logs_chore_date_member_key unique nulls not distinct (chore_id, log_date, member_key);

-- ---------- calendars: several owners ----------
-- person_keys: everyone the calendar belongs to (e.g. a shared sports
-- calendar). person_key stays as the first owner; the sync function copies it
-- onto events, and the app reads the full owner list through the calendar.
alter table public.calendars
  add column if not exists person_keys text[] not null default '{}';

update public.calendars
  set person_keys = array[person_key]
  where person_key is not null and person_keys = '{}';

-- ---------- NAS folders published by the Pi ----------
-- The photo agent on the Pi lists the folders under the NAS mount and writes
-- them here (signed in as the wall account), so the phone can pick a folder
-- instead of typing a path. Folder names only; images never leave the house.
create table if not exists public.photo_folders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  path text not null,                 -- relative to the NAS mount root
  image_count int not null default 0, -- images directly in this folder
  updated_at timestamptz not null default now(),
  unique (family_id, path)
);

alter table public.photo_folders enable row level security;
alter table public.photo_folders force row level security;

drop policy if exists photo_folders_all on public.photo_folders;
create policy photo_folders_all on public.photo_folders
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.photo_folders;

-- ---------- wall dark mode at night ----------
-- dark_enabled: switch the wall to the dark theme between dark_start and
-- dark_end (HH:MM, local, may wrap past midnight).
alter table public.wall_settings
  add column if not exists dark_enabled boolean not null default true,
  add column if not exists dark_start text not null default '19:30',
  add column if not exists dark_end text not null default '07:00';
