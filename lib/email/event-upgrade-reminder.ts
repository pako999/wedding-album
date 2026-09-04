import { Resend } from "resend";
import { SITE_URL } from "@/lib/urls";

const FROM = process.env.RESEND_FROM ?? "info@guestcam.si";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;

type Lang = "sl" | "hr" | "sr" | "de" | "en" | "es";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char
  ));
}

const LOCALE_TAG: Record<Lang, string> = {
  sl: "sl-SI", hr: "hr-HR", sr: "sr-Latn", de: "de-DE", en: "en-GB", es: "es-ES",
};

const OFFER_COPY: Record<Lang, {
  subject: (event: string, percent: number) => string;
  title: (percent: number) => string;
  body: string;
  codeLabel: string;
  validUntil: (date: string) => string;
  singleUse: string;
}> = {
  sl: {
    subject: (event, percent) => `${event}: vaših ${percent} % popusta na GuestCam paket`,
    title: (percent) => `Za vas smo pripravili ${percent} % popusta`,
    body: "Posebna ponudba velja za katerikoli GuestCam paket. Nakup zaključite v naslednjih 24 urah; koda je pripravljena samo za vas in se lahko uporabi enkrat.",
    codeLabel: "VAŠA UNIKATNA KODA",
    validUntil: (date) => `Koda velja do ${date}.`,
    singleUse: "Velja za en nakup in je ni mogoče kombinirati z drugimi popusti.",
  },
  hr: {
    subject: (event, percent) => `${event}: vaših ${percent} % popusta na GuestCam paket`,
    title: (percent) => `Pripremili smo vam ${percent} % popusta`,
    body: "Posebna ponuda vrijedi za bilo koji GuestCam paket. Dovršite kupnju u sljedeća 24 sata; kod je pripremljen samo za vas i može se iskoristiti jednom.",
    codeLabel: "VAŠ JEDINSTVENI KOD",
    validUntil: (date) => `Kod vrijedi do ${date}.`,
    singleUse: "Vrijedi za jednu kupnju i ne može se kombinirati s drugim popustima.",
  },
  sr: {
    subject: (event, percent) => `${event}: vaših ${percent} % popusta na GuestCam paket`,
    title: (percent) => `Pripremili smo vam ${percent} % popusta`,
    body: "Posebna ponuda važi za bilo koji GuestCam paket. Završite kupovinu u naredna 24 sata; kod je pripremljen samo za vas i može da se iskoristi jednom.",
    codeLabel: "VAŠ JEDINSTVENI KOD",
    validUntil: (date) => `Kod važi do ${date}.`,
    singleUse: "Važi za jednu kupovinu i ne može se kombinovati sa drugim popustima.",
  },
  de: {
    subject: (event, percent) => `${event}: Ihr persönlicher ${percent}-%-Rabatt für GuestCam`,
    title: (percent) => `${percent} % Rabatt für Sie`,
    body: "Dieses Angebot gilt für jedes GuestCam-Paket. Schließen Sie den Kauf innerhalb der nächsten 24 Stunden ab; der Code wurde nur für Sie erstellt und kann einmal eingelöst werden.",
    codeLabel: "IHR PERSÖNLICHER CODE",
    validUntil: (date) => `Der Code ist bis ${date} gültig.`,
    singleUse: "Gültig für einen Kauf und nicht mit anderen Rabatten kombinierbar.",
  },
  en: {
    subject: (event, percent) => `${event}: your personal ${percent}% GuestCam discount`,
    title: (percent) => `We prepared a ${percent}% discount for you`,
    body: "This offer applies to any GuestCam package. Complete your purchase within the next 24 hours; the code was created just for you and can be redeemed once.",
    codeLabel: "YOUR UNIQUE CODE",
    validUntil: (date) => `The code is valid until ${date}.`,
    singleUse: "Valid for one purchase and cannot be combined with other discounts.",
  },
  es: {
    subject: (event, percent) => `${event}: tu descuento personal del ${percent} % en GuestCam`,
    title: (percent) => `Hemos preparado un ${percent} % de descuento para ti`,
    body: "Esta oferta es válida para cualquier paquete GuestCam. Completa la compra en las próximas 24 horas; el código se ha creado solo para ti y puede utilizarse una vez.",
    codeLabel: "TU CÓDIGO ÚNICO",
    validUntil: (date) => `El código es válido hasta el ${date}.`,
    singleUse: "Válido para una compra y no acumulable con otros descuentos.",
  },
};

interface Copy {
  subject: (days: number, event: string) => string;
  eyebrow: (days: number) => string;
  title: string;
  intro: (event: string, date: string) => string;
  warningTitle: string;
  warningBody: string;
  plansTitle: string;
  basic: string;
  plus: string;
  premium: string;
  recommended: string;
  basicFeatures: string;
  plusFeatures: string;
  premiumFeatures: string;
  cta: string;
  trialNote: string;
  helpTitle: string;
  helpBody: string;
  footer: string;
}

const COPY: Record<Lang, Copy> = {
  sl: {
    subject: (days, event) => `⏰ ${event}: dogodek je čez ${days} ${days === 1 ? "dan" : "dni"} — galerija je še brezplačna`,
    eyebrow: (days) => `DOGODEK ČEZ ${days} ${days === 1 ? "DAN" : "DNI"}`,
    title: "Pred dogodkom preverite omejitev galerije",
    intro: (event, date) => `Vaš dogodek <strong>${event}</strong> je ${date}. Galerija je trenutno še na brezplačnem paketu.`,
    warningTitle: "Trenutni brezplačni paket: največ 20 fotografij",
    warningBody: "Ko bo dosežen limit 20 fotografij, gostje ne bodo mogli dodajati novih fotografij, dokler galerije ne nadgradite. Če pričakujete več gostov, priporočamo nadgradnjo še pred dogodkom.",
    plansTitle: "Izberite prostor za vse spomine",
    basic: "Basic · 39 €",
    plus: "Plus · 49 €",
    premium: "Premium · 99 €",
    recommended: "NAJBOLJ PRILJUBLJEN",
    basicFeatures: "Do 1.000 fotografij · do 10 videov · 3 mesece dostopa",
    plusFeatures: "Do 5.000 fotografij · do 100 videov · 1 leto dostopa · Live galerija",
    premiumFeatures: "Neomejeno fotografij · do 100 videov · 2 leti dostopa · Photo Wall · prioritetna podpora",
    cta: "Nadgradi galerijo →",
    trialNote: "Plačilo je enkratno, brez naročnine. Paket se po plačilu aktivira takoj.",
    helpTitle: "Niste prepričani, kateri paket izbrati?",
    helpBody: "Pišite nam — glede na število gostov in tip dogodka vam priporočimo primeren paket. Če želite pred nakupom preveriti napredne funkcije, nam lahko pišete tudi za testni dostop.",
    footer: "To obvestilo ste prejeli, ker imate aktivno brezplačno Guestcam galerijo z bližajočim se datumom dogodka.",
  },
  hr: {
    subject: (days, event) => `⏰ ${event}: događaj je za ${days} ${days === 1 ? "dan" : "dana"} — galerija je još besplatna`,
    eyebrow: (days) => `DOGAĐAJ ZA ${days} ${days === 1 ? "DAN" : "DANA"}`,
    title: "Prije događaja provjerite ograničenje galerije",
    intro: (event, date) => `Vaš događaj <strong>${event}</strong> je ${date}. Galerija je trenutačno još na besplatnom paketu.`,
    warningTitle: "Trenutni besplatni paket: najviše 20 fotografija",
    warningBody: "Kad se dosegne limit od 20 fotografija, gosti više neće moći dodavati nove fotografije dok ne nadogradite galeriju. Ako očekujete više gostiju, preporučujemo nadogradnju prije događaja.",
    plansTitle: "Odaberite prostor za sve uspomene",
    basic: "Basic · 39 €", plus: "Plus · 49 €", premium: "Premium · 99 €", recommended: "NAJPOPULARNIJI",
    basicFeatures: "Do 1.000 fotografija · do 10 videa · 3 mjeseca pristupa",
    plusFeatures: "Do 5.000 fotografija · do 100 videa · 1 godina pristupa · Live galerija",
    premiumFeatures: "Neograničene fotografije · do 100 videa · 2 godine pristupa · Photo Wall · prioritetna podrška",
    cta: "Nadogradi galeriju →", trialNote: "Jednokratno plaćanje, bez pretplate. Paket se aktivira odmah nakon plaćanja.",
    helpTitle: "Niste sigurni koji paket odabrati?", helpBody: "Pišite nam — prema broju gostiju i vrsti događaja preporučit ćemo vam odgovarajući paket. Možete nas pitati i za testni pristup naprednim funkcijama prije kupnje.",
    footer: "Ovu obavijest primili ste jer imate aktivnu besplatnu Guestcam galeriju s približavajućim datumom događaja.",
  },
  sr: {
    subject: (days, event) => `⏰ ${event}: događaj je za ${days} ${days === 1 ? "dan" : "dana"} — galerija je još besplatna`,
    eyebrow: (days) => `DOGAĐAJ ZA ${days} ${days === 1 ? "DAN" : "DANA"}`,
    title: "Pre događaja proverite ograničenje galerije",
    intro: (event, date) => `Vaš događaj <strong>${event}</strong> je ${date}. Galerija je trenutno još na besplatnom paketu.`,
    warningTitle: "Trenutni besplatni paket: najviše 20 fotografija",
    warningBody: "Kada se dostigne limit od 20 fotografija, gosti više neće moći da dodaju nove fotografije dok ne nadogradite galeriju. Ako očekujete više gostiju, preporučujemo nadogradnju pre događaja.",
    plansTitle: "Izaberite prostor za sve uspomene",
    basic: "Basic · 39 €", plus: "Plus · 49 €", premium: "Premium · 99 €", recommended: "NAJPOPULARNIJI",
    basicFeatures: "Do 1.000 fotografija · do 10 videa · 3 meseca pristupa",
    plusFeatures: "Do 5.000 fotografija · do 100 videa · 1 godina pristupa · Live galerija",
    premiumFeatures: "Neograničene fotografije · do 100 videa · 2 godine pristupa · Photo Wall · prioritetna podrška",
    cta: "Nadogradi galeriju →", trialNote: "Jednokratno plaćanje, bez pretplate. Paket se aktivira odmah nakon plaćanja.",
    helpTitle: "Niste sigurni koji paket da izaberete?", helpBody: "Pišite nam — prema broju gostiju i vrsti događaja preporučićemo odgovarajući paket. Možete nas pitati i za testni pristup naprednim funkcijama pre kupovine.",
    footer: "Ovo obaveštenje ste dobili jer imate aktivnu besplatnu Guestcam galeriju sa datumom događaja koji se približava.",
  },
  de: {
    subject: (days, event) => `⏰ ${event}: Noch ${days} ${days === 1 ? "Tag" : "Tage"} — Ihre Galerie ist noch kostenlos`,
    eyebrow: (days) => `NOCH ${days} ${days === 1 ? "TAG" : "TAGE"}`,
    title: "Prüfen Sie vor dem Event das Galerie-Limit",
    intro: (event, date) => `Ihr Event <strong>${event}</strong> findet am ${date} statt. Ihre Galerie nutzt derzeit noch den kostenlosen Tarif.`,
    warningTitle: "Aktueller Gratis-Tarif: maximal 20 Fotos",
    warningBody: "Sobald das Limit von 20 Fotos erreicht ist, können Gäste keine weiteren Fotos hochladen, bis Sie die Galerie upgraden. Wenn Sie mehr Gäste erwarten, empfehlen wir das Upgrade vor dem Event.",
    plansTitle: "Genug Platz für alle Erinnerungen",
    basic: "Basic · 39 €", plus: "Plus · 49 €", premium: "Premium · 99 €", recommended: "AM BELIEBTESTEN",
    basicFeatures: "Bis 1.000 Fotos · bis 10 Videos · 3 Monate Zugriff",
    plusFeatures: "Bis 5.000 Fotos · bis 100 Videos · 1 Jahr Zugriff · Live-Galerie",
    premiumFeatures: "Unbegrenzte Fotos · bis 100 Videos · 2 Jahre Zugriff · Photo Wall · Priority-Support",
    cta: "Galerie upgraden →", trialNote: "Einmalige Zahlung, kein Abo. Der Tarif wird nach der Zahlung sofort aktiviert.",
    helpTitle: "Nicht sicher, welcher Tarif passt?", helpBody: "Schreiben Sie uns — anhand der Gästezahl und der Art des Events empfehlen wir den passenden Tarif. Sie können uns vor dem Kauf auch nach einem Testzugang für erweiterte Funktionen fragen.",
    footer: "Sie erhalten diese Nachricht, weil Sie eine aktive kostenlose Guestcam-Galerie mit bevorstehendem Eventdatum haben.",
  },
  en: {
    subject: (days, event) => `⏰ ${event}: ${days} ${days === 1 ? "day" : "days"} to go — your gallery is still on Free`,
    eyebrow: (days) => `${days} ${days === 1 ? "DAY" : "DAYS"} TO YOUR EVENT`,
    title: "Check your gallery limit before the event",
    intro: (event, date) => `Your event <strong>${event}</strong> is on ${date}. Your gallery is still on the Free plan.`,
    warningTitle: "Your current Free plan: maximum 20 photos",
    warningBody: "Once the 20-photo limit is reached, guests will not be able to add more photos until the gallery is upgraded. If you expect more guests, we recommend upgrading before the event.",
    plansTitle: "Make room for every memory",
    basic: "Basic · €39", plus: "Plus · €49", premium: "Premium · €99", recommended: "MOST POPULAR",
    basicFeatures: "Up to 1,000 photos · up to 10 videos · 3 months access",
    plusFeatures: "Up to 5,000 photos · up to 100 videos · 1 year access · Live gallery",
    premiumFeatures: "Unlimited photos · up to 100 videos · 2 years access · Photo Wall · priority support",
    cta: "Upgrade gallery →", trialNote: "One-time payment, no subscription. Your plan is activated immediately after payment.",
    helpTitle: "Not sure which plan is right?", helpBody: "Message us — based on your guest count and event type, we'll recommend the right plan. You can also ask us for test access to advanced features before purchasing.",
    footer: "You received this service notice because you have an active Free Guestcam gallery with an upcoming event date.",
  },
  es: {
    subject: (days, event) => `⏰ ${event}: faltan ${days} ${days === 1 ? "día" : "días"} — tu galería sigue en Free`,
    eyebrow: (days) => `FALTAN ${days} ${days === 1 ? "DÍA" : "DÍAS"}`,
    title: "Revisa el límite de tu galería antes del evento",
    intro: (event, date) => `Tu evento <strong>${event}</strong> es el ${date}. Tu galería todavía utiliza el plan gratuito.`,
    warningTitle: "Plan gratuito actual: máximo 20 fotos",
    warningBody: "Cuando se alcance el límite de 20 fotos, los invitados no podrán añadir más hasta que mejores la galería. Si esperas más invitados, te recomendamos mejorarla antes del evento.",
    plansTitle: "Haz sitio para todos los recuerdos",
    basic: "Basic · 39 €", plus: "Plus · 49 €", premium: "Premium · 99 €", recommended: "MÁS POPULAR",
    basicFeatures: "Hasta 1.000 fotos · hasta 10 vídeos · 3 meses de acceso",
    plusFeatures: "Hasta 5.000 fotos · hasta 100 vídeos · 1 año de acceso · Galería Live",
    premiumFeatures: "Fotos ilimitadas · hasta 100 vídeos · 2 años de acceso · Photo Wall · soporte prioritario",
    cta: "Mejorar galería →", trialNote: "Pago único, sin suscripción. El plan se activa inmediatamente después del pago.",
    helpTitle: "¿No sabes qué plan elegir?", helpBody: "Escríbenos — según el número de invitados y el tipo de evento te recomendaremos el plan adecuado. También puedes pedir acceso de prueba a las funciones avanzadas antes de comprar.",
    footer: "Has recibido este aviso porque tienes una galería Guestcam gratuita activa con una fecha de evento próxima.",
  },
};

export interface EventUpgradeReminderFields {
  coupleName: string;
  eventDate: string;
  albumSlug: string;
  daysUntil: number;
  locale?: string | null;
  discountCode: string;
  discountPercent: number;
  discountExpiresAt: Date;
}

function pickLang(locale?: string | null): Lang {
  return locale && locale in COPY ? locale as Lang : "sl";
}

export function eventUpgradeReminderEmailHtml(fields: EventUpgradeReminderFields): string {
  const lang = pickLang(fields.locale);
  const t = COPY[lang];
  const offer = OFFER_COPY[lang];
  const eventName = escapeHtml(fields.coupleName);
  const parsedDate = new Date(`${fields.eventDate}T12:00:00Z`);
  const eventDate = Number.isNaN(parsedDate.getTime())
    ? escapeHtml(fields.eventDate)
    : parsedDate.toLocaleDateString(LOCALE_TAG[lang], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const discountCode = escapeHtml(fields.discountCode);
  const discountQuery = `&discount=${encodeURIComponent(fields.discountCode)}`;
  const upgradeUrl = `${APP_URL}/dashboard/${encodeURIComponent(fields.albumSlug)}/upgrade?plan=plus${discountQuery}`;
  const basicUrl = `${APP_URL}/dashboard/${encodeURIComponent(fields.albumSlug)}/upgrade?plan=basic${discountQuery}`;
  const premiumUrl = `${APP_URL}/dashboard/${encodeURIComponent(fields.albumSlug)}/upgrade?plan=premium${discountQuery}`;
  const discountExpiry = fields.discountExpiresAt.toLocaleString(LOCALE_TAG[lang], {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Ljubljana",
  });
  const whatsappUrl = "https://wa.me/38641580250";

  const planRow = (name: string, features: string, href: string, highlighted = false) => `
    <tr><td style="padding:0 0 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:${highlighted ? "2px solid #FFC94D" : "1px solid #E5E7EB"};border-radius:13px;background:${highlighted ? "#FFF9E8" : "#FFFFFF"};">
        <tr><td style="padding:17px 18px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
            <td style="vertical-align:top;padding-right:12px;">
              ${highlighted ? `<p style="margin:0 0 4px;font-size:10px;font-weight:800;letter-spacing:1.4px;color:#A66A00;">${t.recommended}</p>` : ""}
              <p style="margin:0 0 5px;font-size:16px;font-weight:800;color:#111827;">${name}</p>
              <p style="margin:0;font-size:13px;line-height:1.55;color:#64748B;">${features}</p>
            </td>
            <td align="right" style="vertical-align:middle;white-space:nowrap;">
              <a href="${href}" style="display:inline-block;padding:10px 13px;border-radius:9px;background:${highlighted ? "#FFC94D" : "#111827"};color:${highlighted ? "#111827" : "#FFFFFF"};text-decoration:none;font-size:12px;font-weight:800;">${t.cta}</a>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#F4F5F7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F4F5F7;padding:28px 14px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #E5E7EB;">
        <tr><td style="background:#111827;padding:28px 32px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:2.4px;color:#FFC94D;font-weight:800;">${t.eyebrow(fields.daysUntil)}</p>
          <h1 style="margin:0;font-size:25px;line-height:1.25;color:#FFFFFF;font-weight:800;">${t.title}</h1>
        </td></tr>
        <tr><td style="padding:28px 32px 0;">
          <p style="margin:0;font-size:15px;line-height:1.7;color:#4B5563;">${t.intro(eventName, eventDate)}</p>
        </td></tr>
        <tr><td style="padding:22px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFF9E8;border:2px solid #FFC94D;border-radius:14px;">
            <tr><td style="padding:22px;text-align:center;">
              <h2 style="margin:0 0 9px;font-size:21px;color:#111827;">${offer.title(fields.discountPercent)}</h2>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#4B5563;">${offer.body}</p>
              <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:1.7px;color:#A66A00;">${offer.codeLabel}</p>
              <p style="margin:0 0 12px;font-family:'Courier New',monospace;font-size:25px;font-weight:800;letter-spacing:2px;color:#111827;">${discountCode}</p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#7C5A18;">${offer.validUntil(discountExpiry)}<br />${offer.singleUse}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:22px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFF4F2;border:1px solid #FFD1CA;border-radius:14px;">
            <tr><td style="padding:19px 21px;">
              <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#9F2D20;">⚠️ ${t.warningTitle}</p>
              <p style="margin:0;font-size:13.5px;line-height:1.65;color:#6B4A45;">${t.warningBody}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:28px 32px 0;">
          <h2 style="margin:0 0 15px;font-size:18px;font-weight:800;color:#111827;">${t.plansTitle}</h2>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${planRow(t.basic, t.basicFeatures, basicUrl)}
            ${planRow(t.plus, t.plusFeatures, upgradeUrl, true)}
            ${planRow(t.premium, t.premiumFeatures, premiumUrl)}
          </table>
          <p style="margin:4px 0 0;text-align:center;font-size:12px;color:#7C8593;">${t.trialNote}</p>
        </td></tr>
        <tr><td style="padding:28px 32px 0;text-align:center;">
          <a href="${upgradeUrl}" style="display:inline-block;padding:15px 28px;border-radius:11px;background:#FFC94D;color:#111827;text-decoration:none;font-size:15px;font-weight:800;">${t.cta}</a>
        </td></tr>
        <tr><td style="padding:28px 32px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F7F8FA;border-radius:14px;border:1px solid #E5E7EB;">
            <tr><td style="padding:19px 21px;">
              <p style="margin:0 0 7px;font-size:15px;font-weight:800;color:#111827;">${t.helpTitle}</p>
              <p style="margin:0 0 13px;font-size:13.5px;line-height:1.65;color:#64748B;">${t.helpBody}</p>
              <p style="margin:0;font-size:13px;line-height:1.8;color:#111827;">
                ✉️ <a href="mailto:info@guestcam.si" style="color:#A66A00;text-decoration:none;font-weight:700;">info@guestcam.si</a><br />
                💬 <a href="${whatsappUrl}" style="color:#A66A00;text-decoration:none;font-weight:700;">WhatsApp +386 41 580 250</a>
              </p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F8FAFC;padding:17px 28px;text-align:center;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:10.5px;line-height:1.6;color:#94A3B8;">${t.footer}<br />Guestcam · Sport group d.o.o. · Slovenia</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEventUpgradeReminderEmail(params: EventUpgradeReminderFields & { to: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured for event upgrade reminder");
  }
  const lang = pickLang(params.locale);
  await new Resend(apiKey).emails.send({
    from: `Guestcam <${FROM}>`,
    replyTo: "info@guestcam.si",
    to: params.to,
    subject: OFFER_COPY[lang].subject(params.coupleName, params.discountPercent),
    html: eventUpgradeReminderEmailHtml(params),
  }).then(({ error }) => {
    if (error) throw new Error(`Resend rejected event offer: ${error.message}`);
  });
}
