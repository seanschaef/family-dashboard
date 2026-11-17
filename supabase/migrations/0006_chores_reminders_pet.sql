-- Step 2: chores + points, reminders/to-dos, pet care log, rewards.
-- Edmonton "today" is used for date defaults so a day rolls over at local
-- midnight.

create table if not exists public.chores (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  member_key text,                        -- assignee; null = rotate / anyone
  title text not null,
  repeat text not null default 'weekly',  -- once | daily | weekly
  days int[] not null default '{}',       -- weekly: 0=Sun .. 6=Sat
  points int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- A row means the chore was completed on that date. points snapshots the
-- chore's value at completion.
create table if not exists public.chore_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  chore_id uuid not null references public.chores (id) on delete cascade,
  member_key text,
  log_date date not null default (now() at time zone 'America/Edmonton')::date,
  points int not null default 0,
  created_at timestamptz not null default now(),
  unique (chore_id, log_date)
);
create index if not exists chore_logs_family_date_idx on public.chore_logs (family_id, log_date);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  member_key text,                        -- null = whole family
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.pet_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  task text not null,                     -- breakfast | walk | dinner
  log_date date not null default (now() at time zone 'America/Edmonton')::date,
  by_member_key text,
  created_at timestamptz not null default now(),
  unique (family_id, task, log_date)
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  title text not null,
  cost int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.chores      enable row level security;
alter table public.chore_logs  enable row level security;
alter table public.reminders   enable row level security;
alter table public.pet_logs    enable row level security;
alter table public.rewards     enable row level security;
alter table public.chores      force row level security;
alter table public.chore_logs  force row level security;
alter table public.reminders   force row level security;
alter table public.pet_logs    force row level security;
alter table public.rewards     force row level security;

create policy chores_all     on public.chores     for all using (family_id = public.auth_family_id()) with check (family_id = public.auth_family_id());
create policy chore_logs_all on public.chore_logs for all using (family_id = public.auth_family_id()) with check (family_id = public.auth_family_id());
create policy reminders_all  on public.reminders  for all using (family_id = public.auth_family_id()) with check (family_id = public.auth_family_id());
create policy pet_logs_all   on public.pet_logs   for all using (family_id = public.auth_family_id()) with check (family_id = public.auth_family_id());
create policy rewards_all    on public.rewards    for all using (family_id = public.auth_family_id()) with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.chores;
alter publication supabase_realtime add table public.chore_logs;
alter publication supabase_realtime add table public.reminders;
alter publication supabase_realtime add table public.pet_logs;
alter publication supabase_realtime add table public.rewards;
