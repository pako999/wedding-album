"use client";

import { useEffect, useRef } from "react";
import { fbEvent } from "@/lib/fbpixel";

/**
 * Fire a Meta Pixel ViewContent event once when the surrounding section
 * mounts. Renders nothing — drop it inside any server component (e.g.
 * the homepage pricing section) to instrument it without converting the
 * page to a client component.
 *
 * Consent: fbEvent proxies to `window.fbq?.()`, and fbq is only
 * installed after <MetaPixel /> gets Cookiebot marketing consent — so
 * before consent this is a silent no-op, same as PageView.
 *
 * The ref guards against StrictMode double-invoke and re-renders; a new
 * page navigation mounts a fresh instance, which correctly counts as a
 * new view.
 */
export function TrackViewContent({
  name,
  category,
}: {
  name: string;
  category?: string;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fbEvent("ViewContent", {
      content_name: name,
      ...(category ? { content_category: category } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
