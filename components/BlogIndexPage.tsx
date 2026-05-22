import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SeoFooter } from "@/components/SeoFooter";
import type { LangCode } from "@/components/LanguageSwitcher";
import type { BlogPost } from "@/lib/blog";
import { blogUrl } from "@/lib/blog";

const CATEGORY_COLOR: Record<string, string> = {
  vodnik:             "bg-amber-100 text-amber-800 border-amber-300",
  primerjava:         "bg-violet-100 text-violet-800 border-violet-300",
  nasvet:             "bg-emerald-100 text-emerald-800 border-emerald-300",
  "kontrolni-seznam": "bg-sky-100 text-sky-800 border-sky-300",
  novice:             "bg-gray-100 text-gray-700 border-gray-300",
};

const COPY: Record<LangCode, { h1: string; lead: string; empty: string; readMore: string; featured: string }> = {
  sl: { h1: "Guestcam Blog — Nasveti za poročne fotografije", lead: "Vodniki, primerjave in nasveti za zbiranje fotografij gostov.", empty: "Še nimamo objav v tem jeziku. Poglejte angleško verzijo.", readMore: "Preberi →", featured: "Najnovejše" },
  hr: { h1: "Guestcam Blog — Savjeti za fotografije s vjenčanja", lead: "Vodiči, usporedbe i savjeti za prikupljanje fotografija gostiju.", empty: "Još nemamo objava na ovom jeziku. Pogledajte englesku verziju.", readMore: "Pročitaj →", featured: "Najnovije" },
  sr: { h1: "Guestcam Blog — Saveti za fotografije sa venčanja", lead: "Vodiči, poređenja i saveti za prikupljanje fotografija gostiju.", empty: "Još nemamo objava na ovom jeziku. Pogledajte englesku verziju.", readMore: "Pročitaj →", featured: "Najnovije" },
  de: { h1: "Guestcam Blog — Tipps für Hochzeitsfotos",          lead: "Anleitungen, Vergleiche und Tipps zum Sammeln von Gästefotos.", empty: "Noch keine Beiträge in dieser Sprache. Schauen Sie sich die englische Version an.", readMore: "Lesen →", featured: "Neuester Beitrag" },
  en: { h1: "Guestcam Blog — Wedding Photo Tips & Guides",       lead: "Guides, comparisons and tips for collecting guest photos.",       empty: "No posts in this language yet. Check the English version.", readMore: "Read more →", featured: "Latest" },
  es: { h1: "Guestcam Blog — Consejos sobre fotos de boda",     lead: "Guías, comparativas y consejos para recopilar fotos de los invitados.", empty: "Aún no hay entradas en este idioma. Consulta la versión en inglés.", readMore: "Leer más →", featured: "Lo más reciente" },
};

interface Props {
  posts: BlogPost[];
  lang: LangCode;
}

export function BlogIndexPage({ posts, lang }: Props) {
  const t = COPY[lang];
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729]">
      <SiteHeader lang={lang} />

      <main className="max-w-6xl mx-auto px-6 py-14">
        {/* Hero */}
        <header className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C9820A] mb-3">Blog</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#0F1729] leading-tight mb-3">{t.h1}</h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto">{t.lead}</p>
        </header>

        {posts.length === 0 && (
          <p className="text-center text-gray-400 text-sm">{t.empty}</p>
        )}

        {/* Featured */}
        {featured && (
          <Link
            href={blogUrl(featured.lang, featured.slug)}
            className="block bg-white border border-gray-200 rounded-3xl overflow-hidden mb-12 hover:border-[#FFC94D] hover:shadow-lg transition-all"
          >
            <div className="grid md:grid-cols-2">
              <div className="p-8 sm:p-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9820A] mb-3">{t.featured}</p>
                <h2 className="font-serif text-3xl font-bold text-[#0F1729] mb-4 leading-tight">{featured.title}</h2>
                <p className="text-gray-500 mb-5 line-clamp-3">{featured.tldr}</p>
                <span className="text-sm font-bold text-[#C9820A]">{t.readMore}</span>
              </div>
              <div className="hidden md:block" style={{ background: "linear-gradient(135deg, #FFF9EC 0%, #FFC94D 100%)" }} />
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((p) => (
              <Link
                key={p.slug}
                href={blogUrl(p.lang, p.slug)}
                className="block bg-white border border-gray-200 rounded-2xl p-6 hover:border-[#FFC94D] hover:shadow-md transition-all"
              >
                <span className={`inline-block text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded border ${CATEGORY_COLOR[p.category] ?? CATEGORY_COLOR.novice}`}>
                  {p.category}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#0F1729] mt-4 mb-2 leading-snug">{p.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4">{p.tldr}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <time dateTime={p.publishedAt}>{new Date(p.publishedAt).toLocaleDateString(p.lang)}</time>
                  <span>{p.readingTime} min</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <SeoFooter lang={lang} />
    </div>
  );
}
