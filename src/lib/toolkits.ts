// Low-ticket "starter toolkit" products — a funnel entry point below the
// free consultation: practical templates people can buy and use themselves,
// priced to be an easy yes, with the top tier bundling in direct access to
// Richard as the natural upsell toward a full engagement. Purchase is
// inquiry-based (see InquiryForm's ?toolkit= prefill), not automated
// checkout — no payment gateway is wired up.

export type Toolkit = {
  slug: string;
  name: string;
  price: number; // PHP
  pillarTag: string; // matches a PILLARS.tag, used for the badge color
  photo: string; // reuses the same licensed photos as the matching /services pillar
  tagline: string;
  includes: string[];
  idealFor: string;
  matchingService?: string; // SERVICE_CATEGORIES name, for prefilling InquiryForm
  bundleValue?: number; // sum of the standalone prices of what's included, for "save ₱X" framing
  // Toolkits with their own funnel page send visitors there instead of to the
  // inquiry form — the page collects an email and hands over the file directly.
  funnelPath?: string;
};

const PILLAR_PHOTO: Record<string, string> = {
  "Strategy & Leadership": "/photos/strategy-whiteboard.jpg",
  "Healthcare & Hospitals": "/photos/healthcare-corridor.jpg",
  "Training & Facilitation": "/photos/facilitation-workshop.jpg",
  "Complete Library": "/photos/skyline-sunset.jpg",
};

/** ₱0 displays as "Free" instead of "₱0" wherever a toolkit's price is shown. */
export function formatToolkitPrice(price: number): string {
  return price === 0 ? "Free" : `₱${price.toLocaleString()}`;
}

const TOOLKITS_BASE: Omit<Toolkit, "photo">[] = [
  {
    slug: "organizational-health-check",
    name: "Organizational Health Check",
    price: 0,
    pillarTag: "Strategy & Leadership",
    tagline: "A 10-minute self-assessment to see where your organization needs the most help.",
    includes: [
      "20-question checklist across strategy, HR, and operations",
      "Simple scoring guide to interpret your results",
      "A suggested next toolkit based on your score",
    ],
    idealFor: "Anyone unsure where to start — no strings attached.",
  },
  {
    slug: "swot-priorities-worksheet",
    name: "One-Page SWOT & Priorities Worksheet",
    price: 150,
    pillarTag: "Strategy & Leadership",
    tagline: "A simple worksheet to structure your next planning conversation.",
    includes: [
      "One-page SWOT analysis template",
      "Priority-setting matrix (impact vs. effort)",
      "Quick-fill instructions",
    ],
    idealFor: "Teams wanting a fast, structured discussion tool for their next meeting.",
    matchingService: "Strategic Management and Planning",
  },
  {
    slug: "strategic-planning-canvas",
    name: "Strategic Planning Canvas",
    price: 500,
    pillarTag: "Strategy & Leadership",
    tagline: "A one-page canvas to map your organization's strategic direction in a single sitting.",
    includes: [
      "Editable strategic planning canvas (vision, priorities, initiatives, metrics)",
      "Facilitator's guide for running a 2-hour planning session",
      "Sample filled-in canvas for reference",
    ],
    idealFor: "Small teams or boards wanting a fast first pass before a full engagement.",
    matchingService: "Strategic Management and Planning",
  },
  {
    slug: "training-design-kit",
    name: "Training Needs & Session Design Kit",
    price: 500,
    pillarTag: "Training & Facilitation",
    tagline: "Figure out what training your team actually needs, then design a session that delivers it.",
    includes: [
      "Training needs assessment questionnaire",
      "Session design template (objectives, activities, timing)",
      "Post-training evaluation form",
    ],
    idealFor: "HR or L&D leads planning their next internal training.",
    matchingService: "Training, Facilitation, Coaching, and Mentoring",
  },
  {
    // Free deliberately: this is the top of the succession funnel. Filling the
    // workbook in surfaces the problem — critical roles with nobody ready — which
    // is what the training and consultancy tiers exist to solve. A ₱1,000 gate in
    // front of that would filter out most of the people worth talking to.
    slug: "succession-planning-toolkit",
    name: "Succession Planning Toolkit",
    price: 0,
    pillarTag: "Strategy & Leadership",
    tagline: "Score which roles would hurt most to lose, and find out who is actually ready to step in.",
    includes: [
      "Criticality scoring sheet that bands every position automatically",
      "Successor assessment matrix — 7 criteria, computed readiness status",
      "Succession bench that counts its own depth and strength",
      "Competency gap profile, definitions, and a configurable scoring sheet",
    ],
    idealFor: "Boards and executive teams facing an upcoming leadership transition.",
    matchingService: "Succession Planning",
    funnelPath: "/succession-planning",
  },
  {
    slug: "competency-hr-starter-kit",
    name: "Competency-Based HR Starter Kit",
    price: 1000,
    pillarTag: "Training & Facilitation",
    tagline: "Build the foundation for competency-based hiring, development, and performance management.",
    includes: [
      "Competency dictionary template (core, leadership, functional)",
      "Job-to-competency mapping worksheet",
      "Competency-based interview question bank",
    ],
    idealFor: "HR teams modernizing their hiring and development systems.",
    matchingService: "Competency-Based HR Systems",
  },
  {
    slug: "healthcare-qi-toolkit",
    name: "Healthcare Quality Improvement Toolkit",
    price: 1000,
    pillarTag: "Healthcare & Hospitals",
    tagline: "A practical starting kit for running your first structured quality improvement cycle.",
    includes: [
      "Process audit checklist",
      "Root-cause analysis worksheet (fishbone + 5 whys)",
      "QI action plan template (PDSA-based)",
    ],
    idealFor: "Hospital and clinic quality units starting a formal QI program.",
    matchingService: "Quality Management and Process Improvement",
  },
  {
    slug: "strategy-sprint-program",
    name: "Strategy Sprint Practitioner Program",
    price: 5000,
    pillarTag: "Strategy & Leadership",
    tagline: "The full toolkit bundle, plus a live orientation call to help you apply it right.",
    includes: [
      "Strategic Planning Canvas + Competency-Based HR Starter Kit, bundled",
      "30-minute video call walkthrough with our principal consultants and subject matter experts",
      "Email support for questions while you apply the toolkit",
    ],
    idealFor: "Teams who want the templates and expert guidance on using them, without a full engagement.",
    matchingService: "Strategic Management and Planning",
  },
  {
    slug: "complete-toolkit-library",
    name: "Complete Toolkit Library",
    price: 2500,
    pillarTag: "Complete Library",
    tagline: "Every paid toolkit we offer, bundled together, for less than the price of any two on their own.",
    includes: [
      "One-Page SWOT & Priorities Worksheet",
      "Strategic Planning Canvas",
      "Training Needs & Session Design Kit",
      "Competency-Based HR Starter Kit",
      "Healthcare Quality Improvement Toolkit",
    ],
    idealFor: "Teams who'd rather have the full library on hand than pick just one.",
    matchingService: "Strategic Management and Planning",
    // Sum of the five paid toolkits above. The Succession Planning Toolkit used
    // to count ₱1,000 toward this; it is free now, so it is no longer something
    // the bundle buys you.
    bundleValue: 3150,
  },
];

export const TOOLKITS: Toolkit[] = TOOLKITS_BASE.map((t) => ({
  ...t,
  photo: PILLAR_PHOTO[t.pillarTag],
}));
