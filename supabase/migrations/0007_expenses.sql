-- Business expenses, so the dashboard can show real net profit (revenue
-- from payments minus expenses) instead of the more abstract weighted
-- pipeline figure. Same access pattern as invoices/payments — core team
-- financial data, not visible to temp consultants.

create table expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null default 'other' check (category in (
    'subcontractor', 'tools_and_subscriptions', 'travel', 'office', 'marketing', 'taxes_and_fees', 'other'
  )),
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'PHP',
  expense_date date not null default current_date,
  notes text,
  receipt_link text,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now()
);

alter table expenses enable row level security;

create policy "expenses_core_full_access" on expenses for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));
