import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndexPage } from "@/components/BlogIndexPage";
import { BlogPostPage } from "@/components/BlogPostPage";
import {
  getAllPosts,
  getAllSlugs,
  getPost,
  getTranslationMap,
  blogUrl,
} from "@/lib/blog";
import type { LangCode } from "@/components/LanguageSwitcher";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

/**
 * Shared blog-route logic for the per-language static routes
 * (app/<lang>/blog/...). Previously the non-default languages lived under
 * a dynamic app/[lang]/blog, but a root-level dynamic segment named
 * `[lang]` collides with the album route `app/[slug]` ("you cannot use
 * different slug names for the same dynamic path"). Each language now has
 * its own static folder and calls these helpers with a fixed lang.
 */

const ALL_LANGS: LangCode[] = ["sl", "hr", "sr", "de", "en", "es"];

const TITLES: Record<LangCode, string> = {
  sl: "Blog — Guestcam", hr: "Blog — Guestcam", sr: "Blog — Guestcam",
  de: "Blog — Guestcam", en: "Blog — Guestcam", es: "Blog — Guestcam",
};
const DESCRIPTIONS: Record<LangCode, string> = {
  sl: "Nasveti in vodniki za zbiranje fotografij gostov.",
  hr: "Savjeti i vodiči za prikupljanje fotografija gostiju.",
  sr: "Saveti i vodiči za prikupljanje fotografija gostiju.",
  de: "Tipps und Anleitungen zum Sammeln von Gästefotos auf Hochzeiten.",
  en: "Tips and guides for collecting wedding guest photos.",
  es: "Consejos y guías para recopilar fotos de los invitados.",
};

export function blogIndexMetadata(lang: LangCode): Metadata {
  return {
    title: TITLES[lang],
    description: DESCRIPTIONS[lang],
    alternates: {
      canonical: `https://guestcam.si/${lang}/blog`,
      languages: Object.fromEntries(
        ALL_LANGS.map((l) => [l, l === "sl" ? "https://guestcam.si/blog" : `https://guestcam.si/${l}/blog`]),
      ),
    },
    openGraph: {
      type: "website",
      locale: lang,
      title: TITLES[lang],
      description: DESCRIPTIONS[lang],
      images: [ogImage(TITLES[lang])],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLES[lang],
      description: DESCRIPTIONS[lang],
      images: [OG_IMAGE_URL],
    },
    robots: { index: true, follow: true },
  };
}

export async function BlogIndexFor(lang: LangCode) {
  const posts = await getAllPosts(lang);
  return <BlogIndexPage posts={posts} lang={lang} />;
}

export async function blogSlugParams(lang: LangCode) {
  const slugs = await getAllSlugs(lang);
  return slugs.map((slug) => ({ slug }));
}

export async function blogPostMetadata(lang: LangCode, slug: string): Promise<Metadata> {
  const post = await getPost(lang, slug);
  if (!post) return {};
  const languages = await getTranslationMap(post.translationKey);
  const canonical = `https://guestcam.si${blogUrl(lang, post.slug)}`;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": languages.en ?? canonical },
    },
    openGraph: {
      type: "article",
      locale: lang,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.coverImage
        ? [{ url: post.coverImage, alt: post.coverAlt ?? post.title }]
        : [ogImage(post.title)],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : [OG_IMAGE_URL],
    },
    robots: { index: true, follow: true },
  };
}

export async function BlogPostFor(lang: LangCode, slug: string) {
  const post = await getPost(lang, slug);
  if (!post) notFound();
  return <BlogPostPage post={post} />;
}
