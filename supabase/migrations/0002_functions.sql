-- Trigger functions, triggers, and RPCs. See TECH_DESIGN.md §3 and §7.

-- ── Role helpers (security definer so they can read app_users regardless of
--    the caller's own RLS visibility — used inside policies below). ──
create or replace function current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from app_users where id = auth.uid();
$$;

create or replace function current_user_active()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(active, false) from app_users where id = auth.uid();
$$;

-- ── Prevent self-escalation: only an owner may change role/active on app_users. ──
create or replace function guard_app_users_role_change()
returns trigger
language plpgsql
as $$
begin
  if (new.role is distinct from old.role or new.active is distinct from old.active)
     and current_user_role() <> 'owner' then
    raise exception 'Only an owner can change role or active status';
  end if;
  return new;
end;
$$;

create trigger trg_guard_app_users_role_change
before update on app_users
for each row execute function guard_app_users_role_change();

-- ── Bump opportunities.last_activity_at on every update, so the "stale
--    opportunity" dashboard flag (SPEC.md §9 rule 2) has something to key off. ──
create or replace function bump_opportunity_activity()
returns trigger
language plpgsql
as $$
begin
  new.last_activity_at = now();
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_opportunities_bump_activity
before update on opportunities
for each row execute function bump_opportunity_activity();

-- ── Keep projects.completion_pct derived from its milestones (SPEC.md §9 rule 5). ──
create or replace function recalc_project_completion()
returns trigger
language plpgsql
as $$
declare
  v_project_id uuid;
  v_avg numeric;
begin
  v_project_id := coalesce(new.project_id, old.project_id);
  select coalesce(avg(completion_pct), 0) into v_avg from milestones where project_id = v_project_id;
  update projects set completion_pct = round(v_avg), updated_at = now() where id = v_project_id;
  return null;
end;
$$;

create trigger trg_milestones_recalc_completion
after insert or update or delete on milestones
for each row execute function recalc_project_completion();

-- ── RPC: convert a won opportunity into a project without re-entering
--    client/contact data (SPEC.md §9 rule 4). ──
create or replace function convert_opportunity_to_project(p_opportunity_id uuid)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_opp opportunities%rowtype;
  v_project_id uuid;
begin
  select * into v_opp from opportunities where id = p_opportunity_id;
  if not found then
    raise exception 'Opportunity not found';
  end if;

  insert into projects (
    name, client_id, opportunity_id, service_id, project_manager_id,
    contract_amount, currency, created_by, updated_by
  ) values (
    v_opp.title, v_opp.client_id, v_opp.id, v_opp.service_id, v_opp.owner_id,
    v_opp.estimated_value, v_opp.currency, auth.uid(), auth.uid()
  )
  returning id into v_project_id;

  update opportunities set stage = 'won' where id = p_opportunity_id;

  insert into opportunity_stage_history (opportunity_id, from_stage, to_stage, changed_by, note)
  values (p_opportunity_id, v_opp.stage, 'won', auth.uid(), 'Converted to project ' || v_project_id);

  return v_project_id;
end;
$$;

-- ── RPC: record a payment and roll the invoice status forward
--    (SPEC.md §9 rule 6). Keeps the two writes atomic. ──
create or replace function record_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_payment_date date,
  p_method text default null,
  p_receipt_link text default null,
  p_created_by uuid default null
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_payment_id uuid;
  v_invoice_amount numeric;
  v_total_paid numeric;
begin
  if p_amount <= 0 then
    raise exception 'Payment amount must be positive';
  end if;

  insert into payments (invoice_id, payment_date, amount, method, receipt_link, created_by)
  values (p_invoice_id, p_payment_date, p_amount, p_method, p_receipt_link, p_created_by)
  returning id into v_payment_id;

  select amount into v_invoice_amount from invoices where id = p_invoice_id;
  select coalesce(sum(amount), 0) into v_total_paid from payments where invoice_id = p_invoice_id;

  update invoices
  set status = case
        when v_total_paid >= v_invoice_amount then 'paid'
        when v_total_paid > 0 then 'partially_paid'
        else status
      end,
      updated_at = now()
  where id = p_invoice_id;

  return v_payment_id;
end;
$$;
