import { SITE_URL, localizedAccountPath } from "@/lib/urls";
import {
  shell,
  send,
  escapeHtml,
  formatDate,
  lifecycleEmailLang,
  type LifecycleEmailLang,
} from "@/lib/email/lifecycle-reminders";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;

/**
 * Black Friday 2026 promotional campaign — one-time blast to registered users.
 *
 * Marketing email (not transactional): it carries an unsubscribe link and the
 * caller MUST skip contacts suppressed in `marketing_contacts`. The discount
 * code it advertises is the one seeded in lib/db/migrations.ts (BLACKFRIDAY,
 * 30% off, applied at checkout via validateDiscount).
 */

interface Copy {
  subject: string;
  eyebrow: string;
  title: string;
  greeting: (name?: string | null) => string;
  intro: string;
  codeLabel: string;
  validity: string;
  cta: string;
  footer: string;
  unsubscribe: string;
}

const COPY: Record<LifecycleEmailLang, Copy> = {
  sl: {
    subject: "🖤 Black Friday: −30 % na vse pakete Guestcam",
    eyebrow: "GUESTCAM · BLACK FRIDAY",
    title: "−30 % na vse pakete",
    greeting: (name) => (name ? `Pozdravljeni, ${name}!` : "Pozdravljeni!"),
    intro:
      "Ta teden praznujemo Black Friday in z vami delimo 30 % popust na vse Guestcam pakete. Ustvarite galerijo za svoj dogodek, kjer gostje nalagajo fotografije in videe prek QR kode — brez nameščanja aplikacij.",
    codeLabel: "VAŠA KODA",
    validity: "Vnesite kodo pri nakupu. Ponudba velja do",
    cta: "Izkoristi −30 %",
    footer: "Prejeli ste to sporočilo, ker imate račun pri Guestcam.",
    unsubscribe: "Odjava od ponudb",
  },
  hr: {
    subject: "🖤 Black Friday: −30 % na sve pakete Guestcam",
    eyebrow: "GUESTCAM · BLACK FRIDAY",
    title: "−30 % na sve pakete",
    greeting: (name) => (name ? `Pozdrav, ${name}!` : "Pozdrav!"),
    intro:
      "Ovaj tjedan slavimo Black Friday i dijelimo s vama 30 % popusta na sve Guestcam pakete. Napravite galeriju za svoj događaj gdje gosti učitavaju fotografije i videe putem QR koda — bez instaliranja aplikacija.",
    codeLabel: "VAŠ KOD",
    validity: "Unesite kod pri kupnji. Ponuda vrijedi do",
    cta: "Iskoristi −30 %",
    footer: "Primili ste ovu poruku jer imate račun na Guestcamu.",
    unsubscribe: "Odjava od ponuda",
  },
  sr: {
    subject: "🖤 Black Friday: −30 % na sve pakete Guestcam",
    eyebrow: "GUESTCAM · BLACK FRIDAY",
    title: "−30 % na sve pakete",
    greeting: (name) => (name ? `Pozdrav, ${name}!` : "Pozdrav!"),
    intro:
      "Ove nedelje slavimo Black Friday i delimo sa vama 30 % popusta na sve Guestcam pakete. Napravite galeriju za svoj događaj gde gosti otpremaju fotografije i snimke putem QR koda — bez instaliranja aplikacija.",
    codeLabel: "VAŠ KOD",
    validity: "Unesite kod pri kupovini. Ponuda važi do",
    cta: "Iskoristi −30 %",
    footer: "Primili ste ovu poruku jer imate nalog na Guestcamu.",
    unsubscribe: "Odjava od ponuda",
  },
  de: {
    subject: "🖤 Black Friday: −30 % auf alle Guestcam-Pakete",
    eyebrow: "GUESTCAM · BLACK FRIDAY",
    title: "−30 % auf alle Pakete",
    greeting: (name) => (name ? `Hallo ${name}!` : "Hallo!"),
    intro:
      "Diese Woche feiern wir Black Friday und schenken Ihnen 30 % Rabatt auf alle Guestcam-Pakete. Erstellen Sie eine Galerie für Ihre Veranstaltung, in die Gäste Fotos und Videos per QR-Code hochladen — ganz ohne App.",
    codeLabel: "IHR CODE",
    validity: "Code beim Kauf eingeben. Angebot gültig bis",
    cta: "−30 % sichern",
    footer: "Sie erhalten diese E-Mail, weil Sie ein Guestcam-Konto haben.",
    unsubscribe: "Keine Angebote mehr",
  },
  en: {
    subject: "🖤 Black Friday: −30% on every Guestcam plan",
    eyebrow: "GUESTCAM · BLACK FRIDAY",
    title: "−30% on every plan",
    greeting: (name) => (name ? `Hi ${name}!` : "Hi there!"),
    intro:
      "We're celebrating Black Friday this week with 30% off every Guestcam plan. Create a gallery for your event where guests upload photos and videos via a QR code — no apps to install.",
    codeLabel: "YOUR CODE",
    validity: "Enter the code at checkout. Offer valid until",
    cta: "Get −30%",
    footer: "You're receiving this because you have a Guestcam account.",
    unsubscribe: "Unsubscribe from offers",
  },
  es: {
    subject: "🖤 Black Friday: −30 % en todos los planes Guestcam",
    eyebrow: "GUESTCAM · BLACK FRIDAY",
    title: "−30 % en todos los planes",
    greeting: (name) => (name ? `¡Hola, ${name}!` : "¡Hola!"),
    intro:
      "Esta semana celebramos el Black Friday con un 30 % de descuento en todos los planes de Guestcam. Crea una galería para tu evento donde los invitados suben fotos y vídeos mediante un código QR — sin instalar aplicaciones.",
    codeLabel: "TU CÓDIGO",
    validity: "Introduce el código al pagar. Oferta válida hasta el",
    cta: "Conseguir −30 %",
    footer: "Recibes este correo porque tienes una cuenta en Guestcam.",
    unsubscribe: "Cancelar ofertas",
  },
};

export interface BlackFridayEmailParams {
  to: string;
  firstName?: string | null;
  locale?: string | null;
  code: string;
  expiresAt: Date;
  unsubscribeToken: string;
  /** Stable key for Resend idempotency (e.g. the Clerk user id). */
  scopeId: string;
}

export async function sendBlackFridayEmail(p: BlackFridayEmailParams): Promise<void> {
  const lang = lifecycleEmailLang(p.locale);
  const t = COPY[lang];
  const href = `${APP_URL}${localizedAccountPath(lang, "/dashboard/new")}`;
  const unsubHref = `${APP_URL}/api/unsubscribe/${encodeURIComponent(p.unsubscribeToken)}`;

  const content = `
    <p style="margin:0 0 18px">${t.intro}</p>
    <div style="padding:20px;text-align:center;border:1px solid #FFE08A;border-radius:14px;background:#FFF9E8">
      <div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#A66A00">${t.codeLabel}</div>
      <div style="margin:8px 0;font-size:28px;font-weight:900;letter-spacing:2px;color:#0F1729">${escapeHtml(p.code)}</div>
      <div style="font-size:12px;color:#64748B">${t.validity} ${formatDate(p.expiresAt, lang)}</div>
    </div>`;

  await send(
    p.to,
    t.subject,
    shell({
      lang,
      eyebrow: t.eyebrow,
      title: t.title,
      greeting: t.greeting(p.firstName),
      content,
      primary: { href, label: t.cta },
      footer: t.footer,
      unsubscribe: { href: unsubHref, label: t.unsubscribe },
    }),
    `blackfriday-2026-${p.scopeId}`,
  );
}
