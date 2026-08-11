import Image from "next/image";
import Link from "next/link";
import { FreeConsultationOffer } from "@/components/public/FreeConsultationOffer";
import { SERVICE_CATEGORIES } from "@/lib/services-catalogue";
import type { PILLARS } from "@/lib/pillars";

export function PillarDetail({ pillar }: { pillar: (typeof PILLARS)[number] }) {
  const relatedDescriptions = SERVICE_CATEGORIES.filter((s) =>
    (pillar.services as readonly string[]).includes(s.name)
  );

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-slate-950">
        <Image src={pillar.photo} alt="" fill priority className="object-cover opacity-40" sizes="100vw" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:py-32">
          <Link href="/services" className="text-sm text-indigo-300 hover:text-indigo-200">
            ← All services
          </Link>
          <h1 className="mt-4 font-serif text-4xl font-light text-white sm:text-5xl">{pillar.tag}</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">{pillar.intro}</p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">What&apos;s included</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {relatedDescriptions.map((s) => (
              <div key={s.name} className="rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900">{s.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FreeConsultationOffer />
    </main>
  );
}
