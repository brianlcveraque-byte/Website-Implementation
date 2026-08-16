"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { WORKBOOK } from "@/lib/succession-funnel";

// The email gate at the top of the succession funnel. The download starts as
// soon as the row is written — making someone wait on an email to arrive is
// where most of these funnels lose people. The email that follows (see
// supabase/functions/marketing-emails) is the copy that survives a closed tab.

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function SuccessionLeadForm({ source }: { source: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    // Honeypot, same as InquiryForm — a real visitor never fills this in.
    if (form.get("website_url")) {
      setStatus("done");
      return;
    }

    setStatus("submitting");
    setError(null);

    const { error: insertError } = await supabase.from("toolkit_leads").insert({
      email: form.get("email"),
      name: form.get("name") || null,
      organization: form.get("organization") || null,
      toolkit_slug: "succession-planning-toolkit",
      source,
    });

    // 23505 is the (email, toolkit_slug) unique violation — someone coming back
    // for a second copy. They asked for the file; give them the file.
    if (insertError && insertError.code !== "23505") {
      setStatus("error");
      setError("Something went wrong. Please try again, or email us and we'll send it over.");
      return;
    }

    setStatus("done");
    // Let the success panel mount before clicking its link.
    requestAnimationFrame(() => downloadRef.current?.click());
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-6">
        <p className="font-serif text-2xl font-light text-emerald-900">Your download has started.</p>
        <p className="mt-2 text-sm text-emerald-800">
          If nothing happened, use the link below. We&apos;ve also emailed you a copy.
        </p>
        <a
          ref={downloadRef}
          href={WORKBOOK.path}
          download={WORKBOOK.filename}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          Download the workbook
        </a>
        <p className="mt-5 border-t border-emerald-200 pt-4 text-sm text-emerald-900">
          Once you&apos;ve scored your first few positions, there are two ways to close the gaps it
          finds.{" "}
          <a href="#choose" className="font-semibold underline underline-offset-2">
            See both options ↓
          </a>
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
        className="w-full rounded-md bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {status === "submitting" ? "Preparing your download…" : "Send me the workbook"}
      </button>
      <p className="text-xs text-slate-500">
        One email with your download, and a single note a few days later. No list, no sequence, and
        you can reply &ldquo;stop&rdquo; to either.
      </p>
    </form>
  );
}
