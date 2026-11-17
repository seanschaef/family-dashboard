-- Step 4: photos. Named photo "collections" that each point at a folder on the
-- home NAS (mounted read-only on the Pi). A collection can target a member
-- (per-user pages), certain months (seasonal/theme sets) and/or an hour window
-- (per time of day). The actual image bytes never leave the house: the Pi reads
-- the folder locally and serves it to the wall. This table only holds the
-- lightweight routing (which folder shows where and when).

create table if not exists public.photo_collections (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  name text not null,
  folder text not null,                   -- path relative to the Pi's NAS mount root
  member_key text,                        -- null = family / hub; else m1..m4 style key
  active boolean not null default true,
  months int[] not null default '{}',     -- empty = every month; e.g. {12} = December only
  start_hour int,                         -- null = any time; 0..23 (inclusive)
  end_hour int,                           -- null = any time; 0..23 (exclusive)
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists photo_collections_family_idx on public.photo_collections (family_id, sort_order);

alter table public.photo_collections enable row level security;
alter table public.photo_collections force row level security;

create policy photo_collections_all on public.photo_collections
  for all using (family_id = public.auth_family_id()) with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.photo_collections;
