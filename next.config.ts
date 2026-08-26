import type { NextConfig } from "next";

const APP_ORIGIN = "https://www.guestcam.si";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Guestcam is the canonical production site/app. Do not allow an inherited
  // deployment environment variable to make public links or callbacks point
  // back to the retired CamLove domains.
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NODE_ENV === "development"
        ? (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
        : APP_ORIGIN,
  },
  async redirects() {
    return [
      // /favicon.ico → Next.js dynamic icon route so Google finds a favicon
      // at the conventional path (in addition to the <link rel="icon"> tag).
      { source: "/favicon.ico", destination: "/icon", permanent: false },
      // Slovenian-language URL aliases for legal pages.
      { source: "/pogoji", destination: "/terms", permanent: false },
      { source: "/zasebnost", destination: "/privacy", permanent: false },
      { source: "/piskotki", destination: "/cookies", permanent: false },
      { source: "/vracilo", destination: "/refund", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
      // Bunny CDN pull zone
      { protocol: "https", hostname: "frfr1.b-cdn.net" },
      { protocol: "https", hostname: "*.b-cdn.net" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "guestcam.si",
        "www.guestcam.si",
        "guestcam.es",
        "www.guestcam.es",
        "guestcam.me",
        "www.guestcam.me",
        "guestcam-*.vercel.app",
        "localhost:3000",
        "localhost:3001",
      ],
    },
  },
};

export default nextConfig;
