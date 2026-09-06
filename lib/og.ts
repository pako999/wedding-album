import { SITE_URL } from "@/lib/urls";
import {
  SERBIAN_GUESTCAM_ORIGIN,
  SPANISH_GUESTCAM_ORIGIN,
} from "@/lib/site-domains";
/**
 * Single source of truth for the Guestcam social-share card image.
 *
 * Every page that declares its own `openGraph` (or `twitter`) metadata
 * REPLACES the parent layout's openGraph block (Next.js does not
 * deep-merge image arrays into a child's openGraph) — so each page
 * that overrides needs to re-state the image. This module saves us
 * from copy-pasting the same object literal a dozen times and gives
 * us one place to bump the `?v=` cache-buster when the image changes.
 *
 * Bump the version when the image bytes change so Facebook, iMessage,
 * WhatsApp, Slack, LinkedIn, etc. re-scrape instead of serving the
 * cached old card.
 */
export const OG_IMAGE_VERSION = 3;

export const OG_IMAGE_URL =
  `${SITE_URL}/og-image.png?v=${OG_IMAGE_VERSION}`;

/** Social cards must match the language of the country domain being shared. */
export function localizedOgImageUrl(locale: string): string {
  if (locale === "sr") {
    return `${SERBIAN_GUESTCAM_ORIGIN}/og-image-sr.jpg?v=${OG_IMAGE_VERSION}`;
  }
  if (locale === "es") {
    return `${SPANISH_GUESTCAM_ORIGIN}/og-image-es.jpg?v=${OG_IMAGE_VERSION}`;
  }
  return OG_IMAGE_URL;
}

export const OG_IMAGE_WIDTH = 910;
export const OG_IMAGE_HEIGHT = 1200;

/** Object form for `openGraph.images`. Accepts a custom alt per-page. */
export function ogImage(alt: string, locale = "sl") {
  const isCountryCard = locale === "sr" || locale === "es";
  return {
    url: localizedOgImageUrl(locale),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt,
    type: (isCountryCard ? "image/jpeg" : "image/png") as "image/jpeg" | "image/png",
  };
}
