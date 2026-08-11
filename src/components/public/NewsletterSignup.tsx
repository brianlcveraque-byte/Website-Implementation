"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function NewsletterSignup() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("submitting");
    setError(null);

    const { error: insertError } = await supabase.from("newsletter_subscribers").insert({
      email: form.get("email"),
      name: form.get("name") || null,
    });

    if (insertError) {
      // A duplicate email isn't really an error from the visitor's point of view.
      if (insertError.code === "23505") {
        setStatus("done");
        return;
      }
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return <p className="text-sm text-slate-600">You&apos;re on the list — thanks for subscribing.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        name="email"
        required
        placeholder="you@organization.com"
        className={`${inputClass} sm:max-w-xs`}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
      >
        {status === "submitting" ? "Subscribing…" : "Subscribe"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
