import Link from "next/link";
import type { Metadata } from "next";
import { ALTERNATIVES_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Beste Apps zum Teilen von Hochzeitsfotos 2025 | Guestcam",
  description:
    "Vergleich: Guestcam vs Google Photos vs WhatsApp vs Dropbox. Welche App eignet sich am besten zum Sammeln von Hochzeitsfotos? Ehrlicher Überblick über Vor- und Nachteile.",
  openGraph: {
    title: "Beste Apps zum Teilen von Hochzeitsfotos 2025",
    description:
      "Ehrlicher Vergleich der Lösungen für Hochzeitsfotos. Qualität, Datenschutz, Preis — alles auf einen Blick.",
    type: "article",
    images: [ogImage("Beste Apps zum Teilen von Hochzeitsfotos")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beste Apps zum Teilen von Hochzeitsfotos 2025",
    description: "Ehrlicher Vergleich der Lösungen für Hochzeitsfotos.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://guestcam.si/de/alternativen",
    languages: {
      "sl": "https://guestcam.si/sl/alternative-aplikacije",
      "hr": "https://guestcam.si/hr/alternativne-aplikacije",
      "sr": "https://guestcam.si/sr/alternativne-aplikacije",
      "de": "https://guestcam.si/de/alternativen",
      "en": "https://guestcam.si/en/alternatives",
      "es": "https://guestcam.si/es/alternativas",
      "x-default": "https://guestcam.si/sl/alternative-aplikacije",
    },
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Beste Apps zum Teilen von Hochzeitsfotos 2025",
  description:
    "Vergleich: Guestcam vs Google Photos vs WhatsApp vs Dropbox. Welche App eignet sich am besten zum Sammeln von Hochzeitsfotos?",
  inLanguage: "de-DE",
  author: { "@type": "Organization", name: "Guestcam" },
  publisher: {
    "@type": "Organization",
    name: "Guestcam",
    logo: "https://guestcam.si/icon-512.png",
  },
  mainEntityOfPage: "https://guestcam.si/de/alternativen",
};


function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2025 Sport group d.o.o. · SI72133449</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white transition-colors">Datenschutz</Link>
          <Link href="/terms" className="hover:text-white transition-colors">AGB</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          <a href="mailto:hello@guestcam.si" className="hover:text-white transition-colors">Kontakt</a>
        </div>
      </div>
    </footer>
  );
}

function Check() {
  return (
    <svg className="w-5 h-5 mx-auto text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function Cross() {
  return (
    <svg className="w-5 h-5 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function Partial({ label }: { label: string }) {
  return (
    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export default function AlternativenPage() {
  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <SiteHeader lang="de" hreflang={ALTERNATIVES_HREFLANG} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest bg-[#FFF3CC] text-[#C9820A]">
            Vergleich · Deutschland · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            Beste Apps zum Teilen von Hochzeitsfotos
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Sie planen eine Hochzeit und suchen einen einfachen Weg, wie Ihre
            Gäste Fotos teilen können. Wahrscheinlich haben Sie schon über
            Google Photos, WhatsApp oder E-Mail nachgedacht. Doch welche Lösung
            ist für eine Hochzeit wirklich die beste? Dieser ehrliche Vergleich
            geht alle wichtigen Optionen durch — und zeigt deutlich, wo jede
            einzelne scheitert.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lesezeit: ~8 Minuten
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M16.5 6.108c1.131.094 1.976 1.057 1.976 2.192V18A2.25 2.25 0 0116.226 20.25H7.5A2.25 2.25 0 015.25 18V8.3c0-1.135.844-2.098 1.976-2.192" />
              </svg>
              Aktualisiert: Januar 2025
            </span>
          </div>
        </div>

        {/* Criteria */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Worauf bei einer Hochzeitsfoto-App zu achten ist
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Bevor wir konkrete Lösungen vergleichen, lohnt es sich zu
            definieren, was eine Hochzeitsfoto-App wirklich gut macht. Die
            Anforderungen sind sehr spezifisch:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Keine App-Installation für Gäste", desc: "Ihre Gäste sind unterschiedlich alt und technisch versiert. Die beste Lösung funktioniert für alle, in jedem Browser." },
              { title: "Volle Originalqualität", desc: "Fotos müssen druckfähig sein. Keine Kompression, keine Verkleinerung — nur Originaldateien." },
              { title: "Schneller Upload-Prozess", desc: "Gäste wollen die Hochzeit genießen, nicht Zeit verlieren. Hochladen sollte in unter 30 Sekunden möglich sein." },
              { title: "Datenschutz von Anfang an", desc: "Hochzeitsfotos sind persönlich. Sie sollen nicht von Google indexiert oder Fremden zugänglich sein." },
              { title: "Einfache Verwaltung", desc: "Galerie anlegen, Fotos herunterladen und Zugriff verwalten — alles muss auch für nicht-technische Nutzer simpel sein." },
              { title: "Fairer Preis", desc: "Eine Hochzeit kostet ohnehin viel. Die Fotolösung sollte erschwinglich oder kostenlos sein — ohne versteckte Kosten." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#FFF3CC]">
                  <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#0F1729] text-sm">{title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="mb-12 -mx-6 px-6 py-12 bg-[#FFF9EC]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
              Schneller Vergleich
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: "#0F1729" }}>
                    <th className="p-4 text-white font-semibold">Funktion</th>
                    <th className="p-4 text-center text-[#FFC94D] font-bold">Guestcam</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Google Photos</th>
                    <th className="p-4 text-center text-gray-300 font-medium">WhatsApp</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Dropbox</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Keine App-Installation für Gäste", wa: true, gp: false, wp: false, db: false, gpNote: "Konto nötig", wpNote: "App nötig", dbNote: "App nötig" },
                    { feature: "Volle Originalqualität", wa: true, gp: "partial", wp: false, db: true, wpNote: "70 % Kompression", gpNote: "Standardmäßig komprimiert" },
                    { feature: "QR-Code für schnellen Zugang", wa: true, gp: false, wp: false, db: false },
                    { feature: "Privat (keine Indexierung)", wa: true, gp: "partial", wp: true, db: true, gpNote: "Je nach Einstellung" },
                    { feature: "Funktioniert ohne Gäste-Login", wa: true, gp: false, wp: false, db: false },
                    { feature: "Mehrsprachige Oberfläche", wa: true, gp: true, wp: true, db: true },
                    { feature: "Live-Galerie während der Feier", wa: true, gp: false, wp: false, db: false },
                    { feature: "Massendownload (ZIP)", wa: true, gp: "partial", wp: false, db: true, gpNote: "Eingeschränkt", wpNote: "Einzeln" },
                    { feature: "Speziell für Hochzeiten gemacht", wa: true, gp: false, wp: false, db: false },
                    { feature: "Kostenloser Plan", wa: true, gp: true, wp: true, db: "partial", dbNote: "Nur 2 GB" },
                  ].map(({ feature, wa, gp, wp, db, wpNote, gpNote, dbNote }, i) => (
                    <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 font-medium text-[#0F1729]">{feature}</td>
                      <td className="p-4 text-center">{wa === true ? <Check /> : wa === false ? <Cross /> : <Partial label={typeof wa === "string" ? wa : ""} />}</td>
                      <td className="p-4 text-center">{gp === true ? <Check /> : gp === false ? <Cross /> : <Partial label={gpNote ?? "Teilweise"} />}</td>
                      <td className="p-4 text-center">{wp === true ? <Check /> : wp === false ? <Cross /> : <Partial label={wpNote ?? "Teilweise"} />}</td>
                      <td className="p-4 text-center">{db === true ? <Check /> : db === false ? <Cross /> : <Partial label={dbNote ?? "Teilweise"} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Daten basieren auf öffentlich verfügbaren Funktionen, Stand Januar 2025. »Teilweise« bedeutet, dass die Funktion vorhanden ist, aber mit erheblichen Einschränkungen für Hochzeitsszenarien.
            </p>
          </div>
        </section>

        {/* Individual reviews */}
        <section className="mb-12 space-y-8">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-2">
            Detaillierte Bewertung der einzelnen Optionen
          </h2>

          {/* Guestcam */}
          <div className="bg-white rounded-3xl border-2 p-7 shadow-sm border-[#FFC94D]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-[#FFF3CC] text-[#C9820A]">
                  Unsere Empfehlung
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Guestcam</h3>
                <p className="text-sm text-gray-500">Speziell für Hochzeitsfotos mit QR-Code</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Kostenlos</p>
                <p className="text-xs text-gray-400">Bezahlpläne ab 39 €</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Guestcam ist die einzige Lösung in dieser Liste, die ausschließlich
              für Hochzeiten und ähnliche Veranstaltungen entwickelt wurde.
              Der gesamte Ablauf — vom Anlegen der Galerie bis zum Download
              aller Fotos — ist auf realen Hochzeitsszenarien aufgebaut.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Was hervorragend funktioniert</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gäste scannen den QR-Code und laden ohne Anmeldung hoch",
                    "Fotos in voller Originalauflösung",
                    "Druckbare QR-Karten-Vorlagen inklusive",
                    "Live-Galerie während der Feier",
                    "Sechs Sprachen (sl, hr, sr, en, de, es)",
                    "DSGVO-konform, Daten in der EU",
                    "Download aller Fotos als ZIP per Klick",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Einschränkungen</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Kostenloser Plan auf 50 Gäste / 200 Fotos begrenzt",
                    "Jüngerer Dienst — weniger bekannte Marke",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Fazit:{" "}
              <span className="font-normal text-gray-600">
                Die beste Wahl für Paare, die eine einfache und elegante Lösung
                möchten, die für jeden Gast funktioniert — technisch versiert
                oder nicht.
              </span>
            </p>
          </div>

          {/* Google Photos */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Google Photos</h3>
                <p className="text-sm text-gray-500">Geteilte Alben zum Sammeln von Fotos</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Kostenlos</p>
                <p className="text-xs text-gray-400">Bis zu 15 GB Speicher</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Google Photos ist eine bekannte, etablierte Plattform. Die Funktion
              für geteilte Alben erlaubt mehreren Personen, Fotos zum gleichen
              Album beizutragen. Viele Paare denken zuerst daran, weil sie
              annehmen, ihre Gäste hätten es bereits.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Was gut funktioniert</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Bekannte Marke — Gäste nutzen sie eventuell schon",
                    "Gute Funktionen zur Foto-Organisation",
                    "Gesichtserkennung und Suche",
                    "Großzügiger kostenloser Speicherplatz",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Einschränkungen</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gäste benötigen ein Google-Konto",
                    "Viele Gäste haben keines (vor allem ältere Verwandte)",
                    "Kein QR-Code — Link muss geteilt werden",
                    "Fotos werden komprimiert, außer in der Einstellung »Originalqualität«",
                    "Keine druckbaren QR-Karten",
                    "Nicht für Hochzeiten konzipiert",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Fazit:{" "}
              <span className="font-normal text-gray-600">
                Funktioniert, wenn alle Ihre Gäste ein Google-Konto haben und
                technisch fit sind. Für gemischte Altersgruppen entsteht eine
                unnötige Hürde.
              </span>
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">WhatsApp-Gruppe</h3>
                <p className="text-sm text-gray-500">Fotos im Gruppenchat teilen</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Kostenlos</p>
                <p className="text-xs text-gray-400">Mit WhatsApp-Konto</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Eine WhatsApp-Gruppe für Hochzeitsfotos einzurichten klingt
              simpel. Fast alle haben WhatsApp. Gäste in eine Gruppe einladen
              und sie bitten zu teilen — klingt perfekt. Bis man es tatsächlich
              ausprobiert.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Was gut funktioniert</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Nahezu universelle Verbreitung",
                    "Gäste haben die App bereits installiert",
                    "Echtzeit-Benachrichtigungen",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Einschränkungen</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Fotos um bis zu 70 % komprimiert — keine hohe Qualität",
                    "Gruppe mit 100+ Personen wird chaotisch",
                    "Fotos einzeln herunterladen — kein Massendownload",
                    "Telefonnummern der Gäste sind für alle sichtbar",
                    "Bilder gehen in der Nachrichtenflut verloren",
                    "Keine Organisation, keine Alben, keine Suche",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Fazit:{" "}
              <span className="font-normal text-gray-600">
                Schon allein die Bildkompression macht WhatsApp für bleibende
                Hochzeitserinnerungen ungeeignet. Gut für schnelles Teilen
                während des Tages, schlecht für langfristiges Aufbewahren.
              </span>
            </p>
          </div>

          {/* Dropbox */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Dropbox</h3>
                <p className="text-sm text-gray-500">Cloud-Speicher mit geteilten Ordnern</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Kostenlos</p>
                <p className="text-xs text-gray-400">2 GB kostenlos / 9,99 €/Mon.+</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Dropbox ist ein hervorragender Cloud-Speicher. Sie können einen
              geteilten Ordner anlegen und Gäste bitten, dort Fotos
              hochzuladen. Dateien bleiben in voller Qualität. Doch das
              Gäste-Erlebnis ist der Knackpunkt.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Was gut funktioniert</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Dateien in voller Qualität speichern",
                    "Zuverlässige, bekannte Marke",
                    "Gut für große Dateien",
                    "Funktioniert auf allen Geräten",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Einschränkungen</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gäste müssen ein Dropbox-Konto anlegen",
                    "Kompliziert für nicht-technische Nutzer",
                    "Kein QR-Code — nur Link",
                    "2 GB kostenlos — schnell voll bei RAW-Fotos",
                    "Nicht für Veranstaltungen konzipiert",
                    "Keine Live-Galerie oder Echtzeit-Ansicht",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Fazit:{" "}
              <span className="font-normal text-gray-600">
                Hervorragend zum Speichern von Dateien, aber mühsam für Gäste.
                Eher für den Austausch zwischen Kollegen geeignet als zum
                Sammeln von Hochzeitsfotos.
              </span>
            </p>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Fazit
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Ehrlich gesagt: Jedes universelle Foto-Tool wurde für den
            Alltag entwickelt, nicht für die speziellen Anforderungen einer
            Hochzeit. Jedes hat mindestens eine große Hürde, weshalb es nicht
            passt:
          </p>
          <div className="grid gap-3 mb-6">
            {[
              { name: "WhatsApp", problem: "Zerstört die Fotoqualität durch Kompression." },
              { name: "Google Photos", problem: "Verlangt ein Google-Konto — Hürde für viele Gäste." },
              { name: "Dropbox", problem: "Zu kompliziert für nicht-technische Gäste." },
              { name: "iCloud-geteiltes Album", problem: "Nur für iPhone — Android-Gäste ausgeschlossen." },
            ].map(({ name, problem }) => (
              <div key={name} className="flex gap-4 items-start bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#0F1729] text-sm">{name}</p>
                  <p className="text-sm text-gray-500">{problem}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 leading-relaxed">
            Guestcam wurde von Anfang an gebaut, um genau diese Probleme zu
            lösen. Keine App-Installation. Keine Anmeldung für Gäste. Volle
            Qualität. QR-Code auf dem Tisch. Download als ZIP mit einem Klick
            nach der Hochzeit. Wenn Sie möchten, dass jeder Gast beitragen
            kann — vom technikversierten Neffen bis zur Großmutter mit dem
            älteren Smartphone — ist Guestcam das richtige Werkzeug.
          </p>
        </section>

        {/* Final dark CTA */}
        <div className="rounded-3xl p-8 text-center bg-[#0F1729]">
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Bereit, alle Hochzeitsfotos zu sammeln?
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Erstellen Sie Ihre QR-Galerie in 2 Minuten — kostenlos, keine Kreditkarte nötig.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFC94D] text-[#0F1729] font-bold text-base transition-all duration-200 hover:scale-[1.02] hover:brightness-95"
          >
            Kostenlos starten →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Bereit in 2 Minuten · SSL-gesichert · DSGVO-konform · Daten in der EU
          </p>
        </div>
      </main>

      <SeoFooter lang="de" />
    </div>
  );
}
