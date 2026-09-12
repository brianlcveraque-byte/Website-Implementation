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

/* ─────────────────────────────────────────── Importing the spreadsheet ── */

/** The words the tracker actually uses, mapped to the four. */
const STATUS_FROM_TEXT: Record<string, MonitoringStatus> = {
  completed: "completed",
  complete: "completed",
  done: "completed",
  "not yet started": "not_started",
  "not started": "not_started",
  pending: "not_started",
  ongoing: "in_progress",
  "in progress": "in_progress",
  "on-hold": "on_hold",
  "on hold": "on_hold",
  hold: "on_hold",
};

export type ParsedRow = {
  project: string;
  status: MonitoringStatus;
  title: string;
  note: string | null;
};

/**
 * Parse rows pasted straight out of the tracker.
 *
 * Shaped to that sheet rather than to some tidy generic format, because the
 * point is that nobody has to reshape anything before pasting:
 *
 *     Project | Status | Task | Note
 *
 * The project column is CARRIED FORWARD. In the sheet it is a merged cell —
 * filled on the first row of a block and blank for every row beneath it — so a
 * parser that required it on every line would import three tasks and drop a
 * hundred and twenty-nine.
 *
 * Anything with no recognisable status is still imported, as not started. A row
 * silently discarded because its status was spelled differently is worse than a
 * row that needs one click to correct.
 */
export function parseTrackerPaste(text: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  let currentProject = "";

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;

    // Tabs when pasted from a spreadsheet; commas as a fallback for CSV.
    const cells = (line.includes("\t") ? line.split("\t") : line.split(",")).map((c) => c.trim());

    const [firstCell, statusCell, titleCell, ...rest] = cells;
    const recognised = STATUS_FROM_TEXT[(statusCell ?? "").toLowerCase()];

    // The header row.
    if (/^(focus projects|project)$/i.test(firstCell ?? "")) continue;

    /**
     * A PROJECT HEADING IS A COLUMN-A VALUE WITH A REAL STATUS BESIDE IT.
     *
     * Not simply "column A is filled in", which is the obvious rule and the
     * wrong one. In the real sheet column A also catches notes that overflowed
     * into it — "To message Ma'am Pabi.", "201 file", "applicant search" — and
     * treating every one of those as a new project produced EIGHT projects out
     * of a sheet that has three, silently, with the tasks scattered between
     * them. Those rows have an empty status column; the three real headings
     * (NIH, CSMC, Adventist Institutions) each carry one.
     */
    if (firstCell && recognised) {
      currentProject = firstCell;
    } else if (firstCell && !currentProject) {
      // Text in column A before any heading has been seen. Nothing else to
      // hang it on, so it is the project.
      currentProject = firstCell;
      continue;
    }

    if (!currentProject) continue;

    // A stray note in column A belongs to the current project as a task.
    const title = (titleCell || (firstCell && !recognised ? firstCell : "") || statusCell || "").trim();
    if (!title) continue;
    if (/^(status|remarks|task)$/i.test(title)) continue;

    rows.push({
      project: currentProject,
      status: recognised ?? "not_started",
      title,
      note: rest.filter(Boolean).join(" · ") || null,
    });
  }

  return rows;
}

/**
 * A colour per project, chosen from its name.
 *
 * Deterministic so a project keeps its colour between visits — the point is
 * being able to find the same block on the page tomorrow without reading it.
 */
export const PROJECT_ACCENTS = [
  { bar: "from-violet-500 to-fuchsia-500", soft: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300" },
  { bar: "from-emerald-500 to-teal-500", soft: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300" },
  { bar: "from-sky-500 to-indigo-500", soft: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-300" },
  { bar: "from-amber-500 to-orange-500", soft: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300" },
  { bar: "from-rose-500 to-pink-500", soft: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300" },
  { bar: "from-cyan-500 to-blue-500", soft: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300" },
];

export function accentFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PROJECT_ACCENTS[hash % PROJECT_ACCENTS.length];
}
