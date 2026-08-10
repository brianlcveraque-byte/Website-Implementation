import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/public/InquiryForm";
import { Reveal } from "@/components/public/Reveal";
import { SERVICE_CATEGORIES } from "@/lib/services-catalogue";

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
  "International lecturer and facilitator",
];

const STATS = [
  { value: "20+", label: "Years" },
  { value: SECTORS.length.toString(), label: "Sectors" },
  { value: SERVICE_CATEGORIES.length.toString(), label: "Service areas" },
];

const PILLARS = [
  { tag: "Strategy & Leadership", photo: "/photos/strategy-whiteboard.jpg", href: "#services" },
  { tag: "Healthcare & Hospitals", photo: "/photos/healthcare-corridor.jpg", href: "#services" },
  { tag: "Training & Facilitation", photo: "/photos/facilitation-workshop.jpg", href: "#services" },
  { tag: "Regional Reach", photo: "/photos/skyline-sunset.jpg", href: "#about" },
];

const PROCESS = [
  { step: "01", title: "Discovery", text: "Context, goals, constraints." },
  { step: "02", title: "Strategy", text: "Roadmap and success measures." },
  { step: "03", title: "Implementation", text: "Facilitation, training, delivery." },
  { step: "04", title: "Evaluation", text: "Outcomes, then what's next." },
];

export default function LandingPage() {
  return (
    <>
      <noscript>
        <style>{`.transition-all{opacity:1 !important;transform:none !important;}`}</style>
      </noscript>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Image src="/brand/logo-light.png" alt="Strategnosis Solutions OPC" width={160} height={67} className="h-9 w-auto dark:hidden" priority />
          <Image src="/brand/logo-dark.png" alt="Strategnosis Solutions OPC" width={160} height={67} className="hidden h-9 w-auto dark:block" priority />
          <nav className="flex items-center gap-6 text-sm">
            <a href="#services" className="hidden font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline">Services</a>
            <a href="#about" className="hidden font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline">About</a>
            <a href="#contact" className="hidden font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline">Contact</a>
            <Link href="/login" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-500">
              Team sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: headline above, big full-bleed image with overlaid card below */}
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
              <p className="mx-auto mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
                Strategy, HR systems, and healthcare management consulting — for institutions
                across the Philippines, Africa, and Southeast Asia.
              </p>
            </Reveal>
          </div>

          <Reveal delayMs={200}>
            <div className="relative mx-auto mt-10 max-w-7xl px-4 sm:mt-14">
              <div className="relative h-[380px] overflow-hidden rounded-3xl sm:h-[480px] lg:h-[560px]">
                <Image src="/photos/hero-building.jpg" alt="" fill priority className="object-cover" sizes="100vw" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 max-w-md rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur dark:bg-slate-900/95 sm:bottom-8 sm:left-8">
                  <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                    Twenty years, one specialization
                  </p>
                  <p className="mt-1.5 font-serif text-lg font-light text-slate-900 dark:text-white sm:text-xl">
                    Healthcare and hospital management consulting, done at depth.
                  </p>
                  <a href="#services" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    See what we do
                    <span aria-hidden>→</span>
                  </a>
                </div>
                <dl className="absolute top-6 right-6 hidden gap-6 rounded-2xl bg-white/95 px-6 py-4 shadow-xl backdrop-blur dark:bg-slate-900/95 sm:flex">
                  {STATS.map((s) => (
                    <div key={s.label} className="text-center">
                      <dd className="text-xl font-semibold text-slate-900 dark:text-white">{s.value}</dd>
                      <dt className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Pillar cards */}
        <section className="bg-white py-16 dark:bg-slate-950 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PILLARS.map((p, i) => (
                  <a
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
                    <span className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white">
                      {p.tag}
                    </span>
                    {i === 0 && (
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-900 uppercase">
                        Explore
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Services: compact tag list, not 18 wordy cards */}
        <section id="services" className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/40 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <Reveal>
              <p className="font-serif text-3xl font-light text-slate-900 dark:text-white sm:text-4xl">
                Eighteen service areas.
              </p>
            </Reveal>
            <Reveal delayMs={80}>
              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {SERVICE_CATEGORIES.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Regional reach — big photo + short text, BCG "locations" pattern */}
        <section className="bg-white py-16 dark:bg-slate-950 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <div className="relative h-72 overflow-hidden rounded-2xl lg:h-[420px]">
                <Image src="/photos/skyline-sunset.jpg" alt="City skyline" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
            </Reveal>
            <Reveal delayMs={80}>
              <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                Regional reach
              </p>
              <p className="mt-2 font-serif text-3xl font-light text-slate-900 dark:text-white sm:text-4xl">
                Philippines. Africa. Southeast Asia.
              </p>
              <p className="mt-4 max-w-md text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                Engagements with hospitals, cooperatives, government agencies, and universities
                across the region — built on research affiliated with WHO, DOH, and NIH.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Why Strategnosis — color-blocked band */}
        <section className="bg-indigo-950 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <Reveal>
              <p className="font-serif text-3xl font-light text-white sm:text-4xl">
                Not a report handed over.
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-200 sm:text-base">
                Strategy through implementation, training, and evaluation — hands-on, start to
                finish.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-8 sm:grid-cols-4">
              {PROCESS.map((p, i) => (
                <Reveal key={p.step} delayMs={i * 90}>
                  <p className="font-serif text-2xl font-light text-indigo-300">{p.step}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{p.title}</p>
                  <p className="mt-1 text-xs text-indigo-300">{p.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="bg-white py-16 dark:bg-slate-950 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
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
                  <p className="font-serif text-2xl font-light text-slate-900 dark:text-white">Richard S. Javier, MBA, PhD</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    PhD, Organizational Development · MBA, Hospital Administration
                  </p>
                  <p className="mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                    Two decades of management, organizational development, and healthcare
                    consulting — hospitals, universities, cooperatives, government agencies, and
                    international development organizations.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {QUALIFICATIONS.map((q) => (
                      <span key={q} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Closing CTA band */}
        <section className="relative overflow-hidden bg-indigo-800 py-20">
          <Image src="/photos/facilitation-workshop.jpg" alt="" fill aria-hidden className="object-cover opacity-25 mix-blend-luminosity" sizes="100vw" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-indigo-800/85" />
          <Reveal>
            <div className="relative mx-auto max-w-2xl px-4 text-center">
              <p className="font-serif text-3xl font-light text-white sm:text-4xl">Let&apos;s talk.</p>
              <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-100 sm:text-base">
                Tell us about your organization&apos;s need — we&apos;ll follow up.
              </p>
              <a href="#contact" className="mt-6 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
                Get in touch
              </a>
            </div>
          </Reveal>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-white py-16 dark:bg-slate-950 sm:py-20">
          <div className="mx-auto max-w-2xl px-4">
            <Reveal>
              <p className="font-serif text-3xl font-light text-slate-900 dark:text-white">Discuss an engagement</p>
              <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <InquiryForm />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
          <Image src="/brand/logo-dark.png" alt="Strategnosis Solutions OPC" width={140} height={58} className="h-8 w-auto opacity-90" />
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Strategnosis Solutions OPC.</p>
          <Link href="/privacy" className="text-xs text-slate-400 underline hover:text-slate-200">
            Privacy notice
          </Link>
        </div>
      </footer>
    </>
  );
}
