import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkLocaleFor } from "@/lib/clerk-locales";
import type { LangCode } from "@/components/LanguageSwitcher";
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
 *  surrounding page. Middleware sets x-pathname; we fall back to
 *  parsing the standard "next-url" / "referer" headers. */
async function detectLang(): Promise<LangCode> {
  try {
    const h = await headers();
    const path =
      h.get("x-pathname") ??
      h.get("next-url") ??
      new URL(h.get("referer") ?? "https://guestcam.si").pathname;
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
  themeColor: "#C9820A",
};

const SITE_URL = "https://guestcam.si";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await detectLang();
  const clerkLocalization = clerkLocaleFor(lang);

  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang={lang} className={`${dmSans.variable} ${cormorant.variable}`}>
        <body className="font-sans antialiased bg-[#F2F4F8] text-[#0F1729] min-h-screen">
          {children}
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
                  gtag('config', '${GA_ID}', { anonymize_ip: true });
                `}
              </Script>
            </>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
