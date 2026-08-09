-- Strategnosis Growth and Delivery Hub — core schema (SPEC.md §4.1, TECH_DESIGN.md §3)
-- Run in order: 0001_schema.sql, 0002_rls.sql, 0003_functions.sql, 0004_storage.sql

create extension if not exists pgcrypto;

create table app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('owner','core_team','temp_consultant')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  org_type text,
  sector text,
  address text,
  website text,
  preferred_channel text,
  source text,
  relationship_owner uuid references app_users(id),
  status text not null default 'prospect'
    check (status in ('prospect','active_client','previous_client','strategic_partner','dormant','do_not_pursue')),
  notes text,
  created_by uuid references app_users(id),
  updated_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  position text,
  email text,
  phone text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  description text,
  active boolean not null default true
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_id uuid not null references clients(id),
  contact_id uuid references contacts(id),
  service_id uuid references services(id),
  description text,
  source text,
  date_received date not null default current_date,
  estimated_value numeric(14,2),
  currency text not null default 'PHP',
  probability_pct integer not null default 10 check (probability_pct between 0 and 100),
  weighted_value numeric(14,2) generated always as
    (coalesce(estimated_value,0) * probability_pct / 100.0) stored,
  expected_decision_date date,
  expected_start_date date,
  proposal_deadline date,
  owner_id uuid not null references app_users(id),
  stage text not null default 'new_inquiry' check (stage in (
    'new_inquiry','initial_contact','qualification','discovery','preparing_proposal',
    'proposal_submitted','under_evaluation','negotiation','awaiting_approval',
    'won','lost','on_hold')),
  next_action text,
  next_action_due date,
  proposal_file_link text,
  proposal_status text,
  proposal_submitted_date date,
  competitors text,
  client_budget numeric(14,2),
  terms_of_reference_link text,
  notes text,
  reason_won text,
  reason_lost text,
  reason_delayed text,
  last_activity_at timestamptz not null default now(),
  created_by uuid references app_users(id),
  updated_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table opportunity_stage_history (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_by uuid references app_users(id),
  changed_at timestamptz not null default now(),
  note text
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_id uuid not null references clients(id),
  opportunity_id uuid references opportunities(id),
  contract_reference text,
  description text,
  service_id uuid references services(id),
  project_manager_id uuid references app_users(id),
  start_date date,
  end_date date,
  contract_amount numeric(14,2),
  currency text not null default 'PHP',
  status text not null default 'mobilization' check (status in (
    'mobilization','in_progress','awaiting_client_input','under_client_review',
    'revision','on_hold','completed','closed','cancelled')),
  health_status text not null default 'gray' check (health_status in ('green','amber','red','gray')),
  completion_pct integer not null default 0 check (completion_pct between 0 and 100),
  notes text,
  closeout_notes text,
  created_by uuid references app_users(id),
  updated_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  responsible_id uuid references app_users(id),
  planned_start date,
  due_date date,
  actual_completion_date date,
  status text not null default 'not_started' check (status in (
    'not_started','in_progress','for_review','awaiting_client','completed','deferred','cancelled')),
  completion_pct integer not null default 0 check (completion_pct between 0 and 100),
  client_acceptance_required boolean not null default false,
  client_acceptance_date date,
  billing_trigger boolean not null default false,
  comments text
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  milestone_id uuid references milestones(id) on delete set null,
  title text not null,
  assigned_to uuid references app_users(id),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  start_date date,
  due_date date,
  status text not null default 'not_started' check (status in (
    'not_started','in_progress','for_review','awaiting_client','completed','deferred','cancelled')),
  estimated_effort numeric(6,1),
  actual_effort numeric(6,1),
  comments text,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table consultants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text,
  expertise text[],
  service_categories text[],
  contact_email text,
  contact_phone text,
  rate numeric(12,2),
  rate_currency text default 'PHP',
  availability text,
  location text,
  travel_availability boolean not null default false,
  performance_notes text,
  conflict_of_interest_notes text,
  active boolean not null default true,
  linked_user_id uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  consultant_id uuid references consultants(id) on delete cascade,
  user_id uuid references app_users(id) on delete cascade,
  role_on_project text,
  start_date date,
  end_date date,
  notes text,
  check (consultant_id is not null or user_id is not null)
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_ref text not null,
  client_id uuid not null references clients(id),
  project_id uuid not null references projects(id),
  milestone_id uuid references milestones(id),
  invoice_date date not null default current_date,
  due_date date,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'PHP',
  tax_note text,
  status text not null default 'draft' check (status in (
    'draft','for_submission','submitted','partially_paid','paid','overdue','cancelled')),
  invoice_file_link text,
  follow_up_notes text,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  payment_date date not null default current_date,
  amount numeric(14,2) not null check (amount > 0),
  method text,
  receipt_link text,
  notes text,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  category text,
  storage_path text,
  external_link text,
  linked_entity_type text not null check (linked_entity_type in (
    'client','opportunity','project','task','consultant','invoice')),
  linked_entity_id uuid not null,
  uploaded_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  check (storage_path is not null or external_link is not null)
);

create table public_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  email text not null,
  phone text,
  message text,
  service_interest text,
  submitted_at timestamptz not null default now(),
  opportunity_id uuid references opportunities(id),
  status text not null default 'new' check (status in ('new','converted','spam'))
);

create index on clients (status);
create index on opportunities (stage);
create index on opportunities (client_id);
create index on projects (client_id);
create index on projects (status);
create index on milestones (project_id);
create index on tasks (project_id);
create index on tasks (assigned_to);
create index on project_assignments (project_id);
create index on invoices (project_id);
create index on invoices (status);
create index on payments (invoice_id);
create index on documents (linked_entity_type, linked_entity_id);
