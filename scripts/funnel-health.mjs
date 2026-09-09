/**
 * End-to-end health of the HRIS enrolment funnel.
 *
 * Answers the only three questions that matter before spending on ads:
 * does an enrolment land, does the welcome email go out, and does the alert
 * reach a human. Read-only apart from the optional --send, which invokes the
 * same edge function the cron invokes.
 *
 * Run:  node --env-file=.env.local scripts/funnel-health.mjs [--send]
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

async function rest(path) {
  const response = await fetch(`${url}/rest/v1/${path}`, { headers });
  if (!response.ok) throw new Error(`${path} → ${response.status} ${await response.text()}`);
  return response.json();
}

const since = new Date(Date.now() - 7 * 86_400_000).toISOString();

const leads = await rest(
  `toolkit_leads?toolkit_slug=eq.hris-sandbox&order=downloaded_at.desc&limit=10`,
);

console.log(`HRIS enrolments (all time): ${leads.length >= 10 ? "10+" : leads.length}`);
for (const lead of leads.slice(0, 5)) {
  console.log(
    `  ${lead.downloaded_at?.slice(0, 19)}  ${lead.email}  ${lead.organization ?? "—"}  [${lead.source ?? "no source"}]`,
  );
}

if (leads.length === 0) {
  console.log("\n  ⚠ NOTHING IS BEING CAPTURED. An ad pointed at this collects nothing.");
  process.exit(1);
}

if (process.argv.includes("--send")) {
  console.log("\nInvoking marketing-emails (the same function the 5-minute cron calls)...");
  const response = await fetch(`${url}/functions/v1/marketing-emails`, {
    method: "POST",
    headers,
    body: "{}",
  });
  const body = await response.json().catch(() => ({}));
  console.log(`  HTTP ${response.status}`);
  console.log(`  processed: ${body.processed ?? "?"}`);
  if (body.warning) console.log(`  ⚠ ${body.warning}`);
  if (body.logFailures?.length) console.log(`  ⚠ logFailures: ${JSON.stringify(body.logFailures)}`);
  if (Array.isArray(body.results) && body.results.length) {
    for (const result of body.results.slice(0, 8)) console.log(`  → ${JSON.stringify(result)}`);
  }
}

const log = await rest(
  `email_log?select=email_type,sent_at,related_id&sent_at=gte.${since}&order=sent_at.desc&limit=20`,
);

console.log(`\nEmails logged in the last 7 days: ${log.length}`);
const byType = {};
for (const row of log) byType[row.email_type] = (byType[row.email_type] ?? 0) + 1;
for (const [type, count] of Object.entries(byType)) console.log(`  ${type}: ${count}`);

const welcomeSent = new Set(
  log.filter((r) => r.email_type === "hris_sandbox_welcome").map((r) => r.related_id),
);
const alerted = new Set(
  log.filter((r) => r.email_type === "internal_lead_alert").map((r) => r.related_id),
);

console.log("\nPer recent enrolment:");
for (const lead of leads.slice(0, 5)) {
  console.log(
    `  ${lead.email.padEnd(42)} welcome ${welcomeSent.has(lead.id) ? "SENT" : "not yet"} · alert ${alerted.has(lead.id) ? "SENT" : "not yet"}`,
  );
}
