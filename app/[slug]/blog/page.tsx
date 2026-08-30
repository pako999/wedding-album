import { localeAbsoluteUrl, SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndexPage } from "@/components/BlogIndexPage";
import { getAllPosts } from "@/lib/blog";
import type { LangCode } from "@/components/LanguageSwitcher";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";
import { withRegionalHreflang } from "@/lib/seo/hreflang";

export const revalidate = 3600;

const VALID: LangCode[] = ["hr", "sr", "de", "en", "es"];
const ALL_LANGS: LangCode[] = ["sl", "hr", "sr", "de", "en", "es"];
const OG_LOCALE: Record<LangCode, string> = { sl: "sl_SI", hr: "hr_HR", sr: "sr_RS", de: "de_DE", en: "en_GB", es: "es_ES" };

export async function generateStaticParams() {
  return VALID.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: lang } = await params;
  if (!(VALID as string[]).includes(lang)) return {};
  const langCode = lang as LangCode;

  const titles: Record<LangCode, string> = {
    sl: "QR kode, fotografije gostov in ideje za dogodke",
    hr: "QR kodovi, fotografije gostiju i ideje za događaje",
    sr: "QR kodovi, fotografije gostiju i ideje za događaje",
    de: "QR-Codes, Gästefotos und Ideen für Events",
    en: "QR codes, guest photos and event ideas",
    es: "Códigos QR, fotos de invitados e ideas para eventos",
  };
  const descriptions: Record<LangCode, string> = {
    sl: "Praktični vodiči za QR kode, fotografije gostov in dogodke brez aplikacije.",
    hr: "Praktični vodiči za QR kodove, fotografije i videozapise gostiju, privatne galerije i događaje — bez aplikacije.",
    sr: "Praktični vodiči za QR kodove, fotografije i video snimke gostiju, privatne galerije i događaje — bez aplikacije.",
    de: "Praktische Ratgeber zu QR-Codes, Gästefotos und -videos, privaten Galerien und Events — ohne App.",
    en: "Practical guides to QR codes, collecting guest photos and videos, private galleries and events — no app required.",
    es: "Guías prácticas sobre códigos QR, fotos y vídeos de invitados, galerías privadas y eventos — sin app.",
  };

  const languageAlternates = Object.fromEntries(
    ALL_LANGS.map((l) => [l, l === "sl" ? `${SITE_URL}/blog` : `${SITE_URL}/${l}/blog`]),
  );
  const canonical = localeAbsoluteUrl(langCode, `/${langCode}/blog`);

  return {
    title: titles[langCode],
    description: descriptions[langCode],
    alternates: {
      canonical,
      languages: withRegionalHreflang({ ...languageAlternates, "x-default": `${SITE_URL}/blog` }),
    },
    openGraph: {
      url: canonical,
      type: "website",
      locale: OG_LOCALE[langCode],
      title: titles[langCode],
      description: descriptions[langCode],
      images: [ogImage(titles[langCode])],
    },
    twitter: { card: "summary_large_image", title: titles[langCode], description: descriptions[langCode], images: [OG_IMAGE_URL] },
    robots: { index: true, follow: true },
  };
}

export default async function LangBlogIndex({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: lang } = await params;
  if (!(VALID as string[]).includes(lang)) notFound();
  const langCode = lang as LangCode;
  const posts = await getAllPosts(langCode);
  return <BlogIndexPage posts={posts} lang={langCode} />;
}
