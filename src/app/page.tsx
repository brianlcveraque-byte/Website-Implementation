import Image from "next/image";
import Link from "next/link";
import { FreeConsultationOffer } from "@/components/public/FreeConsultationOffer";
import { InquiryForm } from "@/components/public/InquiryForm";
import { NewsletterSignup } from "@/components/public/NewsletterSignup";
import { Reveal } from "@/components/public/Reveal";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { TestimonialSlot } from "@/components/public/TestimonialSlot";
import { PILLARS } from "@/lib/pillars";
import { SERVICE_CATEGORIES } from "@/lib/services-catalogue";
import { formatToolkitPrice, TOOLKITS } from "@/lib/toolkits";

// This page deliberately does NOT follow the visitor's OS light/dark
// preference — unlike the internal /app tool, a marketing site's brand
// colors shouldn't shift based on someone's system setting (mckinsey.com
// and bcg.com don't either). One fixed light-based look, on purpose.

const SECTORS_COUNT = 8;

const STATS = [
  { value: "20+", label: "Years" },
  { value: SECTORS_COUNT.toString(), label: "Sectors" },
  { value: SERVICE_CATEGORIES.length.toString(), label: "Service areas" },
];

const HOME_CARDS = [
  ...PILLARS.map((p) => ({ tag: p.tag, photo: p.photo, href: `/services/${p.slug}` })),
  { tag: "Regional Reach", photo: "/photos/skyline-sunset.jpg", href: "/about" },
];

const TOOLKIT_TEASERS = ["organizational-health-check", "strategic-planning-canvas", "healthcare-qi-toolkit"]
  .map((slug) => TOOLKITS.find((t) => t.slug === slug))
  .filter((t): t is (typeof TOOLKITS)[number] => !!t);

const PROCESS = [
  { step: "01", title: "Discovery", text: "Context, goals, constraints." },
  { step: "02", title: "Strategy", text: "Roadmap and success measures." },
  { step: "03", title: "Implementation", text: "Facilitation, training, delivery." },
  { step: "04", title: "Evaluation", text: "Outcomes, then what's next." },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero: headline above, big full-bleed image with overlaid card below.
            Deliberately dark — this is the one intentional dark section, like
            BCG's own dark hero card, not a whole-page dark theme. */}
        <section className="bg-slate-950 pt-16 pb-10 sm:pt-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <Reveal>
              <span className="inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-300 uppercase">
                Management Consultancy
              </span>
            </Reveal>
            <Reveal delayMs={80}>
              <h1 className="mt-5 font-serif text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl">
                Strategic clarity for <em className="text-indigo-300">complex institutions</em>.
              </h1>
            </Reveal>
            <Reveal delayMs={140}>
              <p className="mx-auto mt-5 max-w-lg text-lg text-slate-300 sm:text-xl">
                Strategy. HR systems. Healthcare management.
              </p>
            </Reveal>
          </div>

          <Reveal delayMs={200}>
            <div className="relative mx-auto mt-10 max-w-7xl px-4 sm:mt-14">
              <div className="relative h-[380px] overflow-hidden rounded-3xl sm:h-[480px] lg:h-[560px]">
                <Image src="/photos/hero-building.jpg" alt="" fill priority className="object-cover" sizes="100vw" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 max-w-md rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur sm:bottom-8 sm:left-8">
                  <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
                    Twenty years, one specialization
                  </p>
                  <p className="mt-1.5 font-serif text-xl font-light text-slate-900 sm:text-2xl">
                    Healthcare consulting, done at depth.
                  </p>
                  <Link href="/services/healthcare" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                    See what we do
                    <span aria-hidden>→</span>
                  </Link>
                </div>
                <dl className="absolute top-6 right-6 hidden gap-6 rounded-2xl bg-white/95 px-6 py-4 shadow-xl backdrop-blur sm:flex">
                  {STATS.map((s) => (
                    <div key={s.label} className="text-center">
                      <dd className="text-xl font-semibold text-slate-900">{s.value}</dd>
                      <dt className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Pillar cards — now real pages, not scroll anchors */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {HOME_CARDS.map((p, i) => (
                  <Link
                    key={p.tag}
                    href={p.href}
                    className="group relative block h-64 overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={p.photo}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                    <span className="absolute bottom-4 left-4 right-4 text-base font-semibold text-white sm:text-lg">
                      {p.tag}
                    </span>
                    {i === 0 && (
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-900 uppercase">
                        Explore
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <FreeConsultationOffer />

        {/* Services: compact tag list, not 18 wordy cards */}
        <section id="services" className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <Reveal>
              <p className="font-serif text-4xl font-light text-slate-900 sm:text-5xl">
                Eighteen service areas.
              </p>
              <Link href="/services" className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                Browse by practice area →
              </Link>
            </Reveal>
            <Reveal delayMs={80}>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {SERVICE_CATEGORIES.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-base text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Toolkits teaser — the low-ticket entry point below a full engagement */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <Reveal>
              <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">Not ready for a full engagement?</p>
              <p className="mt-2 font-serif text-4xl font-light text-slate-900 sm:text-5xl">
                Starter toolkits, free to ₱5,000.
              </p>
              <p className="mx-auto mt-3 max-w-xl text-lg text-slate-600">
                Practical templates built from the same frameworks we use in full engagements.
              </p>
            </Reveal>
            <Reveal delayMs={80}>
              <div className="mt-10 grid gap-5 text-left sm:grid-cols-3">
                {TOOLKIT_TEASERS.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/toolkits`}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">{t.pillarTag}</p>
                      <p
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          t.price === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {formatToolkitPrice(t.price)}
                      </p>
                    </div>
                    <p className="mt-2 font-serif text-lg font-light text-slate-900">{t.name}</p>
                    <p className="mt-1.5 text-sm text-slate-600">{t.tagline}</p>
                  </Link>
                ))}
              </div>
              <Link href="/toolkits" className="mt-8 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                See all toolkits →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Regional reach — big photo + short text, BCG "locations" pattern */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <div className="relative h-72 overflow-hidden rounded-2xl lg:h-[420px]">
                <Image src="/photos/skyline-sunset.jpg" alt="City skyline" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
            </Reveal>
            <Reveal delayMs={80}>
              <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
                Regional reach
              </p>
              <p className="mt-2 font-serif text-4xl font-light text-slate-900 sm:text-5xl">
                Philippines. Africa. Southeast Asia.
              </p>
              <p className="mt-4 max-w-md text-lg text-slate-600">
                Hospitals, cooperatives, governments, universities — backed by WHO, DOH, and NIH
                research.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Why Strategnosis — bright color-blocked band, the one deliberate pop */}
        <section className="bg-amber-400 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <Reveal>
              <p className="font-serif text-4xl font-light text-slate-900 sm:text-5xl">
                Not a report handed over.
              </p>
              <p className="mx-auto mt-3 max-w-xl text-lg text-slate-800">
                Strategy through implementation and evaluation — hands-on, start to finish.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-8 sm:grid-cols-4">
              {PROCESS.map((p, i) => (
                <Reveal key={p.step} delayMs={i * 90}>
                  <p className="font-serif text-3xl font-light text-slate-900/60">{p.step}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{p.title}</p>
                  <p className="mt-1 text-sm text-slate-800">{p.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <TestimonialSlot />

        {/* About */}
        <section id="about" className="bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
                Principal consultant
              </p>
              <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
                <div
                  aria-hidden
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-lg font-semibold text-white shadow-md"
                >
                  RJ
                </div>
                <div>
                  <p className="font-serif text-3xl font-light text-slate-900">Richard S. Javier, MBA, PhD</p>
                  <p className="mt-1 text-base text-slate-500">
                    PhD, Organizational Development · MBA, Hospital Administration
                  </p>
                  <p className="mt-4 max-w-2xl text-lg text-slate-600">
                    Two decades consulting for hospitals, universities, cooperatives, and
                    governments — Philippines to Southeast Asia.
                  </p>
                  <Link href="/about" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                    Read the full profile →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Newsletter */}
        <section className="border-t border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <p className="font-serif text-2xl font-light text-slate-900">Occasional insights, no spam.</p>
            <p className="mt-1 text-sm text-slate-500">
              Notes on strategy, HR systems, and healthcare management — sent rarely.
            </p>
            <div className="mt-5 flex justify-center">
              <NewsletterSignup />
            </div>
          </div>
        </section>

        {/* Closing CTA band */}
        <section className="relative overflow-hidden bg-indigo-600 py-20">
          <Image src="/photos/facilitation-workshop.jpg" alt="" fill aria-hidden className="object-cover opacity-20 mix-blend-luminosity" sizes="100vw" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-indigo-600/80" />
          <Reveal>
            <div className="relative mx-auto max-w-2xl px-4 text-center">
              <p className="font-serif text-4xl font-light text-white sm:text-5xl">Let&apos;s talk.</p>
              <p className="mx-auto mt-3 max-w-xl text-lg text-indigo-50">
                Tell us about your organization&apos;s need.
              </p>
              <a href="#contact" className="mt-6 inline-block rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-xl">
                Get in touch
              </a>
            </div>
          </Reveal>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <Reveal>
              <p className="font-serif text-4xl font-light text-slate-900">Discuss an engagement</p>
              <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <InquiryForm />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
