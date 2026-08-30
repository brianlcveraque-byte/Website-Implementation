import type { Metadata } from "next";
import Link from "next/link";
import { ExplainerVideo } from "@/components/public/ExplainerVideo";
import { HrisNextChoice } from "@/components/public/HrisNextChoice";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { HRIS_ENTRY, HRIS_FREE_SEATS, HRIS_SIGNUP_URL } from "@/lib/hris-funnel";

// Where a paid enrolment lands, before the session has happened.
//
// The moment someone has paid is the moment they are most willing to consider
// paying more, so the two system tiers are offered here rather than left for a
// follow-up email competing with everything else in an inbox.
//
// Two options, not three. HR consulting is a quiet line at the bottom rather
// than a card beside them: it is unpriced and open-ended, and an unpriced third
// option next to two priced ones is where a funnel leaks — someone who would
// have bought the ₱20,000 asks for a quote instead and is never heard from
// again. Anyone who genuinely wants an engagement will follow the link.

export const metadata: Metadata = {
  title: "Enrolled — what comes next | Strategnosis",
  description: "Your seat is booked. The two ways to take the HR system further.",
  // Reached by paying, not by searching.
  robots: { index: false, follow: false },
};

export default function HrisNextPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        {/* Confirmation */}
        <section className="relative overflow-hidden border-b-4 border-emerald-400 bg-gradient-to-br from-lime-100 via-emerald-50 to-cyan-100 py-14 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-fuchsia-300/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-amber-300/40 blur-3xl"
          />
          <div className="relative mx-auto max-w-2xl px-4 text-center">
            <span className="funnel-float font-display inline-block -rotate-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-2.5 text-3xl font-black tracking-tight text-white shadow-2xl ring-4 ring-white/50 sm:text-4xl">
              You&apos;re in
            </span>
            <h1 className="font-display mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Your seat on the {HRIS_ENTRY.name} is booked.
            </h1>
            <p className="mt-4 text-lg text-slate-700">
              Sessions run in small groups, so dates are set as seats fill.{" "}
              <strong className="text-slate-900">
                We&apos;ll email you the schedule and joining link once the next one is confirmed.
              </strong>{" "}
              Your HR workspace — the 201 file and new-hire onboarding — is released when you
              attend, and it stays yours afterwards.
            </p>
            <p className="mx-auto mt-4 max-w-md rounded-xl border border-emerald-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
              The workspace is included for the first{" "}
              <span className="font-bold text-slate-900">{HRIS_FREE_SEATS} enrolments</span>. You
              are inside that.
            </p>
          </div>
        </section>

        {/* The two system tiers */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">
                While you wait for the session
              </p>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                The hour covers your onboarding. These cover everything after it.
              </p>
              <p className="mt-4 text-lg text-slate-600">
                The workspace you get is the operational half — 201 files and onboarding. The
                strategic half, competencies through succession, is the part that takes a build.
                Ninety seconds on what that looks like, then two ways to have it.
              </p>
            </div>

            {/* The explainer sits before the prices, not after.
                Nobody weighs ₱20,000 against ₱75,000 until they know what is
                actually being built. preload="metadata" fetches the header and
                a first frame rather than the whole 19MB — the file only lands
                in full for someone who presses play, which on this page is
                someone already deciding. */}
            <div className="mt-12">
              <ExplainerVideo caption="The full system, in about a minute and a half." />
            </div>

            <div className="mt-12">
              <HrisNextChoice />
            </div>

            <p className="mx-auto mt-10 max-w-xl text-center text-sm text-slate-500">
              Neither is a subscription. Both are one-time, and both leave you with a system you
              own and can export in full.
            </p>
          </div>
        </section>

        {/* Placeholder while checkout is not live */}
        <section className="border-y-2 border-dashed border-amber-300 bg-amber-50 py-10">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <p className="text-sm font-bold text-amber-900">Testing: workspace not yet gated.</p>
            <p className="mt-1.5 text-sm text-amber-900/90">
              Payments are not switched on, so nothing was charged and attendance is not being
              checked yet. While that is true, you can create the workspace now instead of waiting
              for the session.
            </p>
            <a
              href={HRIS_SIGNUP_URL}
              className="mt-5 inline-flex items-center justify-center rounded-xl border-2 border-amber-400 bg-white px-6 py-3 text-sm font-bold text-amber-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-100"
            >
              Create my workspace now
            </a>
          </div>
        </section>

        {/* Quiet exit */}
        <section className="py-14">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <p className="text-base text-slate-600">
              Not a systems problem? If what you need is someone alongside you on the HR decisions
              themselves,{" "}
              <Link
                href="/services/strategy-leadership"
                className="font-semibold text-emerald-700 hover:text-emerald-600"
              >
                we do consulting engagements
              </Link>{" "}
              too.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
