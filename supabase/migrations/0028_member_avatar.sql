-- Profile pictures: a small square photo per person, stored on the member as a
-- data URL (cropped and shrunk to 256 px on the phone before saving, so it's
-- about 20 KB). Null = show their initial on their colour.
alter table public.members
  add column if not exists avatar text
  check (avatar is null or (avatar like 'data:image/%' and length(avatar) < 200000));
