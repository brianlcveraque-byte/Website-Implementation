"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { InquiryForm } from "@/components/public/InquiryForm";
import { SessionCheckout } from "@/components/public/SessionCheckout";
import { FUNNEL_PATHS, formatTierPrice, type FunnelTier } from "@/lib/succession-funnel";

// The ladder at the bottom of the funnel. All four rungs land in the same
// inquiry table — the difference is the prefilled message, which is what tells
// us which rung a lead came in on.

const MESSAGES: Record<FunnelTier, string> = {
  training:
    "I'd like to book a seat on the Succession Planning Essentials session (₱500). Please send the next session date and payment details.",
  "diy-system":
    "I'd like the self-build Succession System (₱10,000). Please send payment details.\n\nOur organization has roughly this many positions: ",
  "done-for-you":
    "I'd like the Succession System built for us (₱30,000). Here's our situation:\n\n",
  consultancy:
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
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {FUNNEL_PATHS.map((path) => {
          const active = selected === path.id;
          return (
            <div
              key={path.id}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                active ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200 hover:shadow-md"
              }`}
            >
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
                <p className="absolute top-2.5 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm">
                  {formatTierPrice(path.price)}
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
                    className={`mt-4 w-full rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
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
              {chosen.id === "training"
                ? "Pick your seat on the next session and pay by GCash, Maya, GrabPay, or card."
                : chosen.price === null
                  ? "Tell us the shape of the organization and we'll come back with a scope and a figure — no obligation."
                  : "Send your details and we'll reply with payment instructions within one business day."}
            </p>
            {/* The ₱500 seat is the only tier with automated checkout. The others
                are scoped conversations, not things you buy off a page. */}
            {chosen.id === "training" ? (
              <div className="mt-8">
                <SessionCheckout
                  fallback={
                    <InquiryForm
                      presetMessage={MESSAGES.training}
                      presetService={FUNNEL_PATHS[0].matchingService}
                    />
                  }
                />
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <InquiryForm presetMessage={MESSAGES[chosen.id]} presetService={chosen.matchingService} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
