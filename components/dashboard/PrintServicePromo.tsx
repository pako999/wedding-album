import Link from "next/link";
import { STAND_VARIANTS, LEAD_TIME_DAYS, eur } from "@/lib/print-service";
import type { Lang } from "@/lib/i18n/translations";

/**
 * "We'll do the printing for you" offer, shown in the customer's own
 * dashboard next to the DIY print tools.
 *
 * It lives where the DIY work happens on purpose: the moment someone is
 * downloading a QR PNG or picking a print template is exactly when
 * "…or we print and post them to you" is worth reading. Put it only on
 * the upgrade page and it never reaches the people already doing the job
 * by hand.
 *
 * Stands are sold ONLY as part of a plan purchase — there is no
 * standalone order — so the CTA always points at the plan checkout,
 * where the add-on is ticked on. The copy says "add stands to your
 * plan" rather than "order stands" so that condition is visible before
 * the click rather than discovered after it.
 */

interface Props {
  slug: string;
  lang?: Lang;
  /** "banner" is the full-width strip for the print-templates page;
   *  "card" is the compact version for the dashboard grid. */
  variant?: "banner" | "card";
}

interface Copy {
  eyebrow: string;
  title: string;
  body: string;
  bullets: [string, string, string];
  ctaUpgrade: string;
  onlyWithPlan: string;
  priceFrom: (price: string) => string;
  leadTime: (days: number) => string;
}

const COPY: Record<Lang, Copy> = {
  sl: {
    eyebrow: "Polna storitev",
    title: "Ne želite tiskati sami?",
    body: "Oblikujemo, natisnemo in dostavimo QR podstavke za vaše mize — vi jih samo postavite.",
    bullets: ["Tisk na 200 g papir", "Lesen ali zlat podstavek", "Dostava na dom"],
    ctaUpgrade: "Dodaj podstavke k paketu",
    onlyWithPlan: "Na voljo samo ob nakupu paketa.",
    priceFrom: (p) => `že od ${p} na kos · s tiskom in DDV`,
    leadTime: (d) => `Naročite vsaj ${d} dni pred dogodkom. Za krajše roke nas takoj kontaktirajte — preverimo hitrejši tisk in dostavo.`,
  },
  hr: {
    eyebrow: "Puna usluga",
    title: "Ne želite sami tiskati?",
    body: "Oblikujemo, tiskamo i dostavljamo QR stalke za vaše stolove — vi ih samo postavite.",
    bullets: ["Tisak na 200 g papir", "Drveni ili zlatni stalak", "Dostava na kućnu adresu"],
    ctaUpgrade: "Dodaj stalke paketu",
    onlyWithPlan: "Dostupno samo uz kupnju paketa.",
    priceFrom: (p) => `već od ${p} po komadu · s tiskom i PDV-om`,
    leadTime: (d) => `Naručite najmanje ${d} dana prije događaja. Za kraće rokove kontaktirajte nas odmah — provjerit ćemo brži tisak i dostavu.`,
  },
  sr: {
    eyebrow: "Puna usluga",
    title: "Ne želite sami da štampate?",
    body: "Dizajniramo, štampamo i dostavljamo QR stalke za vaše stolove — vi ih samo postavite.",
    bullets: ["Štampa na 200 g papir", "Drveni ili zlatni stalak", "Dostava na kućnu adresu"],
    ctaUpgrade: "Dodaj stalke paketu",
    onlyWithPlan: "Dostupno samo uz kupovinu paketa.",
    priceFrom: (p) => `već od ${p} po komadu · sa štampom i PDV-om`,
    leadTime: (d) => `Naručite najmanje ${d} dana pre događaja. Za kraće rokove kontaktirajte nas odmah — proverićemo bržu štampu i dostavu.`,
  },
  en: {
    eyebrow: "Full service",
    title: "Rather not print it yourself?",
    body: "We design, print and deliver the QR stands for your tables — all you do is put them out.",
    bullets: ["Printed on 200 gsm paper", "Wooden or gold stand", "Delivered to your door"],
    ctaUpgrade: "Add stands to your plan",
    onlyWithPlan: "Available only with a plan purchase.",
    priceFrom: (p) => `from ${p} each · printing and VAT included`,
    leadTime: (d) => `Order at least ${d} days before your event. For anything shorter, contact us straight away — we’ll check express printing and delivery.`,
  },
  de: {
    eyebrow: "Rundum-Service",
    title: "Lieber nicht selbst drucken?",
    body: "Wir gestalten, drucken und liefern die QR-Aufsteller für Ihre Tische — Sie stellen sie nur auf.",
    bullets: ["Druck auf 200-g-Papier", "Holz- oder Gold-Aufsteller", "Lieferung nach Hause"],
    ctaUpgrade: "Aufsteller zum Paket hinzufügen",
    onlyWithPlan: "Nur zusammen mit einem Paket erhältlich.",
    priceFrom: (p) => `ab ${p} pro Stück · inkl. Druck und MwSt.`,
    leadTime: (d) => `Mindestens ${d} Tage vor der Veranstaltung bestellen. Bei kürzeren Fristen kontaktieren Sie uns sofort — wir prüfen Express-Druck und -Versand.`,
  },
  es: {
    eyebrow: "Servicio completo",
    title: "¿Prefieres no imprimirlo tú?",
    body: "Diseñamos, imprimimos y enviamos los soportes QR para tus mesas — tú solo los colocas.",
    bullets: ["Impreso en papel de 200 g", "Soporte de madera o dorado", "Envío a tu domicilio"],
    ctaUpgrade: "Añadir soportes a tu plan",
    onlyWithPlan: "Disponible solo al comprar un plan.",
    priceFrom: (p) => `desde ${p} por unidad · impresión e IVA incluidos`,
    leadTime: (d) => `Pide al menos ${d} días antes de tu evento. Si tienes menos margen, contáctanos de inmediato — comprobaremos impresión y envío urgentes.`,
  },
};

export function PrintServicePromo({ slug, lang = "sl", variant = "banner" }: Props) {
  const c = COPY[lang] ?? COPY.sl;
  const cheapest = Math.min(...STAND_VARIANTS.map((v) => v.unitCents));

  // Always the plan checkout: stands can't be bought on their own.
  const href = `/dashboard/${slug}/upgrade?lang=${lang}#stands`;
  const ctaLabel = c.ctaUpgrade;

  const wood = STAND_VARIANTS.find((v) => v.id === "wood");
  const gold = STAND_VARIANTS.find((v) => v.id === "gold");

  // Both product shots, small — two materials is the thing that makes
  // this feel like a real product rather than a service upsell.
  const thumbs = (
    <div className="flex gap-2 shrink-0">
      {[wood, gold].map((v) =>
        v ? (
          <img
            key={v.id}
            src={v.image}
            alt=""
            width={72}
            height={108}
            loading="lazy"
            className="w-16 h-24 sm:w-20 sm:h-28 object-contain rounded-lg bg-white/70"
          />
        ) : null,
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <div
        className="rounded-2xl border p-5 flex flex-col gap-3"
        style={{ background: "linear-gradient(180deg,#FFF9E8 0%,#FFFFFF 60%)", borderColor: "rgba(255,201,77,0.45)" }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#8F6900] mb-1">
              {c.eyebrow}
            </span>
            <h3 className="font-bold text-gray-900 text-base leading-snug">🖨 {c.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{c.body}</p>
          </div>
          {thumbs}
        </div>
        <p className="text-xs font-semibold text-[#8F6900]">
          {c.priceFrom(eur(cheapest))}
          <span className="block font-normal text-gray-400 mt-0.5">{c.onlyWithPlan}</span>
        </p>
        <p className="flex items-start gap-1.5 text-xs text-[#7A5A12]">
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#8F6900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {c.leadTime(LEAD_TIME_DAYS)}
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[#111111] text-sm font-bold hover:brightness-95 transition-all"
          style={{ background: "linear-gradient(135deg,#FFCC3D,#F4B400 60%,#D69E00)" }}
        >
          {ctaLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="no-print rounded-2xl border-2 p-5 sm:p-6 mb-8"
      style={{
        background: "linear-gradient(120deg,#FFF9E8 0%,#FFFFFF 55%,#FFF9E8 100%)",
        borderColor: "#F4B400",
        boxShadow: "0 0 0 4px rgba(255,201,77,0.12)",
      }}
    >
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {thumbs}
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#8F6900] mb-1">
            {c.eyebrow}
          </span>
          <h2 className="font-bold text-gray-900 text-lg sm:text-xl leading-snug">🖨 {c.title}</h2>
          <p className="text-sm text-gray-600 mt-1.5">{c.body}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
            {c.bullets.map((b) => (
              <li key={b} className="flex items-center gap-1.5 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-1.5 text-xs text-[#7A5A12] mt-3">
            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#8F6900]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {c.leadTime(LEAD_TIME_DAYS)}
          </p>
        </div>
        <div className="w-full sm:w-auto shrink-0 sm:text-right">
          <p className="text-xs font-semibold text-[#8F6900] mb-2">
            {c.priceFrom(eur(cheapest))}
            <span className="block font-normal text-gray-400 mt-0.5">{c.onlyWithPlan}</span>
          </p>
          <Link
            href={href}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[#111111] text-sm font-bold hover:brightness-95 transition-all"
            style={{ background: "linear-gradient(135deg,#FFCC3D,#F4B400 60%,#D69E00)" }}
          >
            {ctaLabel}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
