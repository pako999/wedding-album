import { Resend } from "resend";

// Lazy — avoids crash at build time when env vars aren't set
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}
const FROM = process.env.RESEND_FROM ?? "album@guestcam.si";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://guestcam.si";

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
  const albumUrl = `${APP_URL}/${albumSlug}`;
  const dashboardUrl = `${APP_URL}/dashboard/${albumSlug}`;

  await getResend().emails.send({
    from: `Guestcam <${FROM}>`,
    to,
    subject: `Nova fotografija v vašem albumu — ${coupleName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#FAF7F2,#F0E8D8);padding:32px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.2);">
            <p style="margin:0 0 8px;font-size:12px;color:#C9A96E;letter-spacing:2px;text-transform:uppercase;">Poročni album</p>
            <h1 style="margin:0;font-size:28px;font-weight:300;color:#2C2825;font-family:Georgia,serif;">${coupleName}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#2C2825;line-height:1.6;">
              <strong>${uploaderName}</strong> je naložil/a novo fotografijo v vaš poročni album.
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#2C2825;opacity:0.6;">
              Album ima skupaj <strong>${photoCount}</strong> ${photoCount === 1 ? "fotografijo" : "fotografij"}.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${albumUrl}" style="display:inline-block;padding:14px 28px;background:#2C2825;color:#FAF7F2;text-decoration:none;border-radius:12px;font-size:14px;font-weight:500;margin-right:12px;">
                Poglej album
              </a>
              <a href="${dashboardUrl}" style="display:inline-block;padding:14px 28px;border:1px solid rgba(201,169,110,0.4);color:#2C2825;text-decoration:none;border-radius:12px;font-size:14px;">
                Upravljaj
              </a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(201,169,110,0.2);text-align:center;">
            <p style="margin:0;font-size:11px;color:#2C2825;opacity:0.4;">
              Guestcam · <a href="${APP_URL}" style="color:#C9A96E;text-decoration:none;">guestcam.si</a>
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
