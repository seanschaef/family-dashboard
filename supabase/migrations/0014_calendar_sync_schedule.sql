-- Sync every family's calendars every 15 minutes (pg_cron + pg_net calling
-- the sync-calendars Edge Function).
--
-- The function accepts the scheduler by an x-cron-secret header. That secret
-- is generated here and lives only in the database vault; the function checks
-- it through check_cron_secret(), which only the service role can call.
--
-- One-time setup NOT in this file (values are per project; the anon key is a
-- public client key but kept out of the repo anyway):
--   select vault.create_secret('https://<ref>.supabase.co', 'project_url');
--   select vault.create_secret('<anon key>', 'anon_key');

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'calendar_sync_cron_secret') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'calendar_sync_cron_secret');
  end if;
end $$;

create or replace function public.check_cron_secret(s text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'calendar_sync_cron_secret' and decrypted_secret = s
  );
$$;
revoke execute on function public.check_cron_secret(text) from public, anon, authenticated;
grant execute on function public.check_cron_secret(text) to service_role;

-- (Re)create the job.
select cron.unschedule(jobid) from cron.job where jobname = 'sync-calendars-every-15-min';
select cron.schedule(
  'sync-calendars-every-15-min',
  '*/15 * * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/sync-calendars',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'calendar_sync_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $job$
);
