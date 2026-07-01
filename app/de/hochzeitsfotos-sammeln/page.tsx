import Link from "next/link";
import type { Metadata } from "next";
import { GUIDE_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "QR-Code Hochzeit: Fotos der Gäste sammeln 2026",
  description:
    "Hochzeitsfotos sammeln per QR-Code: Gäste scannen, Sie bekommen jedes Foto in voller Qualität. Keine App. In 2 Minuten eingerichtet.",
  openGraph: {
    title: "QR-Code Hochzeit: Fotos der Gäste sammeln 2026",
    description:
      "Sammeln Sie alle Hochzeitsfotos Ihrer Gäste mit einem QR-Code. Keine App, volle Auflösung, privat.",
    type: "article",
    images: [ogImage("QR-Code Hochzeit — Hochzeitsfotos sammeln")],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR-Code Hochzeit: Fotos der Gäste sammeln 2026",
    description: "Sammeln Sie alle Hochzeitsfotos Ihrer Gäste mit einem QR-Code.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://www.guestcam.si/de/hochzeitsfotos-sammeln",
    languages: {
      "sl": "https://www.guestcam.si/sl/qr-koda-poroka",
      "hr": "https://www.guestcam.si/hr/qr-kod-vjencanje",
      "sr": "https://www.guestcam.si/sr/qr-kod-vencanje",
      "de": "https://www.guestcam.si/de/hochzeitsfotos-sammeln",
      "en": "https://www.guestcam.si/en/wedding-photo-sharing",
      "es": "https://www.guestcam.si/es/fotos-boda-qr",
      "x-default": "https://www.guestcam.si/sl/qr-koda-poroka",
    },
  },
};


function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2025 Sport group d.o.o. · SI72133449</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Datenschutz
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            AGB
          </Link>
          <a href="mailto:hello@guestcam.me" className="hover:text-white transition-colors">
            Kontakt
          </a>
        </div>
      </div>
    </footer>
  );
}

function CtaBox() {
  return (
    <div
      className="rounded-3xl p-8 my-12 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(255,201,77,0.12) 0%, rgba(255,201,77,0.12) 100%)",
        border: "1px solid rgba(255,201,77,0.2)",
      }}
    >
      <p className="font-serif text-2xl font-bold text-[#0F1729] mb-3">
        Ihre Hochzeitsgalerie in 2 Minuten erstellen
      </p>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Kostenlos für immer — keine Kreditkarte erforderlich.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base transition-all duration-200 hover:scale-[1.02]"
        style={{ background: "#FFC94D", boxShadow: "0 10px 30px rgba(255,201,77,0.35)" }}
      >
        Jetzt kostenlos starten →
      </Link>
    </div>
  );
}

export default function HochzeitsfotosSammelnPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader lang="de" hreflang={GUIDE_HREFLANG} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background: "rgba(255,201,77,0.1)", color: "#C9820A" }}
          >
            Ratgeber · Deutschland · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            QR-Code Hochzeit: alle Hochzeitsfotos der Gäste sammeln (ohne App)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Jeder Gast auf Ihrer Hochzeit macht Fotos. Spontane Momente,
            emotionale Umarmungen, lustige Tanzflächen-Aufnahmen. Aber wie
            viele davon kommen am Ende wirklich bei Ihnen an? Mit einer
            QR-Code-Hochzeitsgalerie-App ändern Sie das — einfach, elegant und
            ohne dass Gäste eine App herunterladen müssen.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lesezeit: ~6 Minuten
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Aktualisiert: Januar 2025
            </span>
          </div>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Das Problem: Hochzeitsfotos gehen verloren
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Bei einer durchschnittlichen Hochzeit mit 100 Gästen macht jeder
            mindestens 20–30 Fotos. Das sind 2.000 bis 3.000 Aufnahmen — die
            fast alle nie bei Ihnen ankommen. Warum?
          </p>
          <div className="grid gap-4">
            {[
              { title: "Gäste vergessen es zu schicken", desc: "Nach der Hochzeit vergeht Tage, Wochen, Monate. Die Fotos bleiben auf den Handys und geraten in Vergessenheit." },
              { title: "WhatsApp komprimiert Bilder bis zu 70 %", desc: "Was als hochauflösendes Bild beginnt, kommt als verwischte Datei an — nicht druckbar, nicht für Fotobücher geeignet." },
              { title: "Google Fotos erfordert Anmeldung", desc: "Viele Gäste haben kein Google-Konto oder können sich nicht einloggen. Das Teilen über Google Fotos scheitert oft schon am ersten Schritt." },
              { title: "Dropbox und iCloud sind für Nicht-Techniker kompliziert", desc: "App herunterladen, Konto erstellen, freigegebenen Ordner finden — die meisten Gäste geben vor Schritt zwei auf." },
              { title: "E-Mail ist umständlich für alle Beteiligten", desc: "Hundert Gäste per E-Mail anzuschreiben und auf Antworten zu warten ist für Sie mühsam und für Gäste unbequem." },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,201,77,0.1)" }}>
                  <svg className="w-4 h-4" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#0F1729]">{title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <CtaBox />

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Die Lösung: Hochzeitsfotos per QR-Code sammeln
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Guestcam beseitigt jeden Reibungspunkt. So erlebt es ein Gast:
          </p>
          <div className="space-y-4">
            {[
              { step: "1", title: "QR-Karte auf dem Tisch entdecken", desc: "Eine elegant gestaltete Karte liegt in der Tischmitte. Sie enthält die Namen des Paares, das Hochzeitsdatum und einen QR-Code." },
              { step: "2", title: "Handykamera öffnen", desc: "Einfach auf den QR-Code richten. Kein App-Download, kein App Store, kein Google Play." },
              { step: "3", title: "Die Galerie öffnet sich sofort", desc: "Eine Webseite öffnet sich direkt im Browser — vollständig für Mobilgeräte optimiert. Die Oberfläche erscheint automatisch auf Deutsch." },
              { step: "4", title: "Fotos hochladen", desc: "Der Gast wählt Fotos aus der Kamera-Rolle aus und tippt auf Hochladen. Volle Originalqualität. Fertig." },
              { step: "5", title: "Sie sehen es in Echtzeit", desc: "Jedes hochgeladene Foto erscheint sofort in Ihrer Galerie. Viele Paare projizieren eine Live-Diashow beim Abendessen — die Gäste lieben es." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5" style={{ background: "#FFC94D", color: "#0F1729" }}>
                  {step}
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1 shadow-sm">
                  <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Warum Guestcam die beste Wahl ist
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📸", title: "Volle Originalqualität", desc: "Keine Komprimierung, keine Verkleinerung. Jede Datei wird exakt so gespeichert, wie der Gast sie hochgeladen hat." },
              { icon: "📱", title: "Keine App erforderlich", desc: "Funktioniert in jedem modernen Mobilbrowser. Gäste scannen und laden in unter 20 Sekunden hoch." },
              { icon: "🌍", title: "Mehrsprachige Oberfläche", desc: "Die Galerie erscheint automatisch in der Sprache des Gastgeräts — Deutsch, Englisch, Slowenisch, Kroatisch, Spanisch." },
              { icon: "⚡", title: "Live-Galerie", desc: "Sehen Sie Fotos in Echtzeit erscheinen. Perfekt für eine projizierte Diashow beim Hochzeitsempfang." },
              { icon: "🔒", title: "Vollständig privat", desc: "Ihre Galerie ist nur über Ihren einzigartigen QR-Code oder Link zugänglich — niemals von Suchmaschinen indexiert." },
              { icon: "🎨", title: "Druckfertige QR-Karten", desc: "Wählen Sie aus 8 eleganten Kartenvorlagen, die automatisch Ihre Namen, das Datum und den QR-Code enthalten." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-3">{icon}</div>
                <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 — Step by step setup */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            So richten Sie Guestcam in 5 Schritten ein
          </h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Kostenloses Konto erstellen", desc: "Besuchen Sie Guestcam.si und klicken Sie auf Galerie kostenlos erstellen. E-Mail-Adresse und Passwort eingeben — dauert weniger als eine Minute." },
              { step: "02", title: "Galerie einrichten", desc: "Geben Sie die Namen des Paares, das Hochzeitsdatum und den Ort ein. Wählen Sie ein Hintergrundbild, eine Farbe und die Sprache der Galerie." },
              { step: "03", title: "Kartenvorlage auswählen", desc: "Guestcam bietet 8 elegante Vorlagen für QR-Karten — von klassisch bis skandinavisch. Jede Vorlage wird automatisch mit Ihren Namen und dem Datum personalisiert." },
              { step: "04", title: "Herunterladen und drucken", desc: "Die Vorlage wird als hochauflösende PDF-Datei heruntergeladen. Senden Sie sie an eine lokale Druckerei oder drucken Sie sie selbst aus. Empfohlen: Karton 300 g/m² für das beste Ergebnis." },
              { step: "05", title: "Karten auf der Hochzeit platzieren", desc: "Karten auf Tische verteilen, am Bartresen aufstellen oder als Beilage zu den Einladungen. Mindestens eine Karte pro Tisch wird empfohlen." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5" style={{ background: "#FFC94D", color: "#0F1729" }}>
                  {step}
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1 shadow-sm">
                  <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Tipps für maximale Foto-Uploads
          </h2>
          <ul className="space-y-3 text-gray-600">
            {[
              "Platzieren Sie eine QR-Karte an jedem Tisch — nicht nur eine am Eingang.",
              "Der Moderator oder DJ kann die Galerie beim Abendessen ankündigen.",
              "Größere Karten (A5 oder A4) sind sichtbarer und werden von Gästen schneller bemerkt.",
              "Fügen Sie eine kurze Anleitung auf Deutsch und ggf. Englisch für internationale Gäste hinzu.",
              "Testen Sie den QR-Code vor der Hochzeit — scannen Sie ihn selbst und laden Sie ein Testfoto hoch.",
              "Aktivieren Sie die Live-Galerie-Funktion für eine projizierte Diashow beim Empfang.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,201,77,0.15)" }}>
                  <svg className="w-3 h-3" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Häufig gestellte Fragen
          </h2>
          <div className="space-y-3">
            {[
              { q: "Ist Guestcam wirklich kostenlos?", a: "Ja, der Grundplan ist für immer kostenlos — Sie erhalten einen einzigartigen QR-Code und eine Galerie für bis zu 50 Gäste und 200 Fotos. Kostenpflichtige Pläne bieten unbegrenzte Gäste, unbegrenzte Fotos und zusätzliche Funktionen." },
              { q: "Müssen Gäste eine App herunterladen?", a: "Nein. Die Galerie öffnet sich direkt im mobilen Browser. Keine Installation, kein Konto, kein Passwort." },
              { q: "In welcher Qualität werden Fotos gespeichert?", a: "In voller Originalauflösung. Wir komprimieren oder verkleinern Gastfotos niemals. Jede Datei wird exakt so gespeichert, wie sie hochgeladen wurde." },
              { q: "Wie lange bleiben die Fotos gespeichert?", a: "Abhängig vom gewählten Paket — 1 Monat (Basic), 1 Jahr (Plus) oder 2 Jahre (Premium). Sie können alle Fotos jederzeit als ZIP-Archiv herunterladen." },
              { q: "Ist die Galerie privat?", a: "Ja. Ihre Galerie ist nur über Ihren einzigartigen QR-Code oder direkten Link zugänglich. Sie wird niemals von Google oder anderen Suchmaschinen indexiert." },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white border border-gray-100 rounded-2xl group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[#0F1729] list-none text-sm">
                  {q}
                  <svg className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: "#0F1729" }}>
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Ihre Hochzeit verdient jede Erinnerung
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            QR-Fotogalerie in 2 Minuten erstellen — kostenlos, ohne Kreditkarte.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "#FFC94D", color: "#0F1729" }}
          >
            Jetzt starten →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            In 2 Minuten bereit · SSL-gesichert · DSGVO-konform
          </p>
        </div>
      </main>

      <SeoFooter lang="de" />
    </div>
  );
}
