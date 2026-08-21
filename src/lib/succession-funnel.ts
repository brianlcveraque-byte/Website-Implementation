import { nextSessionDate as nextSession, type SessionRule } from "./session-schedule";

// The succession planning funnel.
//
// Shape: a free workbook in exchange for an email address, then a single choice
// between two tiers. The workbook is the qualifier — someone who fills in the
// criticality sheet and finds critical roles with an empty bench has diagnosed
// their own problem, which is a far warmer starting point than a brochure.
//
//   free   → Succession Planning Toolkit (public/downloads, no gate beyond email)
//   mid    → Succession Management Practitioner Program (self-paced + live cohort)
//   high   → Consultancy engagement, or the competency-based HRIS
//
// Deliberately kept out of lib/toolkits.ts: the /toolkits page is positioned as
// "free to ₱5,000" and the tiers below sit above that range.

export const WORKBOOK = {
  /** Served straight from public/ — no signed URL, the email is the only gate. */
  path: "/downloads/succession-planning-toolkit.xlsx",
  filename: "succession-planning-toolkit.xlsx",
  sheetCount: 8,
  /** Shown as the "what you're getting" list on the landing page. */
  sheets: [
    ["Succession planning", "Scores every position on revenue contribution, risk exposure, and specialization, then bands it from Noncritical to Highly Critical."],
    ["Successor assessment matrix", "Rates candidates 1–4 on seven criteria and computes an overall match percentage and readiness status."],
    ["Succession bench", "Counts depth and strength per position, and flags any critical role with nobody behind it."],
    ["Competency position profile", "Required level against assessed rating, so the gap names the development agenda."],
    ["Config", "Every scoring threshold in one place. Lower the bands once you can see how your own scores distribute."],
    ["Definitions & how to use", "Thirty-seven defined terms and a fill-in order, so it survives being handed to someone else."],
  ] as const satisfies readonly (readonly [string, string])[],
} as const;

// A worked example of the workbook in use, rendered on the landing page by
// WorkbookPreview. Every computed value here is what the file's own formulas
// produce for these inputs — kept honest so the preview can't oversell the file:
//
//   Total criticality = sum of the three factors; >=13 Highly Critical, >=10
//   Critical, >=7 Moderately Critical (CONFIG rows 7-9).
//   Overall match     = sum of seven 1-4 ratings / 28; 100% Ready Now, >=80%
//   Ready Soon, >=50% Ready Later (CONFIG rows 15-17).
//   Depth             = Ready Now + Soon + Later. Strength = Ready Now.
//   Bench risk        = critical role with depth 0 is the flagged case.
//
// The three sheets tell one story: the CIO scores as critical as the Executive
// Director, but has nobody behind him at all.
export const WORKBOOK_PREVIEW = [
  {
    tab: "SUCCESSION PLANNING",
    caption:
      "Rate each position on three factors and the criticality band follows. Nothing here is a judgement call you have to defend twice.",
    columns: ["Approved Position", "Filled", "Total Vacancy", "Perf. Trend", "Revenue", "Risk", "Special.", "Total Score", "Critical Position Level"],
    inputCols: [1, 3, 4, 5, 6],
    rows: [
      ["Executive Director", 1, 1, "VS", 5, 5, 4, 14, "Highly Critical"],
      ["Chief Information Officer", 1, 1, "S", 4, 5, 5, 14, "Highly Critical"],
      ["Internal Auditor V", 1, 0, "VS", 3, 5, 4, 12, "Critical"],
      ["Planning Officer IV", 2, 0, "S", 3, 3, 3, 9, "Moderately Critical"],
    ],
  },
  {
    tab: "SUCCESSOR ASSESSMENT MATRIX",
    caption:
      "Seven criteria, rated 1–4. The match percentage and readiness status are computed, so “ready” means the same thing in every conversation about it.",
    columns: ["Potential Successor", "Qual. Std.", "Comp.", "Perf.", "Learning", "Commit.", "Loyalty", "Likability", "Overall Match", "Readiness Status"],
    inputCols: [1, 2, 3, 4, 5, 6, 7],
    rows: [
      ["A. Dela Cruz", 4, 4, 4, 4, 4, 4, "100%", "Ready Now"],
      ["B. Santos", 4, 3, 4, 4, 3, 4, "89%", "Ready Soon"],
      ["C. Reyes", 3, 2, 3, 2, 3, 3, "64%", "Ready Later"],
    ],
  },
  {
    tab: "SUCCESSION BENCH",
    caption:
      "Nothing to fill in — this sheet counts itself from the matrix. The flagged row is the one that should start the conversation.",
    columns: ["Position", "Ready Now", "Ready Soon", "Ready Later", "Depth", "Strength", "Bench Risk"],
    inputCols: [],
    rows: [
      ["Executive Director", 1, 1, 1, 3, 1, "Covered"],
      ["Chief Information Officer", 0, 0, 0, 0, 0, "Critical role, no bench"],
      ["Internal Auditor V", 0, 2, 1, 3, 0, "No one ready now"],
      ["Planning Officer IV", 0, 0, 1, 1, 0, "No one ready now"],
    ],
  },
] as const satisfies readonly {
  tab: string;
  caption: string;
  columns: readonly string[];
  inputCols: readonly number[];
  rows: readonly (readonly (string | number)[])[];
}[];

// Live session schedule for the succession seat. The date maths lives in
// lib/session-schedule so every funnel shares one implementation.
export const SESSION_RULE: SessionRule = {
  anchorISO: "2026-08-20",
  intervalDays: 14,
  timeLabel: "6:00–8:00 PM (PHT)",
  weekdayLabel: "Thursday",
  cadenceLabel: "Every other Thursday",
};

/** The next succession session. Thin wrapper so callers need not pass the rule. */
export function nextSessionDate(from: Date = new Date()): Date {
  return nextSession(SESSION_RULE, from);
}

export { formatSessionDate, sessionDateISO } from "./session-schedule";

export type FunnelTier = "training" | "diy-system" | "done-for-you" | "consultancy";

export type FunnelPath = {
  id: FunnelTier;
  eyebrow: string;
  name: string;
  /** null renders as "By inquiry" — no gateway is wired up for any tier. */
  price: number | null;
  priceNote: string;
  tagline: string;
  includes: string[];
  bestWhen: string;
  cta: string;
  /** Same licensed photo set as /services and the toolkit cards. */
  photo: string;
  /** Tailwind classes, written out in full rather than composed at runtime —
   *  Tailwind scans source text, so a class built by string concatenation is
   *  never emitted. Each rung gets its own colour so the ladder reads as four
   *  distinct choices rather than four grey boxes. */
  accent: { bar: string; badge: string; button: string; ring: string };
  /** Prefills the inquiry form's service dropdown. Must match SERVICE_CATEGORIES. */
  matchingService: string;
};

// A four-rung ladder rather than a single fork: ₱500 to learn the method,
// ₱10,000 to get the system and install it yourself, ₱30,000 to have it built
// against your own plantilla, and an open-scope engagement above that. Each rung
// is a credible next step from the one below, which is what keeps the ₱500 buyer
// reachable later instead of being a dead end.
export const FUNNEL_PATHS: FunnelPath[] = [
  {
    id: "training",
    eyebrow: "Learn the method",
    name: "Succession Planning Essentials",
    price: 500,
    priceNote: "per seat · one live 2-hour session",
    tagline:
      "A two-hour live online session that takes you from a blank workbook to a scored, defensible succession plan.",
    includes: [
      "Two hours live online, worked through the criticality scoring and readiness assessment step by step",
      "A full position taken end to end, from plantilla row to readiness band",
      "Questions answered live — bring the positions you are stuck on",
      "The recording afterwards, so a clash on the day costs you nothing",
    ],
    bestWhen: "You want to understand the method properly before committing budget to it.",
    cta: "Book a seat",
    photo: "/photos/facilitation-workshop.jpg",
    accent: {
      bar: "from-emerald-400 to-teal-500",
      badge: "bg-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-500",
      ring: "border-emerald-500 ring-emerald-200",
    },
    matchingService: "Succession Planning",
  },
  {
    id: "diy-system",
    eyebrow: "Build it yourself",
    name: "Succession System — self-build",
    price: 10000,
    priceNote: "one-time, includes setup guide",
    tagline:
      "The complete system, configured to your salary-grade structure, for your own team to roll out.",
    includes: [
      "Full scoring model, competency dictionary, and development-plan templates",
      "Workbook pre-configured for your plantilla structure and grade bands",
      "Implementation guide plus a briefing script for your executive team",
      "Email support while you roll it out",
    ],
    bestWhen:
      "You have someone internal who will own this, and would rather build the capability than rent it.",
    cta: "Get the system",
    photo: "/photos/strategy-whiteboard.jpg",
    accent: {
      bar: "from-sky-400 to-blue-600",
      badge: "bg-blue-600",
      button: "bg-blue-600 hover:bg-blue-500",
      ring: "border-blue-500 ring-blue-200",
    },
    matchingService: "Succession Planning",
  },
  {
    id: "done-for-you",
    eyebrow: "Have it built for you",
    name: "Succession System — built for you",
    price: 30000,
    priceNote: "one-time, configured to your plantilla",
    tagline:
      "We score your actual positions, build the system around them, and hand it over working.",
    includes: [
      "Criticality scored across every position, not just the ones you already worry about",
      "The system configured against your real plantilla and salary grades",
      "Board-ready succession plan with the scoring rationale documented",
      "Handover session so your team can maintain it without us",
    ],
    bestWhen: "You want this working now, without spending your team's time building it.",
    cta: "Have it built",
    photo: "/photos/planning-discussion.jpg",
    accent: {
      bar: "from-violet-500 to-purple-600",
      badge: "bg-violet-600",
      button: "bg-violet-600 hover:bg-violet-500",
      ring: "border-violet-500 ring-violet-200",
    },
    matchingService: "Succession Planning",
  },
  {
    id: "consultancy",
    eyebrow: "Bring us in",
    name: "Consultancy engagement",
    price: null,
    priceNote: "scoped per organization",
    tagline:
      "Facilitated end to end by our principal consultants, through the transition rather than up to it.",
    includes: [
      "Facilitated criticality and bench assessment across the whole organization",
      "Successor development plans written against real competency gaps",
      "Optional competency-based HRIS, so the plan stays live instead of ageing in a spreadsheet",
      "Ongoing advisory through the transition itself",
    ],
    bestWhen:
      "The transition is close, the plantilla is large, or a promotion decision needs to withstand being challenged.",
    cta: "Discuss an engagement",
    photo: "/photos/boardroom.jpg",
    accent: {
      bar: "from-amber-400 to-orange-500",
      badge: "bg-amber-600",
      button: "bg-amber-600 hover:bg-amber-500",
      ring: "border-amber-500 ring-amber-200",
    },
    matchingService: "Succession Planning",
  },
];

/** ₱0 shows as "Free", a null price as "By inquiry". */
export function formatTierPrice(price: number | null): string {
  if (price === null) return "By inquiry";
  return price === 0 ? "Free" : `₱${price.toLocaleString()}`;
}
