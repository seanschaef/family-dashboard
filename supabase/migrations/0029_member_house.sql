-- House for the points celebration ("10 Points for Gryffindor!"). Null = the
-- celebration uses the person's own name and colour.
alter table public.members
  add column if not exists house text
  check (house is null or house in ('gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin'));
