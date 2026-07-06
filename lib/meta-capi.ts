import crypto from "crypto";

/**
 * Meta Conversions API (server-side twin of the browser Meta Pixel).
 *
 * Why we send BOTH:
 *   • The browser pixel can be blocked (ad blockers, iOS ITP, private
 *     browsing) — server-side sends catch what the pixel drops.
 *   • Meta dedupes the pair on shared `event_id`, so a single Purchase
 *     is never counted twice. The browser is authoritative for match
 *     quality (has fbp/fbc cookies); the server is authoritative for
 *     completeness. Meta keeps the union.
 *
 * The shared `event_id` MUST be a stable value both sides can compute
 * from the same order. We use the Mollie payment id (tr_...) — it's on
 * every webhook payload AND persisted to `albums.stripeSessionId`, which
 * is what the browser Purchase reads to populate its `eventID`
 * (see components/dashboard/AlbumAdminPanel.tsx).
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID as string | undefined;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN as string | undefined;
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE;
const GRAPH_VERSION = "v21.0";

/** Meta requires user_data PII fields to be SHA-256 of lowercased-trimmed input. */
const hash = (value: string): string =>
  crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

interface PurchaseInput {
  /** MUST equal the browser pixel eventID. Use the Mollie payment id. */
  eventId: string;
  email?: string | null;
  value: number;
  currency?: string;
  contentName?: string | null;
  eventSourceUrl?: string;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  /** Meta browser cookies, if captured at checkout time. Improves match rate. */
  fbp?: string | null;
  fbc?: string | null;
}

/**
 * POST a Purchase event to the Meta Conversions API.
 *
 * Never throws — errors are logged and swallowed so a Meta outage or
 * misconfigured token can never bring down a Mollie webhook (which
 * MUST return 200 or Mollie retries indefinitely).
 */
export async function sendPurchaseEvent(input: PurchaseInput): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[meta-capi] Missing PIXEL_ID or ACCESS_TOKEN — skipping Purchase send");
    return;
  }

  const userData: Record<string, unknown> = {};
  if (input.email)             userData.em = [hash(input.email)];
  if (input.clientIp)          userData.client_ip_address = input.clientIp;
  if (input.clientUserAgent)   userData.client_user_agent = input.clientUserAgent;
  if (input.fbp)               userData.fbp = input.fbp;
  if (input.fbc)               userData.fbc = input.fbc;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name:    "Purchase",
        event_time:    Math.floor(Date.now() / 1000),
        event_id:      input.eventId,
        action_source: "website",
        ...(input.eventSourceUrl ? { event_source_url: input.eventSourceUrl } : {}),
        user_data:     userData,
        custom_data:   {
          value:    input.value,
          currency: input.currency ?? "EUR",
          ...(input.contentName ? { content_name: input.contentName } : {}),
        },
      },
    ],
    access_token: ACCESS_TOKEN,
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      // Meta returns error details in the JSON body; log those but DO NOT
      // include the request (payload contains the access token).
      const json = await res.json().catch(() => ({}));
      console.error(
        `[meta-capi] Purchase POST returned ${res.status}:`,
        JSON.stringify(json),
      );
    }
  } catch (err) {
    console.error("[meta-capi] Purchase request threw:", err);
  }
}
