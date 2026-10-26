import type { Lang } from '@/lib/i18n/translations';
import type { WeddingRow, WeddingSong } from './contracts';

/** Fictional, public presentation data only. Never used to initialize a customer's event. */
export const DEMO_WEDDING = { names: 'Ana & Marko', date: '2027-07-31', venue: 'Vila Rožni vrt' } as const;
const TIMES = ['15:30', '16:00', '16:30', '18:00', '20:00', '22:00', '23:30'] as const;
type TextPair = readonly [title: string, description: string];
type DemoCopy = {
 location: string; subtitle: string; notice: string; qrTitle: string; qrText: string;
 bingoIntro: string; organiserIntro: string; djIntro: string;
 schedule: readonly TextPair[]; menu: readonly TextPair[]; bingo: readonly TextPair[];
 page: readonly TextPair[]; songNotes: readonly [string, string, string];
};
const COPY = {
 sl: {
  location: 'Goriška brda, Slovenija', subtitle: 'En poletni dan. Vsi najini najljubši ljudje. In zgodba, ki jo pišemo skupaj.',
  notice: 'Predstavitvena poroka z izmišljenimi podatki in prizoriščem. Urejanje in DJ-izbire lahko preizkusita; spremembe veljajo le v tem predogledu.',
  qrTitle: 'Ena QR-koda, ves najin dan', qrText: 'Poskenirajte QR-kodo na mizi ali pri vhodu. Na isti povezavi si oglejte program in jedilnik, dodajte fotografije v najin album, sodelujte v fotografskem bingu ali DJ-ju pošljite glasbeno željo. Brez prenosa aplikacije.',
  bingoIntro: 'Pomagajte nama ujeti trenutke, ki jih sama ne bova videla. Izberite izziv in prispevajte fotografijo v skupni album. Spodnja števila prikazujejo vzorčne prispevke gostov.',
  organiserIntro: 'Preizkusita urejanje ur, naslovov in opisov. Nato izberita pogled za goste in preverita, kako se spremembe prikažejo na telefonu.',
  djIntro: 'Želje gostov s telefonov se zberejo na enem seznamu. Preizkusita oznake »Sprejeto« in »Predvajano«; v pravi poroki ima DJ svoj zaščiten dostop.',
  schedule: [
   ['Dobrodošli v Brdih', 'Pričakava vas na vrtu Vile Rožni vrt. Privoščite si limonado in lahek prigrizek; parkirišče je ob glavnem vhodu.'],
   ['Obred pod oljko', 'Na vrtu si izrečeva svoj »da«. Prosiva, zasedite mesta deset minut prej in za trenutek pospravite telefone.'],
   ['Nazdravimo ljubezni', 'Penina, kanapeji in skupinska fotografija na vrtu. Nato za nekaj portretov odideva s fotografom, vi pa uživajte v druženju.'],
   ['Večerja na terasi', 'Poiščite svojo mizo in uživajte v sezonskem meniju. Med hodi bodo kratki govori najinih najbližjih.'],
   ['Najin prvi ples', 'Najprej zapleševa midva, nato pa se nama pridružite na plesišču. Svojo najljubšo skladbo predlagajte DJ-ju prek iste QR-kode.'],
   ['Torta pod zvezdami', 'Skupaj razrežemo poročno torto z limono in malinami. Prihranite prostor še za kozarec penine!'],
   ['Nočni prigrizek in še en ples', 'Na terasi vas čakajo mini burgerji in zelenjavni prigrizki. Plesišče ostaja odprto, za odhod pa si uredite varen prevoz.'],
  ],
  menu: [
   ['Pozdrav iz kuhinje', 'Brusketi s pečenimi paradižniki, briški sir in oljke. Ob prihodu postrežemo tudi domačo limonado.'],
   ['Predjed', 'Rižota s sezonskimi gobami, parmezanom in svežimi zelišči. Na voljo tudi brez mlečnih izdelkov.'],
   ['Glavna jed', 'Počasi pečena govedina, krompirjev gratin in sezonska zelenjava. Vegetarijanska možnost: polnjeni jajčevci s čičeriko.'],
   ['Sladica', 'Poročna torta z limonino kremo in malinami ter sveže sadje. Za brezglutensko sladico se obrnite na strežno osebje.'],
   ['Posebne prehranske želje', 'Izbiro menija in alergije nama sporočite ob potrditvi udeležbe do 30. junija. Na dan poroke vsebnost alergenov preverite pri strežnem osebju.'],
  ],
  bingo: [
   ['Selfie z mladoporočencema', 'Ujemite nasmeh z Ano in Markom. Najboljši čas je med druženjem po obredu.'],
   ['Prvi ples', 'Ujemite objem, pogled ali prvi obrat. Fotografirajte s svojega mesta in pustite plesišče prosto.'],
   ['Skupinska fotografija', 'Zberite družbo pri svoji mizi in pokažite, kako se zabavate. Vsi v kader!'],
   ['Nasmeh gosta', 'Poiščite iskren nasmeh in ga s privolitvijo gosta dodajte med najine spomine.'],
   ['Poročna torta', 'Ob 22.00 nas čaka sladki trenutek. Ujemite torto, njene detajle ali prvi skupni rez.'],
   ['Najboljši plesni gib', 'Od prvega koraka do zadnjega hita: ujemite najbolj vesel trenutek na plesišču.'],
  ],
  page: [
   ['Najina zgodba', 'Spoznala sva se na pohodu, kjer je Ana pozabila vodo, Marko pa pot. Od takrat najraje raziskujeva skupaj. Po sedmih letih izletov, dolgih zajtrkov in malih vsakdanjih sreč sva pripravljena na najlepši skupni »da«.'],
   ['Obred na vrtu', 'V soboto, 31. julija 2027, vas ob 15.30 pričakava v Vili Rožni vrt v Goriških brdih. Obred se začne ob 16.00 pod oljko na vrtu. Prosiva, pridite pravočasno; ob dežju se preselimo v pokrito dvorano ob terasi.'],
   ['Praznovanje pod zvezdami', 'Po obredu nazdravimo na vrtu, ob 18.00 sedemo k večerji, ob 20.00 odpleševa prvi ples in ob 22.00 razrežemo torto. Oblecite se praznično in udobno; za vrt priporočava čevlje, s katerimi boste z lahkoto tudi zaplesali.'],
   ['Prihod in prevoz', 'Parkirišče je ob glavnem vhodu v vilo. Od parkirišča do vrta vodi kratka pešpot; če potrebujete pomoč pri dostopu, nama to sporočite ob potrditvi udeležbe. Za večerni odhod se vnaprej dogovorite za varen prevoz.'],
   ['Prenočišča in potrditev prihoda', 'Če boste ostali čez noč, priporočava zgodnjo rezervacijo prenočišča v okolici Dobrovega ali Šmartnega. Svoj prihod, spremljevalca, izbiro menija in alergije nama sporočite do 30. junija prek osebne povezave v vabilu.'],
   ['Spomine ustvarjamo skupaj', 'Na mizah vas čaka najina QR-koda. Prek iste povezave dodajte fotografije in videe v album, preverite program in jedilnik, rešujte fotografske izzive ali DJ-ju predlagajte skladbo. Hvala, ker boste del najine zgodbe — Ana in Marko.'],
  ],
  songNotes: ['Za Ano in Marka, da se plesišče napolni!', 'Za našo mizo: to je naša najljubša.', 'Posvetilo mladoporočencema za vse skupne poti.'],
 },
 hr: {
  location: 'Goriška brda, Slovenija', subtitle: 'Jedan ljetni dan. Svi naši najdraži ljudi. I priča koju pišemo zajedno.',
  notice: 'Ogledno vjenčanje s izmišljenim podacima i lokacijom. Isprobajte uređivanje i DJ oznake; promjene vrijede samo u ovom pregledu.',
  qrTitle: 'Jedan QR kod za cijeli naš dan', qrText: 'Skenirajte QR kod na stolu ili na ulazu. Na istoj poveznici pogledajte program i jelovnik, dodajte fotografije u naš album, sudjelujte u fotografskom bingu ili pošaljite DJ-u glazbenu želju. Bez preuzimanja aplikacije.',
  bingoIntro: 'Pomozite nam uhvatiti trenutke koje sami nećemo vidjeti. Odaberite izazov i dodajte fotografiju u zajednički album. Brojevi ispod prikazuju ogledne doprinose gostiju.',
  organiserIntro: 'Isprobajte uređivanje vremena, naslova i opisa. Zatim odaberite prikaz za goste i provjerite kako promjene izgledaju na telefonu.',
  djIntro: 'Glazbene želje s telefona gostiju dolaze na zajednički popis. Isprobajte oznake prihvaćeno i reproducirano; na pravom vjenčanju DJ ima zaštićeni pristup.',
  schedule: [
   ['Dobro došli u Brda', 'Čekamo vas u vrtu Vile Rožni vrt. Poslužite se limunadom i zalogajima; parkiralište je uz glavni ulaz.'],
   ['Obred pod maslinom', 'U vrtu izgovaramo svoje »da«. Molimo zauzmite mjesta deset minuta ranije i nakratko odložite telefone.'],
   ['Nazdravimo ljubavi', 'Pjenušac, kanapei i zajednička fotografija u vrtu. Zatim odlazimo na kratko fotografiranje, a vi uživajte u druženju.'],
   ['Večera na terasi', 'Pronađite svoj stol i uživajte u sezonskom jelovniku. Između sljedova slijede kratki govori naših najbližih.'],
   ['Naš prvi ples', 'Prvo plešemo mi, a zatim nam se pridružite. Omiljenu pjesmu predložite DJ-u putem istog QR koda.'],
   ['Torta pod zvijezdama', 'Zajedno režemo svadbenu tortu s limunom i malinama. Sačuvajte mjesta i za čašu pjenušca!'],
   ['Kasni zalogaj i još jedan ples', 'Na terasi vas čekaju mini burgeri i povrtni zalogaji. Plesni podij ostaje otvoren; za povratak organizirajte siguran prijevoz.'],
  ],
  menu: [
   ['Pozdrav iz kuhinje', 'Bruschette s pečenim rajčicama, sir iz Brda i masline. Po dolasku poslužujemo i domaću limunadu.'],
   ['Predjelo', 'Rižoto sa sezonskim gljivama, parmezanom i svježim začinskim biljem. Dostupna je i verzija bez mliječnih proizvoda.'],
   ['Glavno jelo', 'Polako pečena govedina, gratinirani krumpir i sezonsko povrće. Vegetarijanska opcija: patlidžani punjeni slanutkom.'],
   ['Desert', 'Svadbena torta s kremom od limuna i malinama te svježe voće. Za desert bez glutena obratite se osoblju.'],
   ['Posebne prehrambene potrebe', 'Odabir jelovnika i alergije navedite pri potvrdi dolaska do 30. lipnja. Na dan vjenčanja informacije o alergenima provjerite s osobljem.'],
  ],
  bingo: [
   ['Selfie s mladencima', 'Uhvatite osmijeh s Anom i Markom tijekom druženja nakon obreda.'],
   ['Prvi ples', 'Zabilježite zagrljaj, pogled ili prvi okret. Fotografirajte sa svog mjesta kako bi podij ostao slobodan.'],
   ['Zajednička fotografija', 'Okupite društvo sa svog stola i pokažite kako se zabavljate. Svi u kadar!'],
   ['Osmijeh gosta', 'Pronađite iskren osmijeh i uz pristanak gosta dodajte ga našim uspomenama.'],
   ['Svadbena torta', 'U 22:00 stiže slatki trenutak. Uhvatite tortu, detalje ili prvi zajednički rez.'],
   ['Najbolji plesni pokret', 'Od prvog koraka do posljednjeg hita: uhvatite najveseliji trenutak na podiju.'],
  ],
  page: [
   ['Naša priča', 'Upoznali smo se na planinarenju: Ana je zaboravila vodu, a Marko put. Od tada najradije istražujemo zajedno. Nakon sedam godina izleta, dugih doručaka i malih svakodnevnih sreća spremni smo za najljepše zajedničko »da«.'],
   ['Obred u vrtu', 'U subotu, 31. srpnja 2027., očekujemo vas u 15:30 u Vili Rožni vrt u Goriškim brdima. Obred počinje u 16:00 pod maslinom. Molimo dođite na vrijeme; u slučaju kiše selimo se u natkrivenu dvoranu pokraj terase.'],
   ['Slavlje pod zvijezdama', 'Nakon obreda nazdravljamo u vrtu, u 18:00 večeramo, u 20:00 plešemo prvi ples, a u 22:00 režemo tortu. Odjenite se svečano i udobno; za vrt preporučujemo cipele u kojima možete i zaplesati.'],
   ['Dolazak i prijevoz', 'Parkiralište je uz glavni ulaz. Do vrta vodi kratka pješačka staza; trebate li pomoć pri pristupu, navedite to pri potvrdi dolaska. Za večernji povratak unaprijed organizirajte siguran prijevoz.'],
   ['Smještaj i potvrda dolaska', 'Ako ostajete preko noći, preporučujemo ranu rezervaciju smještaja u okolici Dobrova ili Šmartna. Dolazak, pratnju, odabir jelovnika i alergije potvrdite do 30. lipnja putem osobne poveznice u pozivnici.'],
   ['Uspomene stvaramo zajedno', 'Na stolovima vas čeka naš QR kod. Putem iste poveznice dodajte fotografije i videozapise u album, pogledajte program i jelovnik, sudjelujte u fotoizazovima ili predložite pjesmu DJ-u. Hvala što ste dio naše priče — Ana i Marko.'],
  ],
  songNotes: ['Za Anu i Marka, neka se podij napuni!', 'Za naš stol: ovo je naša omiljena.', 'Posveta mladencima za sva zajednička putovanja.'],
 },
 sr: {
  location: 'Goriška brda, Slovenija', subtitle: 'Jedan letnji dan. Svi naši najdraži ljudi. I priča koju pišemo zajedno.',
  notice: 'Primer venčanja sa izmišljenim podacima i mestom proslave. Isprobajte uređivanje i DJ oznake; izmene važe samo u ovom pregledu.',
  qrTitle: 'Jedan QR kod za ceo naš dan', qrText: 'Skenirajte QR kod na stolu ili na ulazu. Preko istog linka pogledajte program i jelovnik, dodajte fotografije u naš album, učestvujte u fotografskom bingu ili pošaljite DJ-u muzičku želju. Bez preuzimanja aplikacije.',
  bingoIntro: 'Pomozite nam da sačuvamo trenutke koje sami nećemo videti. Izaberite izazov i dodajte fotografiju u zajednički album. Brojevi ispod prikazuju probne doprinose gostiju.',
  organiserIntro: 'Isprobajte uređivanje vremena, naslova i opisa. Zatim izaberite prikaz za goste i proverite kako izmene izgledaju na telefonu.',
  djIntro: 'Muzičke želje sa telefona gostiju stižu na zajednički spisak. Isprobajte oznake prihvaćeno i pušteno; na pravom venčanju DJ ima zaštićeni pristup.',
  schedule: [
   ['Dobro došli u Brda', 'Čekamo vas u vrtu Vile Rožni vrt. Poslužite se limunadom i zalogajima; parking je uz glavni ulaz.'],
   ['Obred pod maslinom', 'U vrtu izgovaramo svoje »da«. Molimo zauzmite mesta deset minuta ranije i nakratko odložite telefone.'],
   ['Nazdravimo ljubavi', 'Penušavo vino, kanapei i zajednička fotografija u vrtu. Zatim odlazimo na kratko fotografisanje, a vi uživajte u druženju.'],
   ['Večera na terasi', 'Pronađite svoj sto i uživajte u sezonskom jelovniku. Između jela slede kratki govori naših najbližih.'],
   ['Naš prvi ples', 'Prvo plešemo mi, a zatim nam se pridružite. Omiljenu pesmu predložite DJ-u preko istog QR koda.'],
   ['Torta pod zvezdama', 'Zajedno sečemo svadbenu tortu sa limunom i malinama. Sačuvajte mesta i za čašu penušavog vina!'],
   ['Kasni zalogaj i još jedan ples', 'Na terasi vas čekaju mini burgeri i zalogaji od povrća. Plesni podijum ostaje otvoren; za povratak organizujte bezbedan prevoz.'],
  ],
  menu: [
   ['Pozdrav iz kuhinje', 'Brusketi sa pečenim paradajzom, sir iz Brda i masline. Po dolasku služimo i domaću limunadu.'],
   ['Predjelo', 'Rižoto sa sezonskim pečurkama, parmezanom i svežim začinskim biljem. Dostupna je i verzija bez mlečnih proizvoda.'],
   ['Glavno jelo', 'Polako pečena govedina, gratinirani krompir i sezonsko povrće. Vegetarijanska opcija: patlidžani punjeni leblebijama.'],
   ['Dezert', 'Svadbena torta sa kremom od limuna i malinama i sveže voće. Za dezert bez glutena obratite se osoblju.'],
   ['Posebne potrebe u ishrani', 'Izbor menija i alergije navedite pri potvrdi dolaska do 30. juna. Na dan venčanja informacije o alergenima proverite sa osobljem.'],
  ],
  bingo: [
   ['Selfi sa mladencima', 'Uhvatite osmeh sa Anom i Markom tokom druženja posle obreda.'],
   ['Prvi ples', 'Zabeležite zagrljaj, pogled ili prvi okret. Fotografišite sa svog mesta kako bi podijum ostao slobodan.'],
   ['Zajednička fotografija', 'Okupite društvo sa svog stola i pokažite kako se zabavljate. Svi u kadar!'],
   ['Osmeh gosta', 'Pronađite iskren osmeh i uz pristanak gosta dodajte ga našim uspomenama.'],
   ['Svadbena torta', 'U 22:00 stiže slatki trenutak. Uhvatite tortu, detalje ili prvi zajednički rez.'],
   ['Najbolji plesni pokret', 'Od prvog koraka do poslednjeg hita: uhvatite najveseliji trenutak na podijumu.'],
  ],
  page: [
   ['Naša priča', 'Upoznali smo se na planinarenju: Ana je zaboravila vodu, a Marko put. Od tada najradije istražujemo zajedno. Posle sedam godina izleta, dugih doručaka i malih svakodnevnih sreća spremni smo za najlepše zajedničko »da«.'],
   ['Obred u vrtu', 'U subotu, 31. jula 2027., očekujemo vas u 15:30 u Vili Rožni vrt u Goriškim brdima. Obred počinje u 16:00 pod maslinom. Molimo dođite na vreme; u slučaju kiše selimo se u natkrivenu salu pored terase.'],
   ['Slavlje pod zvezdama', 'Posle obreda nazdravljamo u vrtu, u 18:00 večeramo, u 20:00 plešemo prvi ples, a u 22:00 sečemo tortu. Obucite se svečano i udobno; za vrt preporučujemo cipele u kojima možete i da zaplešete.'],
   ['Dolazak i prevoz', 'Parking je uz glavni ulaz. Do vrta vodi kratka pešačka staza; ako vam je potrebna pomoć pri pristupu, navedite to pri potvrdi dolaska. Za večernji povratak unapred organizujte bezbedan prevoz.'],
   ['Smeštaj i potvrda dolaska', 'Ako ostajete preko noći, preporučujemo ranu rezervaciju smeštaja u okolini Dobrova ili Šmartna. Dolazak, pratnju, izbor menija i alergije potvrdite do 30. juna preko ličnog linka u pozivnici.'],
   ['Uspomene stvaramo zajedno', 'Na stolovima vas čeka naš QR kod. Preko istog linka dodajte fotografije i video-snimke u album, pogledajte program i jelovnik, učestvujte u foto-izazovima ili predložite pesmu DJ-u. Hvala što ste deo naše priče — Ana i Marko.'],
  ],
  songNotes: ['Za Anu i Marka, neka se podijum napuni!', 'Za naš sto: ovo je naša omiljena.', 'Posveta mladencima za sva zajednička putovanja.'],
 },
 en: {
  location: 'Goriška brda, Slovenia', subtitle: 'One summer day. All our favourite people. A story we will write together.',
  notice: 'An example wedding with fictional details and venue. Try editing the content and changing DJ statuses; changes stay in this preview only.',
  qrTitle: 'One QR code for our whole day', qrText: 'Scan the QR code on your table or at the entrance. The same link opens the schedule and menu, our shared photo album, photo bingo and song requests for the DJ. Everything works on your phone, without downloading an app.',
  bingoIntro: 'Help us capture the moments we might miss. Choose a challenge and add a photo to the shared album. The numbers below are sample guest contributions.',
  organiserIntro: 'Try editing the times, titles and descriptions. Then switch to the guest view to see how your changes look on a phone.',
  djIntro: 'Requests sent from guests’ phones appear together here. Try marking a song accepted or played; at a real wedding the DJ has protected access.',
  schedule: [
   ['Welcome to Brda', 'Meet us in the garden at Vila Rožni vrt. Help yourself to lemonade and a light bite; parking is beside the main entrance.'],
   ['Vows beneath the olive tree', 'We will say our vows in the garden. Please take your seats ten minutes early and put your phones away for the ceremony.'],
   ['A toast to love', 'Sparkling wine, canapés and a group photo in the garden. We will slip away for a few portraits while you enjoy catching up.'],
   ['Dinner on the terrace', 'Find your table and enjoy a seasonal menu, with a few short speeches from our favourite people between courses.'],
   ['Our first dance', 'We will take the first steps, then it is your turn to join us. Request your favourite track from the DJ through the same QR code.'],
   ['Cake beneath the stars', 'Join us as we cut our lemon and raspberry wedding cake. Save a little room for another glass of sparkling wine!'],
   ['Late-night bites and one more dance', 'Mini burgers and vegetable bites will be served on the terrace. The dance floor stays open; please arrange a safe journey home.'],
  ],
  menu: [
   ['A welcome from the kitchen', 'Bruschetta with roasted tomatoes, local Brda cheese and olives. Homemade lemonade is served on arrival.'],
   ['Starter', 'Seasonal mushroom risotto with Parmesan and fresh herbs. A dairy-free version is also available.'],
   ['Main course', 'Slow-roasted beef with potato gratin and seasonal vegetables. Vegetarian option: aubergine stuffed with chickpeas.'],
   ['Dessert', 'Lemon and raspberry wedding cake with fresh fruit. Please ask the serving team about the gluten-free dessert.'],
   ['Dietary requirements', 'Choose your menu and tell us about allergies when you RSVP by 30 June. On the day, check allergen information with the serving team.'],
  ],
  bingo: [
   ['A selfie with the newlyweds', 'Catch a smile with Ana and Marko while we mingle after the ceremony.'],
   ['The first dance', 'Capture a hug, a glance or the first turn. Take your photo from your spot and leave the dance floor clear.'],
   ['Your table together', 'Gather everyone at your table and show us how you are celebrating. Everyone in the frame!'],
   ['A guest’s smile', 'Find a lovely, candid smile and ask the guest before adding it to our memories.'],
   ['The wedding cake', 'Our sweet moment arrives at 22:00. Capture the cake, its details or our first slice together.'],
   ['The best dance move', 'From the first step to the last song: capture a joyful moment on the dance floor.'],
  ],
  page: [
   ['Our story', 'We met on a hike: Ana had forgotten her water, and Marko had lost the trail. Ever since, we have loved exploring together. After seven years of adventures, long breakfasts and everyday happiness, we are ready for our favourite shared “yes”.'],
   ['A garden ceremony', 'Join us on Saturday, 31 July 2027, from 15:30 at Vila Rožni vrt in Goriška brda. The ceremony begins at 16:00 beneath the olive tree. Please arrive on time; if it rains, we will move into the covered hall beside the terrace.'],
   ['Celebrating beneath the stars', 'After a garden toast, dinner starts at 18:00, our first dance at 20:00 and cake at 22:00. Dress for a celebration, but stay comfortable: garden-friendly shoes that can also dance are a good idea.'],
   ['Getting here', 'Parking is beside the main entrance, followed by a short path to the garden. If you need help with access, please mention it when you RSVP. Arrange a safe journey home before the evening begins.'],
   ['Staying over and RSVPs', 'If you are staying overnight, we recommend booking early around Dobrovo or Šmartno. Please confirm attendance, your companion, menu choice and any allergies by 30 June using the personal link in your invitation.'],
   ['Making memories together', 'Our QR code will be waiting on the tables. Use the same link to add photos and videos to the album, check the schedule and menu, try the photo challenges or request a song from the DJ. Thank you for being part of our story — Ana and Marko.'],
  ],
  songNotes: ['For Ana and Marko — let’s fill the dance floor!', 'For our table: this is our favourite.', 'For the newlyweds and all the journeys ahead.'],
 },
 de: {
  location: 'Goriška brda, Slowenien', subtitle: 'Ein Sommertag. Alle unsere Lieblingsmenschen. Und eine Geschichte, die wir gemeinsam schreiben.',
  notice: 'Beispielhochzeit mit erfundenen Angaben und Veranstaltungsort. Probiert Bearbeitung und DJ-Status aus; Änderungen bleiben nur in dieser Vorschau.',
  qrTitle: 'Ein QR-Code für unseren ganzen Tag', qrText: 'Scannt den QR-Code auf eurem Tisch oder am Eingang. Derselbe Link öffnet Ablauf und Menü, unser Fotoalbum, das Foto-Bingo und Musikwünsche für den DJ. Alles auf dem Handy, ohne eine App herunterzuladen.',
  bingoIntro: 'Helft uns, auch die Momente festzuhalten, die wir selbst verpassen. Wählt eine Aufgabe und ergänzt das gemeinsame Album. Die Zahlen unten zeigen beispielhafte Fotobeiträge.',
  organiserIntro: 'Probiert aus, Zeiten, Titel und Beschreibungen zu bearbeiten. Wechselt danach zur Gästeansicht und seht, wie die Änderungen auf dem Handy aussehen.',
  djIntro: 'Wünsche von den Handys der Gäste erscheinen hier gemeinsam. Probiert die Status angenommen und gespielt aus; bei der echten Hochzeit erhält der DJ einen geschützten Zugang.',
  schedule: [
   ['Willkommen in Brda', 'Wir erwarten euch im Garten der Vila Rožni vrt. Genießt Limonade und kleine Häppchen; Parkplätze gibt es am Haupteingang.'],
   ['Trauung unter dem Olivenbaum', 'Im Garten geben wir uns das Jawort. Nehmt bitte zehn Minuten vorher Platz und legt die Handys für die Trauung beiseite.'],
   ['Auf die Liebe', 'Sekt, Canapés und ein Gruppenfoto im Garten. Danach machen wir kurz Paarfotos, während ihr Zeit miteinander verbringt.'],
   ['Abendessen auf der Terrasse', 'Findet euren Tisch und genießt ein saisonales Menü. Zwischen den Gängen gibt es kurze Reden unserer Liebsten.'],
   ['Unser erster Tanz', 'Wir machen die ersten Schritte, dann kommt ihr dazu. Euren Lieblingssong könnt ihr dem DJ über denselben QR-Code wünschen.'],
   ['Torte unter den Sternen', 'Gemeinsam schneiden wir die Zitronen-Himbeer-Hochzeitstorte an. Lasst noch Platz für ein Glas Sekt!'],
   ['Mitternachtssnack und noch ein Tanz', 'Auf der Terrasse warten Mini-Burger und Gemüsesnacks. Die Tanzfläche bleibt offen; organisiert bitte eine sichere Heimfahrt.'],
  ],
  menu: [
   ['Gruß aus der Küche', 'Bruschetta mit gerösteten Tomaten, Käse aus Brda und Oliven. Zur Begrüßung gibt es hausgemachte Limonade.'],
   ['Vorspeise', 'Saisonales Pilzrisotto mit Parmesan und frischen Kräutern. Auch ohne Milchprodukte erhältlich.'],
   ['Hauptgericht', 'Langsam gegartes Rindfleisch, Kartoffelgratin und saisonales Gemüse. Vegetarisch: mit Kichererbsen gefüllte Aubergine.'],
   ['Dessert', 'Zitronen-Himbeer-Hochzeitstorte und frisches Obst. Fragt das Serviceteam nach dem glutenfreien Dessert.'],
   ['Besondere Ernährungswünsche', 'Gebt Menüwahl und Allergien bei eurer Zusage bis zum 30. Juni an. Fragt am Hochzeitstag das Serviceteam nach Allergenen.'],
  ],
  bingo: [
   ['Selfie mit dem Brautpaar', 'Fangt ein Lächeln mit Ana und Marko beim Zusammensein nach der Trauung ein.'],
   ['Der erste Tanz', 'Eine Umarmung, ein Blick oder die erste Drehung: fotografiert von eurem Platz aus und lasst die Tanzfläche frei.'],
   ['Euer Tisch zusammen', 'Versammelt alle an eurem Tisch und zeigt, wie ihr feiert. Alle mit aufs Bild!'],
   ['Das Lächeln eines Gastes', 'Findet ein ehrliches Lächeln und fragt den Gast, bevor ihr es unseren Erinnerungen hinzufügt.'],
   ['Die Hochzeitstorte', 'Um 22:00 Uhr wird es süß. Fotografiert die Torte, ihre Details oder das gemeinsame Anschneiden.'],
   ['Der beste Tanzschritt', 'Vom ersten Schritt bis zum letzten Lied: haltet einen fröhlichen Moment auf der Tanzfläche fest.'],
  ],
  page: [
   ['Unsere Geschichte', 'Wir haben uns beim Wandern kennengelernt: Ana hatte ihr Wasser vergessen, Marko den Weg verloren. Seitdem erkunden wir die Welt am liebsten zusammen. Nach sieben Jahren voller Ausflüge, langer Frühstücke und kleiner Glücksmomente freuen wir uns auf unser gemeinsames Ja.'],
   ['Trauung im Garten', 'Am Samstag, 31. Juli 2027, erwarten wir euch ab 15:30 Uhr in der Vila Rožni vrt in Goriška brda. Die Trauung beginnt um 16:00 Uhr unter dem Olivenbaum. Kommt bitte pünktlich; bei Regen wechseln wir in den überdachten Saal an der Terrasse.'],
   ['Feiern unter den Sternen', 'Nach dem Anstoßen im Garten essen wir um 18:00 Uhr. Um 20:00 Uhr beginnt unser erster Tanz, um 22:00 Uhr schneiden wir die Torte an. Zieht euch festlich und bequem an; für den Garten empfehlen wir Schuhe, in denen ihr auch tanzen könnt.'],
   ['Anreise und Heimfahrt', 'Parkplätze liegen am Haupteingang. Ein kurzer Fußweg führt zum Garten; falls ihr Hilfe beim Zugang benötigt, gebt uns bei der Zusage Bescheid. Plant vorab eine sichere Heimfahrt für den Abend.'],
   ['Übernachten und Zusagen', 'Wer übernachten möchte, sollte frühzeitig rund um Dobrovo oder Šmartno buchen. Bestätigt Teilnahme, Begleitung, Menüwahl und Allergien bitte bis zum 30. Juni über euren persönlichen Einladungslink.'],
   ['Gemeinsam Erinnerungen sammeln', 'Auf den Tischen wartet unser QR-Code. Über denselben Link könnt ihr Fotos und Videos ins Album laden, Ablauf und Menü ansehen, Fotoaufgaben lösen oder dem DJ ein Lied wünschen. Danke, dass ihr Teil unserer Geschichte seid — Ana und Marko.'],
  ],
  songNotes: ['Für Ana und Marko — auf eine volle Tanzfläche!', 'Für unseren Tisch: unser Lieblingslied.', 'Für das Brautpaar und alle gemeinsamen Wege.'],
 },
 es: {
  location: 'Goriška brda, Eslovenia', subtitle: 'Un día de verano. Todas nuestras personas favoritas. Una historia que escribiremos juntos.',
  notice: 'Boda de ejemplo con datos y lugar ficticios. Probad a editar y cambiar los estados del DJ; los cambios solo afectan a esta vista previa.',
  qrTitle: 'Un QR para todo nuestro día', qrText: 'Escanead el QR de la mesa o de la entrada. El mismo enlace abre el programa y el menú, el álbum compartido, el bingo fotográfico y las peticiones para el DJ. Todo desde el móvil, sin descargar una aplicación.',
  bingoIntro: 'Ayudadnos a guardar los momentos que quizá nos perdamos. Elegid un reto y añadid una foto al álbum compartido. Las cifras de abajo son aportaciones de ejemplo.',
  organiserIntro: 'Probad a editar horas, títulos y descripciones. Después cambiad a la vista de invitados para ver el resultado en el móvil.',
  djIntro: 'Las peticiones enviadas desde los móviles aparecen en esta lista. Probad los estados aceptada y reproducida; en una boda real el DJ tiene un acceso protegido.',
  schedule: [
   ['Bienvenidos a Brda', 'Os esperamos en el jardín de Vila Rožni vrt. Disfrutad de limonada y unos aperitivos; el aparcamiento está junto a la entrada principal.'],
   ['Ceremonia bajo el olivo', 'Nos daremos el sí en el jardín. Ocupad vuestros asientos diez minutos antes y guardad los móviles durante la ceremonia.'],
   ['Un brindis por el amor', 'Vino espumoso, canapés y una foto de grupo en el jardín. Nos escaparemos a hacer unos retratos mientras disfrutáis de la compañía.'],
   ['Cena en la terraza', 'Buscad vuestra mesa y disfrutad de un menú de temporada, con unas palabras de nuestros seres queridos entre platos.'],
   ['Nuestro primer baile', 'Daremos los primeros pasos y después os toca acompañarnos. Pedid vuestra canción favorita al DJ desde el mismo QR.'],
   ['Tarta bajo las estrellas', 'Cortaremos juntos la tarta de limón y frambuesa. ¡Guardad sitio para otra copa de espumoso!'],
   ['Un bocado y un baile más', 'En la terraza habrá miniburguesas y aperitivos vegetales. La pista sigue abierta; organizad un regreso seguro.'],
  ],
  menu: [
   ['Bienvenida de la cocina', 'Bruschetta de tomates asados, queso de Brda y aceitunas. A la llegada servimos limonada casera.'],
   ['Entrante', 'Risotto de setas de temporada con parmesano y hierbas frescas. También disponible sin lácteos.'],
   ['Plato principal', 'Ternera asada lentamente con gratinado de patatas y verduras de temporada. Opción vegetariana: berenjena rellena de garbanzos.'],
   ['Postre', 'Tarta de boda de limón y frambuesa con fruta fresca. Preguntad al personal por el postre sin gluten.'],
   ['Necesidades alimentarias', 'Indicad el menú y las alergias al confirmar la asistencia antes del 30 de junio. El día de la boda consultad los alérgenos con el personal.'],
  ],
  bingo: [
   ['Selfi con los novios', 'Capturad una sonrisa con Ana y Marko durante el encuentro después de la ceremonia.'],
   ['El primer baile', 'Un abrazo, una mirada o la primera vuelta. Haced la foto desde vuestro sitio y dejad libre la pista.'],
   ['Vuestra mesa al completo', 'Reunid a todos los de vuestra mesa y enseñadnos cómo lo celebráis. ¡Todos dentro de la foto!'],
   ['La sonrisa de un invitado', 'Encontrad una sonrisa espontánea y pedid permiso antes de añadirla a nuestros recuerdos.'],
   ['La tarta de boda', 'A las 22:00 llega el momento dulce. Capturad la tarta, sus detalles o nuestro primer corte juntos.'],
   ['El mejor paso de baile', 'Del primer paso a la última canción: guardad un momento alegre de la pista.'],
  ],
  page: [
   ['Nuestra historia', 'Nos conocimos haciendo senderismo: Ana se había olvidado el agua y Marko había perdido el camino. Desde entonces nos encanta explorar juntos. Tras siete años de aventuras, desayunos largos y pequeñas alegrías, estamos listos para nuestro sí más especial.'],
   ['Ceremonia en el jardín', 'Os esperamos el sábado 31 de julio de 2027 desde las 15:30 en Vila Rožni vrt, en Goriška brda. La ceremonia empieza a las 16:00 bajo el olivo. Llegad puntuales; si llueve, pasaremos al salón cubierto junto a la terraza.'],
   ['Celebración bajo las estrellas', 'Tras brindar en el jardín, cenaremos a las 18:00, bailaremos a las 20:00 y cortaremos la tarta a las 22:00. Venid elegantes y cómodos; recomendamos zapatos adecuados para el jardín con los que también podáis bailar.'],
   ['Cómo llegar y volver', 'El aparcamiento está junto a la entrada principal. Un sendero corto lleva al jardín; si necesitáis ayuda para acceder, indicadlo al confirmar. Organizad con antelación un regreso seguro para la noche.'],
   ['Alojamiento y confirmación', 'Si os quedáis a dormir, recomendamos reservar pronto por la zona de Dobrovo o Šmartno. Confirmad asistencia, acompañante, menú y alergias antes del 30 de junio mediante el enlace personal de la invitación.'],
   ['Recuerdos que creamos juntos', 'Nuestro QR os espera en las mesas. Desde el mismo enlace podréis añadir fotos y vídeos al álbum, consultar programa y menú, participar en los retos o pedir una canción al DJ. Gracias por formar parte de nuestra historia — Ana y Marko.'],
  ],
  songNotes: ['¡Para Ana y Marko, que se llene la pista!', 'Para nuestra mesa: es nuestra favorita.', 'Para los novios y todos los viajes que les esperan.'],
 },
} satisfies Record<Lang, DemoCopy>;

export function weddingDemoCopy(lang: Lang): DemoCopy { return COPY[lang]; }
export function demoWeddingDate(lang: Lang): string {
 return new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${DEMO_WEDDING.date}T12:00:00Z`));
}
export function weddingDemo(lang: Lang) {
 const text = weddingDemoCopy(lang);
 const rows = (kind: string, values: readonly TextPair[]): WeddingRow[] => values.map(([title, detail], index) => ({ id: `demo-${kind}-${index + 1}`, title, detail, sourceLang: lang }));
 const schedule: WeddingRow[] = rows('schedule', text.schedule).map((row, index) => ({ ...row, time: TIMES[index] }));
 const challenges = rows('bingo', text.bingo);
 const songs: WeddingSong[] = [
  { id: 'demo-song-1', title: 'Dancing Queen', artist: 'ABBA', requestedBy: 'Maja', note: text.songNotes[0], status: 'new', createdAt: '2027-07-31T18:15:00Z' },
  { id: 'demo-song-2', title: 'September', artist: 'Earth, Wind & Fire', requestedBy: 'Luka', note: text.songNotes[1], status: 'accepted', createdAt: '2027-07-31T18:10:00Z' },
  { id: 'demo-song-3', title: 'Perfect', artist: 'Ed Sheeran', requestedBy: 'Nina', note: text.songNotes[2], status: 'played', createdAt: '2027-07-31T17:50:00Z' },
 ];
 return { schedule, menu: rows('menu', text.menu), challenges, songs,
  completed: Object.fromEntries(challenges.map((row, index) => [row.id, [6, 4, 8, 5, 3, 7][index]])),
 };
}
