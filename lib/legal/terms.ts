import type { LangCode } from "@/components/LanguageSwitcher";
import type { LegalDoc } from "./types";

export const termsDoc: Record<LangCode, LegalDoc> = {
  sl: {
    heading: "Pogoji uporabe",
    eyebrow: "Pravni dokument",
    lastUpdated: "Zadnja posodobitev: 1. januar 2026 · Sport group d.o.o.",
    intro:
      "Z uporabo storitve Guestcam (v nadaljevanju: “storitev”) sprejemate te pogoje uporabe. Storitev nudi Sport group d.o.o. Če se s pogoji ne strinjate, prosimo, da storitve ne uporabljate.",
    sections: [
      { title: "1. Opis storitve", blocks: [
        { type: "p", text: "Guestcam je SaaS storitev za zbiranje fotografij in videov gostov na poročnih in drugih dogodkih prek unikatne QR kode. Storitev obsega:" },
        { type: "ul", items: [
          "Ustvarjanje zasebne galerije z unikatno QR kodo.",
          "Shranjevanje fotografij in videoposnetkov v polni kakovosti.",
          "Prenos vsebine galerije (ZIP).",
          "Generiranje video filma iz fotografij (Premium dodatek).",
          "Personalizacijo galerije in tiskovin (predloge).",
        ] },
      ] },
      { title: "2. Pogoji za uporabo", blocks: [
        { type: "ul", items: [
          "Storitev je namenjena polnoletnim fizičnim osebam in pravnim osebam.",
          "Organizator (osebek, ki ustvari galerijo) je odgovoren za vsebino, ki jo naložijo gosti.",
          "Storitve ne smete uporabljati v nezakonite namene ali za kršitev pravic tretjih oseb.",
        ] },
      ] },
      { title: "3. Lastništvo vsebine", blocks: [
        { type: "p", text: "Vse fotografije in videoposnetki ostanejo last organizatorja in oseb, ki so jih naložile. Guestcam vsebine ne uporablja za oglaševanje, AI treninge ali javno objavo. Storitev nima pravice do uporabe vaše vsebine v marketinške ali komercialne namene." },
      ] },
      { title: "4. Paketi in omejitve", blocks: [
        { type: "p", text: "Storitev je na voljo v štirih paketih (Brezplačni, Basic, Plus, Premium) z različnimi omejitvami glede števila fotografij, časa hrambe in funkcionalnosti. Trenutne omejitve so vedno navedene na strani s ceniki." },
        { type: "ul", items: [
          "Brezplačni paket — testna galerija do 20 fotografij za 30 dni.",
          "Basic paket — do 1000 fotografij, dostop 3 mesece.",
          "Plus paket — do 500 fotografij in 100 videov, dostop 1 leto, Live galerija.",
          "Premium paket — neomejene fotografije, Film Studio, prednostna podpora.",
        ] },
      ] },
      { title: "5. Plačila in vračila", blocks: [
        { type: "ul", items: [
          "Plačila in izdajo računov izvaja naš preprodajalec Paddle (Paddle.com Market Ltd) kot pogodbeni prodajalec (Merchant of Record), ki obračuna tudi DDV. Paddle sprejema kartice, Apple Pay, Google Pay in PayPal.",
          "Cene so navedene v EUR brez DDV (DDV se obračuna v skladu z veljavno zakonodajo).",
          "Ponujamo 30-dnevno garancijo vračila denarja za prvi nakup paketa. Vračilo lahko zahtevate prek e-pošte hello@guestcam.si.",
        ] },
      ] },
      { title: "6. Dovoljene vsebine (Acceptable Use)", blocks: [
        { type: "p", text: "V galerijo ne smete naložiti vsebin, ki:" },
        { type: "ul", items: [
          "so nezakonite, žaljive, diskriminatorne ali nasilne;",
          "kršijo avtorske pravice ali pravice zasebnosti tretjih oseb;",
          "vsebujejo otroško pornografijo ali spolno zlorabo;",
          "so namenjene oglaševanju brez naše pisne privolitve;",
          "vsebujejo zlonamerno programsko kodo ali viruse.",
        ] },
        { type: "p", text: "V primeru kršitve si pridržujemo pravico do brisanja vsebine in/ali ukinitve računa brez vračila denarja." },
      ] },
      { title: "7. Razpoložljivost storitve", blocks: [
        { type: "p", text: "Prizadevamo si za 99,9-odstotno razpoložljivost storitve. V primeru načrtovanega vzdrževanja vas obvestimo vnaprej prek e-pošte. Storitev se lahko občasno prekine zaradi tehničnih razlogov. Nismo odgovorni za izgubo dohodka ali drugo škodo zaradi nedosegljivosti." },
      ] },
      { title: "8. Odgovornost", blocks: [
        { type: "p", text: "Storitev je na voljo “as-is”. Trudimo se zagotoviti varno in zanesljivo storitev, vendar ne moremo jamčiti, da bo brez napak. Naša odgovornost je omejena na znesek, ki ste ga plačali v zadnjih 12 mesecih za storitev. Nismo odgovorni za posredne ali posledične škode (izgubljen dohodek, izguba podatkov, kjer obstaja vaša lokalna kopija itd.)." },
      ] },
      { title: "9. Sprememba pogojev", blocks: [
        { type: "p", text: "Pridržujemo si pravico do spremembe pogojev. O bistvenih spremembah vas bomo obvestili prek e-pošte vsaj 30 dni vnaprej. Z nadaljnjo uporabo storitve po sprejetju sprememb potrjujete strinjanje s posodobljenimi pogoji." },
      ] },
      { title: "10. Veljavno pravo in pristojnost", blocks: [
        { type: "p", text: "Za te pogoje velja slovensko pravo. Vsi spori se rešujejo pred pristojnim sodiščem v Ljubljani, Slovenija." },
      ] },
      { title: "11. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: hello@guestcam.si", "Davčna številka: SI72133449"] },
      ] },
    ],
  },
  hr: {
    heading: "Uvjeti korištenja",
    eyebrow: "Pravni dokument",
    lastUpdated: "Zadnje ažurirano: 1. siječnja 2026 · Sport group d.o.o.",
    intro:
      "Korištenjem usluge Guestcam (u nastavku: “ausluga”) prihvaćate ove uvjete korištenja. Uslugu pruža Sport group d.o.o. Ako se s uvjetima ne slažete, molimo ne koristite uslugu.",
    sections: [
      { title: "1. Opis usluge", blocks: [
        { type: "p", text: "Guestcam je SaaS usluga za prikupljanje fotografija i videozapisa gostiju na vjenčanjima i drugim događajima putem jedinstvenog QR koda. Usluga obuhvaća:" },
        { type: "ul", items: [
          "Kreiranje privatne galerije s jedinstvenim QR kodom.",
          "Pohranu fotografija i videozapisa u punoj kvaliteti.",
          "Preuzimanje sadržaja galerije (ZIP).",
          "Generiranje video filma iz fotografija (Premium dodatak).",
          "Personalizaciju galerije i materijala za ispis (predlošci).",
        ] },
      ] },
      { title: "2. Uvjeti korištenja", blocks: [
        { type: "ul", items: [
          "Usluga je namijenjena punoljetnim fizičkim i pravnim osobama.",
          "Organizator (osoba koja kreira galeriju) odgovoran je za sadržaj koji učitaju gosti.",
          "Uslugu ne smijete koristiti u nezakonite svrhe ili za kršenje prava trećih osoba.",
        ] },
      ] },
      { title: "3. Vlasništvo sadržaja", blocks: [
        { type: "p", text: "Sve fotografije i videozapisi ostaju vlasništvo organizatora i osoba koje su ih učitale. Guestcam sadržaj ne koristi za oglašavanje, treniranje AI-a ni javnu objavu. Usluga nema pravo koristiti vaš sadržaj u marketinške ili komercijalne svrhe." },
      ] },
      { title: "4. Paketi i ograničenja", blocks: [
        { type: "p", text: "Usluga je dostupna u četiri paketa (Besplatan, Basic, Plus, Premium) s različitim ograničenjima broja fotografija, vremena pohrane i funkcionalnosti. Aktualna ograničenja uvijek su navedena na stranici s cijenama." },
        { type: "ul", items: [
          "Besplatan paket — testna galerija do 20 fotografija na 30 dana.",
          "Basic paket — do 1000 fotografija, pristup 3 mjeseca.",
          "Plus paket — do 500 fotografija i 100 videozapisa, pristup 1 godina, Live galerija.",
          "Premium paket — neograničene fotografije, Film Studio, prioritetna podrška.",
        ] },
      ] },
      { title: "5. Plaćanja i povrati", blocks: [
        { type: "ul", items: [
          "Plaćanja i izdavanje računa obavlja naš preprodavač Paddle (Paddle.com Market Ltd) kao ugovorni prodavatelj (Merchant of Record), koji obračunava i PDV. Paddle prihvaća kartice, Apple Pay, Google Pay i PayPal.",
          "Cijene su navedene u EUR bez PDV-a (PDV se obračunava sukladno važećem zakonodavstvu).",
          "Nudimo 30-dnevno jamstvo povrata novca za prvu kupnju paketa. Povrat zatražite e-poštom na hello@guestcam.si.",
        ] },
      ] },
      { title: "6. Dopušteni sadržaj", blocks: [
        { type: "p", text: "U galeriju ne smijete učitati sadržaj koji:" },
        { type: "ul", items: [
          "je nezakonit, uvredljiv, diskriminirajući ili nasilan;",
          "krši autorska prava ili prava na privatnost trećih osoba;",
          "sadrži dječju pornografiju ili seksualno zlostavljanje;",
          "služi oglašavanju bez našeg pisanog odobrenja;",
          "sadrži zlonamjerni kod ili viruse.",
        ] },
        { type: "p", text: "U slučaju kršenja zadržavamo pravo brisanja sadržaja i/ili ukidanja računa bez povrata novca." },
      ] },
      { title: "7. Dostupnost usluge", blocks: [
        { type: "p", text: "Težimo 99,9 % dostupnosti usluge. O planiranom održavanju obavijestit ćemo vas unaprijed e-poštom. Usluga se može povremeno prekinuti zbog tehničkih razloga. Ne odgovaramo za gubitak prihoda ili drugu štetu zbog nedostupnosti." },
      ] },
      { title: "8. Odgovornost", blocks: [
        { type: "p", text: "Usluga je dostupna “kakva jest”. Trudimo se osigurati sigurnu i pouzdanu uslugu, ali ne možemo jamčiti potpunu odsutnost grešaka. Naša odgovornost ograničena je na iznos koji ste platili u zadnjih 12 mjeseci za uslugu. Ne odgovaramo za neizravnu ili posljedičnu štetu (izgubljeni prihod, gubitak podataka kad postoji vaša lokalna kopija itd.)." },
      ] },
      { title: "9. Izmjena uvjeta", blocks: [
        { type: "p", text: "Zadržavamo pravo izmjene uvjeta. O bitnim izmjenama obavijestit ćemo vas e-poštom najmanje 30 dana unaprijed. Daljnjim korištenjem usluge nakon prihvaćanja izmjena potvrđujete suglasnost s ažuriranim uvjetima." },
      ] },
      { title: "10. Mjerodavno pravo i nadležnost", blocks: [
        { type: "p", text: "Na ove uvjete primjenjuje se slovensko pravo. Svi sporovi rješavaju se pred nadležnim sudom u Ljubljani, Slovenija." },
      ] },
      { title: "11. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: hello@guestcam.si", "OIB: SI72133449"] },
      ] },
    ],
  },
  sr: {
    heading: "Uslovi korišćenja",
    eyebrow: "Pravni dokument",
    lastUpdated: "Poslednje ažurirano: 1. januar 2026 · Sport group d.o.o.",
    intro:
      "Korišćenjem usluge Guestcam (u daljem tekstu: “ausluga”) prihvatate ove uslove korišćenja. Uslugu pruža Sport group d.o.o. Ako se sa uslovima ne slažete, molimo ne koristite uslugu.",
    sections: [
      { title: "1. Opis usluge", blocks: [
        { type: "p", text: "Guestcam je SaaS usluga za prikupljanje fotografija i video zapisa gostiju na venčanjima i drugim događajima putem jedinstvenog QR koda. Usluga obuhvata:" },
        { type: "ul", items: [
          "Kreiranje privatne galerije sa jedinstvenim QR kodom.",
          "Čuvanje fotografija i video zapisa u punoj kvaliteti.",
          "Preuzimanje sadržaja galerije (ZIP).",
          "Generisanje video filma iz fotografija (Premium dodatak).",
          "Personalizaciju galerije i materijala za štampu (šabloni).",
        ] },
      ] },
      { title: "2. Uslovi korišćenja", blocks: [
        { type: "ul", items: [
          "Usluga je namenjena punoletnim fizičkim i pravnim licima.",
          "Organizator (lice koje kreira galeriju) odgovorno je za sadržaj koji otpreme gosti.",
          "Uslugu ne smete koristiti u nezakonite svrhe ili za kršenje prava trećih lica.",
        ] },
      ] },
      { title: "3. Vlasništvo sadržaja", blocks: [
        { type: "p", text: "Sve fotografije i video zapisi ostaju vlasništvo organizatora i lica koja su ih otpremila. Guestcam sadržaj ne koristi za reklamiranje, treniranje AI-a ili javno objavljivanje. Usluga nema pravo da koristi vaš sadržaj u marketinške ili komercijalne svrhe." },
      ] },
      { title: "4. Paketi i ograničenja", blocks: [
        { type: "p", text: "Usluga je dostupna u četiri paketa (Besplatan, Basic, Plus, Premium) sa različitim ograničenjima broja fotografija, vremena čuvanja i funkcionalnosti. Aktuelna ograničenja uvek su navedena na stranici sa cenama." },
        { type: "ul", items: [
          "Besplatan paket — testna galerija do 20 fotografija na 30 dana.",
          "Basic paket — do 1000 fotografija, pristup 3 meseca.",
          "Plus paket — do 500 fotografija i 100 video zapisa, pristup 1 godina, Live galerija.",
          "Premium paket — neograničene fotografije, Film Studio, prioritetna podrška.",
        ] },
      ] },
      { title: "5. Plaćanja i povraćaji", blocks: [
        { type: "ul", items: [
          "Plaćanja i izdavanje računa obavlja naš preprodavač Paddle (Paddle.com Market Ltd) kao ugovorni prodavatelj (Merchant of Record), koji obračunava i PDV. Paddle prihvaća kartice, Apple Pay, Google Pay i PayPal.",
          "Cene su navedene u EUR bez PDV-a (PDV se obračunava u skladu sa važećim zakonodavstvom).",
          "Nudimo 30-dnevnu garanciju povraćaja novca za prvu kupovinu paketa. Povraćaj zatražite e-poštom na hello@guestcam.si.",
        ] },
      ] },
      { title: "6. Dozvoljen sadržaj", blocks: [
        { type: "p", text: "U galeriju ne smete otpremiti sadržaj koji:" },
        { type: "ul", items: [
          "je nezakonit, uvredljiv, diskriminatorski ili nasilan;",
          "krši autorska prava ili prava na privatnost trećih lica;",
          "sadrži dečju pornografiju ili seksualno zlostavljanje;",
          "služi za reklamiranje bez našeg pisanog odobrenja;",
          "sadrži zlonamerni kod ili viruse.",
        ] },
        { type: "p", text: "U slučaju kršenja zadržavamo pravo brisanja sadržaja i/ili ukidanja naloga bez povraćaja novca." },
      ] },
      { title: "7. Dostupnost usluge", blocks: [
        { type: "p", text: "Težimo 99,9 % dostupnosti usluge. O planiranom održavanju obavestićemo vas unapred e-poštom. Usluga može povremeno biti prekinuta iz tehničkih razloga. Ne odgovaramo za gubitak prihoda ili drugu štetu zbog nedostupnosti." },
      ] },
      { title: "8. Odgovornost", blocks: [
        { type: "p", text: "Usluga je dostupna “u viđenom stanju”. Trudimo se da obezbedimo sigurnu i pouzdanu uslugu, ali ne možemo garantovati potpuno odsustvo grešaka. Naša odgovornost ograničena je na iznos koji ste platili u poslednjih 12 meseci za uslugu. Ne odgovaramo za posrednu ili posledičnu štetu (izgubljeni prihod, gubitak podataka kada postoji vaša lokalna kopija itd.)." },
      ] },
      { title: "9. Izmena uslova", blocks: [
        { type: "p", text: "Zadržavamo pravo izmene uslova. O bitnim izmenama obavestićemo vas e-poštom najmanje 30 dana unapred. Daljim korišćenjem usluge posle prihvatanja izmena potvrđujete saglasnost sa ažuriranim uslovima." },
      ] },
      { title: "10. Merodavno pravo i nadležnost", blocks: [
        { type: "p", text: "Za ove uslove važi slovenačko pravo. Svi sporovi rešavaju se pred nadležnim sudom u Ljubljani, Slovenija." },
      ] },
      { title: "11. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: hello@guestcam.si", "PIB: SI72133449"] },
      ] },
    ],
  },
  de: {
    heading: "Nutzungsbedingungen",
    eyebrow: "Rechtsdokument",
    lastUpdated: "Zuletzt aktualisiert: 1. Januar 2026 · Sport group d.o.o.",
    intro:
      "Mit der Nutzung des Dienstes Guestcam (im Folgenden: “Dienst”) akzeptieren Sie diese Nutzungsbedingungen. Den Dienst stellt Sport group d.o.o. bereit. Wenn Sie diesen Bedingungen nicht zustimmen, nutzen Sie den Dienst bitte nicht.",
    sections: [
      { title: "1. Leistungsbeschreibung", blocks: [
        { type: "p", text: "Guestcam ist ein SaaS-Dienst zum Sammeln von Fotos und Videos der Gäste bei Hochzeiten und anderen Veranstaltungen über einen eindeutigen QR-Code. Der Dienst umfasst:" },
        { type: "ul", items: [
          "Erstellung einer privaten Galerie mit eindeutigem QR-Code.",
          "Speicherung von Fotos und Videos in voller Qualität.",
          "Download des Galerie-Inhalts (ZIP).",
          "Erstellung eines Videofilms aus Fotos (Premium-Erweiterung).",
          "Personalisierung der Galerie und Druckmaterialien (Vorlagen).",
        ] },
      ] },
      { title: "2. Nutzungsvoraussetzungen", blocks: [
        { type: "ul", items: [
          "Der Dienst ist für volljährige natürliche Personen und juristische Personen bestimmt.",
          "Der Organisator (die Person, die die Galerie erstellt) ist für die von Gästen hochgeladenen Inhalte verantwortlich.",
          "Sie dürfen den Dienst nicht für rechtswidrige Zwecke oder zur Verletzung der Rechte Dritter nutzen.",
        ] },
      ] },
      { title: "3. Eigentum an Inhalten", blocks: [
        { type: "p", text: "Alle Fotos und Videos bleiben Eigentum des Organisators und der Personen, die sie hochgeladen haben. Guestcam nutzt Inhalte weder für Werbung, KI-Training noch zur öffentlichen Veröffentlichung. Der Dienst hat kein Recht, Ihre Inhalte zu Marketing- oder kommerziellen Zwecken zu verwenden." },
      ] },
      { title: "4. Pakete und Beschränkungen", blocks: [
        { type: "p", text: "Der Dienst ist in vier Paketen erhältlich (Kostenlos, Basic, Plus, Premium) mit unterschiedlichen Beschränkungen für Fotoanzahl, Aufbewahrungszeit und Funktionen. Aktuelle Beschränkungen sind jederzeit auf der Preisseite angegeben." },
        { type: "ul", items: [
          "Kostenlos — Testgalerie bis zu 20 Fotos für 30 Tage.",
          "Basic — bis zu 1000 Fotos, Zugriff 3 Monate.",
          "Plus — bis zu 500 Fotos und 100 Videos, Zugriff 1 Jahr, Live-Galerie.",
          "Premium — unbegrenzte Fotos, Film Studio, Priority-Support.",
        ] },
      ] },
      { title: "5. Zahlungen und Rückerstattungen", blocks: [
        { type: "ul", items: [
          "Zahlungen und Rechnungsstellung erfolgen über unseren Reseller Paddle (Paddle.com Market Ltd), der als Verkäufer (Merchant of Record) auftritt und auch die USt. abführt. Paddle akzeptiert Karten, Apple Pay, Google Pay und PayPal.",
          "Preise sind in EUR ohne MwSt. angegeben (MwSt. wird gemäß geltendem Recht berechnet).",
          "Wir gewähren eine 30-tägige Geld-zurück-Garantie für den ersten Paketkauf. Die Rückerstattung können Sie per E-Mail an hello@guestcam.si anfordern.",
        ] },
      ] },
      { title: "6. Zulässige Inhalte (Acceptable Use)", blocks: [
        { type: "p", text: "In die Galerie dürfen Sie keine Inhalte hochladen, die:" },
        { type: "ul", items: [
          "rechtswidrig, beleidigend, diskriminierend oder gewalttätig sind;",
          "Urheberrechte oder Persönlichkeitsrechte Dritter verletzen;",
          "Kinderpornografie oder sexuellen Missbrauch enthalten;",
          "ohne unsere schriftliche Zustimmung Werbezwecken dienen;",
          "Schadcode oder Viren enthalten.",
        ] },
        { type: "p", text: "Bei Verstößen behalten wir uns das Recht vor, Inhalte zu löschen und/oder das Konto ohne Rückerstattung zu sperren." },
      ] },
      { title: "7. Verfügbarkeit des Dienstes", blocks: [
        { type: "p", text: "Wir streben eine Verfügbarkeit von 99,9 % an. Über geplante Wartungen informieren wir Sie im Voraus per E-Mail. Der Dienst kann aus technischen Gründen vorübergehend unterbrochen werden. Wir haften nicht für Einnahmeverluste oder sonstige Schäden aufgrund von Nichtverfügbarkeit." },
      ] },
      { title: "8. Haftung", blocks: [
        { type: "p", text: "Der Dienst wird “wie besehen” angeboten. Wir bemühen uns um einen sicheren und zuverlässigen Dienst, können aber keine Fehlerfreiheit garantieren. Unsere Haftung ist auf den Betrag begrenzt, den Sie in den letzten 12 Monaten für den Dienst gezahlt haben. Wir haften nicht für indirekte oder Folgeschäden (entgangener Gewinn, Datenverlust bei vorhandener lokaler Kopie usw.)." },
      ] },
      { title: "9. Änderung der Bedingungen", blocks: [
        { type: "p", text: "Wir behalten uns das Recht vor, die Bedingungen zu ändern. Über wesentliche Änderungen informieren wir Sie mindestens 30 Tage im Voraus per E-Mail. Mit der weiteren Nutzung des Dienstes nach der Annahme der Änderungen bestätigen Sie Ihr Einverständnis mit den aktualisierten Bedingungen." },
      ] },
      { title: "10. Anwendbares Recht und Gerichtsstand", blocks: [
        { type: "p", text: "Für diese Bedingungen gilt slowenisches Recht. Alle Streitigkeiten werden vor dem zuständigen Gericht in Ljubljana, Slowenien beigelegt." },
      ] },
      { title: "11. Kontakt", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-Mail: hello@guestcam.si", "USt-IdNr.: SI72133449"] },
      ] },
    ],
  },
  en: {
    heading: "Terms of Service",
    eyebrow: "Legal document",
    lastUpdated: "Last updated: January 1, 2026 · Sport group d.o.o.",
    intro:
      "By using the Guestcam service (“service”) you accept these Terms of Service. The service is provided by Sport group d.o.o. If you do not agree to these terms, please do not use the service.",
    sections: [
      { title: "1. Service description", blocks: [
        { type: "p", text: "Guestcam is a SaaS service for collecting guests' photos and videos at weddings and other events via a unique QR code. The service includes:" },
        { type: "ul", items: [
          "Creating a private gallery with a unique QR code.",
          "Storing photos and videos in full quality.",
          "Downloading gallery content (ZIP).",
          "Generating a video film from photos (Premium add-on).",
          "Personalising the gallery and print materials (templates).",
        ] },
      ] },
      { title: "2. Eligibility", blocks: [
        { type: "ul", items: [
          "The service is intended for adults and legal entities.",
          "The organiser (the person who creates the gallery) is responsible for the content uploaded by guests.",
          "You may not use the service for unlawful purposes or to infringe the rights of third parties.",
        ] },
      ] },
      { title: "3. Content ownership", blocks: [
        { type: "p", text: "All photos and videos remain the property of the organiser and the persons who uploaded them. Guestcam does not use content for advertising, AI training or public posting. The service has no right to use your content for marketing or commercial purposes." },
      ] },
      { title: "4. Plans and limits", blocks: [
        { type: "p", text: "The service is available in four plans (Free, Basic, Plus, Premium) with different limits on photo count, retention period and features. Current limits are always shown on the pricing page." },
        { type: "ul", items: [
          "Free — test gallery up to 20 photos for 30 days.",
          "Basic — up to 1000 photos, 3 months access.",
          "Plus — up to 500 photos and 100 videos, 1 year access, Live gallery.",
          "Premium — unlimited photos, Film Studio, priority support.",
        ] },
      ] },
      { title: "5. Payments and refunds", blocks: [
        { type: "ul", items: [
          "Payments and invoicing are handled by our reseller Paddle (Paddle.com Market Ltd), which acts as the Merchant of Record and is responsible for charging VAT. Paddle accepts cards, Apple Pay, Google Pay and PayPal.",
          "Prices are stated in EUR excluding VAT (VAT is charged according to applicable law).",
          "We offer a 30-day money-back guarantee for the first plan purchase. Request a refund by emailing hello@guestcam.si.",
        ] },
      ] },
      { title: "6. Acceptable use", blocks: [
        { type: "p", text: "You may not upload content that:" },
        { type: "ul", items: [
          "is unlawful, defamatory, discriminatory or violent;",
          "infringes the copyright or privacy rights of third parties;",
          "contains child sexual abuse material;",
          "is intended for advertising without our written consent;",
          "contains malicious code or viruses.",
        ] },
        { type: "p", text: "In case of breach, we reserve the right to delete content and/or terminate the account without refund." },
      ] },
      { title: "7. Service availability", blocks: [
        { type: "p", text: "We aim for 99.9% service availability. We will notify you of planned maintenance by email in advance. The service may be interrupted occasionally for technical reasons. We are not liable for loss of income or other damages due to unavailability." },
      ] },
      { title: "8. Liability", blocks: [
        { type: "p", text: "The service is provided “as-is”. We strive to provide a secure and reliable service but cannot guarantee it is error-free. Our liability is limited to the amount you paid for the service in the last 12 months. We are not liable for indirect or consequential damages (lost income, data loss where you have a local copy, etc.)." },
      ] },
      { title: "9. Changes to terms", blocks: [
        { type: "p", text: "We reserve the right to amend these terms. We will notify you of material changes by email at least 30 days in advance. Continued use of the service after the changes take effect constitutes acceptance of the updated terms." },
      ] },
      { title: "10. Governing law and jurisdiction", blocks: [
        { type: "p", text: "These terms are governed by Slovenian law. All disputes are subject to the exclusive jurisdiction of the courts of Ljubljana, Slovenia." },
      ] },
      { title: "11. Contact", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "Email: hello@guestcam.si", "VAT ID: SI72133449"] },
      ] },
    ],
  },
  es: {
    heading: "Términos de uso",
    eyebrow: "Documento legal",
    lastUpdated: "Última actualización: 1 de enero de 2026 · Sport group d.o.o.",
    intro:
      "Al utilizar el servicio Guestcam (en adelante, “servicio”) aceptas estos Términos de uso. El servicio lo proporciona Sport group d.o.o. Si no estás de acuerdo con estos términos, por favor no utilices el servicio.",
    sections: [
      { title: "1. Descripción del servicio", blocks: [
        { type: "p", text: "Guestcam es un servicio SaaS para recopilar fotos y vídeos de los invitados en bodas y otros eventos mediante un código QR único. El servicio incluye:" },
        { type: "ul", items: [
          "Creación de una galería privada con código QR único.",
          "Almacenamiento de fotos y vídeos en calidad completa.",
          "Descarga del contenido de la galería (ZIP).",
          "Generación de un vídeo a partir de las fotos (extra Premium).",
          "Personalización de la galería y materiales impresos (plantillas).",
        ] },
      ] },
      { title: "2. Requisitos de uso", blocks: [
        { type: "ul", items: [
          "El servicio está destinado a personas mayores de edad y entidades jurídicas.",
          "El organizador (persona que crea la galería) es responsable del contenido subido por los invitados.",
          "No puedes utilizar el servicio para fines ilícitos ni para infringir derechos de terceros.",
        ] },
      ] },
      { title: "3. Propiedad del contenido", blocks: [
        { type: "p", text: "Todas las fotos y vídeos siguen siendo propiedad del organizador y de las personas que los subieron. Guestcam no utiliza el contenido para publicidad, entrenamiento de IA ni publicación pública. El servicio no tiene derecho a utilizar tu contenido con fines de marketing o comerciales." },
      ] },
      { title: "4. Planes y límites", blocks: [
        { type: "p", text: "El servicio está disponible en cuatro planes (Gratuito, Basic, Plus, Premium) con distintos límites de número de fotos, tiempo de almacenamiento y funcionalidades. Los límites actuales se muestran siempre en la página de precios." },
        { type: "ul", items: [
          "Gratuito — galería de prueba hasta 20 fotos durante 30 días.",
          "Basic — hasta 1000 fotos, acceso 3 meses.",
          "Plus — hasta 500 fotos y 100 vídeos, acceso 1 año, galería en directo.",
          "Premium — fotos ilimitadas, Film Studio, soporte prioritario.",
        ] },
      ] },
      { title: "5. Pagos y reembolsos", blocks: [
        { type: "ul", items: [
          "Los pagos y la facturación los gestiona nuestro revendedor Paddle (Paddle.com Market Ltd), que actúa como vendedor oficial (Merchant of Record) y se encarga de aplicar el IVA. Paddle acepta tarjetas, Apple Pay, Google Pay y PayPal.",
          "Los precios se indican en EUR sin IVA (el IVA se aplica según la legislación vigente).",
          "Ofrecemos garantía de devolución de 30 días en la primera compra de un plan. Solicita el reembolso por email a hello@guestcam.si.",
        ] },
      ] },
      { title: "6. Uso aceptable", blocks: [
        { type: "p", text: "No puedes subir contenido que:" },
        { type: "ul", items: [
          "sea ilícito, ofensivo, discriminatorio o violento;",
          "infrinja derechos de autor o de privacidad de terceros;",
          "contenga material de abuso sexual infantil;",
          "esté destinado a publicidad sin nuestro consentimiento por escrito;",
          "contenga código malicioso o virus.",
        ] },
        { type: "p", text: "En caso de incumplimiento, nos reservamos el derecho a eliminar el contenido y/o cerrar la cuenta sin reembolso." },
      ] },
      { title: "7. Disponibilidad del servicio", blocks: [
        { type: "p", text: "Aspiramos a una disponibilidad del 99,9 %. Te notificaremos las tareas de mantenimiento programadas por email con antelación. El servicio puede interrumpirse ocasionalmente por motivos técnicos. No nos hacemos responsables de pérdidas de ingresos u otros daños debidos a indisponibilidad." },
      ] },
      { title: "8. Responsabilidad", blocks: [
        { type: "p", text: "El servicio se proporciona “tal cual”. Nos esforzamos por ofrecer un servicio seguro y fiable, pero no podemos garantizar que esté libre de errores. Nuestra responsabilidad se limita al importe que hayas pagado por el servicio en los últimos 12 meses. No respondemos de daños indirectos o derivados (lucro cesante, pérdida de datos cuando exista una copia local, etc.)." },
      ] },
      { title: "9. Modificación de los términos", blocks: [
        { type: "p", text: "Nos reservamos el derecho de modificar los términos. Te notificaremos los cambios importantes por email al menos con 30 días de antelación. El uso continuado del servicio tras la entrada en vigor de los cambios implica la aceptación de los términos actualizados." },
      ] },
      { title: "10. Ley aplicable y jurisdicción", blocks: [
        { type: "p", text: "Estos términos se rigen por la legislación eslovena. Todas las disputas se someten a la jurisdicción exclusiva de los tribunales de Liubliana, Eslovenia." },
      ] },
      { title: "11. Contacto", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "Email: hello@guestcam.si", "CIF: SI72133449"] },
      ] },
    ],
  },
};
