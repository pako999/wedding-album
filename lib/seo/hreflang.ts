import { serbianGuestcamUrl } from "@/lib/site-domains";

/**
 * Add country-specific aliases for the two Balkan markets we actively serve.
 * The generic language tags stay in place for Croatian/Serbian speakers outside
 * Croatia and Serbia, while hr-HR and sr-RS give Google a clearer local signal.
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

  return localized;
}
