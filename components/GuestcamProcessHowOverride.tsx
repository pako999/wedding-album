"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

type Lang = "sl" | "hr" | "sr" | "de" | "en" | "es";

type Step = {
  no: string;
  title: string;
  text: string;
  src: string;
  alt: string;
};

type Copy = {
  label: string;
  headingLine1: string;
  headingLine2: string;
  intro: string;
  cta: string;
  steps: Step[];
};

const STEP_IMAGES = [
  "/how/guestcam-step-1-event.webp?v=6",
  "/how/guestcam-step-2-details.webp?v=6",
  "/how/guestcam-step-3-qr.webp?v=6",
] as const;

const COPY: Record<Lang, Copy> = {
  sl: {
    label: "Kako deluje",
    headingLine1: "Enostavno za vas,",
    headingLine2: "preprosto za goste",
    intro: "V manj kot dveh minutah ustvarite zasebno galerijo, kjer se bodo zbirale vse fotografije in videi vašega dogodka.",
    cta: "Ustvari svojo galerijo zdaj",
    steps: [
      { no: "1", title: "Izberite dogodek", text: "Izberite vrsto dogodka, za katerega ustvarjate galerijo.", src: STEP_IMAGES[0], alt: "Guestcam izbira vrste dogodka pri ustvarjanju nove galerije" },
      { no: "2", title: "Vnesite podatke", text: "Vnesite osnovne podatke in galerija bo pripravljena v manj kot dveh minutah.", src: STEP_IMAGES[1], alt: "Guestcam vnos podatkov za galerijo dogodka" },
      { no: "3", title: "Delite QR kodo", text: "Gostje skenirajo QR kodo — brez aplikacije in brez prijave — ter začnejo deliti fotografije.", src: STEP_IMAGES[2], alt: "Guestcam QR koda, ki jo gostje skenirajo za nalaganje fotografij" },
    ],
  },
  hr: {
    label: "Kako funkcionira",
    headingLine1: "Jednostavno za vas,",
    headingLine2: "jednostavno za goste",
    intro: "U manje od dvije minute izradite privatnu galeriju u kojoj će se prikupljati sve fotografije i videozapisi s vašeg događaja.",
    cta: "Izradite svoju galeriju sada",
    steps: [
      { no: "1", title: "Odaberite događaj", text: "Odaberite vrstu događaja za koji izrađujete galeriju.", src: STEP_IMAGES[0], alt: "Guestcam odabir vrste događaja pri izradi nove galerije" },
      { no: "2", title: "Unesite podatke", text: "Unesite osnovne podatke i galerija će biti spremna za manje od dvije minute.", src: STEP_IMAGES[1], alt: "Guestcam unos podataka za galeriju događaja" },
      { no: "3", title: "Podijelite QR kod", text: "Gosti skeniraju QR kod — bez aplikacije i registracije — i odmah počinju dijeliti fotografije.", src: STEP_IMAGES[2], alt: "Guestcam QR kod koji gosti skeniraju za prijenos fotografija" },
    ],
  },
  sr: {
    label: "Kako funkcioniše",
    headingLine1: "Jednostavno za vas,",
    headingLine2: "jednostavno za goste",
    intro: "Za manje od dva minuta napravite privatnu galeriju u kojoj će se prikupljati sve fotografije i video-snimci sa vašeg događaja.",
    cta: "Napravite svoju galeriju sada",
    steps: [
      { no: "1", title: "Izaberite događaj", text: "Izaberite vrstu događaja za koji pravite galeriju.", src: STEP_IMAGES[0], alt: "Guestcam izbor vrste događaja pri pravljenju nove galerije" },
      { no: "2", title: "Unesite podatke", text: "Unesite osnovne podatke i galerija će biti spremna za manje od dva minuta.", src: STEP_IMAGES[1], alt: "Guestcam unos podataka za galeriju događaja" },
      { no: "3", title: "Podelite QR kod", text: "Gosti skeniraju QR kod — bez aplikacije i prijave — i odmah počinju da dele fotografije.", src: STEP_IMAGES[2], alt: "Guestcam QR kod koji gosti skeniraju za otpremanje fotografija" },
    ],
  },
  de: {
    label: "So funktioniert's",
    headingLine1: "Einfach für Sie,",
    headingLine2: "einfach für Ihre Gäste",
    intro: "Erstellen Sie in weniger als zwei Minuten eine private Galerie, in der alle Fotos und Videos Ihrer Veranstaltung gesammelt werden.",
    cta: "Galerie jetzt erstellen",
    steps: [
      { no: "1", title: "Event auswählen", text: "Wählen Sie die Art der Veranstaltung, für die Sie eine Galerie erstellen.", src: STEP_IMAGES[0], alt: "Guestcam Auswahl der Veranstaltungsart beim Erstellen einer neuen Galerie" },
      { no: "2", title: "Daten eingeben", text: "Geben Sie die wichtigsten Daten ein — Ihre Galerie ist in weniger als zwei Minuten bereit.", src: STEP_IMAGES[1], alt: "Guestcam Eingabe der Veranstaltungsdaten für eine Galerie" },
      { no: "3", title: "QR-Code teilen", text: "Ihre Gäste scannen den QR-Code — ohne App und ohne Anmeldung — und teilen sofort ihre Fotos.", src: STEP_IMAGES[2], alt: "Guestcam QR-Code zum Hochladen von Gästefotos" },
    ],
  },
  en: {
    label: "How it works",
    headingLine1: "Simple for you,",
    headingLine2: "effortless for your guests",
    intro: "Create a private gallery in under two minutes where all photos and videos from your event are collected in one place.",
    cta: "Create your gallery now",
    steps: [
      { no: "1", title: "Choose your event", text: "Choose the type of event you are creating the gallery for.", src: STEP_IMAGES[0], alt: "Guestcam event type selection when creating a new gallery" },
      { no: "2", title: "Add event details", text: "Enter the basic details and your gallery will be ready in under two minutes.", src: STEP_IMAGES[1], alt: "Guestcam event details form for creating a gallery" },
      { no: "3", title: "Share the QR code", text: "Guests scan the QR code — no app and no sign-up — and start sharing photos right away.", src: STEP_IMAGES[2], alt: "Guestcam QR code guests scan to upload event photos" },
    ],
  },
  es: {
    label: "Cómo funciona",
    headingLine1: "Fácil para ti,",
    headingLine2: "fácil para tus invitados",
    intro: "Crea en menos de dos minutos una galería privada donde se reunirán todas las fotos y vídeos de tu evento.",
    cta: "Crea tu galería ahora",
    steps: [
      { no: "1", title: "Elige el evento", text: "Elige el tipo de evento para el que quieres crear la galería.", src: STEP_IMAGES[0], alt: "Selección del tipo de evento en Guestcam al crear una nueva galería" },
      { no: "2", title: "Añade los datos", text: "Introduce los datos básicos y tu galería estará lista en menos de dos minutos.", src: STEP_IMAGES[1], alt: "Formulario de datos del evento en Guestcam para crear una galería" },
      { no: "3", title: "Comparte el código QR", text: "Los invitados escanean el QR — sin app y sin registro — y empiezan a compartir fotos al instante.", src: STEP_IMAGES[2], alt: "Código QR de Guestcam que los invitados escanean para subir fotos" },
    ],
  },
};

function homeLang(pathname: string): Lang | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "sl";
  const match = path.match(/^\/(hr|sr|de|en|es)$/);
  return match ? match[1] as Lang : null;
}

export function GuestcamProcessHowOverride() {
  const pathname = usePathname();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [lang, setLang] = useState<Lang>("sl");

  useEffect(() => {
    setTarget(null);
    const detected = homeLang(pathname);
    if (!detected) return;
    setLang(detected);
    setTarget(document.getElementById("how"));
  }, [pathname]);

  const copy = useMemo(() => COPY[lang], [lang]);

  if (!target) return null;

  return createPortal(
    <div className="guestcam-process-replacement mx-auto max-w-[1240px] px-5 sm:px-8">
      <style>{`#how > :not(.guestcam-process-replacement){display:none!important}#how{padding-top:6rem!important;padding-bottom:6rem!important;background:#F7F5F1!important}@media(min-width:768px){#how{padding-top:7rem!important;padding-bottom:7rem!important}}`}</style>
      <div className="mx-auto max-w-[820px] text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9A6A16]">{copy.label}</p>
        <h2 className="mt-4 text-[clamp(2.35rem,5vw,4.3rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-[#171A20]">
          {copy.headingLine1}<br />{copy.headingLine2}
        </h2>
        <p className="mx-auto mt-6 max-w-[700px] text-base leading-7 text-[#6E7480] sm:text-lg sm:leading-8">{copy.intro}</p>
      </div>

      <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-9">
        {copy.steps.map((step, index) => (
          <div key={step.no} className="relative min-w-0">
            <article className="h-full overflow-hidden rounded-[22px] border border-black/[0.08] bg-white shadow-[0_12px_35px_rgba(22,26,32,0.06)]">
              <div className="px-6 pb-5 pt-6 text-center sm:px-7">
                <div className="flex items-center justify-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0C8] text-sm font-extrabold text-[#A96C00]">{step.no}.</span>
                  <h3 className="text-xl font-extrabold tracking-[-0.02em] text-[#171A20]">{step.title}</h3>
                </div>
                <p className="mx-auto mt-3 max-w-[290px] text-sm leading-6 text-[#747A86]">{step.text}</p>
              </div>
              <div className="border-t border-black/[0.06] bg-[#FAF9F7] p-3 sm:p-4">
                <div className="flex min-h-[360px] items-start justify-center overflow-hidden rounded-[15px] border border-black/[0.06] bg-white sm:min-h-[410px]">
                  <img src={step.src} alt={step.alt} loading="lazy" decoding="async" className="block h-auto max-h-[430px] w-full object-contain object-top" />
                </div>
              </div>
            </article>
            {index < copy.steps.length - 1 && (
              <div className="absolute -right-[28px] top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#F7F5F1] bg-[#F4B400] text-lg font-bold text-white md:flex" aria-hidden="true">→</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 text-center sm:mt-12">
        <a href="/dashboard/new" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#171A20] px-7 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 sm:text-base">
          {copy.cta} <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>,
    target,
  );
}
