import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FreeConsultationOffer } from "@/components/public/FreeConsultationOffer";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { PILLARS } from "@/lib/pillars";
import { SERVICE_CATEGORIES } from "@/lib/services-catalogue";

export const metadata: Metadata = {
  title: "Services — Strategnosis Growth and Delivery Hub",
  description: "Eighteen service areas across strategy, healthcare, and organizational development.",
};

const APPROACH = [
  {
    photo: "/photos/business-meeting.jpg",
    label: "Discovery",
    text: "We start inside your context — constraints, politics, and what has already been tried.",
  },
  {
    photo: "/photos/meeting-room.jpg",
    label: "Design",
    text: "Frameworks adapted to your institution, not lifted from a template library.",
  },
  {
    photo: "/photos/facilitation-workshop.jpg",
    label: "Delivery",
    text: "Facilitation and implementation support — we stay through the doing, not just the planning.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Full-bleed photo hero */}
        <section className="relative isolate overflow-hidden py-28 text-center sm:py-36">
          <Image src="/photos/corporate-tower.jpg" alt="" fill priority className="-z-10 object-cover" sizes="100vw" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-slate-950/75" />
          <div className="mx-auto max-w-3xl px-4">
            <p className="text-xs font-semibold tracking-widest text-indigo-300 uppercase">Services</p>
            <h1 className="mt-3 font-serif text-5xl font-light text-white sm:text-6xl">Eighteen service areas.</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-200">
              Grouped into three practice areas, built on two decades across the Philippines, Africa,
              and Southeast Asia.
            </p>
          </div>
        </section>

        {/* Practice area cards */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-6 sm:grid-cols-3">
              {PILLARS.map((p) => (
                <Link key={p.slug} href={`/services/${p.slug}`} className="group block">
                  <div className="relative h-56 overflow-hidden rounded-2xl">
                    <Image
                      src={p.photo}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 640px) 33vw, 100vw"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                    <span className="absolute bottom-4 left-4 right-4 text-lg font-semibold text-white">{p.tag}</span>
                  </div>
                  <p className="mt-3 text-base text-slate-600">{p.summary}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:text-indigo-500">
                    See details <span aria-hidden>→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How we work — three photo panels */}
        <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">How we work</p>
              <p className="mt-2 font-serif text-4xl font-light text-slate-900 sm:text-5xl">
                Through the doing, not just the planning.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {APPROACH.map((a) => (
                <div key={a.label} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="relative h-44">
                    <Image src={a.photo} alt="" fill className="object-cover" sizes="(min-width: 640px) 33vw, 100vw" />
                  </div>
                  <div className="p-5">
                    <p className="font-serif text-xl font-light text-slate-900">{a.label}</p>
                    <p className="mt-1.5 text-base text-slate-600">{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FreeConsultationOffer />

        {/* All 18, grouped under illustrated practice areas */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-center font-serif text-4xl font-light text-slate-900 sm:text-5xl">
              All eighteen, by practice area.
            </p>
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {PILLARS.map((p) => (
                <div key={p.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative h-36">
                    <Image src={p.photo} alt="" fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-slate-950/20" />
                    <p className="absolute bottom-3 left-4 right-4 text-base font-semibold text-white">{p.tag}</p>
                  </div>
                  <ul className="space-y-2 p-5">
                    {p.services.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-base text-slate-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="px-5 pb-5">
                    <Link
                      href={`/services/${p.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                    >
                      Explore {p.tag}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-slate-500">
              {SERVICE_CATEGORIES.length} service areas in total.
            </p>
          </div>
        </section>

        {/* Closing visual band */}
        <section className="relative isolate overflow-hidden py-20 text-center">
          <Image src="/photos/skyline-sunset.jpg" alt="" fill className="-z-10 object-cover" sizes="100vw" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-indigo-950/80" />
          <div className="mx-auto max-w-2xl px-4">
            <p className="font-serif text-4xl font-light text-white sm:text-5xl">Not sure which you need?</p>
            <p className="mt-3 text-lg text-indigo-100">
              Start with a free consultation and we&apos;ll help you scope it.
            </p>
            <a
              href="/#contact"
              className="mt-6 inline-block rounded-md bg-amber-400 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-300"
            >
              Book a free consultation
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
