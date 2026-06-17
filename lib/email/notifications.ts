import { Resend } from "resend";

const FROM = process.env.RESEND_FROM ?? "noreply@guestcam.si";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://guestcam.si";

/** Escape user-supplied values before interpolating them into email HTML. */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c
  ));
}

// ─── Welcome email — sent after the owner creates their first album ──────────

interface WelcomeEmailFields {
  ownerName?: string;
  coupleName: string;
  weddingDate: string;
  albumSlug: string;
}

/**
 * Build the welcome-email HTML. Exported so a dev preview route can render it
 * without going through Resend.
 */
export function welcomeEmailHtml({ ownerName, coupleName, weddingDate, albumSlug }: WelcomeEmailFields): string {
  const albumUrl     = `${APP_URL}/${albumSlug}`;
  const dashboardUrl = `${APP_URL}/dashboard/${albumSlug}`;
  const upgradeUrl   = `${APP_URL}/dashboard/${albumSlug}/upgrade`;
  const greeting     = ownerName ? ` <strong>${escapeHtml(ownerName)}</strong>` : "";

  return `<!DOCTYPE html>
<html lang="sl">
<head><meta charset="utf-8" /><title>Dobrodošli v Guestcam</title></head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0F1729;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,41,0.06);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#FFC94D 0%,#FFD966 100%);padding:36px 36px 28px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;font-weight:700;color:#0F1729;">GUESTCAM</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;color:#0F1729;font-weight:800;">🎉 Dobrodošli! Vaša galerija je pripravljena</h1>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:32px 36px 8px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#0F1729;">Pozdravljeni${greeting},</p>
          <p style="margin:0;font-size:15px;line-height:1.65;color:#475569;">
            Hvala, ker ste izbrali Guestcam. Vaša prva galerija je ustvarjena
            in pripravljena, da skupaj zberete vse fotografije in videe vašega dogodka.
          </p>
        </td></tr>

        <!-- Album info card -->
        <tr><td style="padding:24px 36px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;">
            <tr><td style="padding:20px 22px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;font-weight:700;">Vaša galerija</p>
              <p style="margin:0 0 6px;font-size:20px;font-weight:800;color:#0F1729;">${escapeHtml(coupleName)}</p>
              <p style="margin:0 0 14px;font-size:14px;color:#64748B;">${escapeHtml(weddingDate)}</p>
              <a href="${albumUrl}" style="display:inline-block;font-size:13px;color:#1E3A8A;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(30,58,138,0.3);word-break:break-all;">${escapeHtml(albumUrl)}</a>
              <p style="margin:14px 0 0;font-size:13px;color:#64748B;line-height:1.55;">
                Povezavo lahko delite z gosti — vsak, ki klikne, lahko naloži fotografije.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Primary CTAs -->
        <tr><td style="padding:24px 36px 0;text-align:center;">
          <a href="${albumUrl}" style="display:inline-block;padding:14px 26px;background:#0F1729;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;margin:0 4px 8px;">Odpri svojo galerijo →</a>
          <a href="${dashboardUrl}" style="display:inline-block;padding:14px 26px;background:#ffffff;color:#0F1729;border:1.5px solid #0F1729;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;margin:0 4px 8px;">Odpri nadzorno ploščo</a>
        </td></tr>

        <!-- Steps -->
        <tr><td style="padding:32px 36px 0;">
          <h2 style="margin:0 0 18px;font-size:18px;font-weight:800;color:#0F1729;">📋 Hitra navodila</h2>
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0F1729;">1 · Natisnite QR kartice</p>
          <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#64748B;">V nadzorni plošči odprite zavihek »QR koda« → »Odpri predloge za tisk«. Izberite med 8 dizajni in natisnite kartice.</p>
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0F1729;">2 · Gostje skenirajo</p>
          <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#64748B;">Vaši gostje skenirajo QR kodo s telefonom — brez aplikacije, brez prijave — in naložijo fotografije v polni kakovosti.</p>
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0F1729;">3 · Spremljajte v živo</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#64748B;">Nove fotografije vidite v galeriji takoj. Po dogodku jih prenesete kot ZIP ali shranite v Google Drive.</p>
        </td></tr>

        <!-- Share link -->
        <tr><td style="padding:32px 36px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E1;border:1px solid #FFE08A;border-radius:14px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0F1729;">🔗 Delite povezavo z gosti</p>
              <p style="margin:0 0 10px;font-size:13px;line-height:1.55;color:#64748B;">QR koda je glavni način, a če gost ne more skenirati, lahko delite tudi neposredno povezavo prek WhatsApp, SMS-a ali e-pošte:</p>
              <a href="${albumUrl}" style="font-size:13px;color:#1E3A8A;font-weight:600;text-decoration:none;word-break:break-all;">${escapeHtml(albumUrl)}</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Premium -->
        <tr><td style="padding:28px 36px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1729;border-radius:14px;">
            <tr><td style="padding:22px 24px;color:#ffffff;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#FFC94D;font-weight:700;">💎 PREMIUM</p>
              <p style="margin:0 0 10px;font-size:16px;font-weight:700;">Neomejene fotografije, do 100 videoposnetkov in več</p>
              <p style="margin:0 0 14px;font-size:13px;line-height:1.55;color:rgba(255,255,255,0.7);">Z nadgradnjo na Premium dobite neomejeno fotografij, do 100 videoposnetkov, live galerijo, personalizirano stran, premium predloge in prioritetno podporo.</p>
              <a href="${upgradeUrl}" style="display:inline-block;padding:11px 22px;background:#FFC94D;color:#0F1729;text-decoration:none;border-radius:10px;font-weight:700;font-size:13px;">Nadgradi paket →</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Help -->
        <tr><td style="padding:28px 36px 32px;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#64748B;"><strong>Vprašanje?</strong> Odgovorite na to e-pošto ali pišite na <a href="mailto:info@guestcam.si" style="color:#1E3A8A;text-decoration:none;font-weight:600;">info@guestcam.si</a>. Veselimo se vaših spominov!</p>
          <p style="margin:14px 0 0;font-size:13px;color:#0F1729;font-weight:700;">— Ekipa Guestcam</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F8FAFC;padding:18px 36px;text-align:center;border-top:1px solid #E2E8F0;">
          <p style="margin:0;font-size:11px;color:#94A3B8;">Guestcam · <a href="${APP_URL}" style="color:#1E3A8A;text-decoration:none;">guestcam.si</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

interface WelcomeEmailParams extends WelcomeEmailFields {
  to: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping welcome email");
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: `Guestcam <${FROM}>`,
    to: params.to,
    subject: `🎉 Dobrodošli v Guestcam — vaša galerija ${params.coupleName} je pripravljena!`,
    html: welcomeEmailHtml(params),
  });
}

interface NewPhotoNotificationParams {
  to: string;
  coupleName: string;
  uploaderName: string;
  albumSlug: string;
  photoCount: number;
}

export async function sendNewPhotoNotification({
  to,
  coupleName,
  uploaderName,
  albumSlug,
  photoCount,
}: NewPhotoNotificationParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Email not configured — skip silently rather than crashing
    console.warn("[email] RESEND_API_KEY not set — skipping notification");
    return;
  }

  const resend = new Resend(apiKey);
  const albumUrl = `${APP_URL}/${albumSlug}`;
  const dashboardUrl = `${APP_URL}/dashboard/${albumSlug}`;

  await resend.emails.send({
    from: `Guestcam <${FROM}>`,
    to,
    subject: `Nova fotografija v vašem albumu — ${coupleName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#F2F4F8,#F0E8D8);padding:32px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.2);">
            <p style="margin:0 0 8px;font-size:12px;color:#3551A8;letter-spacing:2px;text-transform:uppercase;">Poročni album</p>
            <h1 style="margin:0;font-size:28px;font-weight:300;color:#0F1729;font-family:Georgia,serif;">${escapeHtml(coupleName)}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#0F1729;line-height:1.6;">
              <strong>${escapeHtml(uploaderName)}</strong> je naložil/a novo fotografijo v vaš poročni album.
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#0F1729;opacity:0.6;">
              Album ima skupaj <strong>${photoCount}</strong> ${photoCount === 1 ? "fotografijo" : "fotografij"}.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${albumUrl}" style="display:inline-block;padding:14px 28px;background:#0F1729;color:#F2F4F8;text-decoration:none;border-radius:12px;font-size:14px;font-weight:500;margin-right:12px;">
                Poglej album
              </a>
              <a href="${dashboardUrl}" style="display:inline-block;padding:14px 28px;border:1px solid rgba(201,169,110,0.4);color:#0F1729;text-decoration:none;border-radius:12px;font-size:14px;">
                Upravljaj
              </a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(201,169,110,0.2);text-align:center;">
            <p style="margin:0;font-size:11px;color:#0F1729;opacity:0.4;">
              Guestcam · <a href="${APP_URL}" style="color:#3551A8;text-decoration:none;">guestcam.si</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

interface UploadReminderParams {
  to: string;
  coupleName: string;
  albumSlug: string;
}

export async function sendUploadReminder({
  to,
  coupleName,
  albumSlug,
}: UploadReminderParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Email not configured — skip silently rather than crashing
    console.warn("[email] RESEND_API_KEY not set — skipping reminder");
    return;
  }

  const resend = new Resend(apiKey);
  const albumUrl = `${APP_URL}/${albumSlug}`;

  await resend.emails.send({
    from: `Guestcam <${FROM}>`,
    to,
    subject: `Opomnik: naložite fotografije v album — ${coupleName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#F2F4F8,#F0E8D8);padding:32px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.2);">
            <p style="margin:0 0 8px;font-size:12px;color:#3551A8;letter-spacing:2px;text-transform:uppercase;">Poročni album</p>
            <h1 style="margin:0;font-size:28px;font-weight:300;color:#0F1729;font-family:Georgia,serif;">${escapeHtml(coupleName)}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#0F1729;line-height:1.6;">
              Ste posneli kakšno lepo fotografijo? Ne pozabite je naložiti v album!
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#0F1729;opacity:0.6;">
              Vaše fotografije so dragocen spomin za <strong>${escapeHtml(coupleName)}</strong>. Naložite jih, da jih bodo lahko videli vsi gostje.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${albumUrl}" style="display:inline-block;padding:14px 28px;background:#0F1729;color:#F2F4F8;text-decoration:none;border-radius:12px;font-size:14px;font-weight:500;">
                Naloži fotografije
              </a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(201,169,110,0.2);text-align:center;">
            <p style="margin:0;font-size:11px;color:#0F1729;opacity:0.4;">
              Guestcam · <a href="${APP_URL}" style="color:#C9820A;text-decoration:none;">guestcam.si</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ─── Bank order confirmation — sent when owner chooses "pay by invoice" ───────

interface BillingDetails {
  name: string;
  address: string;
  city: string;
  taxId?: string;
}

interface BankOrderConfirmationParams {
  to: string;
  coupleName: string;
  planName: string;
  planPrice: number;
  albumSlug: string;
  billing?: BillingDetails;
}

export async function sendBankOrderConfirmation({
  to,
  coupleName,
  planName,
  planPrice,
  albumSlug,
  billing,
}: BankOrderConfirmationParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping bank order email");
    return;
  }
  const resend = new Resend(apiKey);
  const dashboardUrl = `${APP_URL}/dashboard/${albumSlug}`;
  const safe = { coupleName: escapeHtml(coupleName), planName: escapeHtml(planName) };
  const billingHtml = billing ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;margin-bottom:28px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:2px;color:#64748B;text-transform:uppercase;">Podatki za predračun</p>
              <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0F1729;">${escapeHtml(billing.name)}</p>
              <p style="margin:0 0 2px;font-size:13px;color:#475569;">${escapeHtml(billing.address)}</p>
              <p style="margin:0 0 2px;font-size:13px;color:#475569;">${escapeHtml(billing.city)}</p>
              ${billing.taxId ? `<p style="margin:6px 0 0;font-size:12px;color:#94A3B8;">Davčna: ${escapeHtml(billing.taxId)}</p>` : ""}
            </td></tr>
          </table>` : "";

  await resend.emails.send({
    from: `Guestcam <${FROM}>`,
    to,
    subject: `✅ Naročilo prejeto — ${safe.coupleName} (${safe.planName})`,
    html: `<!DOCTYPE html>
<html lang="sl">
<head><meta charset="utf-8" /><title>Naročilo prejeto</title></head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0F1729;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,41,0.06);">
        <tr><td style="background:linear-gradient(135deg,#FFC94D 0%,#FFD966 100%);padding:36px 36px 28px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;font-weight:700;color:#0F1729;">GUESTCAM</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;color:#0F1729;font-weight:800;">Vase narocilo je prejeto!</h1>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#0F1729;">
            Hvala za vase narocilo za album <strong>${safe.coupleName}</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#475569;">
            Prejeli smo vaso zahtevo za placilo po predracunu. V kratkem vam bomo poslali predracun na ta e-postni naslov. Po prejemu placila bo vas paket takoj aktiviran.
          </p>
          ${billingHtml}
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF9EC;border-radius:12px;border:1px solid #FFC94D;margin-bottom:28px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;color:#C9820A;text-transform:uppercase;">Povzetek narocila</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="font-size:14px;color:#475569;padding:4px 0;">Paket</td>
                  <td align="right" style="font-size:14px;font-weight:700;color:#0F1729;padding:4px 0;">Guestcam ${safe.planName}</td>
                </tr>
                <tr><td colspan="2" style="padding:6px 0;"><hr style="border:none;border-top:1px solid rgba(255,201,77,0.3);margin:0;" /></td></tr>
                <tr>
                  <td style="font-size:14px;font-weight:700;color:#0F1729;padding:4px 0;">Skupaj za placilo</td>
                  <td align="right" style="font-size:18px;font-weight:800;color:#0F1729;padding:4px 0;">${planPrice}&euro;</td>
                </tr>
              </table>
            </td></tr>
          </table>
          <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#0F1729;">Kaj sledi?</p>
          <ol style="margin:0 0 28px;padding-left:20px;font-size:14px;line-height:1.9;color:#475569;">
            <li>V naslednjih 24 urah prejmete predracun za placilo.</li>
            <li>Poravnajte znesek na nas bancni racun (podatki so v predracunu).</li>
            <li>Po potrditvi placila bo vas paket <strong>${safe.planName}</strong> takoj aktiviran.</li>
          </ol>
          <a href="${dashboardUrl}" style="display:inline-block;background:#FFC94D;color:#0F1729;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
            Odpri nadzorno plosco &rarr;
          </a>
        </td></tr>
        <tr><td style="padding:0 36px 28px;">
          <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
            Vprasanja? Pisite nam na
            <a href="mailto:hello@guestcam.si" style="color:#C9820A;text-decoration:none;">hello@guestcam.si</a> - odgovorimo v 24 urah.
          </p>
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="margin:0;font-size:11px;color:#0F1729;opacity:0.4;">
            Guestcam &middot; <a href="${APP_URL}" style="color:#C9820A;text-decoration:none;">guestcam.si</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
