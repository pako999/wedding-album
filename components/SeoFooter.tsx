import Link from "next/link";
import { GuestcamLogo } from "@/components/GuestcamLogo";

type Lang = "sl" | "hr" | "sr" | "de" | "en" | "es";

/**
 * Footer label translations. The Vodniki list itself is shared — each
 * guide keeps its native title — but the column headings, brand
 * description and product/legal links are translated per language.
 */
interface FooterCopy {
  brandDesc: string;
  product: string;
  howWorks: string;
  features: string;
  pricing: string;
  faq: string;
  createAlbum: string;
  login: string;
  blog: string;
  guides: string;
  /** Guide URL/label for THIS language only (no cross-language list). */
  guideUrl: string;
  guideLabel: string;
  altLabel: string;
  altUrl: string;
  /** Optional extra guides — used to surface the SL event-topic landings
   *  (slike-s-poroke, porocni-album, baby-shower-slike, etc.). Populate
   *  per locale as those topics get translated. */
  extraGuides?: { label: string; url: string }[];
  legal: string;
  privacy: string;
  terms: string;
  cookies: string;
  gdpr: string;
  refund: string;
  contact: string;
}

const COPY: Record<Lang, FooterCopy> = {
  sl: {
    brandDesc: "Poročna galerija s QR kodo — brez aplikacije. Gostje fotografirajo, vi zbirate spomine.",
    product: "Produkt", howWorks: "Kako deluje", features: "Funkcionalnosti", pricing: "Cenik", faq: "Pogosta vprašanja", createAlbum: "Ustvari album", login: "Prijava",
    blog: "Blog", guides: "Vodniki",
    guideLabel: "QR koda za poroko", guideUrl: "/sl/qr-koda-poroka",
    altLabel: "Primerjava aplikacij", altUrl: "/sl/alternative-aplikacije",
    extraGuides: [
      { label: "Slike s poroke",         url: "/sl/slike-s-poroke" },
      { label: "QR koda za poroko",      url: "/sl/qr-koda-za-poroko" },
      { label: "Poročni album",          url: "/sl/porocni-album" },
      { label: "Zbiranje slik s poroke", url: "/sl/zbiranje-slik-s-poroke" },
      { label: "Slike z rojstnega dne",  url: "/sl/slike-z-rojstnega-dne" },
      { label: "Baby shower slike",      url: "/sl/baby-shower-slike" },
    ],
    legal: "Pravno", privacy: "Zasebnost", terms: "Pogoji uporabe", cookies: "Piškotki", gdpr: "GDPR", refund: "Vračilo denarja", contact: "Kontakt",
  },
  hr: {
    brandDesc: "Vjenčana galerija s QR kodom — bez aplikacije. Gosti fotografiraju, vi skupljate uspomene.",
    product: "Proizvod", howWorks: "Kako radi", features: "Značajke", pricing: "Cijene", faq: "Česta pitanja", createAlbum: "Kreiraj album", login: "Prijava",
    blog: "Blog", guides: "Vodiči",
    guideLabel: "QR kod za vjenčanje", guideUrl: "/hr/qr-kod-vjencanje",
    altLabel: "Usporedba aplikacija", altUrl: "/hr/alternativne-aplikacije",
    legal: "Pravno", privacy: "Privatnost", terms: "Uvjeti", cookies: "Kolačići", gdpr: "GDPR", refund: "Povrat novca", contact: "Kontakt",
  },
  sr: {
    brandDesc: "Galerija sa venčanja sa QR kodom — bez aplikacije. Gosti fotografišu, vi skupljate uspomene.",
    product: "Proizvod", howWorks: "Kako radi", features: "Funkcije", pricing: "Cene", faq: "Česta pitanja", createAlbum: "Napravi album", login: "Prijava",
    blog: "Blog", guides: "Vodiči",
    guideLabel: "QR kod za venčanje", guideUrl: "/sr/qr-kod-vencanje",
    altLabel: "Poređenje aplikacija", altUrl: "/sr/alternativne-aplikacije",
    legal: "Pravno", privacy: "Privatnost", terms: "Uslovi", cookies: "Kolačići", gdpr: "GDPR", refund: "Povraćaj novca", contact: "Kontakt",
  },
  de: {
    brandDesc: "Hochzeitsgalerie mit QR-Code — keine App nötig. Gäste fotografieren, Sie sammeln Erinnerungen.",
    product: "Produkt", howWorks: "So funktioniert's", features: "Funktionen", pricing: "Preise", faq: "FAQ", createAlbum: "Album erstellen", login: "Anmelden",
    blog: "Blog", guides: "Anleitungen",
    guideLabel: "Hochzeitsfotos sammeln", guideUrl: "/de/hochzeitsfotos-sammeln",
    altLabel: "App-Vergleich", altUrl: "/de/alternativen",
    legal: "Rechtliches", privacy: "Datenschutz", terms: "AGB", cookies: "Cookies", gdpr: "DSGVO", refund: "Rückerstattung", contact: "Kontakt",
  },
  en: {
    brandDesc: "Wedding gallery with a QR code — no app required. Guests snap, you collect the memories.",
    product: "Product", howWorks: "How it works", features: "Features", pricing: "Pricing", faq: "FAQ", createAlbum: "Create album", login: "Sign in",
    blog: "Blog", guides: "Guides",
    guideLabel: "Wedding photo sharing", guideUrl: "/en/wedding-photo-sharing",
    altLabel: "App alternatives", altUrl: "/en/alternatives",
    legal: "Legal", privacy: "Privacy", terms: "Terms", cookies: "Cookies", gdpr: "GDPR", refund: "Refunds", contact: "Contact",
  },
  es: {
    brandDesc: "Galería de boda con código QR — sin app. Los invitados fotografían, tú recopilas los recuerdos.",
    product: "Producto", howWorks: "Cómo funciona", features: "Funciones", pricing: "Precios", faq: "Preguntas", createAlbum: "Crear álbum", login: "Iniciar sesión",
    blog: "Blog", guides: "Guías",
    guideLabel: "Fotos boda QR", guideUrl: "/es/fotos-boda-qr",
    altLabel: "Comparativa de apps", altUrl: "/es/alternativas",
    legal: "Legal", privacy: "Privacidad", terms: "Términos", cookies: "Cookies", gdpr: "RGPD", refund: "Reembolsos", contact: "Contacto",
  },
};

export function SeoFooter({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <footer className="bg-[#0F1729] text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="mb-3">
              <GuestcamLogo size="sm" showMark={true} variant="onDark" />
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-5">{t.brandDesc}</p>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/guest.cam" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/guestcam.si" aria-label="Facebook" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{t.product}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="/#how" className="hover:text-white transition-colors">{t.howWorks}</a></li>
              <li><a href="/#features" className="hover:text-white transition-colors">{t.features}</a></li>
              <li><a href="/#pricing" className="hover:text-white transition-colors">{t.pricing}</a></li>
              <li><a href="/#faq" className="hover:text-white transition-colors">{t.faq}</a></li>
              <li><Link href="/dashboard/new" className="hover:text-white transition-colors">{t.createAlbum}</Link></li>
              <li><Link href={lang === "sl" ? "/blog" : `/${lang}/blog`} className="hover:text-white transition-colors">{t.blog}</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">{t.login}</Link></li>
            </ul>
          </div>

          {/* Guides — only this language's guide + alternatives, so every label
              matches the page's language. */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{t.guides}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href={t.guideUrl} className="hover:text-white transition-colors">{t.guideLabel}</Link></li>
              <li><Link href={t.altUrl} className="hover:text-white transition-colors">{t.altLabel}</Link></li>
              {t.extraGuides?.map((g) => (
                <li key={g.url}>
                  <Link href={g.url} className="hover:text-white transition-colors">{g.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{t.legal}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href={lang === "sl" ? "/privacy" : `/${lang}/privacy`} className="hover:text-white transition-colors">{t.privacy}</Link></li>
              <li><Link href={lang === "sl" ? "/terms"   : `/${lang}/terms`}   className="hover:text-white transition-colors">{t.terms}</Link></li>
              <li><Link href={lang === "sl" ? "/cookies" : `/${lang}/cookies`} className="hover:text-white transition-colors">{t.cookies}</Link></li>
              <li><Link href={lang === "sl" ? "/gdpr"    : `/${lang}/gdpr`}    className="hover:text-white transition-colors">{t.gdpr}</Link></li>
              <li><Link href={lang === "sl" ? "/refund"  : `/${lang}/refund`}  className="hover:text-white transition-colors">{t.refund}</Link></li>
              <li><Link href={lang === "sl" ? "/contact" : `/${lang}/contact`} className="hover:text-white transition-colors">{t.contact}</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 Sport group d.o.o. · SI72133449</p>
          <div className="flex items-center gap-4">
            <p>
              Narejeno v Sloveniji by{" "}
              <a
                href="https://www.futurecode.si"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#FFC94D] hover:text-white transition-colors"
              >
                Futurecode.si
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
