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
    priceNote: "one-time, lifetime access",
    tagline:
      "A short recorded course that takes you from a blank workbook to a scored, defensible succession plan.",
    includes: [
      "Six recorded modules — criticality scoring, bench assessment, competency gaps, development planning, governance, and the board conversation",
      "A worked example running one position end to end",
      "Watch at your own pace, keep it for good",
    ],
    bestWhen: "You want to understand the method properly before committing budget to it.",
    cta: "Get the course",
    photo: "/photos/facilitation-workshop.jpg",
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
    matchingService: "Succession Planning",
  },
];

/** ₱0 shows as "Free", a null price as "By inquiry". */
export function formatTierPrice(price: number | null): string {
  if (price === null) return "By inquiry";
  return price === 0 ? "Free" : `₱${price.toLocaleString()}`;
}
