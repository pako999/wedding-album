import type { Lang } from "./translations";

export const CHECKOUT_LANGS: readonly Lang[] = ["sl", "hr", "sr", "en", "de", "es"];

const CHECKOUT_LANG_SET = new Set<string>(CHECKOUT_LANGS);

export function normalizeCheckoutLang(value: unknown): Lang | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return CHECKOUT_LANG_SET.has(normalized) ? (normalized as Lang) : null;
}

export function checkoutLangFromPath(pathname: string | null | undefined): Lang | null {
  if (!pathname) return null;
  return normalizeCheckoutLang(pathname.split("/").filter(Boolean)[0]);
}

export function checkoutLangFromReferer(referer: string | null | undefined): Lang | null {
  if (!referer) return null;
  try {
    return checkoutLangFromPath(new URL(referer).pathname);
  } catch {
    return null;
  }
}

export function checkoutLangFromHostname(hostname: string | null | undefined): Lang | null {
  const host = (hostname ?? "").split(",")[0].split(":")[0].trim().toLowerCase().replace(/^www\./, "");
  if (host === "guestcam.rs") return "sr";
  if (host === "guestcam.es") return "es";
  return null;
}

/** Mollie's hosted checkout currently has no Slovenian, Croatian or Serbian
 * locale. Guestcam stays translated in those languages; only the hosted bank
 * page uses Mollie's English fallback. */
export type MollieCheckoutLocale = "en_GB" | "de_DE" | "es_ES";

export function mollieLocaleForLang(lang: Lang): MollieCheckoutLocale {
  if (lang === "de") return "de_DE";
  if (lang === "es") return "es_ES";
  return "en_GB";
}

const REGION_LOCALES: Record<Lang, string> = {
  sl: "sl-SI",
  hr: "hr-HR",
  sr: "sr-Latn-RS",
  en: "en-GB",
  de: "de-DE",
  es: "es-ES",
};

const regionNames = new Map<Lang, Intl.DisplayNames>();

/** Localise ISO country names without shipping six copies of the country list. */
export function checkoutRegionName(code: string, lang: Lang, fallback = code): string {
  try {
    let names = regionNames.get(lang);
    if (!names) {
      names = new Intl.DisplayNames([REGION_LOCALES[lang]], { type: "region" });
      regionNames.set(lang, names);
    }
    return names.of(code) ?? fallback;
  } catch {
    return fallback;
  }
}

const ADD_ON_DESCRIPTION: Record<Lang, {
  stands: string;
  gold: string;
  wood: string;
  shipping: string;
}> = {
  sl: { stands: "QR podstavki za mize", gold: "zlati", wood: "leseni", shipping: "s poštnino" },
  hr: { stands: "QR stalci za stolove", gold: "zlatni", wood: "drveni", shipping: "s poštarinom" },
  sr: { stands: "QR stalci za stolove", gold: "zlatni", wood: "drveni", shipping: "sa poštarinom" },
  en: { stands: "QR table stands", gold: "gold", wood: "wooden", shipping: "including shipping" },
  de: { stands: "QR-Tischaufsteller", gold: "goldfarben", wood: "aus Holz", shipping: "inklusive Versand" },
  es: { stands: "soportes QR de mesa", gold: "dorados", wood: "de madera", shipping: "envío incluido" },
};

export function checkoutPaymentDescription(
  planName: string,
  lang: Lang,
  stands?: { qty: number; variant: "wood" | "gold" } | null,
): string {
  if (!stands) return planName;
  const copy = ADD_ON_DESCRIPTION[lang];
  const material = stands.variant === "gold" ? copy.gold : copy.wood;
  return `${planName} + ${stands.qty}× ${copy.stands} (${material}, ${copy.shipping})`;
}
