import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndexPage } from "@/components/BlogIndexPage";
import { getAllPosts } from "@/lib/blog";
import type { LangCode } from "@/components/LanguageSwitcher";

export const dynamic = "force-static";
export const revalidate = 3600;

const VALID: LangCode[] = ["hr", "sr", "de", "en", "es"];
const ALL_LANGS: LangCode[] = ["sl", "hr", "sr", "de", "en", "es"];

export async function generateStaticParams() {
  return VALID.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!(VALID as string[]).includes(lang)) return {};
  const langCode = lang as LangCode;

  const titles: Record<LangCode, string> = {
    sl: "Blog — Guestcam", hr: "Blog — Guestcam", sr: "Blog — Guestcam",
    de: "Blog — Guestcam", en: "Blog — Guestcam", es: "Blog — Guestcam",
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
      canonical: `https://guestcam.si/${langCode}/blog`,
      languages: Object.fromEntries(
        ALL_LANGS.map((l) => [l, l === "sl" ? "https://guestcam.si/blog" : `https://guestcam.si/${l}/blog`]),
      ),
    },
    openGraph: { type: "website", locale: langCode, title: titles[langCode], description: descriptions[langCode] },
    robots: { index: true, follow: true },
  };
}

export default async function LangBlogIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!(VALID as string[]).includes(lang)) notFound();
  const langCode = lang as LangCode;
  const posts = await getAllPosts(langCode);
  return <BlogIndexPage posts={posts} lang={langCode} />;
}
