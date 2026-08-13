import Image from "next/image";
import Link from "next/link";
import CamLoveFixedPage from "../camlove-fixed/page";

const businessImage = "https://raw.githubusercontent.com/pako999/wedding-album/main/2.1.organizacija-dogodkov-dogodkey%20%281%29.jpg";

const plans = [
  { name: "Free", price: "0 €", desc: "Preizkusi pred nakupom", features: ["Do 20 fotografij", "30 dni dostopa", "QR koda", "Zasebna galerija"] },
  { name: "Basic", price: "39 €", desc: "Za manjše dogodke", features: ["Fotografije v polni kakovosti", "Zasebna galerija", "QR koda", "ZIP prenos"] },
  { name: "Plus", price: "49 €", desc: "Najbolj priljubljen", featured: true, features: ["Fotografije + videi", "Polna kakovost", "Live Photo Wall", "ZIP prenos", "1 leto dostopa"] },
  { name: "Premium", price: "99 €", desc: "Za večje dogodke", features: ["Fotografije + videi", "Live Photo Wall", "Premium QR dizajni", "1 leto dostopa", "Prednostna podpora"] },
] as const;

export default function CamLoveLivePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `main > section#pricing, main > section#business, main > footer { display:none !important; }` }} />
      <CamLoveFixedPage />

      <section id="pricing" className="bg-[#fffdf8] py-24 sm:py-32 text-[#111]">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="mx-auto max-w-[780px] text-center">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Enkratno plačilo · brez naročnine</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-6xl">Izberi paket za svoj dogodek.</h2>
            <p className="mt-5 text-lg text-black/55">Začni brezplačno in nadgradi šele, ko potrebuješ več.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((p) => (
              <article key={p.name} className={`relative flex min-h-[430px] flex-col rounded-[28px] p-7 ${p.featured ? "bg-black text-white ring-4 ring-[#F4B400]" : "border border-black/10 bg-white"}`}>
                {p.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F4B400] px-4 py-1 text-xs font-black uppercase text-black">Najbolj priljubljen</span>}
                <p className={`text-sm font-black uppercase tracking-[.14em] ${p.featured ? "text-[#F4B400]" : "text-black/45"}`}>{p.name}</p>
                <div className="mt-5 text-5xl font-black tracking-[-.05em]">{p.price}</div>
                <p className={`mt-2 text-sm ${p.featured ? "text-white/55" : "text-black/50"}`}>{p.desc}</p>
                <div className="mt-7 flex flex-1 flex-col gap-3 text-sm">{p.features.map((f) => <span key={f}>✓ {f}</span>)}</div>
                <Link href="/dashboard/new" className={`mt-8 rounded-full px-5 py-3 text-center font-black ${p.featured ? "bg-[#F4B400] text-black" : "bg-black text-white"}`}>{p.name === "Free" ? "Preizkusi brezplačno" : "Izberi paket"}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="business" className="bg-[#171717] py-24 text-white">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-[30px] bg-black min-h-[560px]">
            <img src={businessImage} alt="Poslovni dogodek" className="h-[560px] w-full object-cover" />
          </div>
          <div>
            <span className="rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black">CamLove za podjetja</span>
            <h2 className="mt-6 text-4xl font-black leading-[.98] sm:text-6xl">Naj udeleženci ustvarijo vsebino za vaš dogodek.</h2>
            <p className="mt-6 text-lg leading-8 text-white/60">Za konference, promocije, sejme, športne dogodke, poslovna praznovanja in agencije. Udeleženci nalagajo prek QR kode, vsebine pa lahko prikažete v živo.</p>
            <div className="mt-8 grid gap-3 text-sm font-semibold text-white/70 sm:grid-cols-2">
              <span>✓ lastna grafična podoba</span><span>✓ Live Photo Wall</span><span>✓ zbiranje kontaktov ob soglasju</span><span>✓ sponzorski oglasi</span><span>✓ QR upload brez aplikacije</span><span>✓ prenos vseh vsebin</span>
            </div>
            <Link href="/contact" className="mt-9 inline-flex rounded-full bg-[#F4B400] px-8 py-4 font-black text-black">Ponudba za podjetja →</Link>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white">
        <div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div><div className="relative h-[64px] w-[230px]"><Image src="/camlove-logo.svg" alt="CamLove" fill className="object-contain object-left brightness-0 invert" /></div><p className="mt-5 max-w-sm leading-7 text-white/50">QR album za poroke, rojstne dneve, baby showerje, zabave in poslovne dogodke.</p><p className="mt-5 font-bold text-[#F4B400]">camlove.me</p></div>
            <div><h3 className="font-black">Produkt</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><a href="#how">Kako deluje</a><a href="#events">Dogodki</a><a href="#wall">Live Wall</a><a href="#pricing">Cenik</a></div></div>
            <div><h3 className="font-black">Uporabniki</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/dashboard/new">Ustvari album</Link><Link href="/dashboard">Moj račun</Link><Link href="/contact">Kontakt</Link><a href="#business">Za podjetja</a></div></div>
            <div><h3 className="font-black">Pravno</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/privacy">Zasebnost</Link><Link href="/terms">Pogoji</Link><Link href="/cookies">Piškotki</Link><Link href="/gdpr">GDPR</Link></div></div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/35">© 2026 CamLove · Every camera. One story.</div>
        </div>
      </footer>
    </>
  );
}
