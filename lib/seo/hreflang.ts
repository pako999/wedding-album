import {
  serbianGuestcamUrl,
  spanishGuestcamUrl,
} from "@/lib/site-domains";

/**
 * Add country-specific aliases for the markets we actively serve. Generic
 * language tags stay in place, while language-region pairs give Google a
 * clearer local signal. Serbian and Spanish URLs are consolidated onto their
 * country domains here so every metadata cluster stays consistent.
 */
export function withRegionalHreflang(
  languages: Record<string, string | undefined>,
): Record<string, string> {
  const localized = Object.fromEntries(
    Object.entries(languages).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );

  if (languages.hr) localized["hr-HR"] = languages.hr;
  if (languages.sr) {
    let serbianUrl = languages.sr;
    try {
      const parsed = new URL(languages.sr);
      serbianUrl = serbianGuestcamUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`);
    } catch {
      // Keep a relative/non-standard value unchanged rather than dropping an
      // otherwise valid alternate from the cluster.
    }
    localized.sr = serbianUrl;
    localized["sr-RS"] = serbianUrl;
  }

  if (languages.es) {
    let spanishUrl = languages.es;
    try {
      const parsed = new URL(languages.es);
      spanishUrl = spanishGuestcamUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`);
    } catch {
      // Preserve a relative/non-standard value rather than dropping it.
    }
    localized.es = spanishUrl;
    localized["es-ES"] = spanishUrl;
  }

  return localized;
}
