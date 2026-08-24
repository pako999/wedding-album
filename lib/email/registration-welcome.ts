import { Resend } from "resend";
import { SITE_URL } from "@/lib/urls";

const FROM = process.env.RESEND_FROM ?? "noreply@guestcam.si";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char
  ));
}

export interface RegistrationWelcomeFields {
  firstName?: string | null;
}

export function registrationWelcomeEmailHtml({ firstName }: RegistrationWelcomeFields): string {
  const greeting = firstName?.trim()
    ? `Pozdravljeni, <strong>${escapeHtml(firstName.trim())}</strong>!`
    : "Pozdravljeni!";
  const createUrl = `${APP_URL}/dashboard/new`;
  const contactUrl = `${APP_URL}/contact`;
  const whatsappUrl = "https://wa.me/38641580250";

  return `<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dobrodošli v Guestcam</title>
</head>
<body style="margin:0;padding:0;background:#F4F5F7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F4F5F7;padding:28px 14px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #E5E7EB;">
        <tr>
          <td style="background:#FFC94D;padding:28px 32px;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.5px;font-weight:800;color:#111827;">📸 GUESTCAM</p>
            <h1 style="margin:0;font-size:26px;line-height:1.2;font-weight:800;color:#111827;">Dobrodošli — začnite brezplačno</h1>
          </td>
        </tr>

        <tr><td style="padding:30px 32px 0;">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#111827;">${greeting}</p>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#5B6472;">
            Hvala za registracijo v Guestcam. V manj kot dveh minutah lahko ustvarite zasebno galerijo za poroko, rojstni dan, poslovni dogodek ali drugo praznovanje. Gostje nato samo skenirajo QR kodo in začnejo nalagati fotografije — brez aplikacije in brez prijave.
          </p>
        </td></tr>

        <tr><td style="padding:24px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFF9E8;border:1px solid #FFE09A;border-radius:14px;">
            <tr><td style="padding:20px 22px;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;color:#A66A00;">Brezplačni test</p>
              <p style="margin:0 0 8px;font-size:18px;font-weight:800;color:#111827;">Preizkusite Guestcam brez kreditne kartice</p>
              <p style="margin:0;font-size:14px;line-height:1.65;color:#5B6472;">
                Brezplačna galerija vključuje do <strong>20 fotografij</strong> in je aktivna <strong>30 dni</strong>. Gostje se ne rabijo registrirati. Če potrebujete več, lahko paket kadarkoli nadgradite.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:28px 32px 0;">
          <h2 style="margin:0 0 18px;font-size:18px;font-weight:800;color:#111827;">Kako začeti</h2>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr><td style="padding:0 0 16px;">
              <strong style="display:block;font-size:14px;color:#111827;">1. Ustvarite galerijo</strong>
              <span style="display:block;margin-top:4px;font-size:14px;line-height:1.6;color:#6B7280;">Izberete vrsto dogodka, vnesete ime in datum — končano.</span>
            </td></tr>
            <tr><td style="padding:0 0 16px;">
              <strong style="display:block;font-size:14px;color:#111827;">2. Prenesite svojo QR kodo</strong>
              <span style="display:block;margin-top:4px;font-size:14px;line-height:1.6;color:#6B7280;">QR kodo lahko natisnete na kartice za mize, stojala ali jo prikažete na zaslonu.</span>
            </td></tr>
            <tr><td>
              <strong style="display:block;font-size:14px;color:#111827;">3. Gostje delijo fotografije in videe</strong>
              <span style="display:block;margin-top:4px;font-size:14px;line-height:1.6;color:#6B7280;">Skenirajo QR kodo s telefonom in vse slike se zbirajo na enem mestu.</span>
            </td></tr>
          </table>
        </td></tr>

        <tr><td align="center" style="padding:30px 32px 0;">
          <a href="${createUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:15px 28px;border-radius:11px;">Ustvari brezplačno galerijo →</a>
        </td></tr>

        <tr><td style="padding:28px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F7F8FA;border-radius:14px;border:1px solid #E5E7EB;">
            <tr><td style="padding:20px 22px;">
              <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#111827;">💎 Želite pred nakupom preizkusiti Plus ali Premium?</p>
              <p style="margin:0;font-size:14px;line-height:1.65;color:#5B6472;">
                Pišite nam. Če želite preveriti napredne funkcije na svojem dogodku, vam lahko pred nakupom omogočimo brezplačen testni dostop.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:28px 32px 32px;">
          <h2 style="margin:0 0 14px;font-size:18px;font-weight:800;color:#111827;">Potrebujete pomoč?</h2>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#5B6472;">Pišite ali pokličite — običajno odgovorimo v nekaj urah, najpozneje v 24 urah.</p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px;line-height:1.9;color:#111827;">
            <tr><td style="font-weight:700;width:110px;">✉️ Email</td><td><a href="mailto:info@guestcam.si" style="color:#A66A00;text-decoration:none;font-weight:700;">info@guestcam.si</a></td></tr>
            <tr><td style="font-weight:700;">💬 WhatsApp</td><td><a href="${whatsappUrl}" style="color:#A66A00;text-decoration:none;font-weight:700;">+386 41 580 250</a></td></tr>
            <tr><td style="font-weight:700;">☎️ Telefon</td><td><a href="tel:+38671604980" style="color:#A66A00;text-decoration:none;font-weight:700;">+386 71 604 980</a></td></tr>
          </table>
          <p style="margin:18px 0 0;font-size:13px;color:#6B7280;">Vse možnosti podpore najdete tudi na <a href="${contactUrl}" style="color:#A66A00;text-decoration:none;font-weight:700;">Guestcam kontaktni strani</a>.</p>
        </td></tr>

        <tr><td style="background:#F8FAFC;padding:18px 32px;text-align:center;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:11px;line-height:1.6;color:#94A3B8;">Guestcam · Sport group d.o.o. · Maribor, Slovenija</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendRegistrationWelcomeEmail({
  to,
  firstName,
}: {
  to: string;
  firstName?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping registration welcome email");
    return;
  }

  await new Resend(apiKey).emails.send({
    from: `Guestcam <${FROM}>`,
    to,
    subject: "🎉 Dobrodošli v Guestcam — začnite brezplačno",
    html: registrationWelcomeEmailHtml({ firstName }),
  });
}
