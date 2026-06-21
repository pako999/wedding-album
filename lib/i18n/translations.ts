// ─── Language types ───────────────────────────────────────────────────────────

export type Lang = "sl" | "hr" | "sr" | "en" | "de" | "es";

export const LANGS: { code: Lang; flag: string; label: string; native: string }[] = [
  { code: "sl", flag: "🇸🇮", label: "Slovenian", native: "Slovenščina" },
  { code: "hr", flag: "🇭🇷", label: "Croatian",  native: "Hrvatski"    },
  { code: "sr", flag: "🇷🇸", label: "Serbian",   native: "Srpski"      },
  { code: "en", flag: "🇬🇧", label: "English",   native: "English"     },
  { code: "de", flag: "🇩🇪", label: "German",    native: "Deutsch"     },
  { code: "es", flag: "🇪🇸", label: "Spanish",   native: "Español"     },
];

// ─── Translation dictionary ───────────────────────────────────────────────────

export interface Translations {
  // Page meta
  albumTitle: string;           // "Poročni album"
  by: string;                   // "by Guestcam"

  // Password gate
  passwordProtected: string;    // "This album is password protected"
  passwordPlaceholder: string;  // "Password"
  openAlbum: string;            // "Open album"
  wrongPassword: string;        // "Wrong password"

  // Stats bar
  photos: (n: number) => string; // "47 photos"
  daysUntil: (n: number) => string;  // "45 days to go"
  daysSince: (n: number) => string;  // "23 days ago"
  today: string;                // "Today is the day!"

  // Name gate
  yourName: string;             // "Your name:"
  namePlaceholder: string;      // "Ana Novak"
  confirm: string;              // "Confirm"
  change: string;               // "Change"
  hello: (name: string) => string; // "Hello, Ana"

  // Upload bar / button
  uploadPhotos: string;         // "Upload photos"

  // Empty state
  noPhotosTitle: string;        // "No photos yet"
  noPhotosDesc: string;         // "Be the first to share a memory."

  // Upload modal
  uploadModalTitle: string;     // "Upload photos"
  dropzone: string;             // "Drag or click to select"
  dropzoneHint: (remaining: number) => string; // "JPG, PNG, WEBP · max 20 MB · 47 remaining"
  dropzoneActive: string;       // "Drop photos here"
  uploading: string;            // "Uploading…"
  uploadBtn: (n: number) => string; // "Upload (3)"
  cancel: string;               // "Cancel"
  successTitle: (n: number) => string; // "3 photos uploaded"
  successDesc: string;          // "Thank you for your memories!"
  approvalNote: string;         // "Photos appear in the gallery as soon as they're processed."
  demoUploadNote: string;       // demo album: photos not public, just a test
  nameOnboardPrompt: string;    // "Enter your name to upload photos"
  close: string;                // "Close"
  closeWindow: string;          // "Close window"
  fileUploaded: string;         // "Uploaded"
  alreadyUploaded: string;      // "Already in album"
  fileNetworkError: string;     // "Network error"
  fileQueued: string;           // "Queued — will upload when back online"
  offlineBanner: string;        // "No internet — photos queued, will upload automatically"

  // Limit warning
  limitReached: string;         // "Album photo limit reached"
  filesDropped: (n: number) => string; // "3 files not added — album limit reached"

  // Footer
  footerCredit: string;         // "Guestcam"

  // Event type labels
  eventLabel: (type: string) => string; // "Wedding" / "Birthday" / …

  // Hero / live indicator
  live: string;                 // "Live"
  photoCount: (n: number) => string; // "12 photos"
  videoCount: (n: number) => string; // "3 videos"

  // Type filter pills
  filterAll: string;            // "All"
  filterAllShort: string;       // "All"
  filterPhotos: string;         // "Photos"
  filterPhotosShort: string;    // "Photos"
  filterVideos: string;         // "Videos"
  filterVideosShort: string;    // "Videos"

  // Moments (named sub-galleries)
  momentsAll: string;           // "All" — moment tab showing every photo
  momentsTitle: string;         // "Moments"
  momentsDesc: string;          // admin section description
  momentNamePlaceholder: string;// "e.g. Ceremony"
  momentAdd: string;            // "Add"
  momentRename: string;         // "Rename"
  momentDelete: string;         // "Delete"
  momentDeleteConfirm: string;  // confirm prompt
  momentEmpty: string;          // "No moments yet."
  momentLabel: string;          // "Moment" — upload modal select label
  momentNone: string;           // "No moment" — upload modal select option

  // Presentation buttons
  slideshow: string;            // "Slideshow"
  slideshowShort: string;       // "Slides"
  photoWall: string;            // "Photo wall"
  photoWallTitle: string;       // "Photo wall (projection)"
  highlightsFilm: string;       // "Highlights film"
  film: string;                 // "Film"

  // Name gate inline
  yourNamePlaceholder: string;  // "Your name"
  next: string;                 // "Next →"
  uploadShort: string;          // "Upload"
  takePhoto: string;            // "Take photo"
  uploadFromGallery: string;    // "Upload from gallery"

  // Album full
  galleryFull: string;          // "Gallery is full"
  galleryFullDesc: string;      // "The host must upgrade …"

  // Person filter
  everyone: string;             // "Everyone"
  photosFrom: string;           // "Photos from:"
  clear: string;                // "Clear ✕"
  personNoVideos: (name: string) => string; // "Ana has no videos"
  personNoPhotos: (name: string) => string; // "Ana has no photos"
  noVideos: string;             // "No videos"
  noPhotos: string;             // "No photos"

  // Empty state CTA
  beFirstToShare: string;       // "Be the first to share a photo!"
  beFirstToShareHint: string;   // "Scan the QR code or upload from your phone — your photos appear here instantly."

  // Section headers
  videosSection: string;        // "Videos"
  photosSection: string;        // "Photos"

  // Sort & filter controls
  sortLabel: string;            // "Sort"
  sortNewest: string;           // "Newest first"
  sortOldest: string;           // "Oldest first"
  sortMostLiked: string;        // "Most liked"
  myUploads: string;            // "My uploads"
  myReactions: string;          // "My reactions"
  noMyUploads: string;          // "You haven't uploaded anything yet"
  noMyReactions: string;        // "You haven't liked any photos yet"

  // Reactions
  like: string;                 // "Like"
  unlike: string;               // "Remove like"
  comments: string;             // "Comments"
  beFirstToComment: string;     // "Be the first to comment!"
  photoBy: string;              // "Photo:"
  enterNameToComment: string;   // "Enter your name to comment:"
  enterNameToLike: string;      // "Enter your name first to like photos:"
  addComment: string;           // "Add a comment…"
  ok: string;                   // "OK"
  showInfo: string;             // "Likes & comments"
  hideInfo: string;             // "Hide"

  // Upload time
  justNow: string;              // "Just now"
  minutesAgo: (n: number) => string; // "5 min"
  todayAt: (time: string) => string; // "Today, 14:30"
  yesterdayAt: (time: string) => string; // "Yesterday, 14:30"

  // Upload modal extras
  fullQuality: string;          // "Full quality"
  maxImageSize: (mb: number) => string; // "Up to 50 MB"
  maxVideoSize: (mb: number) => string; // "Videos up to 500 MB"
  dropFiles: string;            // "Drop files"
  selectPhotosVideos: string;   // "Select photos and videos"
  fileTypesHint: (remaining: number) => string; // "JPEG · PNG · … · up to N files"
  optimizing: string;           // "Optimizing…"
  uploadingProgress: (current: number, total: number) => string; // "Uploading 1 / 3"
  saving: string;               // "Saving…"
  doNotCloseWindow: string;     // "Do not close the window …"
  genericError: string;         // "Error"

  // Upload reminder
  remindMeLink: string;         // "📩 Remind me to upload later"
  reminderTitle: string;        // "Get an upload reminder"
  reminderDesc: string;         // "Enter your email and we'll remind you to upload your photos."
  reminderEmailPlaceholder: string; // "your@email.com"
  reminderWhenLabel: string;    // "When to send"
  reminderWhenNow: string;      // "Send now"
  reminderWhen1h: string;       // "In 1 hour"
  reminderWhenTomorrow: string; // "Tomorrow"
  reminderWhen3d: string;       // "In 3 days"
  reminderSend: string;         // "Send"
  reminderSending: string;      // "Sending…"
  reminderSuccess: string;      // "Reminder set! Check your inbox."
  reminderError: string;        // "Something went wrong. Please try again."
  reminderInvalidEmail: string; // "Please enter a valid email address."

  // Save album link to email (shown on upload success screen)
  saveLinkTitle: string;         // "Save link to your email"
  saveLinkDesc: string;          // "Enter your email and we'll send you the album link so you can find it anytime."
  saveLinkSend: string;          // "Send"
  saveLinkSent: string;          // "Link sent! Check your inbox."

  // Discount code (upgrade / checkout page)
  discountCode: string;           // "Discount code" — section label
  discountPlaceholder: string;    // "Enter code…"
  discountApply: string;          // "Apply"
  discountRemove: string;         // "Remove"
  discountInvalid: string;        // "Code is invalid or has expired."
  discountOff: (n: number) => string; // "−20% off"
}

// ─── All translations ─────────────────────────────────────────────────────────

const sl: Translations = {
  albumTitle: "Poročni album",
  by: "Guestcam",
  passwordProtected: "Ta album je zaščiten z geslom.",
  passwordPlaceholder: "Geslo",
  openAlbum: "Odpri album",
  wrongPassword: "Napačno geslo.",
  photos: (n) => `${n} ${n === 1 ? "fotografija" : n < 5 ? "fotografije" : "fotografij"}`,
  daysUntil: (n) => `Še ${n} ${n === 1 ? "dan" : n < 5 ? "dni" : "dni"}`,
  daysSince: (n) => `${n} ${n === 1 ? "dan" : "dni"} nazaj`,
  today: "Danes je ta dan! 🎉",
  yourName: "Vaše ime:",
  namePlaceholder: "Ana Novak",
  confirm: "Potrdi",
  change: "Spremeni",
  hello: (name) => `Zdravo, ${name}`,
  uploadPhotos: "Naloži fotografije",
  noPhotosTitle: "Še ni fotografij",
  noPhotosDesc: "Bodite prvi, ki naloži spomin.",
  uploadModalTitle: "Naloži fotografije",
  dropzone: "Povleci ali klikni za izbiro",
  dropzoneHint: (r) => `JPG, PNG, WEBP · max 20 MB · še ${r} možnih`,
  dropzoneActive: "Spusti fotografije sem",
  uploading: "Nalaganje…",
  uploadBtn: (n) => `Naloži${n > 0 ? ` (${n})` : ""}`,
  cancel: "Prekliči",
  successTitle: (n) => `${n} ${n === 1 ? "fotografija naložena" : "fotografij naloženih"}`,
  successDesc: "Hvala za vaše spomine!",
  approvalNote: "📸 Vaše fotografije bodo vidne v galeriji takoj, ko jih sistem obdela.",
  demoUploadNote: "👀 To je predstavitveni album — vaše fotografije ne bodo javno objavljene. Naložene so v testni album, da vidite, kako poteka deljenje fotografij.",
  nameOnboardPrompt: "Vnesite svoje ime, da naložite svoje fotografije in videe.",
  close: "Zapri",
  closeWindow: "Zapri okno",
  fileUploaded: "Naloženo",
  alreadyUploaded: "Že v albumu",
  fileNetworkError: "Omrežna napaka",
  fileQueued: "V vrsti — naloži se, ko bo vzpostavljena internet",
  offlineBanner: "Ni interneta — fotografije so v vrsti in se bodo samodejno naložile, ko bo vzpostavljena povezava",
  limitReached: "Omejitev albuma je dosežena.",
  filesDropped: (n) => `${n} ${n === 1 ? "datoteka ni bila dodana" : "datotek ni bilo dodano"} — dosežena je omejitev albuma.`,
  footerCredit: "Guestcam",
  eventLabel: (type) => ({
    baby_shower: "Baby Shower",
    business: "Poslovni dogodek",
    wedding: "Poroka", birthday: "Rojstni dan", anniversary: "Obletnica",
    party: "Zabava", baptism: "Krst", graduation: "Matura",
  } as Record<string, string>)[type] ?? "Dogodek",
  live: "V živo",
  photoCount: (n) => `${n} foto`,
  videoCount: (n) => `${n} video`,
  filterAll: "Vse",
  filterAllShort: "Vse",
  filterPhotos: "Fotografije",
  filterPhotosShort: "Foto",
  filterVideos: "Videi",
  filterVideosShort: "Video",
  momentsAll: "Vse",
  momentsTitle: "Trenutki",
  momentsDesc: "Razdelite galerijo na imenovane sklope (npr. Priprave, Obred, Zabava).",
  momentNamePlaceholder: "npr. Obred",
  momentAdd: "Dodaj",
  momentRename: "Preimenuj",
  momentDelete: "Izbriši",
  momentDeleteConfirm: "Izbrišem ta trenutek? Fotografije ostanejo v galeriji.",
  momentEmpty: "Še ni trenutkov.",
  momentLabel: "Trenutek",
  momentNone: "Brez trenutka",
  slideshow: "Diaprojekcija",
  slideshowShort: "Diapozitivi",
  photoWall: "Foto zid",
  photoWallTitle: "Foto zid (projekcija)",
  highlightsFilm: "Highlights film",
  film: "Film",
  yourNamePlaceholder: "Vaše ime",
  next: "Naprej →",
  uploadShort: "Naloži",
  takePhoto: "Fotografiraj",
  uploadFromGallery: "Naloži iz galerije",
  galleryFull: "Galerija je polna",
  galleryFullDesc: "Lastnik mora nadgraditi paket za nadaljevanje.",
  everyone: "Vsi",
  photosFrom: "Fotografije od:",
  clear: "Počisti ✕",
  personNoVideos: (name) => `${name} nima videoposnetkov`,
  personNoPhotos: (name) => `${name} nima fotografij`,
  noVideos: "Ni videoposnetkov",
  noPhotos: "Ni fotografij",
  beFirstToShare: "Naredite prvi spomin",
  beFirstToShareHint: "Skenirajte QR kodo ali naložite s telefona — fotografije se prikažejo tukaj v trenutku.",
  videosSection: "Videi",
  photosSection: "Fotografije",
  sortLabel: "Razvrsti",
  sortNewest: "Najnovejše",
  sortOldest: "Najstarejše",
  sortMostLiked: "Največ všečkov",
  myUploads: "Moje naložene",
  myReactions: "Moji všečki",
  noMyUploads: "Še niste naložili ničesar.",
  noMyReactions: "Še niste všečkali nobene fotografije.",
  like: "Všečkaj",
  unlike: "Odstrani všeček",
  comments: "Komentarji",
  beFirstToComment: "Bodi prvi, ki komentira!",
  photoBy: "Foto:",
  enterNameToComment: "Vnesi ime za komentar:",
  enterNameToLike: "Najprej vnesi ime za všečkanje:",
  addComment: "Dodaj komentar…",
  ok: "OK",
  showInfo: "Všečki in komentarji",
  hideInfo: "Skrij",
  justNow: "Pravkar",
  minutesAgo: (n) => `${n} min`,
  todayAt: (time) => `Danes, ${time}`,
  yesterdayAt: (time) => `Včeraj, ${time}`,
  fullQuality: "Polna kakovost",
  maxImageSize: (mb) => `Do ${mb} MB`,
  maxVideoSize: (mb) => `Videi do ${mb} MB`,
  dropFiles: "Spusti datoteke",
  selectPhotosVideos: "Izberi fotografije in videe",
  fileTypesHint: (r) => `JPEG · PNG · HEIC · MP4 · MOV · do ${r} datotek`,
  optimizing: "Optimizira…",
  uploadingProgress: (c, total) => `Nalagam ${c} / ${total}`,
  saving: "Shranjujem…",
  doNotCloseWindow: "Ne zaprite okna in ne zamenjajte aplikacije med nalaganjem",
  genericError: "Napaka",
  remindMeLink: "📩 Opomni me, da naložim kasneje",
  reminderTitle: "Prejmi opomnik za nalaganje",
  reminderDesc: "Vnesite svoj e-naslov in poslali vam bomo opomnik za nalaganje fotografij.",
  reminderEmailPlaceholder: "vas@email.com",
  reminderWhenLabel: "Kdaj poslati",
  reminderWhenNow: "Pošlji zdaj",
  reminderWhen1h: "Čez 1 uro",
  reminderWhenTomorrow: "Jutri",
  reminderWhen3d: "Čez 3 dni",
  reminderSend: "Pošlji",
  reminderSending: "Pošiljanje…",
  reminderSuccess: "Opomnik je nastavljen! Preverite e-pošto.",
  reminderError: "Nekaj je šlo narobe. Poskusite znova.",
  reminderInvalidEmail: "Vnesite veljaven e-naslov.",
  saveLinkTitle: "Pošlji si povezavo na e-pošto",
  saveLinkDesc: "Vnesite e-naslov in pošljemo vam povezavo do albuma, da ga boste lahko našli kadarkoli.",
  saveLinkSend: "Pošlji",
  saveLinkSent: "Povezava poslana! Preverite e-pošto. ✓",
  discountCode: "Koda za popust",
  discountPlaceholder: "Vnesite kodo…",
  discountApply: "Uveljavi",
  discountRemove: "Odstrani",
  discountInvalid: "Koda ni veljavna ali je potekla.",
  discountOff: (n) => `−${n}% popust`,
};

const hr: Translations = {
  albumTitle: "Vjenčani album",
  by: "Guestcam",
  passwordProtected: "Ovaj album je zaštićen lozinkom.",
  passwordPlaceholder: "Lozinka",
  openAlbum: "Otvori album",
  wrongPassword: "Pogrešna lozinka.",
  photos: (n) => `${n} ${n === 1 ? "fotografija" : n < 5 ? "fotografije" : "fotografija"}`,
  daysUntil: (n) => `Još ${n} ${n === 1 ? "dan" : "dana"}`,
  daysSince: (n) => `Prije ${n} ${n === 1 ? "dan" : "dana"}`,
  today: "Danas je taj dan! 🎉",
  yourName: "Vaše ime:",
  namePlaceholder: "Ana Novak",
  confirm: "Potvrdi",
  change: "Promijeni",
  hello: (name) => `Zdravo, ${name}`,
  uploadPhotos: "Učitaj fotografije",
  noPhotosTitle: "Još nema fotografija",
  noPhotosDesc: "Budite prvi koji dijeli uspomenu.",
  uploadModalTitle: "Učitaj fotografije",
  dropzone: "Povuci ili klikni za odabir",
  dropzoneHint: (r) => `JPG, PNG, WEBP · max 20 MB · još ${r} dostupnih`,
  dropzoneActive: "Ispusti fotografije ovdje",
  filesDropped: (n) => `${n} ${n === 1 ? "datoteka nije dodana" : "datoteka nije dodano"} — dostignut je limit albuma.`,
  uploading: "Učitavanje…",
  uploadBtn: (n) => `Učitaj${n > 0 ? ` (${n})` : ""}`,
  cancel: "Otkaži",
  successTitle: (n) => `${n} ${n === 1 ? "fotografija učitana" : "fotografija učitano"}`,
  successDesc: "Hvala na uspomenama!",
  approvalNote: "📸 Vaše fotografije bit će vidljive u galeriji čim ih sustav obradi.",
  demoUploadNote: "👀 Ovo je demo album — vaše fotografije neće biti javno objavljene. Učitane su u testni album da vidite kako izgleda dijeljenje fotografija.",
  nameOnboardPrompt: "Unesite svoje ime da biste učitali svoje fotografije i videozapise.",
  close: "Zatvori",
  closeWindow: "Zatvori prozor",
  fileUploaded: "Učitano",
  alreadyUploaded: "Već u albumu",
  fileNetworkError: "Mrežna greška",
  fileQueued: "U redu — učitat će se kad bude interneta",
  offlineBanner: "Nema interneta — fotografije su u redu i automatski će se učitati kad se veza uspostavi",
  limitReached: "Dostignut limit fotografija.",
  footerCredit: "Guestcam",
  eventLabel: (type) => ({
    baby_shower: "Baby Shower",
    business: "Poslovni događaj",
    wedding: "Vjenčanje", birthday: "Rođendan", anniversary: "Godišnjica",
    party: "Zabava", baptism: "Krštenje", graduation: "Matura",
  } as Record<string, string>)[type] ?? "Događaj",
  live: "Uživo",
  photoCount: (n) => `${n} foto`,
  videoCount: (n) => `${n} video`,
  filterAll: "Sve",
  filterAllShort: "Sve",
  filterPhotos: "Fotografije",
  filterPhotosShort: "Foto",
  filterVideos: "Videi",
  filterVideosShort: "Video",
  momentsAll: "Sve",
  momentsTitle: "Trenuci",
  momentsDesc: "Podijelite galeriju na imenovane cjeline (npr. Pripreme, Ceremonija, Zabava).",
  momentNamePlaceholder: "npr. Ceremonija",
  momentAdd: "Dodaj",
  momentRename: "Preimenuj",
  momentDelete: "Izbriši",
  momentDeleteConfirm: "Izbrisati ovaj trenutak? Fotografije ostaju u galeriji.",
  momentEmpty: "Još nema trenutaka.",
  momentLabel: "Trenutak",
  momentNone: "Bez trenutka",
  slideshow: "Slideshow",
  slideshowShort: "Slajdovi",
  photoWall: "Foto zid",
  photoWallTitle: "Foto zid (projekcija)",
  highlightsFilm: "Highlights film",
  film: "Film",
  yourNamePlaceholder: "Vaše ime",
  next: "Dalje →",
  uploadShort: "Učitaj",
  takePhoto: "Fotografiraj",
  uploadFromGallery: "Učitaj iz galerije",
  galleryFull: "Galerija je puna",
  galleryFullDesc: "Vlasnik mora nadograditi paket za nastavak.",
  everyone: "Svi",
  photosFrom: "Fotografije od:",
  clear: "Očisti ✕",
  personNoVideos: (name) => `${name} nema videozapisa`,
  personNoPhotos: (name) => `${name} nema fotografija`,
  noVideos: "Nema videozapisa",
  noPhotos: "Nema fotografija",
  beFirstToShare: "Stvorite prvu uspomenu",
  beFirstToShareHint: "Skenirajte QR kod ili učitajte s telefona — fotografije se ovdje prikazuju odmah.",
  videosSection: "Videi",
  photosSection: "Fotografije",
  sortLabel: "Razvrstaj",
  sortNewest: "Najnovije",
  sortOldest: "Najstarije",
  sortMostLiked: "Najviše lajkova",
  myUploads: "Moje učitano",
  myReactions: "Moji lajkovi",
  noMyUploads: "Još niste ništa učitali.",
  noMyReactions: "Još niste lajkali nijednu fotografiju.",
  like: "Sviđa mi se",
  unlike: "Ukloni oznaku",
  comments: "Komentari",
  beFirstToComment: "Budi prvi koji komentira!",
  photoBy: "Foto:",
  enterNameToComment: "Unesi ime za komentar:",
  enterNameToLike: "Prvo unesi ime za sviđanje:",
  addComment: "Dodaj komentar…",
  ok: "U redu",
  showInfo: "Sviđanja i komentari",
  hideInfo: "Sakrij",
  justNow: "Upravo sada",
  minutesAgo: (n) => `${n} min`,
  todayAt: (time) => `Danas, ${time}`,
  yesterdayAt: (time) => `Jučer, ${time}`,
  fullQuality: "Puna kvaliteta",
  maxImageSize: (mb) => `Do ${mb} MB`,
  maxVideoSize: (mb) => `Videi do ${mb} MB`,
  dropFiles: "Ispusti datoteke",
  selectPhotosVideos: "Odaberi fotografije i videe",
  fileTypesHint: (r) => `JPEG · PNG · HEIC · MP4 · MOV · do ${r} datoteka`,
  optimizing: "Optimizacija…",
  uploadingProgress: (c, total) => `Učitavam ${c} / ${total}`,
  saving: "Spremam…",
  doNotCloseWindow: "Ne zatvarajte prozor i ne mijenjajte aplikaciju tijekom učitavanja",
  genericError: "Greška",
  remindMeLink: "📩 Podsjeti me da učitam kasnije",
  reminderTitle: "Primi podsjetnik za učitavanje",
  reminderDesc: "Unesite svoju e-poštu i poslat ćemo vam podsjetnik za učitavanje fotografija.",
  reminderEmailPlaceholder: "vas@email.com",
  reminderWhenLabel: "Kada poslati",
  reminderWhenNow: "Pošalji odmah",
  reminderWhen1h: "Za 1 sat",
  reminderWhenTomorrow: "Sutra",
  reminderWhen3d: "Za 3 dana",
  reminderSend: "Pošalji",
  reminderSending: "Slanje…",
  reminderSuccess: "Podsjetnik je postavljen! Provjerite e-poštu.",
  reminderError: "Nešto je pošlo po zlu. Pokušajte ponovno.",
  reminderInvalidEmail: "Unesite valjanu e-poštu.",
  saveLinkTitle: "Pošalji si vezu na e-poštu",
  saveLinkDesc: "Unesite e-poštu i poslat ćemo vam vezu do albuma da ga možete pronaći kad god zatreba.",
  saveLinkSend: "Pošalji",
  saveLinkSent: "Veza poslana! Provjerite e-poštu. ✓",
  discountCode: "Kod za popust",
  discountPlaceholder: "Unesite kod…",
  discountApply: "Primijeni",
  discountRemove: "Ukloni",
  discountInvalid: "Kod nije važeći ili je istekao.",
  discountOff: (n) => `−${n}% popust`,
};

const sr: Translations = {
  albumTitle: "Venčani album",
  by: "Guestcam",
  passwordProtected: "Ovaj album je zaštićen lozinkom.",
  passwordPlaceholder: "Lozinka",
  openAlbum: "Otvori album",
  wrongPassword: "Pogrešna lozinka.",
  photos: (n) => `${n} ${n === 1 ? "fotografija" : n < 5 ? "fotografije" : "fotografija"}`,
  daysUntil: (n) => `Još ${n} ${n === 1 ? "dan" : "dana"}`,
  daysSince: (n) => `Pre ${n} ${n === 1 ? "dan" : "dana"}`,
  today: "Danas je taj dan! 🎉",
  yourName: "Vaše ime:",
  namePlaceholder: "Ana Novak",
  confirm: "Potvrdi",
  change: "Promeni",
  hello: (name) => `Zdravo, ${name}`,
  uploadPhotos: "Otpremi fotografije",
  noPhotosTitle: "Još nema fotografija",
  noPhotosDesc: "Budite prvi koji deli uspomenu.",
  uploadModalTitle: "Otpremi fotografije",
  dropzone: "Prevuci ili klikni za izbor",
  dropzoneHint: (r) => `JPG, PNG, WEBP · max 20 MB · još ${r} dostupnih`,
  dropzoneActive: "Ispusti fotografije ovde",
  filesDropped: (n) => `${n} ${n === 1 ? "datoteka nije dodata" : "datoteka nije dodato"} — dostignut je limit albuma.`,
  uploading: "Otpremanje…",
  uploadBtn: (n) => `Otpremi${n > 0 ? ` (${n})` : ""}`,
  cancel: "Otkaži",
  successTitle: (n) => `${n} ${n === 1 ? "fotografija otpremljena" : "fotografija otpremljeno"}`,
  successDesc: "Hvala na uspomenama!",
  approvalNote: "📸 Vaše fotografije biće vidljive u galeriji čim ih sistem obradi.",
  demoUploadNote: "👀 Ovo je demo album — vaše fotografije neće biti javno objavljene. Otpremljene su u testni album da vidite kako izgleda deljenje fotografija.",
  nameOnboardPrompt: "Unesite svoje ime da biste otpremili svoje fotografije i video snimke.",
  close: "Zatvori",
  closeWindow: "Zatvori prozor",
  fileUploaded: "Otpremljeno",
  alreadyUploaded: "Već u albumu",
  fileNetworkError: "Mrežna greška",
  fileQueued: "U redu — otpremiće se kad bude interneta",
  offlineBanner: "Nema interneta — fotografije su u redu i automatski će se otpremiti kad se veza uspostavi",
  limitReached: "Dostignut limit fotografija.",
  footerCredit: "Guestcam",
  eventLabel: (type) => ({
    baby_shower: "Baby Shower",
    business: "Poslovni događaj",
    wedding: "Venčanje", birthday: "Rođendan", anniversary: "Godišnjica",
    party: "Zabava", baptism: "Krštenje", graduation: "Matura",
  } as Record<string, string>)[type] ?? "Događaj",
  live: "Uživo",
  photoCount: (n) => `${n} foto`,
  videoCount: (n) => `${n} video`,
  filterAll: "Sve",
  filterAllShort: "Sve",
  filterPhotos: "Fotografije",
  filterPhotosShort: "Foto",
  filterVideos: "Videi",
  filterVideosShort: "Video",
  momentsAll: "Sve",
  momentsTitle: "Trenuci",
  momentsDesc: "Podelite galeriju na imenovane celine (npr. Pripreme, Ceremonija, Zabava).",
  momentNamePlaceholder: "npr. Ceremonija",
  momentAdd: "Dodaj",
  momentRename: "Preimenuj",
  momentDelete: "Izbriši",
  momentDeleteConfirm: "Izbrisati ovaj trenutak? Fotografije ostaju u galeriji.",
  momentEmpty: "Još nema trenutaka.",
  momentLabel: "Trenutak",
  momentNone: "Bez trenutka",
  slideshow: "Slideshow",
  slideshowShort: "Slajdovi",
  photoWall: "Foto zid",
  photoWallTitle: "Foto zid (projekcija)",
  highlightsFilm: "Highlights film",
  film: "Film",
  yourNamePlaceholder: "Vaše ime",
  next: "Dalje →",
  uploadShort: "Otpremi",
  takePhoto: "Fotografiši",
  uploadFromGallery: "Otpremi iz galerije",
  galleryFull: "Galerija je puna",
  galleryFullDesc: "Vlasnik mora da nadogradi paket za nastavak.",
  everyone: "Svi",
  photosFrom: "Fotografije od:",
  clear: "Očisti ✕",
  personNoVideos: (name) => `${name} nema videozapisa`,
  personNoPhotos: (name) => `${name} nema fotografija`,
  noVideos: "Nema videozapisa",
  noPhotos: "Nema fotografija",
  beFirstToShare: "Napravite prvu uspomenu",
  beFirstToShareHint: "Skenirajte QR kod ili otpremite sa telefona — fotografije se ovde prikazuju odmah.",
  videosSection: "Videi",
  photosSection: "Fotografije",
  sortLabel: "Razvrstaj",
  sortNewest: "Najnovije",
  sortOldest: "Najstarije",
  sortMostLiked: "Najviše lajkova",
  myUploads: "Moje otpremljeno",
  myReactions: "Moji lajkovi",
  noMyUploads: "Još niste ništa otpremili.",
  noMyReactions: "Još niste lajkovali nijednu fotografiju.",
  like: "Sviđa mi se",
  unlike: "Ukloni oznaku",
  comments: "Komentari",
  beFirstToComment: "Budi prvi koji komentariše!",
  photoBy: "Foto:",
  enterNameToComment: "Unesi ime za komentar:",
  enterNameToLike: "Prvo unesi ime za sviđanje:",
  addComment: "Dodaj komentar…",
  ok: "U redu",
  showInfo: "Sviđanja i komentari",
  hideInfo: "Sakrij",
  justNow: "Upravo sada",
  minutesAgo: (n) => `${n} min`,
  todayAt: (time) => `Danas, ${time}`,
  yesterdayAt: (time) => `Juče, ${time}`,
  fullQuality: "Puni kvalitet",
  maxImageSize: (mb) => `Do ${mb} MB`,
  maxVideoSize: (mb) => `Videi do ${mb} MB`,
  dropFiles: "Ispusti datoteke",
  selectPhotosVideos: "Izaberi fotografije i videe",
  fileTypesHint: (r) => `JPEG · PNG · HEIC · MP4 · MOV · do ${r} datoteka`,
  optimizing: "Optimizacija…",
  uploadingProgress: (c, total) => `Otpremam ${c} / ${total}`,
  saving: "Čuvam…",
  doNotCloseWindow: "Ne zatvarajte prozor i ne menjajte aplikaciju tokom otpremanja",
  genericError: "Greška",
  remindMeLink: "📩 Podseti me da otpremim kasnije",
  reminderTitle: "Primi podsetnik za otpremanje",
  reminderDesc: "Unesite svoju e-poštu i poslaćemo vam podsetnik da otpremite fotografije.",
  reminderEmailPlaceholder: "vas@email.com",
  reminderWhenLabel: "Kada poslati",
  reminderWhenNow: "Pošalji odmah",
  reminderWhen1h: "Za 1 sat",
  reminderWhenTomorrow: "Sutra",
  reminderWhen3d: "Za 3 dana",
  reminderSend: "Pošalji",
  reminderSending: "Slanje…",
  reminderSuccess: "Podsetnik je postavljen! Proverite e-poštu.",
  reminderError: "Nešto je pošlo po zlu. Pokušajte ponovo.",
  reminderInvalidEmail: "Unesite ispravnu e-poštu.",
  saveLinkTitle: "Pošalji sebi vezu na e-poštu",
  saveLinkDesc: "Unesite e-poštu i poslaćemo vam vezu do albuma da ga možete pronaći kad god zatreba.",
  saveLinkSend: "Pošalji",
  saveLinkSent: "Veza poslana! Proverite e-poštu. ✓",
  discountCode: "Kod za popust",
  discountPlaceholder: "Unesite kod…",
  discountApply: "Primeni",
  discountRemove: "Ukloni",
  discountInvalid: "Kod nije važeći ili je istekao.",
  discountOff: (n) => `−${n}% popust`,
};

const en: Translations = {
  albumTitle: "Wedding Album",
  by: "Guestcam",
  passwordProtected: "This album is password protected.",
  passwordPlaceholder: "Password",
  openAlbum: "Open album",
  wrongPassword: "Wrong password.",
  photos: (n) => `${n} ${n === 1 ? "photo" : "photos"}`,
  daysUntil: (n) => `${n} ${n === 1 ? "day" : "days"} to go`,
  daysSince: (n) => `${n} ${n === 1 ? "day" : "days"} ago`,
  today: "Today is the day! 🎉",
  yourName: "Your name:",
  namePlaceholder: "Ana Novak",
  confirm: "Confirm",
  change: "Change",
  hello: (name) => `Hello, ${name}`,
  uploadPhotos: "Upload photos",
  noPhotosTitle: "No photos yet",
  noPhotosDesc: "Be the first to share a memory.",
  uploadModalTitle: "Upload photos",
  dropzone: "Drag or click to select",
  dropzoneHint: (r) => `JPG, PNG, WEBP · max 20 MB · ${r} remaining`,
  dropzoneActive: "Drop photos here",
  uploading: "Uploading…",
  uploadBtn: (n) => `Upload${n > 0 ? ` (${n})` : ""}`,
  cancel: "Cancel",
  successTitle: (n) => `${n} ${n === 1 ? "photo uploaded" : "photos uploaded"}`,
  successDesc: "Thank you for your memories!",
  approvalNote: "📸 Your photos appear in the gallery as soon as they're processed.",
  demoUploadNote: "👀 This is a demo album — your photos won't be published publicly. They're uploaded to the test album so you can see how photo sharing works.",
  nameOnboardPrompt: "Enter your name to upload your photos and videos.",
  close: "Close",
  closeWindow: "Close window",
  fileUploaded: "Uploaded",
  alreadyUploaded: "Already in album",
  fileNetworkError: "Network error",
  fileQueued: "Queued — will upload when back online",
  offlineBanner: "No internet — photos are queued and will upload automatically when your connection returns",
  limitReached: "Album photo limit reached.",
  filesDropped: (n) => `${n} ${n === 1 ? "file" : "files"} not added — album limit reached.`,
  footerCredit: "Guestcam",
  eventLabel: (type) => ({
    baby_shower: "Baby Shower",
    business: "Business event",
    wedding: "Wedding", birthday: "Birthday", anniversary: "Anniversary",
    party: "Party", baptism: "Baptism", graduation: "Graduation",
  } as Record<string, string>)[type] ?? "Event",
  live: "Live",
  photoCount: (n) => `${n} ${n === 1 ? "photo" : "photos"}`,
  videoCount: (n) => `${n} ${n === 1 ? "video" : "videos"}`,
  filterAll: "All",
  filterAllShort: "All",
  filterPhotos: "Photos",
  filterPhotosShort: "Photos",
  filterVideos: "Videos",
  filterVideosShort: "Videos",
  momentsAll: "All",
  momentsTitle: "Moments",
  momentsDesc: "Split the gallery into named sections (e.g. Getting Ready, Ceremony, Reception).",
  momentNamePlaceholder: "e.g. Ceremony",
  momentAdd: "Add",
  momentRename: "Rename",
  momentDelete: "Delete",
  momentDeleteConfirm: "Delete this moment? Photos stay in the gallery.",
  momentEmpty: "No moments yet.",
  momentLabel: "Moment",
  momentNone: "No moment",
  slideshow: "Slideshow",
  slideshowShort: "Slides",
  photoWall: "Photo wall",
  photoWallTitle: "Photo wall (projection)",
  highlightsFilm: "Highlights film",
  film: "Film",
  yourNamePlaceholder: "Your name",
  next: "Next →",
  uploadShort: "Upload",
  takePhoto: "Take photo",
  uploadFromGallery: "Upload from gallery",
  galleryFull: "Gallery is full",
  galleryFullDesc: "The host must upgrade the plan to continue.",
  everyone: "Everyone",
  photosFrom: "Photos from:",
  clear: "Clear ✕",
  personNoVideos: (name) => `${name} has no videos`,
  personNoPhotos: (name) => `${name} has no photos`,
  noVideos: "No videos",
  noPhotos: "No photos",
  beFirstToShare: "Create the first memory",
  beFirstToShareHint: "Scan the QR code or upload from your phone — your photos appear here instantly.",
  videosSection: "Videos",
  photosSection: "Photos",
  sortLabel: "Sort",
  sortNewest: "Newest first",
  sortOldest: "Oldest first",
  sortMostLiked: "Most liked",
  myUploads: "My uploads",
  myReactions: "My reactions",
  noMyUploads: "You haven't uploaded anything yet.",
  noMyReactions: "You haven't liked any photos yet.",
  like: "Like",
  unlike: "Remove like",
  comments: "Comments",
  beFirstToComment: "Be the first to comment!",
  photoBy: "Photo:",
  enterNameToComment: "Enter your name to comment:",
  enterNameToLike: "Enter your name first to like photos:",
  addComment: "Add a comment…",
  ok: "OK",
  showInfo: "Likes & comments",
  hideInfo: "Hide",
  justNow: "Just now",
  minutesAgo: (n) => `${n} min`,
  todayAt: (time) => `Today, ${time}`,
  yesterdayAt: (time) => `Yesterday, ${time}`,
  fullQuality: "Full quality",
  maxImageSize: (mb) => `Up to ${mb} MB`,
  maxVideoSize: (mb) => `Videos up to ${mb} MB`,
  dropFiles: "Drop files",
  selectPhotosVideos: "Select photos and videos",
  fileTypesHint: (r) => `JPEG · PNG · HEIC · MP4 · MOV · up to ${r} files`,
  optimizing: "Optimizing…",
  uploadingProgress: (c, total) => `Uploading ${c} / ${total}`,
  saving: "Saving…",
  doNotCloseWindow: "Do not close the window or switch apps during upload",
  genericError: "Error",
  remindMeLink: "📩 Remind me to upload later",
  reminderTitle: "Get an upload reminder",
  reminderDesc: "Enter your email and we'll remind you to upload your photos.",
  reminderEmailPlaceholder: "your@email.com",
  reminderWhenLabel: "When to send",
  reminderWhenNow: "Send now",
  reminderWhen1h: "In 1 hour",
  reminderWhenTomorrow: "Tomorrow",
  reminderWhen3d: "In 3 days",
  reminderSend: "Send",
  reminderSending: "Sending…",
  reminderSuccess: "Reminder set! Check your inbox.",
  reminderError: "Something went wrong. Please try again.",
  reminderInvalidEmail: "Please enter a valid email address.",
  saveLinkTitle: "Send this link to your email",
  saveLinkDesc: "Enter your email and we'll send you the album link so you can find it anytime — no QR code needed.",
  saveLinkSend: "Send",
  saveLinkSent: "Link sent! Check your inbox. ✓",
  discountCode: "Discount code",
  discountPlaceholder: "Enter code…",
  discountApply: "Apply",
  discountRemove: "Remove",
  discountInvalid: "Code is invalid or has expired.",
  discountOff: (n) => `−${n}% off`,
};

const de: Translations = {
  albumTitle: "Hochzeitsalbum",
  by: "Guestcam",
  passwordProtected: "Dieses Album ist passwortgeschützt.",
  passwordPlaceholder: "Passwort",
  openAlbum: "Album öffnen",
  wrongPassword: "Falsches Passwort.",
  photos: (n) => `${n} ${n === 1 ? "Foto" : "Fotos"}`,
  daysUntil: (n) => `Noch ${n} ${n === 1 ? "Tag" : "Tage"}`,
  daysSince: (n) => `Vor ${n} ${n === 1 ? "Tag" : "Tagen"}`,
  today: "Heute ist es so weit! 🎉",
  yourName: "Ihr Name:",
  namePlaceholder: "Ana Novak",
  confirm: "Bestätigen",
  change: "Ändern",
  hello: (name) => `Hallo, ${name}`,
  uploadPhotos: "Fotos hochladen",
  noPhotosTitle: "Noch keine Fotos",
  noPhotosDesc: "Teilen Sie als Erster eine Erinnerung.",
  uploadModalTitle: "Fotos hochladen",
  dropzone: "Ziehen oder klicken zur Auswahl",
  dropzoneHint: (r) => `JPG, PNG, WEBP · max 20 MB · noch ${r} möglich`,
  dropzoneActive: "Fotos hier ablegen",
  uploading: "Hochladen…",
  uploadBtn: (n) => `Hochladen${n > 0 ? ` (${n})` : ""}`,
  cancel: "Abbrechen",
  successTitle: (n) => `${n} ${n === 1 ? "Foto hochgeladen" : "Fotos hochgeladen"}`,
  successDesc: "Vielen Dank für Ihre Erinnerungen!",
  approvalNote: "📸 Ihre Fotos erscheinen in der Galerie, sobald sie verarbeitet sind.",
  demoUploadNote: "👀 Dies ist ein Demo-Album — Ihre Fotos werden nicht öffentlich veröffentlicht. Sie werden ins Testalbum hochgeladen, damit Sie sehen, wie das Teilen von Fotos funktioniert.",
  nameOnboardPrompt: "Geben Sie Ihren Namen ein, um Ihre Fotos und Videos hochzuladen.",
  close: "Schließen",
  closeWindow: "Fenster schließen",
  fileUploaded: "Hochgeladen",
  alreadyUploaded: "Bereits im Album",
  fileNetworkError: "Netzwerkfehler",
  fileQueued: "In der Warteschlange — wird hochgeladen, sobald Internet verfügbar",
  offlineBanner: "Kein Internet — Fotos sind in der Warteschlange und werden automatisch hochgeladen, sobald die Verbindung wiederhergestellt ist",
  limitReached: "Foto-Limit des Albums erreicht.",
  filesDropped: (n) => `${n} ${n === 1 ? "Datei nicht hinzugefügt" : "Dateien nicht hinzugefügt"} — Album-Limit erreicht.`,
  footerCredit: "Guestcam",
  eventLabel: (type) => ({
    baby_shower: "Baby Shower",
    business: "Firmenevent",
    wedding: "Hochzeit", birthday: "Geburtstag", anniversary: "Jubiläum",
    party: "Party", baptism: "Taufe", graduation: "Abschluss",
  } as Record<string, string>)[type] ?? "Veranstaltung",
  live: "Live",
  photoCount: (n) => `${n} ${n === 1 ? "Foto" : "Fotos"}`,
  videoCount: (n) => `${n} ${n === 1 ? "Video" : "Videos"}`,
  filterAll: "Alle",
  filterAllShort: "Alle",
  filterPhotos: "Fotos",
  filterPhotosShort: "Fotos",
  filterVideos: "Videos",
  filterVideosShort: "Videos",
  momentsAll: "Alle",
  momentsTitle: "Momente",
  momentsDesc: "Teilen Sie die Galerie in benannte Abschnitte auf (z. B. Vorbereitung, Zeremonie, Feier).",
  momentNamePlaceholder: "z. B. Zeremonie",
  momentAdd: "Hinzufügen",
  momentRename: "Umbenennen",
  momentDelete: "Löschen",
  momentDeleteConfirm: "Diesen Moment löschen? Die Fotos bleiben in der Galerie.",
  momentEmpty: "Noch keine Momente.",
  momentLabel: "Moment",
  momentNone: "Kein Moment",
  slideshow: "Diashow",
  slideshowShort: "Dias",
  photoWall: "Fotowand",
  photoWallTitle: "Fotowand (Projektion)",
  highlightsFilm: "Highlights-Film",
  film: "Film",
  yourNamePlaceholder: "Ihr Name",
  next: "Weiter →",
  uploadShort: "Hochladen",
  takePhoto: "Foto aufnehmen",
  uploadFromGallery: "Aus Galerie hochladen",
  galleryFull: "Galerie ist voll",
  galleryFullDesc: "Der Gastgeber muss das Paket aktualisieren, um fortzufahren.",
  everyone: "Alle",
  photosFrom: "Fotos von:",
  clear: "Löschen ✕",
  personNoVideos: (name) => `${name} hat keine Videos`,
  personNoPhotos: (name) => `${name} hat keine Fotos`,
  noVideos: "Keine Videos",
  noPhotos: "Keine Fotos",
  beFirstToShare: "Schaffen Sie die erste Erinnerung",
  beFirstToShareHint: "Scannen Sie den QR-Code oder laden Sie vom Handy hoch — Ihre Fotos erscheinen sofort hier.",
  videosSection: "Videos",
  photosSection: "Fotos",
  sortLabel: "Sortieren",
  sortNewest: "Neueste zuerst",
  sortOldest: "Älteste zuerst",
  sortMostLiked: "Beliebteste",
  myUploads: "Meine Uploads",
  myReactions: "Meine Reaktionen",
  noMyUploads: "Sie haben noch nichts hochgeladen.",
  noMyReactions: "Sie haben noch keine Fotos mit „Gefällt mir“ markiert.",
  like: "Gefällt mir",
  unlike: "Gefällt mir entfernen",
  comments: "Kommentare",
  beFirstToComment: "Kommentieren Sie als Erster!",
  photoBy: "Foto:",
  enterNameToComment: "Namen eingeben zum Kommentieren:",
  enterNameToLike: "Erst Namen eingeben, um zu liken:",
  addComment: "Kommentar hinzufügen…",
  ok: "OK",
  showInfo: "Likes & Kommentare",
  hideInfo: "Ausblenden",
  justNow: "Gerade eben",
  minutesAgo: (n) => `${n} Min`,
  todayAt: (time) => `Heute, ${time}`,
  yesterdayAt: (time) => `Gestern, ${time}`,
  fullQuality: "Volle Qualität",
  maxImageSize: (mb) => `Bis zu ${mb} MB`,
  maxVideoSize: (mb) => `Videos bis zu ${mb} MB`,
  dropFiles: "Dateien ablegen",
  selectPhotosVideos: "Fotos und Videos auswählen",
  fileTypesHint: (r) => `JPEG · PNG · HEIC · MP4 · MOV · bis zu ${r} Dateien`,
  optimizing: "Optimieren…",
  uploadingProgress: (c, total) => `Lade ${c} / ${total}`,
  saving: "Speichern…",
  doNotCloseWindow: "Schließen Sie das Fenster nicht und wechseln Sie nicht die App während des Hochladens",
  genericError: "Fehler",
  remindMeLink: "📩 Erinnere mich später ans Hochladen",
  reminderTitle: "Hochlade-Erinnerung erhalten",
  reminderDesc: "Geben Sie Ihre E-Mail-Adresse ein und wir erinnern Sie ans Hochladen Ihrer Fotos.",
  reminderEmailPlaceholder: "ihre@email.com",
  reminderWhenLabel: "Wann senden",
  reminderWhenNow: "Jetzt senden",
  reminderWhen1h: "In 1 Stunde",
  reminderWhenTomorrow: "Morgen",
  reminderWhen3d: "In 3 Tagen",
  reminderSend: "Senden",
  reminderSending: "Senden…",
  reminderSuccess: "Erinnerung eingerichtet! Prüfen Sie Ihren Posteingang.",
  reminderError: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
  reminderInvalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
  saveLinkTitle: "Link per E-Mail senden",
  saveLinkDesc: "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen den Link zum Album — auch ohne QR-Code auffindbar.",
  saveLinkSend: "Senden",
  saveLinkSent: "Link gesendet! Bitte prüfen Sie Ihren Posteingang. ✓",
  discountCode: "Rabattcode",
  discountPlaceholder: "Code eingeben…",
  discountApply: "Einlösen",
  discountRemove: "Entfernen",
  discountInvalid: "Code ist ungültig oder abgelaufen.",
  discountOff: (n) => `−${n}% Rabatt`,
};

const es: Translations = {
  albumTitle: "Álbum de boda",
  by: "Guestcam",
  passwordProtected: "Este álbum está protegido con contraseña.",
  passwordPlaceholder: "Contraseña",
  openAlbum: "Abrir álbum",
  wrongPassword: "Contraseña incorrecta.",
  photos: (n) => `${n} ${n === 1 ? "foto" : "fotos"}`,
  daysUntil: (n) => `${n} ${n === 1 ? "día" : "días"} restantes`,
  daysSince: (n) => `Hace ${n} ${n === 1 ? "día" : "días"}`,
  today: "¡Hoy es el día! 🎉",
  yourName: "Tu nombre:",
  namePlaceholder: "Ana Novak",
  confirm: "Confirmar",
  change: "Cambiar",
  hello: (name) => `Hola, ${name}`,
  uploadPhotos: "Subir fotos",
  noPhotosTitle: "Aún no hay fotos",
  noPhotosDesc: "Sé el primero en compartir un recuerdo.",
  uploadModalTitle: "Subir fotos",
  dropzone: "Arrastra o haz clic para seleccionar",
  dropzoneHint: (r) => `JPG, PNG, WEBP · máx 20 MB · ${r} restantes`,
  dropzoneActive: "Suelta las fotos aquí",
  uploading: "Subiendo…",
  uploadBtn: (n) => `Subir${n > 0 ? ` (${n})` : ""}`,
  cancel: "Cancelar",
  successTitle: (n) => `${n} ${n === 1 ? "foto subida" : "fotos subidas"}`,
  successDesc: "¡Gracias por tus recuerdos!",
  approvalNote: "📸 Tus fotos aparecen en la galería en cuanto se procesan.",
  demoUploadNote: "👀 Este es un álbum de demostración — tus fotos no se publicarán públicamente. Se suben al álbum de prueba para que veas cómo funciona compartir fotos.",
  nameOnboardPrompt: "Introduce tu nombre para subir tus fotos y vídeos.",
  close: "Cerrar",
  closeWindow: "Cerrar ventana",
  fileUploaded: "Subido",
  alreadyUploaded: "Ya en el álbum",
  fileNetworkError: "Error de red",
  fileQueued: "En cola — se subirá cuando haya internet",
  offlineBanner: "Sin internet — las fotos están en cola y se subirán automáticamente cuando vuelva la conexión",
  limitReached: "Límite de fotos del álbum alcanzado.",
  filesDropped: (n) => `${n} ${n === 1 ? "archivo no añadido" : "archivos no añadidos"} — límite del álbum alcanzado.`,
  footerCredit: "Guestcam",
  eventLabel: (type) => ({
    baby_shower: "Baby Shower",
    business: "Evento de empresa",
    wedding: "Boda", birthday: "Cumpleaños", anniversary: "Aniversario",
    party: "Fiesta", baptism: "Bautizo", graduation: "Graduación",
  } as Record<string, string>)[type] ?? "Evento",
  live: "En vivo",
  photoCount: (n) => `${n} ${n === 1 ? "foto" : "fotos"}`,
  videoCount: (n) => `${n} ${n === 1 ? "vídeo" : "vídeos"}`,
  filterAll: "Todo",
  filterAllShort: "Todo",
  filterPhotos: "Fotos",
  filterPhotosShort: "Fotos",
  filterVideos: "Vídeos",
  filterVideosShort: "Vídeos",
  momentsAll: "Todo",
  momentsTitle: "Momentos",
  momentsDesc: "Divide la galería en secciones con nombre (p. ej. Preparativos, Ceremonia, Fiesta).",
  momentNamePlaceholder: "p. ej. Ceremonia",
  momentAdd: "Añadir",
  momentRename: "Renombrar",
  momentDelete: "Eliminar",
  momentDeleteConfirm: "¿Eliminar este momento? Las fotos permanecen en la galería.",
  momentEmpty: "Aún no hay momentos.",
  momentLabel: "Momento",
  momentNone: "Sin momento",
  slideshow: "Pase de diapositivas",
  slideshowShort: "Diapositivas",
  photoWall: "Muro de fotos",
  photoWallTitle: "Muro de fotos (proyección)",
  highlightsFilm: "Highlights film",
  film: "Film",
  yourNamePlaceholder: "Tu nombre",
  next: "Siguiente →",
  uploadShort: "Subir",
  takePhoto: "Tomar foto",
  uploadFromGallery: "Subir desde galería",
  galleryFull: "La galería está llena",
  galleryFullDesc: "El anfitrión debe mejorar el plan para continuar.",
  everyone: "Todos",
  photosFrom: "Fotos de:",
  clear: "Limpiar ✕",
  personNoVideos: (name) => `${name} no tiene vídeos`,
  personNoPhotos: (name) => `${name} no tiene fotos`,
  noVideos: "No hay vídeos",
  noPhotos: "No hay fotos",
  beFirstToShare: "Crea el primer recuerdo",
  beFirstToShareHint: "Escanea el código QR o sube desde tu teléfono — tus fotos aparecen aquí al instante.",
  videosSection: "Vídeos",
  photosSection: "Fotos",
  sortLabel: "Ordenar",
  sortNewest: "Más recientes",
  sortOldest: "Más antiguas",
  sortMostLiked: "Más gustadas",
  myUploads: "Mis subidas",
  myReactions: "Mis reacciones",
  noMyUploads: "Aún no has subido nada.",
  noMyReactions: "Aún no has dado me gusta a ninguna foto.",
  like: "Me gusta",
  unlike: "Quitar me gusta",
  comments: "Comentarios",
  beFirstToComment: "¡Sé el primero en comentar!",
  photoBy: "Foto:",
  enterNameToComment: "Introduce tu nombre para comentar:",
  enterNameToLike: "Introduce tu nombre para dar me gusta:",
  addComment: "Añadir un comentario…",
  ok: "OK",
  showInfo: "Me gusta y comentarios",
  hideInfo: "Ocultar",
  justNow: "Ahora mismo",
  minutesAgo: (n) => `${n} min`,
  todayAt: (time) => `Hoy, ${time}`,
  yesterdayAt: (time) => `Ayer, ${time}`,
  fullQuality: "Calidad completa",
  maxImageSize: (mb) => `Hasta ${mb} MB`,
  maxVideoSize: (mb) => `Vídeos hasta ${mb} MB`,
  dropFiles: "Suelta los archivos",
  selectPhotosVideos: "Selecciona fotos y vídeos",
  fileTypesHint: (r) => `JPEG · PNG · HEIC · MP4 · MOV · hasta ${r} archivos`,
  optimizing: "Optimizando…",
  uploadingProgress: (c, total) => `Subiendo ${c} / ${total}`,
  saving: "Guardando…",
  doNotCloseWindow: "No cierres la ventana ni cambies de aplicación durante la subida",
  genericError: "Error",
  remindMeLink: "📩 Recuérdame subir más tarde",
  reminderTitle: "Recibe un recordatorio de subida",
  reminderDesc: "Introduce tu correo y te recordaremos que subas tus fotos.",
  reminderEmailPlaceholder: "tu@email.com",
  reminderWhenLabel: "Cuándo enviar",
  reminderWhenNow: "Enviar ahora",
  reminderWhen1h: "En 1 hora",
  reminderWhenTomorrow: "Mañana",
  reminderWhen3d: "En 3 días",
  reminderSend: "Enviar",
  reminderSending: "Enviando…",
  reminderSuccess: "¡Recordatorio configurado! Revisa tu bandeja de entrada.",
  reminderError: "Algo salió mal. Inténtalo de nuevo.",
  reminderInvalidEmail: "Introduce una dirección de correo válida.",
  saveLinkTitle: "Envíate el enlace por email",
  saveLinkDesc: "Introduce tu email y te enviamos el enlace al álbum para que puedas encontrarlo cuando quieras, sin necesitar el QR.",
  saveLinkSend: "Enviar",
  saveLinkSent: "¡Enlace enviado! Revisa tu bandeja de entrada. ✓",
  discountCode: "Código de descuento",
  discountPlaceholder: "Introduce el código…",
  discountApply: "Aplicar",
  discountRemove: "Quitar",
  discountInvalid: "El código no es válido o ha caducado.",
  discountOff: (n) => `−${n}% descuento`,
};

export const translations: Record<Lang, Translations> = { sl, hr, sr, en, de, es };

// ─── Helper: detect lang from Accept-Language header ─────────────────────────

export function detectLang(acceptLanguage?: string | null): Lang {
  if (!acceptLanguage) return "sl";
  const preferred = acceptLanguage.split(",")[0].trim().split("-")[0].toLowerCase();
  const map: Record<string, Lang> = {
    sl: "sl", hr: "hr", sr: "sr", bs: "hr",
    en: "en", de: "de", es: "es",
  };
  return map[preferred] ?? "sl";
}
