export function formatCurrency(amount: number | null | undefined, currency = "PHP") {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

/** Days from today to the given date. Negative means overdue. */
export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function isOverdue(dateStr: string | null | undefined): boolean {
  const d = daysUntil(dateStr);
  return d !== null && d < 0;
}

export function isDueSoon(dateStr: string | null | undefined, withinDays = 7): boolean {
  const d = daysUntil(dateStr);
  return d !== null && d >= 0 && d <= withinDays;
}

export function titleCase(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const OPPORTUNITY_STAGES = [
  "new_inquiry",
  "initial_contact",
  "qualification",
  "discovery",
  "preparing_proposal",
  "proposal_submitted",
  "under_evaluation",
  "negotiation",
  "awaiting_approval",
  "won",
  "lost",
  "on_hold",
] as const;

export const CLIENT_STATUSES = [
  "prospect",
  "active_client",
  "previous_client",
  "strategic_partner",
  "dormant",
  "do_not_pursue",
] as const;

export const PROJECT_STATUSES = [
  "mobilization",
  "in_progress",
  "awaiting_client_input",
  "under_client_review",
  "revision",
  "on_hold",
  "completed",
  "closed",
  "cancelled",
] as const;

export const TASK_STATUSES = [
  "not_started",
  "in_progress",
  "for_review",
  "awaiting_client",
  "completed",
  "deferred",
  "cancelled",
] as const;

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const INVOICE_STATUSES = [
  "draft",
  "for_submission",
  "submitted",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
] as const;

/** Badge color classes keyed by the red/amber/green/gray scheme from SPEC.md. */
export function badgeTone(status: string): "green" | "amber" | "red" | "gray" | "blue" {
  const green = ["won", "active_client", "completed", "paid", "in_progress"];
  const amber = [
    "negotiation",
    "under_evaluation",
    "awaiting_approval",
    "for_review",
    "awaiting_client",
    "partially_paid",
    "revision",
    "under_client_review",
    "for_submission",
  ];
  const red = [
    "lost",
    "do_not_pursue",
    "cancelled",
    "overdue",
    "urgent",
    "high",
  ];
  if (green.includes(status)) return "green";
  if (amber.includes(status)) return "amber";
  if (red.includes(status)) return "red";
  if (["on_hold", "dormant", "draft", "not_started", "new_inquiry"].includes(status))
    return "gray";
  return "blue";
}
