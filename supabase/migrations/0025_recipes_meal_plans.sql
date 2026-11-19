-- Recipes on meals, and saved meal plans.

-- A meal can link to a recipe page and carry the recipe itself (imported from
-- the page, or typed): { ingredients: [..], steps: [..], image, servings,
-- time, source }. meals.ingredients stays the short grocery list.
alter table public.meals
  add column if not exists recipe_url text,
  add column if not exists recipe jsonb;

-- Saved meal plans: a named week of dinners to reuse.
-- days: [{ dow: 0..6 (Mon..Sun), title, ingredients, recipe_url, recipe }]
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  days jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists meal_plans_family_idx on public.meal_plans (family_id, created_at desc);

alter table public.meal_plans enable row level security;
alter table public.meal_plans force row level security;

drop policy if exists meal_plans_all on public.meal_plans;
create policy meal_plans_all on public.meal_plans
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.meal_plans;
