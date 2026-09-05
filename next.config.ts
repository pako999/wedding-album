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
      // Older iOS/Safari clients request these conventional filenames even
      // though Next.js publishes the generated image at /apple-icon.
      { source: "/apple-touch-icon.png", destination: "/apple-icon", permanent: false },
      { source: "/apple-touch-icon-precomposed.png", destination: "/apple-icon", permanent: false },
      // Slovenian-language URL aliases for legal pages.
      { source: "/pogoji", destination: "/terms", permanent: false },
      { source: "/zasebnost", destination: "/privacy", permanent: false },
      { source: "/piskotki", destination: "/cookies", permanent: false },
      { source: "/vracilo", destination: "/refund", permanent: false },
      // Preserve the former root-level Slovenian SEO URL and consolidate its
      // ranking signals into the current canonical language-prefixed page.
      { source: "/slike-s-poroke", destination: "/sl/slike-s-poroke", permanent: true },
      // Consolidate duplicate HR/SR wedding-QR guides into one commercial
      // landing page per market so both URLs do not compete in search.
      { source: "/hr/qr-kod-za-vjencanje-kako", destination: "/hr/qr-kod-vjencanje", permanent: true },
      { source: "/sr/qr-kod-za-vencanje-kako", destination: "/sr/qr-kod-vencanje", permanent: true },
      // Preserve links to the retired Croatian video-guide slug by sending
      // them to the closest current guide instead of a dead page.
      { source: "/blog/kako-prikupiti-video-snimke-gostiju-vencanje", destination: "/hr/blog/kako-skupiti-fotografije-gostiju-na-vjencanju", permanent: true },
    ];
  },
  images: {
    // Every width/quality emitted by the album UI must be accepted by the
    // built-in optimizer used for public Bunny S3 display variants.
    deviceSizes: [320, 400, 480, 600, 640, 800, 960, 1200, 1280, 1600, 1800, 1920, 2000, 2048, 2400, 3840],
    qualities: [30, 75, 78, 80, 82, 90],
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
