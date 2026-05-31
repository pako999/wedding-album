import type { Metadata } from "next";
import { blogSlugParams, blogPostMetadata, BlogPostFor } from "@/lib/blogRoutes";

export const revalidate = 3600;

export async function generateStaticParams() {
  return blogSlugParams("hr");
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  return blogPostMetadata("hr", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return BlogPostFor("hr", slug);
}
