import fs from "node:fs/promises";
import path from "node:path";
import type { LangCode } from "@/components/LanguageSwitcher";

/**
 * JSON-driven blog. Each post is a single file under
 * content/blog/<lang>/<slug>.json conforming to the BlogPost shape.
 * The content array is intentionally simple (typed blocks) so it
 * can be generated and serialized by the weekly auto-gen script
 * without needing a separate authoring tool.
 */

export type BlogCategory = "vodnik" | "primerjava" | "nasvet" | "kontrolni-seznam" | "novice";

export type BlogBlock =
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; text: string }
  | { type: "stat"; value: string; label: string; source?: string }
  | { type: "faq"; q: string; a: string }
  | { type: "cta"; text: string; href: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface BlogPost {
  slug: string;
  lang: LangCode;
  title: string;
  description: string;
  /** Cross-language link: every post has a canonical slug-key that all
   *  language versions share so we can build the hreflang ring. */
  translationKey: string;
  publishedAt: string;   // ISO date
  updatedAt: string;     // ISO date
  author: string;
  category: BlogCategory;
  readingTime: number;   // minutes
  tags: string[];
  /** One-sentence direct answer Perplexity / SGE can quote */
  tldr: string;
  content: BlogBlock[];
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/** Load every published post for a given UI language, newest first. */
export async function getAllPosts(lang: LangCode): Promise<BlogPost[]> {
  const dir = path.join(BLOG_DIR, lang);
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const posts: BlogPost[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      posts.push(JSON.parse(raw) as BlogPost);
    } catch {
      // Skip malformed file rather than break the whole index
    }
  }
  return posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/** Load a single post by slug for a given language. Returns null if missing. */
export async function getPost(lang: LangCode, slug: string): Promise<BlogPost | null> {
  const file = path.join(BLOG_DIR, lang, `${slug}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as BlogPost;
  } catch {
    return null;
  }
}

/** List every slug in a language — used by generateStaticParams. */
export async function getAllSlugs(lang: LangCode): Promise<string[]> {
  const dir = path.join(BLOG_DIR, lang);
  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}

/** Across all languages, find the URL a given translationKey resolves to. */
export async function getTranslationMap(translationKey: string): Promise<Partial<Record<LangCode, string>>> {
  const langs: LangCode[] = ["sl", "hr", "sr", "de", "en", "es"];
  const out: Partial<Record<LangCode, string>> = {};
  for (const lang of langs) {
    const posts = await getAllPosts(lang);
    const match = posts.find((p) => p.translationKey === translationKey);
    if (match) {
      const path = lang === "sl" ? `/blog/${match.slug}` : `/${lang}/blog/${match.slug}`;
      out[lang] = `https://guestcam.si${path}`;
    }
  }
  return out;
}

/** Up to N related posts in the same language (same category preferred). */
export async function getRelatedPosts(post: BlogPost, n = 3): Promise<BlogPost[]> {
  const all = await getAllPosts(post.lang);
  const sameLang = all.filter((p) => p.slug !== post.slug);
  const sameCat  = sameLang.filter((p) => p.category === post.category);
  const fillers  = sameLang.filter((p) => p.category !== post.category);
  return [...sameCat, ...fillers].slice(0, n);
}

/** Convert a heading to a URL-safe id for anchor links / TOC. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Public URL builder. */
export function blogUrl(lang: LangCode, slug?: string): string {
  const prefix = lang === "sl" ? "/blog" : `/${lang}/blog`;
  return slug ? `${prefix}/${slug}` : prefix;
}
