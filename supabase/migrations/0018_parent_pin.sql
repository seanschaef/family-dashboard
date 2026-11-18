-- A parent PIN for the wall: needed to undo a chore someone else completed
-- (kids were un-ticking a parent's chore and re-ticking it for their own
-- stars). Only a SHA-256 of family id + PIN is stored, never the PIN.
alter table public.families
  add column if not exists parent_pin_hash text;
