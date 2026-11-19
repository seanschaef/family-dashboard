-- Spending points on rewards. A person's balance is every point they've
-- earned (chore_logs.points) minus what they've redeemed here. Redemptions
-- are approved by a parent (approved_by = the parent's member key).
create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default public.auth_family_id() references public.families (id) on delete cascade,
  member_key text not null,             -- who spent the points
  reward_id uuid references public.rewards (id) on delete set null,
  title text not null,                  -- copied, so history survives deleting the reward
  cost int not null check (cost >= 0),
  approved_by text,                     -- parent's member key
  created_at timestamptz not null default now()
);
create index if not exists reward_redemptions_family_idx on public.reward_redemptions (family_id, created_at desc);

alter table public.reward_redemptions enable row level security;
alter table public.reward_redemptions force row level security;

drop policy if exists reward_redemptions_all on public.reward_redemptions;
create policy reward_redemptions_all on public.reward_redemptions
  for all using (family_id = public.auth_family_id())
  with check (family_id = public.auth_family_id());

alter publication supabase_realtime add table public.reward_redemptions;
