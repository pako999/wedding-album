"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { FB_PIXEL_ID, pageview } from "@/lib/fbpixel";

/**
 * Cookiebot exposes consent state on `window.Cookiebot.consent`. We watch
 * for the accept/decline events so we can (re)load the pixel the moment
 * the visitor grants marketing consent — not just on the next full page
 * load. Two nuances that make this work with Cookiebot's auto-blocking:
 *
 *   • Cookiebot ALSO auto-blocks the fbevents.js network request based
 *     on its recognised-tracker list, so this component's `if (!consent)
 *     return null` check is defence-in-depth, not the only barrier.
 *   • We must guard against the case where Cookiebot hasn't finished
 *     loading yet (`window.Cookiebot` undefined) — we assume NOT consented
 *     until proven otherwise, which is the GDPR-safe default.
 */
declare global {
  interface Window {
    Cookiebot?: {
      consent?: { marketing?: boolean };
    };
  }
}

export default function MetaPixel() {
  const pathname = usePathname();
  const [consent, setConsent] = useState(false);

  // Read initial state + subscribe to Cookiebot events.
  useEffect(() => {
    const sync = () => setConsent(!!window.Cookiebot?.consent?.marketing);
    sync();
    window.addEventListener("CookiebotOnAccept", sync);
    window.addEventListener("CookiebotOnDecline", sync);
    window.addEventListener("CookiebotOnLoad", sync);
    return () => {
      window.removeEventListener("CookiebotOnAccept", sync);
      window.removeEventListener("CookiebotOnDecline", sync);
      window.removeEventListener("CookiebotOnLoad", sync);
    };
  }, []);

  // Fire PageView on every client-side route change (once consent is on).
  // The initial PageView is inside the inline `fbq('track','PageView')`
  // in the loader script below; this hook only handles SUBSEQUENT SPA
  // navigations. Firing it on the first render would double-count.
  useEffect(() => {
    if (consent && window.fbq) pageview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!FB_PIXEL_ID || !consent) return null;

  return (
    <>
      <Script id="fb-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
