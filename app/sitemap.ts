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
}

// Stable last-edited dates for static pages. Bumping these signals real
// content change to crawlers; leaving them constant when nothing changed
// avoids the "everything updated today" anti-pattern that Google
// learns to ignore. Increment when you actually edit the page.
const LAST_EDITED = {
  // Bumped 2026-05-25 — keyword-first meta titles + descriptions
  // rewritten across all 6 locale homepages (PR #66, commit fb8c02c).
  // The lastmod signal tells crawlers "re-fetch me" so the new SERP
  // copy lands in Google's index within a day or two instead of the
  // usual ~weekly homepage re-crawl interval.
  homepage:    "2026-05-25",
  seoLandings: "2026-05-22",
  alternatives:"2026-05-22",
  legalSl:     "2026-01-01",
  legalIntl:   "2026-01-01",
  contact:     "2026-05-22",
};

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
    { path: "",     priority: 1.0, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage },

    // Localized homepages
    { path: "/hr", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage },
    { path: "/sr", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage },
    { path: "/de", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage },
    { path: "/en", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage },
    { path: "/es", priority: 0.9, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage },

    // SEO wedding-guide landings
    { path: "/sl/qr-koda-poroka",         priority: 0.9, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings },
    { path: "/hr/qr-kod-vjencanje",       priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings },
    { path: "/sr/qr-kod-vencanje",        priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings },
    { path: "/de/hochzeitsfotos-sammeln", priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings },
    { path: "/en/wedding-photo-sharing",  priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings },
    { path: "/es/fotos-boda-qr",          priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings },

    // Alternatives / comparison pages
    { path: "/sl/alternative-aplikacije",  priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives },
    { path: "/hr/alternativne-aplikacije", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives },
    { path: "/sr/alternativne-aplikacije", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives },
    { path: "/de/alternativen",            priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives },
    { path: "/en/alternatives",            priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives },
    { path: "/es/alternativas",            priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives },

    // Legal — Slovenian master
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly", lastModified: LAST_EDITED.legalSl },
    { path: "/terms",   priority: 0.3, changeFrequency: "yearly", lastModified: LAST_EDITED.legalSl },
    { path: "/gdpr",    priority: 0.3, changeFrequency: "yearly", lastModified: LAST_EDITED.legalSl },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly", lastModified: LAST_EDITED.legalSl },

    // Contact pages
    { path: "/contact",    priority: 0.5, changeFrequency: "yearly", lastModified: LAST_EDITED.contact },
    { path: "/hr/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact },
    { path: "/sr/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact },
    { path: "/de/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact },
    { path: "/en/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact },
    { path: "/es/contact", priority: 0.45, changeFrequency: "yearly", lastModified: LAST_EDITED.contact },

    // Legal — localized
    ...(["hr", "sr", "de", "en", "es"].flatMap((lang) =>
      ["privacy", "terms", "gdpr", "cookies"].map((doc) => ({
        path: `/${lang}/${doc}`,
        priority: 0.25,
        changeFrequency: "yearly" as ChangeFreq,
        lastModified: LAST_EDITED.legalIntl,
      })),
    )),

    // Blog (real updatedAt timestamps per post)
    ...blog,
  ];

  return pages.map(({ path, priority, changeFrequency, lastModified }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: lastModified ? new Date(lastModified) : fallback,
    changeFrequency,
    priority,
  }));
}
