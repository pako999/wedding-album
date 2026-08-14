import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Blog SEO migration: CamLove is the successor brand. Keep the Guestcam
      // app live, but permanently move every public editorial URL so Google
      // consolidates links/history on camlove.me instead of indexing two copies.
      // Brand-comparison slugs changed from guestcam-* to camlove-* and need
      // direct mappings to avoid an unnecessary second redirect hop.
      { source: "/blog/guestcam-vs-whatsapp-porocne-fotografije", destination: "https://www.camlove.me/blog/camlove-vs-whatsapp-porocne-fotografije", permanent: true },
      { source: "/hr/blog/guestcam-vs-whatsapp-vjencanje-fotografije", destination: "https://www.camlove.me/hr/blog/camlove-vs-whatsapp-vjencanje-fotografije", permanent: true },
      { source: "/sr/blog/guestcam-vs-whatsapp-vencanje-fotografije", destination: "https://www.camlove.me/sr/blog/camlove-vs-whatsapp-vencanje-fotografije", permanent: true },
      { source: "/de/blog/guestcam-vs-whatsapp-hochzeitsfotos", destination: "https://www.camlove.me/de/blog/camlove-vs-whatsapp-hochzeitsfotos", permanent: true },
      { source: "/en/blog/guestcam-vs-whatsapp-wedding-photos", destination: "https://www.camlove.me/en/blog/camlove-vs-whatsapp-wedding-photos", permanent: true },
      { source: "/es/blog/guestcam-vs-whatsapp-fotos-boda", destination: "https://www.camlove.me/es/blog/camlove-vs-whatsapp-fotos-boda", permanent: true },

      { source: "/blog", destination: "https://www.camlove.me/blog", permanent: true },
      { source: "/blog/:path*", destination: "https://www.camlove.me/blog/:path*", permanent: true },
      { source: "/hr/blog", destination: "https://www.camlove.me/hr/blog", permanent: true },
      { source: "/hr/blog/:path*", destination: "https://www.camlove.me/hr/blog/:path*", permanent: true },
      { source: "/sr/blog", destination: "https://www.camlove.me/sr/blog", permanent: true },
      { source: "/sr/blog/:path*", destination: "https://www.camlove.me/sr/blog/:path*", permanent: true },
      { source: "/de/blog", destination: "https://www.camlove.me/de/blog", permanent: true },
      { source: "/de/blog/:path*", destination: "https://www.camlove.me/de/blog/:path*", permanent: true },
      { source: "/en/blog", destination: "https://www.camlove.me/en/blog", permanent: true },
      { source: "/en/blog/:path*", destination: "https://www.camlove.me/en/blog/:path*", permanent: true },
      { source: "/es/blog", destination: "https://www.camlove.me/es/blog", permanent: true },
      { source: "/es/blog/:path*", destination: "https://www.camlove.me/es/blog/:path*", permanent: true },

      { source: "/favicon.ico", destination: "/icon", permanent: false },
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
