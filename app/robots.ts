import { SITE_URL } from "@/lib/urls";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
  isSerbianGuestcamHost,
  isSpanishGuestcamHost,
  SERBIAN_GUESTCAM_ORIGIN,
  SPANISH_GUESTCAM_ORIGIN,
} from "@/lib/site-domains";
import { WEDDING_PATHS } from "@/lib/wedding/contracts";
import { LEGAL_DOCUMENTS } from "@/lib/seo/legal-alternates";

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

/** Paths that must never be crawled by anyone. */
const PRIVATE_PATHS = [
  "/dashboard",
  "/dashboard/",
  "/admin",
  "/admin/",
  "/api/",
  "/sign-in",
  "/sign-up",
  "/dev/",
];

/**
 * Public marketing URLs on www.guestcam.si that AI crawlers may read.
 *
 * AI crawlers get `Disallow: /` on the main host because album guest pages
 * live at root-level dynamic slugs (/<slug>) and GPTBot & co. ignore
 * X-Robots-Tag. Everything public therefore has to be allow-listed here.
 *
 * Root-level pages use a `$` end anchor (RFC 9309, honoured by Google,
 * OpenAI, Anthropic, Perplexity) so the rule matches the exact page and can
 * never accidentally match an album slug that merely starts with the same
 * text (e.g. "/blog" would otherwise also match "/blogger-wedding").
 * Longest match wins, so "/$" (2 chars) beats "Disallow: /" (1 char).
 */
const AI_MAIN_HOST_ALLOW = [
  // Discovery files
  "/llms.txt",
  "/.well-known/",

  // Homepages — "/hr/" alone does NOT match "/hr", so list them exactly.
  "/$",
  "/hr$",
  "/de$",
  "/en$",

  // Language-prefixed sections (landings, localized blog, wedding package,
  // localized legal/contact/affiliate pages).
  "/sl/",
  "/hr/",
  "/de/",
  "/en/",

  // Slovenian blog (index + posts)
  "/blog$",
  "/blog/",

  // Root-level Slovenian commercial pages
  ...Object.values(WEDDING_PATHS)
    .filter((p) => !/^\/(sl|hr|sr|de|en|es)\//.test(p))
    .map((p) => `${p}$`), // → "/porocni-paket$"
  "/za-podjetja$",
  "/affiliate/apply$",
  "/contact$",

  // Root-level Slovenian legal pages
  ...LEGAL_DOCUMENTS.map((doc) => `/${doc}$`),
];

/**
 * AI crawlers: search/answer bots (cite us in ChatGPT, Perplexity, Claude…)
 * and training crawlers. All get the same allow-list: public marketing
 * content in, album guest pages out.
 *
 * NB: deliberately EXCLUDED from this list are the social link-preview
 * scrapers (FacebookBot / facebookexternalhit, Twitterbot, LinkedInBot,
 * Slackbot, TelegramBot, WhatsApp, Discordbot, Applebot). Blocking those
 * breaks OG link previews when someone shares guestcam.si on social.
 */
const AI_USER_AGENTS = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-Web",
  "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "CCBot",
  "anthropic-ai", "Bytespider", "PetalBot",
  "ImagesiftBot", "Diffbot", "Omgilibot", "Applebot-Extended",
];

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
      // Default rule for every crawler — Google, Bing, etc.
      // Album guest pages (/<slug>) are blocked additionally at the
      // HTTP-header level via X-Robots-Tag in middleware plus per-page
      // noindex meta — they can't be listed here because slugs are dynamic.
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      // AI crawlers: allow-list public marketing pages on the main host,
      // keep album guest pages out. Country marketing hosts (guestcam.rs,
      // guestcam.es) host no albums, so they are fully open.
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: countryMarketingHost ? ["/"] : AI_MAIN_HOST_ALLOW,
        disallow: countryMarketingHost
          ? ["/dashboard", "/admin", "/api/", "/sign-in", "/sign-up"]
          : ["/"],
      })),
    ],
    sitemap: `${publicOrigin}/sitemap.xml`,
    host: publicOrigin,
  };
}
