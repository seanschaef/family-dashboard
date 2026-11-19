-- Ink can have several pages: one ink_boards row per page, in the order they
-- were added.
drop index if exists public.ink_boards_family_key;
alter table public.ink_boards add column if not exists created_at timestamptz not null default now();
create index if not exists ink_boards_family_idx on public.ink_boards (family_id, created_at);
