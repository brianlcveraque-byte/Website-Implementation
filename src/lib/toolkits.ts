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
  tagline: string;
  includes: string[];
  idealFor: string;
  matchingService?: string; // SERVICE_CATEGORIES name, for prefilling InquiryForm
};

export const TOOLKITS: Toolkit[] = [
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
    slug: "succession-planning-toolkit",
    name: "Succession Planning Toolkit",
    price: 1000,
    pillarTag: "Strategy & Leadership",
    tagline: "Identify critical roles, assess bench strength, and start building a real succession pipeline.",
    includes: [
      "Critical-role identification matrix",
      "Successor readiness assessment template",
      "Individual development plan template",
      "Step-by-step guide to running the process internally",
    ],
    idealFor: "Boards and executive teams facing an upcoming leadership transition.",
    matchingService: "Succession Planning",
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
      "Strategic Planning Canvas + Succession Planning Toolkit + Competency-Based HR Starter Kit, bundled",
      "30-minute video call walkthrough with Richard",
      "Email support for questions while you apply the toolkit",
    ],
    idealFor: "Teams who want the templates and expert guidance on using them, without a full engagement.",
    matchingService: "Strategic Management and Planning",
  },
];
