import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/BlogIndexPage";
import { getAllPosts } from "@/lib/blog";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

// Per-request dynamic so the root layout's detectLang() can read the
// middleware-supplied x-pathname header. ISR cache still applies via
// `revalidate`; the route is dynamic-rendered but cached for 1h.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Poročni foto blog",
  description: "Nasveti, vodniki in primerjave za zbiranje fotografij gostov na porokah, rojstnih dneh in dogodkih.",
  alternates: {
    canonical: "https://www.guestcam.si/blog",
    languages: {
      sl: "https://www.guestcam.si/blog",
      hr: "https://www.guestcam.si/hr/blog",
      sr: "https://www.guestcam.si/sr/blog",
      de: "https://www.guestcam.si/de/blog",
      en: "https://www.guestcam.si/en/blog",
      es: "https://www.guestcam.si/es/blog",
      "x-default": "https://www.guestcam.si/blog",
    },
  },
  openGraph: {
    url: "https://www.guestcam.si/blog",
    type: "website",
    title: "Poročni foto blog",
    description: "Nasveti, vodniki in primerjave za zbiranje fotografij gostov.",
    images: [ogImage("Guestcam Blog")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Poročni foto blog",
    description: "Nasveti, vodniki in primerjave za zbiranje fotografij gostov.",
    images: [OG_IMAGE_URL],
  },
  robots: { index: true, follow: true },
};

export default async function BlogIndex() {
  const posts = await getAllPosts("sl");
  return <BlogIndexPage posts={posts} lang="sl" />;
}
