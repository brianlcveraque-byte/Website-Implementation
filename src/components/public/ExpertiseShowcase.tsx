import { ServiceIcon } from "@/components/public/ServiceIcon";
import type { ServiceIconName } from "@/lib/services-catalogue";

/** Hero visual for prospective clients — breadth of consulting expertise,
 * not the internal team tool (that belongs behind "Team sign in," not the
 * public marketing hero: a client evaluating a consultant doesn't care
 * about the firm's own project-tracking software). */

const ICONS: ServiceIconName[] = [
  "strategy",
  "compass",
  "people",
  "growth",
  "award",
  "chat",
  "book",
  "search",
  "pulse",
  "shield",
  "calendar",
];

const STATS = [
  { value: "20+", label: "Years" },
  { value: "8", label: "Sectors" },
  { value: "18", label: "Service areas" },
];

export function ExpertiseShowcase() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-indigo-500/15 blur-2xl" aria-hidden />
      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/10 sm:p-7">
        <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
          Areas of expertise
        </p>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {ICONS.map((icon, i) => (
            <div
              key={icon + i}
              className="flex aspect-square items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-indigo-300"
            >
              <ServiceIcon name={icon} className="h-5 w-5" />
            </div>
          ))}
          <div className="flex aspect-square items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/10 text-[10px] font-semibold text-indigo-300">
            +7
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-semibold text-white sm:text-xl">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
