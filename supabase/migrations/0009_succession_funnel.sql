-- Lead capture for the succession planning funnel (/succession-planning).
--
-- Separate from newsletter_subscribers on purpose: subscribing to insights and
-- downloading a specific workbook are different intents, and conflating them
-- makes both lists worse. Someone who did both should appear in both.
--
-- NOTE ON THE GATE: the site is a static export, so the workbook itself sits at
-- a public URL under /downloads. The email is a courtesy gate, not access
-- control — anyone who has the direct link can fetch the file without leaving
-- an address. That is the accepted trade for not running a server; if the file
-- ever needs to be genuinely gated, it has to move to Supabase Storage behind a
-- signed URL issued by an Edge Function.

create table toolkit_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  organization text,
  -- Matches a Toolkit.slug in src/lib/toolkits.ts. Free text, not a foreign
  -- key — the catalogue lives in the app, not the database.
  toolkit_slug text not null,
  -- Which page or campaign produced the lead, e.g. 'succession-planning' or
  -- 'campaign/succession-planning'. Lets paid and organic traffic be told apart.
  source text,
  downloaded_at timestamptz not null default now(),
  -- Re-downloading the same workbook shouldn't create a second lead, and the
  -- email automation keys off this row, so a duplicate would mean a duplicate send.
  unique (email, toolkit_slug)
);

alter table toolkit_leads enable row level security;

-- Same posture as newsletter_subscribers: anyone may add themselves, only the
-- core team may read the list back.
create policy "toolkit_leads_anon_insert" on toolkit_leads for insert
  to anon, authenticated
  with check (true);

create policy "toolkit_leads_core_select" on toolkit_leads for select
  using (current_user_role() in ('owner','core_team'));

create index toolkit_leads_slug_idx on toolkit_leads (toolkit_slug, downloaded_at desc);

-- The funnel adds two email types: the delivery itself, and one nurture note
-- three days later pointing at the training and engagement tiers.
alter table email_log drop constraint email_log_email_type_check;
alter table email_log add constraint email_log_email_type_check
  check (email_type in (
    'inquiry_ack',
    'newsletter_welcome',
    'toolkit_followup',
    'succession_workbook_delivery',
    'succession_nurture'
  ));
