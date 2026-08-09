import Link from "next/link";
import { InquiryForm } from "@/components/public/InquiryForm";
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

export default function LandingPage() {
  return (
    <>
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-semibold">Strategnosis Solutions OPC</span>
          <nav className="flex items-center gap-5 text-sm">
            <a href="#services" className="hidden text-slate-600 hover:text-slate-900 dark:text-slate-300 sm:inline">
              Services
            </a>
            <a href="#about" className="hidden text-slate-600 hover:text-slate-900 dark:text-slate-300 sm:inline">
              About
            </a>
            <a href="#contact" className="hidden text-slate-600 hover:text-slate-900 dark:text-slate-300 sm:inline">
              Contact
            </a>
            <Link
              href="/login"
              className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white dark:bg-white dark:text-slate-900"
            >
              Team sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Management consultancy for institutions that need to get complex change right.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
            Strategnosis Solutions OPC provides strategic planning, organizational development,
            HR systems, and healthcare management consulting to government, healthcare,
            education, cooperative, and development-sector institutions in the Philippines and
            abroad.
          </p>
          <a
            href="#contact"
            className="mt-6 inline-block rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
          >
            Discuss an engagement
          </a>
        </section>

        <section id="services" className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-xl font-semibold">Service areas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Healthcare and hospital management consulting is our deepest specialization,
              built across dozens of engagements.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_CATEGORIES.map((s) => (
                <div
                  key={s.name}
                  className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                >
                  <h3 className="text-sm font-semibold">{s.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-xl font-semibold">Principal consultant</h2>
            <div className="mt-6 grid gap-8 sm:grid-cols-[2fr_3fr]">
              <div>
                <p className="font-semibold">Richard S. Javier, MBA, PhD</p>
                <p className="text-sm text-slate-500">
                  Doctor of Philosophy in Organizational Development · MBA (Hospital
                  Administration)
                </p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Over two decades of management, organizational development, and healthcare
                  consulting across the Philippines, Africa, and Southeast Asia, including
                  engagements with hospitals, universities, cooperatives, government agencies,
                  and international development organizations.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500">Sectors served</h3>
                <ul className="mt-2 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
                  {SECTORS.map((s) => (
                    <li key={s} className="flex items-start gap-1.5">
                      <span aria-hidden>•</span>
                      {s}
                    </li>
                  ))}
                </ul>
                <h3 className="mt-5 text-sm font-semibold text-slate-500">Qualifications</h3>
                <ul className="mt-2 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
                  {QUALIFICATIONS.map((q) => (
                    <li key={q} className="flex items-start gap-1.5">
                      <span aria-hidden>•</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="text-xl font-semibold">Discuss an engagement</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tell us about your organization&apos;s need and we&apos;ll follow up.
            </p>
            <div className="mt-6">
              <InquiryForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        <p>© {new Date().getFullYear()} Strategnosis Solutions OPC.</p>
        <Link href="/privacy" className="underline">
          Privacy notice
        </Link>
      </footer>
    </>
  );
}
