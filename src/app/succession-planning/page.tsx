import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/public/Reveal";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SuccessionLeadForm } from "@/components/public/SuccessionLeadForm";
import { SuccessionPaths } from "@/components/public/SuccessionPaths";
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
        <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
          <Image
            src="/photos/executive-boardroom.jpg"
            alt=""
            fill
            aria-hidden
            priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950" />
          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <p className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">
              Free succession planning toolkit
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight font-light text-white sm:text-5xl">
              Which of your positions would hurt most to lose tomorrow — and who is actually ready to
              take them?
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
              Most organizations cannot answer either question with a number. This workbook makes you
              answer both, in about an afternoon.
            </p>
            <a
              href="#get"
              className="mt-9 inline-flex items-center justify-center rounded-md bg-amber-400 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-xl"
            >
              Get the workbook — free
            </a>
            <p className="mt-4 text-sm text-slate-400">
              {WORKBOOK.sheetCount} sheets · Excel · no payment, no call required
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

        {/* What's inside */}
        <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <p className="text-center font-serif text-3xl font-light text-slate-900">
                What&apos;s in the workbook
              </p>
              <p className="mx-auto mt-3 max-w-xl text-center text-base text-slate-600">
                Every score, band, and count is a live formula. Fill in the ratings and the
                classifications follow.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {WORKBOOK.sheets.map(([name, detail], i) => (
                <Reveal key={name} delayMs={i * 60}>
                  <div className="flex h-full gap-4 rounded-xl border border-slate-200 bg-white p-6">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{name}</p>
                      <p className="mt-1.5 text-base text-slate-600">{detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
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
                    <p className="font-serif text-5xl font-light text-indigo-200">{i + 1}</p>
                    <p className="mt-2 font-semibold text-slate-900">{title}</p>
                    <p className="mt-2 text-base text-slate-600">{detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* The gate */}
        <section id="get" className="scroll-mt-4 border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <p className="text-center font-serif text-3xl font-light text-slate-900">
              Send me the workbook
            </p>
            <p className="mx-auto mt-3 max-w-md text-center text-base text-slate-600">
              Free, and yours to keep. Tell us where to send it and the download starts immediately.
            </p>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SuccessionLeadForm source="succession-planning" />
            </div>
          </div>
        </section>

        {/* The fork */}
        <section id="choose" className="scroll-mt-4 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                After the workbook
              </p>
              <p className="mt-3 font-serif text-3xl font-light text-slate-900 sm:text-4xl">
                Then close the gaps it finds.
              </p>
              <p className="mt-4 text-lg text-slate-600">
                The workbook will tell you where the bench is thin. What happens next depends on
                whether you want to build the capability internally or bring it in.
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
