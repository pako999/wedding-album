import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/BlogPostPage";
import { getAllSlugs, getPost, getTranslationMap, blogUrl } from "@/lib/blog";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";
import { absoluteUrl } from "@/lib/urls";

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
  const canonical = absoluteUrl(blogUrl("sl", post.slug));
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
      type: "article",
      url: canonical,
      locale: "sl_SI",
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

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost("sl", slug);
  if (!post) notFound();
  return <BlogPostPage post={post} />;
}
