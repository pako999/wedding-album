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
  guides: string;
  /** Guide URL/label for THIS language only (no cross-language list). */
  guideUrl: string;
  guideLabel: string;
  altLabel: string;
  altUrl: string;
  legal: string;
  privacy: string;
  terms: string;
  cookies: string;
  gdpr: string;
  contact: string;
}

const COPY: Record<Lang, FooterCopy> = {
  sl: {
    brandDesc: "Poročna galerija s QR kodo — brez aplikacije. Gostje fotografirajo, vi zbirate spomine.",
    product: "Produkt", howWorks: "Kako deluje", features: "Funkcionalnosti", pricing: "Cenik", faq: "Pogosta vprašanja", createAlbum: "Ustvari album", login: "Prijava",
    guides: "Vodniki",
    guideLabel: "QR koda za poroko", guideUrl: "/sl/qr-koda-poroka",
    altLabel: "Primerjava aplikacij", altUrl: "/sl/alternative-aplikacije",
    legal: "Pravno", privacy: "Zasebnost", terms: "Pogoji uporabe", cookies: "Piškotki", gdpr: "GDPR", contact: "Kontakt",
  },
  hr: {
    brandDesc: "Vjenčana galerija s QR kodom — bez aplikacije. Gosti fotografiraju, vi skupljate uspomene.",
    product: "Proizvod", howWorks: "Kako radi", features: "Značajke", pricing: "Cijene", faq: "Česta pitanja", createAlbum: "Kreiraj album", login: "Prijava",
    guides: "Vodiči",
    guideLabel: "QR kod za vjenčanje", guideUrl: "/hr/qr-kod-vjencanje",
    altLabel: "Usporedba aplikacija", altUrl: "/hr/alternativne-aplikacije",
    legal: "Pravno", privacy: "Privatnost", terms: "Uvjeti", cookies: "Kolačići", gdpr: "GDPR", contact: "Kontakt",
  },
  sr: {
    brandDesc: "Galerija sa venčanja sa QR kodom — bez aplikacije. Gosti fotografišu, vi skupljate uspomene.",
    product: "Proizvod", howWorks: "Kako radi", features: "Funkcije", pricing: "Cene", faq: "Česta pitanja", createAlbum: "Napravi album", login: "Prijava",
    guides: "Vodiči",
    guideLabel: "QR kod za venčanje", guideUrl: "/sr/qr-kod-vencanje",
    altLabel: "Poređenje aplikacija", altUrl: "/sr/alternativne-aplikacije",
    legal: "Pravno", privacy: "Privatnost", terms: "Uslovi", cookies: "Kolačići", gdpr: "GDPR", contact: "Kontakt",
  },
  de: {
    brandDesc: "Hochzeitsgalerie mit QR-Code — keine App nötig. Gäste fotografieren, Sie sammeln Erinnerungen.",
    product: "Produkt", howWorks: "So funktioniert's", features: "Funktionen", pricing: "Preise", faq: "FAQ", createAlbum: "Album erstellen", login: "Anmelden",
    guides: "Anleitungen",
    guideLabel: "Hochzeitsfotos sammeln", guideUrl: "/de/hochzeitsfotos-sammeln",
    altLabel: "App-Vergleich", altUrl: "/de/alternativen",
    legal: "Rechtliches", privacy: "Datenschutz", terms: "AGB", cookies: "Cookies", gdpr: "DSGVO", contact: "Kontakt",
  },
  en: {
    brandDesc: "Wedding gallery with a QR code — no app required. Guests snap, you collect the memories.",
    product: "Product", howWorks: "How it works", features: "Features", pricing: "Pricing", faq: "FAQ", createAlbum: "Create album", login: "Sign in",
    guides: "Guides",
    guideLabel: "Wedding photo sharing", guideUrl: "/en/wedding-photo-sharing",
    altLabel: "App alternatives", altUrl: "/en/alternatives",
    legal: "Legal", privacy: "Privacy", terms: "Terms", cookies: "Cookies", gdpr: "GDPR", contact: "Contact",
  },
  es: {
    brandDesc: "Galería de boda con código QR — sin app. Los invitados fotografían, tú recopilas los recuerdos.",
    product: "Producto", howWorks: "Cómo funciona", features: "Funciones", pricing: "Precios", faq: "Preguntas", createAlbum: "Crear álbum", login: "Iniciar sesión",
    guides: "Guías",
    guideLabel: "Fotos boda QR", guideUrl: "/es/fotos-boda-qr",
    altLabel: "Comparativa de apps", altUrl: "/es/alternativas",
    legal: "Legal", privacy: "Privacidad", terms: "Términos", cookies: "Cookies", gdpr: "RGPD", contact: "Contacto",
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
              <a href="https://www.instagram.com/guestcam.si" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/guestcam.si" aria-label="Facebook" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://www.pinterest.com/guestcam" aria-label="Pinterest" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
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
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{t.legal}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{t.terms}</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">{t.cookies}</Link></li>
              <li><Link href="/gdpr" className="hover:text-white transition-colors">{t.gdpr}</Link></li>
              <li><a href="mailto:hello@guestcam.si" className="hover:text-white transition-colors">{t.contact}</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2025 Sport group d.o.o. · SI72133449</p>
          <p>Made with 💛 in Slovenia</p>
        </div>
      </div>
    </footer>
  );
}
