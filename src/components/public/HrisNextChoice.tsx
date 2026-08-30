"use client";

import { useEffect, useRef, useState } from "react";
import { InquiryForm } from "@/components/public/InquiryForm";
import { HRIS_PATHS, formatHrisPrice, type HrisTier } from "@/lib/hris-funnel";

// The two system tiers, offered to someone who has just enrolled.
//
// Same interaction as HrisPaths — pick a rung, get a prefilled inquiry — so it
// behaves the way the rest of the site does. Trimmed to two rungs because this
// is not the ladder: the ₱250 has been paid, the workshop is beside the point,
// and consulting is a link at the foot of the page rather than a third card.
//
// The enquiry says the session is already paid for. Whoever picks it up should
// not open with a pitch for something this person has already bought.

const MESSAGES: Partial<Record<HrisTier, string>> = {
  "diy-system":
    "I have enrolled in the ₱250 Practical HR Session and I'd like the guided self-build HRIS (₱20,000). Here's our situation:\n\nRoughly how many employees: ",
  "done-for-you":
    "I have enrolled in the ₱250 Practical HR Session and I'd like the HRIS built and handed over (₱75,000). Here's our situation:\n\nRoughly how many employees: ",
};

const TIERS = HRIS_PATHS.filter((p) => p.id === "diy-system" || p.id === "done-for-you");

export function HrisNextChoice() {
  const [selected, setSelected] = useState<HrisTier | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selected]);

  const chosen = TIERS.find((t) => t.id === selected);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        {TIERS.map((tier) => {
          const active = selected === tier.id;
          return (
            <div
              key={tier.id}
              className={`flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all ${
                active
                  ? `${tier.accent.ring} ring-4 shadow-lg`
                  : "border-slate-200 hover:-translate-y-1 hover:shadow-xl"
              }`}
            >
              <div className={`h-2.5 bg-gradient-to-r ${tier.accent.bar}`} aria-hidden />
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {tier.eyebrow}
                </p>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">{tier.name}</p>
                <p className="font-display mt-3 text-4xl font-black tracking-tight text-slate-900">
                  {formatHrisPrice(tier.price)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{tier.priceNote}</p>
                <p className="mt-4 text-sm text-slate-600">{tier.tagline}</p>

                <ul className="mt-5 space-y-3">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Best when:</span> {tier.bestWhen}
                </p>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => setSelected(tier.id)}
                    className={`font-display inline-flex w-full items-center justify-center rounded-xl ${tier.accent.button} px-6 py-4 text-lg font-extrabold tracking-tight text-white shadow-lg transition-all hover:-translate-y-0.5`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {chosen ? (
        <div ref={formRef} className="mt-12 scroll-mt-8">
          <div className="mx-auto max-w-xl rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg sm:p-8">
            <p className="font-display text-xl font-bold text-slate-900">{chosen.name}</p>
            <p className="mt-1 text-sm text-slate-600">
              {formatHrisPrice(chosen.price)} · {chosen.priceNote}
            </p>
            <div className="mt-6">
              <InquiryForm
                presetMessage={MESSAGES[chosen.id]}
                presetService={chosen.matchingService}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
