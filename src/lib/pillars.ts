// Shared between the homepage pillar cards, /services index, and each
// /services/[slug] detail page — one source of truth for the grouping.

export const PILLARS = [
  {
    slug: "strategy-leadership",
    tag: "Strategy & Leadership",
    photo: "/photos/strategy-whiteboard.jpg",
    summary: "Strategic planning, performance systems, and governance for institutions navigating change.",
    intro:
      "Facilitated strategic plans, performance management systems, and governance frameworks for hospitals, cooperatives, and government agencies — the structural work that makes everything else possible.",
    services: [
      "Strategic Management and Planning",
      "Performance Management",
      "Monitoring and Evaluation",
      "Succession Planning",
      "Business Process Review",
      "Institutional and Governance Development",
    ],
  },
  {
    slug: "healthcare",
    tag: "Healthcare & Hospitals",
    photo: "/photos/healthcare-corridor.jpg",
    summary: "The core specialization — dozens of hospital and health-system engagements across the region.",
    intro:
      "Healthcare and hospital management consulting is the deepest specialization here — implementation planning, feasibility studies, and quality management for institutions where getting it right has direct consequences for patient care.",
    services: [
      "Healthcare and Hospital Management Consulting",
      "Feasibility Studies",
      "Quality Management and Process Improvement",
    ],
  },
  {
    slug: "training-facilitation",
    tag: "Training & Facilitation",
    photo: "/photos/facilitation-workshop.jpg",
    summary: "HR systems, leadership development, and research-grounded facilitation for people and organizations.",
    intro:
      "From competency frameworks to leadership programs to WHO/DOH/NIH-affiliated research — the people-and-capability side of organizational change, delivered hands-on rather than handed over as a report.",
    services: [
      "Training, Facilitation, Coaching, and Mentoring",
      "Leadership and Management Development",
      "Competency-Based HR Systems",
      "Human Resource Management and Development",
      "Workforce Planning and Organizational Design",
      "Program and Project Planning",
      "Research and Policy Studies",
      "Market Research",
    ],
  },
] as const;
