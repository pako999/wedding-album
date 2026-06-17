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
      { icon: "✉️", title: "Email podpora", desc: "Najhitrejši način do nas.", value: "info@guestcam.si", href: "mailto:info@guestcam.si" },
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
      { q: "Kako hitro odgovorite na sporočilo?", a: "Običajno v nekaj urah med delavniki, najpozneje v 24 urah. Imetniki paketa Premium imajo prednostno podporo z odzivom pod 4 ure ob delavnikih." },
      { q: "Lahko najprej preizkusim Guestcam?", a: "Da. Brezplačni paket omogoča testno galerijo do 20 fotografij za 30 dni — brez kreditne kartice, brez registracije gostov. Tako vidite, kako deluje, preden plačate." },
      { q: "Kaj se zgodi, če imamo težave na sam dan poroke?", a: "Pišite nam na info@guestcam.si ali na WhatsApp — odzivamo se tudi ob koncu tedna. Premium paket vključuje 24/7 podporo na dan dogodka, ko šteje vsaka minuta." },
      { q: "Ali izdate račun na podjetje (s.p., d.o.o.)?", a: "Da. V email napišite ime podjetja, davčno številko in naslov — v 24 urah prejmete pravilen e-račun v PDF obliki, primeren za knjiženje." },
      { q: "Imam težavo z nalaganjem fotografij — kaj zdaj?", a: "Najpogostejši vzrok je počasna mobilna povezava. Preverite, da ste povezani na WiFi, ali pa nam pišite — fotografije lahko po dogodku ročno dodamo iz vaše naprave." },
      { q: "Lahko se srečamo v živo?", a: "Poslujemo online, po predhodnem dogovoru pa se rade volje srečamo na video klicu ali v Ljubljani — še posebej za velike dogodke, agencije in wedding planerje." },
    ],
    responseNote: "Sport group d.o.o. · DDV ID: SI12345678 · Sedež: Ljubljana, Slovenija",
  },
  hr: {
    eyebrow: "Kontakt",
    heading: "Tu smo. Pišite nam.",
    lead: "Pitanja, želje za prilagođene pakete, povratne informacije — rado vas čujemo. Odgovor obično u 24 sata.",
    cards: [
      { icon: "✉️", title: "Email podrška",    desc: "Najbrži način do nas.",              value: "info@guestcam.si", href: "mailto:info@guestcam.si" },
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
      { q: "Koliko brzo odgovarate na poruke?", a: "Obično u nekoliko sati radnim danima, najkasnije u 24 sata. Premium paket uključuje prioritetnu podršku s odzivom unutar 4 sata radnim danima." },
      { q: "Mogu li prvo isprobati Guestcam?", a: "Da. Besplatan paket omogućuje testnu galeriju do 20 fotografija na 30 dana — bez kreditne kartice, bez registracije gostiju. Tako vidite kako radi prije plaćanja." },
      { q: "Što ako imamo problema na sam dan vjenčanja?", a: "Pišite nam na info@guestcam.si ili WhatsApp — odgovaramo i vikendom. Premium paket uključuje 24/7 podršku na dan događaja, kad svaka minuta broji." },
      { q: "Izdajete li račune za tvrtke (obrt, d.o.o.)?", a: "Da. U e-mail napišite naziv tvrtke, OIB i adresu — u 24 sata primite ispravan PDF e-račun, prikladan za knjiženje." },
      { q: "Imam problem s učitavanjem fotografija — što sada?", a: "Najčešći uzrok je spora mobilna veza. Provjerite jeste li spojeni na WiFi, ili nam pišite — fotografije možemo nakon događaja ručno dodati s vašeg uređaja." },
      { q: "Možemo li se sastati uživo?", a: "Poslujemo online, uz prethodni dogovor rado se sastajemo na video pozivu ili u Ljubljani — posebno za velike događaje, agencije i wedding planere." },
    ],
    responseNote: "Sport group d.o.o. · PDV ID: SI12345678 · Sjedište: Ljubljana, Slovenija",
  },
  sr: {
    eyebrow: "Kontakt",
    heading: "Tu smo. Pišite nam.",
    lead: "Pitanja, želje za prilagođene pakete, povratne informacije — rado vas čujemo. Odgovor obično u roku od 24 sata.",
    cards: [
      { icon: "✉️", title: "Email podrška",    desc: "Najbrži način do nas.",              value: "info@guestcam.si", href: "mailto:info@guestcam.si" },
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
      { q: "Koliko brzo odgovarate na poruke?", a: "Obično za nekoliko sati radnim danom, najkasnije u roku od 24 sata. Premium paket uključuje prioritetnu podršku sa odzivom u roku od 4 sata radnim danom." },
      { q: "Mogu li prvo da isprobam Guestcam?", a: "Da. Besplatan paket omogućava testnu galeriju do 20 fotografija na 30 dana — bez kreditne kartice, bez registracije gostiju. Tako vidite kako radi pre plaćanja." },
      { q: "Šta ako imamo problem na sam dan venčanja?", a: "Pišite nam na info@guestcam.si ili WhatsApp — odgovaramo i vikendom. Premium paket uključuje 24/7 podršku na dan događaja, kada svaki minut važi." },
      { q: "Izdajete li račune za firme (preduzetnik, d.o.o.)?", a: "Da. U e-mail napišite naziv firme, PIB i adresu — u roku od 24 sata dobijate ispravan PDF e-račun, pogodan za knjiženje." },
      { q: "Imam problem sa otpremanjem fotografija — šta sad?", a: "Najčešći uzrok je spora mobilna veza. Proverite da li ste povezani na WiFi, ili nam pišite — fotografije možemo posle događaja ručno dodati sa vašeg uređaja." },
      { q: "Možemo li se sastati uživo?", a: "Poslujemo online, uz prethodni dogovor rado se sastajemo na video pozivu ili u Ljubljani — posebno za velike događaje, agencije i wedding planere." },
    ],
    responseNote: "Sport group d.o.o. · PDV ID: SI12345678 · Sedište: Ljubljana, Slovenija",
  },
  de: {
    eyebrow: "Kontakt",
    heading: "Wir sind hier. Schreiben Sie uns.",
    lead: "Fragen, individuelle Paketwünsche, Feedback — wir freuen uns über Ihre Nachricht. Antwort meist innerhalb von 24 Stunden.",
    cards: [
      { icon: "✉️", title: "E-Mail-Support",   desc: "Der schnellste Weg zu uns.",        value: "info@guestcam.si", href: "mailto:info@guestcam.si" },
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
      { q: "Wie schnell antworten Sie auf Nachrichten?", a: "Meist innerhalb weniger Stunden an Werktagen, spätestens innerhalb von 24 Stunden. Premium-Kunden erhalten Priority-Support mit Antwort unter 4 Stunden an Werktagen." },
      { q: "Kann ich Guestcam zuerst testen?", a: "Ja. Das kostenlose Paket bietet eine Testgalerie mit bis zu 20 Fotos für 30 Tage — ohne Kreditkarte, ohne Gäste-Registrierung. So sehen Sie, wie es funktioniert, bevor Sie zahlen." },
      { q: "Was, wenn am Hochzeitstag Probleme auftreten?", a: "Schreiben Sie an info@guestcam.si oder per WhatsApp — wir antworten auch am Wochenende. Das Premium-Paket beinhaltet 24/7-Support am Veranstaltungstag, wenn jede Minute zählt." },
      { q: "Stellen Sie Rechnungen für Firmen aus (Einzelunternehmen, GmbH)?", a: "Ja. Senden Sie uns Firmenname, USt-IdNr. und Adresse per E-Mail — Sie erhalten innerhalb von 24 Stunden eine ordnungsgemäße PDF-Rechnung, buchungstauglich." },
      { q: "Ich habe Probleme beim Hochladen von Fotos — was nun?", a: "Häufigste Ursache ist eine langsame Mobilverbindung. Prüfen Sie, ob Sie mit WLAN verbunden sind, oder schreiben Sie uns — wir können Fotos nach der Veranstaltung manuell von Ihrem Gerät einspielen." },
      { q: "Können wir uns persönlich treffen?", a: "Wir arbeiten online; nach Absprache treffen wir uns gerne per Videoanruf oder in Ljubljana — insbesondere für große Veranstaltungen, Agenturen und Wedding Planner." },
    ],
    responseNote: "Sport group d.o.o. · USt-IdNr.: SI12345678 · Sitz: Ljubljana, Slowenien",
  },
  en: {
    eyebrow: "Contact",
    heading: "We're here. Drop us a line.",
    lead: "Questions, custom-package requests, feedback — we'd love to hear from you. We usually reply within 24 hours.",
    cards: [
      { icon: "✉️", title: "Email support",      desc: "Fastest way to reach us.",            value: "info@guestcam.si", href: "mailto:info@guestcam.si" },
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
      { q: "How fast do you reply to messages?", a: "Usually within a few hours on weekdays, no later than 24 hours. Premium customers get priority support with under-4h response on weekdays." },
      { q: "Can I try Guestcam first?", a: "Yes. The free plan gives you a test gallery of up to 20 photos for 30 days — no credit card, no guest sign-up. See how it works before you pay." },
      { q: "What if something goes wrong on the wedding day itself?", a: "Email info@guestcam.si or message us on WhatsApp — we reply on weekends too. The Premium plan includes 24/7 event-day support when every minute counts." },
      { q: "Do you issue invoices for companies (sole trader, LLC)?", a: "Yes. Email us the company name, VAT ID and address — within 24 hours you'll receive a properly-formatted PDF invoice, accounting-ready." },
      { q: "I'm having trouble uploading photos — what now?", a: "The most common cause is slow mobile data. Check you're on WiFi, or message us — we can manually add photos from your device after the event." },
      { q: "Can we meet in person?", a: "We operate online; with prior arrangement we're happy to meet by video call or in Ljubljana — especially for large events, agencies and wedding planners." },
    ],
    responseNote: "Sport group d.o.o. · VAT ID: SI12345678 · Registered office: Ljubljana, Slovenia",
  },
  es: {
    eyebrow: "Contacto",
    heading: "Estamos aquí. Escríbenos.",
    lead: "Preguntas, solicitudes de paquetes personalizados, feedback — nos encanta saber de ti. Respondemos normalmente en 24 horas.",
    cards: [
      { icon: "✉️", title: "Soporte por email",  desc: "La forma más rápida de contactarnos.",         value: "info@guestcam.si", href: "mailto:info@guestcam.si" },
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
      { q: "¿Con qué rapidez respondéis a los mensajes?", a: "Normalmente en pocas horas entre semana, como máximo en 24 horas. Los clientes Premium reciben soporte prioritario con respuesta en menos de 4 horas en días laborables." },
      { q: "¿Puedo probar Guestcam primero?", a: "Sí. El plan gratuito incluye una galería de prueba de hasta 20 fotos durante 30 días — sin tarjeta de crédito, sin registro de invitados. Comprueba cómo funciona antes de pagar." },
      { q: "¿Y si algo va mal el día de la boda?", a: "Escríbenos a info@guestcam.si o por WhatsApp — respondemos también los fines de semana. El plan Premium incluye soporte 24/7 el día del evento, cuando cada minuto cuenta." },
      { q: "¿Emitís facturas para empresas (autónomo, S.L.)?", a: "Sí. Envíanos por email el nombre de la empresa, CIF y dirección — en 24 horas recibirás una factura PDF correcta, lista para contabilidad." },
      { q: "Tengo problemas para subir fotos — ¿qué hago?", a: "La causa más común es una conexión móvil lenta. Comprueba que estés en WiFi, o escríbenos — podemos añadir manualmente las fotos desde tu dispositivo después del evento." },
      { q: "¿Podemos vernos en persona?", a: "Trabajamos online; con cita previa nos encanta vernos por videollamada o en Liubliana — especialmente para grandes eventos, agencias y wedding planners." },
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
  sl: "Pošiljanje ni uspelo. Poskusite znova ali nam pišite na info@guestcam.si.",
  hr: "Slanje nije uspjelo. Pokušajte ponovno ili nam pišite na info@guestcam.si.",
  sr: "Slanje nije uspelo. Pokušajte ponovo ili nam pišite na info@guestcam.si.",
  de: "Senden fehlgeschlagen. Bitte erneut versuchen oder direkt an info@guestcam.si schreiben.",
  en: "Sending failed. Please try again or email us at info@guestcam.si.",
  es: "Error al enviar. Inténtalo de nuevo o escríbenos a info@guestcam.si.",
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
