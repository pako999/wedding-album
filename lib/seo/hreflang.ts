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
  if (languages.sr) localized["sr-RS"] = languages.sr;

  return localized;
}
