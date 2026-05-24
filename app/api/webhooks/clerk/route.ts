import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { htmlEscape, notifyTelegram } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * Clerk webhook receiver. Currently only acts on `user.created` so
 * the team gets a Telegram ping when someone signs up.
 *
 * Configure in Clerk dashboard → Webhooks → "Add Endpoint":
 *   URL:       https://guestcam.si/api/webhooks/clerk
 *   Events:    user.created
 *   Signing:   copy the "Signing secret" → set CLERK_WEBHOOK_SECRET
 *              in Vercel.
 *
 * Clerk signs requests with Svix; we verify the signature inline
 * (HMAC-SHA256 over `<id>.<timestamp>.<body>`, secret is base64
 * after stripping the `whsec_` prefix). No svix npm dep needed.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk webhook] CLERK_WEBHOOK_SECRET not set");
    // 200 so Clerk doesn't retry forever when we know the env is
    // missing — the operator needs to set it; retries won't help.
    return NextResponse.json({ skipped: "no secret" });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  // Verify signature. Svix sends one or more space-separated entries
  // in the form `v1,<base64sig>` (the prefix lets them rotate keys).
  // We accept the message if ANY of the listed v1 signatures match.
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
    const email = u.email_addresses?.[0]?.email_address ?? "(no email)";
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || "(no name)";
    const msg =
      `🎉 <b>Nov uporabnik</b>\n` +
      `${htmlEscape(name)} — <code>${htmlEscape(email)}</code>\n` +
      `Clerk ID: <code>${htmlEscape(u.id ?? "?")}</code>`;
    await notifyTelegram(msg);
  }

  return NextResponse.json({ received: true });
}
