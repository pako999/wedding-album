import type { Metadata } from "next";
import { blogSlugParams, blogPostMetadata, BlogPostFor } from "@/lib/blogRoutes";

export const revalidate = 3600;

export async function generateStaticParams() {
  return blogSlugParams("es");
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  return blogPostMetadata("es", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return BlogPostFor("es", slug);
}
