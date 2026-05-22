/* eslint-disable no-console */
/**
 * scripts/generate-blog-post.ts
 *
 * Generates a single 6-language blog post from a topic prompt by calling
 * the Anthropic API. Reads the topic from CLI args or pops the head of
 * content/blog/topics-queue.json; writes 6 JSON files under
 * content/blog/<lang>/<slug>.json.
 *
 * Used by the GitHub Action `.github/workflows/weekly-blog.yml`.
 *
 * Run manually:
 *   npx tsx scripts/generate-blog-post.ts "how to print wedding photos"
 *
 * Env vars expected:
 *   ANTHROPIC_API_KEY  — required
 *   ANTHROPIC_MODEL    — optional, defaults to "claude-sonnet-4-6"
 */
import fs from "node:fs/promises";
import path from "node:path";

type Lang = "sl" | "hr" | "sr" | "de" | "en" | "es";
const LANGS: Lang[] = ["sl", "hr", "sr", "de", "en", "es"];

const REPO_ROOT = path.resolve(__dirname, "..");
const QUEUE_PATH = path.join(REPO_ROOT, "content", "blog", "topics-queue.json");
const BLOG_DIR   = path.join(REPO_ROOT, "content", "blog");

interface TopicsQueue { _comment?: string; topics: string[] }

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function getNextTopic(arg: string | undefined): Promise<{ topic: string; popped: boolean }> {
  if (arg && arg.trim().length > 0) return { topic: arg.trim(), popped: false };
  const raw = await fs.readFile(QUEUE_PATH, "utf8");
  const data = JSON.parse(raw) as TopicsQueue;
  const topic = data.topics.shift();
  if (!topic) throw new Error("topics-queue.json is empty — add new topics first");
  await fs.writeFile(QUEUE_PATH, JSON.stringify(data, null, 2) + "\n");
  return { topic, popped: true };
}

async function callClaude(topic: string): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

  const prompt = `You are a wedding-tech content writer for Guestcam (guestcam.si), a QR-code wedding photo gallery SaaS targeting Slovenia + EU markets.

Generate ONE blog post for the topic: "${topic}".

Output strict JSON only — no prose, no markdown fence. Schema:
{
  "translationKey": "<short-slug-like-key>",
  "posts": {
    "sl": { ... single-language post object ... },
    "hr": { ... },
    "sr": { ... },
    "de": { ... },
    "en": { ... },
    "es": { ... }
  }
}

Each single-language post must look like:
{
  "slug": "url-safe-slug-in-that-language",
  "lang": "sl" | "hr" | ...,
  "title": "natural local title with year if relevant",
  "description": "150-character meta description, native phrasing",
  "publishedAt": "${new Date().toISOString().slice(0, 10)}",
  "updatedAt":   "${new Date().toISOString().slice(0, 10)}",
  "author": "Guestcam Team",
  "category": "vodnik" | "primerjava" | "nasvet" | "kontrolni-seznam" | "novice",
  "readingTime": 5,
  "tags": ["…", "…"],
  "tldr": "ONE sentence direct answer — AI engines will quote this.",
  "content": [
    { "type": "h2", "text": "Question-style heading?" },
    { "type": "p",  "text": "First paragraph answers immediately, no preamble." },
    { "type": "ul", "items": ["…"] },
    { "type": "stat", "value": "87%", "label": "of guests take photos at weddings", "source": "The Knot 2025" },
    { "type": "faq", "q": "…", "a": "…" },
    { "type": "cta", "text": "Create your free Guestcam gallery", "href": "/dashboard/new" }
  ]
}

Rules:
- 600–900 words per language.
- H2 headings as full questions ("How do I…?", "What is…?").
- TLDR is a direct answer Perplexity can quote — never starts with "This article…".
- At least 5 "faq" blocks per post.
- At least 1 "stat" block with source if a credible one is known; otherwise omit stat block.
- Each language must use NATIVE phrasing — not translated word-for-word from English.
- The "slug" must be in the target language (sl, hr, sr, de, es) using local search terms.
- Include exactly one "cta" block toward the end.
- Do NOT include any field other than those in the schema.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 16_000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 400)}`);
  }
  const data = (await res.json()) as { content: { type: string; text: string }[] };
  const text = data.content?.find((c) => c.type === "text")?.text ?? "";
  // Strip any accidental markdown fence
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

async function writePosts(payload: { translationKey: string; posts: Record<Lang, Record<string, unknown>> }) {
  for (const lang of LANGS) {
    const post = payload.posts[lang];
    if (!post) {
      console.warn(`[skip] no post returned for lang=${lang}`);
      continue;
    }
    // Force translationKey + lang consistency in case the model drifted
    (post as { translationKey?: string }).translationKey = payload.translationKey;
    (post as { lang?: string }).lang = lang;
    const slug = String((post as { slug?: string }).slug ?? slugify(payload.translationKey));
    (post as { slug?: string }).slug = slug;

    const dir = path.join(BLOG_DIR, lang);
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${slug}.json`);
    await fs.writeFile(file, JSON.stringify(post, null, 2) + "\n");
    console.log(`✓ wrote ${path.relative(REPO_ROOT, file)}`);
  }
}

async function main() {
  const cliTopic = process.argv[2];
  const { topic } = await getNextTopic(cliTopic);
  console.log(`→ generating: "${topic}"`);
  const payload = (await callClaude(topic)) as { translationKey: string; posts: Record<Lang, Record<string, unknown>> };
  if (!payload?.translationKey || typeof payload.translationKey !== "string") {
    throw new Error("Generation returned no translationKey");
  }
  payload.translationKey = slugify(payload.translationKey);
  await writePosts(payload);
  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
