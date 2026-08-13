// Daily email digest of overdue/upcoming items — the Phase 2 notification
// engine from SPEC.md §4.2, now built. Runs on a schedule (see
// supabase/migrations/0005_digest_cron.sql), not on user request, so it uses
// the service-role key (auto-provided to every Edge Function by Supabase)
// to read across all data regardless of RLS.
//
// Deploy: supabase functions deploy daily-digest
// Requires the RESEND_API_KEY secret (see README.md "Email digest setup").

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const DIGEST_FROM = Deno.env.get("DIGEST_FROM_EMAIL") ?? "onboarding@resend.dev";
const APP_URL = Deno.env.get("APP_URL") ?? "";

function todayManila(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

function isOverdue(dateStr: string | null, today: string): boolean {
  return !!dateStr && dateStr < today;
}

function isDueSoon(dateStr: string | null, today: string, withinDays: number): boolean {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  const now = new Date(today);
  const diffDays = Math.round((target.getTime() - now.getTime()) / 86_400_000);
  return diffDays >= 0 && diffDays <= withinDays;
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const today = todayManila();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86_400_000).toISOString();

  const [
    { data: recipients },
    { data: opportunities },
    { data: tasks },
    { data: milestones },
    { data: invoices },
  ] = await Promise.all([
    supabase.from("app_users").select("email").in("role", ["owner", "core_team"]).eq("active", true),
    supabase.from("opportunities").select("*").not("stage", "in", "(won,lost)"),
    supabase.from("tasks").select("*").not("status", "in", "(completed,cancelled)"),
    supabase.from("milestones").select("*").not("status", "in", "(completed,cancelled)"),
    supabase.from("invoices").select("*").not("status", "in", "(paid,cancelled)"),
  ]);

  const overdueOpps = (opportunities ?? []).filter((o) => isOverdue(o.next_action_due, today));
  const staleOpps = (opportunities ?? []).filter((o) => o.last_activity_at < fourteenDaysAgo);
  const overdueTasks = (tasks ?? []).filter((t) => isOverdue(t.due_date, today));
  const dueSoonTasks = (tasks ?? []).filter((t) => isDueSoon(t.due_date, today, 7));
  const overdueMilestones = (milestones ?? []).filter((m) => isOverdue(m.due_date, today));
  const dueSoonMilestones = (milestones ?? []).filter((m) => isDueSoon(m.due_date, today, 14));
  const overdueInvoices = (invoices ?? []).filter((i) => isOverdue(i.due_date, today));
  const dueSoonInvoices = (invoices ?? []).filter((i) => isDueSoon(i.due_date, today, 14));

  const totalAttention =
    overdueOpps.length + staleOpps.length + overdueTasks.length + overdueMilestones.length + overdueInvoices.length;

  const section = (title: string, items: string[]) =>
    items.length === 0
      ? ""
      : `<h3 style="margin:16px 0 4px;font-size:14px;color:#334155;">${title}</h3><ul style="margin:0 0 8px;padding-left:18px;">${items
          .map((i) => `<li style="margin:2px 0;font-size:14px;color:#475569;">${i}</li>`)
          .join("")}</ul>`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="font-size:18px;color:#0f172a;">Strategnosis Growth and Delivery Hub — Daily Digest</h2>
      <p style="font-size:13px;color:#64748b;">${today}</p>
      ${
        totalAttention === 0
          ? `<p style="font-size:14px;color:#16a34a;">Nothing overdue. Nicely done.</p>`
          : `
        <h3 style="font-size:15px;color:#b91c1c;">Needs attention (${totalAttention})</h3>
        ${section(
          "Opportunities — next action overdue",
          overdueOpps.map((o) => `${o.title} (due ${o.next_action_due})`)
        )}
        ${section(
          "Opportunities — no activity in 14+ days",
          staleOpps.map((o) => o.title)
        )}
        ${section(
          "Tasks overdue",
          overdueTasks.map((t) => `${t.title} (due ${t.due_date})`)
        )}
        ${section(
          "Milestones overdue",
          overdueMilestones.map((m) => `${m.title} (due ${m.due_date})`)
        )}
        ${section(
          "Invoices overdue",
          overdueInvoices.map((i) => `${i.invoice_ref} (due ${i.due_date})`)
        )}
      `
      }
      ${section(
        "Tasks due in the next 7 days",
        dueSoonTasks.map((t) => `${t.title} (due ${t.due_date})`)
      )}
      ${section(
        "Milestones due in the next 14 days",
        dueSoonMilestones.map((m) => `${m.title} (due ${m.due_date})`)
      )}
      ${section(
        "Invoices falling due in the next 14 days",
        dueSoonInvoices.map((i) => `${i.invoice_ref} — ${i.amount} (due ${i.due_date})`)
      )}
      ${APP_URL ? `<p style="margin-top:16px;"><a href="${APP_URL}/app/dashboard" style="font-size:13px;color:#2563eb;">Open the dashboard →</a></p>` : ""}
    </div>
  `;

  const toEmails = (recipients ?? []).map((r) => r.email).filter(Boolean);

  if (!RESEND_API_KEY || toEmails.length === 0) {
    return new Response(
      JSON.stringify({ sent: false, reason: !RESEND_API_KEY ? "RESEND_API_KEY not set" : "no active recipients" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: DIGEST_FROM,
      to: toEmails,
      subject:
        totalAttention === 0
          ? "Strategnosis Hub — all clear today"
          : `Strategnosis Hub — ${totalAttention} item(s) need attention`,
      html,
    }),
  });

  const resendBody = await resendResponse.text();

  return new Response(
    JSON.stringify({ sent: resendResponse.ok, recipients: toEmails.length, totalAttention, resendBody }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
