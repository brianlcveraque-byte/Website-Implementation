/**
 * The monitoring vocabulary — four statuses, because that is what is actually used.
 *
 * The database allows nine task statuses (not_started, in_progress, for_review,
 * awaiting_client, completed, deferred, cancelled…) and the projects table
 * allows nine of its own. The tracker this replaces uses four, across 132 rows:
 *
 *     Completed 70 · Not Yet Started 35 · Ongoing 20 · On-hold 4
 *
 * Nine options where four are used is not flexibility, it is a decision the
 * software makes someone take every time they add a row. So the screens offer
 * four, and this module is the only place that knows how those four map onto
 * what the database stores.
 *
 * NOTHING IS MIGRATED. The extra statuses stay legal and any row already
 * carrying one keeps it — `fromDb` folds them into the nearest of the four for
 * display, so an existing task written by the old screens still reads sensibly
 * rather than appearing blank.
 */

export const MONITORING_STATUSES = ["not_started", "in_progress", "on_hold", "completed"] as const;

export type MonitoringStatus = (typeof MONITORING_STATUSES)[number];

export const STATUS_LABEL: Record<MonitoringStatus, string> = {
  not_started: "Not started",
  in_progress: "Ongoing",
  on_hold: "On hold",
  completed: "Completed",
};

/**
 * What each of the four writes to the database.
 *
 * "on_hold" is stored as `deferred` because the tasks table has no on_hold —
 * only the projects table does. One word for the person, whichever word the
 * column happens to accept.
 */
export const STATUS_TO_DB: Record<MonitoringStatus, string> = {
  not_started: "not_started",
  in_progress: "in_progress",
  on_hold: "deferred",
  completed: "completed",
};

/** Anything the database might hold, folded into the four. */
export function fromDb(status: string | null | undefined): MonitoringStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "deferred":
    case "cancelled":
      return "on_hold";
    case "in_progress":
    case "for_review":
    case "awaiting_client":
      return "in_progress";
    default:
      return "not_started";
  }
}

/** Clicking a status moves it to the next one, in the order work actually goes. */
export function nextStatus(current: MonitoringStatus): MonitoringStatus {
  const order: MonitoringStatus[] = ["not_started", "in_progress", "completed", "on_hold"];
  return order[(order.indexOf(current) + 1) % order.length];
}

export const STATUS_CLASS: Record<MonitoringStatus, string> = {
  not_started: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  in_progress: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  on_hold: "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900",
  completed: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
};

/** Open work first; finished work sinks. Within a group, newest first. */
export function statusRank(status: MonitoringStatus): number {
  return { in_progress: 0, not_started: 1, on_hold: 2, completed: 3 }[status];
}
