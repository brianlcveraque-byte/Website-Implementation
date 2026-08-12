"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SERVICE_CATEGORIES } from "@/lib/services-catalogue";
import { formatToolkitPrice, TOOLKITS } from "@/lib/toolkits";

// Styled locally rather than reusing the shared ui/Primitives components —
// those are dark-mode aware for the internal /app tool, but this public page
// has one fixed light appearance regardless of the visitor's OS theme (see
// the note at the top of app/page.tsx).

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export function InquiryForm({ presetToolkitSlug }: { presetToolkitSlug?: string } = {}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [serviceInterest, setServiceInterest] = useState("");

  // Toolkit cards link here as /?toolkit=<slug>#contact — prefill the form
  // so the visitor doesn't have to re-explain which toolkit they want.
  // A page can also pass presetToolkitSlug directly (e.g. a single-offer
  // campaign landing page with an embedded form and no URL round-trip).
  useEffect(() => {
    const slug = presetToolkitSlug ?? new URLSearchParams(window.location.search).get("toolkit");
    const toolkit = TOOLKITS.find((t) => t.slug === slug);
    if (!toolkit) return;
    const closing = toolkit.price === 0 ? "Please send it over." : "Please send payment instructions.";
    setMessage(`I'd like to get the "${toolkit.name}" toolkit (${formatToolkitPrice(toolkit.price)}). ${closing}`);
    if (toolkit.matchingService) setServiceInterest(toolkit.matchingService);
  }, [presetToolkitSlug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    // Honeypot: a real visitor never fills this hidden field in.
    if (form.get("website_url")) {
      setStatus("done");
      return;
    }

    setStatus("submitting");
    setError(null);

    const { error: insertError } = await supabase.from("public_inquiries").insert({
      name: form.get("name"),
      organization: form.get("organization"),
      email: form.get("email"),
      phone: form.get("phone"),
      service_interest: form.get("service_interest"),
      message: form.get("message"),
    });

    if (insertError) {
      setStatus("error");
      setError("Something went wrong sending your inquiry. Please try again or email us directly.");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-center text-sm text-emerald-800">
        Thank you — your inquiry has been received. We&apos;ll get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="website_url"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Organization">
          <input name="organization" className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" className={inputClass} />
        </Field>
      </div>
      <Field label="Service of interest">
        <select
          name="service_interest"
          className={inputClass}
          value={serviceInterest}
          onChange={(e) => setServiceInterest(e.target.value)}
        >
          <option value="">Not sure yet</option>
          {SERVICE_CATEGORIES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Tell us about your need">
        <textarea
          name="message"
          rows={4}
          required
          className={inputClass}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Field>
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
