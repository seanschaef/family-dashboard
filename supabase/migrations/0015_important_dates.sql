-- Important dates: birthdays of people outside the roster (grandparents,
-- friends), the pet's birthday, anniversaries and other dates worth a
-- countdown. Shown with the household birthdays in the hub's countdown card.

create table if not exists public.important_dates (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  title text not null,                     -- "Grandma Jean", "Ralph", "Our anniversary"
  kind text not null default 'other',      -- birthday | anniversary | other
  date date not null,                      -- the original date (year used for "turns N" / "N years")
  year_known boolean not null default true,-- false: don't show an age / year count
  repeats boolean not null default true,   -- yearly; false = a one-off date that drops off once past
  color text,                              -- optional dot colour
  created_at timestamptz not null default now(),
  constraint important_dates_kind_check check (kind in ('birthday', 'anniversary', 'other'))
);
create index if not exists important_dates_family_idx on public.important_dates (family_id);

alter table public.important_dates enable row level security;
alter table public.important_dates force row level security;

drop policy if exists important_dates_all on public.important_dates;
create policy important_dates_all on public.important_dates
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.important_dates;
