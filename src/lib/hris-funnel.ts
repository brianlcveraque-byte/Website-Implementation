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
// The free tier is a real workspace, not a demo. The HRIS is multi-tenant now:
// signing up creates an organization with its own isolated employee database,
// reached at its own subdomain, with Postgres row-level security enforcing the
// boundary rather than the application being trusted to remember. Nothing is
// provisioned by hand and nothing is shared with another organization.

export const HRIS_URL = "https://hris.strategnosis.com";

/**
 * Where a visitor creates their own workspace. No sales step in between.
 *
 * Signing up puts them on their own subdomain - acme.strategnosis.com - which
 * is why the HRIS had to leave workers.dev: a free certificate covers one
 * subdomain level, and workers.dev has no wildcard to give.
 */
export const HRIS_SIGNUP_URL = `${HRIS_URL}/signup`;

/**
 * What the free tier includes, and what it does not.
 *
 * The split is deliberate. Free gets the *operational* half — the daily grind
 * of leave forms and timesheets, which is miserable in spreadsheets and which
 * nobody hires a consultant to fix. Paid keeps the *strategic* half, which is
 * the consulting practice itself: competency frameworks, succession,
 * performance systems.
 *
 * The free tier is deliberately narrow: onboarding a new hire is the moment an
 * organization is most willing to try a new system, and it is self-contained
 * enough to prove value in one hire.
 *
 * 201 File is in the list because it is isCore — it cannot be switched off, and
 * onboarding would be meaningless without it. That is a happy accident
 * commercially: onboarding hires means building the employee database, and the
 * paid modules all run on exactly that data.
 *
 * REQUIRES HRIS WORK BEFORE THIS IS TRUE. Onboarding dependsOn LMS: the journey
 * links new hires to /lms/{courseId}, and course authoring lives only under
 * /lms/authoring. With LMS disabled the orientation course is both unreachable
 * and uneditable. The HRIS needs orientation courses owned by the Onboarding
 * module before this configuration can ship. See docs/12-provisioning.md.
 */
export const FREE_MODULES = [
  ["Dashboard", "Role-aware landing views — org-wide for leadership, team-scoped for supervisors, personal for staff."],
  ["201 File", "The employee master database: personal and employment records, position history, credentials and documents. Always included — every other module reads from it."],
  ["Onboarding & Orientation", "New-hire journeys with a task checklist, 30/60/90 checkpoints, a buddy assigned, and an orientation course you can edit to match your own organization."],
  ["Staff accounts", "Give any employee their own login, so the new hire works through their own checklist instead of HR ticking boxes for them. Issued with a one-time password they have to replace."],
] as const satisfies readonly (readonly [string, string])[];

export const PAID_MODULES = [
  ["Leave System", "Applications, approval routing, and an append-only balance ledger where every grant, accrual and deduction is a transaction."],
  ["Daily Time Record", "Attendance and timesheets, with the summaries government reporting asks for."],
  ["Learning Management", "Build and run your own course library beyond orientation — enrolments, quizzes and completion tracking."],
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
    bestWhen: "The hour left you wanting the whole picture rather than one module.",
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

/**
 * The way in: one hour of practical HR training, and the HRIS with it.
 *
 * This replaces "free, no card" as the first thing a visitor is asked to do.
 * The system itself is still free — ₱250 buys the hour of training, not the
 * software — but routing everyone through one small paid step changes who
 * arrives: someone who has paid ₱250 turns up to the session, and someone who
 * clicked a free button mostly does not.
 *
 * THE CHECKOUT AT /hris/start TAKES NO MONEY. PayMongo is written but not
 * verified, so the step exists to prove the funnel end to end — offer, sign-up,
 * a workspace of their own — while the payment half is still off. It says so on
 * the page, in as many words, because a checkout that looks real and quietly
 * charges nothing is worse than no checkout at all: someone would believe they
 * had paid.
 *
 * When PayMongo is switched on, this is the one page that changes.
 */
export const HRIS_ENTRY = {
  price: 250,
  /** Where the offer is accepted. Not a payment page yet — see above. */
  href: "/hris/start",
  name: "Practical HR Session",
  duration: "1 hour, live online",
  summary:
    "One hour of practical HR training, and your own HR system to put it into — employee records and new-hire onboarding, yours to keep.",
  includes: [
    "One hour live online with an HR practitioner, worked through your own situation rather than slides",
    "Your own HRIS workspace — the 201 file and new-hire onboarding, on your own address",
    "Onboarding journeys you customise: your tasks, your checkpoints, your orientation course",
    "Logins for your staff, so the new hire works through their own checklist",
    "The workspace stays yours afterwards. No trial timer, nothing switched off later",
  ],
} as const;
