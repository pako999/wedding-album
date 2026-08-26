import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit("contact", 3, 10 * 60_000);
  if (!rl.ok) return rl.response;

  let payload: {
    name?: unknown;
    email?: unknown;
    subject?: unknown;
    message?: unknown;
    turnstileToken?: unknown;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name    = String(payload.name ?? "").trim().slice(0, 200);
  const email   = String(payload.email ?? "").trim().slice(0, 200);
  const subject = String(payload.subject ?? "").trim().slice(0, 200) || "Guestcam — kontakt";
  const message = String(payload.message ?? "").trim().slice(0, 5000);
  const token   = typeof payload.turnstileToken === "string" ? payload.turnstileToken : undefined;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const verification = await verifyTurnstileToken(token, await getClientIp());
  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.error ?? "Verification failed" },
      { status: verification.status },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email not configured" }, { status: 503 });
  }
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@guestcam.si";
  const to = process.env.CONTACT_RECIPIENT_EMAIL ?? "info@guestcam.si";

  const safeName    = escapeHtml(name);
  const safeEmail   = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px;">
      <h2 style="font-size: 18px; color: #0F1729;">Novo sporočilo iz kontakt obrazca</h2>
      <p style="font-size: 14px; color: #6b7280;">
        <strong>Od:</strong> ${safeName} &lt;${safeEmail}&gt;<br />
        <strong>Zadeva:</strong> ${safeSubject}
      </p>
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: #fafaf9; color: #1f2937; font-size: 14px; line-height: 1.55;">
        ${safeMessage}
      </div>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
        Lahko odgovorite neposredno na ta email — odgovor bo šel direktno pošiljatelju.
      </p>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `Guestcam Kontakt <${from}>`,
      to,
      replyTo: email,
      subject: `[Kontakt] ${subject}`,
      html,
    });
  } catch (err) {
    console.error("[contact] resend send failed:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
