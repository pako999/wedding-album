import type { MetadataRoute } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import { SITE_URL } from "@/lib/urls";
import { getEventTopic, localesForTopic, type EventTopicKey } from "@/lib/seo/event-topics";
import { LEGAL_DOCUMENTS, legalAlternates } from "@/lib/seo/legal-alternates";

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
type Locale = "sl" | "hr" | "sr" | "de" | "en" | "es";

interface PageEntry {
  path: string;
  priority: number;
  changeFrequency: ChangeFreq;
  /** Emit lastmod only when we know a real edit/publish date. */
  lastModified?: string;
  alternates?: Record<string, string>;
}

const LOCALES: Locale[] = ["sl", "hr", "sr", "de", "en", "es"];

/** Stable dates only. Never replace an unknown lastmod with `new Date()`:
 * doing so tells crawlers every page changed on every sitemap generation. */
const LAST_EDITED = {
  homepage: "2026-08-27",
  seoLandings: "2026-07-01",
  alternatives: "2026-07-01",
  legalSl: "2026-07-01",
  legalIntl: "2026-07-01",
  contact: "2026-07-01",
  corporateLandings: "2026-08-11",
  blogIndex: "2026-08-27",
};

function clusterLinks(paths: Record<Locale, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of LOCALES) out[lang] = `${SITE_URL}${paths[lang]}`;
  out["x-default"] = out.sl;
  return out;
}

const HOMEPAGE_CLUSTER = clusterLinks({ sl: "", hr: "/hr", sr: "/sr", de: "/de", en: "/en", es: "/es" });
const SEO_LANDING_CLUSTER = clusterLinks({
  sl: "/sl/qr-koda-poroka", hr: "/hr/qr-kod-vjencanje", sr: "/sr/qr-kod-vencanje",
  de: "/de/hochzeitsfotos-sammeln", en: "/en/wedding-photo-sharing", es: "/es/fotos-boda-qr",
});
const CORPORATE_LANDING_CLUSTER: Record<string, string> = {
  sl: `${SITE_URL}/sl/qr-koda-za-poslovne-dogodke`,
  "x-default": `${SITE_URL}/sl/qr-koda-za-poslovne-dogodke`,
};
const ALTERNATIVES_CLUSTER = clusterLinks({
  sl: "/sl/alternative-aplikacije", hr: "/hr/alternativne-aplikacije", sr: "/sr/alternativne-aplikacije",
  de: "/de/alternativen", en: "/en/alternatives", es: "/es/alternativas",
});
const CONTACT_CLUSTER = clusterLinks({
  sl: "/contact", hr: "/hr/contact", sr: "/sr/contact", de: "/de/contact", en: "/en/contact", es: "/es/contact",
});
const AFFILIATE_APPLY_CLUSTER = clusterLinks({
  sl: "/affiliate/apply", hr: "/hr/affiliate/apply", sr: "/sr/affiliate/apply",
  de: "/de/affiliate/apply", en: "/en/affiliate/apply", es: "/es/affiliate/apply",
});
const BLOG_INDEX_CLUSTER = clusterLinks({
  sl: "/blog", hr: "/hr/blog", sr: "/sr/blog", de: "/de/blog", en: "/en/blog", es: "/es/blog",
});

async function blogEntries(): Promise<PageEntry[]> {
  const blogDir = path.join(process.cwd(), "content", "blog");
  const out: PageEntry[] = [
    { path: "/blog", priority: 0.7, changeFrequency: "weekly", lastModified: LAST_EDITED.blogIndex, alternates: BLOG_INDEX_CLUSTER },
    ...(["hr", "sr", "de", "en", "es"] as Locale[]).map((lang) => ({
      path: `/${lang}/blog`, priority: 0.65, changeFrequency: "weekly" as ChangeFreq,
      lastModified: LAST_EDITED.blogIndex, alternates: BLOG_INDEX_CLUSTER,
    })),
  ];

  interface PostInfo { lang: Locale; slug: string; url: string; updated?: string; translationKey?: string }
  const allPosts: PostInfo[] = [];

  for (const lang of LOCALES) {
    const dir = path.join(blogDir, lang);
    let files: string[] = [];
    try { files = await fs.readdir(dir); } catch { continue; }
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const slug = file.slice(0, -5);
      const url = lang === "sl" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
      let updated: string | undefined;
      let translationKey: string | undefined;
      try {
        const data = JSON.parse(await fs.readFile(path.join(dir, file), "utf8")) as {
          updatedAt?: string; publishedAt?: string; translationKey?: string;
        };
        updated = data.updatedAt ?? data.publishedAt;
        translationKey = data.translationKey;
      } catch { /* malformed posts are still discoverable without fake dates */ }
      allPosts.push({ lang, slug, url, updated, translationKey });
    }
  }

  const clustersByKey = new Map<string, Record<string, string>>();
  for (const p of allPosts) {
    if (!p.translationKey) continue;
    const cluster = clustersByKey.get(p.translationKey) ?? {};
    cluster[p.lang] = `${SITE_URL}${p.url}`;
    clustersByKey.set(p.translationKey, cluster);
  }
  for (const [key, langs] of clustersByKey) {
    if (Object.keys(langs).length < 2) { clustersByKey.delete(key); continue; }
    langs["x-default"] = langs.sl ?? langs.en ?? Object.values(langs)[0];
  }

  for (const p of allPosts) {
    out.push({
      path: p.url,
      priority: 0.6,
      changeFrequency: "monthly",
      lastModified: p.updated,
      alternates: p.translationKey ? clustersByKey.get(p.translationKey) : undefined,
    });
  }
  return out;
}

const EVENT_TOPIC_KEYS: EventTopicKey[] = [
  "slike-s-poroke", "qr-koda-za-poroko", "porocni-album", "zbiranje-slik-s-poroke",
  "slike-z-rojstnega-dne", "baby-shower-slike",
];
const MINOR_EVENT_TOPICS = new Set<EventTopicKey>(["slike-z-rojstnega-dne", "baby-shower-slike"]);

function eventTopicEntries(): PageEntry[] {
  const out: PageEntry[] = [];
  for (const key of EVENT_TOPIC_KEYS) {
    const locales = localesForTopic(key) as Locale[];
    if (!locales.length) continue;
    const cluster: Record<string, string> = {};
    for (const loc of locales) cluster[loc] = `${SITE_URL}/${loc}/${getEventTopic(loc, key)!.slug}`;
    cluster["x-default"] = cluster.sl ?? cluster.en ?? Object.values(cluster)[0];
    const minor = MINOR_EVENT_TOPICS.has(key);
    for (const loc of locales) {
      out.push({
        path: `/${loc}/${getEventTopic(loc, key)!.slug}`,
        priority: loc === "sl" ? (minor ? 0.7 : 0.75) : (minor ? 0.65 : 0.7),
        changeFrequency: "monthly",
        lastModified: LAST_EDITED.seoLandings,
        alternates: cluster,
      });
    }
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blog = await blogEntries();
  const pages: PageEntry[] = [
    { path: "", priority: 1, changeFrequency: "weekly", lastModified: LAST_EDITED.homepage, alternates: HOMEPAGE_CLUSTER },
    ...(["hr", "sr", "de", "en", "es"] as Locale[]).map((lang) => ({ path: `/${lang}`, priority: 0.9, changeFrequency: "weekly" as ChangeFreq, lastModified: LAST_EDITED.homepage, alternates: HOMEPAGE_CLUSTER })),

    { path: "/sl/qr-koda-poroka", priority: 0.9, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/hr/qr-kod-vjencanje", priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/sr/qr-kod-vencanje", priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/de/hochzeitsfotos-sammeln", priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/en/wedding-photo-sharing", priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/es/fotos-boda-qr", priority: 0.8, changeFrequency: "monthly", lastModified: LAST_EDITED.seoLandings, alternates: SEO_LANDING_CLUSTER },
    { path: "/sl/qr-koda-za-poslovne-dogodke", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.corporateLandings, alternates: CORPORATE_LANDING_CLUSTER },

    ...eventTopicEntries(),

    { path: "/sl/alternative-aplikacije", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/hr/alternativne-aplikacije", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/sr/alternativne-aplikacije", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/de/alternativen", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/en/alternatives", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },
    { path: "/es/alternativas", priority: 0.7, changeFrequency: "monthly", lastModified: LAST_EDITED.alternatives, alternates: ALTERNATIVES_CLUSTER },

    ...LEGAL_DOCUMENTS.map((doc) => ({ path: `/${doc}`, priority: 0.3, changeFrequency: "yearly" as ChangeFreq, lastModified: LAST_EDITED.legalSl, alternates: legalAlternates(doc) })),
    ...(["hr", "sr", "de", "en", "es"] as Locale[]).flatMap((lang) => LEGAL_DOCUMENTS.map((doc) => ({ path: `/${lang}/${doc}`, priority: 0.25, changeFrequency: "yearly" as ChangeFreq, lastModified: LAST_EDITED.legalIntl, alternates: legalAlternates(doc) }))),

    { path: "/affiliate/apply", priority: 0.55, changeFrequency: "monthly", alternates: AFFILIATE_APPLY_CLUSTER },
    ...(["hr", "sr", "de", "en", "es"] as Locale[]).map((lang) => ({ path: `/${lang}/affiliate/apply`, priority: 0.5, changeFrequency: "monthly" as ChangeFreq, alternates: AFFILIATE_APPLY_CLUSTER })),

    { path: "/contact", priority: 0.5, changeFrequency: "yearly", lastModified: LAST_EDITED.contact, alternates: CONTACT_CLUSTER },
    ...(["hr", "sr", "de", "en", "es"] as Locale[]).map((lang) => ({ path: `/${lang}/contact`, priority: 0.45, changeFrequency: "yearly" as ChangeFreq, lastModified: LAST_EDITED.contact, alternates: CONTACT_CLUSTER })),

    ...blog,
  ];

  return pages.map(({ path, priority, changeFrequency, lastModified, alternates }) => ({
    url: `${SITE_URL}${path}`,
    ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
    changeFrequency,
    priority,
    ...(alternates ? { alternates: { languages: alternates } } : {}),
  }));
}
