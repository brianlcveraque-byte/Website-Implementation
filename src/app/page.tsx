import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/public/InquiryForm";
import { Reveal } from "@/components/public/Reveal";
import { ServiceIcon } from "@/components/public/ServiceIcon";
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
  "Coaching and mentoring for skills and behavioral development",
  "Quality Management / ISO & TQM Representative",
  "Research Consultant — WHO, DOH, and NIH-affiliated studies",
  "International lecturer and facilitator",
];

const STATS = [
  { value: "20+", label: "Years in management consultancy" },
  { value: SECTORS.length.toString(), label: "Sectors served" },
  { value: SERVICE_CATEGORIES.length.toString(), label: "Service areas" },
];

const DIFFERENTIATORS = [
  {
    icon: "compass" as const,
    title: "Cross-sector depth",
    text: "Two decades of engagements spanning healthcare, government, cooperatives, education, and faith-based institutions.",
  },
  {
    icon: "pulse" as const,
    title: "Healthcare specialization",
    text: "Hospital and health-system consulting is the deepest specialization — dozens of engagements across the Philippines, Africa, and Southeast Asia.",
  },
  {
    icon: "book" as const,
    title: "Research-grounded",
    text: "Findings from WHO-, DOH-, and NIH-affiliated research inform every strategic recommendation.",
  },
  {
    icon: "people" as const,
    title: "Hands-on partnership",
    text: "From strategic planning through implementation, training, and evaluation — not just a report handed over.",
  },
];

const PROCESS = [
  { step: "01", title: "Discovery", text: "Understand your institution's context, goals, and constraints." },
  { step: "02", title: "Strategy", text: "Co-design the approach, roadmap, and success measures." },
  { step: "03", title: "Implementation", text: "Hands-on facilitation, training, and systems delivery." },
  { step: "04", title: "Evaluation", text: "Monitor outcomes and plan what's next." },
];

export default function LandingPage() {
  return (
    <>
      {/* If JS never runs at all, the Reveal fade-in effect's useEffect never
          fires either, so its own setTimeout safety net doesn't exist yet.
          This is the belt to that suspenders. */}
      <noscript>
        <style>{`.transition-all{opacity:1 !important;transform:none !important;}`}</style>
      </noscript>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Image
            src="/brand/logo-light.png"
            alt="Strategnosis Solutions OPC"
            width={160}
            height={67}
            className="h-9 w-auto dark:hidden"
            priority
          />
          <Image
            src="/brand/logo-dark.png"
            alt="Strategnosis Solutions OPC"
            width={160}
            height={67}
            className="hidden h-9 w-auto dark:block"
            priority
          />
          <nav className="flex items-center gap-6 text-sm">
            <a href="#services" className="hidden font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline">
              Services
            </a>
            <a href="#about" className="hidden font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline">
              About
            </a>
            <a href="#contact" className="hidden font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:inline">
              Contact
            </a>
            <Link
              href="/login"
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              Team sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-950">
          <div
            aria-hidden
            className="animate-float-slow pointer-events-none absolute -left-20 top-[-10%] h-[420px] w-[420px] rounded-full bg-indigo-600/30 blur-[100px]"
          />
          <div
            aria-hidden
            className="animate-float-slower pointer-events-none absolute right-[-10%] top-[10%] h-[380px] w-[380px] rounded-full bg-fuchsia-600/10 blur-[110px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]"
          />
          <Image
            src="/brand/icon-badge.png"
            alt=""
            width={640}
            height={640}
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-[0.06] invert sm:h-[560px] sm:w-[560px]"
          />
          <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
            <Reveal>
              <span className="inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium tracking-wide text-indigo-300 uppercase">
                Management &amp; Organizational Development Consultancy
              </span>
            </Reveal>
            <Reveal delayMs={80}>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Management consultancy for institutions that need to{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                  get complex change right
                </span>
                .
              </h1>
            </Reveal>
            <Reveal delayMs={140}>
              <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
                Strategnosis Solutions OPC provides strategic planning, organizational development,
                HR systems, and healthcare management consulting to government, healthcare,
                education, cooperative, and development-sector institutions in the Philippines and
                abroad.
              </p>
            </Reveal>
            <Reveal delayMs={200}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#contact"
                  className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-600/30"
                >
                  Discuss an engagement
                </a>
                <a
                  href="#services"
                  className="rounded-md border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                >
                  See service areas
                </a>
              </div>
            </Reveal>
            <Reveal delayMs={260}>
              <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="text-2xl font-semibold text-white sm:text-3xl">{s.value}</dd>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">{s.label}</p>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Why Strategnosis */}
        <section className="border-b border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-sm font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                Why Strategnosis
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {DIFFERENTIATORS.map((d, i) => (
                <Reveal key={d.title} delayMs={i * 90}>
                  <div className="h-full rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <ServiceIcon name={d.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{d.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{d.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="border-b border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <div className="max-w-2xl">
                <h2 className="text-sm font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                  Service areas
                </h2>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  Eighteen service areas, one deep specialization.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Healthcare and hospital management consulting is our deepest specialization,
                  built across dozens of engagements across the Philippines, Africa, and Southeast
                  Asia.
                </p>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_CATEGORIES.map((s, i) => (
                <Reveal key={s.name} delayMs={(i % 6) * 60}>
                  <div className="group h-full rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400">
                      <ServiceIcon name={s.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{s.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="border-b border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-sm font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                How we work
              </h2>
            </Reveal>
            <div className="relative mt-10 grid gap-8 sm:grid-cols-4">
              <div className="absolute top-5 right-0 left-0 hidden h-px bg-slate-200 dark:bg-slate-800 sm:block" aria-hidden />
              {PROCESS.map((p, i) => (
                <Reveal key={p.step} delayMs={i * 100}>
                  <div className="relative">
                    <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-indigo-200 bg-white text-xs font-semibold text-indigo-600 dark:border-indigo-900 dark:bg-slate-950 dark:text-indigo-400">
                      {p.step}
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="bg-slate-50 py-20 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-sm font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                Principal consultant
              </h2>
            </Reveal>
            <Reveal delayMs={80}>
              <div className="mt-6 grid gap-10 sm:grid-cols-[auto_2fr_3fr] sm:items-start">
                <div
                  aria-hidden
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xl font-semibold text-white shadow-md"
                >
                  RJ
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Richard S. Javier, MBA, PhD</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Doctor of Philosophy in Organizational Development · MBA (Hospital
                    Administration)
                  </p>
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                    Over two decades of management, organizational development, and healthcare
                    consulting across the Philippines, Africa, and Southeast Asia, including
                    engagements with hospitals, universities, cooperatives, government agencies,
                    and international development organizations.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Sectors served</h3>
                  <ul className="mt-2 grid grid-cols-1 gap-1.5 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                    {SECTORS.map((s) => (
                      <li key={s} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <h3 className="mt-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">Qualifications</h3>
                  <ul className="mt-2 grid grid-cols-1 gap-1.5 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                    {QUALIFICATIONS.map((q) => (
                      <li key={q} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Closing CTA band */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-fuchsia-600 py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:36px_36px]"
          />
          <Reveal>
            <div className="relative mx-auto max-w-3xl px-4 text-center">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Ready to discuss your next engagement?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-100 sm:text-base">
                Tell us about your organization&apos;s need — strategic planning, HR systems,
                healthcare management, or something else entirely.
              </p>
              <a
                href="#contact"
                className="mt-6 inline-block rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Get in touch
              </a>
            </div>
          </Reveal>
        </section>

        {/* Contact */}
        <section id="contact" className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-2xl px-4">
            <Reveal>
              <h2 className="text-sm font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                Get in touch
              </h2>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Discuss an engagement</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Tell us about your organization&apos;s need and we&apos;ll follow up.
              </p>
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
