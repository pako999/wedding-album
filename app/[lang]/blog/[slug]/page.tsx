import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/BlogPostPage";
import { getAllSlugs, getPost, getTranslationMap, blogUrl } from "@/lib/blog";
import type { LangCode } from "@/components/LanguageSwitcher";

export const dynamic = "force-static";
export const revalidate = 3600;

const VALID: LangCode[] = ["hr", "sr", "de", "en", "es"];

export async function generateStaticParams() {
  const out: { lang: string; slug: string }[] = [];
  for (const lang of VALID) {
    const slugs = await getAllSlugs(lang);
    for (const slug of slugs) out.push({ lang, slug });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!(VALID as string[]).includes(lang)) return {};
  const langCode = lang as LangCode;
  const post = await getPost(langCode, slug);
  if (!post) return {};
  const languages = await getTranslationMap(post.translationKey);
  const canonical = `https://guestcam.si${blogUrl(langCode, post.slug)}`;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": languages.en ?? canonical },
    },
    openGraph: {
      type: "article",
      locale: langCode,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
    robots: { index: true, follow: true },
  };
}

export default async function LangBlogPost({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!(VALID as string[]).includes(lang)) notFound();
  const langCode = lang as LangCode;
  const post = await getPost(langCode, slug);
  if (!post) notFound();
  return <BlogPostPage post={post} />;
}
