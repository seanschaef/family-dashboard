-- 'together' chores (one job anyone can pitch in on; everyone who ticks it
-- gets the points). The app shipped this mode without widening the check, so
-- saving a together chore failed with chores_shared_mode_check.
alter table public.chores drop constraint if exists chores_shared_mode_check;
alter table public.chores
  add constraint chores_shared_mode_check check (shared_mode in ('each', 'any', 'together'));
