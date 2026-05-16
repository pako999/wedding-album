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
  themeColor: "#C9A96E",
};

export const metadata: Metadata = {
  title: {
    default: "Wedding Album | Photos",
    template: "%s | Wedding Album",
  },
  description: "Share and collect your wedding memories.",
  manifest: "/manifest.json",
  openGraph: {
    siteName: "Wedding Album by WedFlow",
    type: "website",
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
        <body className="font-sans antialiased bg-[#FAF7F2] text-[#2C2825] min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
