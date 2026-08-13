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

      // ── Rebrand: the comparison post carried the old brand in its slug ──
      // 301 (not 302) so the accumulated link equity transfers to the new
      // URL instead of being held at the old one. Delete these only once
      // Search Console shows no impressions left on the old paths.
      { source: "/blog/guestcam-vs-whatsapp-porocne-fotografije",
        destination: "/blog/camlove-vs-whatsapp-porocne-fotografije",       permanent: true },
      { source: "/hr/blog/guestcam-vs-whatsapp-vjencanje-fotografije",
        destination: "/hr/blog/camlove-vs-whatsapp-vjencanje-fotografije",  permanent: true },
      { source: "/sr/blog/guestcam-vs-whatsapp-vencanje-fotografije",
        destination: "/sr/blog/camlove-vs-whatsapp-vencanje-fotografije",   permanent: true },
      { source: "/de/blog/guestcam-vs-whatsapp-hochzeitsfotos",
        destination: "/de/blog/camlove-vs-whatsapp-hochzeitsfotos",         permanent: true },
      { source: "/en/blog/guestcam-vs-whatsapp-wedding-photos",
        destination: "/en/blog/camlove-vs-whatsapp-wedding-photos",         permanent: true },
      { source: "/es/blog/guestcam-vs-whatsapp-fotos-boda",
        destination: "/es/blog/camlove-vs-whatsapp-fotos-boda",             permanent: true },
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
        "camlove.me",
        "www.camlove.me",
        "camlove-*.vercel.app",
        // Kept through the cutover: if the old domain is served directly for
        // a while (rather than 301-ing straight to camlove.me), server
        // actions posted from it would otherwise fail the origin check.
        // Safe to drop once guestcam.si only ever redirects.
        "guestcam.si",
        "www.guestcam.si",
        "guestcam-*.vercel.app",
        "localhost:3000",
        "localhost:3001",
      ],
    },
  },
};

export default nextConfig;
