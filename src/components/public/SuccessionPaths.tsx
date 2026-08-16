"use client";

import { useEffect, useRef, useState } from "react";
import { InquiryForm } from "@/components/public/InquiryForm";
import { FUNNEL_PATHS, formatTierPrice, type FunnelTier } from "@/lib/succession-funnel";

// The fork at the bottom of the funnel: learn to run it, or have it run for you.
// Both land in the same inquiry table — the difference is the prefilled message,
// which is what tells us which tier the lead came in on.

const MESSAGES: Record<FunnelTier, string> = {
  training:
    "I'd like to join the Succession Management Practitioner Program. Please send enrolment and payment details.",
  engagement:
    "We'd like to discuss a succession planning engagement for our organization. Here's where we are:\n\n",
};

export function SuccessionPaths() {
  const [selected, setSelected] = useState<FunnelTier | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selected]);

  const chosen = FUNNEL_PATHS.find((p) => p.id === selected);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {FUNNEL_PATHS.map((path) => {
          const active = selected === path.id;
          return (
            <div
              key={path.id}
              className={`flex flex-col rounded-2xl border bg-white p-7 shadow-sm transition-all ${
                active ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200 hover:shadow-md"
              }`}
            >
              <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">{path.eyebrow}</p>
              <p className="mt-2 font-serif text-2xl font-light text-slate-900">{path.name}</p>
              <p className="mt-3 text-base text-slate-600">{path.tagline}</p>

              <div className="mt-5 flex items-baseline gap-2 border-y border-slate-100 py-4">
                <span className="font-serif text-3xl font-light text-slate-900">
                  {formatTierPrice(path.price)}
                </span>
                <span className="text-sm text-slate-500">{path.priceNote}</span>
              </div>

              <ul className="mt-5 space-y-2.5">
                {path.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-base text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <p className="text-sm text-slate-500 italic">{path.bestWhen}</p>
                <button
                  type="button"
                  onClick={() => setSelected(path.id)}
                  aria-pressed={active}
                  className={`mt-4 w-full rounded-md px-4 py-3 text-base font-semibold transition-colors ${
                    active
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  }`}
                >
                  {active ? "Selected — fill in the form below" : path.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {chosen && (
        <div ref={formRef} className="mt-12 scroll-mt-8">
          <div className="mx-auto max-w-2xl">
            <p className="text-center font-serif text-3xl font-light text-slate-900">{chosen.name}</p>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate-500">
              {chosen.price === null
                ? "Tell us the shape of the organization and we'll come back with a scope and a figure — no obligation."
                : "Send your details and we'll reply with enrolment and payment instructions."}
            </p>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <InquiryForm presetMessage={MESSAGES[chosen.id]} presetService={chosen.matchingService} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
