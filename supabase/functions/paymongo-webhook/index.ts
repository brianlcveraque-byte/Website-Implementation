// Receives PayMongo webhooks and is the only thing that may mark an order paid.
//
// Deploy: supabase functions deploy paymongo-webhook --no-verify-jwt
//   The --no-verify-jwt matters. PayMongo is not a Supabase user and sends no
//   JWT; with the default gateway check every webhook is rejected before it
//   reaches this code. The signature check below is what authenticates it.
//
// Secrets: PAYMONGO_WEBHOOK_SECRET, RESEND_API_KEY, MARKETING_FROM_EMAIL, APP_URL,
//          SESSION_JOIN_URL
//
// ⚠️ SIGNATURE VERIFICATION IS UNVERIFIED AGAINST PRIMARY DOCS.
// PayMongo restructured their documentation and the signature pages now 404, so
// the scheme below comes from a secondary summary:
//   header  Paymongo-Signature: t=<unix>,te=<test sig>,li=<live sig>
//   signed  `${t}.${rawBody}`  HMAC-SHA256, keyed with the webhook secret
//   compare te in test mode, li in live mode
// Confirm this against PayMongo's dashboard docs before going live. If it is
// wrong, this function rejects every webhook — loudly, not silently, which is
// the right failure direction: no order is ever marked paid by accident.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("PAYMONGO_WEBHOOK_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("MARKETING_FROM_EMAIL") ?? "onboarding@resend.dev";
const SITE_URL = Deno.env.get("APP_URL") ?? "";
const JOIN_URL = Deno.env.get("SESSION_JOIN_URL") ?? "";

/** Constant-time compare, so a wrong signature leaks nothing through timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseSignature(header: string): { t?: string; te?: string; li?: string } {
  const out: Record<string, string> = {};
  for (const part of header.split(",")) {
    const [k, v] = part.split("=");
    if (k && v) out[k.trim()] = v.trim();
  }
  return out;
}

async function sendSeatConfirmation(
  to: string,
  firstName: string,
  sessionDate: string | null
): Promise<{ ok: boolean; body: string }> {
  const dateLine = sessionDate
    ? new Date(sessionDate + "T00:00:00Z").toLocaleDateString("en-PH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "the next scheduled session";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
    <h2 style="font-size:20px;font-weight:normal;">Your seat is confirmed, ${firstName}.</h2>
    <p style="font-size:15px;color:#475569;line-height:1.6;">
      You're booked onto <strong>Succession Planning Essentials</strong>, the two-hour live session.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.6;">
      <strong>When:</strong> ${dateLine}
    </p>
    ${JOIN_URL ? `<p style="font-size:15px;"><a href="${JOIN_URL}" style="color:#6366f1;">Joining link →</a></p>` : `<p style="font-size:15px;color:#475569;">We'll send the joining link closer to the date.</p>`}
    <p style="font-size:15px;color:#475569;line-height:1.6;">
      Come with the workbook at least partly filled in — even ten positions scored on the
      criticality sheet makes the session far more useful, because we work through your numbers
      rather than a worked example.
    </p>
    ${SITE_URL ? `<p style="font-size:15px;"><a href="${SITE_URL}/downloads/succession-planning-toolkit.xlsx" style="color:#6366f1;">Download the workbook →</a></p>` : ""}
    <p style="font-size:15px;color:#475569;line-height:1.6;">
      The session is recorded, and we'll send you the recording afterwards — so if something comes
      up on the day, you won't lose what you paid for.
    </p>
    <p style="font-size:15px;color:#475569;">— Strategnosis Solutions OPC</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <p style="font-size:12px;color:#94a3b8;">
      You're receiving this because you booked a seat on our website.
    </p>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject: "Your seat is confirmed", html }),
  });
  return { ok: res.ok, body: await res.text() };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  if (!WEBHOOK_SECRET) {
    console.error("PAYMONGO_WEBHOOK_SECRET not set — rejecting");
    return new Response("not configured", { status: 503 });
  }

  // Raw body, read once. Re-serialising parsed JSON changes the bytes and the
  // signature will never match.
  const raw = await req.text();
  const header = req.headers.get("Paymongo-Signature") ?? "";
  const { t, te, li } = parseSignature(header);

  if (!t || (!te && !li)) {
    console.error("malformed Paymongo-Signature header:", header);
    return new Response("bad signature", { status: 400 });
  }

  const expected = await hmacHex(WEBHOOK_SECRET, `${t}.${raw}`);
  const provided = li ?? te!; // live signature wins when both are present
  if (!safeEqual(expected, provided)) {
    console.error("signature mismatch — rejecting webhook");
    return new Response("bad signature", { status: 401 });
  }

  let event: {
    data?: { attributes?: { type?: string; data?: { id?: string; attributes?: Record<string, unknown> } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("invalid JSON", { status: 400 });
  }

  const type = event.data?.attributes?.type ?? "";
  // Anything other than a successful checkout is acknowledged and ignored —
  // returning non-2xx would make PayMongo retry an event we simply don't handle.
  if (type !== "checkout_session.payment.paid") {
    return new Response(JSON.stringify({ ignored: type }), { status: 200 });
  }

  const checkoutSessionId = event.data?.attributes?.data?.id;
  if (!checkoutSessionId) return new Response("missing checkout session id", { status: 400 });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, email, name, session_date, payment_status")
    .eq("checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (error || !order) {
    console.error("no order for checkout session", checkoutSessionId, error);
    // 200 on purpose: retrying will not conjure an order that was never written.
    return new Response(JSON.stringify({ error: "order not found" }), { status: 200 });
  }

  // PayMongo retries until it gets a 2xx, so the same paid event arrives more
  // than once as a matter of course. Doing the work only on the pending→paid
  // transition is what stops a second confirmation email going out.
  if (order.payment_status === "paid") {
    return new Response(JSON.stringify({ alreadyProcessed: true }), { status: 200 });
  }

  await supabase
    .from("orders")
    .update({ payment_status: "paid", paid_at: new Date().toISOString(), provider_payload: event })
    .eq("id", order.id);

  if (RESEND_API_KEY) {
    const firstName = (order.name ?? "").split(" ")[0] || "there";
    const { ok, body } = await sendSeatConfirmation(order.email, firstName, order.session_date);
    await supabase.from("email_log").insert({
      email_type: "session_seat_confirmation",
      recipient: order.email,
      related_table: "orders",
      related_id: order.id,
      provider_response: body.slice(0, 500),
      success: ok,
    });
  }

  return new Response(JSON.stringify({ processed: order.id }), { status: 200 });
});
