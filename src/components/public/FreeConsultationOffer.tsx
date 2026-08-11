/** The explicit offer: a free 1-hour consultation. Urgency framing is kept
 * true to life for a solo/2-person practice (a real capacity constraint,
 * not a manufactured countdown) rather than a fabricated claim. */
export function FreeConsultationOffer() {
  return (
    <section className="border-y border-amber-200 bg-amber-50 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase">
            Free, no obligation
          </p>
          <p className="mt-1 font-serif text-2xl font-light text-slate-900 sm:text-3xl">
            Start with a free 1-hour consultation.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Strategnosis takes on a limited number of new engagements each quarter to keep every
            relationship hands-on — book while a slot is open.
          </p>
        </div>
        <a
          href="/#contact"
          className="shrink-0 rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
        >
          Book your free session
        </a>
      </div>
    </section>
  );
}
