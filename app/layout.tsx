import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
    title: "Guestcam — Zberite fotografije gostov z eno QR kodo",
    description:
      "Z eno QR kodo zberite vse fotografije in videe gostov v eni zasebni galeriji. Brez aplikacije, v polni kakovosti.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestcam — Zberite fotografije gostov z eno QR kodo",
    description:
      "Z eno QR kodo zberite vse fotografije in videe gostov v eni zasebni galeriji.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="sl" className={`${dmSans.variable} ${cormorant.variable}`}>
        <body className="font-sans antialiased bg-[#F2F4F8] text-[#0F1729] min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
