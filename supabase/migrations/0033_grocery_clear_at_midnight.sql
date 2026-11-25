-- Checked-off groceries stay on the list (ticked) for the rest of the day and
-- are cleared at midnight Edmonton time.

alter table public.grocery_items add column if not exists done_at timestamptz;

-- Items already ticked count as ticked today, so they clear tonight.
update public.grocery_items set done_at = now() where done and done_at is null;

-- Stamp the time an item is ticked; clear it when unticked.
create or replace function public.grocery_items_done_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.done and (tg_op = 'INSERT' or not old.done) then
    new.done_at := now();
  elsif not new.done then
    new.done_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists grocery_items_done_at on public.grocery_items;
create trigger grocery_items_done_at
  before insert or update of done on public.grocery_items
  for each row execute function public.grocery_items_done_at();

-- Every hour, delete items ticked on an earlier Edmonton day. (Hourly rather
-- than one fixed UTC time, so it stays right whatever Edmonton's UTC offset.)
select cron.unschedule('clear-checked-groceries')
  where exists (select 1 from cron.job where jobname = 'clear-checked-groceries');
select cron.schedule(
  'clear-checked-groceries',
  '1 * * * *',
  $$delete from public.grocery_items
    where done
      and done_at is not null
      and (done_at at time zone 'America/Edmonton')::date < (now() at time zone 'America/Edmonton')::date$$
);
