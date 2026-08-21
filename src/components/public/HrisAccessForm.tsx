"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { NextSessionBanner } from "@/components/public/SessionCheckout";
import { HRIS_SESSION_RULE } from "@/lib/hris-funnel";

// Free-tier signup: sandbox access plus a seat on the live session.
//
// Credentials are emailed rather than shown here. Publishing a shared login on
// a public page would put a working HR system — with whatever data is in it —
// one search away from anyone. "Guided" access is also the honest description:
// there is no multi-tenancy, so this is a walkthrough of a real instance, not
// an account of their own.

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function HrisAccessForm({ source }: { source: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("website_url")) {
      setStatus("done"); // honeypot
      return;
    }

    setStatus("submitting");
    setError(null);

    const { error: insertError } = await supabase.from("toolkit_leads").insert({
      email: form.get("email"),
      name: form.get("name") || null,
      organization: form.get("organization") || null,
      toolkit_slug: "hris-sandbox",
      source,
    });

    // 23505 is the (email, toolkit_slug) unique violation — someone signing up
    // twice. They asked for access; treat it as success.
    if (insertError && insertError.code !== "23505") {
      setStatus("error");
      setError("Something went wrong. Please try again, or email us and we'll set it up by hand.");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-6">
        <p className="font-serif text-2xl font-light text-emerald-900">You&apos;re booked in.</p>
        <p className="mt-2 text-sm text-emerald-800">
          We&apos;ll email your sandbox login and the joining link for the session. Both usually
          arrive within a few minutes.
        </p>
        <div className="mt-5">
          <NextSessionBanner rule={HRIS_SESSION_RULE} label="Your session" />
        </div>
        <p className="mt-5 border-t border-emerald-200 pt-4 text-sm text-emerald-900">
          Come with a rough headcount and your current leave rules — the session works through your
          situation rather than a generic example.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input name="name" required className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Organization</label>
          <input name="organization" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Work email</label>
        <input name="email" type="email" required placeholder="you@organization.com" className={inputClass} />
      </div>
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        {status === "submitting" ? "Setting you up…" : "Get free access + book my seat"}
      </button>
      <p className="text-xs text-slate-500">
        No card, no trial that expires into a bill. We&apos;ll email your login and one reminder
        before the session.
      </p>
    </form>
  );
}
