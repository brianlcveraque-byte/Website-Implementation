import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { HrisEnrolForm } from "@/components/public/HrisEnrolForm";
import { HRIS_ENTRY, HRIS_FREE_SEATS, formatHrisPrice } from "@/lib/hris-funnel";

// Where a visitor becomes an enrolment.
//
// It takes no money and never did — the session is free, so there is no card
// field because there is nothing to put in one.
//
// Until September 2026 this page ended in a link rather than a form, which
// meant the whole funnel captured nobody: someone could read the offer, click
// "confirm my seat", and leave without a row being written, an email being
// sent, or anyone being told. The form is the page.

export const metadata: Metadata = {
  title: "Start — Practical HR Session | Strategnosis",
  description:
    "One hour of practical HR training and your own HR system for 201 files and new-hire onboarding.",
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

            {/* This panel used to exist to explain that the ₱250 checkout was
                not really charging anything. The session is free now, so there
                is nothing to explain away — it says what happens next instead,
                which is the only thing still unresolved at this point. */}
            <div className="border-t-2 border-dashed border-emerald-300 bg-emerald-50 px-6 py-5">
              <p className="text-sm font-bold text-emerald-900">
                Free. No card, no payment, nothing owed afterwards.
              </p>
              <p className="mt-1.5 text-sm text-emerald-900/90">
                Continue and your seat is held. Sessions run in small groups so the date follows
                who has enrolled — we will email you the schedule and the joining link before
                anyone else hears it. The workspace is released when you attend, and is included
                for the first {HRIS_FREE_SEATS} enrolments.
              </p>
            </div>

            {/* The actual gate. This page used to end in a link to /hris/next,
                which meant a visitor could read the entire offer, click
                "confirm my seat", and leave without anyone knowing they had
                been — no row, no welcome email, no alert. Three fields is the
                most that can be asked for before a free session without the
                asking becoming the reason people leave. */}
            <div className="px-6 py-6">
              <HrisEnrolForm source="hris-start" />
              <p className="mt-4 text-center text-sm text-slate-600">
                Sessions run in small groups, so the date follows who has enrolled. We&apos;ll email
                you the schedule and the joining link before anyone else hears it.
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
