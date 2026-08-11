// Hand-written to match /supabase/migrations/0001_schema.sql.
// If the schema changes, update this file in the same commit.

export type UserRole = "owner" | "core_team" | "temp_consultant";

export type ClientStatus =
  | "prospect"
  | "active_client"
  | "previous_client"
  | "strategic_partner"
  | "dormant"
  | "do_not_pursue";

export type OpportunityStage =
  | "new_inquiry"
  | "initial_contact"
  | "qualification"
  | "discovery"
  | "preparing_proposal"
  | "proposal_submitted"
  | "under_evaluation"
  | "negotiation"
  | "awaiting_approval"
  | "won"
  | "lost"
  | "on_hold";

export type ProjectStatus =
  | "mobilization"
  | "in_progress"
  | "awaiting_client_input"
  | "under_client_review"
  | "revision"
  | "on_hold"
  | "completed"
  | "closed"
  | "cancelled";

export type HealthStatus = "green" | "amber" | "red" | "gray";

export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "for_review"
  | "awaiting_client"
  | "completed"
  | "deferred"
  | "cancelled";

export type TaskStatus = MilestoneStatus;
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type InvoiceStatus =
  | "draft"
  | "for_submission"
  | "submitted"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type DocumentEntityType =
  | "client"
  | "opportunity"
  | "project"
  | "task"
  | "consultant"
  | "invoice";

export type InquiryStatus = "new" | "converted" | "spam";

export type ExpenseCategory =
  | "subcontractor"
  | "tools_and_subscriptions"
  | "travel"
  | "office"
  | "marketing"
  | "taxes_and_fees"
  | "other";

export interface AppUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  org_name: string;
  org_type: string | null;
  sector: string | null;
  address: string | null;
  website: string | null;
  preferred_channel: string | null;
  source: string | null;
  relationship_owner: string | null;
  status: ClientStatus;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  client_id: string;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  active: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  client_id: string;
  contact_id: string | null;
  service_id: string | null;
  description: string | null;
  source: string | null;
  date_received: string;
  estimated_value: number | null;
  currency: string;
  probability_pct: number;
  weighted_value: number | null;
  expected_decision_date: string | null;
  expected_start_date: string | null;
  proposal_deadline: string | null;
  owner_id: string;
  stage: OpportunityStage;
  next_action: string | null;
  next_action_due: string | null;
  proposal_file_link: string | null;
  proposal_status: string | null;
  proposal_submitted_date: string | null;
  competitors: string | null;
  client_budget: number | null;
  terms_of_reference_link: string | null;
  notes: string | null;
  reason_won: string | null;
  reason_lost: string | null;
  reason_delayed: string | null;
  last_activity_at: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityStageHistory {
  id: string;
  opportunity_id: string;
  from_stage: string | null;
  to_stage: string;
  changed_by: string | null;
  changed_at: string;
  note: string | null;
}

export interface Project {
  id: string;
  name: string;
  client_id: string;
  opportunity_id: string | null;
  contract_reference: string | null;
  description: string | null;
  service_id: string | null;
  project_manager_id: string | null;
  start_date: string | null;
  end_date: string | null;
  contract_amount: number | null;
  currency: string;
  status: ProjectStatus;
  health_status: HealthStatus;
  completion_pct: number;
  notes: string | null;
  closeout_notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  responsible_id: string | null;
  planned_start: string | null;
  due_date: string | null;
  actual_completion_date: string | null;
  status: MilestoneStatus;
  completion_pct: number;
  client_acceptance_required: boolean;
  client_acceptance_date: string | null;
  billing_trigger: boolean;
  comments: string | null;
}

export interface Task {
  id: string;
  project_id: string;
  milestone_id: string | null;
  title: string;
  assigned_to: string | null;
  priority: TaskPriority;
  start_date: string | null;
  due_date: string | null;
  status: TaskStatus;
  estimated_effort: number | null;
  actual_effort: number | null;
  comments: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consultant {
  id: string;
  full_name: string;
  title: string | null;
  expertise: string[] | null;
  service_categories: string[] | null;
  contact_email: string | null;
  contact_phone: string | null;
  rate: number | null;
  rate_currency: string | null;
  availability: string | null;
  location: string | null;
  travel_availability: boolean;
  performance_notes: string | null;
  conflict_of_interest_notes: string | null;
  active: boolean;
  linked_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  consultant_id: string | null;
  user_id: string | null;
  role_on_project: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}

export interface Invoice {
  id: string;
  invoice_ref: string;
  client_id: string;
  project_id: string;
  milestone_id: string | null;
  invoice_date: string;
  due_date: string | null;
  amount: number;
  currency: string;
  tax_note: string | null;
  status: InvoiceStatus;
  invoice_file_link: string | null;
  follow_up_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  method: string | null;
  receipt_link: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  expense_date: string;
  notes: string | null;
  receipt_link: string | null;
  created_by: string | null;
  created_at: string;
}

export interface AppDocument {
  id: string;
  label: string;
  category: string | null;
  storage_path: string | null;
  external_link: string | null;
  linked_entity_type: DocumentEntityType;
  linked_entity_id: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface PublicInquiry {
  id: string;
  name: string;
  organization: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  service_interest: string | null;
  submitted_at: string;
  opportunity_id: string | null;
  status: InquiryStatus;
}
