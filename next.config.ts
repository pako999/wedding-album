import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/icon", permanent: false },
      { source: "/pogoji", destination: "/terms", permanent: false },
      { source: "/zasebnost", destination: "/privacy", permanent: false },
      { source: "/piskotki", destination: "/cookies", permanent: false },
      { source: "/vracilo", destination: "/refund", permanent: false },
      { source: "/blog/guestcam-vs-whatsapp-porocne-fotografije", destination: "/blog/camlove-vs-whatsapp-porocne-fotografije", permanent: true },
      { source: "/hr/blog/guestcam-vs-whatsapp-vjencanje-fotografije", destination: "/hr/blog/camlove-vs-whatsapp-vjencanje-fotografije", permanent: true },
      { source: "/sr/blog/guestcam-vs-whatsapp-vencanje-fotografije", destination: "/sr/blog/camlove-vs-whatsapp-vencanje-fotografije", permanent: true },
      { source: "/de/blog/guestcam-vs-whatsapp-hochzeitsfotos", destination: "/de/blog/camlove-vs-whatsapp-hochzeitsfotos", permanent: true },
      { source: "/en/blog/guestcam-vs-whatsapp-wedding-photos", destination: "/en/blog/camlove-vs-whatsapp-wedding-photos", permanent: true },
      { source: "/es/blog/guestcam-vs-whatsapp-fotos-boda", destination: "/es/blog/camlove-vs-whatsapp-fotos-boda", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "frfr1.b-cdn.net" },
      { protocol: "https", hostname: "*.b-cdn.net" },
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/pako999/wedding-album/**" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "camlove.me",
        "www.camlove.me",
        "camlove-*.vercel.app",
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
