-- Marketing/transactional email automation.
--
-- Design: an idempotent outbox. Rather than firing an email from a database
-- trigger (which can double-send on retry and is hard to debug), a cron job
-- polls every 5 minutes for records that have no matching email_log row yet,
-- sends, then logs. If a send fails, the next run retries automatically; if
-- it succeeded, the log row prevents a duplicate.
--
-- Prerequisites (same as the daily digest, see README §5):
--   - marketing-emails Edge Function deployed
--   - RESEND_API_KEY set as a function secret
--   - vault secret 'service_role_key' exists
--
-- NOTE: emails will not actually reach anyone except the Resend account
-- owner's own address until a sending domain is verified in Resend.

create table email_log (
  id uuid primary key default gen_random_uuid(),
  email_type text not null check (email_type in (
    'inquiry_ack', 'newsletter_welcome', 'toolkit_followup'
  )),
  recipient text not null,
  -- The row this email was sent about, so we can check "already sent?" without
  -- relying on the recipient address alone (someone may inquire twice).
  related_table text not null,
  related_id uuid not null,
  provider_response text,
  success boolean not null default true,
  sent_at timestamptz not null default now(),
  unique (email_type, related_table, related_id)
);

alter table email_log enable row level security;

-- Read-only for the core team; the Edge Function writes via the service role,
-- which bypasses RLS entirely.
create policy "email_log_core_read" on email_log for select
  using (current_user_role() in ('owner','core_team'));

create index email_log_lookup_idx on email_log (related_table, related_id, email_type);

-- Poll every 5 minutes. Inquiry acknowledgements feel near-instant at this
-- cadence, and it stays far below any rate limit.
select cron.schedule(
  'marketing-emails',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://phhmdiibbvmtvjgelaaj.supabase.co/functions/v1/marketing-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
