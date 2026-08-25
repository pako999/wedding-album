"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LangCode } from "@/components/LanguageSwitcher";

const ASSET_BASE = "https://camlove.me/templates";
const SLIDES = [
  `${ASSET_BASE}/showcase-card-hand.webp`,
  `${ASSET_BASE}/showcase-phone-upload.webp`,
  `${ASSET_BASE}/showcase-table-sign.webp`,
  `${ASSET_BASE}/showcase-phone-gallery.webp`,
] as const;

type CarouselCopy = {
  alts: readonly [string, string, string, string];
  uploadedTitle: string;
  uploadedDetail: string;
  slideshowTitle: string;
  slideshowDetail: string;
  completeTitle: string;
  completeDetail: string;
  newPhotoTitle: string;
  newPhotoDetail: string;
  scan: string;
  previous: string;
  next: string;
  choose: string;
  showImage: (index: number) => string;
  trust: readonly [string, string, string];
};

const COPY: Record<LangCode, CarouselCopy> = {
  sl: {
    alts: [
      "Guestcam QR kartica v roki na poročnem dogodku",
      "Guestcam nalaganje poročne fotografije na telefonu",
      "Guestcam QR kartica v namiznem podstavku med poročno dekoracijo",
      "Guestcam galerija poročnih fotografij na telefonu",
    ],
    uploadedTitle: "328 naloženih fotografij",
    uploadedDetail: "in še prihajajo!",
    slideshowTitle: "Slideshow v živo",
    slideshowDetail: "Vsi uživajo!",
    completeTitle: "Nalaganje končano!",
    completeDetail: "Hvala!",
    newPhotoTitle: "Nova slika dodana",
    newPhotoDetail: "Čudovit trenutek ujet.",
    scan: "Skeniraj in deli",
    previous: "Prejšnja slika",
    next: "Naslednja slika",
    choose: "Izbira slike",
    showImage: (index) => `Pokaži sliko ${index}`,
    trust: ["Ustvarjeno za prave trenutke", "Priljubljeno med pari", "Zasebno in varno"],
  },
  hr: {
    alts: [
      "Guestcam QR kartica u ruci na vjenčanju",
      "Učitavanje fotografije u Guestcam s telefona",
      "Guestcam QR kartica na stalku za stol",
      "Guestcam galerija fotografija na telefonu",
    ],
    uploadedTitle: "328 učitanih fotografija",
    uploadedDetail: "i još stižu!",
    slideshowTitle: "Slideshow je uživo",
    slideshowDetail: "Svi uživaju!",
    completeTitle: "Učitavanje završeno!",
    completeDetail: "Hvala!",
    newPhotoTitle: "Nova fotografija dodana",
    newPhotoDetail: "Predivan trenutak zabilježen.",
    scan: "Skeniraj i podijeli",
    previous: "Prethodna fotografija",
    next: "Sljedeća fotografija",
    choose: "Odabir fotografije",
    showImage: (index) => `Prikaži fotografiju ${index}`,
    trust: ["Stvoreno za stvarne trenutke", "Omiljeno među parovima", "Privatno i sigurno"],
  },
  sr: {
    alts: [
      "Guestcam QR kartica u ruci na venčanju",
      "Otpremanje fotografije u Guestcam sa telefona",
      "Guestcam QR kartica na stalku za sto",
      "Guestcam galerija fotografija na telefonu",
    ],
    uploadedTitle: "328 poslatih fotografija",
    uploadedDetail: "i još stižu!",
    slideshowTitle: "Slideshow je uživo",
    slideshowDetail: "Svi uživaju!",
    completeTitle: "Otpremanje završeno!",
    completeDetail: "Hvala!",
    newPhotoTitle: "Nova fotografija dodata",
    newPhotoDetail: "Prelep trenutak zabeležen.",
    scan: "Skeniraj i podeli",
    previous: "Prethodna fotografija",
    next: "Sledeća fotografija",
    choose: "Izbor fotografije",
    showImage: (index) => `Prikaži fotografiju ${index}`,
    trust: ["Napravljeno za prave trenutke", "Omiljeno među parovima", "Privatno i sigurno"],
  },
  de: {
    alts: [
      "Guestcam QR-Karte in der Hand bei einer Hochzeit",
      "Foto-Upload zu Guestcam auf einem Smartphone",
      "Guestcam QR-Tischkarte bei einer Hochzeitsfeier",
      "Guestcam Fotogalerie auf einem Smartphone",
    ],
    uploadedTitle: "328 Fotos hochgeladen",
    uploadedDetail: "und es werden mehr!",
    slideshowTitle: "Slideshow ist live",
    slideshowDetail: "Alle genießen es!",
    completeTitle: "Upload abgeschlossen!",
    completeDetail: "Danke!",
    newPhotoTitle: "Neues Foto hinzugefügt",
    newPhotoDetail: "Ein schöner Moment festgehalten.",
    scan: "Scannen & teilen",
    previous: "Vorheriges Bild",
    next: "Nächstes Bild",
    choose: "Bild auswählen",
    showImage: (index) => `Bild ${index} anzeigen`,
    trust: ["Für echte Momente gemacht", "Von Paaren geliebt", "Privat und sicher"],
  },
  en: {
    alts: [
      "Guestcam QR card held at a wedding reception",
      "Uploading a wedding photo to Guestcam on a phone",
      "Guestcam QR table card at a wedding reception",
      "Guestcam wedding photo gallery on a phone",
    ],
    uploadedTitle: "328 photos uploaded",
    uploadedDetail: "and counting!",
    slideshowTitle: "Slideshow is live",
    slideshowDetail: "Everyone is enjoying!",
    completeTitle: "Upload complete!",
    completeDetail: "Thank you!",
    newPhotoTitle: "New photo added",
    newPhotoDetail: "A beautiful moment captured.",
    scan: "Scan to share",
    previous: "Previous image",
    next: "Next image",
    choose: "Choose image",
    showImage: (index) => `Show image ${index}`,
    trust: ["Made for real moments", "Loved by couples", "Private and secure"],
  },
  es: {
    alts: [
      "Tarjeta QR de Guestcam en una boda",
      "Subida de una foto a Guestcam desde un móvil",
      "Tarjeta QR de Guestcam sobre una mesa de boda",
      "Galería de fotos de Guestcam en un móvil",
    ],
    uploadedTitle: "328 fotos subidas",
    uploadedDetail: "¡y siguen llegando!",
    slideshowTitle: "Presentación en directo",
    slideshowDetail: "¡Todos la están disfrutando!",
    completeTitle: "¡Subida completada!",
    completeDetail: "¡Gracias!",
    newPhotoTitle: "Nueva foto añadida",
    newPhotoDetail: "Un momento precioso capturado.",
    scan: "Escanea y comparte",
    previous: "Imagen anterior",
    next: "Imagen siguiente",
    choose: "Elegir imagen",
    showImage: (index) => `Mostrar imagen ${index}`,
    trust: ["Hecho para momentos reales", "Elegido por parejas", "Privado y seguro"],
  },
};

function MiniQR() {
  const pattern = [
    1,1,1,1,1,0,1,1,1,1,1,
    1,0,0,0,1,0,1,0,0,0,1,
    1,0,1,0,1,0,1,0,1,0,1,
    1,0,0,0,1,0,1,0,0,0,1,
    1,1,1,1,1,0,1,1,1,1,1,
    0,0,0,0,0,0,0,0,0,0,0,
    1,1,0,1,1,1,0,1,0,1,1,
    0,1,1,0,0,1,1,0,1,0,1,
    1,0,1,1,0,0,1,1,0,1,0,
    1,1,0,0,1,1,0,0,1,1,1,
    0,1,1,1,0,1,1,1,0,0,1,
  ];

  return (
    <div aria-hidden="true" className="grid h-[76px] w-[76px] grid-cols-11 gap-px rounded-lg bg-white p-1.5 ring-1 ring-black/10">
      {pattern.map((cell, index) => (
        <span key={index} className={cell ? "bg-black" : "bg-white"} />
      ))}
    </div>
  );
}

function FloatingBadge({ icon, title, detail, className }: { icon: string; title: string; detail: string; className: string }) {
  return (
    <div className={`pointer-events-none absolute z-30 hidden items-center gap-3 rounded-2xl border border-black/8 bg-white/95 px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,.12)] backdrop-blur md:flex ${className}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F4B400]/30 bg-[#FFF5C9] text-lg font-black text-[#8F6900]">{icon}</span>
      <span>
        <strong className="block whitespace-nowrap text-sm font-black text-black">{title}</strong>
        <span className="mt-0.5 block whitespace-nowrap text-xs font-semibold text-black/42">{detail}</span>
      </span>
    </div>
  );
}

export function GuestcamTemplatesCarousel({ lang = "sl" }: { lang?: LangCode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);
  const t = COPY[lang];

  const goTo = useCallback((index: number) => {
    const normalized = (index + SLIDES.length) % SLIDES.length;
    setActive(normalized);
    const rail = railRef.current;
    const item = itemRefs.current[normalized];
    if (!rail || !item) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = item.offsetLeft - (rail.clientWidth - item.clientWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? "auto" : "smooth" });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => goTo(active + 1), 4600);
    return () => window.clearTimeout(timer);
  }, [active, goTo]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    const syncActiveToScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const center = rail.scrollLeft + rail.clientWidth / 2;
        let nearest = 0;
        let distance = Number.POSITIVE_INFINITY;
        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const itemCenter = item.offsetLeft + item.clientWidth / 2;
          const nextDistance = Math.abs(itemCenter - center);
          if (nextDistance < distance) {
            nearest = index;
            distance = nextDistance;
          }
        });
        setActive((current) => (current === nearest ? current : nearest));
      });
    };
    rail.addEventListener("scroll", syncActiveToScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", syncActiveToScroll);
    };
  }, []);

  return (
    <div id="template-showcase" className="relative mt-10 sm:mt-12">
      <div className="overflow-hidden sm:overflow-visible">
        <div ref={railRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-0 pb-5 pt-8 sm:gap-4 sm:px-[4vw] sm:pb-8 sm:pt-10 lg:px-8 xl:px-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {SLIDES.map((image, index) => (
            <article key={image} ref={(node) => { itemRefs.current[index] = node; }} className="group relative aspect-[3/5] min-w-0 shrink-0 basis-full snap-center overflow-hidden rounded-[26px] bg-[#EEE8DC] shadow-[0_18px_48px_rgba(20,16,10,.13)] ring-1 ring-black/5 sm:basis-[46%] sm:rounded-[28px] lg:basis-[28%] xl:basis-[19%]">
              <img src={image} alt={t.alts[index]} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.018]" />
            </article>
          ))}
        </div>
      </div>

      <FloatingBadge icon="▣" title={t.uploadedTitle} detail={t.uploadedDetail} className="left-[5%] top-0" />
      <FloatingBadge icon="▶" title={t.slideshowTitle} detail={t.slideshowDetail} className="right-[14%] top-2" />
      <FloatingBadge icon="✓" title={t.completeTitle} detail={t.completeDetail} className="bottom-[8%] left-[24%] hidden lg:flex" />
      <FloatingBadge icon="▧" title={t.newPhotoTitle} detail={t.newPhotoDetail} className="bottom-[8%] right-[3%] hidden lg:flex" />

      <div className="pointer-events-none absolute -bottom-5 left-[2%] z-30 hidden rounded-[20px] border-2 border-[#F4B400] bg-white p-3 shadow-[0_18px_42px_rgba(0,0,0,.15)] xl:block">
        <div className="mb-2 text-center text-xs font-black text-black">{t.scan}</div>
        <MiniQR />
      </div>

      <button type="button" aria-label={t.previous} onClick={() => goTo(active - 1)} className="absolute -left-2 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-2xl shadow-lg transition-transform hover:scale-105 sm:flex lg:-left-4">‹</button>
      <button type="button" aria-label={t.next} onClick={() => goTo(active + 1)} className="absolute -right-2 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-2xl shadow-lg transition-transform hover:scale-105 sm:flex lg:-right-4">›</button>

      <div className="mt-3 flex items-center justify-between gap-4 px-1 sm:mt-0 sm:justify-center sm:px-0">
        <button type="button" aria-label={t.previous} onClick={() => goTo(active - 1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-2xl shadow-sm sm:hidden">‹</button>
        <div className="flex justify-center gap-2" aria-label={t.choose}>
          {SLIDES.map((image, index) => (
            <button key={image} type="button" aria-label={t.showImage(index + 1)} onClick={() => goTo(index)} className={`h-2 rounded-full transition-all ${active === index ? "w-7 bg-[#F4B400]" : "w-2 bg-black/16 hover:bg-black/35"}`} />
          ))}
        </div>
        <button type="button" aria-label={t.next} onClick={() => goTo(active + 1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-2xl shadow-sm sm:hidden">›</button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-bold text-black/45 sm:text-sm">
        <span className="text-[#8F6900]">♡</span>
        <span>{t.trust[0]}</span><span>·</span><span>{t.trust[1]}</span><span>·</span><span>{t.trust[2]}</span>
        <span className="text-[#8F6900]">♡</span>
      </div>
    </div>
  );
}
