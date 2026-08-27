import type { Lang } from "@/lib/i18n/translations";

export type EventAppearanceAdminCopy = {
  title: string;
  saving: string;
  intro: string;
  eventLink: string;
  eventLinkSuffix: string;
  defaultLanguage: string;
  defaultLanguageDesc: string;
  albumHeader: string;
  albumHeaderDesc: string;
  showEventName: string;
  showEventNameDesc: string;
  showLocation: string;
  showLocationDesc: string;
  logoTitle: string;
  logoDesc: string;
  uploadLogo: string;
  replace: string;
  remove: string;
  brandColor: string;
  brandColorDesc: string;
  reset: string;
  backgroundTitle: string;
  backgroundDesc: string;
  uploadBackground: string;
  welcomeTitle: string;
  welcomeDesc: string;
  welcomeTextPlaceholder: string;
  next: string;
  welcomeBackground: string;
  preview: string;
  namePlaceholder: string;
  fontElegant: string;
  fontModern: string;
  fontScript: string;
  fontClassic: string;
  tooLarge: (max: number) => string;
  tooLargeOptimized: string;
  unsupportedType: string;
  uploadFailed: string;
  connectionUploadFailed: string;
  deleteFailed: string;
  connectionDeleteFailed: string;
};

const sl: EventAppearanceAdminCopy = {
  title: "🎨 Videz in pozdravni zaslon",
  saving: "Shranjujem…",
  intro: "Nastavitve blagovne znamke veljajo za Event / Photo Wall povezavo in Foto zid. Običajna galerija ostane standardna.",
  eventLink: "Event povezava:",
  eventLinkSuffix: "Tu lahko vsak element kadarkoli dodate, zamenjate ali odstranite.",
  defaultLanguage: "Privzeti jezik dogodka",
  defaultLanguageDesc: "Ta jezik se gostom odpre prvi. Uporabnik ga lahko kasneje v galeriji spremeni.",
  albumHeader: "Glava običajne galerije",
  albumHeaderDesc: "Izberite, kateri podatki so vidni v zgornjem delu običajnega album linka.",
  showEventName: "Prikaži ime dogodka",
  showEventNameDesc: "Prikaže ime para ali naziv dogodka v glavi albuma.",
  showLocation: "Prikaži lokacijo",
  showLocationDesc: "Prikaže lokacijo dogodka ob datumu v glavi albuma.",
  logoTitle: "Logotip eventa",
  logoDesc: "Poljubno razmerje — širok ali kvadraten. Prikazan na Event povezavi in Foto zidu.",
  uploadLogo: "Naloži logotip",
  replace: "Zamenjaj",
  remove: "Odstrani",
  brandColor: "Barva blagovne znamke",
  brandColorDesc: "Uporabljena za gumbe in poudarke na Event / Photo Wall površinah.",
  reset: "Ponastavi",
  backgroundTitle: "Ozadje event galerije",
  backgroundDesc: "Slika v ozadju samo na Event povezavi; običajna galerija ostane svetla.",
  uploadBackground: "Naloži ozadje",
  welcomeTitle: "Pozdravni zaslon",
  welcomeDesc: "Prikaže se samo na Event povezavi, ob gostovem prvem obisku.",
  welcomeTextPlaceholder: "Delite svoje fotografije z nami!",
  next: "Naprej",
  welcomeBackground: "Ozadje pozdravnega zaslona",
  preview: "Predogled",
  namePlaceholder: "Ime …",
  fontElegant: "Elegantna (serif)",
  fontModern: "Moderna (sans)",
  fontScript: "Pisana",
  fontClassic: "Klasična",
  tooLarge: (max) => `Slika je prevelika (največ ${max} MB). Izberite manjšo datoteko.`,
  tooLargeOptimized: "Slika je tudi po optimizaciji prevelika (največ 10 MB).",
  unsupportedType: "Ta vrsta datoteke ni podprta. Uporabite JPG, PNG ali WebP.",
  uploadFailed: "Nalaganje ni uspelo. Poskusite znova.",
  connectionUploadFailed: "Nalaganje ni uspelo. Preverite povezavo in poskusite znova.",
  deleteFailed: "Brisanje ni uspelo. Poskusite znova.",
  connectionDeleteFailed: "Brisanje ni uspelo. Preverite povezavo in poskusite znova.",
};

const en: EventAppearanceAdminCopy = {
  title: "🎨 Appearance & welcome screen",
  saving: "Saving…",
  intro: "Branding settings apply to the Event / Photo Wall link and Photo Wall. The regular gallery keeps its standard design.",
  eventLink: "Event link:",
  eventLinkSuffix: "You can add, replace or remove every element at any time.",
  defaultLanguage: "Default event language",
  defaultLanguageDesc: "This is the language guests see first. They can still switch language inside the gallery.",
  albumHeader: "Regular gallery header",
  albumHeaderDesc: "Choose which event details are visible at the top of the regular album link.",
  showEventName: "Show event name",
  showEventNameDesc: "Shows the couple name or event title in the album header.",
  showLocation: "Show location",
  showLocationDesc: "Shows the event location next to the date in the album header.",
  logoTitle: "Event logo",
  logoDesc: "Any aspect ratio — wide or square. Shown on the Event link and Photo Wall.",
  uploadLogo: "Upload logo",
  replace: "Replace",
  remove: "Remove",
  brandColor: "Brand color",
  brandColorDesc: "Used for buttons and highlights on Event / Photo Wall surfaces.",
  reset: "Reset",
  backgroundTitle: "Event gallery background",
  backgroundDesc: "Background image for the Event link only; the regular gallery stays clean and light.",
  uploadBackground: "Upload background",
  welcomeTitle: "Welcome screen",
  welcomeDesc: "Shown only on the Event link on a guest's first visit.",
  welcomeTextPlaceholder: "Share your photos with us!",
  next: "Continue",
  welcomeBackground: "Welcome screen background",
  preview: "Preview",
  namePlaceholder: "Name …",
  fontElegant: "Elegant (serif)",
  fontModern: "Modern (sans)",
  fontScript: "Script",
  fontClassic: "Classic",
  tooLarge: (max) => `Image is too large (maximum ${max} MB). Choose a smaller file.`,
  tooLargeOptimized: "The image is still too large after optimization (maximum 10 MB).",
  unsupportedType: "This file type is not supported. Use JPG, PNG or WebP.",
  uploadFailed: "Upload failed. Please try again.",
  connectionUploadFailed: "Upload failed. Check your connection and try again.",
  deleteFailed: "Removal failed. Please try again.",
  connectionDeleteFailed: "Removal failed. Check your connection and try again.",
};

const de: EventAppearanceAdminCopy = {
  title: "🎨 Design & Begrüßungsbildschirm",
  saving: "Speichern…",
  intro: "Branding-Einstellungen gelten für den Event-/Photo-Wall-Link und die Fotowand. Die normale Galerie behält ihr Standarddesign.",
  eventLink: "Event-Link:",
  eventLinkSuffix: "Jedes Element kann jederzeit hinzugefügt, ersetzt oder entfernt werden.",
  defaultLanguage: "Standardsprache des Events",
  defaultLanguageDesc: "Diese Sprache sehen Gäste zuerst. In der Galerie können sie die Sprache weiterhin wechseln.",
  albumHeader: "Kopfbereich der normalen Galerie",
  albumHeaderDesc: "Wählen Sie, welche Eventdaten oben im normalen Album-Link angezeigt werden.",
  showEventName: "Eventname anzeigen",
  showEventNameDesc: "Zeigt den Namen des Paares oder den Eventtitel im Albumkopf.",
  showLocation: "Ort anzeigen",
  showLocationDesc: "Zeigt den Veranstaltungsort neben dem Datum im Albumkopf.",
  logoTitle: "Event-Logo",
  logoDesc: "Beliebiges Seitenverhältnis — breit oder quadratisch. Wird im Event-Link und auf der Fotowand angezeigt.",
  uploadLogo: "Logo hochladen",
  replace: "Ersetzen",
  remove: "Entfernen",
  brandColor: "Markenfarbe",
  brandColorDesc: "Wird für Schaltflächen und Hervorhebungen auf Event-/Photo-Wall-Flächen verwendet.",
  reset: "Zurücksetzen",
  backgroundTitle: "Hintergrund der Event-Galerie",
  backgroundDesc: "Hintergrundbild nur für den Event-Link; die normale Galerie bleibt hell.",
  uploadBackground: "Hintergrund hochladen",
  welcomeTitle: "Begrüßungsbildschirm",
  welcomeDesc: "Wird nur beim ersten Besuch eines Gastes über den Event-Link angezeigt.",
  welcomeTextPlaceholder: "Teilt eure Fotos mit uns!",
  next: "Weiter",
  welcomeBackground: "Hintergrund des Begrüßungsbildschirms",
  preview: "Vorschau",
  namePlaceholder: "Name …",
  fontElegant: "Elegant (Serif)",
  fontModern: "Modern (Sans)",
  fontScript: "Handschrift",
  fontClassic: "Klassisch",
  tooLarge: (max) => `Das Bild ist zu groß (maximal ${max} MB). Wählen Sie eine kleinere Datei.`,
  tooLargeOptimized: "Das Bild ist auch nach der Optimierung zu groß (maximal 10 MB).",
  unsupportedType: "Dieser Dateityp wird nicht unterstützt. Verwenden Sie JPG, PNG oder WebP.",
  uploadFailed: "Upload fehlgeschlagen. Bitte erneut versuchen.",
  connectionUploadFailed: "Upload fehlgeschlagen. Verbindung prüfen und erneut versuchen.",
  deleteFailed: "Entfernen fehlgeschlagen. Bitte erneut versuchen.",
  connectionDeleteFailed: "Entfernen fehlgeschlagen. Verbindung prüfen und erneut versuchen.",
};

const es: EventAppearanceAdminCopy = {
  title: "🎨 Apariencia y pantalla de bienvenida",
  saving: "Guardando…",
  intro: "La configuración de marca se aplica al enlace Event / Photo Wall y al Foto Wall. La galería normal mantiene su diseño estándar.",
  eventLink: "Enlace del evento:",
  eventLinkSuffix: "Puedes añadir, sustituir o eliminar cualquier elemento en cualquier momento.",
  defaultLanguage: "Idioma predeterminado del evento",
  defaultLanguageDesc: "Es el idioma que los invitados ven primero. Después pueden cambiarlo dentro de la galería.",
  albumHeader: "Cabecera de la galería normal",
  albumHeaderDesc: "Elige qué datos del evento se muestran en la parte superior del enlace normal del álbum.",
  showEventName: "Mostrar nombre del evento",
  showEventNameDesc: "Muestra el nombre de la pareja o el título del evento en la cabecera.",
  showLocation: "Mostrar ubicación",
  showLocationDesc: "Muestra la ubicación junto a la fecha en la cabecera del álbum.",
  logoTitle: "Logotipo del evento",
  logoDesc: "Cualquier proporción — horizontal o cuadrada. Se muestra en el enlace Event y en el Foto Wall.",
  uploadLogo: "Subir logotipo",
  replace: "Cambiar",
  remove: "Eliminar",
  brandColor: "Color de marca",
  brandColorDesc: "Se usa en botones y destacados de las superficies Event / Photo Wall.",
  reset: "Restablecer",
  backgroundTitle: "Fondo de la galería del evento",
  backgroundDesc: "Imagen de fondo solo para el enlace Event; la galería normal permanece clara.",
  uploadBackground: "Subir fondo",
  welcomeTitle: "Pantalla de bienvenida",
  welcomeDesc: "Solo aparece en el enlace Event durante la primera visita del invitado.",
  welcomeTextPlaceholder: "¡Comparte tus fotos con nosotros!",
  next: "Continuar",
  welcomeBackground: "Fondo de la pantalla de bienvenida",
  preview: "Vista previa",
  namePlaceholder: "Nombre …",
  fontElegant: "Elegante (serif)",
  fontModern: "Moderna (sans)",
  fontScript: "Manuscrita",
  fontClassic: "Clásica",
  tooLarge: (max) => `La imagen es demasiado grande (máximo ${max} MB). Elige un archivo más pequeño.`,
  tooLargeOptimized: "La imagen sigue siendo demasiado grande tras optimizarla (máximo 10 MB).",
  unsupportedType: "Este tipo de archivo no es compatible. Usa JPG, PNG o WebP.",
  uploadFailed: "No se pudo subir. Inténtalo de nuevo.",
  connectionUploadFailed: "No se pudo subir. Comprueba la conexión e inténtalo de nuevo.",
  deleteFailed: "No se pudo eliminar. Inténtalo de nuevo.",
  connectionDeleteFailed: "No se pudo eliminar. Comprueba la conexión e inténtalo de nuevo.",
};

const hr: EventAppearanceAdminCopy = {
  title: "🎨 Izgled i zaslon dobrodošlice",
  saving: "Spremam…",
  intro: "Postavke brenda vrijede za Event / Photo Wall poveznicu i Foto zid. Obična galerija ostaje standardna.",
  eventLink: "Event poveznica:",
  eventLinkSuffix: "Svaki element možete u bilo kojem trenutku dodati, zamijeniti ili ukloniti.",
  defaultLanguage: "Zadani jezik događaja",
  defaultLanguageDesc: "Ovaj jezik gosti vide prvi. Jezik i dalje mogu promijeniti unutar galerije.",
  albumHeader: "Zaglavlje obične galerije",
  albumHeaderDesc: "Odaberite koji se podaci događaja prikazuju na vrhu obične poveznice albuma.",
  showEventName: "Prikaži naziv događaja",
  showEventNameDesc: "Prikazuje ime para ili naziv događaja u zaglavlju albuma.",
  showLocation: "Prikaži lokaciju",
  showLocationDesc: "Prikazuje lokaciju događaja uz datum u zaglavlju albuma.",
  logoTitle: "Logotip događaja",
  logoDesc: "Bilo koji omjer — široki ili kvadratni. Prikazuje se na Event poveznici i Foto zidu.",
  uploadLogo: "Prenesi logotip",
  replace: "Zamijeni",
  remove: "Ukloni",
  brandColor: "Boja brenda",
  brandColorDesc: "Koristi se za gumbe i naglaske na Event / Photo Wall površinama.",
  reset: "Poništi",
  backgroundTitle: "Pozadina event galerije",
  backgroundDesc: "Pozadinska slika samo na Event poveznici; obična galerija ostaje svijetla.",
  uploadBackground: "Prenesi pozadinu",
  welcomeTitle: "Zaslon dobrodošlice",
  welcomeDesc: "Prikazuje se samo na Event poveznici pri prvom posjetu gosta.",
  welcomeTextPlaceholder: "Podijelite svoje fotografije s nama!",
  next: "Dalje",
  welcomeBackground: "Pozadina zaslona dobrodošlice",
  preview: "Pregled",
  namePlaceholder: "Ime …",
  fontElegant: "Elegantni (serif)",
  fontModern: "Moderni (sans)",
  fontScript: "Rukopisni",
  fontClassic: "Klasični",
  tooLarge: (max) => `Slika je prevelika (najviše ${max} MB). Odaberite manju datoteku.`,
  tooLargeOptimized: "Slika je i nakon optimizacije prevelika (najviše 10 MB).",
  unsupportedType: "Ova vrsta datoteke nije podržana. Koristite JPG, PNG ili WebP.",
  uploadFailed: "Prijenos nije uspio. Pokušajte ponovno.",
  connectionUploadFailed: "Prijenos nije uspio. Provjerite vezu i pokušajte ponovno.",
  deleteFailed: "Uklanjanje nije uspjelo. Pokušajte ponovno.",
  connectionDeleteFailed: "Uklanjanje nije uspjelo. Provjerite vezu i pokušajte ponovno.",
};

const sr: EventAppearanceAdminCopy = {
  title: "🎨 Izgled i ekran dobrodošlice",
  saving: "Čuvam…",
  intro: "Podešavanja brenda važe za Event / Photo Wall link i Foto zid. Obična galerija ostaje standardna.",
  eventLink: "Event link:",
  eventLinkSuffix: "Svaki element možete u bilo kom trenutku dodati, zameniti ili ukloniti.",
  defaultLanguage: "Podrazumevani jezik događaja",
  defaultLanguageDesc: "Ovaj jezik gosti vide prvi. Jezik i dalje mogu promeniti unutar galerije.",
  albumHeader: "Zaglavlje obične galerije",
  albumHeaderDesc: "Izaberite koji se podaci događaja prikazuju na vrhu običnog linka albuma.",
  showEventName: "Prikaži naziv događaja",
  showEventNameDesc: "Prikazuje ime para ili naziv događaja u zaglavlju albuma.",
  showLocation: "Prikaži lokaciju",
  showLocationDesc: "Prikazuje lokaciju događaja pored datuma u zaglavlju albuma.",
  logoTitle: "Logotip događaja",
  logoDesc: "Bilo koji odnos — širok ili kvadratan. Prikazuje se na Event linku i Foto zidu.",
  uploadLogo: "Otpremi logotip",
  replace: "Zameni",
  remove: "Ukloni",
  brandColor: "Boja brenda",
  brandColorDesc: "Koristi se za dugmad i naglaske na Event / Photo Wall površinama.",
  reset: "Poništi",
  backgroundTitle: "Pozadina event galerije",
  backgroundDesc: "Pozadinska slika samo na Event linku; obična galerija ostaje svetla.",
  uploadBackground: "Otpremi pozadinu",
  welcomeTitle: "Ekran dobrodošlice",
  welcomeDesc: "Prikazuje se samo na Event linku pri prvoj poseti gosta.",
  welcomeTextPlaceholder: "Podelite svoje fotografije sa nama!",
  next: "Dalje",
  welcomeBackground: "Pozadina ekrana dobrodošlice",
  preview: "Pregled",
  namePlaceholder: "Ime …",
  fontElegant: "Elegantni (serif)",
  fontModern: "Moderni (sans)",
  fontScript: "Rukopisni",
  fontClassic: "Klasični",
  tooLarge: (max) => `Slika je prevelika (najviše ${max} MB). Izaberite manju datoteku.`,
  tooLargeOptimized: "Slika je i posle optimizacije prevelika (najviše 10 MB).",
  unsupportedType: "Ova vrsta datoteke nije podržana. Koristite JPG, PNG ili WebP.",
  uploadFailed: "Otpremanje nije uspelo. Pokušajte ponovo.",
  connectionUploadFailed: "Otpremanje nije uspelo. Proverite vezu i pokušajte ponovo.",
  deleteFailed: "Uklanjanje nije uspelo. Pokušajte ponovo.",
  connectionDeleteFailed: "Uklanjanje nije uspelo. Proverite vezu i pokušajte ponovo.",
};

export const eventAppearanceAdminCopy: Record<Lang, EventAppearanceAdminCopy> = {
  sl, en, de, es, hr, sr,
};

export function normalizeEventAdminLang(value: unknown): Lang {
  return value === "en" || value === "de" || value === "es" || value === "hr" || value === "sr" || value === "sl"
    ? value
    : "sl";
}
