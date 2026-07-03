import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SeoFooter } from "@/components/SeoFooter";
import type { LangCode } from "@/components/LanguageSwitcher";
import { type BlogPost, type BlogBlock, getRelatedPosts, getTranslationMap, blogUrl, headingId } from "@/lib/blog";
import { safeJsonLd } from "@/lib/seo/jsonld-safe";

interface Props {
  post: BlogPost;
}

const CATEGORY_COLOR: Record<string, string> = {
  vodnik:             "bg-amber-100 text-amber-800",
  primerjava:         "bg-violet-100 text-violet-800",
  nasvet:             "bg-emerald-100 text-emerald-800",
  "kontrolni-seznam": "bg-sky-100 text-sky-800",
  novice:             "bg-gray-100 text-gray-700",
};

// ─── i18n micro-copy ────────────────────────────────────────────────────────
const T: Record<LangCode, {
  inShort: string;
  toc: string;
  faq: string;
  related: string;
  back: string;
  by: string;
  readingTime: (m: number) => string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
}> = {
  sl: { inShort: "Na kratko:",  toc: "Vsebina",         faq: "Pogosta vprašanja", related: "Sorodni članki",       back: "← Vse objave",      by: "Avtor:",       readingTime: (m) => `${m} min branja`, ctaTitle: "Ustvarite svojo galerijo brezplačno", ctaBody: "Brez aplikacije, brez registracije gostov — samo QR koda.", ctaButton: "Začnite zdaj →" },
  hr: { inShort: "Ukratko:",     toc: "Sadržaj",         faq: "Često postavljana pitanja", related: "Povezani članci", back: "← Sve objave",     by: "Autor:",       readingTime: (m) => `${m} min čitanja`, ctaTitle: "Kreirajte svoju galeriju besplatno",  ctaBody: "Bez aplikacije, bez registracije gostiju — samo QR kod.", ctaButton: "Započnite sada →" },
  sr: { inShort: "Ukratko:",     toc: "Sadržaj",         faq: "Najčešća pitanja",          related: "Povezani članci", back: "← Sve objave",     by: "Autor:",       readingTime: (m) => `${m} min čitanja`, ctaTitle: "Napravite svoju galeriju besplatno",  ctaBody: "Bez aplikacije, bez registracije gostiju — samo QR kod.", ctaButton: "Počnite sada →" },
  de: { inShort: "Kurz gesagt:", toc: "Inhalt",          faq: "Häufige Fragen",            related: "Verwandte Artikel", back: "← Alle Beiträge", by: "Autor:",       readingTime: (m) => `${m} Min. Lesezeit`, ctaTitle: "Erstellen Sie Ihre Galerie kostenlos", ctaBody: "Keine App, keine Gäste-Registrierung — nur ein QR-Code.", ctaButton: "Jetzt starten →" },
  en: { inShort: "In short:",    toc: "Contents",        faq: "FAQ",                       related: "Related posts",   back: "← All posts",       by: "By",           readingTime: (m) => `${m} min read`, ctaTitle: "Create your free Guestcam gallery",    ctaBody: "No app, no guest sign-up — just a QR code.",            ctaButton: "Start free →" },
  es: { inShort: "En resumen:",  toc: "Contenido",       faq: "Preguntas frecuentes",      related: "Artículos relacionados", back: "← Todas las entradas", by: "Por", readingTime: (m) => `${m} min de lectura`, ctaTitle: "Crea tu galería Guestcam gratis",     ctaBody: "Sin app, sin registro de invitados — solo un código QR.", ctaButton: "Empieza gratis →" },
};

// ─── Block renderers ────────────────────────────────────────────────────────

function RenderBlock({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 id={block.id ?? headingId(block.text)} className="font-serif text-2xl font-bold text-[#0F1729] mt-10 mb-4 scroll-mt-24">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 id={block.id ?? headingId(block.text)} className="font-semibold text-lg text-[#0F1729] mt-6 mb-2">
          {block.text}
        </h3>
      );
    case "p":
      return <p className="text-gray-700 leading-relaxed mb-4">{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4">
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-4">
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-[#FFC94D] pl-4 my-5 italic text-gray-700">
          “{block.text}”
          {block.cite && <footer className="text-xs text-gray-500 mt-1 not-italic">— {block.cite}</footer>}
        </blockquote>
      );
    case "callout":
      return (
        <div className="bg-[#FFF9EC] border border-[#FFC94D]/40 rounded-xl p-4 my-5 text-sm text-gray-700">
          {block.text}
        </div>
      );
    case "stat":
      return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 my-5 flex items-center gap-4">
          <p className="font-serif text-3xl font-bold text-[#C9820A]">{block.value}</p>
          <div>
            <p className="text-sm font-medium text-[#0F1729]">{block.label}</p>
            {block.source && <p className="text-[11px] text-gray-400 mt-0.5">{block.source}</p>}
          </div>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto mb-5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#F2F4F8]">
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left p-3 font-semibold border border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, j) => (
                    <td key={j} className="p-3 border border-gray-200 text-gray-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "cta":
      return (
        <div className="my-8 p-6 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, #FFF9EC 0%, #FFC94D 100%)" }}>
          <p className="font-serif text-xl font-bold text-[#0F1729] mb-4">{block.text}</p>
          <Link href={block.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1729] text-white font-bold text-sm hover:opacity-90">
            {block.href.includes("dashboard") ? "→" : ""} {block.text}
          </Link>
        </div>
      );
    case "image":
      // Inline image block. `loading="lazy"` so images below the fold
      // don't block initial paint; `decoding="async"` lets the browser
      // skip them off the critical thread. The alt text is what
      // Google Image search indexes — we never ship a blog image
      // without one (schema requires it). Caption + credit are
      // optional and only render when present.
      return (
        <figure className="my-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="w-full h-auto rounded-2xl shadow-sm border border-gray-100"
          />
          {(block.caption || block.credit) && (
            <figcaption className="flex items-baseline justify-between gap-3 mt-2">
              {block.caption && (
                <span className="text-xs italic text-gray-500 leading-relaxed">
                  {block.caption}
                </span>
              )}
              {block.credit && (
                <span className="text-[10px] text-gray-400 shrink-0 ml-auto">
                  {block.credit}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      );
    case "faq":
      // FAQ is rendered at the end in its own section — skip inline
      return null;
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export async function BlogPostPage({ post }: Props) {
  const t = T[post.lang];
  const related = await getRelatedPosts(post, 3);
  const langMap = await getTranslationMap(post.translationKey);
  const faqs = post.content.filter((b): b is Extract<BlogBlock, { type: "faq" }> => b.type === "faq");
  const tocEntries = post.content
    .filter((b): b is Extract<BlogBlock, { type: "h2" }> => b.type === "h2")
    .map((h) => ({ id: h.id ?? headingId(h.text), text: h.text }));

  const canonical = `https://www.guestcam.si${blogUrl(post.lang, post.slug)}`;

  // JSON-LD: Article + BreadcrumbList + FAQPage (if has faqs)
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: { "@type": "Organization", name: post.author },
      publisher: {
        "@type": "Organization",
        name: "Guestcam",
        logo: { "@type": "ImageObject", url: "https://www.guestcam.si/guestcam-logo.svg" },
      },
      inLanguage: post.lang,
      mainEntityOfPage: canonical,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Guestcam", item: "https://www.guestcam.si" },
        { "@type": "ListItem", position: 2, name: "Blog",      item: `https://www.guestcam.si${blogUrl(post.lang)}` },
        { "@type": "ListItem", position: 3, name: post.title,  item: canonical },
      ],
    },
  ];
  if (faqs.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  // HowTo schema — emit ONLY when the post is genuinely procedural,
  // i.e. category === "vodnik" (our "guide / how-to" category).
  // Posts in other categories may also contain ordered lists, but the
  // items are reasons, comparisons, or shot-lists — not steps.
  // Treating those as HowTo confuses Google + AI engines and risks
  // a "misleading structured data" manual action.
  const stepsBlock =
    post.category === "vodnik"
      ? post.content.find(
          (b): b is Extract<BlogBlock, { type: "ol" }> => b.type === "ol",
        )
      : undefined;
  if (stepsBlock && stepsBlock.items.length >= 3) {
    // The step `name` is the short title for that step. Split on em-dash
    // or colon to grab the leading clause. We deliberately do NOT split
    // on `.` because URLs like guestcam.si inside a step would truncate
    // the name mid-domain ("Go to guestcam").
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: post.title,
      description: post.description,
      step: stepsBlock.items.map((text, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: text.split(/[—:]/)[0].trim().slice(0, 90),
        text,
      })),
    });
  }

  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729]">
      <SiteHeader lang={post.lang} />

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link href={blogUrl(post.lang)} className="text-sm text-gray-500 hover:text-[#0F1729]">{t.back}</Link>

        {/* Header */}
        <header className="mt-6 mb-8">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span className={`px-2 py-0.5 rounded-full font-semibold ${CATEGORY_COLOR[post.category] ?? CATEGORY_COLOR.novice}`}>
              {post.category}
            </span>
            <span>·</span>
            <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString(post.lang)}</time>
            <span>·</span>
            <span>{t.readingTime(post.readingTime)}</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#0F1729] leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-gray-600">{post.description}</p>
          <p className="text-xs text-gray-400 mt-3">{t.by} <span className="font-medium text-gray-600">{post.author}</span></p>
        </header>

        {/* TLDR box — AI engines love this */}
        <aside className="bg-[#FFC94D]/20 border border-[#FFC94D]/50 rounded-2xl p-5 mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C9820A] mb-2">{t.inShort}</p>
          <p className="text-base text-[#0F1729] leading-relaxed">{post.tldr}</p>
        </aside>

        {/* Table of contents */}
        {tocEntries.length >= 3 && (
          <nav className="bg-white border border-gray-200 rounded-2xl p-5 mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t.toc}</p>
            <ol className="space-y-1.5 text-sm">
              {tocEntries.map((entry, i) => (
                <li key={i}>
                  <a href={`#${entry.id}`} className="text-gray-700 hover:text-[#C9820A]">
                    {i + 1}. {entry.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Body */}
        <div className="prose-content">
          {post.content.map((block, i) => <RenderBlock key={i} block={block} />)}
        </div>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-5">{t.faq}</h2>
            <div className="space-y-2">
              {faqs.map((f, i) => (
                <details key={i} className="group rounded-xl bg-white border border-gray-200 p-4 open:border-[#FFC94D]/60 open:bg-[#FFF9EC]/40">
                  <summary className="font-semibold text-[#0F1729] cursor-pointer list-none flex items-center justify-between gap-3">
                    <span>{f.q}</span>
                    <span className="text-[#C9820A] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="mt-12 p-7 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, #FFF9EC 0%, #FFC94D 100%)" }}>
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-2">{t.ctaTitle}</h2>
          <p className="text-sm text-[#0F1729]/80 mb-5">{t.ctaBody}</p>
          <Link href="/dashboard/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1729] text-white font-bold text-sm hover:opacity-90">
            {t.ctaButton}
          </Link>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-5">{t.related}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link key={p.slug} href={blogUrl(p.lang, p.slug)} className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#FFC94D] hover:shadow-md transition-all">
                  <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${CATEGORY_COLOR[p.category] ?? CATEGORY_COLOR.novice}`}>
                    {p.category}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#0F1729] mt-3 mb-2 leading-snug">{p.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{p.tldr}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Language switcher for this specific post */}
        {Object.keys(langMap).length > 1 && (
          <section className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Read in another language</p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(langMap).map(([lang, url]) => (
                <a key={lang} href={url} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white border border-gray-200 hover:border-[#FFC94D] hover:text-[#C9820A]">
                  {lang.toUpperCase()}
                </a>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* JSON-LD for SEO / AI engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <SeoFooter lang={post.lang} />
    </div>
  );
}
