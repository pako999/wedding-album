import type { LangCode } from "@/components/LanguageSwitcher";
import type { LegalDoc } from "./types";

export const refundDoc: Record<LangCode, LegalDoc> = {
  sl: {
    heading: "Politika vračila denarja",
    eyebrow: "Pravni dokument",
    lastUpdated: "Zadnja posodobitev: 29. maj 2026 · Sport group d.o.o.",
    intro:
      "Želimo, da ste s storitvijo Guestcam popolnoma zadovoljni. Zato za prvi nakup paketa ponujamo 30-dnevno garancijo vračila denarja — brez zapletenih vprašanj. Ta politika pojasnjuje, kdaj in kako lahko zahtevate vračilo ter kako poteka postopek.",
    sections: [
      { title: "1. 30-dnevna garancija vračila denarja", blocks: [
        { type: "p", text: "Za prvi nakup plačljivega paketa (Basic, Plus ali Premium) velja 30-dnevna garancija vračila denarja. Če v 30 dneh od nakupa niste zadovoljni, vam vrnemo celoten znesek." },
        { type: "callout", text: "Garancija velja za prvi nakup posameznega računa. Pri ponovnih nakupih ali nadgradnjah po preteku 30 dni se uporabljajo pravila iz spodnjih razdelkov." },
      ] },
      { title: "2. Pogoji za vračilo", blocks: [
        { type: "ul", items: [
          "Zahtevo oddate v 30 dneh od datuma plačila.",
          "Gre za prvi nakup plačljivega paketa na vašem računu.",
          "Plačilo je bilo izvedeno prek našega preprodajalca Paddle.",
        ] },
        { type: "p", text: "Po odobritvi vračila se dostop do funkcij plačljivega paketa zaključi, album pa preide nazaj na pogoje brezplačnega paketa." },
      ] },
      { title: "3. Kdaj vračilo ni mogoče", blocks: [
        { type: "ul", items: [
          "Po preteku 30 dni od nakupa.",
          "Za ponovne nakupe, podaljšanja ali nadgradnje istega računa (velja le prvi nakup).",
          "Kadar je bil paket zlorabljen ali so bili kršeni Pogoji uporabe (npr. nalaganje nezakonite vsebine).",
          "Za sorazmerni del že porabljenega obdobja, kadar to izrecno določa ponudba (npr. delno vračilo ni mogoče po izteku garancijskega obdobja).",
        ] },
      ] },
      { title: "4. Zakonska pravica do odstopa (14 dni)", blocks: [
        { type: "p", text: "Kot potrošnik v EU imate praviloma 14-dnevno pravico do odstopa od pogodbe, sklenjene na daljavo. Ker je Guestcam digitalna storitev, ki se začne izvajati takoj po nakupu, se s potrditvijo nakupa strinjate, da storitev začnemo opravljati nemudoma, in priznavate, da pravica do odstopa preneha, ko je storitev v celoti opravljena." },
        { type: "p", text: "Naša 30-dnevna garancija vračila denarja je velikodušnejša od zakonsko predpisanega minimuma in vaših zakonskih pravic ne omejuje." },
      ] },
      { title: "5. Kako zahtevate vračilo", blocks: [
        { type: "p", text: "Pišite nam na info@guestcam.si in navedite:" },
        { type: "ul", items: [
          "e-poštni naslov, povezan z vašim računom Guestcam,",
          "datum nakupa in paket, ki ste ga kupili,",
          "po želji razlog za vračilo (pomaga nam izboljšati storitev).",
        ] },
        { type: "p", text: "Zahtevo običajno obdelamo v 2 delovnih dneh in vas obvestimo o odobritvi." },
      ] },
      { title: "6. Rok in način vračila", blocks: [
        { type: "p", text: "Odobreno vračilo izvedemo na isto plačilno sredstvo, ki je bilo uporabljeno pri nakupu, najkasneje v 14 dneh od odobritve. Čas, da sredstva dejansko prispejo na vaš račun, je odvisen od vaše banke oz. izdajatelja kartice (običajno 5–10 delovnih dni)." },
        { type: "p", text: "Vračila ne zaračunavamo nobenih dodatnih stroškov." },
      ] },
      { title: "7. Brezplačni paket", blocks: [
        { type: "p", text: "Brezplačni paket ne zahteva plačila, zato zanj vračilo ni mogoče in tudi ni potrebno." },
      ] },
      { title: "8. Zavrnitve plačil (chargeback)", blocks: [
        { type: "p", text: "Prosimo, da nas pred sprožitvijo zavrnitve plačila pri banki najprej kontaktirate — večino primerov rešimo hitreje in lažje neposredno. Neupravičene zavrnitve plačil lahko vodijo do zaprtja računa." },
      ] },
      { title: "9. Spremembe te politike", blocks: [
        { type: "p", text: "To politiko lahko občasno posodobimo. O bistvenih spremembah vas obvestimo po e-pošti ali z obvestilom v storitvi. Datum zadnje posodobitve je vedno naveden na vrhu tega dokumenta." },
      ] },
      { title: "10. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: info@guestcam.si", "Davčna številka: SI72133449"] },
      ] },
    ],
  },

  hr: {
    heading: "Politika povrata novca",
    eyebrow: "Pravni dokument",
    lastUpdated: "Zadnje ažurirano: 29. svibnja 2026. · Sport group d.o.o.",
    intro:
      "Želimo da budete potpuno zadovoljni uslugom Guestcam. Zato za prvu kupnju paketa nudimo 30-dnevnu garanciju povrata novca — bez kompliciranih pitanja. Ova politika objašnjava kada i kako možete zatražiti povrat te kako teče postupak.",
    sections: [
      { title: "1. 30-dnevna garancija povrata novca", blocks: [
        { type: "p", text: "Za prvu kupnju plaćenog paketa (Basic, Plus ili Premium) vrijedi 30-dnevna garancija povrata novca. Ako u roku od 30 dana od kupnje niste zadovoljni, vraćamo vam cijeli iznos." },
        { type: "callout", text: "Garancija vrijedi za prvu kupnju pojedinog računa. Za ponovne kupnje ili nadogradnje nakon isteka 30 dana primjenjuju se pravila iz nastavka." },
      ] },
      { title: "2. Uvjeti za povrat", blocks: [
        { type: "ul", items: [
          "Zahtjev podnosite u roku od 30 dana od datuma plaćanja.",
          "Riječ je o prvoj kupnji plaćenog paketa na vašem računu.",
          "Plaćanje je izvršeno putem našeg preprodavača Paddle.",
        ] },
        { type: "p", text: "Nakon odobrenja povrata pristup značajkama plaćenog paketa prestaje, a album se vraća na uvjete besplatnog paketa." },
      ] },
      { title: "3. Kada povrat nije moguć", blocks: [
        { type: "ul", items: [
          "Nakon isteka 30 dana od kupnje.",
          "Za ponovne kupnje, produljenja ili nadogradnje istog računa (vrijedi samo prva kupnja).",
          "Kada je paket zloupotrijebljen ili su prekršeni Uvjeti korištenja (npr. učitavanje nezakonitog sadržaja).",
          "Za razmjerni dio već iskorištenog razdoblja, kada to ponuda izričito određuje.",
        ] },
      ] },
      { title: "4. Zakonsko pravo na odustanak (14 dana)", blocks: [
        { type: "p", text: "Kao potrošač u EU u pravilu imate 14-dnevno pravo na odustanak od ugovora sklopljenog na daljinu. Budući da je Guestcam digitalna usluga koja započinje odmah nakon kupnje, potvrdom kupnje pristajete da uslugu počnemo pružati odmah i priznajete da pravo na odustanak prestaje kada je usluga u potpunosti izvršena." },
        { type: "p", text: "Naša 30-dnevna garancija povrata novca velikodušnija je od zakonskog minimuma i ne ograničava vaša zakonska prava." },
      ] },
      { title: "5. Kako zatražiti povrat", blocks: [
        { type: "p", text: "Pišite nam na info@guestcam.si i navedite:" },
        { type: "ul", items: [
          "e-mail adresu povezanu s vašim Guestcam računom,",
          "datum kupnje i paket koji ste kupili,",
          "po želji razlog povrata (pomaže nam poboljšati uslugu).",
        ] },
        { type: "p", text: "Zahtjev obično obrađujemo u roku od 2 radna dana i obavještavamo vas o odobrenju." },
      ] },
      { title: "6. Rok i način povrata", blocks: [
        { type: "p", text: "Odobreni povrat izvršavamo na isto sredstvo plaćanja korišteno pri kupnji, najkasnije u roku od 14 dana od odobrenja. Vrijeme da sredstva stvarno stignu na vaš račun ovisi o vašoj banci odnosno izdavatelju kartice (obično 5–10 radnih dana)." },
        { type: "p", text: "Za povrat ne naplaćujemo nikakve dodatne troškove." },
      ] },
      { title: "7. Besplatni paket", blocks: [
        { type: "p", text: "Besplatni paket ne zahtijeva plaćanje, pa za njega povrat nije moguć niti potreban." },
      ] },
      { title: "8. Odbijanja plaćanja (chargeback)", blocks: [
        { type: "p", text: "Molimo da nas prije pokretanja odbijanja plaćanja kod banke najprije kontaktirate — većinu slučajeva riješimo brže i jednostavnije izravno. Neopravdana odbijanja plaćanja mogu dovesti do zatvaranja računa." },
      ] },
      { title: "9. Izmjene ove politike", blocks: [
        { type: "p", text: "Ovu politiku možemo povremeno ažurirati. O bitnim izmjenama obavještavamo vas e-poštom ili obaviješću u usluzi. Datum zadnjeg ažuriranja uvijek je naveden na vrhu ovog dokumenta." },
      ] },
      { title: "10. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: info@guestcam.si", "OIB / PDV: SI72133449"] },
      ] },
    ],
  },

  sr: {
    heading: "Politika povraćaja novca",
    eyebrow: "Pravni dokument",
    lastUpdated: "Poslednje ažuriranje: 29. maja 2026. · Sport group d.o.o.",
    intro:
      "Želimo da budete potpuno zadovoljni uslugom Guestcam. Zato za prvu kupovinu paketa nudimo 30-dnevnu garanciju povraćaja novca — bez komplikovanih pitanja. Ova politika objašnjava kada i kako možete zatražiti povraćaj i kako teče postupak.",
    sections: [
      { title: "1. 30-dnevna garancija povraćaja novca", blocks: [
        { type: "p", text: "Za prvu kupovinu plaćenog paketa (Basic, Plus ili Premium) važi 30-dnevna garancija povraćaja novca. Ako u roku od 30 dana od kupovine niste zadovoljni, vraćamo vam ceo iznos." },
        { type: "callout", text: "Garancija važi za prvu kupovinu pojedinačnog naloga. Za ponovne kupovine ili nadogradnje nakon isteka 30 dana primenjuju se pravila iz nastavka." },
      ] },
      { title: "2. Uslovi za povraćaj", blocks: [
        { type: "ul", items: [
          "Zahtev podnosite u roku od 30 dana od datuma plaćanja.",
          "Reč je o prvoj kupovini plaćenog paketa na vašem nalogu.",
          "Plaćanje je izvršeno preko našeg preprodavca Paddle.",
        ] },
        { type: "p", text: "Nakon odobrenja povraćaja pristup funkcijama plaćenog paketa prestaje, a album se vraća na uslove besplatnog paketa." },
      ] },
      { title: "3. Kada povraćaj nije moguć", blocks: [
        { type: "ul", items: [
          "Nakon isteka 30 dana od kupovine.",
          "Za ponovne kupovine, produženja ili nadogradnje istog naloga (važi samo prva kupovina).",
          "Kada je paket zloupotrebljen ili su prekršeni Uslovi korišćenja (npr. otpremanje nezakonitog sadržaja).",
          "Za srazmerni deo već iskorišćenog perioda, kada to ponuda izričito određuje.",
        ] },
      ] },
      { title: "4. Zakonsko pravo na odustanak (14 dana)", blocks: [
        { type: "p", text: "Kao potrošač u EU po pravilu imate 14-dnevno pravo na odustanak od ugovora zaključenog na daljinu. Budući da je Guestcam digitalna usluga koja počinje odmah nakon kupovine, potvrdom kupovine pristajete da uslugu počnemo da pružamo odmah i priznajete da pravo na odustanak prestaje kada je usluga u potpunosti izvršena." },
        { type: "p", text: "Naša 30-dnevna garancija povraćaja novca velikodušnija je od zakonskog minimuma i ne ograničava vaša zakonska prava." },
      ] },
      { title: "5. Kako zatražiti povraćaj", blocks: [
        { type: "p", text: "Pišite nam na info@guestcam.si i navedite:" },
        { type: "ul", items: [
          "e-mail adresu povezanu sa vašim Guestcam nalogom,",
          "datum kupovine i paket koji ste kupili,",
          "po želji razlog povraćaja (pomaže nam da poboljšamo uslugu).",
        ] },
        { type: "p", text: "Zahtev obično obrađujemo u roku od 2 radna dana i obaveštavamo vas o odobrenju." },
      ] },
      { title: "6. Rok i način povraćaja", blocks: [
        { type: "p", text: "Odobreni povraćaj izvršavamo na isto sredstvo plaćanja korišćeno pri kupovini, najkasnije u roku od 14 dana od odobrenja. Vreme da sredstva stvarno stignu na vaš račun zavisi od vaše banke odnosno izdavaoca kartice (obično 5–10 radnih dana)." },
        { type: "p", text: "Za povraćaj ne naplaćujemo nikakve dodatne troškove." },
      ] },
      { title: "7. Besplatni paket", blocks: [
        { type: "p", text: "Besplatni paket ne zahteva plaćanje, pa za njega povraćaj nije moguć niti potreban." },
      ] },
      { title: "8. Odbijanja plaćanja (chargeback)", blocks: [
        { type: "p", text: "Molimo da nas pre pokretanja odbijanja plaćanja kod banke najpre kontaktirate — većinu slučajeva rešavamo brže i jednostavnije direktno. Neopravdana odbijanja plaćanja mogu dovesti do zatvaranja naloga." },
      ] },
      { title: "9. Izmene ove politike", blocks: [
        { type: "p", text: "Ovu politiku možemo povremeno ažurirati. O bitnim izmenama obaveštavamo vas e-poštom ili obaveštenjem u usluzi. Datum poslednjeg ažuriranja uvek je naveden na vrhu ovog dokumenta." },
      ] },
      { title: "10. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: info@guestcam.si", "PIB / PDV: SI72133449"] },
      ] },
    ],
  },

  de: {
    heading: "Rückerstattungsrichtlinie",
    eyebrow: "Rechtliches Dokument",
    lastUpdated: "Zuletzt aktualisiert: 29. Mai 2026 · Sport group d.o.o.",
    intro:
      "Wir möchten, dass Sie mit Guestcam rundum zufrieden sind. Deshalb bieten wir für den ersten Paketkauf eine 30-tägige Geld-zurück-Garantie — ohne komplizierte Rückfragen. Diese Richtlinie erklärt, wann und wie Sie eine Rückerstattung beantragen können und wie der Ablauf ist.",
    sections: [
      { title: "1. 30-tägige Geld-zurück-Garantie", blocks: [
        { type: "p", text: "Für den ersten Kauf eines kostenpflichtigen Pakets (Basic, Plus oder Premium) gilt eine 30-tägige Geld-zurück-Garantie. Wenn Sie innerhalb von 30 Tagen nach dem Kauf nicht zufrieden sind, erstatten wir Ihnen den vollen Betrag." },
        { type: "callout", text: "Die Garantie gilt für den ersten Kauf pro Konto. Für erneute Käufe oder Upgrades nach Ablauf der 30 Tage gelten die Regeln in den folgenden Abschnitten." },
      ] },
      { title: "2. Voraussetzungen für eine Rückerstattung", blocks: [
        { type: "ul", items: [
          "Sie stellen den Antrag innerhalb von 30 Tagen nach dem Zahlungsdatum.",
          "Es handelt sich um den ersten Kauf eines kostenpflichtigen Pakets in Ihrem Konto.",
          "Die Zahlung wurde über unseren Reseller Paddle abgewickelt.",
        ] },
        { type: "p", text: "Nach Genehmigung der Rückerstattung endet der Zugriff auf die Funktionen des kostenpflichtigen Pakets und das Album kehrt zu den Bedingungen des kostenlosen Pakets zurück." },
      ] },
      { title: "3. Wann keine Rückerstattung möglich ist", blocks: [
        { type: "ul", items: [
          "Nach Ablauf von 30 Tagen ab dem Kauf.",
          "Für erneute Käufe, Verlängerungen oder Upgrades desselben Kontos (nur der erste Kauf zählt).",
          "Wenn das Paket missbraucht oder gegen die Nutzungsbedingungen verstoßen wurde (z. B. Hochladen rechtswidriger Inhalte).",
          "Für den anteiligen Teil eines bereits genutzten Zeitraums, sofern das Angebot dies ausdrücklich vorsieht.",
        ] },
      ] },
      { title: "4. Gesetzliches Widerrufsrecht (14 Tage)", blocks: [
        { type: "p", text: "Als Verbraucher in der EU haben Sie grundsätzlich ein 14-tägiges Widerrufsrecht für Fernabsatzverträge. Da Guestcam ein digitaler Dienst ist, der unmittelbar nach dem Kauf beginnt, stimmen Sie mit der Bestätigung des Kaufs zu, dass wir mit der Leistung sofort beginnen, und erkennen an, dass das Widerrufsrecht erlischt, sobald der Dienst vollständig erbracht ist." },
        { type: "p", text: "Unsere 30-tägige Geld-zurück-Garantie ist großzügiger als das gesetzliche Minimum und schränkt Ihre gesetzlichen Rechte nicht ein." },
      ] },
      { title: "5. So beantragen Sie eine Rückerstattung", blocks: [
        { type: "p", text: "Schreiben Sie uns an info@guestcam.si und geben Sie an:" },
        { type: "ul", items: [
          "die mit Ihrem Guestcam-Konto verknüpfte E-Mail-Adresse,",
          "das Kaufdatum und das gekaufte Paket,",
          "optional den Grund für die Rückerstattung (hilft uns, den Dienst zu verbessern).",
        ] },
        { type: "p", text: "Wir bearbeiten Anträge in der Regel innerhalb von 2 Werktagen und informieren Sie über die Genehmigung." },
      ] },
      { title: "6. Frist und Art der Rückerstattung", blocks: [
        { type: "p", text: "Eine genehmigte Rückerstattung erfolgt auf dasselbe Zahlungsmittel, das beim Kauf verwendet wurde, spätestens innerhalb von 14 Tagen nach der Genehmigung. Wie lange es dauert, bis das Geld tatsächlich auf Ihrem Konto eingeht, hängt von Ihrer Bank bzw. Ihrem Kartenaussteller ab (in der Regel 5–10 Werktage)." },
        { type: "p", text: "Für die Rückerstattung berechnen wir keine zusätzlichen Gebühren." },
      ] },
      { title: "7. Kostenloses Paket", blocks: [
        { type: "p", text: "Das kostenlose Paket erfordert keine Zahlung, daher ist hierfür keine Rückerstattung möglich oder notwendig." },
      ] },
      { title: "8. Rückbuchungen (Chargeback)", blocks: [
        { type: "p", text: "Bitte kontaktieren Sie uns zuerst, bevor Sie eine Rückbuchung bei Ihrer Bank veranlassen — die meisten Fälle lösen wir direkt schneller und einfacher. Unberechtigte Rückbuchungen können zur Schließung des Kontos führen." },
      ] },
      { title: "9. Änderungen dieser Richtlinie", blocks: [
        { type: "p", text: "Wir können diese Richtlinie gelegentlich aktualisieren. Über wesentliche Änderungen informieren wir Sie per E-Mail oder durch einen Hinweis im Dienst. Das Datum der letzten Aktualisierung steht stets oben in diesem Dokument." },
      ] },
      { title: "10. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-Mail: info@guestcam.si", "USt-IdNr.: SI72133449"] },
      ] },
    ],
  },

  en: {
    heading: "Refund Policy",
    eyebrow: "Legal document",
    lastUpdated: "Last updated: May 29, 2026 · Sport group d.o.o.",
    intro:
      "We want you to be completely happy with Guestcam. That's why we offer a 30-day money-back guarantee on your first plan purchase — no complicated questions. This policy explains when and how you can request a refund and how the process works.",
    sections: [
      { title: "1. 30-day money-back guarantee", blocks: [
        { type: "p", text: "Your first purchase of a paid plan (Basic, Plus or Premium) is covered by a 30-day money-back guarantee. If you're not satisfied within 30 days of purchase, we'll refund the full amount." },
        { type: "callout", text: "The guarantee applies to the first purchase per account. Repeat purchases or upgrades after the 30-day window are governed by the rules in the sections below." },
      ] },
      { title: "2. Eligibility", blocks: [
        { type: "ul", items: [
          "You submit the request within 30 days of the payment date.",
          "It is the first purchase of a paid plan on your account.",
          "The payment was processed through our reseller, Paddle.",
        ] },
        { type: "p", text: "Once a refund is approved, access to paid-plan features ends and the album reverts to the free-plan terms." },
      ] },
      { title: "3. When a refund is not available", blocks: [
        { type: "ul", items: [
          "After 30 days have passed since the purchase.",
          "For repeat purchases, renewals or upgrades on the same account (only the first purchase qualifies).",
          "Where the plan has been misused or the Terms of Service have been breached (e.g. uploading unlawful content).",
          "For the pro-rata portion of a period already used, where the offer expressly states so.",
        ] },
      ] },
      { title: "4. Statutory right of withdrawal (14 days)", blocks: [
        { type: "p", text: "As an EU consumer, you generally have a 14-day right to withdraw from a distance contract. Because Guestcam is a digital service that begins immediately after purchase, by confirming your purchase you agree that we may start performing the service right away and acknowledge that the right of withdrawal lapses once the service has been fully performed." },
        { type: "p", text: "Our 30-day money-back guarantee is more generous than the statutory minimum and does not limit your statutory rights." },
      ] },
      { title: "5. How to request a refund", blocks: [
        { type: "p", text: "Email us at info@guestcam.si and include:" },
        { type: "ul", items: [
          "the email address linked to your Guestcam account,",
          "the date of purchase and the plan you bought,",
          "optionally, the reason for the refund (it helps us improve the service).",
        ] },
        { type: "p", text: "We usually process requests within 2 business days and let you know once they're approved." },
      ] },
      { title: "6. Timing and method of refund", blocks: [
        { type: "p", text: "Approved refunds are issued to the same payment method used for the purchase, within 14 days of approval at the latest. How long the funds take to actually reach your account depends on your bank or card issuer (typically 5–10 business days)." },
        { type: "p", text: "We do not charge any additional fees for a refund." },
      ] },
      { title: "7. Free plan", blocks: [
        { type: "p", text: "The free plan requires no payment, so there is nothing to refund and no refund is needed." },
      ] },
      { title: "8. Chargebacks", blocks: [
        { type: "p", text: "Please contact us before initiating a chargeback with your bank — we resolve most cases faster and more easily directly. Unjustified chargebacks may lead to account closure." },
      ] },
      { title: "9. Changes to this policy", blocks: [
        { type: "p", text: "We may update this policy from time to time. We'll notify you of material changes by email or with a notice in the service. The last-updated date is always shown at the top of this document." },
      ] },
      { title: "10. Contact", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "VAT ID: SI72133449"] },
      ] },
    ],
  },

  es: {
    heading: "Política de reembolsos",
    eyebrow: "Documento legal",
    lastUpdated: "Última actualización: 29 de mayo de 2026 · Sport group d.o.o.",
    intro:
      "Queremos que estés completamente satisfecho con Guestcam. Por eso ofrecemos una garantía de devolución de 30 días en tu primera compra de un plan, sin preguntas complicadas. Esta política explica cuándo y cómo puedes solicitar un reembolso y cómo funciona el proceso.",
    sections: [
      { title: "1. Garantía de devolución de 30 días", blocks: [
        { type: "p", text: "Tu primera compra de un plan de pago (Basic, Plus o Premium) está cubierta por una garantía de devolución de 30 días. Si no quedas satisfecho dentro de los 30 días posteriores a la compra, te devolvemos el importe íntegro." },
        { type: "callout", text: "La garantía se aplica a la primera compra por cuenta. Las compras repetidas o las mejoras tras el plazo de 30 días se rigen por las reglas de los apartados siguientes." },
      ] },
      { title: "2. Requisitos para el reembolso", blocks: [
        { type: "ul", items: [
          "Presentas la solicitud dentro de los 30 días desde la fecha de pago.",
          "Se trata de la primera compra de un plan de pago en tu cuenta.",
          "El pago se procesó a través de nuestro revendedor, Paddle.",
        ] },
        { type: "p", text: "Una vez aprobado el reembolso, finaliza el acceso a las funciones del plan de pago y el álbum vuelve a las condiciones del plan gratuito." },
      ] },
      { title: "3. Cuándo no procede el reembolso", blocks: [
        { type: "ul", items: [
          "Una vez transcurridos 30 días desde la compra.",
          "En compras repetidas, renovaciones o mejoras de la misma cuenta (solo cuenta la primera compra).",
          "Cuando se ha hecho un uso indebido del plan o se han incumplido los Términos de uso (p. ej., subir contenido ilícito).",
          "Por la parte proporcional de un período ya utilizado, cuando la oferta así lo indique expresamente.",
        ] },
      ] },
      { title: "4. Derecho legal de desistimiento (14 días)", blocks: [
        { type: "p", text: "Como consumidor en la UE, por lo general dispones de un derecho de desistimiento de 14 días en los contratos a distancia. Dado que Guestcam es un servicio digital que comienza de inmediato tras la compra, al confirmar tu compra aceptas que empecemos a prestar el servicio enseguida y reconoces que el derecho de desistimiento se extingue una vez que el servicio se ha prestado por completo." },
        { type: "p", text: "Nuestra garantía de devolución de 30 días es más generosa que el mínimo legal y no limita tus derechos legales." },
      ] },
      { title: "5. Cómo solicitar un reembolso", blocks: [
        { type: "p", text: "Escríbenos a info@guestcam.si e indica:" },
        { type: "ul", items: [
          "el correo electrónico vinculado a tu cuenta de Guestcam,",
          "la fecha de compra y el plan que compraste,",
          "opcionalmente, el motivo del reembolso (nos ayuda a mejorar el servicio).",
        ] },
        { type: "p", text: "Solemos tramitar las solicitudes en un plazo de 2 días hábiles y te avisamos cuando se aprueban." },
      ] },
      { title: "6. Plazo y forma del reembolso", blocks: [
        { type: "p", text: "Los reembolsos aprobados se emiten al mismo método de pago utilizado en la compra, en un plazo máximo de 14 días desde la aprobación. El tiempo que tarda el dinero en llegar realmente a tu cuenta depende de tu banco o emisor de la tarjeta (normalmente entre 5 y 10 días hábiles)." },
        { type: "p", text: "No cobramos ninguna comisión adicional por un reembolso." },
      ] },
      { title: "7. Plan gratuito", blocks: [
        { type: "p", text: "El plan gratuito no requiere pago, por lo que no hay nada que reembolsar ni es necesario hacerlo." },
      ] },
      { title: "8. Contracargos (chargeback)", blocks: [
        { type: "p", text: "Por favor, contáctanos antes de iniciar un contracargo con tu banco: resolvemos la mayoría de los casos de forma más rápida y sencilla directamente. Los contracargos injustificados pueden dar lugar al cierre de la cuenta." },
      ] },
      { title: "9. Cambios en esta política", blocks: [
        { type: "p", text: "Podemos actualizar esta política de vez en cuando. Te notificaremos los cambios importantes por correo electrónico o mediante un aviso en el servicio. La fecha de la última actualización siempre aparece en la parte superior de este documento." },
      ] },
      { title: "10. Contacto", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "NIF / IVA: SI72133449"] },
      ] },
    ],
  },
};
