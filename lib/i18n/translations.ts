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
  by: string;                   // "by WedFlow"

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
  close: string;                // "Close"
  fileUploaded: string;         // "Uploaded"
  fileNetworkError: string;     // "Network error"

  // Limit warning
  limitReached: string;         // "Album photo limit reached"

  // Footer
  footerCredit: string;         // "Wedding Album · WedFlow"
}

// ─── All translations ─────────────────────────────────────────────────────────

const sl: Translations = {
  albumTitle: "Poročni album",
  by: "WedFlow",
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
  close: "Zapri",
  fileUploaded: "Naloženo",
  fileNetworkError: "Omrežna napaka",
  limitReached: "Omejitev albuma je dosežena.",
  footerCredit: "Poročni album · WedFlow",
};

const hr: Translations = {
  albumTitle: "Vjenčani album",
  by: "WedFlow",
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
  uploading: "Učitavanje…",
  uploadBtn: (n) => `Učitaj${n > 0 ? ` (${n})` : ""}`,
  cancel: "Odustani",
  successTitle: (n) => `${n} ${n === 1 ? "fotografija učitana" : "fotografija učitano"}`,
  successDesc: "Hvala na uspomenama!",
  close: "Zatvori",
  fileUploaded: "Učitano",
  fileNetworkError: "Mrežna greška",
  limitReached: "Dostignut limit fotografija.",
  footerCredit: "Vjenčani album · WedFlow",
};

const sr: Translations = {
  albumTitle: "Venčani album",
  by: "WedFlow",
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
  uploading: "Otpremanje…",
  uploadBtn: (n) => `Otpremi${n > 0 ? ` (${n})` : ""}`,
  cancel: "Otkaži",
  successTitle: (n) => `${n} ${n === 1 ? "fotografija otpremljena" : "fotografija otpremljeno"}`,
  successDesc: "Hvala na uspomenama!",
  close: "Zatvori",
  fileUploaded: "Otpremljeno",
  fileNetworkError: "Mrežna greška",
  limitReached: "Dostignut limit fotografija.",
  footerCredit: "Venčani album · WedFlow",
};

const en: Translations = {
  albumTitle: "Wedding Album",
  by: "WedFlow",
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
  close: "Close",
  fileUploaded: "Uploaded",
  fileNetworkError: "Network error",
  limitReached: "Album photo limit reached.",
  footerCredit: "Wedding Album · WedFlow",
};

const de: Translations = {
  albumTitle: "Hochzeitsalbum",
  by: "WedFlow",
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
  close: "Schließen",
  fileUploaded: "Hochgeladen",
  fileNetworkError: "Netzwerkfehler",
  limitReached: "Foto-Limit des Albums erreicht.",
  footerCredit: "Hochzeitsalbum · WedFlow",
};

const es: Translations = {
  albumTitle: "Álbum de boda",
  by: "WedFlow",
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
  close: "Cerrar",
  fileUploaded: "Subido",
  fileNetworkError: "Error de red",
  limitReached: "Límite de fotos del álbum alcanzado.",
  footerCredit: "Álbum de boda · WedFlow",
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
