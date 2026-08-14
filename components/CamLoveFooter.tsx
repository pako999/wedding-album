import Link from "next/link";
import { CamLoveLogo } from "@/components/CamLoveLogo";

const productLinks = [
  ["Kako deluje", "/#how"],
  ["Dogodki", "/#events"],
  ["QR predloge", "/#templates"],
  ["Live Photo Wall", "/#wall"],
  ["Funkcionalnosti", "/#features"],
  ["Cenik", "/#pricing"],
  ["Pogosta vprašanja", "/#faq"],
] as const;

const guideLinks = [
  ["QR koda za poroko", "/sl/qr-koda-poroka"],
  ["Slike s poroke", "/sl/slike-s-poroke"],
  ["Poročni album", "/sl/porocni-album"],
  ["Slike z rojstnega dne", "/sl/slike-z-rojstnega-dne"],
  ["Baby shower slike", "/sl/baby-shower-slike"],
  ["QR koda za poslovne dogodke", "/sl/qr-koda-za-poslovne-dogodke"],
  ["Primerjava aplikacij", "/sl/alternative-aplikacije"],
] as const;

const accountLinks = [
  ["Ustvari album", "/dashboard/new"],
  ["Moj račun", "/dashboard"],
  ["Blog", "/blog"],
  ["Kontakt", "/contact"],
  ["Za podjetja", "/#business"],
  ["Partnerski program", "/affiliate/apply"],
] as const;

const legalLinks = [
  ["Zasebnost", "/privacy"],
  ["Pogoji uporabe", "/terms"],
  ["Piškotki", "/cookies"],
  ["GDPR", "/gdpr"],
  ["Vračilo denarja", "/refund"],
] as const;

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-[.16em] text-white/42">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-white/52">
        {links.map(([label, href]) => (
          <li key={href}><Link href={href} className="transition-colors hover:text-[#F4B400]">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export function CamLoveFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-16 sm:px-8 sm:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 xl:grid-cols-[1.45fr_repeat(4,1fr)]">
          <div className="md:col-span-2 xl:col-span-1">
            <CamLoveLogo size="sm" showMark variant="onDark" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/48">
              QR foto album za poroke, rojstne dneve, baby showerje, zabave in poslovne dogodke. Gostje skenirajo QR kodo, vi pa dobite vse fotografije in videe na enem mestu.
            </p>
            <a href="https://www.camlove.me" className="mt-5 inline-flex font-black text-[#F4B400] hover:text-white">camlove.me</a>
            <div className="mt-6 flex items-center gap-3">
              <a href="https://www.instagram.com/camlove.me" target="_blank" rel="noopener noreferrer" aria-label="CamLove Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black transition-colors hover:border-[#F4B400] hover:text-[#F4B400]">IG</a>
              <a href="mailto:info@camlove.me" aria-label="Email CamLove" className="flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-bold transition-colors hover:border-[#F4B400] hover:text-[#F4B400]">info@camlove.me</a>
            </div>
          </div>

          <FooterColumn title="Produkt" links={productLinks} />
          <FooterColumn title="Vodniki" links={guideLinks} />
          <FooterColumn title="Uporabniki" links={accountLinks} />
          <FooterColumn title="Pravno" links={legalLinks} />
        </div>

        <div className="flex flex-col gap-4 pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CamLove · Sport group d.o.o. · SI72133449</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/hr" className="hover:text-white">HR</Link>
            <Link href="/sr" className="hover:text-white">SR</Link>
            <Link href="/de" className="hover:text-white">DE</Link>
            <Link href="/en" className="hover:text-white">EN</Link>
            <Link href="/es" className="hover:text-white">ES</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
