import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/BlogPostPage";
import { getAllSlugs, getPost, getTranslationMap, blogUrl } from "@/lib/blog";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

// Per-request dynamic — see app/blog/page.tsx for the rationale.
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllSlugs("sl");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost("sl", slug);
  if (!post) return {};
  const languages = await getTranslationMap(post.translationKey);
  const canonical = `https://www.guestcam.si${blogUrl("sl", post.slug)}`;
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
      type: "article",
      url: canonical,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      // Per-post cover wins, otherwise the brand promo image keeps
      // the share card on-brand instead of falling back to text-only.
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

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost("sl", slug);
  if (!post) notFound();
  return <BlogPostPage post={post} />;
}
