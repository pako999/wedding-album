import { Resend } from "resend";

const FROM = process.env.RESEND_FROM ?? "noreply@guestcam.si";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://guestcam.si";

/** Escape user-supplied values before interpolating them into email HTML. */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c
  ));
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
