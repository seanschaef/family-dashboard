-- Joke of the Hour: a shared library of clean jokes (read-only to the app;
-- filled once by the import-jokes function), and each family's list of jokes
-- a parent chose never to show again.
create table if not exists public.jokes (
  id bigint generated always as identity primary key,
  setup text not null,
  punchline text,                 -- null for one-liners
  source text not null,           -- 'icanhazdadjoke' | 'jokeapi'
  source_id text,
  created_at timestamptz not null default now(),
  unique (source, source_id)
);
alter table public.jokes enable row level security;
alter table public.jokes force row level security;
drop policy if exists jokes_read on public.jokes;
create policy jokes_read on public.jokes for select to authenticated using (true);

create table if not exists public.joke_hides (
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  joke_key text not null,         -- 'db-<id>' or 'local-<n>'
  hidden_by text,
  created_at timestamptz not null default now(),
  primary key (family_id, joke_key)
);
alter table public.joke_hides enable row level security;
alter table public.joke_hides force row level security;
drop policy if exists joke_hides_all on public.joke_hides;
create policy joke_hides_all on public.joke_hides
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());
alter publication supabase_realtime add table public.joke_hides;
