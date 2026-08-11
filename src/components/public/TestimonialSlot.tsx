/** Real client quotes go in this array once approved for public use — see
 * SPEC.md's rule against publishing client names/details without explicit
 * approval. Until then this renders an honest placeholder, not a fake quote. */
const TESTIMONIALS: { quote: string; attribution: string }[] = [];

export function TestimonialSlot() {
  if (TESTIMONIALS.length === 0) {
    return (
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
            Client feedback
          </p>
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-6 py-10 font-serif text-xl font-light text-slate-400">
            Client testimonials will appear here once approved for public use.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">
          Client feedback
        </p>
        {TESTIMONIALS.map((t) => (
          <blockquote key={t.attribution} className="mt-4">
            <p className="font-serif text-2xl font-light text-slate-900">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-3 text-sm text-slate-500">— {t.attribution}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
