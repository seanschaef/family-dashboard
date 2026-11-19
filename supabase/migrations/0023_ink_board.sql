-- The ink window: one shared drawing board per family, drawn on the wall (or
-- a phone). Strokes are stored as JSON: [{ c: colour, w: width, p: [[x, y], …] }]
-- with x and y from 0 to 1 across the board.
create table if not exists public.ink_boards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  strokes jsonb not null default '[]'::jsonb,
  updated_by text,                      -- member key, when known
  updated_at timestamptz not null default now()
);
create unique index if not exists ink_boards_family_key on public.ink_boards (family_id);

alter table public.ink_boards enable row level security;
alter table public.ink_boards force row level security;

drop policy if exists ink_boards_all on public.ink_boards;
create policy ink_boards_all on public.ink_boards
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.ink_boards;
