"use client";

import { useState, useSyncExternalStore } from "react";
import {
  SESSION_RULE,
  formatSessionDate,
  nextSessionDate,
  sessionDateISO,
} from "@/lib/succession-funnel";

// Seat booking for the ₱500 live session.
//
// The date is resolved in the browser rather than at build time — see
// SESSION_RULE. useSyncExternalStore is the right tool: it takes a separate
// server snapshot (null, matching the prerendered HTML) and client snapshot
// (the real date), which is precisely the hydration problem here. Computing it
// during render would mismatch for anyone whose date rolled over since the last
// deploy; doing it in an effect would mean setState in an effect.
//
// The snapshot returns an ISO *string*, not a Date. React compares snapshots
// with Object.is, and a fresh Date object every call is never equal to the last
// one — that spins forever.
//
// Nothing here knows a PayMongo key. It posts to the create-checkout Edge
// Function, which prices the item server-side and returns a hosted checkout URL.

/** The date never changes mid-visit, so there is nothing to subscribe to. */
const subscribe = () => () => {};
const getClientSnapshot = () => sessionDateISO(nextSessionDate());
const getServerSnapshot = () => null;

const CHECKOUT_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout`;

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function SessionCheckout({ fallback }: { fallback?: React.ReactNode } = {}) {
  const sessionISO = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("website_url")) return; // honeypot

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: "training",
          email: form.get("email"),
          name: form.get("name"),
          organization: form.get("organization") || null,
          sessionDate: sessionISO,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.checkoutUrl) {
        setStatus("error");
        setError(
          res.status === 503
            ? "Online payment isn't switched on yet — but your seat can still be booked. Send the form below and we'll invoice you directly."
            : "Something went wrong starting checkout. Try again, or send the form below and we'll sort it out by hand."
        );
        return;
      }
      // Hand off to PayMongo's hosted page.
      window.location.href = data.checkoutUrl;
    } catch {
      setStatus("error");
      setError("Couldn't reach the payment service. Please try again in a moment.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="rounded-lg bg-indigo-50 px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-indigo-700 uppercase">Next session</p>
        <p className="mt-1 font-serif text-2xl font-light text-slate-900">
          {sessionISO ? formatSessionDate(new Date(sessionISO + "T00:00:00Z")) : " "}
        </p>
        <p className="mt-0.5 text-sm text-slate-600">
          {SESSION_RULE.timeLabel} · two hours · online
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
        )}

        <button
          type="submit"
          disabled={status === "submitting" || !sessionISO}
          className="w-full rounded-md bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {status === "submitting" ? "Taking you to checkout…" : "Book a seat — ₱500"}
        </button>
        <p className="text-xs text-slate-500">
          Payment is handled by PayMongo — GCash, GrabPay, Maya, or card. We never see your card
          details. Your seat is confirmed by email once payment clears.
        </p>
      </form>

      {/* Checkout failing must never be a dead end. Until PayMongo is live every
          booking lands here, so the fallback is the actual path, not an edge case. */}
      {status === "error" && fallback && (
        <div className="mt-8 border-t border-slate-200 pt-8">{fallback}</div>
      )}
    </div>
  );
}
