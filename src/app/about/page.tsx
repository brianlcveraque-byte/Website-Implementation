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
        {/* Photo hero */}
        <section className="relative isolate overflow-hidden py-24 text-center sm:py-32">
          <Image src="/photos/executive-boardroom.jpg" alt="" fill priority className="-z-10 object-cover" sizes="100vw" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-slate-950/80" />
          <div className="mx-auto max-w-3xl px-4">
            <p className="text-xs font-semibold tracking-widest text-indigo-300 uppercase">Principal consultant</p>
            <h1 className="mt-3 font-serif text-5xl font-light text-white sm:text-6xl">Richard S. Javier, MBA, PhD</h1>
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
          </div>
        </section>

        {/* Sectors — photo beside the list */}
        <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 lg:grid-cols-2 lg:gap-12">
            <div className="relative h-72 overflow-hidden rounded-2xl lg:h-[400px]">
              <Image src="/photos/boardroom.jpg" alt="" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">Sectors served</h2>
              <p className="mt-2 font-serif text-4xl font-light text-slate-900">Eight sectors, one standard.</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {SECTORS.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-base text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Qualifications — photo on the other side */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 lg:grid-cols-2 lg:gap-12">
            <div className="order-2 lg:order-1">
              <h2 className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">Qualifications</h2>
              <p className="mt-2 font-serif text-4xl font-light text-slate-900">Credentialed and field-tested.</p>
              <ul className="mt-5 space-y-2">
                {QUALIFICATIONS.map((q) => (
                  <li key={q} className="flex items-start gap-2 text-base text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative order-1 h-72 overflow-hidden rounded-2xl lg:order-2 lg:h-[400px]">
              <Image src="/photos/library-research.jpg" alt="" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          </div>
        </section>

        {/* Photo strip */}
        <section className="bg-white pb-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {["/photos/business-meeting.jpg", "/photos/facilitation-workshop.jpg", "/photos/healthcare-corridor.jpg"].map((src) => (
                <div key={src} className="relative h-48 overflow-hidden rounded-2xl">
                  <Image src={src} alt="" fill className="object-cover" sizes="(min-width: 640px) 33vw, 100vw" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regional reach */}
        <section className="relative isolate overflow-hidden py-20 text-center">
          <Image src="/photos/skyline-sunset.jpg" alt="" fill className="-z-10 object-cover" sizes="100vw" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-indigo-950/80" />
          <div className="mx-auto max-w-2xl px-4">
            <p className="text-sm font-semibold tracking-wide text-indigo-200 uppercase">Regional reach</p>
            <p className="mt-2 font-serif text-4xl font-light text-white sm:text-5xl">
              Philippines. Africa. Southeast Asia.
            </p>
            <p className="mt-4 text-lg text-indigo-100">
              Engagements across the region, built on two decades of hands-on delivery — not just
              recommendations handed over.
            </p>
          </div>
        </section>

        <FreeConsultationOffer />
      </main>
      <SiteFooter />
    </>
  );
}
