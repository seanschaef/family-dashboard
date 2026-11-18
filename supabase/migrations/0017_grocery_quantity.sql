-- Quantity on grocery items (default 1). Adding an item that's already on the
-- list (not yet checked) bumps its quantity instead of adding a duplicate.
alter table public.grocery_items
  add column if not exists qty int not null default 1;

alter table public.grocery_items drop constraint if exists grocery_items_qty_check;
alter table public.grocery_items add constraint grocery_items_qty_check check (qty between 1 and 99);
