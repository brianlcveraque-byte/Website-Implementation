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

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-slate-950 py-20 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <p className="text-xs font-semibold tracking-wide text-indigo-300 uppercase">Services</p>
            <h1 className="mt-3 font-serif text-5xl font-light text-white">Eighteen service areas.</h1>
            <p className="mt-4 text-lg text-slate-300">
              Grouped into three practice areas, built on two decades across the Philippines,
              Africa, and Southeast Asia.
            </p>
          </div>
        </section>

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
                  <p className="mt-3 text-sm text-slate-600">{p.summary}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:text-indigo-500">
                    See details <span aria-hidden>→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FreeConsultationOffer />

        <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <p className="font-serif text-3xl font-light text-slate-900 sm:text-4xl">All eighteen, at a glance.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {SERVICE_CATEGORIES.map((s) => (
                <span
                  key={s.name}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-base text-slate-700"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
