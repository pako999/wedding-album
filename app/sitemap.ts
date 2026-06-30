import type { MetadataRoute } from "next";
import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://guestcam.si";

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

interface PageEntry {
  path: string;
  priority: number;
  changeFrequency: ChangeFreq;
  /** ISO date string for lastModified — falls back to now if absent. */
  lastModified?: string;
  /** hreflang map keyed by language code, plus optional "x-default". */
  alternates?: Record<string, string>;
}

// Stable last-edited dates for static pages. Bumping these signals real
// content change to crawlers; leaving them constant when nothing changed
// avoids the "everything updated today" anti-pattern that Google
// learns to ignore. Increment when you actually edit the page.
const LAST_EDITED = {
  // 2026-06-30 — homepage pricing card Premium 79€→99€ across 6 locales.
  homepage:    "2026-06-30",
  // 2026-06-30 — all 6 SEO landing titles, H1s, and meta descriptions
  // rewritten to lead with action verbs and the highest-intent term
  // (commits 19a9c23 + 5afa6cd). Bumping lastmod tells Google to
  // re-crawl ASAP so the new SERP copy goes live within 1-3 days.
  seoLandings: "2026-06-30",
  alternatives:"2026-05-22",
  // 2026-06-19 — privacy policy rewrite (Cookiebot-aligned, 11 sections,
  // all 6 languages). Bumping lastmod so the new disclosure text gets
  // re-indexed promptly.
  legalSl:     "2026-06-19",
  legalIntl:   "2026-06-19",
  contact:     "2026-05-22",
};

const LOCALES = ["sl", "hr", "sr", "de", "en", "es"] as const;
type Locale = (typeof LOCALES)[number];

/** Build the alternates.languages map for a "cluster" of equivalent pages
 *  across the 6 locales. Google reads this as hreflang signals straight
 *  from the sitemap, in addition to the per-page <head> tags. The x-default
 *  always points to the SL master so search engines have a deterministic
 *  fallback when none of the user's preferred languages match. */
function clusterLinks(slugs: Record<Locale, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of LOCALES) {
    const slug = slugs[lang];
    out[lang] = `${SITE_URL}${lang === "sl" ? "" : `/${lang}`}${slug}`;
  }
  out["x-default"] = out.sl;
  return out;
}

const HOMEPAGE_CLUSTER = clusterLinks({ sl: "", hr: "", sr: "", de: "", en: "", es: "" });

const SEO_LANDING_CLUSTER = clusterLinks({
  sl: "/qr-koda-poroka",
  hr: "/qr-kod-vjencanje",
  sr: "/qr-kod-vencanje",
  de: "/hochzeitsfotos-sammeln",
  en: "/wedding-photo-sharing",
  es: "/fotos-boda-qr",
});

const ALTERNATIVES_CLUSTER = clusterLinks({
  sl: "/alternative-aplikacije",
  hr: "/alternativne-aplikacije",
  sr: "/alternativne-aplikacije",
  de: "/alternativen",
  en: "/alternatives",
  es: "/alternativas",
});

const CONTACT_CLUSTER = clusterLinks({
  sl: "/contact", hr: "/contact", sr: "/contact",
  de: "/contact", en: "/contact", es: "/contact",
});

/** Per-document legal clusters (same slug across all 6 langs). */
function legalCluster(doc: string): Record<string, string> {
  const slugs: Record<Locale, string> = { sl: `/${doc}`, hr: `/${doc}`, sr: `/${doc}`, de: `/${doc}`, en: `/${doc}`, es: `/${doc}` };
  return clusterLinks(slugs);
}

/**
 * Walk content/blog/<lang>/*.json and produce one sitemap entry per post
 * using its real publishedAt/updatedAt timestamps.
 */
async function blogEntries(): Promise<PageEntry[]> {
  const blogDir = path.join(process.cwd(), "content", "blog");
  const out: PageEntry[] = [];

  // Index pages — change as new posts arrive
  out.push({ path: "/blog", priority: 0.7, changeFrequency: "weekly" });
  for (const lang of ["hr", "sr", "de", "en", "es"]) {
    out.push({ path: `/${lang}/blog`, priority: 0.65, changeFrequency: "weekly" });
  }

  // Per-post URLs with real updatedAt timestamps
  for (const lang of ["sl", "hr", "sr", "de", "en", "es"]) {
    const dir = path.join(blogDir, lang);
    let files: string[] = [];
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const slug = file.replace(".json", "");
      const url = lang === "sl" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
      // Read the post just enough to grab its date. Skip silently if malformed.
      let updated: string | undefined;
      try {
        const raw = await fs.readFile(path.join(dir, file), "utf8");
        const data = JSON.parse(raw) as { updatedAt?: string; publishedAt?: string };
        updated = data.updatedAt ?? data.publishedAt;
      } catch {
        // ignore
      }
      out.push({
        path: url,
        priority: 0.6,
        changeFrequency: "monthly",
        lastModified: updated,
      });
    }
  }
  return out;
}

/**
 * Public sitemap. Lists only marketing / content pages — album galleries
 * and the dashboard are private (noindex) and intentionally excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fallback = new Date();
  const blog = await blogEntries();

  const pages: PageEntry[] = [
    // Homepage — updated whenever the SL master copy changes
    { path: "",    priority: 1.0, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage, alternates: HOMEPAGE_CLUSTER },

    // Localized homepages
    { path: "/hr", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage, alternates: HOMEPAGE_CLUSTER },
    { path: "/sr", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage, alternates: HOMEPAGE_CLUSTER },
    { path: "/de", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage, alternates: HOMEPAGE_CLUSTER },
    { path: "/en", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage, alternates: HOMEPAGE_CLUSTER },
    { path: "/es", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage, alternates: HOMEPAGE_CLUSTER },

    // SEO wedding-guide landings
    { path: "/sl/qr-koda-poroka",         priority: 0.9, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/hr/qr-kod-vjencanje",       priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/sr/qr-kod-vencanje",        priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/de/hochzeitsfotos-sammeln", priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/en/wedding-photo-sharing",  priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/es/fotos-boda-qr",          priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },

    // Alternatives / comparison pages
    { path: "/sl/alternative-aplikacije",  priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/hr/alternativne-aplikacije", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/sr/alternativne-aplikacije", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/de/alternativen",            priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/en/alternatives",            priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/es/alternativas",            priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },

    // Legal — Slovenian master
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly", lastModified: LAST_EDITED.legalSl, alternates: legalCluster("privacy") },
    { path: "/terms",   priority: 0.3, changeFrequency: "yearly", lastModified: LAST_EDITED.legalSl, alternates: legalCluster("terms")   },
    { path: "/gdpr",    priority: 0.3, changeFrequency: "yearly", lastModified: LAST_EDITED.legalSl, alternates: legalCluster("gdpr")    },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly", lastModified: LAST_EDITED.legalSl, alternates: legalCluster("cookies") },
    { path: "/refund",  priority: 0.3, changeFrequency: "yearly", lastModified: LAST_EDITED.legalSl, alternates: legalCluster("refund")  },

    // Contact pages
    { path: "/contact",    priority: 0.5,  changeFrequency: "yearly", lastModified: LAST_EDITED.contact, alternates: CONTACT_CLUSTER },
    { path: "/hr/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact, alternates: CONTACT_CLUSTER },
    { path: "/sr/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact, alternates: CONTACT_CLUSTER },
    { path: "/de/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact, alternates: CONTACT_CLUSTER },
    { path: "/en/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact, alternates: CONTACT_CLUSTER },
    { path: "/es/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact, alternates: CONTACT_CLUSTER },

    // Legal — localized
    ...(["hr", "sr", "de", "en", "es"].flatMap((lang) =>
      ["privacy", "terms", "gdpr", "cookies", "refund"].map((doc) => ({
        path: `/${lang}/${doc}`,
        priority: 0.25,
        changeFrequency: "yearly" as ChangeFreq,
        lastModified: LAST_EDITED.legalIntl,
        alternates: legalCluster(doc),
      })),
    )),

    // Blog (real updatedAt timestamps per post — hreflang not added because
    // posts use translationKey clustering that isn't statically computable
    // here; <head> alternates.languages on each post still drives Google's
    // language pairing).
    ...blog,
  ];

  return pages.map(({ path, priority, changeFrequency, lastModified, alternates }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: lastModified ? new Date(lastModified) : fallback,
    changeFrequency,
    priority,
    ...(alternates ? { alternates: { languages: alternates } } : {}),
  }));
}
