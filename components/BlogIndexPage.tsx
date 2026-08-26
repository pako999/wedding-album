import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SeoFooter } from "@/components/SeoFooter";
import type { BlogPost, BlogCategory } from "@/lib/blog";
import { SITE_URL } from "@/lib/urls";
import { BLOG_HREFLANG, type LangCode } from "@/components/LanguageSwitcher";

const CATEGORY_COLOR: Record<BlogCategory, string> = {
  vodnik: "bg-amber-100 text-amber-800 border-amber-300",
  primerjava: "bg-violet-100 text-violet-800 border-violet-300",
  nasvet: "bg-emerald-100 text-emerald-800 border-emerald-300",
  "kontrolni-seznam": "bg-sky-100 text-sky-800 border-sky-300",
  novice: "bg-rose-100 text-rose-800 border-rose-300",
};

const CATEGORY_LABEL: Record<LangCode, Record<BlogCategory, string>> = {
  sl: { vodnik: "Vodnik", primerjava: "Primerjava", nasvet: "Nasvet", "kontrolni-seznam": "Kontrolni seznam", novice: "Novice" },
  hr: { vodnik: "Vodič", primerjava: "Usporedba", nasvet: "Savjet", "kontrolni-seznam": "Kontrolni popis", novice: "Novosti" },
  sr: { vodnik: "Vodič", primerjava: "Poređenje", nasvet: "Savet", "kontrolni-seznam": "Kontrolna lista", novice: "Novosti" },
  de: { vodnik: "Ratgeber", primerjava: "Vergleich", nasvet: "Tipp", "kontrolni-seznam": "Checkliste", novice: "Neuigkeiten" },
  en: { vodnik: "Guide", primerjava: "Comparison", nasvet: "Tip", "kontrolni-seznam": "Checklist", novice: "News" },
  es: { vodnik: "Guía", primerjava: "Comparativa", nasvet: "Consejo", "kontrolni-seznam": "Lista de control", novice: "Noticias" },
};

const COPY: Record<LangCode, {
  h1: string;
  lead: string;
  empty: string;
  readMore: string;
  featured: string;
}> = {
  sl: { h1: "Guestcam Blog — Nasveti za poročne fotografije", lead: "Vodniki, primerjave in nasveti za zbiranje fotografij gostov.", empty: "Objave kmalu prihajajo.", readMore: "Preberi", featured: "Najnovejše" },
  hr: { h1: "Guestcam Blog — Savjeti za fotografije s vjenčanja", lead: "Vodiči, usporedbe i savjeti za prikupljanje fotografija gostiju.", empty: "Objave uskoro stižu.", readMore: "Pročitaj", featured: "Najnovije" },
  sr: { h1: "Guestcam Blog — Saveti za fotografije sa venčanja", lead: "Vodiči, poređenja i saveti za prikupljanje fotografija gostiju.", empty: "Objave uskoro stižu.", readMore: "Pročitaj", featured: "Najnovije" },
  de: { h1: "Guestcam Blog — Tipps für Hochzeitsfotos", lead: "Ratgeber, Vergleiche und Tipps zum Sammeln von Gästefotos.", empty: "Beiträge folgen in Kürze.", readMore: "Lesen", featured: "Neueste" },
  en: { h1: "Guestcam Blog — Wedding Photo Tips & Guides", lead: "Guides, comparisons and tips for collecting guest photos.", empty: "New articles are coming soon.", readMore: "Read more", featured: "Latest" },
  es: { h1: "Guestcam Blog — Consejos para fotos de boda", lead: "Guías, comparativas y consejos para recopilar fotos de los invitados.", empty: "Próximamente publicaremos nuevos artículos.", readMore: "Leer", featured: "Último" },
};

function blogUrl(lang: LangCode, slug: string) {
  return lang === "sl" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
}

function indexUrl(lang: LangCode) {
  return lang === "sl" ? "/blog" : `/${lang}/blog`;
}

function formatDate(date: string, lang: LangCode) {
  const locales: Record<LangCode, string> = {
    sl: "sl-SI", hr: "hr-HR", sr: "sr-RS", de: "de-DE", en: "en-GB", es: "es-ES",
  };
  return new Date(date).toLocaleDateString(locales[lang], { year: "numeric", month: "short", day: "numeric" });
}

export function BlogIndexPage({ posts, lang }: { posts: BlogPost[]; lang: LangCode }) {
  const t = COPY[lang];
  const featured = posts[0];
  const rest = posts.slice(1);
  const absoluteIndex = `${SITE_URL}${indexUrl(lang)}`;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${absoluteIndex}#blog`,
    url: absoluteIndex,
    name: t.h1,
    description: t.lead,
    inLanguage: lang,
    blogPost: posts.slice(0, 20).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_URL}${blogUrl(lang, post.slug)}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      description: post.description,
      author: { "@type": "Organization", name: "Guestcam" },
      publisher: { "@type": "Organization", name: "Guestcam", url: SITE_URL },
    })),
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#111111]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <SiteHeader lang={lang} hreflang={BLOG_HREFLANG} />
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <header className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#8F6900] mb-3">Blog</p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-[-.05em] leading-[1.03] mb-4">{t.h1}</h1>
          <p className="text-base sm:text-lg text-black/55 max-w-2xl mx-auto">{t.lead}</p>
        </header>

        {posts.length === 0 && <p className="text-center text-black/50 py-20">{t.empty}</p>}

        {featured && (
          <Link href={blogUrl(lang, featured.slug)} className="block bg-white border border-black/10 rounded-[28px] overflow-hidden mb-12 hover:border-[#F4B400] hover:shadow-lg transition-all">
            <div className="grid md:grid-cols-2">
              <div className="p-7 sm:p-10 order-2 md:order-1">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#8F6900] mb-3">{t.featured}</p>
                <h2 className="text-3xl font-black tracking-[-.04em] mb-4 leading-tight">{featured.title}</h2>
                <p className="text-black/55 mb-5 line-clamp-3">{featured.tldr}</p>
                <span className="text-sm font-black text-[#8F6900]">{t.readMore} →</span>
              </div>
              {featured.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.coverImage} alt={featured.coverAlt ?? featured.title} className="w-full h-56 md:h-full object-cover order-1 md:order-2" />
              ) : (
                <div className="hidden md:block order-1 md:order-2 bg-[#FFF6CE]" />
              )}
            </div>
          </Link>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((p) => (
            <Link key={p.slug} href={blogUrl(lang, p.slug)} className="block bg-white border border-black/10 rounded-[22px] overflow-hidden hover:border-[#F4B400] hover:shadow-md transition-all">
              {p.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverImage} alt={p.coverAlt ?? p.title} className="w-full h-44 object-cover" loading="lazy" />
              )}
              <div className="p-6">
                <span className={`inline-block text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded border ${CATEGORY_COLOR[p.category]}`}>
                  {CATEGORY_LABEL[lang][p.category]}
                </span>
                <h3 className="text-xl font-black tracking-[-.025em] mt-4 mb-2 leading-snug">{p.title}</h3>
                <p className="text-sm text-black/50 line-clamp-3 mb-4">{p.tldr}</p>
                <div className="flex items-center justify-between text-xs text-black/45">
                  <time dateTime={p.publishedAt}>{formatDate(p.publishedAt, lang)}</time>
                  <span>{p.readingTime} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SeoFooter lang={lang} />
    </div>
  );
}
