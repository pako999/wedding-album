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
            <a href="mailto:info@guestcam.si" style="color:#C9820A;text-decoration:none;">info@guestcam.si</a> - odgovorimo v 24 urah.
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

// ─── Admin internal notifications ─────────────────────────────────────────────

const ADMIN_EMAIL = "info@guestcam.si";

function adminEmailShell(subject: string, bodyRows: string): string {
  return `<!DOCTYPE html>
<html lang="sl">
<head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0F1729;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F8;padding:24px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr><td style="background:#0F1729;padding:18px 24px;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#FFC94D;font-weight:700;">GUESTCAM · ADMIN</p>
        </td></tr>
        <tr><td style="padding:24px;">
          ${bodyRows}
        </td></tr>
        <tr><td style="padding:14px 24px;border-top:1px solid #F1F5F9;text-align:center;">
          <p style="margin:0;font-size:11px;color:#94A3B8;">Guestcam · <a href="${APP_URL}" style="color:#C9820A;text-decoration:none;">guestcam.si</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendAdminEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: `Guestcam <${FROM}>`, to: ADMIN_EMAIL, subject, html });
  } catch (err) {
    console.error("[admin email] failed to send:", err);
  }
}

// ─── 1. New user registered ───────────────────────────────────────────────────

export async function sendAdminNewUserEmail(params: {
  name: string;
  email: string;
  clerkId: string;
}) {
  const { name, email, clerkId } = params;
  const html = adminEmailShell(
    `🆕 Nov uporabnik — ${name}`,
    `<h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#0F1729;">🆕 Nov uporabnik</h2>
     <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:2;color:#475569;width:100%;">
       <tr><td style="width:110px;font-weight:700;color:#0F1729;">Ime:</td><td>${escapeHtml(name)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Email:</td><td><a href="mailto:${escapeHtml(email)}" style="color:#1E3A8A;">${escapeHtml(email)}</a></td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Clerk ID:</td><td style="font-family:monospace;font-size:12px;">${escapeHtml(clerkId)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Čas:</td><td>${new Date().toLocaleString("sl-SI")}</td></tr>
     </table>`,
  );
  await sendAdminEmail(`🆕 Nov uporabnik — ${name} (${email})`, html);
}

// ─── 2. Mollie payment received ───────────────────────────────────────────────

export async function sendAdminPaymentEmail(params: {
  albumSlug: string;
  planId: string;
  amount: string;
  currency: string;
  paymentId: string;
  method: string | null;
}) {
  const { albumSlug, planId, amount, currency, paymentId, method } = params;
  const methodLabel = method ?? "neznano";
  const html = adminEmailShell(
    `💳 Plačilo — ${albumSlug} — ${planId}`,
    `<h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#0F1729;">💳 Novo plačilo</h2>
     <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:2;color:#475569;width:100%;">
       <tr><td style="width:130px;font-weight:700;color:#0F1729;">Album:</td><td style="font-family:monospace;">${escapeHtml(albumSlug)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Paket:</td><td>${escapeHtml(planId)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Znesek:</td><td style="font-weight:800;font-size:16px;color:#0F1729;">${escapeHtml(amount)} ${escapeHtml(currency)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Način plačila:</td><td>${escapeHtml(methodLabel)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Mollie ID:</td><td style="font-family:monospace;font-size:12px;">${escapeHtml(paymentId)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Čas:</td><td>${new Date().toLocaleString("sl-SI")}</td></tr>
     </table>
     <p style="margin:16px 0 0;font-size:13px;color:#64748B;">
       Preverite <a href="${APP_URL}/admin/payments" style="color:#1E3A8A;">admin/payments</a> za podrobnosti.
     </p>`,
  );
  await sendAdminEmail(`💳 Plačilo ${amount}${currency} — ${albumSlug} (${planId})`, html);
}

// ─── 3. Bank order (predračun) — all billing details for invoice ──────────────

export async function sendAdminBankOrderEmail(params: {
  albumSlug: string;
  planName: string;
  planPrice: number;
  customerEmail: string;
  billing?: {
    name?: string;
    companyName?: string;
    email?: string;
    address?: string;
    city?: string;
    taxId?: string;
  };
}) {
  const { albumSlug, planName, planPrice, customerEmail, billing } = params;
  const billingRows = billing ? `
     <tr><td colspan="2" style="padding-top:12px;font-weight:700;color:#0F1729;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Podatki za račun:</td></tr>
     ${billing.name ? `<tr><td style="width:130px;font-weight:700;color:#0F1729;">Ime / Firma:</td><td>${escapeHtml(billing.name)}${billing.companyName ? ` / ${escapeHtml(billing.companyName)}` : ""}</td></tr>` : ""}
     ${billing.email ? `<tr><td style="font-weight:700;color:#0F1729;">Email za račun:</td><td><a href="mailto:${escapeHtml(billing.email)}" style="color:#1E3A8A;">${escapeHtml(billing.email)}</a></td></tr>` : ""}
     ${billing.address ? `<tr><td style="font-weight:700;color:#0F1729;">Naslov:</td><td>${escapeHtml(billing.address)}</td></tr>` : ""}
     ${billing.city ? `<tr><td style="font-weight:700;color:#0F1729;">Kraj:</td><td>${escapeHtml(billing.city)}</td></tr>` : ""}
     ${billing.taxId ? `<tr><td style="font-weight:700;color:#0F1729;">Davčna št.:</td><td>${escapeHtml(billing.taxId)}</td></tr>` : ""}
  ` : "";

  const html = adminEmailShell(
    `🏦 Predračun — ${albumSlug} — ${planName}`,
    `<h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#0F1729;">🏦 Zahteva za predračun</h2>
     <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:2;color:#475569;width:100%;">
       <tr><td style="width:130px;font-weight:700;color:#0F1729;">Album:</td><td style="font-family:monospace;">${escapeHtml(albumSlug)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Paket:</td><td>${escapeHtml(planName)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Znesek:</td><td style="font-weight:800;font-size:16px;color:#0F1729;">${planPrice}€</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Email stranke:</td><td><a href="mailto:${escapeHtml(customerEmail)}" style="color:#1E3A8A;">${escapeHtml(customerEmail)}</a></td></tr>
       ${billingRows}
       <tr><td style="font-weight:700;color:#0F1729;">Čas:</td><td>${new Date().toLocaleString("sl-SI")}</td></tr>
     </table>
     <p style="margin:16px 0 0;font-size:13px;color:#64748B;">
       Pošljite predračun na email stranke in aktivirajte paket po plačilu prek
       <a href="${APP_URL}/admin/bank-orders" style="color:#1E3A8A;">admin/bank-orders</a>.
     </p>`,
  );
  await sendAdminEmail(`🏦 Predračun ${planPrice}€ — ${albumSlug} (${planName})`, html);
}

// ─── Affiliate emails ────────────────────────────────────────────────────────
//
// Multi-language outgoing notifications for the partner program. Strings are
// duplicated here per locale to keep the templates self-contained (the
// rendering happens server-side and we don't want to load the full
// translations.ts payload just for emails). If you add a key here, mirror
// it across all six locale objects.

type AffiliateLocale = "sl" | "hr" | "sr" | "en" | "de" | "es";

interface AffiliateStrings {
  // Promo (discount) code assigned by admin
  promoSubject: (code: string) => string;
  promoHeading: string;
  promoIntro: (name: string) => string;
  promoCodeLabel: string;
  promoDiscountLabel: string;
  promoDiscountValue: (pct: number) => string;
  promoPlansLabel: string;
  promoPlansValue: string;
  promoExampleHeading: string;
  promoExample: (code: string, pct: number) => string;
  promoShareHeading: string;
  promoShareTemplate: (code: string, pct: number) => string;
  promoNote: string;
  promoCta: string;
  // Application received (applicant)
  appReceivedSubject: string;
  appReceivedHeading: string;
  appReceivedBody: (name: string) => string;
  appReceivedFooter: string;
  // Approved / welcome
  welcomeSubject: string;
  welcomeHeading: string;
  welcomeBody: (name: string) => string;
  welcomeCodeLabel: string;
  welcomeLinkLabel: string;
  welcomeRateLabel: string;
  welcomeRateValue: (pct: number) => string;
  welcomeLockLabel: string;
  welcomeLockValue: (days: number) => string;
  welcomeMinPayoutLabel: string;
  welcomeMinPayoutValue: (eur: number) => string;
  welcomeCta: string;
  // Commission earned
  commissionSubject: (amount: string) => string;
  commissionHeading: string;
  commissionGreeting: (name: string) => string;
  commissionIntro: string;
  commissionAmountLabel: (pct: number) => string;
  commissionOrderLabel: string;
  commissionOrderValueLabel: string;
  commissionYourCutLabel: string;
  commissionLockNotice: (date: string) => string;
  commissionCta: string;
  // Approved (after lock)
  approvedSubject: (amount: string) => string;
  approvedBody: (name: string, amount: string) => string;
  approvedCta: string;
  contactFooter: string;
}

const AFF_STRINGS: Record<AffiliateLocale, AffiliateStrings> = {
  sl: {
    promoSubject: (code) => `🎁 Vaša promocijska koda ${code} je pripravljena`,
    promoHeading: "🎁 Promocijska koda za stranke",
    promoIntro: (name) => `Pozdravljeni, <strong>${escapeHtml(name)}</strong>!<br><br>Pripravili smo vašo promocijsko kodo, ki jo lahko delite na družbenih omrežjih, blogu ali kjerkoli vam ustreza. Vsak, ki uporabi to kodo, prejme popust — vi pa še vedno dobite vašo redno provizijo.`,
    promoCodeLabel: "Promocijska koda",
    promoDiscountLabel: "Popust za kupca",
    promoDiscountValue: (pct) => `${pct}% popusta na celotno naročilo`,
    promoPlansLabel: "Velja za pakete",
    promoPlansValue: "Basic, Plus, Premium (vse plačljive pakete GuestCam)",
    promoExampleHeading: "Primer popusta",
    promoExample: (code, pct) => `Kupec izbere paket Plus (49 €) in v polje »koda za popust« vnese <strong>${code}</strong>. S ${pct}% popustom plača samo ${(49 * (100 - pct) / 100).toFixed(2)} €. Vi prejmete vašo redno provizijo od te transakcije.`,
    promoShareHeading: "Predlog besedila za objavo",
    promoShareTemplate: (code, pct) => `Z mojo kodo <strong>${code}</strong> prihranite ${pct}% pri ustvarjanju vaše svadbene/dogodkovne foto galerije GuestCam. 🎉<br>👉 guestcam.si`,
    promoNote: "Koda se aktivira takoj. Lahko jo delite kadarkoli.",
    promoCta: "Odpri nadzorno ploščo →",
    appReceivedSubject: "Prijava prejeta — GuestCam partnerski program",
    appReceivedHeading: "🎉 Prijava prejeta",
    appReceivedBody: (name) => `Pozdravljeni, <strong>${escapeHtml(name)}</strong>!<br><br>Hvala za vašo prijavo v GuestCam partnerski program. Pregledali jo bomo in vam odgovorili v 2 delovnih dneh.`,
    appReceivedFooter: "Za vprašanja nam pišite na <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
    welcomeSubject: "🎉 Dobrodošli v GuestCam partnerskem programu",
    welcomeHeading: "🎉 Vaša prijava je odobrena!",
    welcomeBody: (name) => `Pozdravljeni, <strong>${escapeHtml(name)}</strong>!<br><br>Veseli nas, da ste del GuestCam partnerske skupnosti. Spodaj so vse informacije, ki jih potrebujete za začetek.`,
    welcomeCodeLabel: "Vaša partnerska koda",
    welcomeLinkLabel: "Vaša partnerska povezava",
    welcomeRateLabel: "Provizija",
    welcomeRateValue: (pct) => `${pct}% od vsakega plačanega naročila`,
    welcomeLockLabel: "Rok izplačila",
    welcomeLockValue: (days) => `${days} dni po nakupu`,
    welcomeMinPayoutLabel: "Minimalni znesek za izplačilo",
    welcomeMinPayoutValue: (eur) => `${eur} EUR`,
    welcomeCta: "Odpri nadzorno ploščo →",
    commissionSubject: (amount) => `💰 Zaslužili ste ${amount} EUR — GuestCam partnerski program`,
    commissionHeading: "💰 Nova provizija",
    commissionGreeting: (name) => `Pozdravljeni, <strong>${escapeHtml(name)}</strong>!`,
    commissionIntro: "Nekdo je kupil GuestCam prek vaše partnerske povezave. Zaslužili ste:",
    commissionAmountLabel: (pct) => `provizija (${pct}% od naročila)`,
    commissionOrderLabel: "Naročilo",
    commissionOrderValueLabel: "Vrednost naročila",
    commissionYourCutLabel: "Vaša provizija",
    commissionLockNotice: (date) => `Provizija bo potrjena <strong>${date}</strong> (14-dnevni varnostni rok za morebitna vračila).`,
    commissionCta: "Poglej nadzorno ploščo →",
    approvedSubject: (amount) => `✅ Vaša provizija ${amount} EUR je potrjena`,
    approvedBody: (name, amount) => `Pozdravljeni, <strong>${escapeHtml(name)}</strong>!<br><br>Vaša provizija v višini <strong>${amount} EUR</strong> je zdaj potrjena in na voljo za izplačilo.`,
    approvedCta: "Zahtevaj izplačilo →",
    contactFooter: "GuestCam partnerski program · <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
  },
  en: {
    promoSubject: (code) => `🎁 Your promo code ${code} is ready`,
    promoHeading: "🎁 Promo code for customers",
    promoIntro: (name) => `Hi <strong>${escapeHtml(name)}</strong>,<br><br>We've set up your promo code that you can share on social media, your blog, or anywhere else. Anyone who uses this code gets a discount — and you still earn your regular commission.`,
    promoCodeLabel: "Promo code",
    promoDiscountLabel: "Customer discount",
    promoDiscountValue: (pct) => `${pct}% off the entire order`,
    promoPlansLabel: "Works on plans",
    promoPlansValue: "Basic, Plus, Premium (all paid GuestCam plans)",
    promoExampleHeading: "Example",
    promoExample: (code, pct) => `Customer picks the Plus plan (€49) and enters <strong>${code}</strong> in the discount field. With ${pct}% off they pay only €${(49 * (100 - pct) / 100).toFixed(2)}. You still earn your regular commission on this transaction.`,
    promoShareHeading: "Suggested share text",
    promoShareTemplate: (code, pct) => `Use my code <strong>${code}</strong> to save ${pct}% on your wedding / event photo gallery with GuestCam. 🎉<br>👉 guestcam.si`,
    promoNote: "The code is active immediately. Share it whenever you want.",
    promoCta: "Open dashboard →",
    appReceivedSubject: "Application received — GuestCam Partner Program",
    appReceivedHeading: "🎉 Application received",
    appReceivedBody: (name) => `Hi <strong>${escapeHtml(name)}</strong>,<br><br>Thanks for applying to the GuestCam Partner Program. We'll review your application and get back to you within 2 business days.`,
    appReceivedFooter: "Questions? Email us at <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
    welcomeSubject: "🎉 Welcome to the GuestCam Partner Program",
    welcomeHeading: "🎉 Your application is approved!",
    welcomeBody: (name) => `Hi <strong>${escapeHtml(name)}</strong>,<br><br>We're glad to have you in the GuestCam partner community. Here's everything you need to get started.`,
    welcomeCodeLabel: "Your referral code",
    welcomeLinkLabel: "Your referral link",
    welcomeRateLabel: "Commission",
    welcomeRateValue: (pct) => `${pct}% of every paid order`,
    welcomeLockLabel: "Payout window",
    welcomeLockValue: (days) => `${days} days after purchase`,
    welcomeMinPayoutLabel: "Minimum payout",
    welcomeMinPayoutValue: (eur) => `${eur} EUR`,
    welcomeCta: "Open dashboard →",
    commissionSubject: (amount) => `💰 You earned ${amount} EUR — GuestCam Partner Program`,
    commissionHeading: "💰 New commission",
    commissionGreeting: (name) => `Hi <strong>${escapeHtml(name)}</strong>,`,
    commissionIntro: "Someone bought GuestCam through your partner link. You earned:",
    commissionAmountLabel: (pct) => `commission (${pct}% of order)`,
    commissionOrderLabel: "Order",
    commissionOrderValueLabel: "Order value",
    commissionYourCutLabel: "Your commission",
    commissionLockNotice: (date) => `Commission becomes available on <strong>${date}</strong> (14-day refund safety window).`,
    commissionCta: "Open dashboard →",
    approvedSubject: (amount) => `✅ Your ${amount} EUR commission is approved`,
    approvedBody: (name, amount) => `Hi <strong>${escapeHtml(name)}</strong>,<br><br>Your commission of <strong>${amount} EUR</strong> is now approved and ready for payout.`,
    approvedCta: "Request payout →",
    contactFooter: "GuestCam Partner Program · <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
  },
  de: {
    promoSubject: (code) => `🎁 Ihr Promo-Code ${code} ist bereit`,
    promoHeading: "🎁 Promo-Code für Kunden",
    promoIntro: (name) => `Hallo <strong>${escapeHtml(name)}</strong>,<br><br>wir haben Ihren Promo-Code eingerichtet, den Sie in sozialen Medien, in Ihrem Blog oder überall sonst teilen können. Jeder, der diesen Code verwendet, erhält einen Rabatt — und Sie verdienen weiterhin Ihre reguläre Provision.`,
    promoCodeLabel: "Promo-Code",
    promoDiscountLabel: "Kundenrabatt",
    promoDiscountValue: (pct) => `${pct}% auf die gesamte Bestellung`,
    promoPlansLabel: "Gültig für Pakete",
    promoPlansValue: "Basic, Plus, Premium (alle bezahlten GuestCam-Pakete)",
    promoExampleHeading: "Beispiel",
    promoExample: (code, pct) => `Der Kunde wählt das Plus-Paket (49 €) und gibt <strong>${code}</strong> im Rabattfeld ein. Mit ${pct}% Rabatt bezahlt er nur ${(49 * (100 - pct) / 100).toFixed(2)} €. Sie verdienen weiterhin Ihre reguläre Provision für diese Transaktion.`,
    promoShareHeading: "Vorgeschlagener Werbetext",
    promoShareTemplate: (code, pct) => `Mit meinem Code <strong>${code}</strong> sparen Sie ${pct}% bei der Erstellung Ihrer Hochzeits- / Event-Fotogalerie mit GuestCam. 🎉<br>👉 guestcam.si`,
    promoNote: "Der Code ist sofort aktiv. Teilen Sie ihn jederzeit.",
    promoCta: "Dashboard öffnen →",
    appReceivedSubject: "Bewerbung erhalten — GuestCam Partnerprogramm",
    appReceivedHeading: "🎉 Bewerbung erhalten",
    appReceivedBody: (name) => `Hallo <strong>${escapeHtml(name)}</strong>,<br><br>vielen Dank für Ihre Bewerbung beim GuestCam Partnerprogramm. Wir prüfen Ihre Bewerbung und melden uns innerhalb von 2 Werktagen.`,
    appReceivedFooter: "Fragen? Schreiben Sie uns an <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
    welcomeSubject: "🎉 Willkommen im GuestCam Partnerprogramm",
    welcomeHeading: "🎉 Ihre Bewerbung wurde genehmigt!",
    welcomeBody: (name) => `Hallo <strong>${escapeHtml(name)}</strong>,<br><br>wir freuen uns, Sie in der GuestCam Partner-Community begrüßen zu dürfen. Hier finden Sie alles, was Sie für den Start brauchen.`,
    welcomeCodeLabel: "Ihr Partner-Code",
    welcomeLinkLabel: "Ihr Partner-Link",
    welcomeRateLabel: "Provision",
    welcomeRateValue: (pct) => `${pct}% von jeder bezahlten Bestellung`,
    welcomeLockLabel: "Auszahlungsfrist",
    welcomeLockValue: (days) => `${days} Tage nach Kauf`,
    welcomeMinPayoutLabel: "Mindestbetrag für Auszahlung",
    welcomeMinPayoutValue: (eur) => `${eur} EUR`,
    welcomeCta: "Dashboard öffnen →",
    commissionSubject: (amount) => `💰 Sie haben ${amount} EUR verdient — GuestCam Partnerprogramm`,
    commissionHeading: "💰 Neue Provision",
    commissionGreeting: (name) => `Hallo <strong>${escapeHtml(name)}</strong>,`,
    commissionIntro: "Jemand hat GuestCam über Ihren Partner-Link gekauft. Sie haben verdient:",
    commissionAmountLabel: (pct) => `Provision (${pct}% der Bestellung)`,
    commissionOrderLabel: "Bestellung",
    commissionOrderValueLabel: "Bestellwert",
    commissionYourCutLabel: "Ihre Provision",
    commissionLockNotice: (date) => `Die Provision wird am <strong>${date}</strong> freigegeben (14-tägige Rückerstattungsfrist).`,
    commissionCta: "Dashboard öffnen →",
    approvedSubject: (amount) => `✅ Ihre Provision von ${amount} EUR wurde freigegeben`,
    approvedBody: (name, amount) => `Hallo <strong>${escapeHtml(name)}</strong>,<br><br>Ihre Provision in Höhe von <strong>${amount} EUR</strong> ist jetzt freigegeben und auszahlungsbereit.`,
    approvedCta: "Auszahlung anfordern →",
    contactFooter: "GuestCam Partnerprogramm · <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
  },
  hr: {
    promoSubject: (code) => `🎁 Vaš promo kod ${code} je spreman`,
    promoHeading: "🎁 Promo kod za kupce",
    promoIntro: (name) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!<br><br>Pripremili smo vaš promo kod koji možete dijeliti na društvenim mrežama, blogu ili bilo gdje drugdje. Svatko tko upotrijebi ovaj kod dobiva popust — vi i dalje dobivate svoju redovnu proviziju.`,
    promoCodeLabel: "Promo kod",
    promoDiscountLabel: "Popust za kupca",
    promoDiscountValue: (pct) => `${pct}% popusta na cijelu narudžbu`,
    promoPlansLabel: "Vrijedi za pakete",
    promoPlansValue: "Basic, Plus, Premium (svi plaćeni GuestCam paketi)",
    promoExampleHeading: "Primjer",
    promoExample: (code, pct) => `Kupac odabere paket Plus (49 €) i u polje za popust unese <strong>${code}</strong>. S ${pct}% popusta plaća samo ${(49 * (100 - pct) / 100).toFixed(2)} €. Vi i dalje dobivate svoju redovnu proviziju za tu transakciju.`,
    promoShareHeading: "Prijedlog teksta za dijeljenje",
    promoShareTemplate: (code, pct) => `S mojim kodom <strong>${code}</strong> uštedite ${pct}% pri izradi vaše vjenčane / event foto galerije s GuestCam. 🎉<br>👉 guestcam.si`,
    promoNote: "Kod je odmah aktivan. Možete ga dijeliti bilo kada.",
    promoCta: "Otvori nadzornu ploču →",
    appReceivedSubject: "Prijava primljena — GuestCam partnerski program",
    appReceivedHeading: "🎉 Prijava primljena",
    appReceivedBody: (name) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!<br><br>Hvala na prijavi u GuestCam partnerski program. Pregledat ćemo vašu prijavu i javiti vam se u roku od 2 radna dana.`,
    appReceivedFooter: "Pitanja? Pišite nam na <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
    welcomeSubject: "🎉 Dobrodošli u GuestCam partnerski program",
    welcomeHeading: "🎉 Vaša prijava je odobrena!",
    welcomeBody: (name) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!<br><br>Drago nam je što ste dio GuestCam partnerske zajednice. U nastavku su sve informacije za početak.`,
    welcomeCodeLabel: "Vaš partnerski kod",
    welcomeLinkLabel: "Vaša partnerska poveznica",
    welcomeRateLabel: "Provizija",
    welcomeRateValue: (pct) => `${pct}% od svake plaćene narudžbe`,
    welcomeLockLabel: "Rok isplate",
    welcomeLockValue: (days) => `${days} dana nakon kupnje`,
    welcomeMinPayoutLabel: "Minimalni iznos za isplatu",
    welcomeMinPayoutValue: (eur) => `${eur} EUR`,
    welcomeCta: "Otvori nadzornu ploču →",
    commissionSubject: (amount) => `💰 Zaradili ste ${amount} EUR — GuestCam partnerski program`,
    commissionHeading: "💰 Nova provizija",
    commissionGreeting: (name) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!`,
    commissionIntro: "Netko je kupio GuestCam preko vaše partnerske poveznice. Zaradili ste:",
    commissionAmountLabel: (pct) => `provizija (${pct}% od narudžbe)`,
    commissionOrderLabel: "Narudžba",
    commissionOrderValueLabel: "Vrijednost narudžbe",
    commissionYourCutLabel: "Vaša provizija",
    commissionLockNotice: (date) => `Provizija će biti potvrđena <strong>${date}</strong> (14-dnevni rok za moguće povrate).`,
    commissionCta: "Otvori nadzornu ploču →",
    approvedSubject: (amount) => `✅ Vaša provizija od ${amount} EUR je odobrena`,
    approvedBody: (name, amount) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!<br><br>Vaša provizija u iznosu od <strong>${amount} EUR</strong> sada je odobrena i spremna za isplatu.`,
    approvedCta: "Zatraži isplatu →",
    contactFooter: "GuestCam partnerski program · <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
  },
  sr: {
    promoSubject: (code) => `🎁 Vaš promo kod ${code} je spreman`,
    promoHeading: "🎁 Promo kod za kupce",
    promoIntro: (name) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!<br><br>Pripremili smo vaš promo kod koji možete deliti na društvenim mrežama, blogu ili bilo gde drugde. Svako ko upotrebi ovaj kod dobija popust — vi i dalje dobijate svoju redovnu proviziju.`,
    promoCodeLabel: "Promo kod",
    promoDiscountLabel: "Popust za kupca",
    promoDiscountValue: (pct) => `${pct}% popusta na celu porudžbinu`,
    promoPlansLabel: "Važi za pakete",
    promoPlansValue: "Basic, Plus, Premium (svi plaćeni GuestCam paketi)",
    promoExampleHeading: "Primer",
    promoExample: (code, pct) => `Kupac odabere paket Plus (49 €) i u polje za popust unese <strong>${code}</strong>. Sa ${pct}% popusta plaća samo ${(49 * (100 - pct) / 100).toFixed(2)} €. Vi i dalje dobijate svoju redovnu proviziju za tu transakciju.`,
    promoShareHeading: "Predlog teksta za deljenje",
    promoShareTemplate: (code, pct) => `Sa mojim kodom <strong>${code}</strong> uštedite ${pct}% pri kreiranju vaše svadbene / event foto galerije sa GuestCam. 🎉<br>👉 guestcam.si`,
    promoNote: "Kod je odmah aktivan. Možete ga deliti bilo kada.",
    promoCta: "Otvori kontrolnu tablu →",
    appReceivedSubject: "Prijava primljena — GuestCam partnerski program",
    appReceivedHeading: "🎉 Prijava primljena",
    appReceivedBody: (name) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!<br><br>Hvala na prijavi za GuestCam partnerski program. Pregledaćemo vašu prijavu i javićemo vam se u roku od 2 radna dana.`,
    appReceivedFooter: "Pitanja? Pišite nam na <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
    welcomeSubject: "🎉 Dobrodošli u GuestCam partnerski program",
    welcomeHeading: "🎉 Vaša prijava je odobrena!",
    welcomeBody: (name) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!<br><br>Drago nam je što ste deo GuestCam partnerske zajednice. U nastavku su sve informacije za početak.`,
    welcomeCodeLabel: "Vaš partnerski kod",
    welcomeLinkLabel: "Vaš partnerski link",
    welcomeRateLabel: "Provizija",
    welcomeRateValue: (pct) => `${pct}% od svake plaćene porudžbine`,
    welcomeLockLabel: "Rok isplate",
    welcomeLockValue: (days) => `${days} dana posle kupovine`,
    welcomeMinPayoutLabel: "Minimalni iznos za isplatu",
    welcomeMinPayoutValue: (eur) => `${eur} EUR`,
    welcomeCta: "Otvori kontrolnu tablu →",
    commissionSubject: (amount) => `💰 Zaradili ste ${amount} EUR — GuestCam partnerski program`,
    commissionHeading: "💰 Nova provizija",
    commissionGreeting: (name) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!`,
    commissionIntro: "Neko je kupio GuestCam preko vašeg partnerskog linka. Zaradili ste:",
    commissionAmountLabel: (pct) => `provizija (${pct}% od porudžbine)`,
    commissionOrderLabel: "Porudžbina",
    commissionOrderValueLabel: "Vrednost porudžbine",
    commissionYourCutLabel: "Vaša provizija",
    commissionLockNotice: (date) => `Provizija će biti odobrena <strong>${date}</strong> (14-dnevni rok za eventualne povraćaje).`,
    commissionCta: "Otvori kontrolnu tablu →",
    approvedSubject: (amount) => `✅ Vaša provizija od ${amount} EUR je odobrena`,
    approvedBody: (name, amount) => `Pozdrav, <strong>${escapeHtml(name)}</strong>!<br><br>Vaša provizija u iznosu od <strong>${amount} EUR</strong> sada je odobrena i dostupna za isplatu.`,
    approvedCta: "Zatraži isplatu →",
    contactFooter: "GuestCam partnerski program · <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
  },
  es: {
    promoSubject: (code) => `🎁 Tu código promocional ${code} está listo`,
    promoHeading: "🎁 Código promocional para clientes",
    promoIntro: (name) => `Hola <strong>${escapeHtml(name)}</strong>,<br><br>Hemos configurado tu código promocional que puedes compartir en redes sociales, tu blog o donde prefieras. Quien use este código obtiene un descuento — y tú sigues ganando tu comisión habitual.`,
    promoCodeLabel: "Código promocional",
    promoDiscountLabel: "Descuento para el cliente",
    promoDiscountValue: (pct) => `${pct}% de descuento en todo el pedido`,
    promoPlansLabel: "Válido para los planes",
    promoPlansValue: "Basic, Plus, Premium (todos los planes pagos de GuestCam)",
    promoExampleHeading: "Ejemplo",
    promoExample: (code, pct) => `El cliente elige el plan Plus (49 €) e introduce <strong>${code}</strong> en el campo de descuento. Con ${pct}% de descuento paga solo ${(49 * (100 - pct) / 100).toFixed(2)} €. Tú sigues ganando tu comisión habitual en esa transacción.`,
    promoShareHeading: "Texto sugerido para compartir",
    promoShareTemplate: (code, pct) => `Con mi código <strong>${code}</strong> ahorras ${pct}% al crear tu galería de fotos de boda / evento con GuestCam. 🎉<br>👉 guestcam.si`,
    promoNote: "El código está activo de inmediato. Compártelo cuando quieras.",
    promoCta: "Abrir panel →",
    appReceivedSubject: "Solicitud recibida — Programa de afiliados GuestCam",
    appReceivedHeading: "🎉 Solicitud recibida",
    appReceivedBody: (name) => `Hola <strong>${escapeHtml(name)}</strong>,<br><br>Gracias por solicitar entrar al programa de afiliados de GuestCam. Revisaremos tu solicitud y te responderemos en un plazo de 2 días hábiles.`,
    appReceivedFooter: "¿Preguntas? Escríbenos a <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
    welcomeSubject: "🎉 Bienvenido al programa de afiliados de GuestCam",
    welcomeHeading: "🎉 ¡Tu solicitud ha sido aprobada!",
    welcomeBody: (name) => `Hola <strong>${escapeHtml(name)}</strong>,<br><br>Nos alegra que formes parte de la comunidad de afiliados de GuestCam. Aquí tienes todo lo que necesitas para empezar.`,
    welcomeCodeLabel: "Tu código de afiliado",
    welcomeLinkLabel: "Tu enlace de afiliado",
    welcomeRateLabel: "Comisión",
    welcomeRateValue: (pct) => `${pct}% de cada pedido pagado`,
    welcomeLockLabel: "Plazo de pago",
    welcomeLockValue: (days) => `${days} días después de la compra`,
    welcomeMinPayoutLabel: "Importe mínimo para pago",
    welcomeMinPayoutValue: (eur) => `${eur} EUR`,
    welcomeCta: "Abrir panel →",
    commissionSubject: (amount) => `💰 Has ganado ${amount} EUR — Programa de afiliados GuestCam`,
    commissionHeading: "💰 Nueva comisión",
    commissionGreeting: (name) => `Hola <strong>${escapeHtml(name)}</strong>,`,
    commissionIntro: "Alguien ha comprado GuestCam a través de tu enlace de afiliado. Has ganado:",
    commissionAmountLabel: (pct) => `comisión (${pct}% del pedido)`,
    commissionOrderLabel: "Pedido",
    commissionOrderValueLabel: "Valor del pedido",
    commissionYourCutLabel: "Tu comisión",
    commissionLockNotice: (date) => `La comisión se aprobará el <strong>${date}</strong> (período de seguridad de 14 días por posibles reembolsos).`,
    commissionCta: "Abrir panel →",
    approvedSubject: (amount) => `✅ Tu comisión de ${amount} EUR ha sido aprobada`,
    approvedBody: (name, amount) => `Hola <strong>${escapeHtml(name)}</strong>,<br><br>Tu comisión de <strong>${amount} EUR</strong> ya está aprobada y disponible para pago.`,
    approvedCta: "Solicitar pago →",
    contactFooter: "Programa de afiliados GuestCam · <a href=\"mailto:partnerji@guestcam.si\" style=\"color:#1E3A8A;\">partnerji@guestcam.si</a>",
  },
};

function affiliateShell(heading: string, body: string, footer: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>${heading}</title></head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0F1729;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F8;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,41,0.06);">
        <tr><td style="background:#0F1729;padding:28px 32px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;font-weight:700;color:#FFC94D;">GUESTCAM · PARTNERJI</p>
          <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:800;">${heading}</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;font-size:14.5px;line-height:1.65;color:#475569;">
          ${body}
        </td></tr>
      </table>
      <p style="margin:14px 0 0;font-size:12px;color:#94A3B8;line-height:1.6;">${footer}</p>
    </td></tr>
  </table>
</body></html>`;
}

function pickLocale(locale: string | undefined): AffiliateLocale {
  return locale && locale in AFF_STRINGS ? (locale as AffiliateLocale) : "sl";
}

function fmtMoney(cents: number): string {
  return (cents / 100).toFixed(2);
}

function fmtDate(d: Date, locale: AffiliateLocale): string {
  const localeTag = locale === "sl" ? "sl-SI" : locale === "hr" ? "hr-HR" : locale === "sr" ? "sr-Latn" : locale === "de" ? "de-DE" : locale === "es" ? "es-ES" : "en-GB";
  return d.toLocaleDateString(localeTag, { day: "numeric", month: "long", year: "numeric" });
}

/** Confirmation email when an affiliate submits the application form. */
export async function sendAffiliateApplicationReceivedEmail({
  to, name, locale,
}: { to: string; name: string; locale: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const t = AFF_STRINGS[pickLocale(locale)];
  const html = affiliateShell(
    t.appReceivedHeading,
    t.appReceivedBody(name),
    t.appReceivedFooter,
  );
  try {
    await new Resend(apiKey).emails.send({
      from: `GuestCam Partnerji <${FROM}>`,
      to,
      subject: t.appReceivedSubject,
      html,
    });
  } catch (err) {
    console.error("[affiliate apply email] send failed:", err);
  }
}

/** Admin notification when a new affiliate application lands. */
export async function sendAdminAffiliateApplicationEmail(params: {
  affiliateId: string;
  name: string;
  email: string;
  website?: string | null;
  promotionPlan: string;
}) {
  const html = adminEmailShell(
    `🤝 Nova partnerska prijava — ${params.name}`,
    `<h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#0F1729;">🤝 Nova partnerska prijava</h2>
     <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.9;color:#475569;width:100%;">
       <tr><td style="width:130px;font-weight:700;color:#0F1729;">Ime:</td><td>${escapeHtml(params.name)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Email:</td><td><a href="mailto:${escapeHtml(params.email)}" style="color:#1E3A8A;">${escapeHtml(params.email)}</a></td></tr>
       ${params.website ? `<tr><td style="font-weight:700;color:#0F1729;">Spletna stran:</td><td><a href="${escapeHtml(params.website)}" style="color:#1E3A8A;">${escapeHtml(params.website)}</a></td></tr>` : ""}
       <tr><td style="vertical-align:top;font-weight:700;color:#0F1729;">Načrt promocije:</td><td>${escapeHtml(params.promotionPlan).replace(/\n/g, "<br>")}</td></tr>
     </table>
     <p style="margin:16px 0 0;">
       <a href="${APP_URL}/admin/affiliates/${params.affiliateId}" style="display:inline-block;padding:11px 22px;background:#0F1729;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">Pregled v admin panelu →</a>
     </p>`,
  );
  await sendAdminEmail(`🤝 Nova partnerska prijava — ${params.name} (${params.email})`, html);
}

/** Sent when an admin approves an affiliate application. */
export async function sendAffiliateWelcomeEmail({
  to, name, locale, referralCode, commissionRate, lockDays, minPayoutEur,
}: {
  to: string;
  name: string;
  locale: string;
  referralCode: string;
  commissionRate: number;
  lockDays: number;
  minPayoutEur: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const t = AFF_STRINGS[pickLocale(locale)];
  // Route through the tracker endpoint so clicks are properly logged.
  const refLink = `${APP_URL}/api/affiliate/track?ref=${referralCode}&to=/`;
  const dashboardUrl = `${APP_URL}/affiliate/dashboard`;
  const body = `
    ${t.welcomeBody(name)}
    <div style="margin:22px 0 8px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:18px 20px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;font-weight:700;">${t.welcomeCodeLabel}</p>
      <p style="margin:0;font-family:monospace;font-size:22px;font-weight:800;color:#0F1729;letter-spacing:2px;">${escapeHtml(referralCode)}</p>
      <p style="margin:14px 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;font-weight:700;">${t.welcomeLinkLabel}</p>
      <a href="${refLink}" style="font-size:13px;color:#1E3A8A;font-weight:600;word-break:break-all;">${refLink}</a>
    </div>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.9;color:#475569;width:100%;margin-top:14px;">
      <tr><td style="font-weight:700;color:#0F1729;">${t.welcomeRateLabel}:</td><td>${t.welcomeRateValue(commissionRate)}</td></tr>
      <tr><td style="font-weight:700;color:#0F1729;">${t.welcomeLockLabel}:</td><td>${t.welcomeLockValue(lockDays)}</td></tr>
      <tr><td style="font-weight:700;color:#0F1729;">${t.welcomeMinPayoutLabel}:</td><td>${t.welcomeMinPayoutValue(minPayoutEur)}</td></tr>
    </table>
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${dashboardUrl}" style="display:inline-block;padding:14px 28px;background:#FFC94D;color:#0F1729;text-decoration:none;border-radius:10px;font-weight:800;font-size:14px;">${t.welcomeCta}</a>
    </p>
  `;
  try {
    await new Resend(apiKey).emails.send({
      from: `GuestCam Partnerji <${FROM}>`,
      to,
      subject: t.welcomeSubject,
      html: affiliateShell(t.welcomeHeading, body, t.contactFooter),
    });
  } catch (err) {
    console.error("[affiliate welcome email] send failed:", err);
  }
}

/** Sent immediately after a commission is created (pending status). */
export async function sendAffiliateCommissionEmail({
  to, name, locale, commissionAmountCents, orderAmountCents, commissionRate,
  orderDescription, lockUntil,
}: {
  to: string;
  name: string;
  locale: string;
  commissionAmountCents: number;
  orderAmountCents: number;
  commissionRate: number;
  orderDescription: string;
  lockUntil: Date;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const t = AFF_STRINGS[pickLocale(locale)];
  const localeKey = pickLocale(locale);
  const commissionStr = fmtMoney(commissionAmountCents);
  const orderStr = fmtMoney(orderAmountCents);
  const lockStr = fmtDate(lockUntil, localeKey);
  const dashboardUrl = `${APP_URL}/affiliate/dashboard`;
  const body = `
    <p style="margin:0 0 12px;">${t.commissionGreeting(name)}</p>
    <p style="margin:0;">${t.commissionIntro}</p>
    <div style="margin:22px 0;background:#F0FDF4;border-radius:10px;padding:24px;text-align:center;">
      <p style="margin:0;color:#15803D;font-size:38px;font-weight:800;line-height:1;">${commissionStr} EUR</p>
      <p style="margin:6px 0 0;color:#475569;font-size:12px;">${t.commissionAmountLabel(commissionRate)}</p>
    </div>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.9;color:#475569;width:100%;">
      <tr><td style="font-weight:700;color:#0F1729;">${t.commissionOrderLabel}:</td><td style="text-align:right;">${escapeHtml(orderDescription)}</td></tr>
      <tr><td style="font-weight:700;color:#0F1729;">${t.commissionOrderValueLabel}:</td><td style="text-align:right;">${orderStr} EUR</td></tr>
      <tr><td style="font-weight:700;color:#0F1729;">${t.commissionYourCutLabel}:</td><td style="text-align:right;color:#15803D;font-weight:800;">${commissionStr} EUR</td></tr>
    </table>
    <p style="margin:18px 0 0;font-size:13px;color:#64748B;">⏳ ${t.commissionLockNotice(lockStr)}</p>
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${dashboardUrl}" style="display:inline-block;padding:14px 28px;background:#0F1729;color:#fff;text-decoration:none;border-radius:10px;font-weight:800;font-size:14px;">${t.commissionCta}</a>
    </p>
  `;
  try {
    await new Resend(apiKey).emails.send({
      from: `GuestCam Partnerji <${FROM}>`,
      to,
      subject: t.commissionSubject(commissionStr),
      html: affiliateShell(t.commissionHeading, body, t.contactFooter),
    });
  } catch (err) {
    console.error("[affiliate commission email] send failed:", err);
  }
}

/**
 * Sent to the affiliate when the admin assigns or updates their personal
 * promo (discount) code. Includes the code, customer discount percentage,
 * an example purchase, and a pre-written share message.
 */
export async function sendAffiliatePromoCodeEmail({
  to, name, locale, code, percentOff,
}: {
  to: string;
  name: string;
  locale: string;
  code: string;
  percentOff: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const t = AFF_STRINGS[pickLocale(locale)];
  const dashboardUrl = `${APP_URL}/affiliate/dashboard`;
  const body = `
    <p style="margin:0 0 12px;">${t.promoIntro(name)}</p>
    <div style="margin:22px 0 8px;background:#FFF9EC;border:1px solid #FFC94D;border-radius:12px;padding:20px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;font-weight:700;">${t.promoCodeLabel}</p>
      <p style="margin:0;font-family:monospace;font-size:28px;font-weight:800;color:#0F1729;letter-spacing:3px;">${escapeHtml(code)}</p>
      <p style="margin:14px 0 0;font-size:13px;color:#0F1729;font-weight:700;">${t.promoDiscountValue(percentOff)}</p>
    </div>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.9;color:#475569;width:100%;">
      <tr><td style="font-weight:700;color:#0F1729;width:160px;">${t.promoDiscountLabel}:</td><td>${t.promoDiscountValue(percentOff)}</td></tr>
      <tr><td style="font-weight:700;color:#0F1729;">${t.promoPlansLabel}:</td><td>${t.promoPlansValue}</td></tr>
    </table>
    <div style="margin:22px 0 0;padding:18px 20px;background:#F8FAFC;border-radius:10px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#0F1729;text-transform:uppercase;letter-spacing:1px;">${t.promoExampleHeading}</p>
      <p style="margin:0;font-size:13.5px;color:#475569;line-height:1.6;">${t.promoExample(code, percentOff)}</p>
    </div>
    <div style="margin:14px 0 0;padding:18px 20px;background:#F0FDF4;border-radius:10px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#15803D;text-transform:uppercase;letter-spacing:1px;">${t.promoShareHeading}</p>
      <p style="margin:0;font-size:13.5px;color:#15803D;line-height:1.6;">${t.promoShareTemplate(code, percentOff)}</p>
    </div>
    <p style="margin:18px 0 0;font-size:12px;color:#94A3B8;text-align:center;">${t.promoNote}</p>
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${dashboardUrl}" style="display:inline-block;padding:14px 28px;background:#FFC94D;color:#0F1729;text-decoration:none;border-radius:10px;font-weight:800;font-size:14px;">${t.promoCta}</a>
    </p>
  `;
  try {
    await new Resend(apiKey).emails.send({
      from: `GuestCam Partnerji <${FROM}>`,
      to,
      subject: t.promoSubject(code),
      html: affiliateShell(t.promoHeading, body, t.contactFooter),
    });
  } catch (err) {
    console.error("[affiliate promo email] send failed:", err);
  }
}

/**
 * Admin notification fired whenever an affiliate makes a sale.
 * Sent in parallel with the regular admin payment email so the ops team
 * sees who drove the order and how much commission we owe.
 */
export async function sendAdminAffiliateSaleEmail(params: {
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  referralCode: string;
  orderAmountCents: number;
  commissionAmountCents: number;
  commissionRate: number;
  albumSlug: string;
  planName: string;
  promoCode?: string | null;
}) {
  const eur = (c: number) => `${(c / 100).toFixed(2)} €`;
  const html = adminEmailShell(
    `🤝 Partner prodaja — ${params.affiliateName} (+${eur(params.commissionAmountCents)})`,
    `<h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#0F1729;">🤝 Partnerska prodaja</h2>
     <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:2;color:#475569;width:100%;">
       <tr><td style="width:160px;font-weight:700;color:#0F1729;">Partner:</td><td>${escapeHtml(params.affiliateName)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Email:</td><td><a href="mailto:${escapeHtml(params.affiliateEmail)}" style="color:#1E3A8A;">${escapeHtml(params.affiliateEmail)}</a></td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Partnerska koda:</td><td style="font-family:monospace;">${escapeHtml(params.referralCode)}</td></tr>
       ${params.promoCode ? `<tr><td style="font-weight:700;color:#0F1729;">Promo koda uporabljena:</td><td style="font-family:monospace;color:#15803D;font-weight:700;">${escapeHtml(params.promoCode)}</td></tr>` : ""}
       <tr><td style="font-weight:700;color:#0F1729;">Album:</td><td style="font-family:monospace;">${escapeHtml(params.albumSlug)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Paket:</td><td>${escapeHtml(params.planName)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Vrednost naročila:</td><td style="font-weight:700;color:#0F1729;">${eur(params.orderAmountCents)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Provizija (${params.commissionRate}%):</td><td style="font-weight:800;color:#15803D;font-size:16px;">+${eur(params.commissionAmountCents)}</td></tr>
       <tr><td style="font-weight:700;color:#0F1729;">Čas:</td><td>${new Date().toLocaleString("sl-SI")}</td></tr>
     </table>
     <p style="margin:16px 0 0;">
       <a href="${APP_URL}/admin/affiliates/${params.affiliateId}" style="display:inline-block;padding:11px 22px;background:#0F1729;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">Pregled partnerja →</a>
     </p>
     <p style="margin:14px 0 0;font-size:12px;color:#94A3B8;">Provizija je v 14-dnevnem zaklepu in se po izteku samodejno potrdi.</p>`,
  );
  await sendAdminEmail(
    `🤝 Partner ${params.affiliateName} +${eur(params.commissionAmountCents)} (${params.planName})`,
    html,
  );
}

/** Sent when a commission transitions from pending → approved (after lock period). */
export async function sendAffiliateCommissionApprovedEmail({
  to, name, locale, amountCents,
}: { to: string; name: string; locale: string; amountCents: number }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const t = AFF_STRINGS[pickLocale(locale)];
  const amountStr = fmtMoney(amountCents);
  const payoutUrl = `${APP_URL}/affiliate/dashboard`;
  const body = `
    ${t.approvedBody(name, amountStr)}
    <p style="margin:24px 0 0;text-align:center;">
      <a href="${payoutUrl}" style="display:inline-block;padding:14px 28px;background:#0F1729;color:#fff;text-decoration:none;border-radius:10px;font-weight:800;font-size:14px;">${t.approvedCta}</a>
    </p>
  `;
  try {
    await new Resend(apiKey).emails.send({
      from: `GuestCam Partnerji <${FROM}>`,
      to,
      subject: t.approvedSubject(amountStr),
      html: affiliateShell("✅", body, t.contactFooter),
    });
  } catch (err) {
    console.error("[affiliate approved email] send failed:", err);
  }
}

// ─── Organizer agreement confirmation ────────────────────────────────────────

/**
 * Sent to the organizer every time they create a new gallery, confirming the
 * data-processing responsibility they accepted via the checkbox in the wizard.
 */
export async function sendOrganizerAgreementEmail({
  to,
  ownerName,
  coupleName,
  albumSlug,
}: {
  to: string;
  ownerName?: string;
  coupleName: string;
  albumSlug: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const albumUrl    = `${APP_URL}/${albumSlug}`;
  const privacyUrl  = `${APP_URL}/gdpr`;
  const greeting    = ownerName ? ` <strong>${escapeHtml(ownerName)}</strong>` : "";

  const html = `<!DOCTYPE html>
<html lang="sl">
<head><meta charset="utf-8" /><title>Potrditev zasebnosti – Guestcam</title></head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0F1729;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,41,0.06);">
        <tr><td style="background:#0F1729;padding:28px 32px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;font-weight:700;color:#FFC94D;">GUESTCAM</p>
          <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:800;">✅ Galerija ustvarjena – potrditev obveznosti</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#0F1729;">Pozdravljeni${greeting},</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#475569;">
            Uspešno ste ustvarili galerijo <strong style="color:#0F1729;">${escapeHtml(coupleName)}</strong>.
            S potrditvijo ob ustvarjanju ste sprejeli naslednje obveznosti kot organizator dogodka:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;margin:0 0 24px;">
            <tr><td style="padding:20px 22px;">
              <p style="margin:0 0 10px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;font-weight:700;">Vaše obveznosti</p>
              <ul style="margin:0;padding:0 0 0 18px;font-size:14px;line-height:1.8;color:#475569;">
                <li>Goste in udeležence boste obvestili o uporabi Guestcam galerije.</li>
                <li>Zagotovili boste ustrezno pravno podlago za obdelavo fotografij in videov.</li>
                <li>Odgovarjali boste na zahteve udeležencev v zvezi z vsebino galerije.</li>
              </ul>
            </td></tr>
          </table>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#475569;">
            Celotna politika zasebnosti, ki opisuje vloge organizatorja in Guestcam, je dostopna na
            <a href="${privacyUrl}" style="color:#C9820A;text-decoration:none;font-weight:600;">guestcam.si/gdpr</a>.
          </p>
          <p style="text-align:center;margin:0 0 8px;">
            <a href="${albumUrl}" style="display:inline-block;padding:14px 28px;background:#FFC94D;color:#0F1729;text-decoration:none;border-radius:10px;font-weight:800;font-size:14px;">Odpri galerijo →</a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #F2F4F8;">
          <p style="margin:0;font-size:11px;color:#94A3B8;text-align:center;">
            Guestcam · <a href="mailto:info@guestcam.si" style="color:#94A3B8;">info@guestcam.si</a> ·
            Sport Group d.o.o., Osojnikova 4a, 2000 Maribor, Slovenija
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await new Resend(apiKey).emails.send({
      from: `Guestcam <${FROM}>`,
      to,
      subject: `✅ Galerija "${escapeHtml(coupleName)}" ustvarjena – potrditev zasebnosti`,
      html,
    });
  } catch (err) {
    console.error("[organizer agreement email] send failed:", err);
  }
}

// ─── Shared contact footer ───────────────────────────────────────────────────
// Used by every transactional email (welcome, onboarding nudge, bank order,
// checkout receipts) so customers always see the full company details.

type EmailLang = "sl" | "hr" | "sr" | "de" | "en" | "es";

const CONTACT_FOOTER_LABELS: Record<EmailLang, { questions: string; reply: string; vatLabel: string }> = {
  sl: { questions: "Vprašanja?",  reply: "Odgovorite na to e-pošto ali pišite na", vatLabel: "Davčna št."  },
  hr: { questions: "Pitanja?",    reply: "Odgovorite na ovaj e-mail ili pišite na", vatLabel: "OIB"         },
  sr: { questions: "Pitanja?",    reply: "Odgovorite na ovaj e-mail ili pišite na", vatLabel: "PIB"         },
  de: { questions: "Fragen?",     reply: "Antworten Sie auf diese E-Mail oder schreiben Sie an", vatLabel: "USt-IdNr." },
  en: { questions: "Questions?",  reply: "Reply to this email or write to",         vatLabel: "VAT ID"      },
  es: { questions: "¿Preguntas?", reply: "Responde a este correo o escribe a",      vatLabel: "CIF"         },
};

export function contactFooterHtml(lang: EmailLang = "sl"): string {
  const t = CONTACT_FOOTER_LABELS[lang] ?? CONTACT_FOOTER_LABELS.sl;
  return `
    <tr><td style="padding:0 36px 8px;">
      <div style="height:1px;background:#E2E8F0;margin:8px 0;"></div>
    </td></tr>
    <tr><td style="padding:8px 36px 24px;">
      <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#475569;">
        <strong style="color:#0F1729;">${t.questions}</strong> ${t.reply}
        <a href="mailto:info@guestcam.si" style="color:#1E3A8A;text-decoration:none;font-weight:600;">info@guestcam.si</a>
        · <a href="tel:+38671604980" style="color:#1E3A8A;text-decoration:none;font-weight:600;">+386 71 604 980</a>
      </p>
      <p style="margin:0;font-size:11px;line-height:1.6;color:#94A3B8;">
        <strong style="color:#64748B;">Sport group d.o.o.</strong> · Osojnikova 4a, 2000 Maribor, Slovenija ·
        ${t.vatLabel}: SI72133449 ·
        <a href="${APP_URL}" style="color:#94A3B8;text-decoration:underline;">guestcam.si</a>
      </p>
    </td></tr>`;
}

// ─── Onboarding nudge — sent 7 days after sign-up if no album was created ────

interface OnboardingNudgeParams {
  to: string;
  firstName?: string | null;
  lang?: EmailLang;
}

interface NudgeCopy {
  subject: string;
  heading: string;
  greeting: (name?: string | null) => string;
  intro: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  ctaPrimary: string;
  ctaSecondary: string;
  helpHeading: string;
  helpBody: string;
  signoff: string;
}

const NUDGE_COPY: Record<EmailLang, NudgeCopy> = {
  sl: {
    subject: "Vam pomagamo ustvariti prvo galerijo? 🎉",
    heading: "Pripravljeni na vašo prvo galerijo?",
    greeting: (n) => `Pozdravljeni${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: "Pred tednom dni ste se registrirali v Guestcam — odlično! Še niste ustvarili prve galerije, zato vas vabimo, da to storite v naslednjih nekaj minutah.",
    bullet1: "Vnesite ime para in datum dogodka (30 sekund)",
    bullet2: "Prenesite QR kodo in jo natisnite za vsak stol",
    bullet3: "Gostje skenirajo in nalagajo fotografije — brez aplikacije",
    ctaPrimary: "Ustvari galerijo zdaj →",
    ctaSecondary: "Kako deluje QR koda?",
    helpHeading: "Potrebujete pomoč?",
    helpBody: "Z veseljem vam pomagamo z nastavitvijo. Pokličite ali pišite — odgovorimo isti dan.",
    signoff: "— Ekipa Guestcam",
  },
  hr: {
    subject: "Trebate pomoć s prvom galerijom? 🎉",
    heading: "Spremni za vašu prvu galeriju?",
    greeting: (n) => `Pozdrav${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: "Prije tjedan dana registrirali ste se na Guestcam — odlično! Još niste izradili prvu galeriju, pa vas pozivamo da to napravite u sljedećih nekoliko minuta.",
    bullet1: "Unesite ime para i datum događaja (30 sekundi)",
    bullet2: "Preuzmite QR kod i natisnite ga za svaki stol",
    bullet3: "Gosti skeniraju i učitavaju fotografije — bez aplikacije",
    ctaPrimary: "Stvori galeriju sada →",
    ctaSecondary: "Kako QR kod funkcionira?",
    helpHeading: "Treba vam pomoć?",
    helpBody: "Rado ćemo vam pomoći s postavljanjem. Nazovite ili pišite — odgovaramo isti dan.",
    signoff: "— Tim Guestcam",
  },
  sr: {
    subject: "Treba vam pomoć sa prvom galerijom? 🎉",
    heading: "Spremni za vašu prvu galeriju?",
    greeting: (n) => `Pozdrav${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: "Pre nedelju dana ste se registrovali na Guestcam — odlično! Još niste napravili prvu galeriju, pa vas pozivamo da to uradite u narednih nekoliko minuta.",
    bullet1: "Unesite ime para i datum događaja (30 sekundi)",
    bullet2: "Preuzmite QR kod i odštampajte ga za svaki sto",
    bullet3: "Gosti skeniraju i otpremaju fotografije — bez aplikacije",
    ctaPrimary: "Napravi galeriju sada →",
    ctaSecondary: "Kako QR kod funkcioniše?",
    helpHeading: "Treba vam pomoć?",
    helpBody: "Rado ćemo vam pomoći sa podešavanjem. Pozovite ili pišite — odgovaramo istog dana.",
    signoff: "— Tim Guestcam",
  },
  de: {
    subject: "Brauchen Sie Hilfe mit Ihrer ersten Galerie? 🎉",
    heading: "Bereit für Ihre erste Galerie?",
    greeting: (n) => `Hallo${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: "Vor einer Woche haben Sie sich bei Guestcam registriert — wunderbar! Sie haben Ihre erste Galerie noch nicht erstellt, deshalb laden wir Sie ein, das in den nächsten Minuten zu tun.",
    bullet1: "Geben Sie den Namen des Paares und das Datum ein (30 Sekunden)",
    bullet2: "Laden Sie den QR-Code herunter und drucken Sie ihn für jeden Tisch",
    bullet3: "Gäste scannen und laden Fotos hoch — ohne App",
    ctaPrimary: "Galerie jetzt erstellen →",
    ctaSecondary: "So funktioniert der QR-Code",
    helpHeading: "Brauchen Sie Hilfe?",
    helpBody: "Wir helfen Ihnen gerne bei der Einrichtung. Rufen Sie an oder schreiben Sie — wir antworten am selben Tag.",
    signoff: "— Das Guestcam-Team",
  },
  en: {
    subject: "Need a hand creating your first gallery? 🎉",
    heading: "Ready to create your first gallery?",
    greeting: (n) => `Hi${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: "You signed up to Guestcam a week ago — welcome! You haven't created your first gallery yet, so we'd love to help you get it set up in the next few minutes.",
    bullet1: "Enter the couple's name and the event date (30 seconds)",
    bullet2: "Download the QR code and print one for each table",
    bullet3: "Guests scan and upload photos — no app required",
    ctaPrimary: "Create my gallery →",
    ctaSecondary: "How the QR code works",
    helpHeading: "Need help?",
    helpBody: "We're happy to walk you through the setup. Call or email — we reply the same day.",
    signoff: "— The Guestcam team",
  },
  es: {
    subject: "¿Te ayudamos con tu primera galería? 🎉",
    heading: "¿Listo para tu primera galería?",
    greeting: (n) => `Hola${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: "Hace una semana te registraste en Guestcam — ¡bienvenido! Aún no has creado tu primera galería, así que nos encantaría ayudarte a configurarla en los próximos minutos.",
    bullet1: "Introduce el nombre de la pareja y la fecha (30 segundos)",
    bullet2: "Descarga el código QR e imprime uno para cada mesa",
    bullet3: "Los invitados escanean y suben fotos — sin app",
    ctaPrimary: "Crear mi galería →",
    ctaSecondary: "Cómo funciona el código QR",
    helpHeading: "¿Necesitas ayuda?",
    helpBody: "Te ayudamos con la configuración encantados. Llama o escríbenos — respondemos el mismo día.",
    signoff: "— El equipo de Guestcam",
  },
};

export function onboardingNudgeHtml(lang: EmailLang, firstName?: string | null): string {
  const t = NUDGE_COPY[lang] ?? NUDGE_COPY.en;
  const newAlbumUrl = `${APP_URL}/dashboard/new`;
  const helpUrl     = `${APP_URL}/${lang === "sl" ? "" : `${lang}/`}contact`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8" /><title>${t.heading}</title></head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0F1729;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,41,0.06);">

        <tr><td style="background:linear-gradient(135deg,#FFC94D 0%,#FFD966 100%);padding:36px 36px 28px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;font-weight:700;color:#0F1729;">GUESTCAM</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;color:#0F1729;font-weight:800;">${t.heading}</h1>
        </td></tr>

        <tr><td style="padding:32px 36px 8px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#0F1729;">${t.greeting(firstName)}</p>
          <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#475569;">${t.intro}</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 10px;font-size:13px;color:#475569;line-height:1.6;"><strong style="color:#0F1729;">1.</strong> ${t.bullet1}</p>
              <p style="margin:0 0 10px;font-size:13px;color:#475569;line-height:1.6;"><strong style="color:#0F1729;">2.</strong> ${t.bullet2}</p>
              <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;"><strong style="color:#0F1729;">3.</strong> ${t.bullet3}</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:26px 36px 0;text-align:center;">
          <a href="${newAlbumUrl}" style="display:inline-block;padding:14px 28px;background:#0F1729;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;margin:0 4px 8px;">${t.ctaPrimary}</a>
          <a href="${helpUrl}" style="display:inline-block;padding:14px 26px;background:#ffffff;color:#0F1729;border:1.5px solid #0F1729;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;margin:0 4px 8px;">${t.ctaSecondary}</a>
        </td></tr>

        <tr><td style="padding:28px 36px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E1;border:1px solid #FFE08A;border-radius:14px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0F1729;">💬 ${t.helpHeading}</p>
              <p style="margin:0;font-size:13px;line-height:1.55;color:#64748B;">${t.helpBody}</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:28px 36px 6px;">
          <p style="margin:0;font-size:13px;color:#0F1729;font-weight:700;">${t.signoff}</p>
        </td></tr>

        ${contactFooterHtml(lang)}

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOnboardingNudgeEmail({ to, firstName, lang = "sl" }: OnboardingNudgeParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping onboarding nudge");
    return;
  }
  const resend = new Resend(apiKey);
  const t = NUDGE_COPY[lang] ?? NUDGE_COPY.en;
  try {
    await resend.emails.send({
      from: `Guestcam <${FROM}>`,
      to,
      subject: t.subject,
      html: onboardingNudgeHtml(lang, firstName),
    });
  } catch (err) {
    console.error("[onboarding nudge email] send failed:", err);
  }
}

// ─── Account upgraded — sent when admin manually applies a plan ──────────────

interface AccountUpgradedParams {
  to: string;
  firstName?: string | null;
  plan: "basic" | "plus" | "premium";
  /** Slug of a placeholder gallery we just created so they can land in
   *  the dashboard ready to rename and configure it. */
  placeholderSlug?: string | null;
  lang?: EmailLang;
}

interface UpgradeCopy {
  subject: (plan: string) => string;
  heading: string;
  greeting: (n?: string | null) => string;
  intro: (plan: string) => string;
  placeholder: string;
  bullets: { basic: string[]; plus: string[]; premium: string[] };
  cta: string;
  ctaRename: string;
  signoff: string;
}

const UPGRADE_COPY: Record<EmailLang, UpgradeCopy> = {
  sl: {
    subject: (p) => `🎉 Vaš Guestcam račun je nadgrajen na ${p}`,
    heading: "Vaš račun je nadgrajen!",
    greeting: (n) => `Pozdravljeni${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: (p) => `Z veseljem vam sporočamo, da je naša ekipa vaš Guestcam račun nadgradila na paket <strong>${p}</strong>. Vse ugodnosti so na voljo takoj.`,
    placeholder: "Za vas smo že pripravili galerijo. V nadzorni plošči jo lahko preimenujete (npr. \"Ana & Marko\"), dodate datum dogodka in delite QR kodo z gosti.",
    bullets: {
      basic:   ["1000 fotografij", "90-dnevni dostop", "Personalizirane QR kartice"],
      plus:    ["Neomejene fotografije", "1-letni dostop", "Live galerija", "Personalizirane predloge"],
      premium: ["Neomejene fotografije in videi", "1-letni dostop", "Live galerija + AI Film Studio", "Premium predloge", "Prioritetna podpora"],
    },
    cta: "Odprite nadzorno ploščo →",
    ctaRename: "Uredite svojo galerijo →",
    signoff: "— Ekipa Guestcam",
  },
  hr: {
    subject: (p) => `🎉 Vaš Guestcam račun je nadograđen na ${p}`,
    heading: "Vaš račun je nadograđen!",
    greeting: (n) => `Pozdrav${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: (p) => `S veseljem vam javljamo da je naš tim vaš Guestcam račun nadogradio na paket <strong>${p}</strong>. Sve pogodnosti dostupne su odmah.`,
    placeholder: "Već smo vam pripremili galeriju. U nadzornoj ploči je možete preimenovati (npr. \"Ana & Marko\"), dodati datum događaja i podijeliti QR kod s gostima.",
    bullets: {
      basic:   ["1000 fotografija", "90 dana pristupa", "Personalizirane QR kartice"],
      plus:    ["Neograničene fotografije", "1 godina pristupa", "Live galerija", "Personalizirani predlošci"],
      premium: ["Neograničene fotografije i videozapisi", "1 godina pristupa", "Live galerija + AI Film Studio", "Premium predlošci", "Prioritetna podrška"],
    },
    cta: "Otvori nadzornu ploču →",
    ctaRename: "Uredi svoju galeriju →",
    signoff: "— Tim Guestcam",
  },
  sr: {
    subject: (p) => `🎉 Vaš Guestcam nalog je unapređen na ${p}`,
    heading: "Vaš nalog je unapređen!",
    greeting: (n) => `Pozdrav${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: (p) => `Sa zadovoljstvom vas obaveštavamo da je naš tim vaš Guestcam nalog unapredio na paket <strong>${p}</strong>. Sve pogodnosti su dostupne odmah.`,
    placeholder: "Već smo vam pripremili galeriju. U kontrolnoj tabli je možete preimenovati (npr. \"Ana & Marko\"), dodati datum događaja i podeliti QR kod sa gostima.",
    bullets: {
      basic:   ["1000 fotografija", "90 dana pristupa", "Personalizovane QR kartice"],
      plus:    ["Neograničene fotografije", "1 godina pristupa", "Live galerija", "Personalizovani šabloni"],
      premium: ["Neograničene fotografije i video zapisi", "1 godina pristupa", "Live galerija + AI Film Studio", "Premium šabloni", "Prioritetna podrška"],
    },
    cta: "Otvori kontrolnu tablu →",
    ctaRename: "Uredi svoju galeriju →",
    signoff: "— Tim Guestcam",
  },
  de: {
    subject: (p) => `🎉 Ihr Guestcam-Konto wurde auf ${p} hochgestuft`,
    heading: "Ihr Konto wurde hochgestuft!",
    greeting: (n) => `Hallo${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: (p) => `Wir freuen uns, Ihnen mitzuteilen, dass unser Team Ihr Guestcam-Konto auf das Paket <strong>${p}</strong> hochgestuft hat. Alle Vorteile sind sofort verfügbar.`,
    placeholder: "Wir haben bereits eine Galerie für Sie vorbereitet. Im Dashboard können Sie sie umbenennen (z. B. \"Ana & Marko\"), das Veranstaltungsdatum hinzufügen und den QR-Code mit den Gästen teilen.",
    bullets: {
      basic:   ["1000 Fotos", "90 Tage Zugriff", "Personalisierte QR-Karten"],
      plus:    ["Unbegrenzte Fotos", "1 Jahr Zugriff", "Live-Galerie", "Personalisierte Vorlagen"],
      premium: ["Unbegrenzte Fotos und Videos", "1 Jahr Zugriff", "Live-Galerie + AI Film Studio", "Premium-Vorlagen", "Priorisierter Support"],
    },
    cta: "Dashboard öffnen →",
    ctaRename: "Galerie bearbeiten →",
    signoff: "— Das Guestcam-Team",
  },
  en: {
    subject: (p) => `🎉 Your Guestcam account has been upgraded to ${p}`,
    heading: "Your account has been upgraded!",
    greeting: (n) => `Hi${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: (p) => `We're delighted to let you know our team has upgraded your Guestcam account to the <strong>${p}</strong> plan. All benefits are available immediately.`,
    placeholder: "We've already prepared a gallery for you. From your dashboard you can rename it (e.g. \"Ana & Marko\"), add the event date, and share the QR code with guests.",
    bullets: {
      basic:   ["1,000 photos", "90 days of access", "Personalised QR cards"],
      plus:    ["Unlimited photos", "1 year of access", "Live gallery", "Personalised templates"],
      premium: ["Unlimited photos and videos", "1 year of access", "Live gallery + AI Film Studio", "Premium templates", "Priority support"],
    },
    cta: "Open the dashboard →",
    ctaRename: "Edit your gallery →",
    signoff: "— The Guestcam team",
  },
  es: {
    subject: (p) => `🎉 Tu cuenta de Guestcam ha sido actualizada a ${p}`,
    heading: "¡Tu cuenta ha sido actualizada!",
    greeting: (n) => `Hola${n ? ` ${escapeHtml(n)}` : ""},`,
    intro: (p) => `Nos alegra informarte que nuestro equipo ha actualizado tu cuenta de Guestcam al plan <strong>${p}</strong>. Todos los beneficios están disponibles de inmediato.`,
    placeholder: "Ya te hemos preparado una galería. Desde tu panel puedes renombrarla (p. ej. \"Ana y Marko\"), añadir la fecha del evento y compartir el código QR con tus invitados.",
    bullets: {
      basic:   ["1.000 fotos", "90 días de acceso", "Tarjetas QR personalizadas"],
      plus:    ["Fotos ilimitadas", "1 año de acceso", "Galería en directo", "Plantillas personalizadas"],
      premium: ["Fotos y vídeos ilimitados", "1 año de acceso", "Galería en directo + AI Film Studio", "Plantillas Premium", "Soporte prioritario"],
    },
    cta: "Abrir el panel →",
    ctaRename: "Editar mi galería →",
    signoff: "— El equipo de Guestcam",
  },
};

export function accountUpgradedHtml(
  lang: EmailLang,
  plan: "basic" | "plus" | "premium",
  firstName?: string | null,
  placeholderSlug?: string | null,
): string {
  const t = UPGRADE_COPY[lang] ?? UPGRADE_COPY.en;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const dashboardUrl = placeholderSlug ? `${APP_URL}/dashboard/${placeholderSlug}` : `${APP_URL}/dashboard`;
  const ctaLabel = placeholderSlug ? t.ctaRename : t.cta;
  const bullets = t.bullets[plan] ?? t.bullets.premium;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8" /><title>${t.heading}</title></head>
<body style="margin:0;padding:0;background:#F2F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0F1729;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,41,0.06);">

        <tr><td style="background:linear-gradient(135deg,#FFC94D 0%,#FFD966 100%);padding:36px 36px 28px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;font-weight:700;color:#0F1729;">GUESTCAM · ${planLabel.toUpperCase()}</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;color:#0F1729;font-weight:800;">${t.heading}</h1>
        </td></tr>

        <tr><td style="padding:32px 36px 8px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#0F1729;">${t.greeting(firstName)}</p>
          <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#475569;">${t.intro(planLabel)}</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;">
            <tr><td style="padding:18px 22px;">
              ${bullets.map((b) => `<p style="margin:0 0 6px;font-size:13px;color:#475569;line-height:1.6;">✓ ${escapeHtml(b)}</p>`).join("")}
            </td></tr>
          </table>
        </td></tr>

        ${placeholderSlug ? `
        <tr><td style="padding:24px 36px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8E1;border:1px solid #FFE08A;border-radius:14px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#64748B;">${t.placeholder}</p>
            </td></tr>
          </table>
        </td></tr>` : ""}

        <tr><td style="padding:28px 36px 0;text-align:center;">
          <a href="${dashboardUrl}" style="display:inline-block;padding:14px 28px;background:#0F1729;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">${ctaLabel}</a>
        </td></tr>

        <tr><td style="padding:28px 36px 6px;">
          <p style="margin:0;font-size:13px;color:#0F1729;font-weight:700;">${t.signoff}</p>
        </td></tr>

        ${contactFooterHtml(lang)}

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendAccountUpgradedEmail({ to, firstName, plan, placeholderSlug, lang = "sl" }: AccountUpgradedParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping account upgraded email");
    return;
  }
  const resend = new Resend(apiKey);
  const t = UPGRADE_COPY[lang] ?? UPGRADE_COPY.en;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  try {
    await resend.emails.send({
      from: `Guestcam <${FROM}>`,
      to,
      subject: t.subject(planLabel),
      html: accountUpgradedHtml(lang, plan, firstName, placeholderSlug),
    });
  } catch (err) {
    console.error("[account upgraded email] send failed:", err);
  }
}
