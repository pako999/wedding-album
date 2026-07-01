import type { MetadataRoute } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import { SITE_URL } from "@/lib/urls";

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
  // 2026-07-01 — global bare-host → www canonical fix so every sitemap URL
  // resolves 200 instead of 307 (Semrush audit flagged 3xx-in-sitemap on
  // every entry). Also covers all in-flight copy/pricing changes since
  // last bump. Bumping every category so Google re-crawls the full set.
  homepage:    "2026-07-01",
  seoLandings: "2026-07-01",
  alternatives:"2026-07-01",
  legalSl:     "2026-07-01",
  legalIntl:   "2026-07-01",
  contact:     "2026-07-01",
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

const AFFILIATE_APPLY_CLUSTER = clusterLinks({
  sl: "/affiliate/apply", hr: "/affiliate/apply", sr: "/affiliate/apply",
  de: "/affiliate/apply", en: "/affiliate/apply", es: "/affiliate/apply",
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
/** Shared cluster: the blog index has the same slug across all languages
 *  (just under different locale prefixes). */
const BLOG_INDEX_CLUSTER = clusterLinks({
  sl: "/blog", hr: "/blog", sr: "/blog", de: "/blog", en: "/blog", es: "/blog",
});

async function blogEntries(): Promise<PageEntry[]> {
  const blogDir = path.join(process.cwd(), "content", "blog");
  const out: PageEntry[] = [];

  // Index pages — same slug in every locale, so the alternates cluster
  // is just BLOG_INDEX_CLUSTER for every entry.
  out.push({ path: "/blog",        priority: 0.7,  changeFrequency: "weekly", alternates: BLOG_INDEX_CLUSTER });
  for (const lang of ["hr", "sr", "de", "en", "es"]) {
    out.push({ path: `/${lang}/blog`, priority: 0.65, changeFrequency: "weekly", alternates: BLOG_INDEX_CLUSTER });
  }

  // First pass: read every post once, recording its translationKey, slug,
  // language, and updatedAt. We need the full map before we can attach
  // hreflang alternates because each post needs to know the URLs of its
  // siblings in every other language.
  interface PostInfo {
    lang: Locale;
    slug: string;
    url: string;
    updated?: string;
    translationKey?: string;
  }
  const allPosts: PostInfo[] = [];

  for (const lang of LOCALES) {
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
      let updated: string | undefined;
      let translationKey: string | undefined;
      try {
        const raw = await fs.readFile(path.join(dir, file), "utf8");
        const data = JSON.parse(raw) as {
          updatedAt?: string;
          publishedAt?: string;
          translationKey?: string;
        };
        updated = data.updatedAt ?? data.publishedAt;
        translationKey = data.translationKey;
      } catch {
        // skip malformed file silently — better than breaking the whole sitemap
      }
      allPosts.push({ lang, slug, url, updated, translationKey });
    }
  }

  // Build translationKey → { locale: absoluteUrl } so each post can declare
  // its language siblings in the sitemap.
  const clustersByKey = new Map<string, Record<string, string>>();
  for (const p of allPosts) {
    if (!p.translationKey) continue;
    const c = clustersByKey.get(p.translationKey) ?? {};
    c[p.lang] = `${SITE_URL}${p.url}`;
    clustersByKey.set(p.translationKey, c);
  }
  // For posts with siblings, fall back x-default to the SL version when
  // present, otherwise the EN version, otherwise the first available.
  for (const [key, langs] of clustersByKey) {
    if (Object.keys(langs).length < 2) {
      // A "cluster" of size 1 isn't worth emitting hreflang for — Google
      // would just see a self-referencing alternate.
      clustersByKey.delete(key);
      continue;
    }
    langs["x-default"] = langs.sl ?? langs.en ?? Object.values(langs)[0];
  }

  for (const p of allPosts) {
    const cluster = p.translationKey ? clustersByKey.get(p.translationKey) : undefined;
    out.push({
      path: p.url,
      priority: 0.6,
      changeFrequency: "monthly",
      lastModified: p.updated,
      alternates: cluster,
    });
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

    // Affiliate apply
    { path: "/affiliate/apply",    priority: 0.55, changeFrequency: "monthly", alternates: AFFILIATE_APPLY_CLUSTER },
    { path: "/hr/affiliate/apply", priority: 0.5,  changeFrequency: "monthly", alternates: AFFILIATE_APPLY_CLUSTER },
    { path: "/sr/affiliate/apply", priority: 0.5,  changeFrequency: "monthly", alternates: AFFILIATE_APPLY_CLUSTER },
    { path: "/de/affiliate/apply", priority: 0.5,  changeFrequency: "monthly", alternates: AFFILIATE_APPLY_CLUSTER },
    { path: "/en/affiliate/apply", priority: 0.5,  changeFrequency: "monthly", alternates: AFFILIATE_APPLY_CLUSTER },
    { path: "/es/affiliate/apply", priority: 0.5,  changeFrequency: "monthly", alternates: AFFILIATE_APPLY_CLUSTER },

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
