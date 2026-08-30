import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { HRIS_ENTRY, HRIS_FREE_SEATS, HRIS_NEXT_URL, formatHrisPrice } from "@/lib/hris-funnel";

// The step between the offer and the workspace.
//
// It takes no money. PayMongo is written but unverified, and the point of this
// page today is to prove the rest of the path works — offer, sign-up, an
// isolated workspace on its own subdomain — without waiting for the payment
// half.
//
// So it says so, plainly, above the button. A checkout that looks real and
// charges nothing is worse than no checkout: someone would leave believing they
// had paid and expecting a receipt. Everything here is either true now or
// clearly marked as not yet running. There is no card field, because there is
// nothing to put in it.

export const metadata: Metadata = {
  title: "Start — Practical HR Session | Strategnosis",
  description:
    "One hour of practical HR training and your own HR system for 201 files and new-hire onboarding.",
  // Not somewhere a search result should land while the payment step is a
  // placeholder.
  robots: { index: false, follow: false },
};

export default function HrisStartPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">
            Step 1 of 2
          </p>
          <h1 className="mt-3 font-serif text-3xl font-light text-slate-900 sm:text-4xl">
            {HRIS_ENTRY.name}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{HRIS_ENTRY.summary}</p>

          <div className="mt-8 overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white shadow-xl">
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 bg-emerald-50/60 px-6 py-5">
              <div>
                <p className="font-serif text-xl font-light text-slate-900">
                  {HRIS_ENTRY.name}
                </p>
                <p className="mt-1 text-sm text-slate-600">{HRIS_ENTRY.duration}</p>
              </div>
              <p className="text-3xl font-black tracking-tight text-slate-900">
                {formatHrisPrice(HRIS_ENTRY.price)}
              </p>
            </div>

            <ul className="space-y-3 px-6 py-6">
              {HRIS_ENTRY.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="border-t-2 border-dashed border-amber-300 bg-amber-50 px-6 py-5">
              <p className="text-sm font-bold text-amber-900">
                No payment is being taken on this page.
              </p>
              <p className="mt-1.5 text-sm text-amber-900/90">
                Card payments are not switched on yet, so nothing will be charged and you will not
                be asked for card details. Continue and your seat is held — we will contact you
                about the session and the ₱250 afterwards. The workspace is released when you
                attend, and is included for the first {HRIS_FREE_SEATS} enrolments.
              </p>
            </div>

            <div className="px-6 py-6">
              <a
                href={HRIS_NEXT_URL}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400"
              >
                Continue — confirm my seat
              </a>
              <p className="mt-4 text-center text-sm text-slate-600">
                Next you will see what the session covers and the two ways to take the system
                further. Nothing else is asked of you here.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/hris" className="font-semibold text-emerald-700 hover:text-emerald-600">
              Back to the details
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
