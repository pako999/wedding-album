import { deDE, enUS, esES, hrHR, srRS } from "@clerk/localizations";
import type { LangCode } from "@/components/LanguageSwitcher";

// @clerk/types isn't an explicit dep — derive the localization shape
// from one of the packs we already import. enUS is the complete set,
// so its type is the canonical LocalizationResource.
type LocalizationResource = typeof enUS;

/**
 * Minimal Slovenian localization for Clerk's sign-in / sign-up /
 * verification UI. Clerk doesn't ship slSI out of the box — Slovenes
 * would otherwise see English. We translate the *visible* strings on
 * the auth flows (sign in / sign up / email code / password). Any
 * key we omit falls back to English automatically.
 *
 * Cast to LocalizationResource because Clerk's type expects every key
 * to be present; partial overrides are explicitly supported at runtime.
 */
const slSI = {
  locale: "sl-SI",
  signIn: {
    start: {
      title: "Prijava v {{applicationName}}",
      subtitle: "Dobrodošli nazaj! Prosimo, prijavite se za nadaljevanje",
      actionText: "Nimate računa?",
      actionLink: "Registrirajte se",
    },
    password: {
      title: "Vnesite geslo",
      subtitle: "za nadaljevanje na {{applicationName}}",
      actionLink: "Pozabljeno geslo",
    },
    emailCode: {
      title: "Preverite svoj email",
      subtitle: "za nadaljevanje na {{applicationName}}",
      formTitle: "Verifikacijska koda",
      resendButton: "Niste prejeli kode? Pošlji znova",
    },
    forgotPasswordAlternativeMethods: {
      title: "Pozabljeno geslo?",
      label__alternativeMethods: "Ali se prijavite z drugo metodo",
      blockButton__resetPassword: "Ponastavi geslo",
    },
    resetPassword: {
      title: "Ponastavi geslo",
      formButtonPrimary: "Ponastavi geslo",
      successMessage: "Geslo je bilo uspešno ponastavljeno. Prijavljamo vas, prosimo, počakajte.",
    },
    alternativeMethods: {
      title: "Uporabite drugo metodo",
      subtitle: "Imate težave? Uporabite eno izmed teh metod za prijavo.",
      actionText: "Nimate nobene od teh?",
      actionLink: "Pomoč",
      blockButton__emailCode: "Pošlji kodo na {{identifier}}",
      blockButton__password: "Prijava z geslom",
    },
  },
  signUp: {
    start: {
      title: "Ustvarite račun",
      subtitle: "Dobrodošli! Prosimo, izpolnite podatke za začetek",
      actionText: "Imate račun?",
      actionLink: "Prijava",
    },
    emailCode: {
      title: "Preverite svoj email",
      subtitle: "za nadaljevanje na {{applicationName}}",
      formTitle: "Verifikacijska koda",
      formSubtitle: "Vnesite verifikacijsko kodo, ki smo jo poslali na vaš email",
      resendButton: "Niste prejeli kode? Pošlji znova",
    },
  },
  formFieldLabel__emailAddress: "Email naslov",
  formFieldLabel__emailAddress_username: "Email ali uporabniško ime",
  formFieldLabel__password: "Geslo",
  formFieldLabel__newPassword: "Novo geslo",
  formFieldLabel__confirmPassword: "Potrdi geslo",
  formFieldLabel__firstName: "Ime",
  formFieldLabel__lastName: "Priimek",
  formFieldLabel__username: "Uporabniško ime",
  formFieldInputPlaceholder__emailAddress: "vase@email.si",
  formFieldInputPlaceholder__password: "Vnesite geslo",
  formButtonPrimary: "Nadaljuj",
  signInEnterPasswordTitle: "Vnesite geslo",
  socialButtonsBlockButton: "Nadaljuj z {{provider|titleize}}",
  dividerText: "ali",
  badge__primary: "Primarno",
  badge__default: "Privzeto",
  badge__verified: "Verificirano",
  badge__unverified: "Neverificirano",
  footerActionLink__useAnotherMethod: "Uporabi drugo metodo",
  unstable__errors: {
    form_identifier_not_found: "Ta račun ne obstaja. Preverite vnos ali se registrirajte.",
    form_password_incorrect: "Geslo je napačno. Poskusite znova.",
    form_password_pwned: "To geslo je bilo v varnostnem incidentu. Prosimo, izberite drugo.",
    form_password_validation_minimum_length: "Geslo mora biti vsaj 8 znakov dolgo.",
    form_param_format_invalid__email_address: "Email naslov ni veljaven.",
    network_error: "Napaka v omrežju. Preverite povezavo in poskusite znova.",
  },
} as unknown as LocalizationResource;

const MAP: Record<LangCode, LocalizationResource> = {
  sl: slSI,
  hr: hrHR,
  sr: srRS,
  de: deDE,
  en: enUS,
  es: esES,
};

/** Pick the Clerk localization pack for the given UI language. */
export function clerkLocaleFor(lang: LangCode | undefined | null): LocalizationResource {
  if (!lang) return slSI; // Default to Slovenian since guestcam.si is SL-first
  return MAP[lang] ?? slSI;
}
