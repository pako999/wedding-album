import { Resend } from "resend";
import { SITE_URL } from "@/lib/urls";

const FROM = process.env.RESEND_FROM ?? "noreply@guestcam.si";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;

type Lang = "sl" | "hr" | "sr" | "en" | "de" | "es";

const COPY: Record<Lang, { subject: (venue: string) => string; title: string; code: string; valid: string; noExpiry: string; footer: string }> = {
  sl: { subject: (v) => `🎁 Tvoj Guestcam kupon — ${v}`, title: "Tvoja nagrada je odklenjena", code: "Koda kupona", valid: "Velja do", noExpiry: "Brez časovne omejitve", footer: "Pokaži kodo osebju ob naslednjem obisku." },
  hr: { subject: (v) => `🎁 Tvoj Guestcam kupon — ${v}`, title: "Tvoja nagrada je otključana", code: "Kod kupona", valid: "Vrijedi do", noExpiry: "Bez vremenskog ograničenja", footer: "Pokaži kod osoblju pri sljedećem posjetu." },
  sr: { subject: (v) => `🎁 Tvoj Guestcam kupon — ${v}`, title: "Tvoja nagrada je otključana", code: "Kod kupona", valid: "Važi do", noExpiry: "Bez vremenskog ograničenja", footer: "Pokaži kod osoblju pri sledećoj poseti." },
  en: { subject: (v) => `🎁 Your Guestcam reward — ${v}`, title: "Your reward is unlocked", code: "Coupon code", valid: "Valid until", noExpiry: "No expiry", footer: "Show the code to staff on your next visit." },
  de: { subject: (v) => `🎁 Dein Guestcam-Gutschein — ${v}`, title: "Deine Belohnung ist freigeschaltet", code: "Gutscheincode", valid: "Gültig bis", noExpiry: "Ohne Ablaufdatum", footer: "Zeige den Code bei deinem nächsten Besuch dem Personal." },
  es: { subject: (v) => `🎁 Tu cupón Guestcam — ${v}`, title: "Tu recompensa está desbloqueada", code: "Código del cupón", valid: "Válido hasta", noExpiry: "Sin caducidad", footer: "Muestra el código al personal en tu próxima visita." },
};

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));
}

export async function sendLocalRewardEmail(input: {
  to: string;
  venueName: string;
  couponCode: string;
  rewardTitle: string;
  rewardDescription?: string | null;
  rewardTerms?: string | null;
  expiresAt?: Date | null;
  locale?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[local-reward-email] RESEND_API_KEY not set — skipping");
    return { skipped: true };
  }

  const lang = (input.locale && input.locale in COPY ? input.locale : "en") as Lang;
  const t = COPY[lang];
  const expiry = input.expiresAt
    ? new Intl.DateTimeFormat(lang === "sl" ? "sl-SI" : lang, { dateStyle: "medium" }).format(input.expiresAt)
    : t.noExpiry;
  const couponUrl = `${APP_URL}/dashboard/local/redeem/${encodeURIComponent(input.couponCode)}`;

  const html = `<!doctype html><html lang="${lang}"><body style="margin:0;background:#F7F6F2;font-family:Arial,sans-serif;color:#14181F"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:28px 14px"><table width="560" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:560px;background:#fff;border:1px solid #E4E1D9;border-radius:20px;overflow:hidden"><tr><td style="background:#14181F;color:#fff;padding:28px 30px;text-align:center"><div style="font-size:36px">🎁</div><div style="margin-top:10px;font-size:12px;letter-spacing:2px;color:#C8CDD4;font-weight:700">${esc(input.venueName)}</div><h1 style="margin:8px 0 0;font-size:25px">${esc(t.title)}</h1></td></tr><tr><td style="padding:28px 30px"><div style="background:#FFF3CC;border-radius:16px;padding:20px;text-align:center;color:#68470F"><div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px">${esc(input.rewardTitle)}</div>${input.rewardDescription ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.5">${esc(input.rewardDescription)}</p>` : ""}</div><div style="margin-top:18px;border:1px solid #E4E1D9;border-radius:16px;padding:22px;text-align:center"><div style="font-size:11px;color:#5A6068;text-transform:uppercase;letter-spacing:1.5px;font-weight:700">${esc(t.code)}</div><div style="margin-top:8px;font-family:monospace;font-size:30px;font-weight:800;letter-spacing:2px">${esc(input.couponCode)}</div><p style="margin:12px 0 0;font-size:13px;color:#5A6068">${esc(t.valid)}: <strong style="color:#14181F">${esc(expiry)}</strong></p></div>${input.rewardTerms ? `<p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#5A6068">${esc(input.rewardTerms)}</p>` : ""}<p style="margin:22px 0 0;text-align:center;font-size:14px;font-weight:700">${esc(t.footer)}</p><p style="margin:18px 0 0;text-align:center;font-size:11px;color:#8A9098">Guestcam Local Rewards · <a href="${couponUrl}" style="color:#8C6218">${esc(input.couponCode)}</a></p></td></tr></table></td></tr></table></body></html>`;

  const result = await new Resend(apiKey).emails.send({
    from: `Guestcam <${FROM}>`,
    to: input.to,
    subject: t.subject(input.venueName),
    html,
  });
  return { skipped: false, result };
}
