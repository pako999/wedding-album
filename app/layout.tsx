import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { clerkLocaleFor } from "@/lib/clerk-locales";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { DiscountBanner } from "@/components/DiscountBanner";
import type { LangCode } from "@/components/LanguageSwitcher";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { SITE_URL } from "@/lib/urls";
import "./globals.css";

/**
 * Google Analytics 4 measurement ID. Hardcoded fallback for prod;
 * overridable via NEXT_PUBLIC_GA_MEASUREMENT_ID if we ever spin up
 * a separate property (staging, beta).
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-NCHGTBTWPF";

/**
 * Meta (Facebook) Pixel ID. Cookiebot's auto-blocking recognises
 * connect.facebook.net and holds the loader until the visitor grants
 * marketing consent — so we do NOT need a manual consent gate around
 * the init/track calls; they're safe to render on every page.
 */
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1857190351911563";

const SUPPORTED_LANGS: LangCode[] = ["sl", "hr", "sr", "de", "en", "es"];

/** Detect the visitor's UI language from the request URL so Clerk's
 *  sign-in / sign-up flows render in the same language as the
 *  surrounding page. Middleware sets x-pathname; we fall back to
 *  parsing the standard "next-url" / "referer" headers. */
async function detectLang(): Promise<LangCode> {
  try {
    const h = await headers();
    const path =
      h.get("x-pathname") ??
      h.get("next-url") ??
      new URL(h.get("referer") ?? "https://www.guestcam.si").pathname;
    const first = path.split("/").filter(Boolean)[0] ?? "";
    if ((SUPPORTED_LANGS as string[]).includes(first)) {
      return first as LangCode;
    }
  } catch {
    // header unavailable — fall through
  }
  return "sl";
}

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)",  color: "#0F1729" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Optimized against the SL SERP for "QR koda za poroko" — there's
    // no clear competitor on that query, so leading with the exact
    // phrase puts us in the strongest position for cold organic.
    // Template applies to child routes that set their own string title
    // (blog posts, legal pages); the homepage uses `default` directly,
    // which is NOT wrapped by the template.
    default: "QR koda za dogodke • Fotografije gostov v živo | Guestcam",
    template: "%s | Guestcam",
  },
  description:
    "Z eno QR kodo zberite vse fotografije in videe gostov v zasebni galeriji. Brez aplikacije, polna kakovost, brezplačen začetek. Za poroke in dogodke.",
  applicationName: "Guestcam",
  keywords: [
    "QR koda za poroko",
    "poročni album",
    "zbiranje fotografij gostov",
    "deljenje fotografij",
    "galerija dogodka",
    "Guestcam",
  ],
  authors: [{ name: "Guestcam" }],
  manifest: "/manifest.json",
  // Explicit SVG icon — Google accepts SVG with no size restriction.
  // The 48×48 PNG is auto-added by Next.js from app/icon.tsx.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  // Site is live — individual private routes (albums, dashboard, etc.) override
  // this with their own noindex where appropriate.
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Guestcam",
    locale: "sl_SI",
    url: SITE_URL,
    title: "QR koda za dogodke • Fotografije gostov v živo | Guestcam",
    description:
      "Z eno QR kodo zberite vse fotografije in videe gostov v zasebni galeriji. Brez aplikacije, polna kakovost, brezplačen začetek. Za poroke in dogodke.",
    // Social link-preview image. iMessage, WhatsApp, Slack, Facebook,
    // LinkedIn and Telegram all read OG image tags; without an
    // `images:` entry they render a text-only card (which is what
    // the user's iMessage screenshot showed). Versioned filename
    // (?v=) busts the Facebook/Twitter scrape cache when we update
    // the image; without it, the old "no image" version sticks for
    // weeks because crawlers cache aggressively.
    images: [
      {
        url: "/og-image.png?v=2",
        width: 910,
        height: 1200,
        alt: "QR koda za dogodke • Fotografije gostov v živo | Guestcam",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR koda za dogodke • Fotografije gostov v živo | Guestcam",
    description:
      "Z eno QR kodo zberite vse fotografije in videe gostov v zasebni galeriji. Brez aplikacije, polna kakovost, brezplačen začetek.",
    images: ["/og-image.png?v=2"],
  },
};

/** Returns true if the visitor has at least one paid album (basic/plus/premium). */
async function checkHasPaidPlan(userId: string): Promise<boolean> {
  try {
    const row = await db.query.albums.findFirst({
      columns: { id: true },
      where: and(eq(albums.ownerClerkId, userId), ne(albums.plan, "free")),
    });
    return !!row;
  } catch {
    return false;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await detectLang();
  const clerkLocalization = clerkLocaleFor(lang);

  // Only show promo banners on public marketing pages to visitors
  // who have not yet purchased a plan.
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  // Affiliate paths are matched in any locale: /affiliate/*, /hr/affiliate/*,
  // /sr/affiliate/*, etc. The discount banner + exit popup are for paying
  // customers; partners are a different audience and the offer doesn't
  // apply to them.
  const isAffiliatePath = /^\/(?:sl|hr|sr|de|en|es)?\/?affiliate(?:\/|$)/.test(pathname);

  // Album guest pages live at /<slug>. Owners have already paid, guests
  // don't need to see a "15% off your first plan" pitch when they're
  // opening a wedding gallery. Mirrors middleware.ts isAlbumGuestPath.
  const isAlbumGuestPath = (() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length !== 1) return false;
    const RESERVED = new Set([
      "blog", "contact", "privacy", "terms", "gdpr", "cookies", "refund",
      "admin", "dashboard", "api", "sign-in", "sign-up", "dev", "affiliate",
      "sl", "hr", "sr", "de", "en", "es",
    ]);
    return !RESERVED.has(segments[0]);
  })();

  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    isAffiliatePath ||
    isAlbumGuestPath;

  let showPromo = !isProtectedPath;
  if (showPromo) {
    const { userId } = await auth();
    if (userId) {
      const paid = await checkHasPaidPlan(userId);
      if (paid) showPromo = false;
    }
  }

  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang={lang} className={`${dmSans.variable} ${cormorant.variable}`}>
        <body className="font-sans antialiased bg-[#F2F4F8] text-[#0F1729] min-h-screen">
          {/* Preconnect hints — trim ~100-300 ms off TLS handshake for the
              third-party scripts we KNOW will load on every page. Next.js
              hoists these to <head> automatically. */}
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://consent.cookiebot.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          {META_PIXEL_ID && <link rel="dns-prefetch" href="https://connect.facebook.net" />}

          {/* Cookiebot — must be beforeInteractive so auto-blocking mode can
              intercept GA and any other third-party scripts before they fire. */}
          <Script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid="d27e2582-e0d4-4963-bf86-ffdf25bc79fd"
            data-blockingmode="auto"
            strategy="beforeInteractive"
          />
          {showPromo && <DiscountBanner lang={lang} />}
          {children}
          {showPromo && <ExitIntentPopup lang={lang} />}
          {GA_ID && (
            <>
              <Script
                id="ga-loader"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="ga-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  window.gtag = gtag;
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `}
              </Script>
            </>
          )}
          {/* Meta Pixel — Cookiebot's auto-blocking mode intercepts the
              fbevents.js request until the visitor grants marketing consent,
              so the queued fbq('init') / fbq('track') calls only actually
              hit Facebook after consent. Wrap the noscript img with the
              Cookiebot marketing marker so that fallback is also gated. */}
          {META_PIXEL_ID && (
            <>
              <Script id="meta-pixel" strategy="afterInteractive">
                {`
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${META_PIXEL_ID}');
                  fbq('track', 'PageView');
                `}
              </Script>
              <noscript>
                <img
                  height="1"
                  width="1"
                  style={{ display: "none" }}
                  alt=""
                  data-cookieconsent="marketing"
                  src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                />
              </noscript>
            </>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
