import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { htmlEscape, notifyTelegram } from "@/lib/telegram";
import { sendAdminNewUserEmail } from "@/lib/email/notifications";
import { sendRegistrationWelcomeEmail } from "@/lib/email/registration-welcome";
import { db } from "@/lib/db";
import { userMeta } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

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
 *              A bare-domain endpoint silently loses every event.
 *   Events:    user.created
 *   Signing:   copy the "Signing secret" → set CLERK_WEBHOOK_SECRET
 *              in Vercel.
 *
 * Clerk signs requests with Svix; we verify the signature inline
 * (HMAC-SHA256 over `<id>.<timestamp>.<body>`, secret is base64
 * after stripping the `whsec_` prefix). No svix npm dep needed.
 *
 * Belt-and-braces: app/dashboard/page.tsx fires a FALLBACK new-user
 * ping on a user's first dashboard visit if no user_meta row exists
 * yet (i.e. this webhook never fired for them). To keep that
 * exactly-once, this handler registers the user in user_meta.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk webhook] CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ skipped: "no secret" });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  const keyBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedPayload = `${svixId}.${svixTimestamp}.${body}`;
  const expected = createHmac("sha256", keyBytes).update(signedPayload).digest();

  const provided = svixSignature
    .split(" ")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("v1,"))
    .map((s) => Buffer.from(s.slice(3), "base64"));

  const matched = provided.some((p) => {
    if (p.length !== expected.length) return false;
    try { return timingSafeEqual(p, expected); } catch { return false; }
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

  if (event.type === "user.created") {
    const u = event.data as {
      id?: string;
      first_name?: string | null;
      last_name?: string | null;
      email_addresses?: Array<{ email_address?: string }>;
      created_at?: number;
    };

    const primaryEmail = u.email_addresses?.[0]?.email_address?.trim() || null;
    const email = primaryEmail ?? "(no email)";
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || "(no name)";
    const msg =
      `🎉 <b>Nov uporabnik</b>\n` +
      `${htmlEscape(name)} — <code>${htmlEscape(email)}</code>\n` +
      `Clerk ID: <code>${htmlEscape(u.id ?? "?")}</code>`;

    const registrationWelcome = primaryEmail
      ? sendRegistrationWelcomeEmail({ to: primaryEmail, firstName: u.first_name }).catch((err) => {
          console.error("[clerk webhook] registration welcome email failed:", err);
        })
      : Promise.resolve();

    const [sent] = await Promise.all([
      notifyTelegram(msg),
      sendAdminNewUserEmail({ name, email, clerkId: u.id ?? "" }),
      registrationWelcome,
    ]);

    if (!sent) {
      console.error(
        "[clerk webhook] Telegram ping NOT sent — check TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID env vars",
      );
    }

    if (u.id) {
      await db
        .insert(userMeta)
        .values({ clerkId: u.id, source: "clerk-webhook", updatedAt: new Date() })
        .onConflictDoNothing()
        .catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
