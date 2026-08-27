import { SITE_URL } from "@/lib/urls";

export const LEGAL_DOCUMENTS = ["privacy", "terms", "gdpr", "cookies", "refund"] as const;

export type LegalDocument = (typeof LEGAL_DOCUMENTS)[number];

/** Keep every legal-page hreflang cluster complete and reciprocal. */
export function legalAlternates(document: LegalDocument): Record<string, string> {
  return {
    sl: `${SITE_URL}/${document}`,
    hr: `${SITE_URL}/hr/${document}`,
    sr: `${SITE_URL}/sr/${document}`,
    de: `${SITE_URL}/de/${document}`,
    en: `${SITE_URL}/en/${document}`,
    es: `${SITE_URL}/es/${document}`,
    "x-default": `${SITE_URL}/${document}`,
  };
}
