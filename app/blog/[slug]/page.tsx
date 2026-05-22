import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/BlogPostPage";
import { getAllSlugs, getPost, getTranslationMap, blogUrl } from "@/lib/blog";

export const dynamic = "force-static";
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
  const canonical = `https://guestcam.si${blogUrl("sl", post.slug)}`;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": languages.en ?? canonical },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.coverImage ? [{ url: post.coverImage, alt: post.coverAlt ?? post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : undefined,
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
