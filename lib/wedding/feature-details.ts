import type { Lang } from '@/lib/i18n/translations';
import { WEDDING_DETAILS_SL } from './feature-details-sl';
import { weddingFeatures } from './package-copy';

export interface WeddingFeatureDetail { id: string; title: string; body: string; points: string[]; example?: string }
const ids = ['urejevalnik','udelezba','mize','knjiga-gostov','video-voscila','casovna-kapsula','zgodba','prihod','zahvala','vabila','jeziki','urnik','meni','glasbene-zelje','foto-bingo'] as const;
// HR, SR, EN, DE, ES. Two practical steps and an example, separated for presentation.
const instructions: Record<typeof ids[number], readonly string[]> = {
 urejevalnik: [
  'Odaberite početni stil, fotografiju, fontove i boje.|Dodajte kategorije i tekstove, a redoslijed uredite strelicama ili povlačenjem.|Na jednoj stranici povežite obred, slavlje i korisne informacije.',
  'Izaberite početni stil, fotografiju, fontove i boje.|Dodajte kategorije i tekstove, a redosled uredite strelicama ili prevlačenjem.|Na jednoj stranici povežite obred, slavlje i korisne informacije.',
  'Choose a starting style, photo, fonts and colors.|Add sections and text, then reorder with arrows or drag and drop.|Bring your ceremony, reception and practical details together on one page.',
  'Wählt einen Ausgangsstil, ein Foto, Schriften und Farben.|Ergänzt Bereiche und Texte und ordnet sie mit Pfeilen oder per Ziehen.|Verbindet Trauung, Feier und praktische Informationen auf einer Seite.',
  'Elegid un estilo inicial, una foto, fuentes y colores.|Añadid secciones y textos, y ordenadlos con flechas o arrastrándolos.|Reunid ceremonia, celebración e información práctica en una página.',
 ],
 udelezba: [
  'Dodajte pozvane osobe, rok za odgovor i broj pratitelja.|Gost putem osobne pozivnice potvrđuje dolazak i bira jelovnik.|Prije dogovora s restoranom provjerite sve odgovore na jednom mjestu.',
  'Dodajte pozvane osobe, rok za odgovor i broj pratilaca.|Gost preko lične pozivnice potvrđuje dolazak i bira meni.|Pre dogovora sa restoranom proverite sve odgovore na jednom mestu.',
  'Add invitees, an RSVP deadline and their companion allowance.|Guests use personal invitation links to reply and choose a meal.|Check all replies together before confirming dinner numbers.',
  'Erfasst Eingeladene, Antwortfrist und erlaubte Begleitpersonen.|Gäste antworten und wählen ihr Menü über persönliche Einladungslinks.|Prüft alle Antworten, bevor ihr die Personenzahl fürs Essen bestätigt.',
  'Añadid invitados, fecha límite y acompañantes permitidos.|Cada invitado responde y elige su menú con su enlace personal.|Revisad todas las respuestas antes de confirmar los comensales.',
 ],
 mize: [
  'Imenujte stolove, upišite broj mjesta i dodijelite goste.|Gost u prikazu vjenčanja traži svoj stol po imenu.|Dodajte sliku rasporeda prostora kako bi gosti lakše pronašli mjesto.',
  'Imenujte stolove, upišite broj mesta i rasporedite goste.|Gost u prikazu venčanja traži svoj sto po imenu.|Dodajte sliku rasporeda prostora da bi gosti lakše našli mesto.',
  'Name your tables, set capacities and assign your guests.|Guests search for their assigned table by name.|Add a floor-plan image to help guests find their seats.',
  'Benennt Tische, legt Plätze fest und weist Gäste zu.|Gäste suchen ihren zugewiesenen Tisch anhand ihres Namens.|Ergänzt einen Raumplan, damit alle ihren Platz leichter finden.',
  'Nombrad las mesas, indicad las plazas y asignad invitados.|Cada invitado busca su mesa por su nombre.|Añadid un plano del espacio para que sea más fácil encontrar el sitio.',
 ],
 'knjiga-gostov': [
  'Uključite knjigu gostiju i po želji moderiranje.|Gost upisuje čestitku i može priložiti fotografiju iz galerije.|Sačuvajte uspomene pomoću prikaza za ispis ili spremanja u PDF.',
  'Uključite knjigu gostiju i po želji moderiranje.|Gost upisuje čestitku i može da priloži fotografiju iz galerije.|Sačuvajte uspomene pomoću prikaza za štampu ili čuvanja u PDF-u.',
  'Enable the guestbook and choose whether messages need approval.|Guests write a wish and can attach a gallery photo.|Keep a copy using the print view or your browser’s Save as PDF option.',
  'Aktiviert das Gästebuch und legt fest, ob Beiträge freigegeben werden müssen.|Gäste schreiben Wünsche und können ein Galeriefoto hinzufügen.|Sichert eine Kopie über die Druckansicht oder als PDF im Browser.',
  'Activad el libro de firmas y decidid si los mensajes requieren aprobación.|Los invitados escriben sus deseos y pueden añadir una foto de la galería.|Guardad una copia con la vista de impresión o la opción Guardar como PDF.',
 ],
 'video-voscila': [
  'Uključite video čestitke na stranici za goste.|Gost snima u podržanom pregledniku ili učitava video s telefona.|Sačuvajte glas i osmijeh najbližih za sljedeću godišnjicu.',
  'Uključite video čestitke na stranici za goste.|Gost snima u podržanom pregledaču ili otprema video sa telefona.|Sačuvajte glas i osmeh najbližih za sledeću godišnjicu.',
  'Enable video wishes on the guest page.|Guests record in a supported browser or upload a video from their phone.|Keep the voices and smiles of loved ones for your anniversary.',
  'Aktiviert Videogrüße auf der Gästeseite.|Gäste nehmen im unterstützten Browser auf oder laden ein Handyvideo hoch.|Bewahrt Stimmen und Lächeln eurer Liebsten für den Jahrestag.',
  'Activad las felicitaciones en vídeo en la página de invitados.|Los invitados graban en un navegador compatible o suben un vídeo del móvil.|Guardad las voces y sonrisas de vuestros seres queridos para el aniversario.',
 ],
 'casovna-kapsula': [
  'Odredite datum otvaranja kapsule.|Gosti ostavljaju pisane poruke koje do tada ostaju zaključane.|Iznenadite se porukama na prvu godišnjicu; ni organizatori ih ne čitaju unaprijed.',
  'Odredite datum otvaranja kapsule.|Gosti ostavljaju pisane poruke koje do tada ostaju zaključane.|Iznenadite se porukama na prvu godišnjicu; ni organizatori ih ne čitaju unapred.',
  'Set the capsule’s opening date.|Guests leave written messages that remain sealed until then.|Read them on your anniversary; even organizers cannot read them early.',
  'Legt das Öffnungsdatum der Kapsel fest.|Gäste hinterlassen schriftliche Nachrichten, die bis dahin verschlossen bleiben.|Lest sie am Jahrestag; auch Organisatoren können sie nicht vorher lesen.',
  'Elegid la fecha de apertura de la cápsula.|Los invitados dejan mensajes escritos que permanecen cerrados hasta entonces.|Leedlos en vuestro aniversario; ni los organizadores pueden leerlos antes.',
 ],
 zgodba: [
  'Dodajte zapise o susretu, putovanjima ili zarukama.|Svaki zapis može imati naslov, tekst, datum i fotografiju.|Podijelite tri najdraža trenutka kao uvod u vaš dan.',
  'Dodajte zapise o susretu, putovanjima ili veridbi.|Svaki zapis može imati naslov, tekst, datum i fotografiju.|Podelite tri omiljena trenutka kao uvod u vaš dan.',
  'Add entries about meeting, travels or your engagement.|Each entry can include a title, text, date and photo.|Share three favorite moments as an introduction to your day.',
  'Ergänzt Einträge über euer Kennenlernen, Reisen oder die Verlobung.|Jeder Eintrag kann Titel, Text, Datum und Foto enthalten.|Teilt drei Lieblingsmomente als Einstieg in euren Tag.',
  'Añadid entradas sobre cómo os conocisteis, viajes o el compromiso.|Cada entrada puede incluir título, texto, fecha y foto.|Compartid tres momentos favoritos como introducción a vuestro día.',
 ],
 prihod: [
  'Dodajte upute za dolazak, parkiranje i smještaj.|Uključite poveznice do karte, prijevoznika ili hotela.|Odvojite informacije za obred od informacija za večernje slavlje.',
  'Dodajte uputstva za dolazak, parking i smeštaj.|Uključite linkove do mape, prevoznika ili hotela.|Odvojite informacije za obred od informacija za večernju proslavu.',
  'Add directions, parking and accommodation details.|Include links to a map, transport provider or hotel.|Keep ceremony directions distinct from evening reception details.',
  'Ergänzt Anreise, Parkplätze und Unterkünfte.|Verlinkt Karte, Transportanbieter oder Hotel.|Trennt Hinweise zur Trauung von Informationen zur Abendfeier.',
  'Añadid indicaciones, aparcamiento y alojamiento.|Incluid enlaces a un mapa, transporte u hotel.|Separad las indicaciones de la ceremonia de las de la celebración.',
 ],
 zahvala: [
  'Napišite osobnu zahvalu i po želji dodajte fotografiju.|Gosti je pronalaze na istoj poveznici nakon vjenčanja.|Zahvalite svima koji su podijelili fotografije i uspomene.',
  'Napišite ličnu zahvalnicu i po želji dodajte fotografiju.|Gosti je pronalaze na istom linku posle venčanja.|Zahvalite svima koji su podelili fotografije i uspomene.',
  'Write a personal thank-you and optionally add a photo.|Guests find it at the same link after the wedding.|Thank everyone who shared photos and memories of your day.',
  'Schreibt eine persönliche Danksagung und ergänzt optional ein Foto.|Gäste finden sie nach der Hochzeit unter demselben Link.|Dankt allen, die Fotos und Erinnerungen mit euch geteilt haben.',
  'Escribid un agradecimiento personal y añadid una foto si queréis.|Los invitados lo encuentran en el mismo enlace después de la boda.|Dad las gracias a quienes compartieron fotos y recuerdos de vuestro día.',
 ],
 vabila: [
  'Dodajte gosta i odaberite jezik njegovih obavijesti.|Podijelite osobnu pozivnicu izravno s tom osobom.|Osobna pozivnica služi za odgovor na dolazak; zajednički QR kod je ne zamjenjuje.',
  'Dodajte gosta i izaberite jezik njegovih obaveštenja.|Podelite ličnu pozivnicu direktno sa tom osobom.|Lična pozivnica služi za potvrdu dolaska; zajednički QR kod je ne zamenjuje.',
  'Add your guest and choose their notification language.|Share that person’s invitation link directly with them.|Personal links handle RSVPs; the shared venue QR code does not replace them.',
  'Erfasst den Gast und wählt seine Benachrichtigungssprache.|Teilt den persönlichen Einladungslink direkt mit dieser Person.|Persönliche Links dienen der Zu- oder Absage; der gemeinsame QR-Code ersetzt sie nicht.',
  'Añadid al invitado y elegid el idioma de sus avisos.|Compartid su enlace de invitación directamente con esa persona.|Los enlaces personales gestionan las confirmaciones; el QR compartido no los sustituye.',
 ],
 jeziki: [
  'Uredite sadržaj na slovenskom, hrvatskom, srpskom, engleskom, njemačkom ili španjolskom.|Automatski prijevodi popunjavaju tekstove koji nedostaju; postojeće izmjene ostaju sačuvane.|Otvorite željeni jezik i sami ispravite ime, opis ili ton poruke.',
  'Uredite sadržaj na slovenačkom, hrvatskom, srpskom, engleskom, nemačkom ili španskom.|Automatski prevodi popunjavaju tekstove koji nedostaju; postojeće izmene ostaju sačuvane.|Otvorite željeni jezik i sami ispravite ime, opis ili ton poruke.',
  'Write in Slovenian, Croatian, Serbian, English, German or Spanish.|Automatic translations fill missing text and preserve existing corrections.|Switch languages to correct a name, description or wording yourself.',
  'Erstellt Inhalte auf Slowenisch, Kroatisch, Serbisch, Englisch, Deutsch oder Spanisch.|Automatische Übersetzungen ergänzen fehlende Texte und erhalten bestehende Korrekturen.|Wechselt die Sprache und korrigiert Namen, Beschreibungen oder Formulierungen selbst.',
  'Escribid en esloveno, croata, serbio, inglés, alemán o español.|Las traducciones automáticas completan los textos que faltan y conservan las correcciones.|Cambiad de idioma para corregir un nombre, una descripción o una expresión.',
 ],
 urnik: [
  'Dodajte vrijeme, naziv i opis svake točke programa.|Gost provjerava raspored na telefonu putem zajedničkog QR koda.|Objavite vrijeme obreda, večere i prvog plesa bez ponovnog ispisa programa.',
  'Dodajte vreme, naziv i opis svake tačke programa.|Gost proverava raspored na telefonu preko zajedničkog QR koda.|Objavite vreme obreda, večere i prvog plesa bez ponovnog štampanja programa.',
  'Add a time, title and description for each event.|Guests check the schedule on their phones through the shared QR code.|Publish ceremony, dinner and first-dance times without reprinting programs.',
  'Ergänzt Uhrzeit, Titel und Beschreibung jedes Programmpunkts.|Gäste prüfen den Ablauf per QR-Code auf ihrem Handy.|Veröffentlicht Zeiten für Trauung, Essen und ersten Tanz ohne neue Ausdrucke.',
  'Añadid hora, título y descripción de cada momento.|Los invitados consultan el programa en el móvil con el QR compartido.|Publicad horarios de ceremonia, cena y primer baile sin volver a imprimir.',
 ],
 meni: [
  'Dodajte slijedove, nazive jela i korisne napomene.|Gosti pregledavaju jelovnik na istoj poveznici vjenčanja.|Navedite vegetarijanske mogućnosti i važne podatke o hrani.',
  'Dodajte sledove, nazive jela i korisne napomene.|Gosti pregledaju meni na istom linku venčanja.|Navedite vegetarijanske opcije i važne podatke o hrani.',
  'Add courses, dish names and useful notes.|Guests read the menu through the same wedding link.|Explain vegetarian options and important food information.',
  'Ergänzt Gänge, Gerichtnamen und hilfreiche Hinweise.|Gäste lesen das Menü unter demselben Hochzeitslink.|Beschreibt vegetarische Optionen und wichtige Informationen zum Essen.',
  'Añadid platos, nombres y notas útiles.|Los invitados consultan el menú en el mismo enlace de boda.|Explicad las opciones vegetarianas y la información importante sobre la comida.',
 ],
 'glasbene-zelje': [
  'Postavite zajednički QR kod na stolove, uz plesni podij ili ulaz i uključite glazbene želje.|Gost otvara album i uključene sadržaje, bira glazbene želje te telefonom šalje pjesmu, izvođača i posvetu.|DJ dobiva zaštićenu poveznicu na popis i odlučuje što će prihvatiti, pustiti ili odbiti.',
  'Postavite zajednički QR kod na stolove, uz plesni podijum ili ulaz i uključite muzičke želje.|Gost otvara album i uključene sadržaje, bira muzičke želje i telefonom šalje pesmu, izvođača i posvetu.|DJ dobija zaštićeni link do liste i odlučuje šta će prihvatiti, pustiti ili odbiti.',
  'Place the shared QR code on tables, by the dance floor or at the entrance and enable song requests.|Guests open the album and enabled wedding features, choose song requests and send a song, artist and dedication from their phones.|Give the DJ their protected list link; they decide what to accept, play or decline.',
  'Platziert den gemeinsamen QR-Code auf Tischen, an der Tanzfläche oder am Eingang und aktiviert Musikwünsche.|Gäste öffnen Album und aktivierte Inhalte, wählen Musikwünsche und senden Titel, Interpret und Widmung vom Handy.|Gebt dem DJ seinen geschützten Listenlink; er entscheidet, was angenommen, gespielt oder abgelehnt wird.',
  'Colocad el QR compartido en las mesas, junto a la pista o en la entrada y activad las peticiones musicales.|Los invitados abren el álbum y los contenidos activados, eligen peticiones musicales y envían canción, artista y dedicatoria desde el móvil.|Dad al DJ su enlace protegido a la lista; él decide qué aceptar, reproducir o rechazar.',
 ],
 'foto-bingo': [
  'Pripremite fotografske zadatke za goste.|Gost odabire zadatak, snima fotografiju i dodaje je u galeriju.|Zatražite zajednički selfie, detalj dekoracije ili trenutak s plesnog podija.',
  'Pripremite fotografske zadatke za goste.|Gost bira zadatak, snima fotografiju i dodaje je u galeriju.|Zatražite zajednički selfi, detalj dekoracije ili trenutak sa plesnog podijuma.',
  'Prepare photo challenges for your guests.|Guests choose a challenge, take a photo and add it to the gallery.|Ask for a group selfie, a decoration detail or a dance-floor moment.',
  'Bereitet Fotoaufgaben für eure Gäste vor.|Gäste wählen eine Aufgabe, machen ein Foto und fügen es der Galerie hinzu.|Wünscht euch ein Gruppenselfie, ein Dekodetail oder einen Tanzflächenmoment.',
  'Preparad retos fotográficos para los invitados.|Cada invitado elige un reto, hace una foto y la añade a la galería.|Pedid un selfi de grupo, un detalle de la decoración o un momento en la pista.',
 ],
};

const extras = [
 { id: 'galerija', titles: ['Zasebni album fotografij in videov','Privatni album fotografija i videa','Privatni album fotografija i video-snimaka','A private photo and video album','Ein privates Foto- und Videoalbum','Un álbum privado de fotos y vídeos'],
  bodies: ['Gostje dodajajo fotografije in videe brez aplikacije. Paket vključuje en dogodek z do petimi galerijami, neomejeno nalaganje ter neomejen čas hrambe.','Gosti dodaju fotografije i videe bez aplikacije. Paket uključuje jedan događaj s do pet galerija, neograničen prijenos i trajni pristup.','Gosti dodaju fotografije i video-snimke bez aplikacije. Paket obuhvata jedan događaj sa do pet galerija, neograničeno otpremanje i trajni pristup.','Guests add photos and videos without an app. The package covers one event with up to five galleries, unlimited uploads and non-expiring storage.','Gäste laden Fotos und Videos ohne App hoch. Das Paket umfasst ein Ereignis mit bis zu fünf Galerien, unbegrenzten Uploads und zeitlich unbegrenzter Speicherung.','Los invitados añaden fotos y vídeos sin una app. El paquete incluye un evento con hasta cinco galerías, subidas ilimitadas y almacenamiento sin caducidad.'],
  steps: ['Delita povezavo ali QR-kodo.|Vidnost, geslo in moderiranje uredita v nastavitvah.','Podijelite poveznicu ili QR kod.|Vidljivost, lozinku i moderiranje uredite u postavkama.','Podelite link ili QR kod.|Vidljivost, lozinku i moderiranje uredite u podešavanjima.','Share the link or QR code.|Control visibility, password and moderation in settings.','Teilt den Link oder QR-Code.|Regelt Sichtbarkeit, Passwort und Freigabe in den Einstellungen.','Compartid el enlace o QR.|Configurad visibilidad, contraseña y moderación en los ajustes.'] },
 { id: 'qr-koda', titles: ['Ena QR-koda za album in poročno doživetje','Jedan QR kod za album i vaše vjenčanje','Jedan QR kod za album i vaše venčanje','One QR code for your album and wedding','Ein QR-Code für Album und Hochzeit','Un QR para el álbum y la boda'],
  bodies: ['Skupno QR-kodo postavita na mize ali druga vidna mesta. Gost jo skenira s kamero telefona in dostopa do albuma ter vključenih vsebin.','Zajednički QR kod postavite na stolove ili druga vidljiva mjesta. Gost ga skenira kamerom telefona i pristupa albumu te uključenim sadržajima.','Zajednički QR kod postavite na stolove ili druga vidljiva mesta. Gost ga skenira kamerom telefona i pristupa albumu i uključenim sadržajima.','Place the shared QR code on tables or other visible spots. Guests scan it with their phone camera to open the album and enabled wedding features.','Platziert den gemeinsamen QR-Code auf Tischen oder an gut sichtbaren Stellen. Gäste scannen ihn mit der Handykamera und öffnen Album und aktivierte Inhalte.','Colocad el QR compartido en las mesas u otros lugares visibles. Los invitados lo escanean con la cámara del móvil para abrir el álbum y las funciones activadas.'],
  steps: ['Pred tiskom preverita kodo s telefonom.|Osebna potrditev udeležbe še vedno uporablja osebno povezavo iz vabila.','Prije ispisa provjerite kod telefonom.|Osobna potvrda dolaska i dalje koristi osobnu poveznicu iz pozivnice.','Pre štampanja proverite kod telefonom.|Lična potvrda dolaska i dalje koristi lični link iz pozivnice.','Test the code with a phone before printing.|Personal RSVPs still use each guest’s invitation link.','Testet den Code vor dem Drucken mit einem Handy.|Persönliche Zusagen erfolgen weiterhin über den jeweiligen Einladungslink.','Probad el código con un móvil antes de imprimirlo.|Las confirmaciones personales siguen usando el enlace de cada invitado.'] },
 { id: 'prenos', titles: ['Prenos izvirnikov za vajin arhiv','Preuzimanje izvornika za vašu arhivu','Preuzimanje originala za vašu arhivu','Download originals for your own archive','Originale für euer Archiv herunterladen','Descargar originales para vuestro archivo'],
  bodies: ['Fotografije in videe preneseta v arhivu ZIP ter ohranita lastno kopijo spominov.','Fotografije i videe preuzmite u ZIP arhivi i sačuvajte vlastitu kopiju uspomena.','Fotografije i video-snimke preuzmite u ZIP arhivi i sačuvajte sopstvenu kopiju uspomena.','Download photos and videos in a ZIP archive and keep your own copy of the memories.','Ladet Fotos und Videos als ZIP-Archiv herunter und bewahrt eure eigene Kopie auf.','Descargad fotos y vídeos en un archivo ZIP para conservar vuestra propia copia de los recuerdos.'],
  steps: ['Izberita razpoložljive datoteke v galeriji.|Za velik arhiv uporabita stabilno povezavo in dovolj prostora.','Odaberite dostupne datoteke u galeriji.|Za veliku arhivu osigurajte stabilnu vezu i dovoljno prostora.','Izaberite dostupne datoteke u galeriji.|Za veliku arhivu obezbedite stabilnu vezu i dovoljno prostora.','Select available files in the gallery.|Use a stable connection and enough storage for large archives.','Wählt die verfügbaren Dateien in der Galerie.|Nutzt für große Archive eine stabile Verbindung und genug Speicherplatz.','Seleccionad los archivos disponibles en la galería.|Usad una conexión estable y espacio suficiente para archivos grandes.'] },
 { id: 'foto-stena', titles: ['Foto stena za televizor ali projektor','Fotozid za televizor ili projektor','Foto-zid za televizor ili projektor','A photo wall for your TV or projector','Eine Fotowand für TV oder Beamer','Un muro de fotos para TV o proyector'],
  bodies: ['Na prizorišču prikažita fotografije gostov na velikem zaslonu in vključita utrinke v praznovanje.','Prikažite fotografije gostiju na velikom zaslonu i uključite uspomene u slavlje.','Prikažite fotografije gostiju na velikom ekranu i uključite uspomene u proslavu.','Display guest photos on a large screen and make their moments part of the celebration.','Zeigt Gästefotos auf einem großen Bildschirm und macht ihre Momente zum Teil der Feier.','Mostrad las fotos de los invitados en una pantalla grande e incorporad sus momentos a la celebración.'],
  steps: ['Odprita povezavo za projekcijo v brskalniku na priključeni napravi.|Preverita internetno povezavo, vidnost in moderiranje.','Otvorite poveznicu za projekciju u pregledniku na povezanom uređaju.|Provjerite internet, vidljivost i moderiranje.','Otvorite link za projekciju u pregledaču na povezanom uređaju.|Proverite internet, vidljivost i moderiranje.','Open the projection link in a browser on the connected device.|Check the internet connection, visibility and moderation.','Öffnet den Projektionslink im Browser des angeschlossenen Geräts.|Prüft Internetverbindung, Sichtbarkeit und Freigabe.','Abrid el enlace de proyección en el navegador del dispositivo conectado.|Comprobad la conexión, la visibilidad y la moderación.'] },
 { id: 'film-studio', titles: ['Film Studio za film iz vajinih fotografij','Film Studio za film od vaših fotografija','Film Studio za film od vaših fotografija','Film Studio for a film of your photos','Film Studio für einen Film aus euren Fotos','Film Studio para una película con vuestras fotos'],
  bodies: ['Iz izbranih fotografij pripravita film s prehodi in gibanjem. Premium omogoča izbor do 300 fotografij za posamezno pripravo.','Od izabranih fotografija izradite film s prijelazima i pokretom. Premium omogućuje do 300 fotografija po izradi.','Od izabranih fotografija napravite film sa prelazima i pokretom. Premium omogućava do 300 fotografija po izradi.','Create a film with movement and transitions from selected photos. Premium allows up to 300 photos per generation.','Erstellt aus ausgewählten Fotos einen Film mit Bewegung und Übergängen. Premium erlaubt bis zu 300 Fotos pro Erstellung.','Cread una película con movimiento y transiciones a partir de fotos seleccionadas. Premium permite hasta 300 fotos por creación.'],
  steps: ['Izberita fotografije iz svoje galerije.|Pred pripravo preverita izbor in prikazane možnosti.','Odaberite fotografije iz galerije.|Prije izrade provjerite izbor i prikazane mogućnosti.','Izaberite fotografije iz galerije.|Pre izrade proverite izbor i prikazane mogućnosti.','Select photos from your gallery.|Review the selection and available options before starting.','Wählt Fotos aus eurer Galerie.|Prüft Auswahl und angezeigte Optionen vor dem Start.','Elegid fotos de la galería.|Revisad la selección y las opciones antes de empezar.'] },
];

export function weddingFeatureDetails(lang: Lang): WeddingFeatureDetail[] {
 const features = weddingFeatures(lang);
 const index = ['sl','hr','sr','en','de','es'].indexOf(lang);
 if (lang === 'sl') return WEDDING_DETAILS_SL.map(feature => ({ ...feature,
  title: ids.includes(feature.id as typeof ids[number]) ? features[ids.indexOf(feature.id as typeof ids[number])].title : feature.title,
  points: [...feature.points] }));
 return [
  ...ids.map((id, position) => ({ id, title: features[position].title, body: features[position].body, points: instructions[id][index - 1].split('|') })),
  ...extras.map(feature => ({ id: feature.id, title: feature.titles[index], body: feature.bodies[index], points: feature.steps[index].split('|') })),
 ];
}
