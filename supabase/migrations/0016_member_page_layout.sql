-- Each person's wall page can be arranged like the hub (order, size, width,
-- combined rotating windows, hidden windows). Null = the default layout for
-- their role (child / teen / parent).
alter table public.members
  add column if not exists page_layout jsonb;
