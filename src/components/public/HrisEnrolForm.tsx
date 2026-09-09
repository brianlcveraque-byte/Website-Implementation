"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { HRIS_FREE_SEATS, HRIS_NEXT_URL } from "@/lib/hris-funnel";

/**
 * The enrolment gate for the free HR session.
 *
 * THIS IS WHERE THE FUNNEL BECOMES A FUNNEL. Before it existed, /hris,
 * /hris/start and /hris/next were links end to end: a visitor could read the
 * whole offer, click "confirm my seat", and leave without anyone knowing they
 * had been. An ad pointing at that collects nothing.
 *
 * Writing the row is what triggers everything downstream — the welcome email
 * that promises a date, and the internal alert that tells someone a promise is
 * now outstanding (see supabase/functions/marketing-emails). Both filter on
 * toolkit_slug, so the slug below is load-bearing: change it and this funnel
 * silently starts receiving the succession funnel's email instead.
 *
 * Same shape as SuccessionLeadForm on purpose, honeypot included — one pattern
 * for lead capture across the site means one place to fix when it breaks.
 */

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none";

const labelClass = "block text-xs font-semibold tracking-wide text-slate-700 uppercase mb-1.5";

export function HrisEnrolForm({ source = "hris-funnel" }: { source?: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    // Honeypot. A real visitor never fills this in; a bot fills everything.
    if (form.get("website_url")) {
      setStatus("done");
      return;
    }

    setStatus("submitting");
    setError(null);

    const name = String(form.get("name") ?? "").trim();
    setFirstName(name.split(" ")[0] || "");

    const { error: insertError } = await supabase.from("toolkit_leads").insert({
      email: form.get("email"),
      name: name || null,
      organization: form.get("organization") || null,
      toolkit_slug: "hris-sandbox",
      source,
    });

    // 23505 is the (email, toolkit_slug) unique violation — someone enrolling
    // twice. They are already on the list; telling them they failed would be
    // both wrong and alarming.
    if (insertError && insertError.code !== "23505") {
      setStatus("error");
      setError(
        "Something went wrong saving your seat. Please try again, or email us and we will add you by hand.",
      );
      return;
    }

    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center">
        <p className="font-display text-2xl font-bold text-emerald-900">
          {firstName ? `You're in, ${firstName}.` : "You're in."}
        </p>
        <p className="mt-2 text-sm text-emerald-900/90">
          Check your inbox — we&apos;ve sent a confirmation. The date is being set around who has
          enrolled, and you&apos;ll hear it from us before anyone else.
        </p>
        <p className="mt-3 text-sm text-emerald-900/80">
          Your HR system — the 201 file and new-hire onboarding — is released when you attend, and
          it stays yours. That part is for the first {HRIS_FREE_SEATS} enrolled.
        </p>

        {/* The upsell, offered once and quietly. Replacing the old link to
            /hris/next with this form orphaned that page, and with it the two
            ways someone can take the system further. Someone who has just said
            yes is the most likely person to want more — but they have already
            got what they came for, so this is a link and not a pitch. */}
        <a
          href={HRIS_NEXT_URL}
          className="mt-5 inline-block text-sm font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-700"
        >
          While you wait — the two ways to take the system further
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Honeypot: off-screen rather than display:none, which some bots skip. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="website_url">Leave this empty</label>
        <input id="website_url" name="website_url" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="enrol-name">
            Your name
          </label>
          <input id="enrol-name" name="name" className={inputClass} placeholder="Maria Santos" required />
        </div>
        <div>
          <label className={labelClass} htmlFor="enrol-org">
            Organisation
          </label>
          <input
            id="enrol-org"
            name="organization"
            className={inputClass}
            placeholder="Where you work"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="enrol-email">
          Email address
        </label>
        <input
          id="enrol-email"
          name="email"
          type="email"
          className={inputClass}
          placeholder="you@company.com"
          required
        />
        <p className="mt-1.5 text-xs text-slate-500">
          This is where the schedule and joining link go. Nothing else is sent to it.
        </p>
      </div>

      {status === "error" ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="funnel-glow font-display w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-4 text-lg font-black tracking-tight text-white ring-2 ring-emerald-200 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Saving your seat…" : "Reserve my free seat"}
      </button>

      <p className="text-center text-xs text-slate-500">
        Free. No card, nothing owed afterwards.
      </p>
    </form>
  );
}
