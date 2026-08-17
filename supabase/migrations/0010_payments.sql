-- Payments for the succession funnel's ₱500 live session.
--
-- Design: the browser never touches a PayMongo key. It calls the create-checkout
-- Edge Function, which holds the secret key, creates a Checkout Session, writes a
-- pending order, and hands back a hosted checkout URL to redirect to. PayMongo
-- then calls the paymongo-webhook function, which is the *only* thing allowed to
-- mark an order paid. A browser saying "I paid" is not evidence; the webhook is.
--
-- Amounts are stored in centavos, matching PayMongo's API, because storing money
-- as a decimal invites rounding arguments nobody can settle later.

create table orders (
  id uuid primary key default gen_random_uuid(),

  -- What was bought. Free text matching a FunnelPath.id in
  -- src/lib/succession-funnel.ts — the catalogue lives in the app, not here.
  tier text not null,
  -- Which dated session this seat is for. Null for products without a date.
  session_date date,

  -- Buyer. Collected before checkout so we can reach them even if payment fails.
  email text not null,
  name text,
  organization text,

  amount_centavos integer not null check (amount_centavos >= 0),
  currency text not null default 'PHP',

  -- PayMongo's checkout session id (cs_...). Unique so a replayed webhook cannot
  -- create a second order for the same session.
  checkout_session_id text unique,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'expired')),
  paid_at timestamptz,

  -- Whole webhook payload for the paid event, kept for dispute resolution. If a
  -- buyer ever contests a charge, the raw provider record is what settles it.
  provider_payload jsonb,

  created_at timestamptz not null default now()
);

alter table orders enable row level security;

-- No anon policies at all. The browser must not read or write this table
-- directly — both Edge Functions use the service role, which bypasses RLS.
-- Anyone able to insert here could fabricate a paid order.
create policy "orders_core_read" on orders for select
  using (current_user_role() in ('owner','core_team'));

create index orders_status_idx on orders (payment_status, created_at desc);
create index orders_session_idx on orders (session_date, payment_status);

-- Seat confirmation, sent by the webhook once payment actually clears.
alter table email_log drop constraint email_log_email_type_check;
alter table email_log add constraint email_log_email_type_check
  check (email_type in (
    'inquiry_ack',
    'newsletter_welcome',
    'toolkit_followup',
    'succession_workbook_delivery',
    'succession_nurture',
    'session_seat_confirmation'
  ));
