import type { MetadataRoute } from "next";

/**
 * Production robots.txt.
 *
 * Allow indexing of marketing/content pages (homepage, blog, SEO landings,
 * legal, contact). Block private surfaces — dashboard, admin, API, auth
 * routes, dev previews — so they never appear in search.
 *
 * Individual album guest pages (/<slug>) stay out via their own
 * <meta name="robots" content="noindex"> set in app/[slug]/page.tsx.
 * That mechanism is per-page, so we don't list a wildcard here — adding
 * "Disallow: /" would block /blog, /contact, etc. by accident.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule for every crawler — Google, Bing, Perplexity, ChatGPT,
      // Claude, etc. AI assistants are explicitly welcome on public
      // content (blog/SEO landings) because that's how we get cited.
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/admin",
          "/admin/",
          "/api/",
          "/sign-in",
          "/sign-up",
          "/dev/",
          // Belt-and-braces: Stripe / WedFlow webhooks are POST-only but
          // GET-crawls would 405 noisily. Already covered by /api/.
        ],
      },
    ],
    sitemap: "https://guestcam.si/sitemap.xml",
    host: "https://guestcam.si",
  };
}
