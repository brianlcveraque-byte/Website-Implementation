// Shared between the public landing page and the DB seed script (scripts/seed.ts)
// so the two never drift apart. Validated against the principal consultant's CV —
// see SPEC.md §3. Keep names stable; they're used as free-text `category` values,
// not foreign keys.

export const SERVICE_CATEGORIES = [
  {
    name: "Strategic Management and Planning",
    description:
      "Facilitated strategic plans for hospitals, cooperatives, and government agencies.",
  },
  {
    name: "Organizational Development",
    description: "OD diagnostics and transformation for institutions and health systems.",
  },
  {
    name: "Human Resource Management and Development",
    description: "HR systems design and development for public and private institutions.",
  },
  {
    name: "Competency-Based HR Systems",
    description: "Competency manuals and frameworks for hospitals, cooperatives, and agencies.",
  },
  {
    name: "Succession Planning",
    description: "Succession planning frameworks for institutional continuity.",
  },
  {
    name: "Performance Management",
    description: "Performance management system design and implementation.",
  },
  {
    name: "Leadership and Management Development",
    description: "Leadership programs for executives, boards, and municipal officials.",
  },
  {
    name: "Training, Facilitation, Coaching, and Mentoring",
    description: "Facilitation and capacity-building across health, education, and government.",
  },
  {
    name: "Research and Policy Studies",
    description: "Principal investigator / co-investigator on WHO, DOH, and NIH-funded studies.",
  },
  {
    name: "Market Research",
    description: "Market research studies for institutional clients.",
  },
  {
    name: "Feasibility Studies",
    description: "Feasibility studies for hospitals, wellness centers, and specialty facilities.",
  },
  {
    name: "Healthcare and Hospital Management Consulting",
    description: "The core specialization — dozens of hospitals and health systems across PH, Africa, and Southeast Asia.",
  },
  {
    name: "Quality Management and Process Improvement",
    description: "ISO 9001:2015, Six Sigma, and TQM implementation.",
  },
  {
    name: "Workforce Planning and Organizational Design",
    description: "Workforce and organizational design for institutional restructuring.",
  },
  {
    name: "Program and Project Planning",
    description: "Program design and planning for development and health initiatives.",
  },
  {
    name: "Monitoring and Evaluation",
    description: "M&E frameworks and program evaluation for public health initiatives.",
  },
  {
    name: "Business Process Review",
    description: "Business process and operations review for private and institutional clients.",
  },
  {
    name: "Institutional and Governance Development",
    description: "Board governance advisory and institutional development.",
  },
] as const;
