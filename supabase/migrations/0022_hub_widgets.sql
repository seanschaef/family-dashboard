-- Data for the new hub windows.

-- Family notes: short messages typed on a phone and shown on the wall.
-- expires_at null = until someone removes it.
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 280),
  member_key text,                      -- who wrote it
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notes_family_idx on public.notes (family_id, created_at desc);

alter table public.notes enable row level security;
alter table public.notes force row level security;

drop policy if exists notes_all on public.notes;
create policy notes_all on public.notes
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.notes;

-- Reward goals: the reward each person is saving for (null = the next one
-- they can't afford yet).
alter table public.members
  add column if not exists goal_reward_id uuid references public.rewards (id) on delete set null;

-- Garbage / recycling collection schedule, set on the phone:
-- { "streams": [ { "name": "Garbage", "next": "2026-11-19", "every": 2 }, ... ] }
-- next = any known pickup date; every = weeks between pickups.
alter table public.families
  add column if not exists waste_schedule jsonb;
