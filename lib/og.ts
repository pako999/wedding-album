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
export const OG_IMAGE_VERSION = 2;

export const OG_IMAGE_URL =
  `https://guestcam.si/og-image.png?v=${OG_IMAGE_VERSION}`;

export const OG_IMAGE_WIDTH = 910;
export const OG_IMAGE_HEIGHT = 1200;

/** Object form for `openGraph.images`. Accepts a custom alt per-page. */
export function ogImage(alt: string) {
  return {
    url: OG_IMAGE_URL,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt,
    type: "image/png" as const,
  };
}
