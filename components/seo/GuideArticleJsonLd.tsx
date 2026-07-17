import { safeJsonLd } from "@/lib/seo/jsonld-safe";
import { SITE_URL } from "@/lib/urls";

interface GuideArticleJsonLdProps {
  headline: string;
  description: string;
  inLanguage: string;
  path: string;
}

/** Consistent Article structured data for the six translated guide pages. */
export function GuideArticleJsonLd({
  headline,
  description,
  inLanguage,
  path,
}: GuideArticleJsonLdProps) {
  const url = `${SITE_URL}${path}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage,
    url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Guestcam.si", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Guestcam.si",
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
