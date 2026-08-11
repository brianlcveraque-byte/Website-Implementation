-- Newsletter/insights signup capture. Storage only for now — no sending
-- pipeline is wired up yet (that's a separate, later decision: which
-- service to send through, how often, etc.). This just makes sure no
-- signups are lost while that gets decided.

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  subscribed_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

create policy "newsletter_anon_insert" on newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy "newsletter_core_select" on newsletter_subscribers for select
  using (current_user_role() in ('owner','core_team'));
