import { Resend } from "resend";
import { SITE_URL } from "@/lib/urls";

export type LifecycleEmailLang = "sl" | "hr" | "sr" | "de" | "en" | "es";

const FROM = process.env.RESEND_FROM ?? "info@guestcam.si";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;
const LOCALE_TAG: Record<LifecycleEmailLang, string> = {
  sl: "sl-SI", hr: "hr-HR", sr: "sr-Latn", de: "de-DE", en: "en-GB", es: "es-ES",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char
  ));
}

export function lifecycleEmailLang(value?: string | null): LifecycleEmailLang {
  return value === "hr" || value === "sr" || value === "de" || value === "en" || value === "es" ? value : "sl";
}

function formatDate(value: string | Date, lang: LifecycleEmailLang): string {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00Z`) : value;
  return new Intl.DateTimeFormat(LOCALE_TAG[lang], {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Ljubljana",
  }).format(date);
}

type Copy = {
  greeting: (name?: string | null) => string;
  salesSubject: (percent: number) => string;
  salesTitle: (percent: number) => string;
  salesIntro: string;
  salesCode: string;
  salesValidity: string;
  salesCta: string;
  eventSubject: (days: number, event: string) => string;
  eventTitle: (days: number) => string;
  eventIntro: (event: string, date: string) => string;
  eventSteps: string[];
  eventCta: string;
  afterSubject: (event: string) => string;
  afterTitle: string;
  afterIntro: (event: string, count: number) => string;
  afterBody: string;
  zipCta: string;
  reviewCta: string;
  expirySubject: (event: string) => string;
  expiryTitle: string;
  expiryIntro: (event: string, date: string) => string;
  expiryBody: string;
  expiryCta: string;
  upgradeCta: string;
  footer: string;
};

const COPY: Record<LifecycleEmailLang, Copy> = {
  sl: {
    greeting: (n) => `Pozdravljeni${n ? ` ${escapeHtml(n)}` : ""},`,
    salesSubject: (p) => `🎁 Samo 24 ur: vaših ${p} % popusta za Guestcam`,
    salesTitle: (p) => `${p} % popusta za vaš dogodek`,
    salesIntro: "Pred 15 dnevi ste se registrirali v Guestcam. Če še načrtujete dogodek, smo vam pripravili osebno kodo za katerikoli plačljivi paket.",
    salesCode: "VAŠA KODA", salesValidity: "Koda velja 24 ur in jo lahko uporabite enkrat.", salesCta: "Uporabi popust →",
    eventSubject: (d, e) => `⏰ ${e}: še ${d} ${d === 1 ? "dan" : "dni"} do dogodka`,
    eventTitle: (d) => `Dogodek je čez ${d} ${d === 1 ? "dan" : "dni"}`,
    eventIntro: (e, d) => `<strong>${escapeHtml(e)}</strong> je ${d}. Pred začetkom priporočamo še kratek pregled nastavitev.`,
    eventSteps: ["Preizkusite QR kodo z mobilnim telefonom", "Natisnite kartice in preverite povezavo galerije", "Preverite dovoljenja, moderiranje in e-mail obvestila"],
    eventCta: "Preveri galerijo →",
    afterSubject: (e) => `📸 ${e}: fotografije so pripravljene za prenos`,
    afterTitle: "Vaši spomini so zbrani",
    afterIntro: (e, c) => `Dogodek <strong>${escapeHtml(e)}</strong> je zaključen, v galeriji pa je zbranih ${c} fotografij in videov.`,
    afterBody: "Odprite nadzorno ploščo in prenesite vse datoteke kot ZIP. Veseli bomo tudi kratke ocene vaše izkušnje z Guestcam.",
    zipCta: "Prenesi ZIP →", reviewCta: "Pošlji oceno",
    expirySubject: (e) => `⚠️ ${e}: galerija bo kmalu potekla`, expiryTitle: "Galerija poteče v naslednjih 7 dneh",
    expiryIntro: (e, d) => `Dostop do galerije <strong>${escapeHtml(e)}</strong> poteče ${d}.`,
    expiryBody: "Pred potekom prenesite vse fotografije in videe. Če potrebujete več časa, lahko galerijo nadgradite.",
    expiryCta: "Odpri in prenesi →", upgradeCta: "Podaljšaj dostop", footer: "To obvestilo je povezano z vašo Guestcam galerijo.",
  },
  hr: {
    greeting: (n) => `Pozdrav${n ? ` ${escapeHtml(n)}` : ""},`, salesSubject: (p) => `🎁 Samo 24 sata: vaših ${p} % popusta za Guestcam`,
    salesTitle: (p) => `${p} % popusta za vaš događaj`, salesIntro: "Prije 15 dana registrirali ste se na Guestcam. Ako još planirate događaj, pripremili smo osobni kod za bilo koji plaćeni paket.",
    salesCode: "VAŠ KOD", salesValidity: "Kod vrijedi 24 sata i može se iskoristiti jednom.", salesCta: "Iskoristi popust →",
    eventSubject: (d, e) => `⏰ ${e}: još ${d} ${d === 1 ? "dan" : "dana"} do događaja`, eventTitle: (d) => `Događaj je za ${d} ${d === 1 ? "dan" : "dana"}`,
    eventIntro: (e, d) => `<strong>${escapeHtml(e)}</strong> je ${d}. Prije početka preporučujemo kratku provjeru postavki.`,
    eventSteps: ["Testirajte QR kod mobitelom", "Ispišite kartice i provjerite poveznicu galerije", "Provjerite dozvole, moderiranje i e-mail obavijesti"], eventCta: "Provjeri galeriju →",
    afterSubject: (e) => `📸 ${e}: fotografije su spremne za preuzimanje`, afterTitle: "Vaše uspomene su na okupu",
    afterIntro: (e, c) => `Događaj <strong>${escapeHtml(e)}</strong> je završen, a galerija sadrži ${c} fotografija i videozapisa.`,
    afterBody: "Otvorite nadzornu ploču i preuzmite sve datoteke kao ZIP. Bit će nam drago i ako kratko ocijenite Guestcam.", zipCta: "Preuzmi ZIP →", reviewCta: "Pošalji ocjenu",
    expirySubject: (e) => `⚠️ ${e}: galerija uskoro istječe`, expiryTitle: "Galerija istječe u sljedećih 7 dana", expiryIntro: (e, d) => `Pristup galeriji <strong>${escapeHtml(e)}</strong> istječe ${d}.`,
    expiryBody: "Prije isteka preuzmite sve fotografije i videozapise. Ako trebate više vremena, možete nadograditi galeriju.", expiryCta: "Otvori i preuzmi →", upgradeCta: "Produži pristup", footer: "Ova obavijest povezana je s vašom Guestcam galerijom.",
  },
  sr: {
    greeting: (n) => `Pozdrav${n ? ` ${escapeHtml(n)}` : ""},`, salesSubject: (p) => `🎁 Samo 24 sata: vaših ${p} % popusta za Guestcam`,
    salesTitle: (p) => `${p} % popusta za vaš događaj`, salesIntro: "Pre 15 dana registrovali ste se na Guestcam. Ako još planirate događaj, pripremili smo lični kod za bilo koji plaćeni paket.",
    salesCode: "VAŠ KOD", salesValidity: "Kod važi 24 sata i može da se iskoristi jednom.", salesCta: "Iskoristi popust →",
    eventSubject: (d, e) => `⏰ ${e}: još ${d} ${d === 1 ? "dan" : "dana"} do događaja`, eventTitle: (d) => `Događaj je za ${d} ${d === 1 ? "dan" : "dana"}`,
    eventIntro: (e, d) => `<strong>${escapeHtml(e)}</strong> je ${d}. Pre početka preporučujemo kratku proveru podešavanja.`,
    eventSteps: ["Testirajte QR kod telefonom", "Odštampajte kartice i proverite link galerije", "Proverite dozvole, moderaciju i e-mail obaveštenja"], eventCta: "Proveri galeriju →",
    afterSubject: (e) => `📸 ${e}: fotografije su spremne za preuzimanje`, afterTitle: "Vaše uspomene su na jednom mestu",
    afterIntro: (e, c) => `Događaj <strong>${escapeHtml(e)}</strong> je završen, a galerija sadrži ${c} fotografija i video snimaka.`,
    afterBody: "Otvorite kontrolnu tablu i preuzmite sve fajlove kao ZIP. Biće nam drago i ako kratko ocenite Guestcam.", zipCta: "Preuzmi ZIP →", reviewCta: "Pošalji ocenu",
    expirySubject: (e) => `⚠️ ${e}: galerija uskoro ističe`, expiryTitle: "Galerija ističe u narednih 7 dana", expiryIntro: (e, d) => `Pristup galeriji <strong>${escapeHtml(e)}</strong> ističe ${d}.`,
    expiryBody: "Pre isteka preuzmite sve fotografije i video snimke. Ako vam treba više vremena, možete nadograditi galeriju.", expiryCta: "Otvori i preuzmi →", upgradeCta: "Produži pristup", footer: "Ovo obaveštenje je povezano sa vašom Guestcam galerijom.",
  },
  de: {
    greeting: (n) => `Hallo${n ? ` ${escapeHtml(n)}` : ""},`, salesSubject: (p) => `🎁 Nur 24 Stunden: ${p} % Guestcam-Rabatt`,
    salesTitle: (p) => `${p} % Rabatt für Ihr Event`, salesIntro: "Sie haben sich vor 15 Tagen bei Guestcam registriert. Falls Sie noch ein Event planen, erhalten Sie einen persönlichen Code für jeden kostenpflichtigen Tarif.",
    salesCode: "IHR CODE", salesValidity: "Der Code gilt 24 Stunden und kann einmal verwendet werden.", salesCta: "Rabatt nutzen →",
    eventSubject: (d, e) => `⏰ ${e}: noch ${d} ${d === 1 ? "Tag" : "Tage"} bis zum Event`, eventTitle: (d) => `Ihr Event ist in ${d} ${d === 1 ? "Tag" : "Tagen"}`,
    eventIntro: (e, d) => `<strong>${escapeHtml(e)}</strong> findet am ${d} statt. Wir empfehlen vorher einen kurzen Einstellungs-Check.`,
    eventSteps: ["QR-Code mit dem Smartphone testen", "Karten drucken und Galerie-Link prüfen", "Berechtigungen, Moderation und E-Mail-Hinweise prüfen"], eventCta: "Galerie prüfen →",
    afterSubject: (e) => `📸 ${e}: Ihre Fotos stehen zum Download bereit`, afterTitle: "Ihre Erinnerungen sind gesammelt",
    afterIntro: (e, c) => `Das Event <strong>${escapeHtml(e)}</strong> ist vorbei; die Galerie enthält ${c} Fotos und Videos.`,
    afterBody: "Öffnen Sie das Dashboard und laden Sie alle Dateien als ZIP herunter. Wir freuen uns auch über eine kurze Bewertung von Guestcam.", zipCta: "ZIP herunterladen →", reviewCta: "Bewertung senden",
    expirySubject: (e) => `⚠️ ${e}: Ihre Galerie läuft bald ab`, expiryTitle: "Ihre Galerie läuft in den nächsten 7 Tagen ab", expiryIntro: (e, d) => `Der Zugriff auf <strong>${escapeHtml(e)}</strong> endet am ${d}.`,
    expiryBody: "Laden Sie vorher alle Fotos und Videos herunter. Wenn Sie mehr Zeit brauchen, können Sie die Galerie upgraden.", expiryCta: "Öffnen & herunterladen →", upgradeCta: "Zugriff verlängern", footer: "Diese Nachricht betrifft Ihre Guestcam-Galerie.",
  },
  en: {
    greeting: (n) => `Hi${n ? ` ${escapeHtml(n)}` : ""},`, salesSubject: (p) => `🎁 24 hours only: your ${p}% Guestcam discount`,
    salesTitle: (p) => `${p}% off your event`, salesIntro: "You registered with Guestcam 15 days ago. If you're still planning an event, we've prepared a personal code for any paid package.",
    salesCode: "YOUR CODE", salesValidity: "The code is valid for 24 hours and can be used once.", salesCta: "Use my discount →",
    eventSubject: (d, e) => `⏰ ${e}: ${d} ${d === 1 ? "day" : "days"} to your event`, eventTitle: (d) => `Your event is in ${d} ${d === 1 ? "day" : "days"}`,
    eventIntro: (e, d) => `<strong>${escapeHtml(e)}</strong> is on ${d}. We recommend one quick settings check before it starts.`,
    eventSteps: ["Test the QR code on a mobile phone", "Print the cards and check the gallery link", "Review permissions, moderation and email notifications"], eventCta: "Check my gallery →",
    afterSubject: (e) => `📸 ${e}: your photos are ready to download`, afterTitle: "Your memories are all together",
    afterIntro: (e, c) => `Your event <strong>${escapeHtml(e)}</strong> is over and the gallery contains ${c} photos and videos.`,
    afterBody: "Open your dashboard and download every file as a ZIP. We'd also love a short review of your Guestcam experience.", zipCta: "Download ZIP →", reviewCta: "Send a review",
    expirySubject: (e) => `⚠️ ${e}: your gallery expires soon`, expiryTitle: "Your gallery expires within the next 7 days", expiryIntro: (e, d) => `Access to <strong>${escapeHtml(e)}</strong> expires on ${d}.`,
    expiryBody: "Download all photos and videos before expiry. If you need more time, you can upgrade the gallery.", expiryCta: "Open & download →", upgradeCta: "Extend access", footer: "This service notice relates to your Guestcam gallery.",
  },
  es: {
    greeting: (n) => `Hola${n ? ` ${escapeHtml(n)}` : ""},`, salesSubject: (p) => `🎁 Solo 24 horas: tu ${p} % de descuento en Guestcam`,
    salesTitle: (p) => `${p} % de descuento para tu evento`, salesIntro: "Te registraste en Guestcam hace 15 días. Si aún estás preparando un evento, hemos creado un código personal para cualquier paquete de pago.",
    salesCode: "TU CÓDIGO", salesValidity: "El código es válido durante 24 horas y puede utilizarse una vez.", salesCta: "Usar mi descuento →",
    eventSubject: (d, e) => `⏰ ${e}: faltan ${d} ${d === 1 ? "día" : "días"}`, eventTitle: (d) => `Tu evento es dentro de ${d} ${d === 1 ? "día" : "días"}`,
    eventIntro: (e, d) => `<strong>${escapeHtml(e)}</strong> es el ${d}. Recomendamos una última revisión de la configuración.`,
    eventSteps: ["Prueba el código QR con un móvil", "Imprime las tarjetas y comprueba el enlace", "Revisa permisos, moderación y avisos por e-mail"], eventCta: "Revisar mi galería →",
    afterSubject: (e) => `📸 ${e}: tus fotos están listas para descargar`, afterTitle: "Todos tus recuerdos juntos",
    afterIntro: (e, c) => `El evento <strong>${escapeHtml(e)}</strong> ha terminado y la galería contiene ${c} fotos y vídeos.`,
    afterBody: "Abre el panel y descarga todos los archivos como ZIP. También nos encantará recibir una breve valoración de Guestcam.", zipCta: "Descargar ZIP →", reviewCta: "Enviar valoración",
    expirySubject: (e) => `⚠️ ${e}: tu galería caduca pronto`, expiryTitle: "Tu galería caduca en los próximos 7 días", expiryIntro: (e, d) => `El acceso a <strong>${escapeHtml(e)}</strong> caduca el ${d}.`,
    expiryBody: "Descarga todas las fotos y vídeos antes de que caduque. Si necesitas más tiempo, puedes mejorar el paquete.", expiryCta: "Abrir y descargar →", upgradeCta: "Ampliar acceso", footer: "Este aviso está relacionado con tu galería Guestcam.",
  },
};

function shell({ lang, eyebrow, title, greeting, content, primary, secondary, footer }: {
  lang: LifecycleEmailLang; eyebrow: string; title: string; greeting?: string; content: string;
  primary: { href: string; label: string }; secondary?: { href: string; label: string }; footer: string;
}) {
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#F2F4F8;font-family:Arial,sans-serif;color:#0F1729"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:28px 14px;background:#F2F4F8"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:600px;background:#fff;border:1px solid #E2E8F0;border-radius:18px;overflow:hidden">
<tr><td style="padding:30px 32px;background:#FFC94D"><p style="margin:0 0 7px;font-size:11px;letter-spacing:2.5px;font-weight:800">${escapeHtml(eyebrow)}</p><h1 style="margin:0;font-size:25px;line-height:1.25">${escapeHtml(title)}</h1></td></tr>
<tr><td style="padding:30px 32px 8px">${greeting ? `<p style="margin:0 0 16px;font-size:16px">${greeting}</p>` : ""}<div style="font-size:15px;line-height:1.7;color:#475569">${content}</div></td></tr>
<tr><td style="padding:22px 32px 30px;text-align:center"><a href="${primary.href}" style="display:inline-block;margin:4px;padding:14px 24px;border-radius:11px;background:#0F1729;color:#fff;text-decoration:none;font-size:14px;font-weight:800">${escapeHtml(primary.label)}</a>${secondary ? `<a href="${secondary.href}" style="display:inline-block;margin:4px;padding:13px 22px;border-radius:11px;border:1.5px solid #0F1729;color:#0F1729;text-decoration:none;font-size:14px;font-weight:800">${escapeHtml(secondary.label)}</a>` : ""}</td></tr>
<tr><td style="padding:18px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0"><p style="margin:0 0 8px;font-size:11px;line-height:1.6;color:#64748B">${escapeHtml(footer)}</p><p style="margin:0;font-size:11px;color:#94A3B8">Guestcam · <a href="mailto:info@guestcam.si" style="color:#3551A8">info@guestcam.si</a></p></td></tr>
</table></td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string, idempotencyKey: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured for lifecycle email");
  const { error } = await new Resend(apiKey).emails.send({
    from: `Guestcam <${FROM}>`, replyTo: "info@guestcam.si", to, subject, html,
  }, { idempotencyKey });
  if (error) throw new Error(`Resend rejected lifecycle email: ${error.message}`);
}

export async function sendRegistrationSalesEmail(p: { to: string; firstName?: string | null; locale?: string | null; discountCode: string; discountPercent: number; discountExpiresAt: Date; albumSlug?: string | null; scopeId: string }) {
  const lang = lifecycleEmailLang(p.locale); const t = COPY[lang];
  const href = p.albumSlug ? `${APP_URL}/dashboard/${p.albumSlug}/upgrade?discount=${encodeURIComponent(p.discountCode)}` : `${APP_URL}/dashboard/new`;
  const content = `<p style="margin:0 0 18px">${t.salesIntro}</p><div style="padding:20px;text-align:center;border:1px solid #FFE08A;border-radius:14px;background:#FFF9E8"><div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#A66A00">${t.salesCode}</div><div style="margin:8px 0;font-size:28px;font-weight:900;letter-spacing:2px;color:#0F1729">${escapeHtml(p.discountCode)}</div><div style="font-size:12px;color:#64748B">${t.salesValidity}<br>${formatDate(p.discountExpiresAt, lang)}</div></div>`;
  await send(p.to, t.salesSubject(p.discountPercent), shell({ lang, eyebrow: "GUESTCAM · D15", title: t.salesTitle(p.discountPercent), greeting: t.greeting(p.firstName), content, primary: { href, label: t.salesCta }, footer: t.footer }), `lifecycle-sales-d15-${p.scopeId}`);
}

export async function sendEventCountdownEmail(p: { to: string; coupleName: string; eventDate: string; daysUntil: number; albumSlug: string; locale?: string | null; scopeId: string }) {
  const lang = lifecycleEmailLang(p.locale); const t = COPY[lang];
  const list = t.eventSteps.map((step, i) => `<p style="margin:0 0 9px"><strong style="color:#0F1729">${i + 1}.</strong> ${step}</p>`).join("");
  const content = `<p style="margin:0 0 18px">${t.eventIntro(p.coupleName, formatDate(p.eventDate, lang))}</p><div style="padding:18px 20px;border:1px solid #E2E8F0;border-radius:14px;background:#F8FAFC">${list}</div>`;
  await send(p.to, t.eventSubject(p.daysUntil, p.coupleName), shell({ lang, eyebrow: `GUESTCAM · D-${p.daysUntil}`, title: t.eventTitle(p.daysUntil), content, primary: { href: `${APP_URL}/dashboard/${p.albumSlug}`, label: t.eventCta }, footer: t.footer }), `lifecycle-event-d${p.daysUntil}-${p.scopeId}`);
}

export async function sendPostEventEmail(p: { to: string; coupleName: string; photoCount: number; albumSlug: string; locale?: string | null; scopeId: string }) {
  const lang = lifecycleEmailLang(p.locale); const t = COPY[lang];
  const content = `<p style="margin:0 0 14px">${t.afterIntro(p.coupleName, p.photoCount)}</p><p style="margin:0">${t.afterBody}</p>`;
  const reviewHref = `mailto:info@guestcam.si?subject=${encodeURIComponent(`Guestcam review – ${p.coupleName}`)}`;
  await send(p.to, t.afterSubject(p.coupleName), shell({ lang, eyebrow: "GUESTCAM · D+1", title: t.afterTitle, content, primary: { href: `${APP_URL}/dashboard/${p.albumSlug}`, label: t.zipCta }, secondary: { href: reviewHref, label: t.reviewCta }, footer: t.footer }), `lifecycle-after-event-${p.scopeId}`);
}

export async function sendExpiryWarningEmail(p: { to: string; coupleName: string; expiresAt: Date; albumSlug: string; locale?: string | null; scopeId: string }) {
  const lang = lifecycleEmailLang(p.locale); const t = COPY[lang];
  const content = `<p style="margin:0 0 14px">${t.expiryIntro(p.coupleName, formatDate(p.expiresAt, lang))}</p><p style="margin:0">${t.expiryBody}</p>`;
  await send(p.to, t.expirySubject(p.coupleName), shell({ lang, eyebrow: "GUESTCAM · EXPIRY", title: t.expiryTitle, content, primary: { href: `${APP_URL}/dashboard/${p.albumSlug}`, label: t.expiryCta }, secondary: { href: `${APP_URL}/dashboard/${p.albumSlug}/upgrade`, label: t.upgradeCta }, footer: t.footer }), `lifecycle-expiry-${p.scopeId}`);
}
