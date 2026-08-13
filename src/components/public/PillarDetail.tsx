import Image from "next/image";
import Link from "next/link";
import { FreeConsultationOffer } from "@/components/public/FreeConsultationOffer";
import { SERVICE_CATEGORIES } from "@/lib/services-catalogue";
import type { PILLARS } from "@/lib/pillars";

// Supporting imagery per practice area. Captions describe the *work*, never
// claiming a pictured room is a client site — these are licensed stock photos,
// not photographs of Strategnosis engagements.
const SUPPORTING: Record<string, { feature: string; strip: string[] }> = {
  "strategy-leadership": {
    feature: "/photos/executive-boardroom.jpg",
    strip: ["/photos/boardroom.jpg", "/photos/business-meeting.jpg", "/photos/corporate-tower.jpg"],
  },
  healthcare: {
    feature: "/photos/healthcare-corridor.jpg",
    strip: ["/photos/planning-discussion.jpg", "/photos/open-office.jpg", "/photos/meeting-room.jpg"],
  },
  "training-facilitation": {
    feature: "/photos/facilitation-workshop.jpg",
    strip: ["/photos/library-research.jpg", "/photos/research-study.jpg", "/photos/planning-discussion.jpg"],
  },
};

export function PillarDetail({ pillar }: { pillar: (typeof PILLARS)[number] }) {
  const relatedDescriptions = SERVICE_CATEGORIES.filter((s) =>
    (pillar.services as readonly string[]).includes(s.name)
  );
  const support = SUPPORTING[pillar.slug] ?? {
    feature: pillar.photo,
    strip: ["/photos/boardroom.jpg", "/photos/meeting-room.jpg", "/photos/business-meeting.jpg"],
  };

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

      {/* Feature band: large photo beside the positioning statement */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 lg:grid-cols-2 lg:gap-12">
          <div className="relative h-72 overflow-hidden rounded-2xl lg:h-[420px]">
            <Image src={support.feature} alt="" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">In practice</p>
            <p className="mt-2 font-serif text-4xl font-light text-slate-900 sm:text-5xl">{pillar.summary}</p>
            <p className="mt-4 max-w-md text-lg text-slate-600">
              Every engagement is scoped to the institution in front of us — then delivered
              hands-on, through implementation and evaluation.
            </p>
            <a
              href="/#contact"
              className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Discuss an engagement
            </a>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">What&apos;s included</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {relatedDescriptions.map((s) => (
              <div key={s.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{s.name}</h3>
                <p className="mt-1.5 text-base text-slate-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {support.strip.map((src) => (
              <div key={src} className="relative h-48 overflow-hidden rounded-2xl">
                <Image src={src} alt="" fill className="object-cover" sizes="(min-width: 640px) 33vw, 100vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <FreeConsultationOffer />
    </main>
  );
}
