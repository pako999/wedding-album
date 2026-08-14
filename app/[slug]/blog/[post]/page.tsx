import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/BlogPostPage";
import { getAllSlugs, getPost, getTranslationMap, blogUrl } from "@/lib/blog";
import type { LangCode } from "@/components/LanguageSwitcher";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";
import { absoluteUrl } from "@/lib/urls";

// Per-request dynamic — see app/[slug]/blog/page.tsx for the rationale.
export const revalidate = 3600;

const VALID: LangCode[] = ["hr", "sr", "de", "en", "es"];

// Outer segment is `[slug]` (interpreted as a lang); inner segment is
// `[post]` (the blog post slug). Renamed from the original `[lang]/[slug]`
// because Next.js forbids two sibling/nested dynamic segments named `slug`.
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
      // x-default points at Slovenian, matching every other page on the
      // site (homepages, guides, contact, blog index) and the helper in
      // components/seo/EventTopicPage. These two blog routes were the
      // only ones naming English as the site default, which both
      // contradicted the rest of the hreflang graph and left `en` and
      // `x-default` pointing at the same URL — the "more than one page
      // for the same language" finding in the audit.
      // A post that exists in only one language needs no x-default: it
      // would just point at the page's own URL, re-creating the same
      // "one URL, two hreflang codes" pattern this block exists to avoid.
      languages: Object.keys(languages).length > 1
        ? { ...languages, "x-default": languages.sl ?? languages.en ?? canonical }
        : languages,
    },
    openGraph: {
      url: canonical,
      type: "article",
      locale: langCode,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      // Per-post cover wins, otherwise fall back to the brand promo
      // image so the share card stays on-brand instead of going text-only.
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
