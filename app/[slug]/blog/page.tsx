import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndexPage } from "@/components/BlogIndexPage";
import { getAllPosts } from "@/lib/blog";
import type { LangCode } from "@/components/LanguageSwitcher";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

// Per-request dynamic so the root layout's detectLang() can read the
// middleware-supplied x-pathname header. Otherwise `force-static`
// prerenders this with empty headers and the root layout defaults
// every /<lang>/blog/* page to lang='sl' — wrong html lang + Slovenian
// cookie banner served to English/German/Spanish/Croatian/Serbian
// visitors. ISR cache still applies via `revalidate`.
export const revalidate = 3600;

const VALID: LangCode[] = ["hr", "sr", "de", "en", "es"];
const ALL_LANGS: LangCode[] = ["sl", "hr", "sr", "de", "en", "es"];

// Outer dynamic segment is named `[slug]` because it's shared with the
// album route at /<slug>; here it's interpreted as a language code.
export async function generateStaticParams() {
  return VALID.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: lang } = await params;
  if (!(VALID as string[]).includes(lang)) return {};
  const langCode = lang as LangCode;

  const titles: Record<LangCode, string> = {
    sl: "Poročni foto blog",
    hr: "Blog o fotografijama s vjenčanja",
    sr: "Blog o fotografijama sa venčanja",
    de: "Hochzeitsfoto-Blog",
    en: "Wedding photo sharing blog",
    es: "Blog de fotos de boda",
  };
  const descriptions: Record<LangCode, string> = {
    sl: "Nasveti in vodniki za zbiranje fotografij gostov.",
    hr: "Savjeti i vodiči za prikupljanje fotografija gostiju.",
    sr: "Saveti i vodiči za prikupljanje fotografija gostiju.",
    de: "Tipps und Anleitungen zum Sammeln von Gästefotos auf Hochzeiten.",
    en: "Tips and guides for collecting wedding guest photos.",
    es: "Consejos y guías para recopilar fotos de los invitados.",
  };

  return {
    title: titles[langCode],
    description: descriptions[langCode],
    alternates: {
      canonical: `https://www.guestcam.si/${langCode}/blog`,
      languages: Object.fromEntries(
        ALL_LANGS.map((l) => [l, l === "sl" ? "https://www.guestcam.si/blog" : `https://www.guestcam.si/${l}/blog`]),
      ),
    },
    openGraph: {
      url: `https://www.guestcam.si/${langCode}/blog`,
      type: "website",
      locale: langCode,
      title: titles[langCode],
      description: descriptions[langCode],
      images: [ogImage(titles[langCode])],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[langCode],
      description: descriptions[langCode],
      images: [OG_IMAGE_URL],
    },
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
