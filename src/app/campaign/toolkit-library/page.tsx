import type { Metadata } from "next";
import Image from "next/image";
import { InquiryForm } from "@/components/public/InquiryForm";
import { TestimonialSlot } from "@/components/public/TestimonialSlot";
import { formatToolkitPrice, TOOLKITS } from "@/lib/toolkits";

// A single-offer, no-nav landing page for paid traffic — deliberately
// separate from the main site (no SiteHeader/SiteFooter) so the only path
// forward is the one offer below. Not meant for organic discovery, hence
// robots: noindex.

const BUNDLE = TOOLKITS.find((t) => t.slug === "complete-toolkit-library")!;
const savings = (BUNDLE.bundleValue ?? 0) - BUNDLE.price;

export const metadata: Metadata = {
  title: "Complete Toolkit Library — Strategnosis",
  description: BUNDLE.tagline,
  robots: { index: false, follow: false },
};

export default function ToolkitLibraryCampaignPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex justify-center py-6">
        <Image src="/brand/logo-light.png" alt="Strategnosis Solutions OPC" width={160} height={67} className="h-8 w-auto" />
      </div>

      <main className="flex-1">
        <section className="bg-slate-950 py-16 text-center sm:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <p className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">Bundle offer</p>
            <h1 className="mt-3 font-serif text-4xl font-light text-white sm:text-5xl">
              Every toolkit we offer, for less than the price of any two.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-slate-300">{BUNDLE.tagline}</p>
            <a
              href="#get-it"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-amber-400 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-xl"
            >
              Get the Complete Library — {formatToolkitPrice(BUNDLE.price)}
            </a>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <p className="text-center font-serif text-3xl font-light text-slate-900">What&apos;s inside</p>
            <div className="mt-8 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
              {BUNDLE.includes.map((item) => {
                const t = TOOLKITS.find((tk) => tk.name === item);
                return (
                  <div key={item} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden>
                        ✓
                      </span>
                      <span className="text-base text-slate-800">{item}</span>
                    </div>
                    {t && <span className="shrink-0 text-sm text-slate-400 line-through">{formatToolkitPrice(t.price)}</span>}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                Total value <span className="line-through">{formatToolkitPrice(BUNDLE.bundleValue ?? 0)}</span>
              </p>
              <p className="mt-1 font-serif text-4xl font-light text-slate-900">{formatToolkitPrice(BUNDLE.price)}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">You save {formatToolkitPrice(savings)}</p>
            </div>
          </div>
        </section>

        <TestimonialSlot />

        <section className="relative overflow-hidden bg-indigo-600 py-16 text-center sm:py-20">
          <Image src={BUNDLE.photo} alt="" fill aria-hidden className="object-cover opacity-20 mix-blend-luminosity" sizes="100vw" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-indigo-600/80" />
          <div className="relative mx-auto max-w-2xl px-4">
            <p className="font-serif text-3xl font-light text-white sm:text-4xl">
              Six toolkits. One price. Start today.
            </p>
            <a
              href="#get-it"
              className="mt-6 inline-block rounded-md bg-amber-400 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-xl"
            >
              Get the Complete Library — {formatToolkitPrice(BUNDLE.price)}
            </a>
          </div>
        </section>

        <section id="get-it" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <p className="text-center font-serif text-3xl font-light text-slate-900">Get the Complete Toolkit Library</p>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate-500">
              Send your details and we&apos;ll reply with GCash or bank transfer instructions, then email
              every toolkit within 1 business day of payment.
            </p>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <InquiryForm presetToolkitSlug="complete-toolkit-library" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Strategnosis Solutions OPC. ·{" "}
          <a href="/privacy" className="hover:text-slate-600">
            Privacy notice
          </a>
        </p>
      </footer>
    </div>
  );
}
