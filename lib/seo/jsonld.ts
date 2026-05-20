/**
 * Helpers for building JSON-LD structured data.
 * Drop the return value into a `<script type="application/ld+json">` tag.
 */

const SITE = "https://guestcam.si";

interface FaqEntry { q: string; a: string; }

/** FAQPage schema — eligible for Google's FAQ rich result. */
export function buildFaqSchema(faqs: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

interface BreadcrumbItem { name: string; url: string; }

/** BreadcrumbList schema — produces breadcrumb trail in SERP. */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface HowToStep { name: string; text: string; }

/** HowTo schema — eligible for step rich snippet. */
export function buildHowToSchema(opts: {
  name: string;
  description: string;
  totalTimeIso?: string; // e.g. "PT5M" for 5 minutes
  steps: HowToStep[];
}) {
  const out: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
  if (opts.totalTimeIso) out.totalTime = opts.totalTimeIso;
  return out;
}

interface ArticleOpts {
  headline: string;
  description: string;
  inLanguage: string; // e.g. "sl-SI", "sr-RS"
  url: string;        // full canonical URL
  datePublished?: string; // ISO date
  dateModified?: string;  // ISO date
}

/** Article schema — basic news/blog article rich data. */
export function buildArticleSchema(opts: ArticleOpts) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    inLanguage: opts.inLanguage,
    author: { "@type": "Organization", name: "Guestcam", url: SITE },
    publisher: {
      "@type": "Organization",
      name: "Guestcam",
      logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
    },
    mainEntityOfPage: opts.url,
    datePublished: opts.datePublished ?? "2025-01-15",
    dateModified: opts.dateModified ?? "2025-01-15",
  };
}
