-- Row-Level Security. Authorization matrix: TECH_DESIGN.md §7.
-- Every table is deny-by-default once RLS is enabled; only the policies below grant access.

alter table app_users enable row level security;
alter table clients enable row level security;
alter table contacts enable row level security;
alter table services enable row level security;
alter table opportunities enable row level security;
alter table opportunity_stage_history enable row level security;
alter table projects enable row level security;
alter table milestones enable row level security;
alter table tasks enable row level security;
alter table consultants enable row level security;
alter table project_assignments enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table documents enable row level security;
alter table public_inquiries enable row level security;

-- ── app_users ──
-- Owner/core see everyone (needed for assignee pickers); everyone sees themselves.
create policy "app_users_select" on app_users for select
  using (current_user_role() in ('owner','core_team') or id = auth.uid());

-- Self-registration: a new signup can insert exactly one row for themselves,
-- and it must start inactive with the lowest-privilege role — an owner has to
-- promote them from /app/settings. This is what stops a signup from just
-- inserting role='owner' directly.
create policy "app_users_self_insert" on app_users for insert
  to authenticated
  with check (id = auth.uid() and role = 'temp_consultant' and active = false);

-- Anyone can update their own row (e.g. full_name); an owner can update any
-- row. The guard_app_users_role_change trigger stops a non-owner from
-- sneaking a role/active change through this policy.
create policy "app_users_update" on app_users for update
  using (id = auth.uid() or current_user_role() = 'owner')
  with check (id = auth.uid() or current_user_role() = 'owner');

-- ── services ──
create policy "services_read_all_authenticated" on services for select
  to authenticated
  using (true);

create policy "services_manage" on services for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

-- ── clients ──
create policy "clients_core_full_access" on clients for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

create policy "clients_temp_view_assigned" on clients for select
  using (
    current_user_role() = 'temp_consultant' and exists (
      select 1 from projects pr
      join project_assignments pa on pa.project_id = pr.id
      left join consultants c on c.id = pa.consultant_id
      where pr.client_id = clients.id
        and (pa.user_id = auth.uid() or c.linked_user_id = auth.uid())
    )
  );

-- ── contacts ──
create policy "contacts_core_full_access" on contacts for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

-- ── opportunities / stage history: business-development data, core team only ──
create policy "opportunities_core_full_access" on opportunities for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

create policy "opportunity_stage_history_core_full_access" on opportunity_stage_history for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

-- ── projects ──
create policy "projects_core_full_access" on projects for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

create policy "projects_temp_view_assigned" on projects for select
  using (
    current_user_role() = 'temp_consultant' and exists (
      select 1 from project_assignments pa
      left join consultants c on c.id = pa.consultant_id
      where pa.project_id = projects.id
        and (pa.user_id = auth.uid() or c.linked_user_id = auth.uid())
    )
  );

-- ── milestones ──
create policy "milestones_core_full_access" on milestones for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

create policy "milestones_temp_view_assigned" on milestones for select
  using (
    current_user_role() = 'temp_consultant' and exists (
      select 1 from project_assignments pa
      left join consultants c on c.id = pa.consultant_id
      where pa.project_id = milestones.project_id
        and (pa.user_id = auth.uid() or c.linked_user_id = auth.uid())
    )
  );

-- ── tasks: temp consultants get read/update on exactly their own tasks ──
create policy "tasks_core_full_access" on tasks for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

create policy "tasks_temp_select_own" on tasks for select
  using (current_user_role() = 'temp_consultant' and assigned_to = auth.uid());

create policy "tasks_temp_update_own" on tasks for update
  using (current_user_role() = 'temp_consultant' and assigned_to = auth.uid())
  with check (current_user_role() = 'temp_consultant' and assigned_to = auth.uid());

-- ── consultants: a temp consultant may see only their own linked profile.
--    (Row-level is sufficient here — seeing your own rate isn't a leak, and
--    this policy makes it impossible to query anyone else's row, so there's
--    no column-level rate/notes exposure to worry about.) ──
create policy "consultants_core_full_access" on consultants for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

create policy "consultants_temp_view_own" on consultants for select
  using (current_user_role() = 'temp_consultant' and linked_user_id = auth.uid());

-- ── project_assignments ──
create policy "project_assignments_core_full_access" on project_assignments for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

create policy "project_assignments_temp_view_own" on project_assignments for select
  using (
    current_user_role() = 'temp_consultant' and (
      user_id = auth.uid()
      or consultant_id in (select id from consultants where linked_user_id = auth.uid())
    )
  );

-- ── invoices / payments: financial data, core team only per SPEC.md §6 ──
create policy "invoices_core_full_access" on invoices for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

create policy "payments_core_full_access" on payments for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

-- ── documents ──
create policy "documents_core_full_access" on documents for all
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));

create policy "documents_temp_view_assigned_project_docs" on documents for select
  using (
    current_user_role() = 'temp_consultant'
    and linked_entity_type = 'project'
    and exists (
      select 1 from project_assignments pa
      left join consultants c on c.id = pa.consultant_id
      where pa.project_id = documents.linked_entity_id
        and (pa.user_id = auth.uid() or c.linked_user_id = auth.uid())
    )
  );

-- ── public_inquiries: the public landing page writes here anonymously;
--    only core team can read/triage them. ──
create policy "public_inquiries_anon_insert" on public_inquiries for insert
  to anon, authenticated
  with check (true);

create policy "public_inquiries_core_select" on public_inquiries for select
  using (current_user_role() in ('owner','core_team'));

create policy "public_inquiries_core_update" on public_inquiries for update
  using (current_user_role() in ('owner','core_team'))
  with check (current_user_role() in ('owner','core_team'));
