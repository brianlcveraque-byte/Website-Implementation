import type { Metadata } from "next";
import Image from "next/image";
import { FreeConsultationOffer } from "@/components/public/FreeConsultationOffer";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";

export const metadata: Metadata = {
  title: "About — Strategnosis Growth and Delivery Hub",
  description: "Richard S. Javier, MBA, PhD — two decades of management and healthcare consulting.",
};

const SECTORS = [
  "Government institutions",
  "Hospitals and healthcare organizations",
  "Universities and educational institutions",
  "Cooperatives",
  "International and development organizations",
  "Faith-based institutions",
  "Private companies",
  "Professional associations",
];

const QUALIFICATIONS = [
  "Organizational Development Consultant",
  "Management Consultant (International)",
  "Strategic Planning Facilitator",
  "Competency-Based HR Consultant",
  "Research Consultant — WHO, DOH, and NIH-affiliated studies",
  "International Lecturer and Facilitator",
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-slate-950 py-20 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <p className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">Principal consultant</p>
            <h1 className="mt-3 font-serif text-5xl font-light text-white">Richard S. Javier, MBA, PhD</h1>
            <p className="mt-3 text-lg text-slate-300">
              PhD, Organizational Development · MBA, Hospital Administration
            </p>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex items-start gap-6">
              <div
                aria-hidden
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-lg font-semibold text-white shadow-md"
              >
                RJ
              </div>
              <p className="text-lg text-slate-600">
                Two decades of management, organizational development, and healthcare consulting
                across the Philippines, Africa, and Southeast Asia — hospitals, universities,
                cooperatives, government agencies, and international development organizations.
                Findings from WHO-, DOH-, and NIH-affiliated research inform every engagement.
              </p>
            </div>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Sectors served</h2>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                  {SECTORS.map((s) => (
                    <li key={s} className="flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Qualifications</h2>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                  {QUALIFICATIONS.map((q) => (
                    <li key={q} className="flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 lg:grid-cols-2 lg:gap-12">
            <div className="relative h-72 overflow-hidden rounded-2xl lg:h-[420px]">
              <Image src="/photos/skyline-sunset.jpg" alt="City skyline" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">Regional reach</p>
              <p className="mt-2 font-serif text-4xl font-light text-slate-900 sm:text-5xl">
                Philippines. Africa. Southeast Asia.
              </p>
              <p className="mt-4 max-w-md text-lg text-slate-600">
                Engagements across the region, built on two decades of hands-on delivery — not
                just recommendations handed over.
              </p>
            </div>
          </div>
        </section>

        <FreeConsultationOffer />
      </main>
      <SiteFooter />
    </>
  );
}
