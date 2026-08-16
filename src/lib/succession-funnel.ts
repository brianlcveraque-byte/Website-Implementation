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

// PLACEHOLDER PRICE — replace before running traffic to this page. Sits above
// the ₱5,000 Strategy Sprint (the top of the toolkit range) and well below a
// consultancy engagement, which is the gap a mid-ticket product needs to fill.
const TRAINING_PRICE = 12000;

export type FunnelTier = "training" | "engagement";

export type FunnelPath = {
  id: FunnelTier;
  eyebrow: string;
  name: string;
  /** null renders as "By inquiry" — no gateway is wired up for either tier. */
  price: number | null;
  priceNote: string;
  tagline: string;
  includes: string[];
  bestWhen: string;
  cta: string;
  /** Prefills the inquiry form's service dropdown. Must match SERVICE_CATEGORIES. */
  matchingService: string;
};

export const FUNNEL_PATHS: FunnelPath[] = [
  {
    id: "training",
    eyebrow: "Learn to run it yourself",
    name: "Succession Management Practitioner Program",
    price: TRAINING_PRICE,
    priceNote: "per participant, materials included",
    tagline:
      "Six self-paced modules that take you from a filled-in workbook to a succession plan your board will sign off on.",
    includes: [
      "Six recorded modules — criticality scoring, bench assessment, competency gaps, development planning, governance, and the board conversation",
      "A live cohort session each month for questions on your own numbers",
      "Facilitator pack: session decks, participant handouts, and a briefing script for your executive team",
      "Reviewed practice run on one position of your choosing",
    ],
    bestWhen:
      "You have someone internal who will own succession planning, and you would rather build that capability than rent it.",
    cta: "Join the program",
    matchingService: "Succession Planning",
  },
  {
    id: "engagement",
    eyebrow: "Have it built for you",
    name: "Consultancy engagement or a competency-based HRIS",
    price: null,
    priceNote: "scoped per organization",
    tagline:
      "We run the assessment across your whole plantilla, or install a system that keeps it current after we leave.",
    includes: [
      "Facilitated criticality and bench assessment across every position, not just the ones you already worry about",
      "Successor development plans written against real competency gaps",
      "Board-ready succession plan with the scoring rationale documented for contested decisions",
      "Optional: a competency-based HRIS carrying the same scoring model, so the plan stays live instead of ageing in a spreadsheet",
    ],
    bestWhen:
      "The transition is close, the plantilla is large, or a promotion decision needs to withstand being challenged.",
    cta: "Discuss an engagement",
    matchingService: "Succession Planning",
  },
];

/** ₱0 shows as "Free", a null price as "By inquiry". */
export function formatTierPrice(price: number | null): string {
  if (price === null) return "By inquiry";
  return price === 0 ? "Free" : `₱${price.toLocaleString()}`;
}
