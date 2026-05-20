import type { MetadataRoute } from "next";

/**
 * Production robots.txt — allow indexing of marketing/content pages, but
 * keep private surfaces (dashboard, API, sign-in/up, dev previews) out
 * of search results. Individual album pages stay out via their own
 * `<meta name="robots" content="noindex">` set in app/[slug]/page.tsx.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/",
        "/api/",
        "/sign-in",
        "/sign-up",
        "/dev/",
      ],
    },
    sitemap: "https://guestcam.si/sitemap.xml",
  };
}
