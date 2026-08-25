"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDES = [
  "/hero/wedding-walk-lg.webp",
  "/hero/party-family.webp",
  "/hero/babyshower-friends.webp",
  "/events/birthday-party.webp",
] as const;

const ALTS = [
  "Guestcam QR album za poroko z resničnimi trenutki gostov",
  "Družina in prijatelji na zabavi, fotografije za Guestcam galerijo",
  "Prijateljice na baby showerju, fotografije zbrane z Guestcam QR kodo",
  "Rojstnodnevna zabava, fotografije gostov v Guestcam galeriji",
] as const;

function FloatingBadge({ icon, title, detail, className }: { icon: string; title: string; detail: string; className: string }) {
  return <div className={`pointer-events-none absolute z-30 hidden items-center gap-3 rounded-2xl border border-black/8 bg-white/95 px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,.12)] backdrop-blur md:flex ${className}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F4B400]/30 bg-[#FFF5C9] text-lg font-black text-[#8F6900]">{icon}</span><span><strong className="block whitespace-nowrap text-sm font-black text-black">{title}</strong><span className="mt-0.5 block whitespace-nowrap text-xs font-semibold text-black/42">{detail}</span></span></div>;
}

export function GuestcamShowcaseCarousel() {
  const railRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);
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

  return <div id="template-showcase" className="relative mt-10 sm:mt-12">
    <div className="overflow-hidden sm:overflow-visible"><div ref={railRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-0 pb-5 pt-8 sm:gap-4 sm:px-[4vw] sm:pb-8 sm:pt-10 lg:px-8 xl:px-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
      {SLIDES.map((image,index) => <article key={image} ref={(node) => { itemRefs.current[index] = node; }} className="group relative aspect-[3/5] min-w-0 shrink-0 basis-full snap-center overflow-hidden rounded-[26px] bg-[#EEE8DC] shadow-[0_18px_48px_rgba(20,16,10,.13)] ring-1 ring-black/5 sm:basis-[46%] sm:rounded-[28px] lg:basis-[28%] xl:basis-[19%]"><Image src={image} alt={ALTS[index]} fill loading="lazy" sizes="(max-width:640px) calc(100vw - 40px), (max-width:1024px) 46vw, (max-width:1280px) 28vw, 19vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.018]"/><div className="absolute inset-x-4 bottom-4 rounded-[18px] bg-white/94 p-4 text-black shadow-xl backdrop-blur"><p className="text-[10px] font-black uppercase tracking-[.14em] text-black/45">Guestcam QR</p><p className="mt-1 text-lg font-black">Skeniraj in deli</p><p className="mt-1 text-xs font-semibold text-black/45">Fotografije vseh gostov v enem albumu</p></div></article>)}
    </div></div>
    <FloatingBadge icon="▣" title="328 naloženih fotografij" detail="in še prihajajo!" className="left-[5%] top-0"/>
    <FloatingBadge icon="▶" title="Slideshow v živo" detail="Vsi uživajo!" className="right-[14%] top-2"/>
    <FloatingBadge icon="✓" title="Nalaganje končano!" detail="Hvala!" className="bottom-[8%] left-[24%] hidden lg:flex"/>
    <FloatingBadge icon="▧" title="Nova slika dodana" detail="Čudovit trenutek ujet." className="bottom-[8%] right-[3%] hidden lg:flex"/>
    <button type="button" aria-label="Prejšnja slika" onClick={() => goTo(active - 1)} className="absolute -left-2 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-2xl shadow-lg transition-transform hover:scale-105 sm:flex lg:-left-4">‹</button>
    <button type="button" aria-label="Naslednja slika" onClick={() => goTo(active + 1)} className="absolute -right-2 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-2xl shadow-lg transition-transform hover:scale-105 sm:flex lg:-right-4">›</button>
    <div className="mt-3 flex items-center justify-center gap-2">{SLIDES.map((_,index) => <button key={index} type="button" aria-label={`Pokaži sliko ${index + 1}`} onClick={() => goTo(index)} className={`h-2.5 rounded-full transition-all ${index === active ? "w-7 bg-[#F4B400]" : "w-2.5 bg-black/15"}`}/>)}</div>
    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-bold text-black/45 sm:text-sm">{["Ustvarjeno za prave trenutke", "Priljubljeno med pari", "Zasebno in varno"].map(item => <span key={item} className="inline-flex items-center gap-2"><span className="text-[#B88700]">✓</span>{item}</span>)}</div>
  </div>;
}
