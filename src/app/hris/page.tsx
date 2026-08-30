import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HrisPaths } from "@/components/public/HrisPaths";
import { Reveal } from "@/components/public/Reveal";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import {
  FREE_MODULES,
  HRIS_ENTRY,
  HRIS_FREE_SEATS,
  PAID_MODULES,
  formatHrisPrice,
} from "@/lib/hris-funnel";

// The HRIS funnel, structured like /succession-planning on purpose. Ends on the
// priced ladder rather than the site-wide consultation offer — a third option
// at the point of decision is how a funnel leaks.

export const metadata: Metadata = {
  title: "₱250 HR training + your own HR system | Strategnosis",
  description:
    "A real HR information system with employee records and new-hire onboarding, free. Your own workspace in about a minute, plus a live session with an HR expert.",
};

export default function HrisPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <Image
            src="/photos/open-office.jpg"
            alt=""
            fill
            aria-hidden
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-800/95 via-teal-700/95 to-cyan-900/95"
          />
          {/* Colour that does not belong to the brand palette, on purpose. The
              blobs are what stop the hero reading as another green SaaS header
              — fuchsia and lime against teal is a jolt, and a jolt is the whole
              job of the first screen someone sees after tapping an ad. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-lime-300/35 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-28 -bottom-36 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <div className="funnel-float inline-flex rotate-1 items-center gap-4 rounded-2xl bg-gradient-to-r from-lime-300 via-yellow-300 to-amber-400 px-7 py-3.5 shadow-2xl ring-4 ring-white/50">
              <span className="font-display text-6xl leading-none font-black tracking-tight text-slate-900 sm:text-7xl">
                ₱250
              </span>
              <span className="max-w-[11rem] text-left text-xs leading-tight font-extrabold tracking-wide text-slate-900 uppercase sm:text-sm">
                1-hour practical HR training + your own HR system
              </span>
            </div>

            <h1 className="font-display mt-9 text-4xl leading-[1.08] font-extrabold tracking-tight text-white sm:text-6xl">
              Your last new hire spent week one{" "}
              <span className="funnel-sheen bg-gradient-to-r from-lime-300 via-amber-300 to-fuchsia-300">
                chasing forms
              </span>{" "}
              — and nobody could say what they had finished.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-emerald-50 sm:text-xl">
              One hour with an HR practitioner on how to fix that — and the system to fix it in.
              Your 201 files and new-hire onboarding, your own workspace, yours to keep.
            </p>
            <a
              href={HRIS_ENTRY.href}
              className="funnel-glow font-display mt-10 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400 px-12 py-5 text-xl font-black tracking-tight text-slate-900 ring-4 ring-white/40 transition-all hover:-translate-y-1 hover:from-amber-200 hover:to-orange-300 sm:text-2xl"
            >
              Book my session — {formatHrisPrice(HRIS_ENTRY.price)}
            </a>
            <p className="mt-5 text-sm font-semibold text-emerald-50">
              <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 backdrop-blur">
                System free for the first {HRIS_FREE_SEATS} enrolled
              </span>{" "}
              <span className="mt-2 inline-block sm:mt-0">· released when you attend</span>
            </p>
          </div>
        </section>

        {/* The problem */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <Reveal>
              <p className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                HR systems fail for the same reason every time.
              </p>
              <div className="mt-6 space-y-4 text-lg text-slate-600">
                <p>
                  Not because the software is bad. Because nobody ever finishes entering the data.
                  A competency framework with forty employees in it and four hundred outside it
                  tells you nothing, so people quietly go back to the spreadsheet.
                </p>
                <p>
                  So start where the data arrives on its own. Every new hire has to be recorded
                  anyway — the forms, the orientation, the thirty-day check. Run that in the system
                  and the employee database builds itself, one person at a time, without anyone
                  being asked to migrate anything.
                </p>
                <p>
                  And give the new hire their own login, so they work through their own checklist.
                  That is the difference between a record of what HR believes happened and a
                  record of what the person actually did.
                </p>
                <p className="font-medium text-slate-900">
                  That is what you get with the session: onboarding and the 201 file it fills. Not a demo
                  with a countdown — the part you would be doing by hand regardless.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* What's free vs paid */}
        <section className="border-y border-slate-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <p className="font-display text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                What you get free, and what you don&apos;t
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600">
                We are not hiding the good bits behind a trial timer. The free modules are the ones
                you run every week; the paid ones are the strategic work we would otherwise be
                consulting on.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border-2 border-emerald-400 bg-white p-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-emerald-500 px-3 py-1 text-sm font-black text-white">
                    FREE
                  </span>
                  <p className="font-display text-xl font-bold text-slate-900">Yours, free, forever</p>
                </div>
                <ul className="mt-5 space-y-4">
                  {FREE_MODULES.map(([name, detail]) => (
                    <li key={name} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
                      >
                        ✓
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{name}</p>
                        <p className="mt-0.5 text-sm text-slate-600">{detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-300 bg-white/70 p-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-slate-700 px-3 py-1 text-sm font-bold text-white">
                    PAID
                  </span>
                  <p className="font-display text-xl font-bold text-slate-900">
                    Unlocked when you go further
                  </p>
                </div>
                <ul className="mt-5 space-y-3">
                  {PAID_MODULES.map(([name, detail]) => (
                    <li key={name} className="flex gap-3">
                      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{name}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-600 italic">
              Every module is a switch, not a separate product. Nothing is migrated or rebuilt when
              you upgrade — the data you have already entered is what the paid modules run on.
            </p>
          </div>
        </section>

        {/* The gate */}
        <section
          id="get"
          className="scroll-mt-4 border-y-4 border-emerald-400 bg-gradient-to-br from-lime-50 via-emerald-50 to-teal-50 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-2xl px-4">
            <div className="text-center">
              <span className="inline-block -rotate-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-3xl font-black tracking-tight text-white shadow-xl sm:text-4xl">
                {formatHrisPrice(HRIS_ENTRY.price)}
              </span>
              <p className="font-display mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                The training, and the system to use it in
              </p>
              <p className="mx-auto mt-3 max-w-md text-base text-slate-700">
                One hour live with an HR practitioner, worked through your own situation. Attend,
                and the workspace is yours — your own employee database, nobody else&apos;s.
                Included for the first {HRIS_FREE_SEATS} enrolments.
              </p>
            </div>
            <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-white p-6 text-center shadow-xl sm:p-8">
              <ul className="mb-6 space-y-3 text-left">
                {HRIS_ENTRY.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={HRIS_ENTRY.href}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400"
              >
                Book my session — {formatHrisPrice(HRIS_ENTRY.price)}
              </a>
              <p className="mt-4 text-sm text-slate-600">
                The workspace takes about a minute to create. You choose an address and a
                password — everything else is already set up. We confirm the session time by
                email.
              </p>
            </div>
          </div>
        </section>

        {/* The ladder */}
        <section id="choose" className="scroll-mt-4 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">
                After the session
              </p>
              <p className="font-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Then take it as far as you need.
              </p>
              <p className="mt-4 text-lg text-slate-600">
                From a workshop on how the whole system fits together, to having it built against
                your own plantilla and handed over working.
              </p>
            </div>
            <div className="mt-12">
              <HrisPaths />
            </div>
          </div>
        </section>

        {/* Quiet exit */}
        <section className="border-t border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <p className="text-base text-slate-600">
              Facing a leadership transition rather than an HR systems problem? The{" "}
              <Link
                href="/succession-planning"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                succession planning toolkit
              </Link>{" "}
              is free too.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
