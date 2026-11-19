-- Pet chores: the pet's routine (walks, meals) is ordinary chores tagged
-- 'pet', shown in the pet window on the hub and earning points like any
-- chore. Replaces the separate pet_logs tracker (its table and history stay,
-- unused).
alter table public.chores
  add column if not exists tag text;

alter table public.chores drop constraint if exists chores_tag_check;
alter table public.chores add constraint chores_tag_check check (tag is null or tag in ('pet'));
