-- Step 3: meal planning + a synced grocery list.

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  meal_date date not null,
  title text not null,
  ingredients text,                       -- comma-separated, optional
  created_at timestamptz not null default now(),
  unique (family_id, meal_date)
);

create table if not exists public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  label text not null,
  section text not null default 'Other',
  added_by_member_key text,
  source text not null default 'manual',  -- manual | meal
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists grocery_items_family_idx on public.grocery_items (family_id, done);

alter table public.meals         enable row level security;
alter table public.grocery_items enable row level security;
alter table public.meals         force row level security;
alter table public.grocery_items force row level security;

create policy meals_all    on public.meals         for all using (family_id = public.auth_family_id()) with check (family_id = public.auth_family_id());
create policy grocery_all  on public.grocery_items for all using (family_id = public.auth_family_id()) with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.meals;
alter publication supabase_realtime add table public.grocery_items;
