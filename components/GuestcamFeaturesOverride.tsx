"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function Icon({ name }: { name: string }) {
  const common = { className: "h-6 w-6", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };
  if (name === "phone") return <svg {...common}><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M12 18h.01"/></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14.5 14.5 0 0 1 3.2 9A14.5 14.5 0 0 1 12 21a14.5 14.5 0 0 1-3.2-9A14.5 14.5 0 0 1 12 3Z"/></svg>;
  if (name === "lock") return <svg {...common}><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
  if (name === "camera") return <svg {...common}><path d="M14.5 5h-5L7.5 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-3.5l-2-3Z"/><circle cx="12" cy="14" r="3.2"/></svg>;
  if (name === "bolt") return <svg {...common}><path d="m13 2-8 11h6l-1 9 9-12h-6V2Z"/></svg>;
  if (name === "qr") return <svg {...common}><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h2v2h-2zM19 15h2M19 19h2v2M15 19h2v2"/></svg>;
  if (name === "wifi") return <svg {...common}><path d="M4.5 10.5a11 11 0 0 1 15 0M7.5 14a6.8 6.8 0 0 1 9 0M10.5 17.5a2.4 2.4 0 0 1 3 0M12 21h.01"/></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
}

const items = {
  app: { icon: "phone", title: "Brez aplikacije", text: "Gostje preprosto skenirajo QR kodo in začnejo deliti fotografije. Brez prenosa aplikacije, registracije ali prijave." },
  language: { icon: "globe", title: "Več jezikov", text: "Vmesnik se samodejno prikaže v jeziku vaših gostov, zato lahko brez težav sodelujejo tudi mednarodni obiskovalci." },
  privacy: { icon: "lock", title: "Popolna zasebnost", text: "Fotografije in videi so vidni samo vam in vašim gostom. Brez javnih galerij in brez neželenega deljenja." },
  quality: { icon: "camera", title: "Polna kakovost", text: "Vse fotografije in videi se shranijo v originalni kakovosti. Brez stiskanja in brez izgube podrobnosti." },
  live: { icon: "bolt", title: "V živo med dogodkom", text: "Nove fotografije se prikazujejo takoj, ko jih gostje naložijo. Utrinke lahko spremljate že med samim dogodkom." },
  custom: { icon: "qr", title: "Prilagojeno vašemu dogodku", text: "Izberite dizajn QR kartice, ki se ujema z vašim dogodkom, in ustvarite izkušnjo, ki bo videti kot del praznovanja." },
  signal: { icon: "wifi", title: "Brez skrbi za signal", text: "Ko gostje nimajo interneta, se fotografije samodejno shranijo v čakalno vrsto. Ko se signal vrne, se naložijo same." },
  email: { icon: "mail", title: "Album vedno pri roki", text: "Po nalaganju si gostje pošljejo povezavo na e-pošto. Naslednji dan odprejo album direktno iz prejete pošte — brez QR kode." },
};

type ItemKey = keyof typeof items;

function Feature({ item, compact = false }: { item: ItemKey; compact?: boolean }) {
  const f = items[item];
  return (
    <div className={`flex gap-5 ${compact ? "items-start" : "items-start"}`}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[#F7D681] text-[#8D5D08]">
        <Icon name={f.icon} />
      </div>
      <div className="min-w-0">
        <h3 className="text-[19px] font-bold leading-6 tracking-[-0.02em] text-[#151820] sm:text-[21px]">{f.title}</h3>
        <p className="mt-2 text-[14px] leading-6 text-[#687181] sm:text-[15px]">{f.text}</p>
      </div>
    </div>
  );
}

export function GuestcamFeaturesOverride() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (window.location.pathname === "/") setTarget(document.getElementById("features"));
  }, []);
  if (!target) return null;

  return createPortal(
    <div className="guestcam-features-replacement mx-auto max-w-[1240px] px-5 sm:px-8">
      <style>{`
        #features > :not(.guestcam-features-replacement){display:none!important}
        #features{background:#FBFAF7!important;padding-top:6rem!important;padding-bottom:6rem!important}
        @media(min-width:768px){#features{padding-top:7rem!important;padding-bottom:7rem!important}}
      `}</style>

      <div className="mx-auto max-w-[820px] text-center font-sans">
        <div className="mx-auto mb-5 flex max-w-[330px] items-center gap-4 text-[#956715]">
          <span className="h-px flex-1 bg-[#D9B56D]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Ustvarjeno za dogodke</span>
          <span className="h-px flex-1 bg-[#D9B56D]" />
        </div>
        <h2 className="text-[clamp(2.35rem,5vw,4.25rem)] font-extrabold leading-[0.98] tracking-[-0.05em] text-[#151820]">
          Zakaj izbrati Guestcam?
        </h2>
        <p className="mx-auto mt-6 max-w-[690px] text-base leading-7 text-[#697180] sm:text-lg sm:leading-8">
          Deljenje spominov brez zapletov. Gostje sodelujejo takoj, vi pa dobite vse fotografije in videe na enem mestu.
        </p>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
        <div className="rounded-[22px] border border-[#E6DFD3] bg-white p-7 lg:col-span-4"><Feature item="app" /></div>

        <div className="relative overflow-hidden rounded-[22px] border border-[#C99A43] bg-[#FFFDF8] p-7 lg:col-span-4 lg:row-span-2">
          <Feature item="language" />
          <div className="relative mt-10 min-h-[190px] overflow-hidden rounded-[18px] border border-[#E8D8B9] bg-[#FCF7EA] p-5">
            <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-[#D7B36A]/55" />
            <div className="absolute left-1/2 top-6 h-[145px] w-[145px] -translate-x-1/2 rounded-full border border-[#C89943]/50" />
            <div className="absolute left-1/2 top-[44px] h-[108px] w-[108px] -translate-x-1/2 rounded-full border border-dashed border-[#C89943]/45" />
            <div className="absolute left-1/2 top-[74px] -translate-x-1/2 text-[#9C6A13]"><Icon name="globe" /></div>
            {[
              ["Hello", "left-5 top-8"],
              ["Živjo", "left-1/2 top-2 -translate-x-1/2"],
              ["Hallo", "right-5 top-8"],
              ["Ciao", "right-7 bottom-6"],
            ].map(([label, pos]) => <span key={label} className={`absolute ${pos} rounded-lg border border-[#E4C98E] bg-white px-3 py-1.5 text-xs font-semibold text-[#9A6A16]`}>{label}</span>)}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#E6DFD3] bg-white p-7 lg:col-span-4"><Feature item="privacy" /></div>
        <div className="rounded-[22px] border border-[#E6DFD3] bg-white p-7 lg:col-span-4"><Feature item="quality" /></div>
        <div className="rounded-[22px] border border-[#E6DFD3] bg-white p-7 lg:col-span-4"><Feature item="live" /></div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[22px] border border-[#E6DFD3] bg-white p-7 sm:p-8">
          <div className="max-w-[430px]"><Feature item="custom" /></div>
          <div className="pointer-events-none absolute -bottom-4 right-5 hidden rotate-[7deg] sm:block">
            <div className="h-[150px] w-[112px] rounded-[5px] border border-[#E7D9BE] bg-[#FFFDF8] p-4 shadow-[0_18px_34px_rgba(50,40,20,.08)]">
              <p className="text-center text-[9px] font-semibold italic leading-3 text-[#B1822D]">Hvala,<br/>da ste z nami!</p>
              <div className="mx-auto mt-4 grid h-11 w-11 grid-cols-4 gap-[2px]">
                {[1,0,1,1,1,1,0,1,0,1,1,0,1,0,1,1].map((v,i)=><span key={i} className={v ? "bg-[#171A20]" : "bg-transparent"}/>) }
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#E6DFD3] bg-white p-7 sm:p-8"><Feature item="signal" /></div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[22px] border border-[#E6DFD3] bg-white p-7 sm:p-8">
        <div className="max-w-[590px]"><Feature item="email" /></div>
        <div className="absolute inset-y-0 right-0 hidden w-[33%] bg-[#F5EFE3] lg:block">
          <div className="absolute -bottom-10 left-1/2 h-[220px] w-[116px] -translate-x-1/2 -rotate-[8deg] rounded-[24px] border-[5px] border-[#171A20] bg-white shadow-[0_18px_40px_rgba(30,30,30,.14)]">
            <div className="mx-auto mt-6 h-2 w-12 rounded-full bg-[#171A20]" />
            <div className="mx-3 mt-5 grid grid-cols-2 gap-2">
              {["/events/wedding.webp","/events/party.webp","/events/birthday.webp","/events/business.webp"].map((src)=><div key={src} className="aspect-square overflow-hidden rounded-md bg-[#EEE9DF]"><img src={src} alt="" className="h-full w-full object-cover"/></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>,
    target,
  );
}
