/**
 * /api/unsubscribe/[token]
 *
 * Two-step unsubscribe:
 *   GET  → renders a "Confirm unsubscribe" page with a POST form.
 *   POST → actually flips marketing_consent = false and stamps unsubscribed_at.
 *
 * Why not GET-that-unsubscribes: Gmail/Outlook link scanners and corporate
 * URL-defense services routinely GET every link in an email to check for
 * phishing. A GET that mutates would auto-unsubscribe subscribers with no
 * intent. The RFC-8058 one-click flow uses POST for exactly this reason.
 *
 * We always render the confirmation page (200) even if the token is bad —
 * leaking "no such token" would allow token probing.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guestEmails } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.guestcam.si";

type Lang = "sl" | "hr" | "sr" | "de" | "en" | "es";
const LANGS: readonly Lang[] = ["sl", "hr", "sr", "de", "en", "es"];

interface Copy {
  title: string;
  headingConfirm: string;
  bodyConfirm: string;
  buttonConfirm: string;
  headingDone: string;
  bodyDone: string;
  home: string;
}

const COPY: Record<Lang, Copy> = {
  sl: {
    title: "Odjava — Guestcam",
    headingConfirm: "Ali se res želite odjaviti?",
    bodyConfirm: "Ne bomo vam več pošiljali sporočil o novih dogodkih. Če potrdite, vas takoj odjavimo.",
    buttonConfirm: "Da, odjavi me",
    headingDone: "Uspešno odjavljeni",
    bodyDone: "Ne bomo vam več pošiljali sporočil. Če ste to storili po pomoti, nam pišite na info@guestcam.si.",
    home: "Nazaj na guestcam.si",
  },
  hr: {
    title: "Odjava — Guestcam",
    headingConfirm: "Želite li se odjaviti?",
    bodyConfirm: "Više vam nećemo slati poruke o novim događajima. Ako potvrdite, odmah vas odjavljujemo.",
    buttonConfirm: "Da, odjavi me",
    headingDone: "Uspješno odjavljeni",
    bodyDone: "Više vam nećemo slati poruke. Ako ste ovo učinili greškom, javite nam na info@guestcam.si.",
    home: "Natrag na guestcam.si",
  },
  sr: {
    title: "Odjava — Guestcam",
    headingConfirm: "Želite li da se odjavite?",
    bodyConfirm: "Više vam nećemo slati poruke o novim događajima. Ako potvrdite, odmah vas odjavljujemo.",
    buttonConfirm: "Da, odjavi me",
    headingDone: "Uspešno odjavljeni",
    bodyDone: "Više vam nećemo slati poruke. Ako ste ovo uradili greškom, pišite nam na info@guestcam.si.",
    home: "Nazad na guestcam.si",
  },
  de: {
    title: "Abmeldung — Guestcam",
    headingConfirm: "Möchten Sie sich wirklich abmelden?",
    bodyConfirm: "Sie erhalten keine weiteren E-Mails zu neuen Veranstaltungen mehr. Bei Bestätigung melden wir Sie sofort ab.",
    buttonConfirm: "Ja, abmelden",
    headingDone: "Erfolgreich abgemeldet",
    bodyDone: "Sie erhalten keine weiteren E-Mails mehr. Falls dies ein Versehen war, schreiben Sie uns an info@guestcam.si.",
    home: "Zurück zu guestcam.si",
  },
  en: {
    title: "Unsubscribe — Guestcam",
    headingConfirm: "Are you sure you want to unsubscribe?",
    bodyConfirm: "We won't send you any more emails about new events. If you confirm, we'll unsubscribe you right away.",
    buttonConfirm: "Yes, unsubscribe me",
    headingDone: "You're unsubscribed",
    bodyDone: "We won't send you any more emails. If this was a mistake, email us at info@guestcam.si.",
    home: "Back to guestcam.si",
  },
  es: {
    title: "Cancelar suscripción — Guestcam",
    headingConfirm: "¿Seguro que quieres cancelar la suscripción?",
    bodyConfirm: "No te enviaremos más correos sobre nuevos eventos. Si confirmas, te damos de baja al instante.",
    buttonConfirm: "Sí, cancelar",
    headingDone: "Suscripción cancelada",
    bodyDone: "No te enviaremos más correos. Si fue un error, escríbenos a info@guestcam.si.",
    home: "Volver a guestcam.si",
  },
};

function pickLang(v: string | null | undefined): Lang {
  if (v && (LANGS as readonly string[]).includes(v)) return v as Lang;
  return "sl";
}

function pageShell(lang: Lang, inner: string): string {
  const t = COPY[lang];
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0F1729;min-height:100vh;">
  <div style="max-width:520px;margin:0 auto;padding:80px 20px 40px;text-align:center;">
    <div style="background:#ffffff;border-radius:18px;padding:44px 32px;box-shadow:0 4px 24px rgba(15,23,41,0.06);">
      ${inner}
    </div>
  </div>
</body>
</html>`;
}

function renderConfirm(lang: Lang, token: string): string {
  const t = COPY[lang];
  return pageShell(lang, `
      <div style="font-size:38px;line-height:1;margin-bottom:14px;">✉️</div>
      <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#0F1729;">${t.headingConfirm}</h1>
      <p style="margin:0 0 26px;font-size:15px;line-height:1.6;color:#475569;">${t.bodyConfirm}</p>
      <form method="POST" action="/api/unsubscribe/${encodeURIComponent(token)}" style="margin:0;">
        <button type="submit" style="display:inline-block;padding:13px 26px;background:#0F1729;color:#ffffff;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;">${t.buttonConfirm}</button>
      </form>
      <p style="margin:22px 0 0;font-size:12px;">
        <a href="${APP_URL}" style="color:#94A3B8;text-decoration:none;">${t.home}</a>
      </p>`);
}

function renderDone(lang: Lang): string {
  const t = COPY[lang];
  return pageShell(lang, `
      <div style="font-size:44px;line-height:1;margin-bottom:18px;">✓</div>
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#0F1729;">${t.headingDone}</h1>
      <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#475569;">${t.bodyDone}</p>
      <a href="${APP_URL}" style="display:inline-block;padding:12px 24px;background:#0F1729;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">${t.home}</a>`);
}

// UUID or similar opaque token — reject anything that isn't hex/dash.
const TOKEN_RE = /^[a-f0-9-]{16,64}$/i;

async function localeForToken(token: string | undefined): Promise<Lang> {
  if (!token || !TOKEN_RE.test(token)) return "sl";
  try {
    const row = await db
      .select({ locale: guestEmails.locale })
      .from(guestEmails)
      .where(eq(guestEmails.unsubscribeToken, token))
      .limit(1);
    return pickLang(row[0]?.locale);
  } catch {
    return "sl";
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const lang = await localeForToken(token);
  return new NextResponse(renderConfirm(lang, token ?? ""), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  let lang: Lang = "sl";

  if (token && TOKEN_RE.test(token)) {
    try {
      const row = await db
        .select({ id: guestEmails.id, locale: guestEmails.locale })
        .from(guestEmails)
        .where(eq(guestEmails.unsubscribeToken, token))
        .limit(1);

      if (row[0]) {
        lang = pickLang(row[0].locale);
        await db
          .update(guestEmails)
          .set({
            marketingConsent: false,
            unsubscribedAt: new Date(),
          })
          .where(eq(guestEmails.id, row[0].id));
      }
    } catch (err) {
      console.error("[unsubscribe] db error (still showing OK page):", err);
    }
  }

  return new NextResponse(renderDone(lang), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
