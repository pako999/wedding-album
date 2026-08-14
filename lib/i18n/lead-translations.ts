import type { Lang } from "./translations";

/**
 * Guest data-capture form (events / business package).
 *
 * Shown before uploading when the album has `guestDataCapture` on. The
 * organiser — not Guestcam — is the data controller for what's collected
 * here, which is why the consent line names the event rather than us.
 */
export interface LeadCopy {
  title: string;
  subtitle: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Marketing opt-in. ALWAYS optional — see GDPR note in schema.ts. */
  consentLabel: (organiser: string) => string;
  consentOptional: string;
  privacyNote: string;
  submit: string;
  errRequired: string;
  errEmail: string;
  errGeneric: string;
}

export const LEAD_COPY: Record<Lang, LeadCopy> = {
  sl: {
    title: "Vaši podatki",
    subtitle: "Pred nalaganjem prosimo vnesite svoje podatke.",
    firstName: "Ime",
    lastName: "Priimek",
    email: "E-poštni naslov",
    consentLabel: (o) => `Strinjam se, da mi ${o} pošilja obvestila in ponudbe po e-pošti.`,
    consentOptional: "Neobvezno — fotografije lahko naložite tudi brez tega.",
    privacyNote: "Vaše podatke prejme organizator dogodka. Soglasje lahko kadar koli prekličete.",
    submit: "Nadaljuj",
    errRequired: "Prosimo izpolnite ime, priimek in e-pošto.",
    errEmail: "Vnesite veljaven e-poštni naslov.",
    errGeneric: "Shranjevanje ni uspelo. Poskusite znova.",
  },
  hr: {
    title: "Vaši podaci",
    subtitle: "Prije učitavanja molimo unesite svoje podatke.",
    firstName: "Ime",
    lastName: "Prezime",
    email: "E-mail adresa",
    consentLabel: (o) => `Slažem se da mi ${o} šalje obavijesti i ponude e-poštom.`,
    consentOptional: "Neobavezno — fotografije možete učitati i bez toga.",
    privacyNote: "Vaše podatke prima organizator događaja. Privolu možete povući u bilo kojem trenutku.",
    submit: "Nastavi",
    errRequired: "Molimo ispunite ime, prezime i e-mail.",
    errEmail: "Unesite ispravnu e-mail adresu.",
    errGeneric: "Spremanje nije uspjelo. Pokušajte ponovno.",
  },
  sr: {
    title: "Vaši podaci",
    subtitle: "Pre otpremanja molimo unesite svoje podatke.",
    firstName: "Ime",
    lastName: "Prezime",
    email: "E-mail adresa",
    consentLabel: (o) => `Slažem se da mi ${o} šalje obaveštenja i ponude e-poštom.`,
    consentOptional: "Opciono — fotografije možete otpremiti i bez toga.",
    privacyNote: "Vaše podatke prima organizator događaja. Saglasnost možete povući u bilo kom trenutku.",
    submit: "Nastavi",
    errRequired: "Molimo popunite ime, prezime i e-mail.",
    errEmail: "Unesite ispravnu e-mail adresu.",
    errGeneric: "Čuvanje nije uspelo. Pokušajte ponovo.",
  },
  de: {
    title: "Ihre Daten",
    subtitle: "Bitte geben Sie vor dem Hochladen Ihre Daten ein.",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail-Adresse",
    consentLabel: (o) => `Ich bin einverstanden, dass ${o} mir Informationen und Angebote per E-Mail sendet.`,
    consentOptional: "Optional — Sie können Fotos auch ohne dies hochladen.",
    privacyNote: "Ihre Daten erhält der Veranstalter. Sie können die Einwilligung jederzeit widerrufen.",
    submit: "Weiter",
    errRequired: "Bitte Vorname, Nachname und E-Mail ausfüllen.",
    errEmail: "Bitte eine gültige E-Mail-Adresse eingeben.",
    errGeneric: "Speichern fehlgeschlagen. Bitte erneut versuchen.",
  },
  en: {
    title: "Your details",
    subtitle: "Please enter your details before uploading.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    consentLabel: (o) => `I agree that ${o} may send me news and offers by email.`,
    consentOptional: "Optional — you can upload photos without this.",
    privacyNote: "Your details go to the event organiser. You can withdraw consent at any time.",
    submit: "Continue",
    errRequired: "Please fill in first name, last name and email.",
    errEmail: "Please enter a valid email address.",
    errGeneric: "Could not save. Please try again.",
  },
  es: {
    title: "Tus datos",
    subtitle: "Introduce tus datos antes de subir fotos.",
    firstName: "Nombre",
    lastName: "Apellidos",
    email: "Correo electrónico",
    consentLabel: (o) => `Acepto que ${o} me envíe novedades y ofertas por correo electrónico.`,
    consentOptional: "Opcional — puedes subir fotos sin marcarlo.",
    privacyNote: "Tus datos los recibe el organizador del evento. Puedes retirar el consentimiento cuando quieras.",
    submit: "Continuar",
    errRequired: "Rellena nombre, apellidos y correo electrónico.",
    errEmail: "Introduce un correo electrónico válido.",
    errGeneric: "No se pudo guardar. Inténtalo de nuevo.",
  },
};
