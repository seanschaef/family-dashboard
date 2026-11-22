-- Deleting a chore no longer deletes the ticks (and points) people earned
-- for it. Each tick keeps a copy of the chore's name; when the chore is
-- deleted its ticks stay, just no longer linked to it.
alter table public.chore_logs add column if not exists chore_title text;
update public.chore_logs l set chore_title = c.title
  from public.chores c where c.id = l.chore_id and l.chore_title is null;

create or replace function public.chore_logs_fill_title() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.chore_title is null and new.chore_id is not null then
    select title into new.chore_title from public.chores where id = new.chore_id;
  end if;
  return new;
end $$;
drop trigger if exists chore_logs_fill_title on public.chore_logs;
create trigger chore_logs_fill_title before insert on public.chore_logs
  for each row execute function public.chore_logs_fill_title();

alter table public.chore_logs alter column chore_id drop not null;
alter table public.chore_logs drop constraint if exists chore_logs_chore_id_fkey;
alter table public.chore_logs add constraint chore_logs_chore_id_fkey
  foreign key (chore_id) references public.chores (id) on delete set null;

-- One tick per chore, day and person still, but only while the chore exists
-- (ticks of deleted chores would otherwise collide).
alter table public.chore_logs drop constraint if exists chore_logs_chore_date_member_key;
drop index if exists public.chore_logs_chore_date_member_key;
create unique index chore_logs_chore_date_member_key
  on public.chore_logs (chore_id, log_date, member_key) nulls not distinct
  where chore_id is not null;
