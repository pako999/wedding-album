import type { LangCode } from "@/components/LanguageSwitcher";
import type { LegalDoc } from "./types";

export const cookiesDoc: Record<LangCode, LegalDoc> = {
  sl: {
    heading: "Politika piškotkov",
    eyebrow: "Pravni dokument",
    lastUpdated: "Zadnja posodobitev: 1. januar 2026 · Sport group d.o.o.",
    intro:
      "Piškotek je majhna besedilna datoteka, ki jo brskalnik shrani na vašo napravo. Pri Guestcam uporabljamo le tehnično nujne piškotke. Brez vašega soglasja ne nameščamo oglaševalskih ali sledilnih piškotkov.",
    sections: [
      { title: "1. Katere piškotke uporabljamo", blocks: [
        { type: "h3", text: "1.1 Nujno potrebni piškotki" },
        { type: "ul", items: [
          "__session, __client_uat — Clerk.com, vzdrževanje seje prijavljenega organizatorja. Obvezni.",
          "guestcam_consent — vaš izbor o piškotkih, da vas ne sprašujemo vedno znova. Neobvezen.",
        ] },
        { type: "h3", text: "1.2 Piškotki tretjih oseb" },
        { type: "p", text: "Paddle (naš preprodajalec za plačila) lahko ob plačilu nastavi lastne piškotke za preprečevanje zlorab. Ti piškotki niso nameščeni na guestcam.si samem — pojavijo se le v Paddlovem postopku plačila med dejansko transakcijo." },
      ] },
      { title: "2. Kaj NE uporabljamo", blocks: [
        { type: "ul", items: [
          "Brez Google Analytics, Meta Pixel ali drugih piškotkov za sledenje.",
          "Brez oglaševalskih piškotkov.",
          "Brez piškotkov za remarketing.",
          "Brez deljenja podatkov s tretjimi osebami za oglaševanje.",
        ] },
      ] },
      { title: "3. Kako upravljate piškotke", blocks: [
        { type: "p", text: "Piškotke lahko kadar koli izbrišete ali blokirate v nastavitvah brskalnika. Onemogočanje sejnih piškotkov vas bo odjavilo iz storitve in onemogočilo dostop do nadzorne plošče." },
        { type: "p", text: "Povezave za upravljanje piškotkov v glavnih brskalnikih: Chrome, Firefox, Safari, Edge — vse imajo nastavitev “Piškotki in podatki strani” oz. “Cookies and site data”." },
      ] },
      { title: "4. Spremembe politike piškotkov", blocks: [
        { type: "p", text: "O bistvenih spremembah te politike vas obvestimo z obvestilom v storitvi. Datum zadnje posodobitve je vedno naveden na vrhu tega dokumenta." },
      ] },
      { title: "5. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: info@guestcam.si", "Davčna številka: SI72133449"] },
      ] },
    ],
  },
  hr: {
    heading: "Politika kolačića",
    eyebrow: "Pravni dokument",
    lastUpdated: "Zadnje ažurirano: 1. siječnja 2026 · Sport group d.o.o.",
    intro:
      "Kolačić je mala tekstualna datoteka koju preglednik sprema na vaš uređaj. U Guestcam-u koristimo isključivo tehnički nužne kolačiće. Bez vaše suglasnosti ne postavljamo oglašivačke ni tragalačke kolačiće.",
    sections: [
      { title: "1. Koje kolačiće koristimo", blocks: [
        { type: "h3", text: "1.1 Nužno potrebni kolačići" },
        { type: "ul", items: [
          "__session, __client_uat — Clerk.com, održavanje sesije prijavljenog organizatora. Obvezni.",
          "guestcam_consent — vaš odabir o kolačićima, da vas ne pitamo svaki put. Neobvezni.",
        ] },
        { type: "h3", text: "1.2 Kolačići trećih strana" },
        { type: "p", text: "Paddle (naš preprodavač za plaćanja) može tijekom plaćanja postaviti vlastite kolačiće radi sprječavanja zlouporabe. Ti se kolačići ne postavljaju na guestcam.si — pojavljuju se isključivo u Paddleovom postupku plaćanja tijekom stvarne transakcije." },
      ] },
      { title: "2. Što NE koristimo", blocks: [
        { type: "ul", items: [
          "Bez Google Analyticsa, Meta Pixela ili drugih kolačića za praćenje.",
          "Bez oglašivačkih kolačića.",
          "Bez kolačića za remarketing.",
          "Bez dijeljenja podataka s trećim stranama za oglašavanje.",
        ] },
      ] },
      { title: "3. Kako upravljati kolačićima", blocks: [
        { type: "p", text: "Kolačiće možete u svakom trenutku obrisati ili blokirati u postavkama preglednika. Onemogućavanje sesijskih kolačića odjavit će vas iz usluge i onemogućiti pristup nadzornoj ploči." },
        { type: "p", text: "Poveznice za upravljanje kolačićima u glavnim preglednicima: Chrome, Firefox, Safari, Edge — svi imaju postavku “Kolačići i podaci stranice” / “Cookies and site data”." },
      ] },
      { title: "4. Izmjene ove politike", blocks: [
        { type: "p", text: "O bitnim izmjenama ove politike obavještavamo vas obavijesti u usluzi. Datum zadnjeg ažuriranja uvijek je naveden na vrhu ovog dokumenta." },
      ] },
      { title: "5. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: info@guestcam.si", "OIB: SI72133449"] },
      ] },
    ],
  },
  sr: {
    heading: "Politika kolačića",
    eyebrow: "Pravni dokument",
    lastUpdated: "Poslednje ažurirano: 1. januar 2026 · Sport group d.o.o.",
    intro:
      "Kolačić je mala tekstualna datoteka koju pretraživač čuva na vašem uređaju. U Guestcam-u koristimo isključivo tehnički neophodne kolačiće. Bez vaše saglasnosti ne postavljamo reklamne ni prateće kolačiće.",
    sections: [
      { title: "1. Koje kolačiće koristimo", blocks: [
        { type: "h3", text: "1.1 Neophodno potrebni kolačići" },
        { type: "ul", items: [
          "__session, __client_uat — Clerk.com, održavanje sesije prijavljenog organizatora. Obavezni.",
          "guestcam_consent — vaš izbor o kolačićima, da vas ne pitamo svaki put. Neobavezni.",
        ] },
        { type: "h3", text: "1.2 Kolačići trećih strana" },
        { type: "p", text: "Paddle (naš preprodavac za plaćanja) može tokom plaćanja postaviti sopstvene kolačiće radi sprečavanja zloupotreba. Ti kolačići se ne postavljaju na guestcam.si — pojavljuju se isključivo u Paddleovom postupku plaćanja tokom stvarne transakcije." },
      ] },
      { title: "2. Šta NE koristimo", blocks: [
        { type: "ul", items: [
          "Bez Google Analytics-a, Meta Pixel-a ili drugih kolačića za praćenje.",
          "Bez reklamnih kolačića.",
          "Bez kolačića za remarketing.",
          "Bez deljenja podataka sa trećim stranama za reklamiranje.",
        ] },
      ] },
      { title: "3. Kako da upravljate kolačićima", blocks: [
        { type: "p", text: "Kolačiće možete u svakom trenutku obrisati ili blokirati u podešavanjima pretraživača. Onemogućavanje sesijskih kolačića odjaviće vas iz usluge i onemogućiti pristup kontrolnoj tabli." },
        { type: "p", text: "Veze za upravljanje kolačićima u glavnim pretraživačima: Chrome, Firefox, Safari, Edge — svi imaju postavku “Kolačići i podaci sajta” / “Cookies and site data”." },
      ] },
      { title: "4. Izmene ove politike", blocks: [
        { type: "p", text: "O bitnim izmenama ove politike obaveštavamo vas obaveštenjem u usluzi. Datum poslednjeg ažuriranja uvek je naveden na vrhu ovog dokumenta." },
      ] },
      { title: "5. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: info@guestcam.si", "PIB: SI72133449"] },
      ] },
    ],
  },
  de: {
    heading: "Cookie-Richtlinie",
    eyebrow: "Rechtsdokument",
    lastUpdated: "Zuletzt aktualisiert: 1. Januar 2026 · Sport group d.o.o.",
    intro:
      "Ein Cookie ist eine kleine Textdatei, die der Browser auf Ihrem Gerät speichert. Bei Guestcam verwenden wir ausschließlich technisch notwendige Cookies. Ohne Ihre Einwilligung setzen wir keine Werbe- oder Tracking-Cookies.",
    sections: [
      { title: "1. Welche Cookies wir verwenden", blocks: [
        { type: "h3", text: "1.1 Notwendige Cookies" },
        { type: "ul", items: [
          "__session, __client_uat — Clerk.com, Aufrechterhaltung der Sitzung des angemeldeten Organisators. Erforderlich.",
          "guestcam_consent — Ihre Cookie-Auswahl, damit wir nicht jedes Mal nachfragen. Optional.",
        ] },
        { type: "h3", text: "1.2 Cookies von Drittanbietern" },
        { type: "p", text: "Paddle (unser Zahlungs-Reseller) kann während des Zahlungsvorgangs eigene Cookies zur Betrugsprävention setzen. Diese Cookies werden nicht auf guestcam.si selbst gesetzt — sie erscheinen ausschließlich im Paddle-Checkout während der eigentlichen Transaktion." },
      ] },
      { title: "2. Was wir NICHT verwenden", blocks: [
        { type: "ul", items: [
          "Kein Google Analytics, kein Meta Pixel oder andere Tracking-Cookies.",
          "Keine Werbe-Cookies.",
          "Keine Remarketing-Cookies.",
          "Keine Weitergabe von Daten an Dritte zu Werbezwecken.",
        ] },
      ] },
      { title: "3. Wie Sie Cookies verwalten", blocks: [
        { type: "p", text: "Sie können Cookies jederzeit in den Browser-Einstellungen löschen oder blockieren. Das Deaktivieren der Sitzungs-Cookies meldet Sie vom Dienst ab und macht den Zugriff auf das Dashboard unmöglich." },
        { type: "p", text: "Links zur Cookie-Verwaltung in den wichtigsten Browsern: Chrome, Firefox, Safari, Edge — alle bieten die Einstellung “Cookies und Websitedaten” / “Cookies and site data”." },
      ] },
      { title: "4. Änderungen dieser Cookie-Richtlinie", blocks: [
        { type: "p", text: "Über wesentliche Änderungen dieser Richtlinie informieren wir Sie mit einem Hinweis im Dienst. Das Datum der letzten Aktualisierung ist stets am Anfang dieses Dokuments angegeben." },
      ] },
      { title: "5. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-Mail: info@guestcam.si", "USt-IdNr.: SI72133449"] },
      ] },
    ],
  },
  en: {
    heading: "Cookie Policy",
    eyebrow: "Legal document",
    lastUpdated: "Last updated: January 1, 2026 · Sport group d.o.o.",
    intro:
      "A cookie is a small text file the browser stores on your device. At Guestcam we use only strictly-necessary cookies. We do not set advertising or tracking cookies without your consent.",
    sections: [
      { title: "1. Which cookies we use", blocks: [
        { type: "h3", text: "1.1 Strictly necessary cookies" },
        { type: "ul", items: [
          "__session, __client_uat — Clerk.com, maintaining the organiser's sign-in session. Required.",
          "guestcam_consent — your cookie choice, so we don't ask again. Optional.",
        ] },
        { type: "h3", text: "1.2 Third-party cookies" },
        { type: "p", text: "Paddle (our payments reseller) may set its own cookies during payment for fraud prevention. These cookies are not set on guestcam.si itself — they only appear in the Paddle checkout during the actual transaction." },
      ] },
      { title: "2. What we do NOT use", blocks: [
        { type: "ul", items: [
          "No Google Analytics, Meta Pixel or other tracking cookies.",
          "No advertising cookies.",
          "No remarketing cookies.",
          "No sharing of data with third parties for advertising.",
        ] },
      ] },
      { title: "3. How to manage cookies", blocks: [
        { type: "p", text: "You can delete or block cookies at any time in your browser settings. Disabling the session cookies will sign you out of the service and prevent access to the dashboard." },
        { type: "p", text: "Cookie-management links for the major browsers: Chrome, Firefox, Safari, Edge — all expose a “Cookies and site data” setting." },
      ] },
      { title: "4. Changes to this cookie policy", blocks: [
        { type: "p", text: "We will notify you of material changes to this policy with a notice inside the service. The last-updated date is always shown at the top of this document." },
      ] },
      { title: "5. Contact", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "VAT ID: SI72133449"] },
      ] },
    ],
  },
  es: {
    heading: "Política de cookies",
    eyebrow: "Documento legal",
    lastUpdated: "Última actualización: 1 de enero de 2026 · Sport group d.o.o.",
    intro:
      "Una cookie es un pequeño archivo de texto que el navegador almacena en tu dispositivo. En Guestcam utilizamos únicamente cookies estrictamente necesarias. No instalamos cookies publicitarias ni de seguimiento sin tu consentimiento.",
    sections: [
      { title: "1. Qué cookies utilizamos", blocks: [
        { type: "h3", text: "1.1 Cookies estrictamente necesarias" },
        { type: "ul", items: [
          "__session, __client_uat — Clerk.com, mantenimiento de la sesión del organizador conectado. Obligatorias.",
          "guestcam_consent — tu elección sobre cookies, para no volver a preguntarte. Opcional.",
        ] },
        { type: "h3", text: "1.2 Cookies de terceros" },
        { type: "p", text: "Paddle (nuestro revendedor de pagos) puede establecer sus propias cookies durante el pago para prevenir fraudes. Estas cookies no se instalan en guestcam.si — solo aparecen en el proceso de pago de Paddle durante la transacción real." },
      ] },
      { title: "2. Lo que NO utilizamos", blocks: [
        { type: "ul", items: [
          "Sin Google Analytics, Meta Pixel u otras cookies de seguimiento.",
          "Sin cookies publicitarias.",
          "Sin cookies de remarketing.",
          "Sin compartir datos con terceros con fines publicitarios.",
        ] },
      ] },
      { title: "3. Cómo gestionar las cookies", blocks: [
        { type: "p", text: "Puedes eliminar o bloquear cookies en cualquier momento desde la configuración del navegador. Desactivar las cookies de sesión te desconectará del servicio e impedirá el acceso al panel." },
        { type: "p", text: "Enlaces para gestionar cookies en los principales navegadores: Chrome, Firefox, Safari, Edge — todos disponen de la opción “Cookies y datos del sitio” / “Cookies and site data”." },
      ] },
      { title: "4. Cambios en esta política de cookies", blocks: [
        { type: "p", text: "Te notificaremos los cambios importantes de esta política mediante un aviso dentro del servicio. La fecha de la última actualización aparece siempre en la parte superior de este documento." },
      ] },
      { title: "5. Contacto", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "CIF: SI72133449"] },
      ] },
    ],
  },
};
