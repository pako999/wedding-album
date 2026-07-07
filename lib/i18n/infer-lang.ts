import type { Lang } from "./translations";

/**
 * Infer the gallery's default UI language from the free-text event
 * location the owner typed at creation time ("Sisak, Hrvatska",
 * "Wien, Österreich", "Madrid"…).
 *
 * Guests can always switch language in the gallery header, and a
 * ?lang= URL param still wins — this only sets the sensible default so
 * a Croatian wedding doesn't open in Slovenian.
 *
 * Order matters: country names first (unambiguous), then major cities.
 * Slovenian is the fallback (primary market) so it's checked implicitly.
 */
const LOCATION_PATTERNS: ReadonlyArray<readonly [Lang, RegExp]> = [
  ["hr", /hrvat|croat|kroat|zagreb|\bsplit\b|rijeka|osijek|sisak|zadar|dubrovnik|vara[zž]din|pula\b/i],
  ["sr", /srbij|serbi|beograd|belgrad|novi sad|kragujevac|subotica|ni[sš]\b/i],
  ["de", /deutsch|german|[oö]sterreich|austria|schweiz|switzerland|berlin|m[uü]nchen|wien|hamburg|frankfurt|graz|salzburg|z[uü]rich/i],
  ["es", /espa[nñ]|spain|spanien|madrid|barcelona|valencia|sevilla|m[aá]laga/i],
  ["en", /\bengland\b|united kingdom|\buk\b|ireland|london|manchester|united states|\busa\b/i],
];

export function inferLangFromLocation(location: string | null | undefined): Lang {
  if (!location) return "sl";
  for (const [lang, re] of LOCATION_PATTERNS) {
    if (re.test(location)) return lang;
  }
  return "sl";
}
