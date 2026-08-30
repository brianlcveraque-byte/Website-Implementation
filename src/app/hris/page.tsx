import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExplainerVideo } from "@/components/public/ExplainerVideo";
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
            {/* Two rows, not one line.
                The offer has two halves and they were competing inside a single
                badge — ₱250 won on size and the free system read as small print
                after it. Split apart, the price stops being the loudest thing
                on the screen and FREE gets its own row, its own colour and its
                own weight. What people are being asked for is ₱250; what they
                are being offered is a system. The second is the reason to
                accept the first. */}
            <div className="funnel-float mx-auto inline-block max-w-md overflow-hidden rounded-2xl rotate-1 shadow-2xl ring-4 ring-white/50">
              <div className="flex items-center gap-4 bg-gradient-to-r from-lime-300 via-yellow-300 to-amber-400 px-6 py-3">
                <span className="font-sans text-5xl leading-none font-black tracking-tight text-slate-900 sm:text-6xl">
                  ₱250
                </span>
                <span className="text-left text-xs leading-tight font-extrabold tracking-wide text-slate-900 uppercase sm:text-sm">
                  1-hour practical
                  <br />
                  HR training
                </span>
              </div>
              <div className="flex items-center gap-4 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 px-6 py-3">
                <span className="font-display text-5xl leading-none font-black tracking-tight text-white sm:text-6xl">
                  FREE
                </span>
                <span className="text-left text-xs leading-tight font-extrabold tracking-wide text-white uppercase sm:text-sm">
                  your own HR system
                  <br />
                  <span className="text-fuchsia-100 normal-case">
                    201 file + customisable onboarding
                  </span>
                </span>
              </div>
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
              Book my session —{" "}
              <span className="font-sans">{formatHrisPrice(HRIS_ENTRY.price)}</span>
            </a>
            <p className="mt-5 text-sm font-semibold text-emerald-50">
              <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 backdrop-blur">
                System free for the first {HRIS_FREE_SEATS} enrolled
              </span>{" "}
              <span className="mt-2 inline-block sm:mt-0">· released when you attend</span>
            </p>
            {/* Said before the click, not after it. The dates are not fixed yet,
                and someone who books expecting to pick a slot on the next screen
                and finds none has been misled by omission. */}
            <p className="mx-auto mt-3 max-w-md text-sm text-emerald-100/85">
              Sessions run in small groups. Book your seat now and we&apos;ll email you the
              schedule as soon as the next date is set.
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
                What you get{" "}
                <span className="funnel-sheen bg-gradient-to-r from-emerald-600 via-teal-500 to-fuchsia-600">
                  free
                </span>
                , and what you don&apos;t
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600">
                We are not hiding the good bits behind a trial timer. The free modules are the ones
                you run every week; the paid ones are the strategic work we would otherwise be
                consulting on. Here is the whole thing, in about a minute and a half.
              </p>
            </Reveal>

            {/* The video sits with the free-versus-paid split rather than in the
                hero. Someone who has not yet decided to read does not want a
                video; someone weighing what is behind the paid column does.
                Safe on an ad landing page only because the file was remuxed to
                stream from the front — see scripts/faststart.mjs. */}
            <Reveal>
              <div className="mx-auto mt-8 max-w-3xl">
                <ExplainerVideo caption="Everything the system does — the free half and the paid half." />
              </div>
            </Reveal>

            {/* Not a two-column comparison of equals.
                Side by side at the same size, the paid column read as the real
                product and the free one as the trial. It is the other way
                round: the free half is the offer, and the paid half is there to
                prove the free half is not crippled. So the free card is wider,
                brighter and lifted, and the paid card is deliberately quiet. */}
            <div className="mt-10 grid gap-6 lg:grid-cols-5">
              <div className="funnel-glow relative overflow-hidden rounded-2xl border-4 border-emerald-400 bg-white p-6 shadow-2xl lg:col-span-3 lg:p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-lime-300/40 blur-3xl"
                />
                <div className="relative flex flex-wrap items-center gap-3">
                  <span className="font-display rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-1.5 text-2xl font-black tracking-tight text-white shadow-lg">
                    FREE
                  </span>
                  <p className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                    Yours, free, forever
                  </p>
                </div>
                <ul className="relative mt-6 space-y-4">
                  {FREE_MODULES.map(([name, detail]) => (
                    <li key={name} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-black text-white shadow"
                      >
                        ✓
                      </span>
                      <div>
                        <p className="font-display text-base font-bold text-slate-900">{name}</p>
                        <p className="mt-0.5 text-sm text-slate-600">{detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="relative mt-6 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-900">
                  Free for the first {HRIS_FREE_SEATS} enrolled — and it stays yours afterwards
                </p>
              </div>

              <div className="rounded-2xl border border-slate-300 bg-white/60 p-6 lg:col-span-2">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-slate-600 px-3 py-1 text-sm font-bold text-white">
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
              {/* The same two-part split as the hero, so the offer reads the
                  same way at the top of the page and at the point of decision. */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2">
                <span className="font-sans inline-block -rotate-1 rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 px-5 py-2 text-3xl font-black tracking-tight text-slate-900 shadow-xl ring-2 ring-white/60 sm:text-4xl">
                  {formatHrisPrice(HRIS_ENTRY.price)}
                </span>
                <span className="font-display text-2xl font-black text-slate-400">+</span>
                <span className="font-display inline-block rotate-1 rounded-xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 px-5 py-2 text-3xl font-black tracking-tight text-white shadow-xl ring-2 ring-white/60 sm:text-4xl">
                  FREE HRIS
                </span>
              </div>
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
                password — everything else is already set up.
              </p>
              <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                Sessions run in small groups, so dates are set as seats fill. We&apos;ll email you
                the schedule once the next one is confirmed.
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
