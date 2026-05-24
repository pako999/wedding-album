import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkLocaleFor } from "@/lib/clerk-locales";
import { CookieConsent } from "@/components/CookieConsent";
import type { LangCode } from "@/components/LanguageSwitcher";
import "./globals.css";

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
    default: "Guestcam — Zberite fotografije gostov z eno QR kodo",
    template: "%s | Guestcam",
  },
  description:
    "Z eno QR kodo zberite vse fotografije in videe gostov v eni zasebni galeriji. Brez aplikacije, v polni kakovosti.",
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
  // Site is live — individual private routes (albums, dashboard, etc.) override
  // this with their own noindex where appropriate.
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Guestcam",
    locale: "sl_SI",
    url: SITE_URL,
    title: "Guestcam — Zberite fotografije gostov z eno QR kodo",
    description:
      "Z eno QR kodo zberite vse fotografije in videe gostov v eni zasebni galeriji. Brez aplikacije, v polni kakovosti.",
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
        alt: "Guestcam — Zberite fotografije gostov z eno QR kodo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestcam — Zberite fotografije gostov z eno QR kodo",
    description:
      "Z eno QR kodo zberite vse fotografije in videe gostov v eni zasebni galeriji.",
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
          <CookieConsent lang={lang} />
        </body>
      </html>
    </ClerkProvider>
  );
}
