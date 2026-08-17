// Transactional + light marketing email automation. Runs every 5 minutes via
// pg_cron (see supabase/migrations/0008_email_automation.sql).
//
// Idempotency: every send is recorded in email_log with a unique constraint on
// (email_type, related_table, related_id). We only send where no log row
// exists, and we write the log row after a successful send — so a failure
// simply retries on the next run rather than double-sending.
//
// Deploy: supabase functions deploy marketing-emails
// Secrets required: RESEND_API_KEY (and optionally MARKETING_FROM_EMAIL, APP_URL)

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("MARKETING_FROM_EMAIL") ?? "onboarding@resend.dev";
const SITE_URL = Deno.env.get("APP_URL") ?? "";

// Only look at records from the last 7 days, so enabling this feature never
// back-blasts everyone who ever filled in the form.
const WINDOW_DAYS = 7;
// A single, low-pressure nudge — not an aggressive drip sequence.
const FOLLOWUP_AFTER_DAYS = 3;

type LogKey = string;
const key = (type: string, table: string, id: string): LogKey => `${type}|${table}|${id}`;

function shell(bodyHtml: string, footerNote: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <p style="font-size:12px;color:#94a3b8;">
      Strategnosis Solutions OPC${SITE_URL ? ` · <a href="${SITE_URL}" style="color:#6366f1;">${SITE_URL.replace(/^https?:\/\//, "")}</a>` : ""}
      <br />${footerNote}
    </p>
  </div>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; body: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  return { ok: res.ok, body: await res.text() };
}

Deno.serve(async () => {
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ sent: 0, reason: "RESEND_API_KEY not set" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const windowStart = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();
  const followupCutoff = new Date(Date.now() - FOLLOWUP_AFTER_DAYS * 86_400_000).toISOString();

  // NOTE: public_inquiries timestamps its rows with submitted_at, not
  // created_at — see supabase/migrations/0001_schema.sql.
  const [inquiryRes, subscriberRes, leadRes, logRes] = await Promise.all([
    supabase.from("public_inquiries").select("*").gte("submitted_at", windowStart),
    supabase.from("newsletter_subscribers").select("*").gte("subscribed_at", windowStart),
    supabase.from("toolkit_leads").select("*").gte("downloaded_at", windowStart),
    supabase.from("email_log").select("email_type, related_table, related_id"),
  ]);

  // Surface query failures instead of silently treating them as "nothing to
  // do" — a wrong column name previously made this function report success
  // while doing nothing at all.
  const queryErrors = [inquiryRes.error, subscriberRes.error, leadRes.error, logRes.error].filter(Boolean);
  if (queryErrors.length > 0) {
    return new Response(
      JSON.stringify({ error: "query failed", details: queryErrors.map((e) => e!.message) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const inquiries = inquiryRes.data;
  const subscribers = subscriberRes.data;
  const leads = leadRes.data;
  const logs = logRes.data;

  const sentKeys = new Set<LogKey>(
    (logs ?? []).map((l) => key(l.email_type, l.related_table, l.related_id))
  );

  const results: { type: string; to: string; ok: boolean }[] = [];

  async function deliver(
    emailType: string,
    table: string,
    id: string,
    to: string,
    subject: string,
    html: string
  ) {
    if (!to || sentKeys.has(key(emailType, table, id))) return;
    const { ok, body } = await sendEmail(to, subject, html);
    // Log either way: on failure we still want the response recorded, but we
    // only mark success=true when it actually went out. A failed row still
    // occupies the unique slot, so check the dashboard rather than silently
    // retrying forever against a bad address.
    await supabase.from("email_log").insert({
      email_type: emailType,
      recipient: to,
      related_table: table,
      related_id: id,
      provider_response: body.slice(0, 500),
      success: ok,
    });
    sentKeys.add(key(emailType, table, id));
    results.push({ type: emailType, to, ok });
  }

  // 1. Acknowledge new inquiries — transactional, they contacted us.
  for (const inq of inquiries ?? []) {
    const firstName = (inq.name ?? "").split(" ")[0] || "there";
    await deliver(
      "inquiry_ack",
      "public_inquiries",
      inq.id,
      inq.email,
      "We've received your inquiry — Strategnosis",
      shell(
        `<h2 style="font-size:20px;font-weight:normal;">Thank you, ${firstName}.</h2>
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           We've received your inquiry and will respond personally within one business day.
         </p>
         ${inq.service_interest ? `<p style="font-size:15px;color:#475569;">You noted an interest in <strong>${inq.service_interest}</strong>.</p>` : ""}
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           If your question is time-sensitive, simply reply to this email and it will reach us directly.
         </p>
         <p style="font-size:15px;color:#475569;">— Strategnosis Solutions OPC</p>`,
        "You're receiving this because you submitted an inquiry on our website."
      )
    );
  }

  // 2. Welcome new newsletter subscribers — explicit opt-in.
  for (const sub of subscribers ?? []) {
    const firstName = (sub.name ?? "").split(" ")[0] || "there";
    await deliver(
      "newsletter_welcome",
      "newsletter_subscribers",
      sub.id,
      sub.email,
      "Welcome — Strategnosis insights",
      shell(
        `<h2 style="font-size:20px;font-weight:normal;">Welcome, ${firstName}.</h2>
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           You'll receive occasional notes on strategy, HR systems, and healthcare management —
           sent rarely, and only when there's something genuinely useful to share.
         </p>
         ${SITE_URL ? `<p style="font-size:15px;"><a href="${SITE_URL}/toolkits" style="color:#6366f1;">Browse our starter toolkits →</a></p>` : ""}
         <p style="font-size:15px;color:#475569;">— Strategnosis Solutions OPC</p>`,
        "You subscribed on our website. Reply with \"unsubscribe\" to be removed at any time."
      )
    );
  }

  // 3. One low-pressure follow-up for toolkit requests older than 3 days.
  for (const inq of inquiries ?? []) {
    const isToolkitRequest = typeof inq.message === "string" && inq.message.includes("toolkit");
    if (!isToolkitRequest || inq.submitted_at > followupCutoff) continue;
    const firstName = (inq.name ?? "").split(" ")[0] || "there";
    await deliver(
      "toolkit_followup",
      "public_inquiries",
      inq.id,
      inq.email,
      "Anything we can help with?",
      shell(
        `<h2 style="font-size:20px;font-weight:normal;">Hello ${firstName},</h2>
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           Following up on the toolkit you requested — if you've had a chance to work through it and
           have questions, we're happy to talk them through.
         </p>
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           The first consultation is free and carries no obligation.
         </p>
         ${SITE_URL ? `<p style="font-size:15px;"><a href="${SITE_URL}/#contact" style="color:#6366f1;">Book a free consultation →</a></p>` : ""}
         <p style="font-size:15px;color:#475569;">— Strategnosis Solutions OPC</p>`,
        "You're receiving this one-time follow-up because you requested a toolkit from us."
      )
    );
  }

  // 4. Deliver the succession workbook. The landing page already hands over the
  //    file on submit, so this is the copy that survives a closed tab — and the
  //    reason collecting the address is worth anything.
  for (const lead of leads ?? []) {
    const firstName = (lead.name ?? "").split(" ")[0] || "there";
    const link = SITE_URL ? `${SITE_URL}/downloads/succession-planning-toolkit.xlsx` : "";
    await deliver(
      "succession_workbook_delivery",
      "toolkit_leads",
      lead.id,
      lead.email,
      "Your Succession Planning Toolkit",
      shell(
        `<h2 style="font-size:20px;font-weight:normal;">Here it is, ${firstName}.</h2>
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           Your copy of the Succession Planning Toolkit is attached to this link — keep it somewhere
           you'll find it again.
         </p>
         ${link ? `<p style="font-size:15px;"><a href="${link}" style="color:#6366f1;">Download the workbook →</a></p>` : ""}
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           Start with the <strong>SUCCESSION PLANNING</strong> sheet and score just your top ten positions
           on the three criticality factors. That alone usually tells you something uncomfortable, and it
           takes about twenty minutes.
         </p>
         <p style="font-size:15px;color:#475569;">— Strategnosis Solutions OPC</p>`,
        "You're receiving this because you requested the toolkit on our website."
      )
    );
  }

  // 5. One nurture note three days on, pointing at the two ways forward. Same
  //    low-pressure posture as the toolkit follow-up above — one send, not a drip.
  for (const lead of leads ?? []) {
    if (lead.downloaded_at > followupCutoff) continue;
    const firstName = (lead.name ?? "").split(" ")[0] || "there";
    await deliver(
      "succession_nurture",
      "toolkit_leads",
      lead.id,
      lead.email,
      "What the workbook usually turns up",
      shell(
        `<h2 style="font-size:20px;font-weight:normal;">Hello ${firstName},</h2>
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           If you've filled in the bench sheet by now, the column worth looking at is <strong>Bench Risk</strong>.
           Most organizations running this for the first time find at least one critical position with nobody
           behind it at all.
         </p>
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           Closing that gap can be as small as a ₱500 seat on a two-hour live session, or as complete as having
           the whole system built against your own plantilla. There are four ways in, depending on how much of
           it you want to do yourself.
         </p>
         ${SITE_URL ? `<p style="font-size:15px;"><a href="${SITE_URL}/succession-planning#choose" style="color:#6366f1;">See both options →</a></p>` : ""}
         <p style="font-size:15px;color:#475569;line-height:1.6;">
           If neither fits yet, replying to this email with your numbers is free and often enough.
         </p>
         <p style="font-size:15px;color:#475569;">— Strategnosis Solutions OPC</p>`,
        "You're receiving this one-time note because you downloaded our succession planning toolkit."
      )
    );
  }

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
