import { SiteHeader } from "@/components/SiteHeader";
import { SeoFooter } from "@/components/SeoFooter";
import { ContactForm } from "@/components/ContactForm";
import type { LangCode } from "@/components/LanguageSwitcher";

interface ContactCopy {
  eyebrow: string;
  heading: string;
  lead: string;
  cards: {
    icon: string;
    title: string;
    desc: string;
    value: string;
    href: string;
  }[];
  formTitle: string;
  formLead: string;
  formName: string;
  formEmail: string;
  formSubject: string;
  formMessage: string;
  formCta: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  responseNote: string;
}

const COPY: Record<LangCode, ContactCopy> = {
  sl: {
    eyebrow: "Stik z nami",
    heading: "Tu smo. Pišite nam.",
    lead: "Vprašanja, želje po posebnih paketih, povratne informacije — zelo radi vas slišimo. Odgovor običajno v 24 urah.",
    cards: [
      { icon: "✉️", title: "Email podpora", desc: "Najhitrejši način do nas.", value: "hello@guestcam.si", href: "mailto:hello@guestcam.si" },
      { icon: "💼", title: "Prodaja & partnerstva", desc: "Velika poroka, agencija ali wedding planner?", value: "sales@guestcam.si", href: "mailto:sales@guestcam.si" },
      { icon: "📱", title: "WhatsApp", desc: "Hiter klepet med 9-17h.", value: "+386 41 580 250", href: "https://wa.me/38641580250" },
    ],
    formTitle: "Pošljite sporočilo",
    formLead: "Sporočilo gre direktno na našo skupinsko pošto. Odgovorimo z osebnim emailom.",
    formName: "Vaše ime",
    formEmail: "Email naslov",
    formSubject: "Zadeva",
    formMessage: "Sporočilo",
    formCta: "Pošlji sporočilo",
    faqTitle: "Pogosta vprašanja",
    faqs: [
      { q: "Kako hitro dobim odgovor?",        a: "Običajno v 24 urah, pogosto že v nekaj urah med tednom." },
      { q: "Ali ponujate račune za podjetja?",  a: "Da. V email napišite ime podjetja in davčno številko, dobite e-račun PDF." },
      { q: "Lahko pridem v živo?",              a: "Poslujemo online, lahko pa se po predhodnem dogovoru dogovorimo tudi za sestanek — online ali v živo." },
      { q: "Imate Premium poročno podporo?",    a: "Da — Premium paket vključuje prednostno podporo s odzivnim časom pod 4 ure ob delavnikih." },
    ],
    responseNote: "Sport group d.o.o. · DDV ID: SI12345678 · Sedež: Ljubljana, Slovenija",
  },
  hr: {
    eyebrow: "Kontakt",
    heading: "Tu smo. Pišite nam.",
    lead: "Pitanja, želje za prilagođene pakete, povratne informacije — rado vas čujemo. Odgovor obično u 24 sata.",
    cards: [
      { icon: "✉️", title: "Email podrška",    desc: "Najbrži način do nas.",              value: "hello@guestcam.si", href: "mailto:hello@guestcam.si" },
      { icon: "💼", title: "Prodaja & partneri", desc: "Veliko vjenčanje, agencija ili wedding planner?", value: "sales@guestcam.si", href: "mailto:sales@guestcam.si" },
      { icon: "📱", title: "WhatsApp",          desc: "Brzi razgovor pon-pet 9-17h.",       value: "+386 41 580 250", href: "https://wa.me/38641580250" },
    ],
    formTitle: "Pošaljite poruku",
    formLead: "Poruka ide ravno u našu zajedničku e-poštu. Odgovaramo osobnim e-mailom.",
    formName: "Vaše ime",
    formEmail: "Email adresa",
    formSubject: "Tema",
    formMessage: "Poruka",
    formCta: "Pošalji poruku",
    faqTitle: "Često postavljana pitanja",
    faqs: [
      { q: "Koliko brzo dobivam odgovor?",      a: "Obično unutar 24 sata, često unutar nekoliko sati radnim danima." },
      { q: "Izdajete li račune za tvrtke?",     a: "Da. U e-mail napišite naziv tvrtke i OIB — dobivate PDF e-račun." },
      { q: "Mogu li doći osobno?",              a: "Poslujemo online, ali uz prethodni dogovor možemo zakazati i sastanak — online ili uživo." },
      { q: "Imate li Premium podršku za vjenčanja?", a: "Da — Premium paket uključuje prioritetnu podršku s odzivom unutar 4 sata radnim danima." },
    ],
    responseNote: "Sport group d.o.o. · PDV ID: SI12345678 · Sjedište: Ljubljana, Slovenija",
  },
  sr: {
    eyebrow: "Kontakt",
    heading: "Tu smo. Pišite nam.",
    lead: "Pitanja, želje za prilagođene pakete, povratne informacije — rado vas čujemo. Odgovor obično u roku od 24 sata.",
    cards: [
      { icon: "✉️", title: "Email podrška",    desc: "Najbrži način do nas.",              value: "hello@guestcam.si", href: "mailto:hello@guestcam.si" },
      { icon: "💼", title: "Prodaja & partneri", desc: "Veliko venčanje, agencija ili wedding planner?", value: "sales@guestcam.si", href: "mailto:sales@guestcam.si" },
      { icon: "📱", title: "WhatsApp",          desc: "Brzi razgovor pon-pet 9-17h.",       value: "+386 41 580 250", href: "https://wa.me/38641580250" },
    ],
    formTitle: "Pošaljite poruku",
    formLead: "Poruka ide direktno u našu zajedničku e-poštu. Odgovaramo ličnim e-mailom.",
    formName: "Vaše ime",
    formEmail: "Email adresa",
    formSubject: "Tema",
    formMessage: "Poruka",
    formCta: "Pošalji poruku",
    faqTitle: "Najčešća pitanja",
    faqs: [
      { q: "Koliko brzo dobijam odgovor?",       a: "Obično unutar 24 sata, često za nekoliko sati radnim danom." },
      { q: "Izdajete li račune za firme?",       a: "Da. U e-mail napišite naziv firme i PIB — dobijate PDF e-račun." },
      { q: "Mogu li doći lično?",                a: "Poslujemo online, ali uz prethodni dogovor možemo zakazati i sastanak — online ili uživo." },
      { q: "Imate li Premium podršku za venčanja?", a: "Da — Premium paket uključuje prioritetnu podršku sa odzivom u roku od 4 sata radnim danom." },
    ],
    responseNote: "Sport group d.o.o. · PDV ID: SI12345678 · Sedište: Ljubljana, Slovenija",
  },
  de: {
    eyebrow: "Kontakt",
    heading: "Wir sind hier. Schreiben Sie uns.",
    lead: "Fragen, individuelle Paketwünsche, Feedback — wir freuen uns über Ihre Nachricht. Antwort meist innerhalb von 24 Stunden.",
    cards: [
      { icon: "✉️", title: "E-Mail-Support",   desc: "Der schnellste Weg zu uns.",        value: "hello@guestcam.si", href: "mailto:hello@guestcam.si" },
      { icon: "💼", title: "Vertrieb & Partner", desc: "Große Hochzeit, Agentur oder Wedding Planner?", value: "sales@guestcam.si", href: "mailto:sales@guestcam.si" },
      { icon: "📱", title: "WhatsApp",          desc: "Schnellchat Mo-Fr 9-17 Uhr.",        value: "+386 41 580 250", href: "https://wa.me/38641580250" },
    ],
    formTitle: "Nachricht senden",
    formLead: "Die Nachricht geht direkt an unser gemeinsames Postfach. Wir antworten persönlich per E-Mail.",
    formName: "Ihr Name",
    formEmail: "E-Mail-Adresse",
    formSubject: "Betreff",
    formMessage: "Nachricht",
    formCta: "Nachricht senden",
    faqTitle: "Häufige Fragen",
    faqs: [
      { q: "Wie schnell antworten Sie?",          a: "Meist innerhalb von 24 Stunden, an Werktagen oft schon nach wenigen Stunden." },
      { q: "Stellen Sie Rechnungen für Firmen aus?", a: "Ja. Schreiben Sie Firmenname + USt-IdNr. in die E-Mail — Sie erhalten eine PDF-Rechnung." },
      { q: "Kann man persönlich vorbeikommen?",   a: "Wir arbeiten online, nach Absprache vereinbaren wir aber gerne auch einen Termin — online oder persönlich." },
      { q: "Gibt es Premium-Hochzeitssupport?",    a: "Ja — das Premium-Paket enthält Priority-Support mit Antwort unter 4 Stunden an Werktagen." },
    ],
    responseNote: "Sport group d.o.o. · USt-IdNr.: SI12345678 · Sitz: Ljubljana, Slowenien",
  },
  en: {
    eyebrow: "Contact",
    heading: "We're here. Drop us a line.",
    lead: "Questions, custom-package requests, feedback — we'd love to hear from you. We usually reply within 24 hours.",
    cards: [
      { icon: "✉️", title: "Email support",      desc: "Fastest way to reach us.",            value: "hello@guestcam.si", href: "mailto:hello@guestcam.si" },
      { icon: "💼", title: "Sales & partnerships", desc: "Large wedding, agency or wedding planner?", value: "sales@guestcam.si", href: "mailto:sales@guestcam.si" },
      { icon: "📱", title: "WhatsApp",           desc: "Quick chat, Mon-Fri 9-5 CET.",        value: "+386 41 580 250", href: "https://wa.me/38641580250" },
    ],
    formTitle: "Send a message",
    formLead: "Your message lands in our shared inbox. We reply personally by email.",
    formName: "Your name",
    formEmail: "Email address",
    formSubject: "Subject",
    formMessage: "Message",
    formCta: "Send message",
    faqTitle: "FAQ",
    faqs: [
      { q: "How fast do you reply?",                 a: "Usually within 24 hours, often within a few hours on weekdays." },
      { q: "Do you issue invoices for companies?",   a: "Yes. Include company name + VAT ID in your email — you'll get a PDF invoice." },
      { q: "Can we meet in person?",                 a: "We operate online, but with prior arrangement we can also schedule a meeting — online or in person." },
      { q: "Is there Premium wedding-day support?",  a: "Yes — the Premium plan includes priority support with under-4h response on weekdays." },
    ],
    responseNote: "Sport group d.o.o. · VAT ID: SI12345678 · Registered office: Ljubljana, Slovenia",
  },
  es: {
    eyebrow: "Contacto",
    heading: "Estamos aquí. Escríbenos.",
    lead: "Preguntas, solicitudes de paquetes personalizados, feedback — nos encanta saber de ti. Respondemos normalmente en 24 horas.",
    cards: [
      { icon: "✉️", title: "Soporte por email",  desc: "La forma más rápida de contactarnos.",         value: "hello@guestcam.si", href: "mailto:hello@guestcam.si" },
      { icon: "💼", title: "Ventas y partners",  desc: "¿Boda grande, agencia o wedding planner?",     value: "sales@guestcam.si", href: "mailto:sales@guestcam.si" },
      { icon: "📱", title: "WhatsApp",            desc: "Chat rápido, lun-vie 9-17h CET.",              value: "+386 41 580 250", href: "https://wa.me/38641580250" },
    ],
    formTitle: "Envíanos un mensaje",
    formLead: "Tu mensaje llega a nuestra bandeja compartida. Respondemos personalmente por email.",
    formName: "Tu nombre",
    formEmail: "Dirección de email",
    formSubject: "Asunto",
    formMessage: "Mensaje",
    formCta: "Enviar mensaje",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      { q: "¿Cuándo recibo respuesta?",               a: "Normalmente en 24 horas, a menudo en pocas horas entre semana." },
      { q: "¿Emiten facturas para empresas?",         a: "Sí. Incluye nombre de empresa + CIF en el email — recibirás una factura PDF." },
      { q: "¿Podemos vernos en persona?",             a: "Trabajamos online, pero con cita previa también podemos concertar una reunión — online o en persona." },
      { q: "¿Hay soporte Premium para el día de la boda?", a: "Sí — el plan Premium incluye soporte prioritario con respuesta en menos de 4h en días laborables." },
    ],
    responseNote: "Sport group d.o.o. · CIF: SI12345678 · Domicilio social: Liubliana, Eslovenia",
  },
};

// Localised success / error messages used by <ContactForm>. Defined
// outside the COPY map because ContactForm sits in a separate client
// component that doesn't need the full COPY object.
const SUCCESS_COPY: Record<LangCode, { title: string; body: string }> = {
  sl: { title: "Sporočilo poslano",  body: "Hvala! Odgovorili vam bomo na vaš email, običajno v 24 urah." },
  hr: { title: "Poruka poslana",     body: "Hvala! Odgovorit ćemo na vaš email, obično u roku od 24 sata." },
  sr: { title: "Poruka poslata",     body: "Hvala! Odgovorićemo na vaš email, obično u roku od 24 sata." },
  de: { title: "Nachricht gesendet", body: "Danke! Wir antworten per E-Mail, meist innerhalb von 24 Stunden." },
  en: { title: "Message sent",       body: "Thanks! We'll reply by email, usually within 24 hours." },
  es: { title: "Mensaje enviado",    body: "¡Gracias! Te responderemos por email, normalmente en 24 horas." },
};
const ERROR_COPY: Record<LangCode, string> = {
  sl: "Pošiljanje ni uspelo. Poskusite znova ali nam pišite na hello@guestcam.si.",
  hr: "Slanje nije uspjelo. Pokušajte ponovno ili nam pišite na hello@guestcam.si.",
  sr: "Slanje nije uspelo. Pokušajte ponovo ili nam pišite na hello@guestcam.si.",
  de: "Senden fehlgeschlagen. Bitte erneut versuchen oder direkt an hello@guestcam.si schreiben.",
  en: "Sending failed. Please try again or email us at hello@guestcam.si.",
  es: "Error al enviar. Inténtalo de nuevo o escríbenos a hello@guestcam.si.",
};

export function ContactPage({ lang }: { lang: LangCode }) {
  const t = COPY[lang];

  return (
    <div className="min-h-screen bg-white text-[#0F1729]">
      <SiteHeader lang={lang} />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#FFF9EC] to-white py-20 sm:py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
              style={{ background: "rgba(255,201,77,0.18)", color: "#C9820A" }}>
              {t.eyebrow}
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#0F1729] mb-5 leading-tight">
              {t.heading}
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">{t.lead}</p>
          </div>
        </section>

        {/* Channel cards */}
        <section className="py-14 bg-white">
          <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.cards.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#FFC94D] hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-[#0F1729] text-base mb-1">{c.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{c.desc}</p>
                <p className="text-sm font-semibold text-[#C9820A] group-hover:underline break-all">{c.value}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Message form */}
        <section className="py-14 bg-[#FFF9EC]/40">
          <div className="max-w-2xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-7 sm:p-10 shadow-sm">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1729] mb-2">{t.formTitle}</h2>
              <p className="text-sm text-gray-500 mb-6">{t.formLead}</p>

              <ContactForm
                labels={{
                  name:    t.formName,
                  email:   t.formEmail,
                  subject: t.formSubject,
                  message: t.formMessage,
                  cta:     t.formCta,
                  successTitle: SUCCESS_COPY[lang].title,
                  successBody:  SUCCESS_COPY[lang].body,
                  errorGeneric: ERROR_COPY[lang],
                }}
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 bg-white">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1729] mb-6">{t.faqTitle}</h2>
            <div className="space-y-2">
              {t.faqs.map((f) => (
                <details key={f.q} className="group rounded-xl border border-gray-200 p-4 open:border-[#FFC94D]/60 open:bg-[#FFF9EC]/40">
                  <summary className="font-semibold text-[#0F1729] cursor-pointer list-none flex items-center justify-between gap-3">
                    <span>{f.q}</span>
                    <span className="text-[#C9820A] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-8 text-center">{t.responseNote}</p>
          </div>
        </section>
      </main>

      <SeoFooter lang={lang} />
    </div>
  );
}
