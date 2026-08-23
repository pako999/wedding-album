"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const steps = [
  { no: "1", title: "Izberite dogodek", text: "Izberite vrsto dogodka, za katerega ustvarjate galerijo.", src: "/how/guestcam-step-1-event.webp?v=6", alt: "Guestcam izbira vrste dogodka pri ustvarjanju nove galerije" },
  { no: "2", title: "Vnesite podatke", text: "Vnesite osnovne podatke in galerija bo pripravljena v manj kot dveh minutah.", src: "/how/guestcam-step-2-details.webp?v=6", alt: "Guestcam vnos podatkov za poročno galerijo" },
  { no: "3", title: "Delite QR kodo", text: "Gostje skenirajo QR kodo — brez aplikacije in brez prijave — ter začnejo deliti fotografije.", src: "/how/guestcam-step-3-qr.webp?v=6", alt: "Guestcam QR koda, ki jo gostje skenirajo za nalaganje fotografij" },
] as const;

export function GuestcamProcessHowOverride() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => { if (window.location.pathname === "/") setTarget(document.getElementById("how")); }, []);
  if (!target) return null;
  return createPortal(
    <div className="guestcam-process-replacement mx-auto max-w-[1240px] px-5 sm:px-8">
      <style>{`#how > :not(.guestcam-process-replacement){display:none!important}#how{padding-top:6rem!important;padding-bottom:6rem!important;background:#F7F5F1!important}@media(min-width:768px){#how{padding-top:7rem!important;padding-bottom:7rem!important}}`}</style>
      <div className="mx-auto max-w-[820px] text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9A6A16]">Kako deluje</p>
        <h2 className="mt-4 text-[clamp(2.35rem,5vw,4.3rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-[#171A20]">Enostavno za vas,<br />preprosto za goste</h2>
        <p className="mx-auto mt-6 max-w-[700px] text-base leading-7 text-[#6E7480] sm:text-lg sm:leading-8">V manj kot dveh minutah ustvarite zasebno galerijo, kjer se bodo zbirale vse fotografije in videi vašega dogodka.</p>
      </div>
      <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-9">
        {steps.map((step,index)=><div key={step.no} className="relative min-w-0"><article className="h-full overflow-hidden rounded-[22px] border border-black/[0.08] bg-white shadow-[0_12px_35px_rgba(22,26,32,0.06)]"><div className="px-6 pb-5 pt-6 text-center sm:px-7"><div className="flex items-center justify-center gap-3"><span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0C8] text-sm font-extrabold text-[#A96C00]">{step.no}.</span><h3 className="text-xl font-extrabold tracking-[-0.02em] text-[#171A20]">{step.title}</h3></div><p className="mx-auto mt-3 max-w-[290px] text-sm leading-6 text-[#747A86]">{step.text}</p></div><div className="border-t border-black/[0.06] bg-[#FAF9F7] p-3 sm:p-4"><div className="flex min-h-[360px] items-start justify-center overflow-hidden rounded-[15px] border border-black/[0.06] bg-white sm:min-h-[410px]"><img src={step.src} alt={step.alt} loading="lazy" decoding="async" className="block h-auto max-h-[430px] w-full object-contain object-top" /></div></div></article>{index<steps.length-1&&<div className="absolute -right-[28px] top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#F7F5F1] bg-[#F4B400] text-lg font-bold text-white md:flex" aria-hidden="true">→</div>}</div>)}
      </div>
      <div className="mt-10 text-center sm:mt-12"><a href="/dashboard/new" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#171A20] px-7 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 sm:text-base">Ustvari svojo galerijo zdaj <span aria-hidden="true">→</span></a></div>
    </div>, target
  );
}
