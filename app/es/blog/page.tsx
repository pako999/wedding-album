import type { Metadata } from "next";
import { blogIndexMetadata, BlogIndexFor } from "@/lib/blogRoutes";

export const revalidate = 3600;
export const metadata: Metadata = blogIndexMetadata("es");

export default function Page() {
  return BlogIndexFor("es");
}
