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
  themeColor: "#C4738A",
};

export const metadata: Metadata = {
  title: {
    default: "Guestcam",
    template: "%s | Guestcam",
  },
  description: "Share and collect your wedding memories with Guestcam.",
  manifest: "/manifest.json",
  robots: { index: false, follow: false },
  openGraph: {
    siteName: "Guestcam",
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
