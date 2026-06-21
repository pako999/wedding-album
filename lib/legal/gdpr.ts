import type { LangCode } from "@/components/LanguageSwitcher";
import type { LegalDoc } from "./types";

export const gdprDoc: Record<LangCode, LegalDoc> = {
  sl: {
    heading: “Politika zasebnosti in varstva osebnih podatkov”,
    eyebrow: “Pravni dokument”,
    lastUpdated: “Zadnja posodobitev: 1. maj 2026 · Sport Group d.o.o.”,
    intro:
      “Ta politika zasebnosti pojasnjuje, kako Guestcam obdeluje osebne podatke pri uporabi spletne platforme Guestcam, ki organizatorjem dogodkov omogoča ustvarjanje zasebnih galerij za nalaganje, ogled in prenos fotografij ter videov z dogodkov.”,
    sections: [
      { title: “1. Kdo smo”, blocks: [
        { type: “p”, text: “Guestcam je spletna storitev za zasebno zbiranje fotografij in videov z dogodkov prek QR kode ali zasebne povezave.” },
        { type: “contactCard”, lines: [“Upravljavec platforme:”, “Sport Group d.o.o.”, “Osojnikova 4a”, “2000 Maribor”, “Slovenija”, “E-pošta: info@guestcam.si”] },
        { type: “p”, text: “Za vprašanja glede zasebnosti nas lahko kontaktirate na: info@guestcam.si” },
      ] },
      { title: “2. Vloga Guestcam in organizatorja dogodka”, blocks: [
        { type: “p”, text: “Pri uporabi Guestcam obstajata dve različni vlogi.” },
        { type: “p”, text: “Za podatke, ki jih obdelujemo za upravljanje platforme, naročila, plačila, uporabniške račune, podporo in komunikacijo, je Guestcam praviloma upravljavec osebnih podatkov.” },
        { type: “p”, text: “Za fotografije, videe in drugo vsebino, ki jo gostje naložijo v galerijo določenega dogodka, je praviloma upravljavec organizator dogodka. Organizator odloča, zakaj se galerija uporablja, kdo ima dostop, koliko časa bo galerija aktivna in kako bo goste obvestil o obdelavi. Guestcam v tem primeru deluje kot obdelovalec, ki zagotavlja tehnično platformo za nalaganje, shranjevanje, prikaz in prenos vsebin po navodilih organizatorja.” },
      ] },
      { title: “3. Katere osebne podatke obdelujemo”, blocks: [
        { type: “p”, text: “Obdelujemo lahko naslednje vrste podatkov:” },
        { type: “h3”, text: “Podatki organizatorja:” },
        { type: “p”, text: “ime in priimek, e-poštni naslov, telefonska številka, podatki o podjetju, podatki za račun, podatki o naročilu, komunikacija s podporo.” },
        { type: “h3”, text: “Podatki gostov:” },
        { type: “p”, text: “fotografije, videi, ime ali vzdevek, če ga gost vnese, čas nalaganja, tehnični podatki o uporabi storitve, IP naslov in podatki o napravi.” },
        { type: “h3”, text: “Fotografije in videi:” },
        { type: “p”, text: “Fotografije in videi lahko vsebujejo podobe oseb. Če je oseba na fotografiji ali videu prepoznavna, se takšna vsebina lahko šteje za osebni podatek.” },
        { type: “h3”, text: “Tehnični podatki:” },
        { type: “p”, text: “IP naslov, vrsta naprave, brskalnik, čas dostopa, dnevniške datoteke, piškotki in podobne tehnologije, potrebne za delovanje in varnost platforme.” },
      ] },
      { title: “4. Namen obdelave osebnih podatkov”, blocks: [
        { type: “p”, text: “Osebne podatke obdelujemo za naslednje namene:” },
        { type: “ul”, items: [
          “ustvarjanje in upravljanje dogodkov;”,
          “omogočanje nalaganja fotografij in videov;”,
          “prikaz zasebne galerije organizatorju in osebam s povezavo;”,
          “omogočanje prenosa fotografij in videov;”,
          “obdelava naročil, plačil in računov;”,
          “zagotavljanje tehnične podpore;”,
          “preprečevanje zlorab, neželene vsebine in varnostnih incidentov;”,
          “izboljševanje delovanja platforme;”,
          “izpolnjevanje zakonskih obveznosti;”,
          “komunikacija z organizatorji in uporabniki.”,
        ] },
      ] },
      { title: “5. Pravna podlaga za obdelavo”, blocks: [
        { type: “p”, text: “Osebne podatke obdelujemo na podlagi ene ali več naslednjih pravnih podlag:” },
        { type: “ul”, items: [
          “izvedba pogodbe ali storitve;”,
          “privolitev posameznika;”,
          “zakoniti interes, na primer zagotavljanje varnosti, preprečevanje zlorab in izboljšanje storitve;”,
          “izpolnjevanje zakonskih obveznosti, na primer računovodske in davčne obveznosti;”,
          “navodila organizatorja dogodka, kadar Guestcam deluje kot obdelovalec.”,
        ] },
        { type: “p”, text: “Organizator dogodka je odgovoren, da za uporabo fotografij in videov v galeriji zagotovi ustrezno pravno podlago in da goste jasno obvesti o uporabi Guestcam galerije.” },
      ] },
      { title: “6. Fotografije in videi dogodkov”, blocks: [
        { type: “p”, text: “Guestcam omogoča organizatorjem dogodkov, da ustvarijo zasebno spletno galerijo, v katero lahko gostje prostovoljno nalagajo fotografije in videe z dogodka.” },
        { type: “p”, text: “Guestcam ni organizator dogodka in ne odloča, katere fotografije ali videi bodo naloženi. Organizator dogodka je odgovoren za obveščanje gostov in drugih udeležencev o uporabi galerije, namenu obdelave, obdobju hrambe in njihovih pravicah.” },
        { type: “p”, text: “Gostje naj ne nalagajo fotografij ali videov oseb, ki očitno ne želijo biti fotografirane ali prikazane v galeriji. Posebna previdnost je potrebna pri fotografijah otrok, zaposlenih, občutljivih situacijah ali vsebinah, ki bi lahko razkrivale zdravstvene podatke, verska prepričanja ali druge občutljive informacije.” },
      ] },
      { title: “7. Otroci”, blocks: [
        { type: “p”, text: “Guestcam ni namenjen neposredni uporabi otrok brez nadzora odrasle osebe. Če dogodek vključuje otroke, mora organizator zagotoviti ustrezno pravno podlago in, kadar je potrebno, soglasje staršev ali zakonitih zastopnikov.” },
        { type: “p”, text: “Če prejmete zahtevo za izbris fotografije otroka, jo bomo obravnavali prednostno v sodelovanju z organizatorjem dogodka.” },
      ] },
      { title: “8. Dostop do galerije”, blocks: [
        { type: “p”, text: “Galerije niso javno objavljene. Dostop je omogočen prek zasebne povezave ali QR kode, ki jo zagotovi organizator.” },
        { type: “p”, text: “Vsaka oseba, ki ima povezavo ali QR kodo, lahko potencialno dostopa do galerije, če organizator ne nastavi dodatnih omejitev. Organizator je odgovoren za varno deljenje povezave in odločitev, komu omogoči dostop.” },
      ] },
      { title: “9. Hramba podatkov”, blocks: [
        { type: “p”, text: “Fotografije, videi in galerije se hranijo toliko časa, kot je potrebno za izvedbo storitve oziroma toliko časa, kot je dogovorjeno z organizatorjem.” },
        { type: “p”, text: “Po izteku obdobja hrambe se vsebine izbrišejo ali anonimizirajo, razen če je daljša hramba potrebna zaradi zakonskih obveznosti, reševanja sporov, preprečevanja zlorab ali varnostnih razlogov.” },
        { type: “p”, text: “Računovodski in poslovni podatki se hranijo skladno z veljavno zakonodajo.” },
      ] },
      { title: “10. Deljenje podatkov s tretjimi osebami”, blocks: [
        { type: “p”, text: “Osebnih podatkov ne prodajamo.” },
        { type: “p”, text: “Podatke lahko delimo z zaupanja vrednimi ponudniki storitev, ki nam pomagajo pri delovanju platforme, na primer:” },
        { type: “ul”, items: [
          “ponudniki gostovanja in strežniške infrastrukture;”,
          “ponudniki e-poštnih storitev;”,
          “ponudniki plačilnih storitev;”,
          “analitična in varnostna orodja;”,
          “računovodski in pravni svetovalci;”,
          “organi, kadar to zahteva zakon.”,
        ] },
        { type: “p”, text: “S ponudniki storitev sklenemo ustrezne pogodbe in od njih zahtevamo ustrezno varstvo osebnih podatkov.” },
      ] },
      { title: “11. Prenosi podatkov izven EU/EGP”, blocks: [
        { type: “p”, text: “Kadar se osebni podatki prenašajo izven Evropske unije ali Evropskega gospodarskega prostora, zagotovimo ustrezne zaščitne ukrepe, kot so standardne pogodbene klavzule, ustrezne odločitve Evropske komisije ali drugi zakoniti mehanizmi prenosa.” },
      ] },
      { title: “12. Varnost”, blocks: [
        { type: “p”, text: “Uporabljamo razumne tehnične in organizacijske ukrepe za zaščito osebnih podatkov pred nepooblaščenim dostopom, izgubo, zlorabo, spremembo ali razkritjem.” },
        { type: “p”, text: “Kljub temu noben sistem ni popolnoma varen. Organizatorji morajo povezave do galerij deliti previdno in samo z osebami, ki jim želijo omogočiti dostop.” },
      ] },
      { title: “13. Pravice posameznikov”, blocks: [
        { type: “p”, text: “Posamezniki imajo lahko naslednje pravice:” },
        { type: “ul”, items: [
          “pravica do dostopa do osebnih podatkov;”,
          “pravica do popravka;”,
          “pravica do izbrisa;”,
          “pravica do omejitve obdelave;”,
          “pravica do ugovora;”,
          “pravica do prenosljivosti podatkov;”,
          “pravica do umika privolitve, kadar obdelava temelji na privolitvi;”,
          “pravica do pritožbe pri nadzornem organu.”,
        ] },
        { type: “p”, text: “V Sloveniji je nadzorni organ Informacijski pooblaščenec Republike Slovenije.” },
        { type: “p”, text: “Če želite odstranitev fotografije ali videa iz galerije, se najprej obrnite na organizatorja dogodka. Lahko se obrnete tudi na Guestcam podporo na info@guestcam.si, mi pa bomo zahtevo obravnavali v razumnem roku in po potrebi v sodelovanju z organizatorjem.” },
      ] },
      { title: “14. Piškotki”, blocks: [
        { type: “p”, text: “Guestcam lahko uporablja nujne piškotke za delovanje spletne strani, varnost, prijavo in osnovne funkcije platforme.” },
        { type: “p”, text: “Če uporabljamo analitične ali marketinške piškotke, jih uporabimo samo v skladu z veljavno zakonodajo in, kadar je potrebno, po pridobitvi privolitve.” },
      ] },
      { title: “15. Odgovornost organizatorja”, blocks: [
        { type: “p”, text: “Organizator dogodka potrjuje, da bo goste in udeležence dogodka obvestil o uporabi Guestcam galerije, zagotovil ustrezno pravno podlago za obdelavo fotografij in videov ter odgovarjal na zahteve udeležencev v zvezi z vsebino galerije.” },
        { type: “p”, text: “Organizator je odgovoren za vsebino, ki jo deli, prenaša, objavlja ali uporablja izven platforme Guestcam.” },
      ] },
      { title: “16. Kontakt”, blocks: [
        { type: “p”, text: “Za vprašanja glede zasebnosti, varstva osebnih podatkov ali zahteve za izbris nas kontaktirajte:” },
        { type: “contactCard”, lines: [“Guestcam”, “E-pošta: info@guestcam.si”, “Upravljavec platforme: Sport Group d.o.o., Osojnikova 4a, 2000 Maribor, Slovenija”] },
      ] },
    ],
  },
  hr: {
    heading: "Prava prema GDPR-u",
    eyebrow: "Pravni dokument",
    lastUpdated: "Zadnje ažurirano: 1. siječnja 2026 · Sport group d.o.o.",
    intro:
      "Opća uredba o zaštiti podataka (GDPR — Uredba EU 2016/679) svakom pojedincu u EU daje skup prava u vezi s njegovim osobnim podacima. Niže je pregled kako ta prava ostvarujete kod usluge Guestcam.",
    sections: [
      { title: "1. Pravo na pristup (čl. 15)", blocks: [
        { type: "p", text: "U svakom trenutku možete zatražiti kopiju svih osobnih podataka koje o vama čuvamo. Odgovaramo u roku od 30 dana. Odgovor uključuje izvoznu datoteku (JSON), popis fotografija i metapodataka te informacije o tome s kojim obrađivačima dijelimo podatke." },
      ] },
      { title: "2. Pravo na ispravak (čl. 16)", blocks: [
        { type: "p", text: "Ako su neki od vaših osobnih podataka netočni ili nepotpuni, zatražite ispravak. Većinu podataka organizatora možete sami urediti u postavkama galerije; za ostalo nas kontaktirajte." },
      ] },
      { title: "3. Pravo na brisanje (čl. 17)", blocks: [
        { type: "p", text: "Možete zatražiti trajno brisanje računa i svih povezanih podataka. To uključuje galerije koje ste kreirali i fotografije učitane pod vašim računom. Brisanje izvršavamo u roku od 30 dana, osim kad nas zakon obvezuje na čuvanje (npr. računovodstveni zapisi — 10 godina)." },
      ] },
      { title: "4. Pravo na ograničenje obrade (čl. 18) i prigovor (čl. 21)", blocks: [
        { type: "p", text: "Obradu svojih podataka možete ograničiti ili joj prigovoriti kada se temelji na našem legitimnom interesu (npr. analitika, sistemske obavijesti). U tom slučaju obradu prekidamo, osim ako imamo uvjerljive zakonske razloge za nastavak." },
      ] },
      { title: "5. Pravo na prenosivost (čl. 20)", blocks: [
        { type: "p", text: "Možete zatražiti izvoz podataka u strojno čitljivom formatu. Nudimo JSON izvoz strukturiranih podataka (galerije, metapodaci) i ZIP izvoz svih fotografija/videa u punoj kvaliteti." },
      ] },
      { title: "6. Pravo na pritužbu", blocks: [
        { type: "p", text: "Možete podnijeti pritužbu nadležnom nadzornom tijelu za zaštitu osobnih podataka. U Hrvatskoj je to Agencija za zaštitu osobnih podataka — AZOP (azop.hr). U drugim zemljama EU pritužbu podnesite lokalnom nadzornom tijelu." },
      ] },
      { title: "7. Kako ostvariti svoja prava", blocks: [
        { type: "p", text: "Prava ostvarujete e-poštom s adrese povezane s vašim Guestcam računom. Zahtjev pošaljite na info@guestcam.si i u predmetu navedite vrstu zahtjeva (npr. “GDPR — pravo na pristup”). Odgovaramo u roku od 30 dana i nikad ne naplaćujemo troškove." },
        { type: "contactCard", lines: ["Kontakt za GDPR upite:", "Sport group d.o.o.", "E-pošta: info@guestcam.si"] },
      ] },
      { title: "8. Automatizirano odlučivanje i profiliranje", blocks: [
        { type: "p", text: "Guestcam ne koristi automatizirano odlučivanje koje bi značajno utjecalo na vaša prava ili interese (npr. odobrenje/odbijanje na temelju algoritma). Ne provodimo profiliranje u komercijalne svrhe." },
      ] },
    ],
  },
  sr: {
    heading: "Prava prema GDPR-u",
    eyebrow: "Pravni dokument",
    lastUpdated: "Poslednje ažurirano: 1. januar 2026 · Sport group d.o.o.",
    intro:
      "Opšta uredba o zaštiti podataka (GDPR — Uredba EU 2016/679) svakom pojedincu u EU daje skup prava u vezi sa njegovim ličnim podacima. U nastavku je pregled kako ta prava ostvarujete kod usluge Guestcam.",
    sections: [
      { title: "1. Pravo na pristup (čl. 15)", blocks: [
        { type: "p", text: "U svakom trenutku možete zatražiti kopiju svih ličnih podataka koje o vama čuvamo. Odgovaramo u roku od 30 dana. Odgovor uključuje izvoznu datoteku (JSON), spisak fotografija i metapodataka i informacije o tome sa kojim obrađivačima delimo podatke." },
      ] },
      { title: "2. Pravo na ispravku (čl. 16)", blocks: [
        { type: "p", text: "Ako su neki vaši lični podaci netačni ili nepotpuni, zatražite ispravku. Većinu podataka organizatora možete sami urediti u podešavanjima galerije; za ostalo nas kontaktirajte." },
      ] },
      { title: "3. Pravo na brisanje (čl. 17)", blocks: [
        { type: "p", text: "Možete zatražiti trajno brisanje naloga i svih povezanih podataka. To uključuje galerije koje ste kreirali i fotografije otpremljene sa vašeg naloga. Brisanje izvršavamo u roku od 30 dana, osim kada nas zakon obavezuje na čuvanje (npr. računovodstveni zapisi — 10 godina)." },
      ] },
      { title: "4. Pravo na ograničenje obrade (čl. 18) i prigovor (čl. 21)", blocks: [
        { type: "p", text: "Obradu svojih podataka možete ograničiti ili joj se usprotiviti kada se temelji na našem legitimnom interesu (npr. analitika, sistemska obaveštenja). U tom slučaju obradu prekidamo, osim ako imamo uverljive zakonske razloge za nastavak." },
      ] },
      { title: "5. Pravo na prenosivost (čl. 20)", blocks: [
        { type: "p", text: "Možete zatražiti izvoz podataka u mašinski čitljivom formatu. Nudimo JSON izvoz strukturiranih podataka (galerije, metapodaci) i ZIP izvoz svih fotografija/videa u punoj kvaliteti." },
      ] },
      { title: "6. Pravo na pritužbu", blocks: [
        { type: "p", text: "Možete podneti pritužbu nadležnom nadzornom telu za zaštitu ličnih podataka. U Srbiji je to Poverenik za informacije od javnog značaja i zaštitu podataka o ličnosti (poverenik.rs). U drugim zemljama EU pritužbu podnesite lokalnom nadzornom telu." },
      ] },
      { title: "7. Kako da ostvarite svoja prava", blocks: [
        { type: "p", text: "Prava ostvarujete e-poštom sa adrese povezane sa vašim Guestcam nalogom. Zahtev pošaljite na info@guestcam.si i u temi navedite vrstu zahteva (npr. “GDPR — pravo na pristup”). Odgovaramo u roku od 30 dana i nikada ne naplaćujemo troškove." },
        { type: "contactCard", lines: ["Kontakt za GDPR pitanja:", "Sport group d.o.o.", "E-pošta: info@guestcam.si"] },
      ] },
      { title: "8. Automatizovano odlučivanje i profilisanje", blocks: [
        { type: "p", text: "Guestcam ne koristi automatizovano odlučivanje koje bi značajno uticalo na vaša prava ili interese (npr. odobrenje/odbijanje na osnovu algoritma). Ne sprovodimo profilisanje u komercijalne svrhe." },
      ] },
    ],
  },
  de: {
    heading: "Ihre Rechte nach DSGVO",
    eyebrow: "Rechtsdokument",
    lastUpdated: "Zuletzt aktualisiert: 1. Januar 2026 · Sport group d.o.o.",
    intro:
      "Die Datenschutz-Grundverordnung (DSGVO — Verordnung EU 2016/679) gewährt jeder Person in der EU eine Reihe von Rechten bezüglich ihrer personenbezogenen Daten. Im Folgenden erläutern wir, wie Sie diese Rechte bei Guestcam ausüben.",
    sections: [
      { title: "1. Auskunftsrecht (Art. 15)", blocks: [
        { type: "p", text: "Sie können jederzeit eine Kopie aller personenbezogenen Daten anfordern, die wir über Sie speichern. Wir antworten innerhalb von 30 Tagen. Die Antwort enthält eine Exportdatei (JSON), eine Liste der Fotos und Metadaten sowie Informationen darüber, an welche Auftragsverarbeiter wir Daten weitergeben." },
      ] },
      { title: "2. Recht auf Berichtigung (Art. 16)", blocks: [
        { type: "p", text: "Sind Ihre personenbezogenen Daten unrichtig oder unvollständig, verlangen Sie deren Berichtigung. Die meisten Organisator-Daten können Sie selbst in den Galerie-Einstellungen bearbeiten; für alles andere kontaktieren Sie uns." },
      ] },
      { title: "3. Recht auf Löschung (Art. 17)", blocks: [
        { type: "p", text: "Sie können die endgültige Löschung Ihres Kontos und aller zugehörigen Daten verlangen. Dies umfasst die von Ihnen erstellten Galerien und die unter Ihrem Konto hochgeladenen Fotos. Die Löschung erfolgt innerhalb von 30 Tagen, außer wo gesetzliche Aufbewahrungspflichten bestehen (z. B. Buchhaltungsunterlagen — 10 Jahre)." },
      ] },
      { title: "4. Recht auf Einschränkung der Verarbeitung (Art. 18) und Widerspruch (Art. 21)", blocks: [
        { type: "p", text: "Sie können die Verarbeitung Ihrer Daten einschränken oder ihr widersprechen, soweit sie auf unserem berechtigten Interesse beruht (z. B. Analytics, Systembenachrichtigungen). In diesem Fall stoppen wir die Verarbeitung, es sei denn, es liegen zwingende gesetzliche Gründe für die Fortsetzung vor." },
      ] },
      { title: "5. Recht auf Datenübertragbarkeit (Art. 20)", blocks: [
        { type: "p", text: "Sie können den Export Ihrer Daten in einem maschinenlesbaren Format verlangen. Wir bieten einen JSON-Export strukturierter Daten (Galerien, Metadaten) sowie einen ZIP-Export aller Fotos/Videos in voller Qualität." },
      ] },
      { title: "6. Beschwerderecht", blocks: [
        { type: "p", text: "Sie können bei der zuständigen Datenschutzaufsichtsbehörde Beschwerde einlegen. In Deutschland ist dies die Landesdatenschutzbehörde Ihres Bundeslandes, in Österreich die Datenschutzbehörde (dsb.gv.at). In anderen EU-Staaten wenden Sie sich an die lokale Aufsichtsbehörde." },
      ] },
      { title: "7. So machen Sie Ihre Rechte geltend", blocks: [
        { type: "p", text: "Ihre Rechte machen Sie per E-Mail von der mit Ihrem Guestcam-Konto verknüpften Adresse geltend. Senden Sie Ihren Antrag an info@guestcam.si und geben Sie im Betreff die Art des Antrags an (z. B. “DSGVO — Auskunftsrecht”). Wir antworten innerhalb von 30 Tagen und berechnen niemals Kosten." },
        { type: "contactCard", lines: ["Kontakt für DSGVO-Anfragen:", "Sport group d.o.o.", "E-Mail: info@guestcam.si"] },
      ] },
      { title: "8. Automatisierte Entscheidungen und Profiling", blocks: [
        { type: "p", text: "Guestcam verwendet keine automatisierten Entscheidungen, die Ihre Rechte oder Interessen erheblich beeinträchtigen würden (z. B. Genehmigung/Ablehnung auf Basis eines Algorithmus). Wir führen kein Profiling zu kommerziellen Zwecken durch." },
      ] },
    ],
  },
  en: {
    heading: "Your GDPR Rights",
    eyebrow: "Legal document",
    lastUpdated: "Last updated: January 1, 2026 · Sport group d.o.o.",
    intro:
      "The General Data Protection Regulation (GDPR — EU Regulation 2016/679) gives every individual in the EU a set of rights regarding their personal data. Below is a summary of how to exercise each of those rights at Guestcam.",
    sections: [
      { title: "1. Right of access (Art. 15)", blocks: [
        { type: "p", text: "You may request a copy of all personal data we hold about you at any time. We respond within 30 days. The response includes an export file (JSON), a list of photos and metadata, and information about which processors we share data with." },
      ] },
      { title: "2. Right to rectification (Art. 16)", blocks: [
        { type: "p", text: "If any of your personal data is inaccurate or incomplete, request rectification. You can edit most organiser data yourself in the gallery settings; for everything else, contact us." },
      ] },
      { title: "3. Right to erasure (Art. 17)", blocks: [
        { type: "p", text: "You may request permanent deletion of your account and all associated data. This includes the galleries you created and the photos uploaded under your account. We carry out the deletion within 30 days, except where retention is legally required (e.g. accounting records — 10 years)." },
      ] },
      { title: "4. Right to restriction (Art. 18) and objection (Art. 21)", blocks: [
        { type: "p", text: "You may restrict or object to the processing of your data when it is based on our legitimate interest (e.g. analytics, system notifications). In that case we stop processing, unless we have compelling legal grounds to continue." },
      ] },
      { title: "5. Right to data portability (Art. 20)", blocks: [
        { type: "p", text: "You may request an export of your data in a machine-readable format. We offer a JSON export of structured data (galleries, metadata) and a ZIP export of all photos/videos in full quality." },
      ] },
      { title: "6. Right to lodge a complaint", blocks: [
        { type: "p", text: "You can file a complaint with the competent data protection supervisory authority. In Slovenia this is the Information Commissioner (ip-rs.si). In other EU countries, file the complaint with your local authority." },
      ] },
      { title: "7. How to exercise your rights", blocks: [
        { type: "p", text: "Exercise your rights by emailing us from the address tied to your Guestcam account. Send your request to info@guestcam.si and indicate the type of request in the subject line (e.g. “GDPR — Right of access”). We respond within 30 days and never charge a fee." },
        { type: "contactCard", lines: ["GDPR contact:", "Sport group d.o.o.", "Email: info@guestcam.si"] },
      ] },
      { title: "8. Automated decision-making and profiling", blocks: [
        { type: "p", text: "Guestcam does not use automated decision-making that would significantly affect your rights or interests (e.g. approval/rejection based on an algorithm). We do not perform profiling for commercial purposes." },
      ] },
    ],
  },
  es: {
    heading: "Tus derechos según el RGPD",
    eyebrow: "Documento legal",
    lastUpdated: "Última actualización: 1 de enero de 2026 · Sport group d.o.o.",
    intro:
      "El Reglamento General de Protección de Datos (RGPD — Reglamento UE 2016/679) otorga a toda persona en la UE un conjunto de derechos sobre sus datos personales. A continuación se resume cómo ejercer esos derechos con Guestcam.",
    sections: [
      { title: "1. Derecho de acceso (art. 15)", blocks: [
        { type: "p", text: "Puedes solicitar en cualquier momento una copia de todos los datos personales que tenemos sobre ti. Respondemos en 30 días. La respuesta incluye un archivo de exportación (JSON), una lista de fotos y metadatos e información sobre con qué encargados de tratamiento compartimos datos." },
      ] },
      { title: "2. Derecho de rectificación (art. 16)", blocks: [
        { type: "p", text: "Si alguno de tus datos personales es inexacto o incompleto, solicita su rectificación. Puedes editar la mayoría de los datos del organizador tú mismo en los ajustes de la galería; para lo demás, contáctanos." },
      ] },
      { title: "3. Derecho de supresión (art. 17)", blocks: [
        { type: "p", text: "Puedes solicitar la eliminación permanente de tu cuenta y de todos los datos asociados. Esto incluye las galerías que creaste y las fotos subidas bajo tu cuenta. Realizamos la eliminación en 30 días, salvo cuando la ley nos obligue a conservarlos (p. ej. registros contables — 10 años)." },
      ] },
      { title: "4. Derecho a la limitación (art. 18) y oposición (art. 21)", blocks: [
        { type: "p", text: "Puedes limitar u oponerte al tratamiento de tus datos cuando se basa en nuestro interés legítimo (p. ej. analítica, notificaciones del sistema). En ese caso interrumpimos el tratamiento, salvo que existan motivos legales imperiosos para continuar." },
      ] },
      { title: "5. Derecho a la portabilidad (art. 20)", blocks: [
        { type: "p", text: "Puedes solicitar la exportación de tus datos en formato legible por máquina. Ofrecemos una exportación JSON de los datos estructurados (galerías, metadatos) y una exportación ZIP de todas las fotos/vídeos en calidad completa." },
      ] },
      { title: "6. Derecho a presentar reclamación", blocks: [
        { type: "p", text: "Puedes presentar una reclamación ante la autoridad de control de protección de datos competente. En España es la Agencia Española de Protección de Datos (aepd.es). En otros países de la UE, presenta la reclamación ante la autoridad local." },
      ] },
      { title: "7. Cómo ejercer tus derechos", blocks: [
        { type: "p", text: "Ejerces tus derechos por email desde la dirección vinculada a tu cuenta Guestcam. Envía tu solicitud a info@guestcam.si e indica el tipo de solicitud en el asunto (p. ej. “RGPD — derecho de acceso”). Respondemos en 30 días y nunca cobramos." },
        { type: "contactCard", lines: ["Contacto para asuntos RGPD:", "Sport group d.o.o.", "Email: info@guestcam.si"] },
      ] },
      { title: "8. Decisiones automatizadas y elaboración de perfiles", blocks: [
        { type: "p", text: "Guestcam no utiliza decisiones automatizadas que puedan afectar significativamente a tus derechos o intereses (p. ej. aprobación/rechazo basado en algoritmo). No realizamos elaboración de perfiles con fines comerciales." },
      ] },
    ],
  },
};
