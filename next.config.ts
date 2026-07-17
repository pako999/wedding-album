import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      // Keep every indexable URL on one permanent canonical origin.
      // Vercel's domain-level redirect should mirror this rule.
      {
        source: "/:path*",
        has: [{ type: "host", value: "guestcam.si" }],
        destination: "https://www.guestcam.si/:path*",
        permanent: true,
      },
      // /favicon.ico → Next.js dynamic icon route so Google finds a favicon
      // at the conventional path (in addition to the <link rel="icon"> tag).
      { source: "/favicon.ico", destination: "/icon", permanent: true },
      // Slovenian-language URL aliases for legal pages
      { source: "/pogoji",     destination: "/terms",   permanent: true },
      { source: "/zasebnost",  destination: "/privacy", permanent: true },
      { source: "/piskotki",   destination: "/cookies", permanent: true },
      { source: "/vracilo",    destination: "/refund",  permanent: true },
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
        "guestcam.me",
        "guestcam-*.vercel.app",
        "localhost:3000",
        "localhost:3001",
      ],
    },
  },
};

export default nextConfig;
