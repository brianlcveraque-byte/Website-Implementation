"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button, ErrorBlock, Field, Input, Textarea } from "@/components/ui/Primitives";
import { SERVICE_CATEGORIES } from "@/lib/services-catalogue";

export function InquiryForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-center text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
          <Input name="name" required />
        </Field>
        <Field label="Organization">
          <Input name="organization" />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required />
        </Field>
        <Field label="Phone">
          <Input name="phone" />
        </Field>
      </div>
      <Field label="Service of interest">
        <select
          name="service_interest"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
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
        <Textarea name="message" rows={4} required />
      </Field>
      {error && <ErrorBlock message={error} />}
      <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
