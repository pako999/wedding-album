import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/BlogIndexPage";
import { getAllPosts } from "@/lib/blog";

// Per-request dynamic so the root layout's detectLang() can read the
// middleware-supplied x-pathname header. ISR cache still applies via
// `revalidate`; the route is dynamic-rendered but cached for 1h.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Guestcam",
  description: "Nasveti, vodniki in primerjave za zbiranje fotografij gostov na porokah, rojstnih dneh in dogodkih.",
  alternates: {
    canonical: "https://guestcam.si/blog",
    languages: {
      sl: "https://guestcam.si/blog",
      hr: "https://guestcam.si/hr/blog",
      sr: "https://guestcam.si/sr/blog",
      de: "https://guestcam.si/de/blog",
      en: "https://guestcam.si/en/blog",
      es: "https://guestcam.si/es/blog",
      "x-default": "https://guestcam.si/blog",
    },
  },
  openGraph: {
    type: "website",
    title: "Blog — Guestcam",
    description: "Nasveti, vodniki in primerjave za zbiranje fotografij gostov.",
  },
  robots: { index: true, follow: true },
};

export default async function BlogIndex() {
  const posts = await getAllPosts("sl");
  return <BlogIndexPage posts={posts} lang="sl" />;
}
