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
      //
      // Album guest pages (/<slug>) are blocked *additionally* at the
      // HTTP-header level via X-Robots-Tag in middleware.ts — we can't
      // list every album slug here (they're dynamic) and a blanket
      // Disallow: / would block the public marketing pages too. The
      // per-page noindex meta + middleware header pair handles it.
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
        ],
      },
      // AI-training crawlers: keep them out of album guest pages
      // entirely. Different vendors honour different markers (GPTBot
      // ignores X-Robots-Tag in practice, robots.txt is its only signal).
      // We still allow them on /blog and the SEO landings — that's
      // the public content we WANT cited.
      //
      // NB: deliberately EXCLUDED from this list are the social
      // link-preview scrapers (FacebookBot / facebookexternalhit,
      // Twitterbot, LinkedInBot, Slackbot, TelegramBot, WhatsApp,
      // Discordbot, Applebot). Blocking those breaks OG link previews
      // when someone shares guestcam.si on social — exactly the bug
      // the user just reported.
      ...["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-Web",
          "PerplexityBot", "Perplexity-User", "Google-Extended", "CCBot",
          "anthropic-ai", "Bytespider", "PetalBot",
          "ImagesiftBot", "Diffbot", "Omgilibot", "Applebot-Extended"].map(
        (userAgent) => ({
          userAgent,
          allow: ["/blog", "/sl/", "/hr/", "/sr/", "/de/", "/en/", "/es/", "/contact"],
          disallow: ["/"],
        }),
      ),
    ],
    sitemap: "https://www.guestcam.si/sitemap.xml",
    host: "https://www.guestcam.si",
  };
}
