import Image from "next/image";
import Link from "next/link";
import type { LangCode } from "@/components/LanguageSwitcher";
import { GuestcamTemplatesCarousel } from "@/components/GuestcamTemplatesCarousel";
import { PrintSectionMover } from "@/components/PrintSectionMover";
import { STAND_VARIANTS, eur } from "@/lib/print-service";

export interface PrintShowroomCopy {
  badge: string;
  title: string;
  accentTitle: string;
  body: string;
  bullets: [string, string, string, string];
  cta: string;
  designCta: string;
  note: (price: string) => string;
  woodName: string;
  goldName: string;
  perPiece: string;
  imageAlts: [string, string, string, string];
  statusPhoto: string;
  statusUpload: string;
  statusLive: string;
  statusNew: string;
  trustLine: string;
}

const PRINT_SERVICE: Record<LangCode, { badge: string; title: string; lead: string; bullets: [string, string, string, string]; cta: string }> = {
  sl: {
    badge: "Tisk + namizni podstavki",
    title: "Mi natisnemo. Vi samo postavite na mize.",
    lead: "Naročite fizične QR kartice in namizne podstavke skupaj z Guestcam paketom. Kartice personaliziramo z vašo QR kodo, natisnemo in jih pošljemo pripravljene za vaš dogodek.",
    bullets: ["vaša Guestcam QR koda", "leseni ali zlati podstavek", "tisk je vključen v ceno", "dostava na vaš naslov"],
    cta: "Dodaj podstavke ob nakupu →",
  },
  hr: {
    badge: "Tisak + stolni stalci",
    title: "Mi tiskamo. Vi ih samo postavite na stolove.",
    lead: "Naručite fizičke QR kartice i stolne stalke zajedno s Guestcam paketom. Personaliziramo ih vašim QR kodom, tiskamo i šaljemo spremne za događaj.",
    bullets: ["vaš Guestcam QR kod", "drveni ili zlatni stalak", "tisak uključen u cijenu", "dostava na vašu adresu"],
    cta: "Dodaj stalke pri kupnji →",
  },
  sr: {
    badge: "Štampa + stoni stalci",
    title: "Mi štampamo. Vi ih samo postavite na stolove.",
    lead: "Naručite fizičke QR kartice i stalke za sto zajedno sa Guestcam paketom. Personalizujemo ih vašim QR kodom, štampamo i šaljemo spremne za događaj.",
    bullets: ["vaš Guestcam QR kod", "drveni ili zlatni stalak", "štampa uključena u cenu", "dostava na vašu adresu"],
    cta: "Dodaj stalke pri kupovini →",
  },
  de: {
    badge: "Druck + Tischaufsteller",
    title: "Wir drucken. Sie stellen die Karten nur noch auf.",
    lead: "Bestellen Sie gedruckte QR-Karten und Tischaufsteller zusammen mit Ihrem Guestcam-Paket. Wir personalisieren, drucken und liefern alles fertig für Ihr Event.",
    bullets: ["Ihr Guestcam QR-Code", "Holz- oder Goldaufsteller", "Druck im Preis enthalten", "Lieferung an Ihre Adresse"],
    cta: "Aufsteller bei der Bestellung hinzufügen →",
  },
  en: {
    badge: "Print + table stands",
    title: "We print. You just place them on the tables.",
    lead: "Order physical QR cards and table stands with your Guestcam package. We personalize, print and ship everything ready for your event.",
    bullets: ["your Guestcam QR code", "wood or gold stand", "printing included", "delivery to your address"],
    cta: "Add stands when ordering →",
  },
  es: {
    badge: "Impresión + soportes de mesa",
    title: "Nosotros imprimimos. Tú solo los colocas en las mesas.",
    lead: "Pide tarjetas QR físicas y soportes de mesa con tu paquete Guestcam. Personalizamos, imprimimos y enviamos todo listo para tu evento.",
    bullets: ["tu código QR Guestcam", "soporte de madera o dorado", "impresión incluida", "envío a tu dirección"],
    cta: "Añadir soportes al comprar →",
  },
};

export function PrintShowroom({ copy, lang = "sl" }: { copy: PrintShowroomCopy; lang?: LangCode }) {
  const printedStandFrom = eur(Math.min(...STAND_VARIANTS.map((variant) => variant.unitCents)));
  const detail = PRINT_SERVICE[lang];
  const startHref = `/dashboard/new?lang=${lang}`;

  return (
    <section id="templates" className="border-y border-black/5 bg-[#FFFDF8] py-20 sm:py-24 lg:py-28">
      <PrintSectionMover />
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid items-center gap-5 lg:grid-cols-[auto_1fr_auto]">
          <p className="text-center text-xs font-black uppercase tracking-[.19em] text-[#8F6900] lg:text-left">{copy.badge}</p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-black/52 sm:gap-x-7 sm:text-sm">
            {copy.bullets.map((benefit) => (
              <span key={benefit} className="inline-flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#F4B400] text-[10px] font-black text-[#8F6900]">✓</span>
                {benefit}
              </span>
            ))}
          </div>

          <Link href="#template-showcase" className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#F4B400] bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:bg-[#F4B400] lg:mx-0">
            <span aria-hidden="true">▣</span>
            {copy.designCta}
          </Link>
        </div>

        <div className="mx-auto mt-10 max-w-4xl text-center sm:mt-12">
          <h2 className="font-serif text-[clamp(3.2rem,7vw,6rem)] font-semibold leading-[.94] tracking-[-.05em] text-black">
            {copy.title}
            <span className="mt-2 block italic text-[#B88700]">{copy.accentTitle}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-black/55 sm:text-lg sm:leading-8">{copy.body}</p>
        </div>

        <GuestcamTemplatesCarousel lang={lang} />

        <div className="mt-9 text-center">
          <Link href={startHref} className="inline-flex rounded-full bg-black px-7 py-4 font-black text-white transition-transform hover:scale-[1.02]">
            {copy.cta}
          </Link>
        </div>

        <div id="print-service" className="mt-16 overflow-hidden rounded-[34px] bg-[#151515] text-white shadow-2xl sm:mt-20">
          <div className="grid lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
            <div className="p-7 sm:p-10 lg:p-12">
              <span className="inline-flex rounded-full bg-[#F4B400] px-4 py-2 text-[11px] font-black uppercase tracking-[.14em] text-black">{detail.badge}</span>
              <h3 className="mt-6 max-w-2xl text-3xl font-black leading-[1.04] tracking-[-.04em] sm:text-5xl">{detail.title}</h3>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/58 sm:text-lg sm:leading-8">{detail.lead}</p>
              <div className="mt-7 grid gap-3 text-sm font-semibold text-white/72 sm:grid-cols-2">
                {detail.bullets.map((bullet) => <span key={bullet}>✓ {bullet}</span>)}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={startHref} className="rounded-full bg-[#F4B400] px-7 py-4 text-center font-black text-black">{detail.cta}</Link>
                <span className="text-sm font-semibold text-white/45">{copy.note(printedStandFrom)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/10 p-px">
              {[
                ["/print/stand-wood.webp", copy.woodName, `3,00 € ${copy.perPiece}`],
                ["/print/stand-gold.webp", copy.goldName, `4,50 € ${copy.perPiece}`],
              ].map(([src, name, price]) => (
                <div key={name} className="bg-[#202020] p-3 sm:p-5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white">
                    <Image src={src} alt={`${name} Guestcam QR`} fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
                  </div>
                  <div className="px-1 pb-2 pt-4">
                    <p className="text-sm font-black sm:text-base">{name}</p>
                    <p className="mt-1 text-xs font-semibold text-[#F4B400] sm:text-sm">{price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
