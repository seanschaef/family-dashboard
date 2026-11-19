-- Work calendars show "Busy" to everyone except their owner on their own
-- phone, unless the owner turns on show_details: then titles and locations
-- show on their wall page and to the family too. Work calendars still never
-- appear on the family hub or the shared Calendar page.
alter table public.calendars
  add column if not exists show_details boolean not null default false;
