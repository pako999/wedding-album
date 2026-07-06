/**
 * Meta (Facebook) Pixel helpers.
 *
 * The pixel snippet in `components/MetaPixel.tsx` installs `window.fbq`
 * as a queueing shim before the real fbevents.js loads, so we can safely
 * call `pageview()` and `fbEvent()` even during hydration — anything
 * queued is flushed once the loader lands.
 *
 * Consent gating happens in `<MetaPixel />` (Cookiebot marketing
 * consent). If the visitor never consents, `window.fbq` is not
 * installed at all, so these helpers no-op via the `?.()` guard.
 */

export const FB_PIXEL_ID = (process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "1857190351911563") as string;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const pageview = () => {
  window.fbq?.("track", "PageView");
};

/**
 * Fire a standard Meta Pixel event.
 *
 * @param name    Standard event name: 'Purchase', 'Lead',
 *                'InitiateCheckout', 'CompleteRegistration', etc.
 * @param options Event params (value, currency, content_name, …).
 * @param eventId Optional dedup id — Meta uses this to de-dup with
 *                Conversions API server-side events on the same order.
 */
export const fbEvent = (
  name: string,
  options: Record<string, unknown> = {},
  eventId?: string,
) => {
  if (eventId) {
    window.fbq?.("track", name, options, { eventID: eventId });
  } else {
    window.fbq?.("track", name, options);
  }
};
