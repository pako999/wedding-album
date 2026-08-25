import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { clerkLocaleFor } from "@/lib/clerk-locales";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { DiscountBanner } from "@/components/DiscountBanner";
import { GuestcamProcessHowOverride } from "@/components/GuestcamProcessHowOverride";
import MetaPixel from "@/components/MetaPixel";
import type { LangCode } from "@/components/LanguageSwitcher";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { SITE_URL } from "@/lib/urls";
import { PRIMARY_ORIGIN, SPANISH_HOST, SPANISH_ORIGIN } from "@/lib/domains";
import "./globals.css";

/**
 * Google Analytics 4 measurement ID. Hardcoded fallback for prod;
 * overridable via NEXT_PUBLIC_GA_MEASUREMENT_ID if we ever spin up
 * a separate property (staging, beta).
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-NCHGTBTWPF";

const SUPPORTED_LANGS: LangCode[] = ["sl", "hr", "sr", "de", "en", "es"];

/** Detect the visitor's UI language from the request URL so Clerk's
 *  sign-in / sign-up flows render in the same language as the
 *  surrounding page. Middleware sets x-pathname and, for country-domain
 *  aliases such as guestcam.es, x-site-locale. */
async function detectLang(): Promise<LangCode> {
  try {
    const h = await headers();
    const forcedLocale = h.get("x-site-locale");
    if (forcedLocale && (SUPPORTED_LANGS as string[]).includes(forcedLocale)) {
      return forcedLocale as LangCode;
    }

    const path =
      h.get("x-pathname") ??
      h.get("next-url") ??
      new URL(h.get("referer") ?? SITE_URL).pathname;
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
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Guestcam",
    locale: "sl_SI",
    url: SITE_URL,
    title: "QR koda za dogodke • Fotografije gostov v živo | Guestcam",
    description:
      "Z eno QR kodo zberite vse fotografije in videe gostov v zasebni galeriji. Brez aplikacije, polna kakovost, brezplačen začetek. Za poroke in dogodke.",
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
  const isAffiliatePath = /^\/(?:sl|hr|sr|de|en|es)?\/?affiliate(?:\/|$)/.test(pathname);

  // Album guest pages live at /<slug>. Owners have already paid, guests
  // don't need to see a promotion when opening a private gallery.
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
    pathname.startsWith("/wall") ||
    isAffiliatePath ||
    isAlbumGuestPath;

  const isPrivateSurface = pathname.startsWith("/wall") || isAlbumGuestPath;

  let showPromo = !isProtectedPath;
  if (showPromo) {
    try {
      const { userId } = await auth();
      if (userId) {
        const paid = await checkHasPaidPlan(userId);
        if (paid) showPromo = false;
      }
    } catch {
      // background revalidation / no middleware context — anonymous view
    }
  }

  return (
    <ClerkProvider
      localization={clerkLocalization}
      // The same Next.js deployment serves the primary .si domain and the
      // Spanish .es satellite. Clerk can decide client-side from the URL.
      isSatellite={(url) => url.hostname === SPANISH_HOST}
      domain={(url) => url.hostname}
      signInUrl={`${PRIMARY_ORIGIN}/sign-in`}
      signUpUrl={`${PRIMARY_ORIGIN}/sign-up`}
      allowedRedirectOrigins={[SPANISH_ORIGIN]}
    >
      <html lang={lang} className={`${dmSans.variable} ${cormorant.variable}`}>
        <body className="font-sans antialiased bg-[#F2F4F8] text-[#0F1729] min-h-screen">
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://consent.cookiebot.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="https://connect.facebook.net" />

          {!isPrivateSurface && (
            <Script
              id="Cookiebot"
              src="https://consent.cookiebot.com/uc.js"
              data-cbid="d27e2582-e0d4-4963-bf86-ffdf25bc79fd"
              data-blockingmode="auto"
              strategy="beforeInteractive"
            />
          )}
          {!isPrivateSurface && <MetaPixel />}
          {showPromo && <DiscountBanner lang={lang} />}
          {children}
          <GuestcamProcessHowOverride />
          {showPromo && <ExitIntentPopup lang={lang} />}
          {GA_ID && !isPrivateSurface && (
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
        </body>
      </html>
    </ClerkProvider>
  );
}
