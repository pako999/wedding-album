import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/BlogPostPage";
import { getAllSlugs, getPost, getTranslationMap, blogUrl } from "@/lib/blog";
import type { LangCode } from "@/components/LanguageSwitcher";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";
import { absoluteUrl } from "@/lib/urls";

export const revalidate = 3600;

const VALID: LangCode[] = ["hr", "sr", "de", "en", "es"];
const OG_LOCALE: Record<LangCode, string> = { sl: "sl_SI", hr: "hr_HR", sr: "sr_RS", de: "de_DE", en: "en_GB", es: "es_ES" };

export async function generateStaticParams() {
  const out: { slug: string; post: string }[] = [];
  for (const lang of VALID) {
    const slugs = await getAllSlugs(lang);
    for (const post of slugs) out.push({ slug: lang, post });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; post: string }> }): Promise<Metadata> {
  const { slug: lang, post: postSlug } = await params;
  if (!(VALID as string[]).includes(lang)) return {};
  const langCode = lang as LangCode;
  const post = await getPost(langCode, postSlug);
  if (!post) return {};
  const languages = await getTranslationMap(post.translationKey);
  const canonical = absoluteUrl(blogUrl(langCode, post.slug));
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical,
      languages: Object.keys(languages).length > 1
        ? { ...languages, "x-default": languages.sl ?? languages.en ?? canonical }
        : languages,
    },
    openGraph: {
      url: canonical,
      type: "article",
      locale: OG_LOCALE[langCode],
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

export default async function LangBlogPost({ params }: { params: Promise<{ slug: string; post: string }> }) {
  const { slug: lang, post: postSlug } = await params;
  if (!(VALID as string[]).includes(lang)) notFound();
  const langCode = lang as LangCode;
  const post = await getPost(langCode, postSlug);
  if (!post) notFound();
  return <BlogPostPage post={post} />;
}
