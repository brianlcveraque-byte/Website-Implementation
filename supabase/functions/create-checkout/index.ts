// Creates a PayMongo Checkout Session and returns its hosted URL.
//
// This exists because the site is a static export with no server: the PayMongo
// secret key cannot go anywhere near the browser, so the browser calls this
// instead. It writes a pending order and hands back a URL to redirect to.
//
// This function never marks anything paid — see paymongo-webhook for that.
//
// Deploy:  supabase functions deploy create-checkout
// Secrets: PAYMONGO_SECRET_KEY, APP_URL
//
// API shape confirmed against
// https://docs.paymongo.com/reference/create_checkout_sessions.md
//   POST https://api.paymongo.com/v1/checkout_sessions
//   Basic auth, secret key as username with an empty password
//   line_items[].amount is in centavos
//   hosted URL comes back at data.attributes.checkout_url

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYMONGO_SECRET_KEY = Deno.env.get("PAYMONGO_SECRET_KEY");
const SITE_URL = Deno.env.get("APP_URL") ?? "";

// Priced here, server-side, and never taken from the request body. A price sent
// by the browser is a price the buyer can edit — the commonest way a checkout
// integration gets robbed.
const CATALOGUE: Record<string, { name: string; centavos: number; description: string }> = {
  training: {
    name: "Succession Planning Essentials — live session",
    centavos: 50_000, // ₱500.00
    description: "One seat on the two-hour live online session.",
  },
};

const CORS = {
  "Access-Control-Allow-Origin": SITE_URL || "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!PAYMONGO_SECRET_KEY) return json({ error: "payments not configured" }, 503);

  let body: { tier?: string; email?: string; name?: string; organization?: string; sessionDate?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }

  const item = CATALOGUE[body.tier ?? ""];
  if (!item) return json({ error: "unknown tier" }, 400);
  if (!body.email || !body.email.includes("@")) return json({ error: "a valid email is required" }, 400);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Order first, so a buyer who pays but hits a failure on the way back still
  // exists in our records rather than only in PayMongo's.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      tier: body.tier,
      session_date: body.sessionDate ?? null,
      email: body.email,
      name: body.name ?? null,
      organization: body.organization ?? null,
      amount_centavos: item.centavos,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("order insert failed", orderError);
    return json({ error: "could not start checkout" }, 500);
  }

  const auth = btoa(`${PAYMONGO_SECRET_KEY}:`);
  const res = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: [
            {
              name: item.name,
              quantity: 1,
              amount: item.centavos,
              currency: "PHP",
              description: item.description,
            },
          ],
          // GCash first: most ₱500 buyers in this market will not reach for a card.
          payment_method_types: ["gcash", "grab_pay", "card", "paymaya"],
          description: item.description,
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          // Our own id travels with the session so the webhook can find the order
          // without trusting anything the browser tells us on the way back.
          reference_number: order.id,
          metadata: { order_id: order.id, tier: body.tier ?? "", session_date: body.sessionDate ?? "" },
          billing: { email: body.email, name: body.name ?? undefined },
          success_url: `${SITE_URL}/succession-planning/booked`,
          cancel_url: `${SITE_URL}/succession-planning#choose`,
        },
      },
    }),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.data?.attributes?.checkout_url) {
    console.error("paymongo checkout failed", res.status, JSON.stringify(payload));
    return json({ error: "could not start checkout" }, 502);
  }

  await supabase
    .from("orders")
    .update({ checkout_session_id: payload.data.id })
    .eq("id", order.id);

  return json({ checkoutUrl: payload.data.attributes.checkout_url });
});
