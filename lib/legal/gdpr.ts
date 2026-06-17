import type { LangCode } from "@/components/LanguageSwitcher";
import type { LegalDoc } from "./types";

export const gdprDoc: Record<LangCode, LegalDoc> = {
  sl: {
    heading: "Pravice po GDPR",
    eyebrow: "Pravni dokument",
    lastUpdated: "Zadnja posodobitev: 1. januar 2026 · Sport group d.o.o.",
    intro:
      "Splošna uredba o varstvu podatkov (GDPR — Uredba EU 2016/679) daje vsakemu posamezniku v EU sklop pravic glede njegovih osebnih podatkov. Spodaj je povzetek, kako te pravice uveljavljate pri storitvi Guestcam.",
    sections: [
      { title: "1. Pravica do dostopa (čl. 15)", blocks: [
        { type: "p", text: "Kadar koli lahko zahtevate kopijo vseh osebnih podatkov, ki jih o vas hranimo. Odgovorimo v 30 dneh. Odgovor vključuje izvozno datoteko (JSON), seznam fotografij in metapodatkov ter informacije o tem, s katerimi obdelovalci podatke delimo." },
      ] },
      { title: "2. Pravica do popravka (čl. 16)", blocks: [
        { type: "p", text: "Če so kateri od vaših osebnih podatkov nepravilni ali nepopolni, zahtevajte popravek. Večino podatkov organizatorja lahko sami uredite v nastavitvah galerije; za ostalo nas kontaktirajte." },
      ] },
      { title: "3. Pravica do izbrisa (čl. 17)", blocks: [
        { type: "p", text: "Zahtevate lahko trajni izbris vašega računa in vseh povezanih podatkov. To vključuje galerije, ki ste jih ustvarili, in fotografije, naložene pod vašim računom. Izbris izvedemo v 30 dneh, razen kjer nas k hrambi obvezuje zakon (npr. računovodski zapisi — 10 let)." },
      ] },
      { title: "4. Pravica do omejitve obdelave (čl. 18) in ugovora (čl. 21)", blocks: [
        { type: "p", text: "Obdelavo svojih podatkov lahko omejite ali ji ugovarjate, kadar temelji na našem legitimnem interesu (npr. analitika, obvestila o sistemu). V tem primeru obdelavo prekinemo, razen če imamo prepričljive zakonske razloge za nadaljevanje." },
      ] },
      { title: "5. Pravica do prenosljivosti (čl. 20)", blocks: [
        { type: "p", text: "Zahtevate lahko izvoz svojih podatkov v strojno berljivem formatu. Ponujamo JSON izvoz strukturiranih podatkov (galerije, metapodatki) in ZIP izvoz vseh fotografij/videov v polni kakovosti." },
      ] },
      { title: "6. Pravica do pritožbe", blocks: [
        { type: "p", text: "Pri pristojnem nadzornem organu za varstvo osebnih podatkov lahko vložite pritožbo. V Sloveniji je to Informacijski pooblaščenec RS (ip-rs.si). V drugih državah EU pritožbo vložite pri lokalnem nadzornem organu." },
      ] },
      { title: "7. Kako uveljavljate svoje pravice", blocks: [
        { type: "p", text: "Pravice uveljavljate prek e-pošte z elektronskega naslova, vezanega na vaš Guestcam račun. Pošljite zahtevek na info@guestcam.si in v zadevi navedite vrsto zahteve (npr. “GDPR — Pravica do dostopa”). Odgovorimo v 30 dneh in nikoli ne zaračunamo stroškov." },
        { type: "contactCard", lines: ["Kontakt za GDPR vprašanja:", "Sport group d.o.o.", "E-pošta: info@guestcam.si"] },
      ] },
      { title: "8. Avtomatsko odločanje in profiliranje", blocks: [
        { type: "p", text: "Guestcam ne uporablja avtomatskega odločanja, ki bi pomembno vplivalo na vaše pravice ali interese (npr. odobritev/zavrnitev na podlagi algoritma). Ne izvajamo profiliranja v komercialne namene." },
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
