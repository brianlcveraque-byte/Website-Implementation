"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { InquiryForm } from "@/components/public/InquiryForm";
import { PaymentQRPanel } from "@/components/public/PaymentQRPanel";
import { NextSessionBanner } from "@/components/public/SessionCheckout";
import { HRIS_PATHS, formatHrisPrice, type HrisTier } from "@/lib/hris-funnel";
import { HRIS_SESSION_RULE } from "@/lib/hris-funnel";

// The HRIS ladder. Same interaction as SuccessionPaths — pick a rung, get a
// prefilled inquiry — so someone who has seen one funnel already knows this one.
//
// All four rungs are inquiry-based. PayMongo is not live yet, and a workshop
// seat that takes a card while the ₱20,000 tier does not would be an odd
// half-automated experience. When checkout switches on, the ₱1,000 seat is the
// one to wire up first.

const MESSAGES: Record<HrisTier, string> = {
  workshop:
    "I'd like a seat on the HR Systems Workshop (₱1,000). Please send the next date and payment details.",
  "diy-system":
    "We'd like the guided self-build HRIS (₱20,000). Here's our situation:\n\nRoughly how many employees: ",
  "done-for-you":
    "We'd like the HRIS built and handed over (₱75,000). Here's our situation:\n\nRoughly how many employees: ",
  consulting: "We'd like to discuss an HR consulting engagement. Here's where we are:\n\n",
};

export function HrisPaths() {
  const [selected, setSelected] = useState<HrisTier | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selected]);

  const chosen = HRIS_PATHS.find((p) => p.id === selected);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {HRIS_PATHS.map((path) => {
          const active = selected === path.id;
          return (
            <div
              key={path.id}
              className={`flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all ${
                active
                  ? `${path.accent.ring} ring-4 shadow-lg`
                  : "border-slate-200 hover:-translate-y-1 hover:shadow-xl"
              }`}
            >
              <div className={`h-1.5 bg-gradient-to-r ${path.accent.bar}`} aria-hidden />
              <div className="relative h-32 shrink-0">
                <Image
                  src={path.photo}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"
                />
                <p className="absolute bottom-2.5 left-4 text-xs font-semibold tracking-wide text-white uppercase">
                  {path.eyebrow}
                </p>
                <p
                  className={`absolute top-2.5 right-3 rounded-full ${path.accent.badge} px-3.5 py-1 text-sm font-bold text-white shadow-lg`}
                >
                  {formatHrisPrice(path.price)}
                </p>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="font-serif text-xl font-light text-slate-900">{path.name}</p>
                <p className="mt-2 text-sm text-slate-600">{path.tagline}</p>
                <p className="mt-3 text-xs text-slate-500">{path.priceNote}</p>

                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {path.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5">
                  <p className="text-sm text-slate-500 italic">{path.bestWhen}</p>
                  <button
                    type="button"
                    onClick={() => setSelected(path.id)}
                    aria-pressed={active}
                    className={`mt-4 w-full rounded-lg px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg ${
                      active ? "bg-slate-900 hover:bg-slate-800" : path.accent.button
                    }`}
                  >
                    {active ? "Selected — form below" : path.cta}
                  </button>
                </div>
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
                : "Send your details and we'll reply with payment instructions within one business day."}
            </p>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              {chosen.id === "workshop" && (
                <div className="mb-6">
                  <NextSessionBanner rule={HRIS_SESSION_RULE} label="Next workshop" />
                </div>
              )}
              <InquiryForm
                presetMessage={MESSAGES[chosen.id]}
                presetService={chosen.matchingService}
                successExtra={
                  chosen.price !== null ? (
                    <PaymentQRPanel amountLabel={formatHrisPrice(chosen.price)} />
                  ) : undefined
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
