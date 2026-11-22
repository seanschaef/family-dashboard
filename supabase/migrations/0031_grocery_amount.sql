-- An optional amount on grocery items: a volume, weight or size such as
-- "2 L", "500 g", "1 dozen" or "family size". Separate from qty (how many).
alter table public.grocery_items
  add column if not exists amount text;

alter table public.grocery_items drop constraint if exists grocery_items_amount_len;
alter table public.grocery_items add constraint grocery_items_amount_len check (amount is null or char_length(amount) <= 30);
