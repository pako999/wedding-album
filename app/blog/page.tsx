import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/BlogIndexPage";
import { getAllPosts } from "@/lib/blog";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const revalidate = 3600;

const title = "QR kode, fotografije gostov in ideje za dogodke";
const description = "Praktični vodiči za QR kode, zbiranje fotografij in videov gostov, zasebne galerije, poroke in dogodke — brez aplikacije in kompliciranja.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: {
      sl: `${SITE_URL}/blog`, hr: `${SITE_URL}/hr/blog`, sr: `${SITE_URL}/sr/blog`,
      de: `${SITE_URL}/de/blog`, en: `${SITE_URL}/en/blog`, es: `${SITE_URL}/es/blog`,
      "x-default": `${SITE_URL}/blog`,
    },
  },
  openGraph: {
    url: `${SITE_URL}/blog`, type: "website", locale: "sl_SI",
    title, description, images: [ogImage("Guestcam vodiči")],
  },
  twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE_URL] },
  robots: { index: true, follow: true },
};

export default async function BlogIndex() {
  const posts = await getAllPosts("sl");
  return <BlogIndexPage posts={posts} lang="sl" />;
}
