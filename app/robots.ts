import { SITE_URL } from "@/lib/urls";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
  isSerbianGuestcamHost,
  isSpanishGuestcamHost,
  SERBIAN_GUESTCAM_ORIGIN,
  SPANISH_GUESTCAM_ORIGIN,
} from "@/lib/site-domains";

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
export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const requestHost = (
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? ""
  ).split(",")[0];
  const countryMarketingHost =
    isSerbianGuestcamHost(requestHost) || isSpanishGuestcamHost(requestHost);
  const publicOrigin = isSerbianGuestcamHost(requestHost)
    ? SERBIAN_GUESTCAM_ORIGIN
    : isSpanishGuestcamHost(requestHost)
      ? SPANISH_GUESTCAM_ORIGIN
      : SITE_URL;

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
          // /llms.txt and /.well-known/ai-content.md MUST stay reachable
          // — they're the "cite this instead" files these bots look for
          // before deciding whether to quote us. Also allow the localised
          // homepages + blog + contact so we're citeable in every language.
          allow: countryMarketingHost
            ? ["/"]
            : [
                "/llms.txt",
                "/.well-known/",
                "/blog",
                "/sl/", "/hr/", "/de/", "/en/",
                "/contact",
              ],
          disallow: countryMarketingHost
            ? ["/dashboard", "/admin", "/api/", "/sign-in", "/sign-up"]
            : ["/"],
        }),
      ),
    ],
    sitemap: `${publicOrigin}/sitemap.xml`,
    host: publicOrigin,
  };
}
