import Link from "next/link";
import { LanguageSwitcher, HOME_HREFLANG, type LangCode } from "@/components/LanguageSwitcher";
import { SeoFooter } from "@/components/SeoFooter";
import { GuestcamLogo } from "@/components/GuestcamLogo";

type Lang = Exclude<LangCode, "sl">;

interface Copy {
  /** Aria label for the language switcher trigger */
  switcherAria: string;
  /** Home label in the navbar (small text link) */
  navHome: string;
  /** CTA in the navbar (yellow pill) */
  navCta: string;
  /** Eyebrow tag above the hero */
  heroEyebrow: string;
  /** Hero headline — `accent` is rendered in yellow inline */
  heroHead: { lead: string; accent: string; trail?: string };
  heroLead: string;
  /** Hero primary CTA */
  heroCta: string;
  /** Hero secondary text under CTA */
  heroNote: string;
  /** Feature card titles + descriptions (exactly 4 entries) */
  features: { emoji: string; title: string; desc: string }[];
  /** "How it works" section */
  howTitle: string;
  howSteps: { title: string; desc: string }[];
  /** Read-more link to the local wedding guide */
  guideHref: string;
  guideLabel: string;
  /** Final CTA */
  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;
  ctaNote: string;
}

const COPY: Record<Lang, Copy> = {
  hr: {
    switcherAria: "Promijeni jezik",
    navHome: "Početna",
    navCta: "Kreiraj galeriju",
    heroEyebrow: "QR kod za vjenčanja · rođendane · obljetnice",
    heroHead: { lead: "Fotografije s vjenčanja koje", accent: "inače nikada ne biste vidjeli", trail: "." },
    heroLead:
      "Skupite sve fotografije i videozapise svojih gostiju u jednoj privatnoj galeriji. Gosti samo skeniraju QR kod i u nekoliko sekundi dijele svoje trenutke — bez aplikacije, bez prijave.",
    heroCta: "Započni besplatno",
    heroNote: "Bez kreditne kartice • Spremno za manje od 2 minute",
    features: [
      { emoji: "📱", title: "Bez aplikacije", desc: "Gosti otvore galeriju u pregledniku. Nema instalacije, nema registracije." },
      { emoji: "📸", title: "Puna kvaliteta", desc: "Sve fotografije i videozapisi u originalnoj rezoluciji. Bez kompresije." },
      { emoji: "🔒", title: "Potpuna privatnost", desc: "Album je samo za vas i goste. Bez javnih galerija." },
      { emoji: "⚡", title: "Uživo tijekom dana", desc: "Nove fotografije pojavljuju se odmah dok ih gosti učitavaju." },
    ],
    howTitle: "Kako radi",
    howSteps: [
      { title: "Kreirajte galeriju", desc: "Odaberite dizajn QR kartice i ispišite je. Postavite na stolove ili kod ulaza." },
      { title: "Gosti skeniraju i dijele", desc: "Gosti telefonom skeniraju QR kod i odmah učitavaju fotografije u punoj kvaliteti." },
      { title: "Uživajte u uspomenama", desc: "Sve fotografije na jednom mjestu — preuzmite ih kao ZIP arhivu kad god želite." },
    ],
    guideHref: "/hr/qr-kod-vjencanje",
    guideLabel: "Potpuni vodič za QR kod na vjenčanju →",
    ctaTitle: "Vaše vjenčanje zaslužuje sve uspomene",
    ctaDesc: "Kreirajte galeriju s QR kodom za 2 minute — besplatno, bez kreditne kartice.",
    ctaButton: "Započni besplatno",
    ctaNote: "Spremno za 2 minute · SSL · GDPR · podaci u EU",
  },
  sr: {
    switcherAria: "Promeni jezik",
    navHome: "Početna",
    navCta: "Napravi galeriju",
    heroEyebrow: "QR kod za venčanja · rođendane · godišnjice",
    heroHead: { lead: "Fotografije sa venčanja koje", accent: "inače nikada ne biste videli", trail: "." },
    heroLead:
      "Sakupite sve fotografije i video snimke svojih gostiju u jednoj privatnoj galeriji. Gosti samo skeniraju QR kod i za nekoliko sekundi dele svoje trenutke — bez aplikacije, bez registracije.",
    heroCta: "Započni besplatno",
    heroNote: "Bez kreditne kartice • Spremno za manje od 2 minuta",
    features: [
      { emoji: "📱", title: "Bez aplikacije", desc: "Gosti otvaraju galeriju u pretraživaču. Nema instalacije, nema registracije." },
      { emoji: "📸", title: "Pun kvalitet", desc: "Sve fotografije i video snimci u originalnoj rezoluciji. Bez kompresije." },
      { emoji: "🔒", title: "Potpuna privatnost", desc: "Album je samo za vas i goste. Bez javnih galerija." },
      { emoji: "⚡", title: "Uživo tokom slavlja", desc: "Nove fotografije pojavljuju se odmah dok ih gosti otpremaju." },
    ],
    howTitle: "Kako radi",
    howSteps: [
      { title: "Napravite galeriju", desc: "Izaberite dizajn QR kartice i odštampajte je. Postavite na stolove ili kod ulaza." },
      { title: "Gosti skeniraju i otpremaju", desc: "Gosti telefonom skeniraju QR kod i odmah otpremaju fotografije u punom kvalitetu." },
      { title: "Uživajte u uspomenama", desc: "Sve fotografije na jednom mestu — preuzmite ih kao ZIP arhivu kad god želite." },
    ],
    guideHref: "/sr/qr-kod-vencanje",
    guideLabel: "Potpuni vodič za QR kod na venčanju →",
    ctaTitle: "Vaše venčanje zaslužuje sve uspomene",
    ctaDesc: "Napravite galeriju sa QR kodom za 2 minuta — besplatno, bez kreditne kartice.",
    ctaButton: "Započni besplatno",
    ctaNote: "Spremno za 2 minuta · SSL · GDPR · podaci u EU",
  },
  de: {
    switcherAria: "Sprache ändern",
    navHome: "Startseite",
    navCta: "Album erstellen",
    heroEyebrow: "QR-Code für Hochzeiten · Geburtstage · Jubiläen",
    heroHead: { lead: "Hochzeitsfotos, die Sie sonst", accent: "nie zu sehen bekommen würden", trail: "." },
    heroLead:
      "Sammeln Sie alle Fotos und Videos Ihrer Gäste in einer privaten Galerie. Gäste scannen einfach den QR-Code und teilen ihre Momente in Sekunden — ohne App, ohne Anmeldung.",
    heroCta: "Kostenlos starten",
    heroNote: "Keine Kreditkarte • Bereit in unter 2 Minuten",
    features: [
      { emoji: "📱", title: "Keine App", desc: "Gäste öffnen die Galerie direkt im Browser. Keine Installation, keine Registrierung." },
      { emoji: "📸", title: "Volle Qualität", desc: "Alle Fotos und Videos in Originalauflösung. Keine Kompression." },
      { emoji: "🔒", title: "Volle Privatsphäre", desc: "Das Album ist nur für Sie und Ihre Gäste. Keine öffentlichen Galerien." },
      { emoji: "⚡", title: "Live während der Feier", desc: "Neue Fotos erscheinen sofort, sobald Gäste sie hochladen." },
    ],
    howTitle: "So funktioniert's",
    howSteps: [
      { title: "Galerie erstellen", desc: "Wählen Sie ein QR-Karten-Design und drucken Sie es. Stellen Sie es auf die Tische oder an den Eingang." },
      { title: "Gäste scannen und teilen", desc: "Gäste scannen den QR-Code mit dem Telefon und laden sofort Fotos in voller Qualität hoch." },
      { title: "Erinnerungen genießen", desc: "Alle Fotos an einem Ort — als ZIP herunterladen, wann immer Sie möchten." },
    ],
    guideHref: "/de/hochzeitsfotos-sammeln",
    guideLabel: "Vollständiger Leitfaden für QR-Codes auf der Hochzeit →",
    ctaTitle: "Ihre Hochzeit verdient alle Erinnerungen",
    ctaDesc: "Erstellen Sie eine Galerie mit QR-Code in 2 Minuten — kostenlos, keine Kreditkarte.",
    ctaButton: "Kostenlos starten",
    ctaNote: "Bereit in 2 Minuten · SSL · DSGVO · Daten in der EU",
  },
  en: {
    switcherAria: "Change language",
    navHome: "Home",
    navCta: "Create gallery",
    heroEyebrow: "QR codes for weddings · birthdays · anniversaries",
    heroHead: { lead: "The wedding photos you", accent: "would otherwise never see", trail: "." },
    heroLead:
      "Collect every photo and video your guests take into a single private gallery. Guests scan a QR code and share their moments in seconds — no app, no sign-up.",
    heroCta: "Start for free",
    heroNote: "No credit card • Ready in under 2 minutes",
    features: [
      { emoji: "📱", title: "No app", desc: "Guests open the gallery in the browser. No install, no sign-up." },
      { emoji: "📸", title: "Full quality", desc: "Every photo and video in original resolution. No compression." },
      { emoji: "🔒", title: "Fully private", desc: "The album is just for you and your guests. No public galleries." },
      { emoji: "⚡", title: "Live during the day", desc: "New photos appear as soon as guests upload them." },
    ],
    howTitle: "How it works",
    howSteps: [
      { title: "Create your gallery", desc: "Pick a QR card design and print it. Place it on tables or at the entrance." },
      { title: "Guests scan and share", desc: "Guests scan the QR code with their phone and upload photos in full quality instantly." },
      { title: "Enjoy the memories", desc: "Every photo in one place — download as a ZIP whenever you like." },
    ],
    guideHref: "/en/wedding-photo-sharing",
    guideLabel: "Read the full wedding QR guide →",
    ctaTitle: "Your wedding deserves every memory",
    ctaDesc: "Create your QR-coded gallery in 2 minutes — free, no credit card.",
    ctaButton: "Start for free",
    ctaNote: "Ready in 2 minutes · SSL · GDPR · data in the EU",
  },
  es: {
    switcherAria: "Cambiar idioma",
    navHome: "Inicio",
    navCta: "Crear galería",
    heroEyebrow: "QR para bodas · cumpleaños · aniversarios",
    heroHead: { lead: "Las fotos de tu boda que", accent: "de otra forma nunca verías", trail: "." },
    heroLead:
      "Reúne todas las fotos y vídeos de tus invitados en una galería privada. Los invitados escanean un código QR y comparten sus momentos en segundos — sin app, sin registro.",
    heroCta: "Empezar gratis",
    heroNote: "Sin tarjeta de crédito • Listo en menos de 2 minutos",
    features: [
      { emoji: "📱", title: "Sin app", desc: "Los invitados abren la galería en el navegador. Sin instalar, sin registrarse." },
      { emoji: "📸", title: "Calidad completa", desc: "Todas las fotos y vídeos en resolución original. Sin compresión." },
      { emoji: "🔒", title: "Privacidad total", desc: "El álbum es solo para ti y tus invitados. Sin galerías públicas." },
      { emoji: "⚡", title: "En directo durante la boda", desc: "Las fotos nuevas aparecen al instante mientras los invitados las suben." },
    ],
    howTitle: "Cómo funciona",
    howSteps: [
      { title: "Crea tu galería", desc: "Elige un diseño de tarjeta QR e imprímela. Ponla en las mesas o a la entrada." },
      { title: "Los invitados escanean y comparten", desc: "Los invitados escanean el QR con el móvil y suben fotos en calidad completa al instante." },
      { title: "Disfruta los recuerdos", desc: "Todas las fotos en un solo lugar — descárgalas como ZIP cuando quieras." },
    ],
    guideHref: "/es/fotos-boda-qr",
    guideLabel: "Lee la guía completa de fotos de boda con QR →",
    ctaTitle: "Tu boda merece todos los recuerdos",
    ctaDesc: "Crea tu galería con código QR en 2 minutos — gratis, sin tarjeta de crédito.",
    ctaButton: "Empezar gratis",
    ctaNote: "Listo en 2 minutos · SSL · RGPD · datos en la UE",
  },
};

export function LocalizedHomePage({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">
      {/* Announcement bar */}
      <div
        className="text-[#0F1729] text-center text-xs font-semibold py-2.5 px-4"
        style={{ background: "linear-gradient(135deg,#FFD966 0%,#FFC94D 100%)" }}
      >
        {t.ctaDesc}{" "}
        <Link href="/dashboard/new" className="underline font-bold ml-2">
          {t.heroCta} →
        </Link>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#FFC94D]/30 bg-white/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center transition-transform duration-200 hover:scale-[1.03]">
            <GuestcamLogo size="sm" showMark={true} />
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageSwitcher current={lang} languages={HOME_HREFLANG} ariaLabel={t.switcherAria} />
            <Link
              href="/dashboard"
              className="hidden sm:block text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors"
            >
              {t.navHome}
            </Link>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-bold text-[#0F1729] transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)",
                boxShadow: "0 6px 18px rgba(255,201,77,0.45)",
              }}
            >
              {t.navCta}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ background: "#FFF9EC" }}>
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C9820A] mb-5">
            {t.heroEyebrow}
          </p>
          <h1
            className="font-extrabold leading-[1.12] tracking-tight text-[#0F1729] mb-7"
            style={{ fontSize: "clamp(2rem, 4.4vw, 3.4rem)" }}
          >
            {t.heroHead.lead}{" "}
            <span style={{ color: "#C9820A" }}>{t.heroHead.accent}</span>
            {t.heroHead.trail}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-9 max-w-2xl mx-auto">
            {t.heroLead}
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-[#0F1729] font-bold text-lg transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)",
              boxShadow: "0 14px 40px rgba(255,201,77,0.45)",
            }}
          >
            {t.heroCta}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-gray-500">{t.heroNote}</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {t.features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 p-6 bg-white hover:shadow-[0_12px_36px_rgba(15,23,41,0.08)] transition-all"
              >
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="font-bold text-[#0F1729] text-lg mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" style={{ background: "#FFF9EC" }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center font-extrabold text-[#0F1729] mb-10" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}>
            {t.howTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {t.howSteps.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-white border border-gray-100 p-6">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FFC94D] text-[#0F1729] font-extrabold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-[#0F1729] text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href={t.guideHref}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C9820A] hover:underline"
            >
              {t.guideLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white text-center px-6">
        <h2
          className="font-extrabold text-[#0F1729] mb-4"
          style={{ fontSize: "clamp(1.85rem, 4vw, 2.8rem)" }}
        >
          {t.ctaTitle}
        </h2>
        <p className="text-gray-500 text-lg mb-9 max-w-lg mx-auto leading-relaxed">{t.ctaDesc}</p>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2.5 px-10 py-5 text-[#0F1729] font-bold text-lg rounded-full transition-all duration-200 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)",
            boxShadow: "0 12px 32px rgba(255,201,77,0.45)",
          }}
        >
          {t.ctaButton}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="mt-5 text-sm text-gray-400">{t.ctaNote}</p>
      </section>

      <SeoFooter lang={lang} />
    </div>
  );
}
