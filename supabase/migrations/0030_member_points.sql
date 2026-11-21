-- Lifetime points per member, summed in the database. The app used to download
-- every chore_log ever and add them up, which silently breaks past PostgREST's
-- 1,000-row cap. Now the app only loads recent logs (today / this week) and
-- reads balances from here.
--
-- security_invoker: the view runs as the signed-in user, so the RLS on
-- chore_logs and reward_redemptions still limits it to their own family.
create or replace view public.member_points
with (security_invoker = on) as
select
  member_key,
  sum(earned)::int as earned,
  sum(spent)::int as spent,
  (sum(earned) - sum(spent))::int as balance
from (
  select member_key, points as earned, 0 as spent from public.chore_logs where member_key is not null
  union all
  select member_key, 0, cost from public.reward_redemptions where member_key is not null
) t
group by member_key;

revoke all on public.member_points from anon;
grant select on public.member_points to authenticated;
