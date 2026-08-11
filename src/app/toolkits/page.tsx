import type { Metadata } from "next";
import Link from "next/link";
import { FreeConsultationOffer } from "@/components/public/FreeConsultationOffer";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { formatToolkitPrice, TOOLKITS } from "@/lib/toolkits";

export const metadata: Metadata = {
  title: "Starter Toolkits — Strategnosis Growth and Delivery Hub",
  description:
    "Practical templates for strategic planning, succession planning, HR systems, healthcare quality, and training — free to ₱5,000, no engagement required.",
};

export default function ToolkitsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-slate-950 py-20 text-center">
          <div className="mx-auto max-w-2xl px-4">
            <p className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">Starter toolkits</p>
            <h1 className="mt-3 font-serif text-5xl font-light text-white">Start smaller than an engagement.</h1>
            <p className="mt-4 text-lg text-slate-300">
              Practical templates you can put to work today — free to ₱5,000, built from the same
              frameworks used in full engagements.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLKITS.map((t) => (
                <div
                  key={t.slug}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">{t.pillarTag}</p>
                    <p
                      className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                        t.price === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {formatToolkitPrice(t.price)}
                    </p>
                  </div>
                  <p className="mt-3 font-serif text-xl font-light text-slate-900">{t.name}</p>
                  <p className="mt-2 text-sm text-slate-600">{t.tagline}</p>
                  <ul className="mt-4 space-y-1.5">
                    {t.includes.map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-sm text-slate-700">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-slate-500 italic">{t.idealFor}</p>
                  <Link
                    href={`/?toolkit=${t.slug}#contact`}
                    className="mt-5 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    Get this toolkit
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <p className="text-center font-serif text-3xl font-light text-slate-900">How it works</p>
            <div className="mt-8 space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-900">1. Send an inquiry</p>
                <p className="mt-1 text-sm text-slate-600">
                  Click &ldquo;Get this toolkit&rdquo; and the contact form below will be pre-filled with the
                  toolkit you picked.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">2. Confirm details</p>
                <p className="mt-1 text-sm text-slate-600">
                  For paid toolkits, we&apos;ll reply with GCash or bank transfer details. Free toolkits
                  skip straight to step 3.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">3. Get your toolkit</p>
                <p className="mt-1 text-sm text-slate-600">
                  We&apos;ll email your templates and guide within 1 business day (once payment is
                  confirmed, for paid toolkits).
                </p>
              </div>
            </div>
          </div>
        </section>

        <FreeConsultationOffer />
      </main>
      <SiteFooter />
    </>
  );
}
