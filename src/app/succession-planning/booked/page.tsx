import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { WORKBOOK } from "@/lib/succession-funnel";

// Where PayMongo returns a buyer after a successful payment (success_url in
// create-checkout). Deliberately makes no promise that payment has cleared —
// only the webhook knows that, and a buyer landing here after an abandoned
// card 3DS step would be told a lie. It confirms the redirect, not the money.

export const metadata: Metadata = {
  title: "Seat booked — Strategnosis",
  description: "Your seat on the Succession Planning Essentials live session.",
  robots: { index: false, follow: false },
};

export default function BookedPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-white">
        <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
          <span
            aria-hidden
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700"
          >
            ✓
          </span>
          <h1 className="mt-6 font-serif text-4xl font-light text-slate-900">Thank you.</h1>
          <p className="mt-4 text-lg text-slate-600">
            Once your payment clears we&apos;ll email your seat confirmation with the session date
            and joining link. That usually arrives within a few minutes.
          </p>

          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 text-left">
            <p className="font-semibold text-slate-900">While you wait — fill in the workbook</p>
            <p className="mt-2 text-base text-slate-600">
              The session works through <em>your</em> numbers rather than a worked example. Scoring
              even ten positions on the criticality sheet beforehand makes the two hours
              considerably more useful.
            </p>
            <a
              href={WORKBOOK.path}
              download={WORKBOOK.filename}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Download the workbook
            </a>
          </div>

          <p className="mt-10 text-sm text-slate-500">
            Nothing in your inbox after an hour? Reply to any of our emails, or{" "}
            <Link href="/#contact" className="font-semibold text-indigo-600 hover:text-indigo-500">
              get in touch
            </Link>{" "}
            and we&apos;ll sort it out.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
