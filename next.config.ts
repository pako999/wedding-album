import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
