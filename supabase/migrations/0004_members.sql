-- Household roster. Names, colours and birthdays live here (in the database),
-- not hardcoded in the source. Decoupled from auth.users so the roster exists
-- before everyone has an account; a profile can link to a member via member_id.

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  key text not null,                     -- stable slug for routing / colour lookup
  name text not null,
  color text not null,
  role text not null default 'parent',   -- parent | teen | child
  birthday date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (family_id, key)
);

alter table public.profiles
  add column if not exists member_id uuid references public.members (id) on delete set null;

alter table public.members enable row level security;
alter table public.members force row level security;

create policy members_all on public.members
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.members;
