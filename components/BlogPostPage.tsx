import { SITE_URL } from "@/lib/urls";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SeoFooter } from "@/components/SeoFooter";
import type { LangCode } from "@/components/LanguageSwitcher";
import { type BlogPost, type BlogBlock, type BlogCategory, getRelatedPosts, getTranslationMap, blogUrl, headingId } from "@/lib/blog";
import { safeJsonLd } from "@/lib/seo/jsonld-safe";

interface Props { post: BlogPost }

const CATEGORY_LABEL: Record<LangCode, Record<BlogCategory, string>> = {
  sl: { vodnik: "Vodnik", primerjava: "Primerjava", nasvet: "Nasvet", "kontrolni-seznam": "Kontrolni seznam", novice: "Novice" },
  hr: { vodnik: "Vodič", primerjava: "Usporedba", nasvet: "Savjet", "kontrolni-seznam": "Kontrolni popis", novice: "Novosti" },
  sr: { vodnik: "Vodič", primerjava: "Poređenje", nasvet: "Savet", "kontrolni-seznam": "Kontrolna lista", novice: "Novosti" },
  de: { vodnik: "Ratgeber", primerjava: "Vergleich", nasvet: "Tipp", "kontrolni-seznam": "Checkliste", novice: "Neuigkeiten" },
  en: { vodnik: "Guide", primerjava: "Comparison", nasvet: "Tip", "kontrolni-seznam": "Checklist", novice: "News" },
  es: { vodnik: "Guía", primerjava: "Comparativa", nasvet: "Consejo", "kontrolni-seznam": "Lista de control", novice: "Noticias" },
};

const LOCALE: Record<LangCode, string> = { sl: "sl-SI", hr: "hr-HR", sr: "sr-RS", de: "de-DE", en: "en-GB", es: "es-ES" };

const T: Record<LangCode, {
  inShort: string; toc: string; faq: string; related: string; back: string; by: string;
  readingTime: (m: number) => string; ctaTitle: string; ctaBody: string; ctaButton: string; languages: string;
}> = {
  sl: { inShort: "Na kratko", toc: "V tem vodiču", faq: "Pogosta vprašanja", related: "Nadaljujte z branjem", back: "← Nazaj na vodiče", by: "Avtor", readingTime: (m) => `${m} min branja`, ctaTitle: "Vse fotografije gostov. En sam album.", ctaBody: "Ustvarite zasebno galerijo, delite QR kodo in zbirajte fotografije ter videe brez aplikacije.", ctaButton: "Začni brezplačno →", languages: "Preberi v drugem jeziku" },
  hr: { inShort: "Ukratko", toc: "U ovom vodiču", faq: "Česta pitanja", related: "Nastavite čitati", back: "← Natrag na vodiče", by: "Autor", readingTime: (m) => `${m} min čitanja`, ctaTitle: "Sve fotografije gostiju. Jedan album.", ctaBody: "Napravite privatnu galeriju, podijelite QR kod i prikupljajte fotografije i videe bez aplikacije.", ctaButton: "Počni besplatno →", languages: "Pročitaj na drugom jeziku" },
  sr: { inShort: "Ukratko", toc: "U ovom vodiču", faq: "Najčešća pitanja", related: "Nastavite sa čitanjem", back: "← Nazad na vodiče", by: "Autor", readingTime: (m) => `${m} min čitanja`, ctaTitle: "Sve fotografije gostiju. Jedan album.", ctaBody: "Napravite privatnu galeriju, podelite QR kod i prikupljajte fotografije i video snimke bez aplikacije.", ctaButton: "Počni besplatno →", languages: "Pročitaj na drugom jeziku" },
  de: { inShort: "Kurz gesagt", toc: "In diesem Ratgeber", faq: "Häufige Fragen", related: "Weiterlesen", back: "← Zurück zu den Ratgebern", by: "Autor", readingTime: (m) => `${m} Min. Lesezeit`, ctaTitle: "Alle Gästefotos. Ein Album.", ctaBody: "Erstelle eine private Galerie, teile den QR-Code und sammle Fotos und Videos ohne App.", ctaButton: "Kostenlos starten →", languages: "In einer anderen Sprache lesen" },
  en: { inShort: "In short", toc: "In this guide", faq: "FAQ", related: "Keep reading", back: "← Back to guides", by: "By", readingTime: (m) => `${m} min read`, ctaTitle: "Every guest photo. One album.", ctaBody: "Create a private gallery, share the QR code and collect photos and videos without an app.", ctaButton: "Start free →", languages: "Read in another language" },
  es: { inShort: "En resumen", toc: "En esta guía", faq: "Preguntas frecuentes", related: "Sigue leyendo", back: "← Volver a las guías", by: "Por", readingTime: (m) => `${m} min de lectura`, ctaTitle: "Todas las fotos de tus invitados. Un álbum.", ctaBody: "Crea una galería privada, comparte el QR y recopila fotos y vídeos sin app.", ctaButton: "Empieza gratis →", languages: "Leer en otro idioma" },
};

function RenderBlock({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2": return <h2 id={block.id ?? headingId(block.text)} className="text-3xl sm:text-4xl font-black tracking-[-.045em] leading-[1.05] text-[#111111] mt-14 mb-5 scroll-mt-24">{block.text}</h2>;
    case "h3": return <h3 id={block.id ?? headingId(block.text)} className="text-xl sm:text-2xl font-black tracking-[-.025em] text-[#111111] mt-9 mb-3 scroll-mt-24">{block.text}</h3>;
    case "p": return <p className="text-[17px] text-black/70 leading-[1.75] mb-5">{block.text}</p>;
    case "ul": return <ul className="list-disc marker:text-[#B88700] pl-6 space-y-2.5 text-[17px] text-black/70 leading-relaxed mb-6">{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
    case "ol": return <ol className="list-decimal marker:font-black marker:text-[#8F6900] pl-6 space-y-3 text-[17px] text-black/70 leading-relaxed mb-6">{block.items.map((item, i) => <li key={i}>{item}</li>)}</ol>;
    case "quote": return <blockquote className="my-8 rounded-r-[24px] border-l-[6px] border-[#F4B400] bg-white px-6 py-5 text-lg font-semibold leading-relaxed text-black/75 shadow-sm">“{block.text}”{block.cite && <footer className="mt-3 text-xs font-bold uppercase tracking-wider text-black/45 not-italic">— {block.cite}</footer>}</blockquote>;
    case "callout": return <div className="my-7 rounded-[24px] border border-[#D6A400]/30 bg-[#FFF1B8] p-5 sm:p-6 text-[16px] leading-relaxed text-black/75">{block.text}</div>;
    case "stat": return <div className="my-8 flex flex-col sm:flex-row sm:items-center gap-4 rounded-[28px] bg-[#111111] p-6 sm:p-7 text-white"><p className="text-4xl sm:text-5xl font-black tracking-[-.05em] text-[#F4B400]">{block.value}</p><div><p className="text-sm sm:text-base font-bold leading-snug">{block.label}</p>{block.source && <p className="text-xs text-white/45 mt-1">{block.source}</p>}</div></div>;
    case "table": return <div className="overflow-x-auto mb-7 rounded-[20px] border border-black/10 bg-white"><table className="w-full text-sm border-collapse"><thead><tr className="bg-[#F4B400]">{block.headers.map((h, i) => <th key={i} className="text-left p-3.5 font-black border-b border-black/10">{h}</th>)}</tr></thead><tbody>{block.rows.map((row, i) => <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#FFFDF8]"}>{row.map((cell, j) => <td key={j} className="p-3.5 border-t border-black/10 text-black/65">{cell}</td>)}</tr>)}</tbody></table></div>;
    case "cta": return <div className="my-10 rounded-[30px] bg-[#F4B400] p-7 sm:p-9"><p className="text-2xl sm:text-3xl font-black tracking-[-.035em] leading-tight text-black mb-5">{block.text}</p><Link href={block.href} className="inline-flex rounded-full bg-[#111111] px-5 py-3 text-sm font-black text-white hover:scale-[1.02] transition-transform">{block.text} →</Link></div>;
    case "image": return <figure className="my-9">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={block.src} alt={block.alt} loading="lazy" decoding="async" className="w-full h-auto rounded-[26px] border border-black/10 object-cover" />{(block.caption || block.credit) && <figcaption className="mt-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 text-xs text-black/45">{block.caption && <span className="leading-relaxed">{block.caption}</span>}{block.credit && <span className="shrink-0">{block.credit}</span>}</figcaption>}</figure>;
    case "faq": return null;
  }
}

export async function BlogPostPage({ post }: Props) {
  const t = T[post.lang];
  const related = await getRelatedPosts(post, 3);
  const langMap = await getTranslationMap(post.translationKey);
  const faqs = post.content.filter((b): b is Extract<BlogBlock, { type: "faq" }> => b.type === "faq");
  const tocEntries = post.content.filter((b): b is Extract<BlogBlock, { type: "h2" }> => b.type === "h2").map((h) => ({ id: h.id ?? headingId(h.text), text: h.text }));
  const canonical = `${SITE_URL}${blogUrl(post.lang, post.slug)}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${canonical}#article`,
      headline: post.title, description: post.description,
      datePublished: post.publishedAt, dateModified: post.updatedAt,
      ...(post.coverImage ? { image: [post.coverImage] } : { image: [`${SITE_URL}/og-image.png?v=2`] }),
      author: { "@type": "Organization", name: post.author, url: SITE_URL },
      publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Guestcam", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/guestcam-logo.svg` } },
      inLanguage: post.lang, mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Guestcam", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}${blogUrl(post.lang)}` },
        { "@type": "ListItem", position: 3, name: post.title, item: canonical },
      ],
    },
  ];
  if (faqs.length > 0) jsonLd.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });

  const stepsBlock = post.category === "vodnik" ? post.content.find((b): b is Extract<BlogBlock, { type: "ol" }> => b.type === "ol") : undefined;
  if (stepsBlock && stepsBlock.items.length >= 3) jsonLd.push({ "@context": "https://schema.org", "@type": "HowTo", name: post.title, description: post.description, step: stepsBlock.items.map((text, i) => ({ "@type": "HowToStep", position: i + 1, name: text.split(/[—:]/)[0].trim().slice(0, 90), text })) });

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#111111]">
      <SiteHeader lang={post.lang} />
      <article>
        <header className="border-b border-black/10">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
            <Link href={blogUrl(post.lang)} className="inline-flex text-sm font-bold text-black/50 hover:text-black transition-colors">{t.back}</Link>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-black/45">
              <span className="rounded-full bg-[#FFF1B8] px-3 py-1 font-black uppercase tracking-[.13em] text-[#6F5000]">{CATEGORY_LABEL[post.lang][post.category]}</span>
              <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString(LOCALE[post.lang], { year: "numeric", month: "long", day: "numeric" })}</time>
              <span>·</span><span>{t.readingTime(post.readingTime)}</span>
            </div>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6.5vw,5.7rem)] font-black tracking-[-.065em] leading-[.96]">{post.title}</h1>
            <p className="mt-6 max-w-3xl text-lg sm:text-xl leading-relaxed text-black/60">{post.description}</p>
            <p className="mt-5 text-xs text-black/40">{t.by} <span className="font-bold text-black/65">{post.author}</span></p>
          </div>
        </header>

        {post.coverImage && <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={post.coverImage} alt={post.coverAlt ?? post.title} className="w-full max-h-[620px] object-cover rounded-[32px] border border-black/10" fetchPriority="high" /></div>}

        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <aside className="rounded-[28px] bg-[#F4B400] p-6 sm:p-8 mb-10">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-black/55 mb-3">{t.inShort}</p>
            <p className="text-xl sm:text-2xl font-black tracking-[-.025em] leading-snug text-black">{post.tldr}</p>
          </aside>

          {tocEntries.length >= 3 && <nav className="rounded-[26px] border border-black/10 bg-white p-6 sm:p-7 mb-11"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#8F6900] mb-4">{t.toc}</p><ol className="space-y-2.5 text-sm">{tocEntries.map((entry, i) => <li key={entry.id}><a href={`#${entry.id}`} className="font-semibold text-black/65 hover:text-[#8F6900] transition-colors"><span className="mr-2 text-black/30">{String(i + 1).padStart(2, "0")}</span>{entry.text}</a></li>)}</ol></nav>}

          <div className="prose-content">{post.content.map((block, i) => <RenderBlock key={i} block={block} />)}</div>

          {faqs.length > 0 && <section className="mt-16"><p className="text-xs font-black uppercase tracking-[.18em] text-[#8F6900] mb-3">Guestcam FAQ</p><h2 className="text-3xl sm:text-4xl font-black tracking-[-.045em] mb-6">{t.faq}</h2><div className="space-y-3">{faqs.map((f, i) => <details key={i} className="group rounded-[22px] bg-white border border-black/10 p-5 open:border-[#D6A400]"><summary className="font-black cursor-pointer list-none flex items-center justify-between gap-4"><span>{f.q}</span><span className="w-8 h-8 rounded-full bg-[#FFF1B8] flex items-center justify-center text-[#8F6900] transition-transform group-open:rotate-45">+</span></summary><p className="text-[15px] text-black/60 mt-4 leading-relaxed pr-10">{f.a}</p></details>)}</div></section>}

          <section className="mt-16 rounded-[32px] bg-[#111111] px-7 py-10 sm:px-10 sm:py-12 text-white">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#F4B400] mb-3">Guestcam</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-[-.045em] leading-[1.02]">{t.ctaTitle}</h2>
            <p className="mt-4 text-white/65 leading-relaxed max-w-xl">{t.ctaBody}</p>
            <Link href="/dashboard/new" className="mt-7 inline-flex rounded-full bg-[#F4B400] px-6 py-3.5 text-sm font-black text-black hover:scale-[1.03] transition-transform">{t.ctaButton}</Link>
          </section>

          {related.length > 0 && <section className="mt-16"><h2 className="text-3xl sm:text-4xl font-black tracking-[-.045em] mb-6">{t.related}</h2><div className="grid sm:grid-cols-3 gap-4">{related.map((p) => <Link key={p.slug} href={blogUrl(p.lang, p.slug)} className="group block rounded-[22px] border border-black/10 bg-white p-5 hover:border-[#D6A400] hover:-translate-y-1 transition-all"><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#8F6900]">{CATEGORY_LABEL[post.lang][p.category]}</span><h3 className="text-lg font-black tracking-[-.025em] mt-3 leading-snug group-hover:text-[#795900]">{p.title}</h3><p className="text-xs text-black/45 line-clamp-3 mt-2 leading-relaxed">{p.tldr}</p></Link>)}</div></section>}

          {Object.keys(langMap).length > 1 && <section className="mt-14 pt-8 border-t border-black/10 text-center"><p className="text-[10px] font-black uppercase tracking-[.18em] text-black/40 mb-4">{t.languages}</p><div className="flex flex-wrap justify-center gap-2">{Object.entries(langMap).map(([lang, url]) => <a key={lang} href={url} hrefLang={lang} className={`px-3.5 py-2 text-xs font-black rounded-full border transition-colors ${lang === post.lang ? "bg-[#111111] text-white border-[#111111]" : "bg-white border-black/10 hover:border-[#D6A400]"}`}>{lang.toUpperCase()}</a>)}</div></section>}
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <SeoFooter lang={post.lang} />
    </div>
  );
}
