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
      <main className="flex-1 bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <p className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-1 text-xs font-extrabold tracking-wide text-white uppercase shadow">
            Step 1 of 2
          </p>
          <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {HRIS_ENTRY.name}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{HRIS_ENTRY.summary}</p>

          <div className="mt-8 overflow-hidden rounded-2xl border-2 border-emerald-300 bg-white shadow-2xl">
            <div className="h-2 bg-gradient-to-r from-lime-400 via-emerald-500 to-cyan-500" aria-hidden />
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5">
              <div>
                <p className="font-display text-xl font-bold text-slate-900">
                  {HRIS_ENTRY.name}
                </p>
                <p className="mt-1 text-sm text-slate-600">{HRIS_ENTRY.duration}</p>
              </div>
              <p className="font-sans rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-2 text-3xl font-black tracking-tight text-slate-900 shadow-lg ring-2 ring-white/60">
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
                className="funnel-glow font-display inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-5 text-xl font-black tracking-tight text-white ring-2 ring-emerald-200 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-cyan-400"
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
