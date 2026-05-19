import type { MetadataRoute } from "next";

const SITE_URL = "https://guestcam.si";

/**
 * Public sitemap. Lists only marketing / content pages — album galleries
 * and the dashboard are private and intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number }[] = [
    { path: "", priority: 1.0 },
    { path: "/sl/qr-koda-poroka", priority: 0.9 },
    { path: "/hr/qr-kod-vjencanje", priority: 0.8 },
    { path: "/de/hochzeitsfotos-sammeln", priority: 0.8 },
    { path: "/en/wedding-photo-sharing", priority: 0.8 },
    { path: "/en/alternatives", priority: 0.7 },
    { path: "/es/fotos-boda-qr", priority: 0.8 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/gdpr", priority: 0.3 },
    { path: "/cookies", priority: 0.3 },
  ];

  return pages.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
