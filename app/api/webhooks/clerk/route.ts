import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { htmlEscape, notifyTelegram } from "@/lib/telegram";
import { sendAdminNewUserEmail } from "@/lib/email/notifications";
import { sendRegistrationWelcomeEmail } from "@/lib/email/registration-welcome";
import { db } from "@/lib/db";
import { userMeta } from "@/lib/db/schema";
import { claimWebhookEvent, maybePruneWebhookReceipts } from "@/lib/webhook-idempotency";
import { parseSignupSourceSnapshot } from "@/lib/attribution/signup";
import { signupSourceTelegramLines } from "@/lib/attribution/telegram";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Svix's standard replay window is five minutes. A valid signature captured
// from the wire is therefore useless once its timestamp is stale.
const MAX_SVIX_AGE_SECONDS = 5 * 60;

/**
 * Clerk webhook receiver. Acts on `user.created` so the team gets an
 * internal notification and the new user immediately receives the
 * Guestcam getting-started email.
 *
 * Configure in Clerk dashboard → Webhooks → "Add Endpoint":
 *   URL:       https://www.guestcam.si/api/webhooks/clerk
 *              ^^^ MUST be the www host. The bare domain 307-redirects
 *              to www on Vercel, and Svix (Clerk's deliverer) treats
 *              3xx as a FAILED delivery — it does not follow redirects.
 *   Events:    user.created
 *   Signing:   copy the "Signing secret" → set CLERK_WEBHOOK_SECRET
 *              in Vercel.
 *
 * Requests are protected twice:
 *   1) Svix HMAC + timestamp verification prevents forged/stale requests.
 *   2) webhook_receipts atomically claims svix-id so retries/replays cannot
 *      send duplicate welcome emails or admin notifications.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    // Never acknowledge an event we could not authenticate. Returning 5xx
    // makes Clerk/Svix retry after configuration is fixed instead of silently
    // losing the signup event forever.
    console.error("[clerk webhook] CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const svixId = req.headers.get("svix-id")?.trim();
  const svixTimestamp = req.headers.get("svix-timestamp")?.trim();
  const svixSignature = req.headers.get("svix-signature")?.trim();
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const timestamp = Number(svixTimestamp);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(nowSeconds - timestamp) > MAX_SVIX_AGE_SECONDS) {
    console.warn("[clerk webhook] rejected stale/invalid svix timestamp");
    return NextResponse.json({ error: "Stale webhook" }, { status: 400 });
  }

  const body = await req.text();
  const encodedSecret = secret.replace(/^whsec_/, "");
  const keyBytes = Buffer.from(encodedSecret, "base64");
  if (keyBytes.length === 0) {
    console.error("[clerk webhook] invalid signing secret encoding");
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 503 });
  }

  const signedPayload = `${svixId}.${svixTimestamp}.${body}`;
  const expected = createHmac("sha256", keyBytes).update(signedPayload).digest();

  const provided = svixSignature
    .split(" ")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("v1,"))
    .map((s) => Buffer.from(s.slice(3), "base64"));

  const matched = provided.some((p) => {
    if (p.length !== expected.length) return false;
    try {
      return timingSafeEqual(p, expected);
    } catch {
      return false;
    }
  });
  if (!matched) {
    console.error("[clerk webhook] signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Claim only after signature + payload validation. If the DB is temporarily
  // unavailable, fail closed with 503 so Svix retries; processing an event
  // without a durable receipt would re-open duplicate-delivery risk.
  let claimed = false;
  try {
    claimed = await claimWebhookEvent("clerk", svixId);
  } catch (err) {
    console.error("[clerk webhook] idempotency store unavailable:", err);
    return NextResponse.json({ error: "Webhook store unavailable" }, { status: 503 });
  }

  if (!claimed) {
    return NextResponse.json(
      { received: true, duplicate: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  if (event.type === "user.created") {
    const u = event.data as {
      id?: string;
      first_name?: string | null;
      last_name?: string | null;
      primary_email_address_id?: string | null;
      email_addresses?: Array<{ id?: string; email_address?: string }>;
      created_at?: number;
      unsafe_metadata?: Record<string, unknown>;
    };

    const primaryAddress = u.email_addresses?.find(
      (address) => address.id && address.id === u.primary_email_address_id,
    );
    const primaryEmail = (
      primaryAddress?.email_address ?? u.email_addresses?.[0]?.email_address ?? ""
    ).trim() || null;
    const email = primaryEmail ?? "(no email)";
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || "(no name)";
    const signupSource = parseSignupSourceSnapshot(
      u.unsafe_metadata?.guestcamAttribution,
    );

    // Register before notifications so a near-simultaneous first dashboard
    // visit does not fire the fallback "webhook missed" notification.
    if (u.id) {
      await db
        .insert(userMeta)
        .values({ clerkId: u.id, source: "clerk-webhook", updatedAt: new Date() })
        .onConflictDoNothing()
        .catch((err) => {
          console.warn("[clerk webhook] user_meta registration failed:", err);
        });
    }

    const msg =
      `🎉 <b>Nov uporabnik</b>\n` +
      `${htmlEscape(name)} — <code>${htmlEscape(email)}</code>\n` +
      `Clerk ID: <code>${htmlEscape(u.id ?? "?")}</code>` +
      signupSourceTelegramLines(signupSource);

    // A downstream notification provider being unavailable must not cause
    // Clerk to replay the entire event and duplicate the providers that did
    // succeed. Log each failure independently; the durable receipt remains.
    const results = await Promise.allSettled([
      notifyTelegram(msg),
      sendAdminNewUserEmail({ name, email, clerkId: u.id ?? "" }),
      primaryEmail
        ? sendRegistrationWelcomeEmail({ to: primaryEmail, firstName: u.first_name })
        : Promise.resolve(),
    ]);

    if (results[0].status === "rejected" || results[0].value !== true) {
      console.error(
        "[clerk webhook] Telegram ping NOT sent — check TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID",
        results[0].status === "rejected" ? results[0].reason : undefined,
      );
    }
    if (results[1].status === "rejected") {
      console.error("[clerk webhook] admin new-user email failed:", results[1].reason);
    }
    if (results[2].status === "rejected") {
      console.error("[clerk webhook] registration welcome email failed:", results[2].reason);
    }
  }

  await maybePruneWebhookReceipts();

  return NextResponse.json(
    { received: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
