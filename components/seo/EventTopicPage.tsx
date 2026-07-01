import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SeoFooter } from "@/components/SeoFooter";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";
import {
  type EventLocale,
  type EventTopicEntry,
  type EventTopicKey,
  getEventTopic,
  localesForTopic,
} from "@/lib/seo/event-topics";
import { SITE_URL } from "@/lib/urls";

/** Build metadata for a topic + locale. Handles canonical + hreflang. */
export function eventTopicMetadata(
  locale: EventLocale,
  key: EventTopicKey,
): Metadata {
  const entry = getEventTopic(locale, key);
  if (!entry) return {};
  const localePath = locale === "sl" ? `/${entry.slug}` : `/${locale}/${entry.slug}`;

  // Assemble hreflang alternates only for locales that ACTUALLY have this
  // topic — Google doesn't like alternates pointing at 404s.
  const languages: Record<string, string> = {};
  for (const loc of localesForTopic(key)) {
    const e = getEventTopic(loc, key)!;
    const p = loc === "sl" ? `/${e.slug}` : `/${loc}/${e.slug}`;
    languages[loc] = `${SITE_URL}${p}`;
  }
  const xDefault = languages.sl ?? languages.en ?? Object.values(languages)[0];

  return {
    title: entry.title,
    description: entry.description,
    alternates: {
      canonical: `${SITE_URL}${localePath}`,
      languages: { ...languages, "x-default": xDefault },
    },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.description,
      images: [ogImage(entry.title)],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: [OG_IMAGE_URL],
    },
    robots: { index: true, follow: true },
  };
}

interface Props {
  locale: EventLocale;
  topicKey: EventTopicKey;
}

export function EventTopicPage({ locale, topicKey }: Props) {
  const entry: EventTopicEntry | null = getEventTopic(locale, topicKey);
  if (!entry) return null;

  const dashboardHref = "/dashboard/new";

  // Build a complete 6-locale hreflang map for the LanguageSwitcher.
  // Locales that have this topic translated point to their translated
  // URL; those that don't fall back to their homepage so users can
  // still change languages from this page.
  const ALL_LOCALES = ["sl", "hr", "sr", "de", "en", "es"] as const;
  const translated = new Set(localesForTopic(topicKey));
  const hreflang = ALL_LOCALES.reduce((acc, loc) => {
    if (translated.has(loc)) {
      const e = getEventTopic(loc, topicKey)!;
      acc[loc] = loc === "sl" ? `/${e.slug}` : `/${loc}/${e.slug}`;
    } else {
      acc[loc] = loc === "sl" ? "/" : `/${loc}`;
    }
    return acc;
  }, {} as Record<(typeof ALL_LOCALES)[number], string>);

  // JSON-LD Article + FAQPage schema — helps Google render rich result
  // cards for the FAQ block and pin the article to its language cluster.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.h1,
    description: entry.description,
    inLanguage: `${locale}-${locale.toUpperCase()}`,
    author: { "@type": "Organization", name: "Guestcam" },
    publisher: {
      "@type": "Organization",
      name: "Guestcam",
      logo: `${SITE_URL}/icon-512.png`,
    },
    mainEntityOfPage: `${SITE_URL}${locale === "sl" ? `/${entry.slug}` : `/${locale}/${entry.slug}`}`,
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader lang={locale} hreflang={hreflang} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            {entry.h1}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">{entry.intro}</p>
        </div>

        {/* Sections */}
        {entry.sections.map((s, i) => (
          <section key={i} className="mb-10">
            <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">{s.h2}</h2>
            {s.paragraphs.map((p, j) => (
              <p key={j} className="text-gray-600 leading-relaxed mb-4">{p}</p>
            ))}
            {s.bullets && s.bullets.length > 0 && (
              <ul className="space-y-2 mb-4">
                {s.bullets.map((b, k) => (
                  <li key={k} className="text-gray-600 leading-relaxed pl-5 relative">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#C9820A]" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* FAQ */}
        <section className="mb-10 -mx-6 px-6 py-12 bg-[#FFF9EC] rounded-2xl">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-6">FAQ</h2>
          {entry.faq.map((f, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <p className="font-semibold text-[#0F1729] mb-1.5">{f.q}</p>
              <p className="text-gray-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section
          className="rounded-3xl p-8 mb-16 text-center"
          style={{
            background: "linear-gradient(135deg, #FFE9A6 0%, #FFD966 100%)",
          }}
        >
          <p className="font-serif text-2xl font-bold text-[#0F1729] mb-3">{entry.ctaHeading}</p>
          <p className="text-gray-800 mb-6 max-w-md mx-auto">{entry.ctaBody}</p>
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#0F1729] text-white font-bold text-base transition-transform duration-200 hover:scale-[1.02]"
          >
            {entry.ctaButton} →
          </Link>
        </section>
      </main>

      <SeoFooter lang={locale} />
    </div>
  );
}
