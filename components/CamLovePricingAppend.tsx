import Image from "next/image";
import Link from "next/link";

const plans = [
  { name: "Free", price: "0 €", subtitle: "Za preizkus", features: ["Do 20 fotografij", "30 dni dostopa", "QR koda", "Zasebna galerija"] },
  { name: "Basic", price: "39 €", subtitle: "Za manjše dogodke", features: ["Do 300 fotografij", "Originalna kakovost", "ZIP prenos", "3 mesece dostopa"] },
  { name: "Plus", price: "49 €", subtitle: "Najbolj priljubljen", popular: true, features: ["Do 1.000 fotografij in videov", "Live Photo Wall", "QR kartice za tisk", "ZIP prenos", "1 leto dostopa"] },
  { name: "Premium", price: "99 €", subtitle: "Za velike dogodke", features: ["Do 5.000 fotografij in videov", "Vse iz Plus paketa", "Napredna personalizacija", "Prednostna podpora", "1 leto dostopa"] },
];

export function CamLovePricingAppend() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html:'#business{display:none} footer{display:none}'}} />
      <section id="pricing" className="bg-[#F2EFE6] py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="mx-auto max-w-[820px] text-center">
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#9A7100]">Cenik</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Enkratno plačilo. Brez naročnine.</h2>
            <p className="mx-auto mt-5 max-w-[620px] text-lg leading-8 text-black/55">Začni brezplačno in nadgradi šele, ko potrebuješ več prostora, videe ali Live Photo Wall.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative flex min-h-[500px] flex-col rounded-[28px] border p-8 ${plan.popular ? 'border-black bg-black text-white shadow-[0_24px_70px_rgba(0,0,0,.18)] xl:-translate-y-4' : 'border-black/10 bg-white'}`}>
                {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.12em] text-black">Najbolj priljubljen</span>}
                <p className={`text-sm font-black ${plan.popular ? 'text-[#F4B400]' : 'text-black/45'}`}>{plan.name}</p>
                <div className="mt-4 flex items-end gap-2"><span className="text-5xl font-black tracking-[-.05em]">{plan.price}</span><span className="pb-1 text-sm opacity-45">enkratno</span></div>
                <p className="mt-3 text-sm opacity-55">{plan.subtitle}</p>
                <div className="my-7 h-px bg-current opacity-10" />
                <ul className="space-y-4 text-sm leading-6 opacity-75">{plan.features.map((f) => <li key={f}>✓ {f}</li>)}</ul>
                <Link href="/dashboard/new" className={`mt-auto rounded-full px-5 py-4 text-center text-sm font-black ${plan.popular ? 'bg-[#F4B400] text-black' : 'bg-black text-white'}`}>{plan.name === 'Free' ? 'Preizkusi brezplačno' : `Izberi ${plan.name}`}</Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm font-semibold text-black/45">Brez mesečnih stroškov. Paket lahko nadgradiš kadarkoli.</p>
        </div>
      </section>

      <section id="business-new" className="bg-[#171717] py-24 text-white">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[520px] overflow-hidden rounded-[28px]"><Image src="/events/business.webp" alt="CamLove za podjetja" fill className="object-cover" /></div>
          <div><span className="rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-black">CamLove za podjetja</span><h2 className="mt-6 text-4xl font-black leading-[.98] tracking-[-.05em] sm:text-6xl">Naj gostje ustvarijo vsebino za vaš dogodek.</h2><p className="mt-6 text-lg leading-8 text-white/60">Za konference, promocije, sejme in poslovna praznovanja. Zberite fotografije in videe udeležencev prek QR kode ter jih prikažite v živo.</p><Link href="/contact" className="mt-8 inline-flex rounded-full bg-[#F4B400] px-8 py-4 font-black text-black">Ponudba za podjetja</Link></div>
        </div>
      </section>

      <footer className="bg-[#111] text-white !block">
        <div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div><Image src="/camlove-brand-logo.svg" alt="CamLove" width={210} height={70} /><p className="mt-5 max-w-[340px] leading-7 text-white/50">QR album za poroke, rojstne dneve, baby showerje, zabave in poslovne dogodke.</p><p className="mt-5 font-bold text-[#F4B400]">camlove.me</p></div>
            <div><b>Produkt</b><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><a href="#how">Kako deluje</a><a href="#events">Dogodki</a><a href="#wall">Live Wall</a><a href="#pricing">Cenik</a></div></div>
            <div><b>Za uporabnike</b><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/dashboard/new">Ustvari album</Link><Link href="/dashboard">Moj račun</Link><Link href="/contact">Kontakt</Link><a href="#business-new">Za podjetja</a></div></div>
            <div><b>Pravno</b><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/privacy">Zasebnost</Link><Link href="/terms">Pogoji uporabe</Link><Link href="/cookies">Piškotki</Link><Link href="/gdpr">GDPR</Link></div></div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/35">© 2026 CamLove. Vse pravice pridržane.</div>
        </div>
      </footer>
    </>
  );
}
