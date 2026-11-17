-- Per-member wall widget (the open slot on a member's page). Each person picks
-- their own from the phone app. widget_config holds type-specific settings,
-- e.g. { "label": "Trip to Jasper", "date": "2027-03-14" } for a countdown, or
-- { "text": "..." } for a note.
alter table public.members
  add column if not exists widget_type text not null default 'none',
  add column if not exists widget_config jsonb not null default '{}'::jsonb;
