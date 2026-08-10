import type { ServiceIconName } from "@/lib/services-catalogue";

const shared = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ServiceIcon({ name, className }: { name: ServiceIconName; className?: string }) {
  switch (name) {
    case "strategy":
      return (
        <svg {...shared} className={className} aria-hidden>
          <line x1="3" y1="20" x2="21" y2="20" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="12" y1="20" x2="12" y2="9" />
          <line x1="18" y1="20" x2="18" y2="5" />
        </svg>
      );
    case "compass":
      return (
        <svg {...shared} className={className} aria-hidden>
          <circle cx="12" cy="12" r="8.5" />
          <line x1="12" y1="12" x2="15.5" y2="8" />
          <line x1="12" y1="12" x2="9.5" y2="14.5" />
          <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "people":
      return (
        <svg {...shared} className={className} aria-hidden>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9.5" r="2.3" />
          <polyline points="4,20 4,18 6,15 12,15 14,18 14,20" />
          <polyline points="15,20 15,17.5 16.3,15.7 20,15.7 20.5,17.5 20.5,20" />
        </svg>
      );
    case "growth":
      return (
        <svg {...shared} className={className} aria-hidden>
          <polyline points="3,18 9,12 13,15 21,6" />
          <polyline points="15,6 21,6 21,12" />
        </svg>
      );
    case "award":
      return (
        <svg {...shared} className={className} aria-hidden>
          <circle cx="12" cy="8" r="5" />
          <line x1="9" y1="12.5" x2="7" y2="21" />
          <line x1="15" y1="12.5" x2="17" y2="21" />
          <line x1="7" y1="21" x2="12" y2="18" />
          <line x1="17" y1="21" x2="12" y2="18" />
        </svg>
      );
    case "chat":
      return (
        <svg {...shared} className={className} aria-hidden>
          <rect x="3" y="4.5" width="18" height="12" rx="3" />
          <polyline points="8,16.5 8,20 12,16.5" />
        </svg>
      );
    case "book":
      return (
        <svg {...shared} className={className} aria-hidden>
          <path d="M4 5.5c2.2-1 5-1 8 0v13c-3-1-5.8-1-8 0z" />
          <path d="M20 5.5c-2.2-1-5-1-8 0v13c3-1 5.8-1 8 0z" />
        </svg>
      );
    case "search":
      return (
        <svg {...shared} className={className} aria-hidden>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.3" y1="15.3" x2="21" y2="21" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...shared} className={className} aria-hidden>
          <polyline points="3,12 8,12 10,6 14,18 16,12 21,12" />
        </svg>
      );
    case "shield":
      return (
        <svg {...shared} className={className} aria-hidden>
          <path d="M12 3.5 19 6.5v5.5c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6.5z" />
          <polyline points="8.7,12 11,14.3 15.3,10" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...shared} className={className} aria-hidden>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
          <line x1="8" y1="3" x2="8" y2="7" />
          <line x1="16" y1="3" x2="16" y2="7" />
        </svg>
      );
    default:
      return null;
  }
}
