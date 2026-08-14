import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/BlogIndexPage";
import { getAllPosts } from "@/lib/blog";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

// Per-request dynamic so the root layout's detectLang() can read the
// middleware-supplied x-pathname header. ISR cache still applies via
// `revalidate`; the route is dynamic-rendered but cached for 1h.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Guestcam",
  description: "Nasveti, vodniki in primerjave za zbiranje fotografij gostov na porokah, rojstnih dneh in dogodkih.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: {
      sl: `${SITE_URL}/blog`,
      hr: `${SITE_URL}/hr/blog`,
      sr: `${SITE_URL}/sr/blog`,
      de: `${SITE_URL}/de/blog`,
      en: `${SITE_URL}/en/blog`,
      es: `${SITE_URL}/es/blog`,
      "x-default": `${SITE_URL}/blog`,
    },
  },
  openGraph: {
    url: `${SITE_URL}/blog`,
    type: "website",
    title: "Blog — Guestcam",
    description: "Nasveti, vodniki in primerjave za zbiranje fotografij gostov.",
    images: [ogImage("Guestcam Blog")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Guestcam",
    description: "Nasveti, vodniki in primerjave za zbiranje fotografij gostov.",
    images: [OG_IMAGE_URL],
  },
  robots: { index: true, follow: true },
};

export default async function BlogIndex() {
  const posts = await getAllPosts("sl");
  return <BlogIndexPage posts={posts} lang="sl" />;
}
