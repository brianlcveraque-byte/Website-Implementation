import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/public/Reveal";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SuccessionLeadForm } from "@/components/public/SuccessionLeadForm";
import { SuccessionPaths } from "@/components/public/SuccessionPaths";
import { WorkbookPreview } from "@/components/public/WorkbookPreview";
import { WORKBOOK } from "@/lib/succession-funnel";

// The succession funnel's own page — indexed and linked from /toolkits, unlike
// the noindex single-offer pages under /campaign. Deliberately ends on the
// two-tier choice rather than the site-wide free consultation offer: giving
// someone a third option at the point of decision is how a funnel leaks.

export const metadata: Metadata = {
  title: "Succession Planning Toolkit — free workbook | Strategnosis",
  description:
    "A free succession planning workbook that scores which roles are critical and who is ready to fill them. Then two ways to close the gaps it finds: learn to run the process, or have it run for you.",
};

const STEPS = [
  ["Score your positions", "Rate each role on revenue contribution, risk exposure, and specialization. The workbook bands it from Noncritical to Highly Critical for you."],
  ["Assess your people", "Rate candidates against seven criteria. Overall match and readiness status compute themselves."],
  ["Read the bench", "Depth and strength count automatically, and any critical role with nobody behind it is flagged."],
];

export default function SuccessionPlanningPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <Image
            src="/photos/executive-boardroom.jpg"
            alt=""
            fill
            aria-hidden
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-700/95 via-violet-700/95 to-fuchsia-700/95"
          />
          {/* Colour blooms — pure decoration, and the reason the gradient reads
              as lively rather than as a flat corporate wash. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-cyan-400/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <div className="inline-flex -rotate-2 items-center gap-4 rounded-2xl bg-gradient-to-r from-lime-300 via-yellow-300 to-amber-300 px-6 py-3 shadow-2xl ring-4 ring-white/40">
              <span className="text-5xl leading-none font-black tracking-tight text-slate-900 sm:text-6xl">
                FREE
              </span>
              <span className="max-w-[9rem] text-left text-xs leading-tight font-bold tracking-wide text-slate-800 uppercase sm:text-sm">
                Succession planning toolkit
              </span>
            </div>

            <h1 className="mt-8 font-serif text-4xl leading-tight font-light text-white sm:text-5xl">
              Which of your positions would hurt most to lose tomorrow — and who is actually ready to
              take them?
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-indigo-100">
              Most organizations cannot answer either question with a number. This workbook makes you
              answer both, in about an afternoon.
            </p>
            <a
              href="#get"
              className="mt-9 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-300 to-yellow-400 px-10 py-4 text-lg font-black text-slate-900 shadow-2xl ring-2 ring-white/30 transition-all hover:-translate-y-1 hover:from-amber-200 hover:to-yellow-300 hover:shadow-amber-400/40"
            >
              Download it free — ₱0
            </a>
            <p className="mt-4 text-sm font-medium text-indigo-100">
              {WORKBOOK.sheetCount} sheets · Excel · no payment, no card, no call
            </p>
          </div>
        </section>

        {/* The problem it makes visible */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <Reveal>
              <p className="font-serif text-3xl font-light text-slate-900">
                Succession plans usually fail quietly.
              </p>
              <div className="mt-6 space-y-4 text-lg text-slate-600">
                <p>
                  Not because nobody wrote one, but because the one that exists names a successor for
                  the roles everyone already worries about, and says nothing about the specialist
                  three levels down whose departure would stop a process cold.
                </p>
                <p>
                  The fix is not a longer document. It is scoring every position on the same criteria,
                  so criticality is something you can defend rather than something you assert — and
                  then scoring the people against the same scale, so &ldquo;ready&rdquo; means the
                  same thing in every conversation about it.
                </p>
                <p className="font-medium text-slate-900">
                  That is all this workbook does. It is the instrument, not the advice.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* A look inside the actual file */}
        <section className="border-y border-slate-200 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <Reveal>
              <p className="text-center font-serif text-3xl font-light text-slate-900">
                A look inside
              </p>
              <p className="mx-auto mt-3 max-w-xl text-center text-base text-slate-600">
                Three of the eight sheets, shown filled in. The file itself arrives blank apart from
                one example row.
              </p>
            </Reveal>
            <div className="mt-10">
              <WorkbookPreview />
            </div>

            <div className="mt-14">
              <p className="text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Everything in the file
              </p>
              <div className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {WORKBOOK.sheets.map(([name, detail], i) => (
                  <Reveal key={name} delayMs={i * 50}>
                    <div className="border-l-2 border-indigo-200 pl-4">
                      <p className="text-sm font-semibold text-slate-900">{name}</p>
                      <p className="mt-1 text-sm text-slate-600">{detail}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <p className="text-center font-serif text-3xl font-light text-slate-900">
              Three passes, and you have a plan
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {STEPS.map(([title, detail], i) => (
                <Reveal key={title} delayMs={i * 80}>
                  <div>
                    <p className="bg-gradient-to-br from-fuchsia-500 to-indigo-600 bg-clip-text font-serif text-6xl font-light text-transparent">
                      {i + 1}
                    </p>
                    <p className="mt-2 font-bold text-slate-900">{title}</p>
                    <p className="mt-2 text-base text-slate-600">{detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* The gate */}
        <section
          id="get"
          className="scroll-mt-4 border-y-4 border-emerald-400 bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-2xl px-4">
            <div className="text-center">
              <span className="inline-block rotate-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-3xl font-black tracking-tight text-white shadow-xl sm:text-4xl">
                100% FREE
              </span>
              <p className="mt-5 font-serif text-3xl font-light text-slate-900">
                Send me the workbook
              </p>
              <p className="mx-auto mt-3 max-w-md text-base text-slate-700">
                Yours to keep, no strings. Tell us where to send it and the download starts
                immediately.
              </p>
            </div>
            <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-xl sm:p-8">
              <SuccessionLeadForm source="succession-planning" />
            </div>
          </div>
        </section>

        {/* The fork */}
        <section id="choose" className="scroll-mt-4 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                After the workbook
              </p>
              <p className="mt-3 font-serif text-3xl font-light text-slate-900 sm:text-4xl">
                Then close the gaps it finds.
              </p>
              <p className="mt-4 text-lg text-slate-600">
                The workbook will tell you where the bench is thin. Closing that gap ranges from
                learning the method yourself to having the whole thing built for you — four options,
                and the workbook stays free either way.
              </p>
            </div>
            <div className="mt-12">
              <SuccessionPaths />
            </div>
          </div>
        </section>

        {/* Quiet exit for people not ready for either tier */}
        <section className="border-t border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <p className="text-base text-slate-600">
              Not ready for either? The workbook is genuinely free and stands on its own — or browse
              the{" "}
              <Link href="/toolkits" className="font-semibold text-indigo-600 hover:text-indigo-500">
                other starter toolkits
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
