import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const locales = ["sl", "hr", "sr", "de", "en", "es"];
const legalDocuments = ["privacy", "terms", "gdpr", "cookies", "refund"];
const failures = [];
let checks = 0;

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function walk(relativeDirectory, suffix) {
  const directory = path.join(root, relativeDirectory);
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const results = await Promise.all(entries.map(async (entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) return walk(relativePath, suffix);
    return entry.name.endsWith(suffix) ? [relativePath] : [];
  }));
  return results.flat();
}

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

const blogKeys = new Map();
for (const locale of locales) {
  const directory = `content/blog/${locale}`;
  const filenames = (await fs.readdir(path.join(root, directory)))
    .filter((filename) => filename.endsWith(".json"));
  check(filenames.length > 0, `${directory} has no localized articles`);

  for (const filename of filenames) {
    const relativePath = `${directory}/${filename}`;
    let post;
    try {
      post = JSON.parse(await read(relativePath));
    } catch {
      failures.push(`${relativePath} is not valid JSON`);
      continue;
    }
    check(post.lang === locale, `${relativePath} declares lang=${post.lang ?? "missing"}`);
    check(post.slug === filename.replace(/\.json$/, ""), `${relativePath} slug does not match its filename`);
    check(typeof post.title === "string" && post.title.length > 0, `${relativePath} has no title`);
    check(typeof post.description === "string" && post.description.length > 0, `${relativePath} has no meta description`);
    check(typeof post.translationKey === "string" && post.translationKey.length > 0, `${relativePath} has no translationKey`);
    if (post.translationKey) {
      const translated = blogKeys.get(post.translationKey) ?? new Set();
      translated.add(locale);
      blogKeys.set(post.translationKey, translated);
    }
  }
}

for (const [translationKey, translated] of blogKeys) {
  const missing = locales.filter((locale) => !translated.has(locale));
  check(missing.length === 0, `blog translationKey ${translationKey} is missing: ${missing.join(", ")}`);
}

for (const locale of locales) {
  for (const document of legalDocuments) {
    const relativePath = locale === "sl"
      ? `app/${document}/page.tsx`
      : `app/${locale}/${document}/page.tsx`;
    const source = await read(relativePath);
    check(/title:\s*"[^"\n]+"/.test(source), `${relativePath} has no SEO title`);
    check(/description:\s*"[^"\n]+"/.test(source), `${relativePath} has no SEO description`);
    check(new RegExp(`languages:\\s*legalAlternates\\("${document}"\\)`).test(source), `${relativePath} has no reciprocal legal hreflang cluster`);
    check(/openGraph:\s*\{[\s\S]*?description:\s*"[^"\n]+"/.test(source), `${relativePath} has no Open Graph description`);
    check(/robots:\s*\{\s*index:\s*true,\s*follow:\s*true\s*\}/.test(source), `${relativePath} is not explicitly indexable`);
  }
}

for (const locale of locales.filter((value) => value !== "sl")) {
  const routeFiles = await walk(`app/${locale}`, ".tsx");
  for (const relativePath of routeFiles) {
    const source = await read(relativePath);
    const accountLink = /<(?:Link|a)\b[^>]*\bhref=["']\/(?:dashboard\/new|sign-in|sign-up)["']/g.exec(source);
    check(!accountLink, `${relativePath} contains an account CTA without ?lang=${locale}`);

    const foreignLinkPattern = /<(?:Link|a)\b[^>]*\bhref=["']\/(sl|hr|sr|de|en|es)(?:\/|["'])/g;
    for (const match of source.matchAll(foreignLinkPattern)) {
      check(match[1] === locale, `${relativePath} contains a visible /${match[1]} link on a ${locale} page`);
    }
  }
}

const [proxy, siteDomains, urls, switcher, legalPage, blogPost, og] = await Promise.all([
  read("proxy.ts"),
  read("lib/site-domains.ts"),
  read("lib/urls.ts"),
  read("components/LanguageSwitcher.tsx"),
  read("components/LegalPage.tsx"),
  read("components/BlogPostPage.tsx"),
  read("lib/og.ts"),
]);

check(/x-guestcam-lang/.test(proxy), "proxy does not publish a trusted request locale");
check(/NextResponse\.redirect\([^;]+,\s*308\)/.test(proxy), "country-domain redirects are not permanent");
check(/localizedAccountPath/.test(urls), "account URLs have no explicit locale helper");
check(/guestcam\.rs/.test(siteDomains) && /guestcam\.es/.test(siteDomains), "country domains are missing from the routing source of truth");
for (const [translationKey, translated] of blogKeys) {
  const posts = await Promise.all(locales.map(async (locale) => {
    const filenames = (await fs.readdir(path.join(root, `content/blog/${locale}`))).filter((name) => name.endsWith(".json"));
    for (const filename of filenames) {
      const post = JSON.parse(await read(`content/blog/${locale}/${filename}`));
      if (post.translationKey === translationKey) return `/${locale}/blog/${post.slug}`;
    }
    return null;
  }));
  check(translated.size === locales.length && posts.every((route) => route && siteDomains.includes(route)), `blog translation cluster ${translationKey} is missing from country redirect routing`);
}
check(/CONTACT_HREFLANG/.test(switcher), "contact language switcher has no equivalent-page map");
check(/legalAlternates\(kind\)/.test(legalPage), "legal language switcher does not use equivalent documents");
check(/getTranslationMap[\s\S]*hreflang=\{headerLanguages\}/.test(blogPost), "blog header does not switch to the translated article");
check(/localizedOgImageUrl[\s\S]*og-image-sr\.jpg[\s\S]*og-image-es\.jpg/.test(og), "country-specific social cards are not configured");
check(await exists("public/og-image-sr.jpg"), "Serbian social card file is missing");
check(await exists("public/og-image-es.jpg"), "Spanish social card file is missing");

if (failures.length > 0) {
  console.error(`\nLocalized site audit failed (${failures.length}/${checks} checks):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Localized site audit passed (${checks} checks across ${locales.length} languages).`);
