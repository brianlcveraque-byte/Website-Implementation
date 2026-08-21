import { nextSessionDate as nextSession, type SessionRule } from "./session-schedule";

// The HRIS funnel.
//
// Shape mirrors the succession funnel deliberately — free thing for an email,
// then a priced ladder — because two funnels behaving differently is two things
// to maintain and two things for a visitor to learn.
//
//   free    → sandbox access to the working HRIS + a live 2-hour session
//   ₱1,000  → half-day HR systems workshop
//   ₱20,000 → we help you build your own instance
//   ₱75,000 → we build and hand over yours
//   inquiry → HR consulting
//
// WHY A SANDBOX RATHER THAN A HOSTED FREE TIER: the HRIS has no multi-tenancy —
// 80 Prisma models and not one organization or tenant column. One deployment
// serves exactly one organization, so a self-serve free tier would mean
// provisioning a database and a deployment per signup, by hand. The sandbox
// demonstrates the real system without that. Real multi-tenancy is the
// prerequisite for anything else, and it is not a landing-page problem.

export const HRIS_URL = "https://hris.brianlc-veraque.workers.dev";

/**
 * What the free tier includes, and what it does not.
 *
 * The split is deliberate. Free gets the *operational* half — the daily grind
 * of leave forms and timesheets, which is miserable in spreadsheets and which
 * nobody hires a consultant to fix. Paid keeps the *strategic* half, which is
 * the consulting practice itself: competency frameworks, succession,
 * performance systems.
 *
 * Learning Management is free because Onboarding depends on it — the journey
 * enrols new hires in an orientation course and reads requiredCourseIds off each
 * checkpoint, so free Onboarding without LMS would render a broken journey. It
 * is a defensible giveaway anyway: the LMS is plumbing for courses, while what
 * gets sold is the facilitation and the content that goes in it.
 *
 * The commercial logic: using the free half means typing your entire workforce
 * into the 201 File. Once several hundred employee records are in there,
 * competency assessment and succession planning are a toggle away, and the data
 * they need is already sitting in the database.
 */
export const FREE_MODULES = [
  ["Dashboard", "Role-aware landing views — org-wide for leadership, team-scoped for supervisors, personal for staff."],
  ["201 File", "The employee master database: personal and employment records, position history, credentials, documents."],
  ["Leave System", "Applications, approval routing, and an append-only balance ledger where every grant, accrual and deduction is a transaction."],
  ["Daily Time Record", "Attendance and timesheets, with the summaries government reporting asks for."],
  ["Onboarding & Orientation", "New-hire journeys with a task checklist, 30/60/90 checkpoints, and a buddy assigned."],
  ["Learning Management", "Courses, enrolments and completion tracking — what the onboarding journey enrols new hires into."],
] as const satisfies readonly (readonly [string, string])[];

export const PAID_MODULES = [
  ["Competency Assessment", "Competency profiles per position, assessed against required levels, with the gap as the development agenda."],
  ["Succession Management", "Criticality scoring, successor readiness bands, and bench depth across every position."],
  ["Performance Management", "Review cycles where supervisor ratings are the system of record and self-ratings sit beside them."],
  ["Recruitment", "Job postings and an applicant pipeline, with one-click conversion into a 201 file."],
  ["Training Calendar", "Training needs, scheduled sessions, and attendance."],
  ["Employee Engagement", "Pulse surveys and engagement reporting."],
] as const satisfies readonly (readonly [string, string])[];

// The free 2-hour session. Offset from the succession seat's Thursday so the
// two never fall in the same week — one person delivers both.
export const HRIS_SESSION_RULE: SessionRule = {
  anchorISO: "2026-08-25",
  intervalDays: 14,
  timeLabel: "6:00–8:00 PM (PHT)",
  weekdayLabel: "Tuesday",
  cadenceLabel: "Every other Tuesday",
};

export function nextHrisSession(from: Date = new Date()): Date {
  return nextSession(HRIS_SESSION_RULE, from);
}

export type HrisTier = "workshop" | "diy-system" | "done-for-you" | "consulting";

export type HrisPath = {
  id: HrisTier;
  eyebrow: string;
  name: string;
  price: number | null;
  priceNote: string;
  tagline: string;
  includes: string[];
  bestWhen: string;
  cta: string;
  photo: string;
  /** Tailwind classes written out in full — the scanner cannot see composed strings. */
  accent: { bar: string; badge: string; button: string; ring: string };
  matchingService: string;
};

export const HRIS_PATHS: HrisPath[] = [
  {
    id: "workshop",
    eyebrow: "Go deeper",
    name: "HR Systems Workshop",
    price: 1000,
    priceNote: "per seat · half-day live",
    tagline:
      "The comprehensive session: how the pieces of an HR system fit together, and what order to build them in.",
    includes: [
      "Half a day live online, covering 201 files, competencies, performance and succession as one connected system",
      "How to sequence a rollout so each module has the data the next one needs",
      "The failure modes that get HR systems abandoned in year two",
      "The recording and the slide pack afterwards",
    ],
    bestWhen: "The free session left you wanting the whole picture rather than one module.",
    cta: "Book a seat",
    photo: "/photos/facilitation-workshop.jpg",
    accent: {
      bar: "from-emerald-400 to-teal-500",
      badge: "bg-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-500",
      ring: "border-emerald-500 ring-emerald-200",
    },
    matchingService: "Human Resource Management and Development",
  },
  {
    id: "diy-system",
    eyebrow: "Build it yourself",
    name: "HRIS — guided self-build",
    price: 20000,
    priceNote: "one-time, your team implements",
    tagline: "We stand the system up with you, and coach your people through configuring it.",
    includes: [
      "Your own instance deployed, with every module enabled",
      "Working sessions configuring positions, competencies and leave rules against your actual structure",
      "Data migration guidance for getting your existing 201 files in",
      "Email support through the rollout",
    ],
    bestWhen: "You have someone internal who will own the system and wants to understand it properly.",
    cta: "Get the system",
    photo: "/photos/open-office.jpg",
    accent: {
      bar: "from-sky-400 to-blue-600",
      badge: "bg-blue-600",
      button: "bg-blue-600 hover:bg-blue-500",
      ring: "border-blue-500 ring-blue-200",
    },
    matchingService: "Human Resource Management and Development",
  },
  {
    id: "done-for-you",
    eyebrow: "Have it built for you",
    name: "HRIS — built and handed over",
    price: 75000,
    priceNote: "one-time, configured to your organization",
    tagline: "We configure the whole system against your plantilla and hand it over working.",
    includes: [
      "Every module configured to your positions, salary grades and approval routing",
      "Your existing employee records migrated in",
      "A competency framework built against your actual job descriptions",
      "Training for your HR team, and a handover so they run it without us",
    ],
    bestWhen: "You want it working now, without spending your team's time building it.",
    cta: "Have it built",
    photo: "/photos/business-meeting.jpg",
    accent: {
      bar: "from-violet-500 to-purple-600",
      badge: "bg-violet-600",
      button: "bg-violet-600 hover:bg-violet-500",
      ring: "border-violet-500 ring-violet-200",
    },
    matchingService: "Human Resource Management and Development",
  },
  {
    id: "consulting",
    eyebrow: "Bring us in",
    name: "HR consulting engagement",
    price: null,
    priceNote: "scoped per organization",
    tagline:
      "The system is a tool. This is the work of deciding what it should encode in the first place.",
    includes: [
      "Organizational review: structure, staffing patterns, and where the real constraints sit",
      "A competency framework and job descriptions built from scratch where none exist",
      "Performance and rewards design that survives contact with your culture",
      "Advisory through implementation, not a report handed over at the door",
    ],
    bestWhen: "The problem is not which software to use — it is what your HR system should say.",
    cta: "Discuss an engagement",
    photo: "/photos/corporate-tower.jpg",
    accent: {
      bar: "from-amber-400 to-orange-500",
      badge: "bg-amber-600",
      button: "bg-amber-600 hover:bg-amber-500",
      ring: "border-amber-500 ring-amber-200",
    },
    matchingService: "Human Resource Management and Development",
  },
];

/** ₱0 shows as "Free", a null price as "By inquiry". */
export function formatHrisPrice(price: number | null): string {
  if (price === null) return "By inquiry";
  return price === 0 ? "Free" : `₱${price.toLocaleString()}`;
}
