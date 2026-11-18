-- Recurring grocery items ("staples") the family keeps re-adding: milk, eggs,
-- dog food. Tap one to drop it onto the grocery list.
create table if not exists public.grocery_staples (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  label text not null,
  section text,
  created_at timestamptz not null default now()
);

alter table public.grocery_staples enable row level security;
alter table public.grocery_staples force row level security;

create policy grocery_staples_all on public.grocery_staples
  for all using (family_id = public.auth_family_id()) with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.grocery_staples;
