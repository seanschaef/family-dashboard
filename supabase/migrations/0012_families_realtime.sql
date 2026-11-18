-- Let family changes (name, pet, hub layout) propagate live, so editing them on
-- a phone updates an already-open wall without a reload.
alter publication supabase_realtime add table public.families;
