-- Celebration settings for the wall (Settings › The Wall › Celebrations).
--   celebrations_on         play a celebration when someone ticks a chore
--   celebrate_no_points     also for chores worth no points (a cheer instead)
--   celebration_styles_off  styles left out of the random pick
--   celebration_preview(_at) "Play on the wall": the wall plays that style
--                           once when _at changes (style or 'any')
alter table public.wall_settings
  add column if not exists celebrations_on boolean not null default true,
  add column if not exists celebrate_no_points boolean not null default true,
  add column if not exists celebration_styles_off text[] not null default '{}',
  add column if not exists celebration_preview text,
  add column if not exists celebration_preview_at timestamptz;
