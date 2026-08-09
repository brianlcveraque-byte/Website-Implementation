-- Schedules the daily-digest Edge Function (supabase/functions/daily-digest)
-- to run every morning. See README.md "Email digest setup" for the full
-- setup sequence — this migration is the LAST step, after:
--   1. The daily-digest function is deployed
--   2. RESEND_API_KEY is set as a function secret
--   3. A Vault secret named 'service_role_key' holding your service role
--      key has been created (Project Settings -> Vault, or the SQL below)
--
-- Do NOT put the actual service role key value in this file — it goes in
-- Vault via the dashboard (or a one-off SQL statement you run yourself and
-- never commit), specifically so it never ends up in git history.
--
--   select vault.create_secret('<your-service-role-key>', 'service_role_key');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- The project URL itself isn't a secret (it's already public in the app's
-- client bundle) so it's fine to reference directly here — only the service
-- role key needs to stay out of git via Vault.
select cron.schedule(
  'daily-digest',
  '0 0 * * *', -- 00:00 UTC = 08:00 Asia/Manila, every day
  $$
  select net.http_post(
    url := 'https://phhmdiibbvmtvjgelaaj.supabase.co/functions/v1/daily-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
