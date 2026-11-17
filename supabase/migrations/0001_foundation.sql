-- Family Dashboard — foundation + calendars (build step 1)
-- Postgres / Supabase. RLS is enabled AND forced on every table.
-- One household model: a single `families` row; every account gets a profile
-- linked to it. (Multi-family would add invites; not needed here.)

-- ---------- helpers ----------
create extension if not exists "pgcrypto";

-- families ------------------------------------------------------------------
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our family',
  created_at timestamptz not null default now()
);

-- profiles (one per auth user) ----------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  display_name text,
  person_key text,                       -- sandi | sean | lewis | elliot
  color text,
  role text not null default 'parent',   -- parent | teen | child
  is_parent boolean not null default true,
  created_at timestamptz not null default now()
);

-- Returns the family_id of the currently signed-in user.
create or replace function public.auth_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.profiles where id = auth.uid();
$$;

-- New signups are attached to the (single) family automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fam uuid;
begin
  select id into fam from public.families order by created_at limit 1;
  if fam is null then
    insert into public.families (name) values ('Our family') returning id into fam;
  end if;
  insert into public.profiles (id, family_id, display_name)
  values (new.id, fam, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- calendars (private ICS feed links) ----------------------------------------
create table if not exists public.calendars (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  person_key text,                        -- whose colour / page
  name text not null,
  ics_url text not null,
  kind text not null default 'personal',  -- personal | work
  show_on_hub boolean not null default true,
  color text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

-- calendar_events (cache of parsed ICS; written by the sync Edge Function) ---
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  uid text,                               -- ICS UID, for upsert
  title text,
  starts_at timestamptz,
  ends_at timestamptz,
  all_day boolean not null default false,
  location text,
  person_key text,
  kind text not null default 'personal',
  updated_at timestamptz not null default now(),
  unique (calendar_id, uid)
);

create index if not exists calendar_events_family_starts_idx
  on public.calendar_events (family_id, starts_at);

-- ---------- RLS ----------
alter table public.families        enable row level security;
alter table public.profiles        enable row level security;
alter table public.calendars       enable row level security;
alter table public.calendar_events enable row level security;

alter table public.families        force row level security;
alter table public.profiles        force row level security;
alter table public.calendars       force row level security;
alter table public.calendar_events force row level security;

-- families: read your own family.
drop policy if exists families_select on public.families;
create policy families_select on public.families
  for select using (id = public.auth_family_id());

-- profiles: read everyone in your family; edit only your own row.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (family_id = public.auth_family_id());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- calendars: full access within your family.
drop policy if exists calendars_all on public.calendars;
create policy calendars_all on public.calendars
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());

-- calendar_events: read within your family. Writes come from the Edge Function
-- using the service role, which bypasses RLS.
drop policy if exists calendar_events_select on public.calendar_events;
create policy calendar_events_select on public.calendar_events
  for select using (family_id = public.auth_family_id());

-- Realtime for live wall updates.
alter publication supabase_realtime add table public.calendars;
alter publication supabase_realtime add table public.calendar_events;
