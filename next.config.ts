import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /favicon.ico → Next.js dynamic icon route so Google finds a favicon
      // at the conventional path (in addition to the <link rel="icon"> tag).
      { source: "/favicon.ico", destination: "/icon", permanent: false },
      // Slovenian-language URL aliases for legal pages
      { source: "/pogoji",     destination: "/terms",   permanent: false },
      { source: "/zasebnost",  destination: "/privacy", permanent: false },
      { source: "/piskotki",   destination: "/cookies", permanent: false },
      { source: "/vracilo",    destination: "/refund",  permanent: false },
      { source: "/gdpr",       destination: "/gdpr",    permanent: false },
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
        "guestcam.me",
        "guestcam-*.vercel.app",
        "localhost:3000",
        "localhost:3001",
      ],
    },
  },
};

export default nextConfig;
