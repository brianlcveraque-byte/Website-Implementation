// Shared between the public landing page and the DB seed script (scripts/seed.ts)
// so the two never drift apart. Validated against the principal consultant's CV —
// see SPEC.md §3. Keep names stable; they're used as free-text `category` values,
// not foreign keys.

export type ServiceIconName =
  | "strategy"
  | "compass"
  | "people"
  | "growth"
  | "award"
  | "chat"
  | "book"
  | "search"
  | "pulse"
  | "shield"
  | "calendar";

export const SERVICE_CATEGORIES = [
  {
    name: "Strategic Management and Planning",
    description:
      "Facilitated strategic plans for hospitals, cooperatives, and government agencies.",
    icon: "strategy",
  },
  {
    name: "Organizational Development",
    description: "OD diagnostics and transformation for institutions and health systems.",
    icon: "compass",
  },
  {
    name: "Human Resource Management and Development",
    description: "HR systems design and development for public and private institutions.",
    icon: "people",
  },
  {
    name: "Competency-Based HR Systems",
    description: "Competency manuals and frameworks for hospitals, cooperatives, and agencies.",
    icon: "people",
  },
  {
    name: "Succession Planning",
    description: "Succession planning frameworks for institutional continuity.",
    icon: "growth",
  },
  {
    name: "Performance Management",
    description: "Performance management system design and implementation.",
    icon: "strategy",
  },
  {
    name: "Leadership and Management Development",
    description: "Leadership programs for executives, boards, and municipal officials.",
    icon: "award",
  },
  {
    name: "Training, Facilitation, Coaching, and Mentoring",
    description: "Facilitation and capacity-building across health, education, and government.",
    icon: "chat",
  },
  {
    name: "Research and Policy Studies",
    description: "Principal investigator / co-investigator on WHO, DOH, and NIH-funded studies.",
    icon: "book",
  },
  {
    name: "Market Research",
    description: "Market research studies for institutional clients.",
    icon: "search",
  },
  {
    name: "Feasibility Studies",
    description: "Feasibility studies for hospitals, wellness centers, and specialty facilities.",
    icon: "search",
  },
  {
    name: "Healthcare and Hospital Management Consulting",
    description: "The core specialization — dozens of hospitals and health systems across PH, Africa, and Southeast Asia.",
    icon: "pulse",
  },
  {
    name: "Quality Management and Process Improvement",
    description: "ISO 9001:2015, Six Sigma, and TQM implementation.",
    icon: "shield",
  },
  {
    name: "Workforce Planning and Organizational Design",
    description: "Workforce and organizational design for institutional restructuring.",
    icon: "people",
  },
  {
    name: "Program and Project Planning",
    description: "Program design and planning for development and health initiatives.",
    icon: "calendar",
  },
  {
    name: "Monitoring and Evaluation",
    description: "M&E frameworks and program evaluation for public health initiatives.",
    icon: "strategy",
  },
  {
    name: "Business Process Review",
    description: "Business process and operations review for private and institutional clients.",
    icon: "growth",
  },
  {
    name: "Institutional and Governance Development",
    description: "Board governance advisory and institutional development.",
    icon: "shield",
  },
] as const satisfies readonly { name: string; description: string; icon: ServiceIconName }[];
