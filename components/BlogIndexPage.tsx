import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SeoFooter } from "@/components/SeoFooter";
import type { BlogPost, BlogCategory } from "@/lib/blog";
import { localeAbsoluteUrl, SITE_URL } from "@/lib/urls";
import { BLOG_HREFLANG, type LangCode } from "@/components/LanguageSwitcher";
import { safeJsonLd } from "@/lib/seo/jsonld-safe";

const CATEGORY_LABEL: Record<LangCode, Record<BlogCategory, string>> = {
  sl: { vodnik: "Vodnik", primerjava: "Primerjava", nasvet: "Nasvet", "kontrolni-seznam": "Kontrolni seznam", novice: "Novice" },
  hr: { vodnik: "Vodič", primerjava: "Usporedba", nasvet: "Savjet", "kontrolni-seznam": "Kontrolni popis", novice: "Novosti" },
  sr: { vodnik: "Vodič", primerjava: "Poređenje", nasvet: "Savet", "kontrolni-seznam": "Kontrolna lista", novice: "Novosti" },
  de: { vodnik: "Ratgeber", primerjava: "Vergleich", nasvet: "Tipp", "kontrolni-seznam": "Checkliste", novice: "Neuigkeiten" },
  en: { vodnik: "Guide", primerjava: "Comparison", nasvet: "Tip", "kontrolni-seznam": "Checklist", novice: "News" },
  es: { vodnik: "Guía", primerjava: "Comparativa", nasvet: "Consejo", "kontrolni-seznam": "Lista de control", novice: "Noticias" },
};

type Copy = {
  eyebrow: string;
  h1: string;
  accent: string;
  lead: string;
  empty: string;
  readMore: string;
  featured: string;
  latest: string;
  latestLead: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
};

const COPY: Record<LangCode, Copy> = {
  sl: {
    eyebrow: "Guestcam vodiči",
    h1: "Ideje za več fotografij.",
    accent: "Manj lovljenja po WhatsAppu.",
    lead: "Praktični vodiči za QR kode, zbiranje fotografij in videov gostov, zasebne galerije ter dogodke — brez aplikacije in kompliciranja.",
    empty: "Novi vodiči prihajajo kmalu.",
    readMore: "Preberi vodič",
    featured: "Izbrani vodič",
    latest: "Najnovejši vodiči",
    latestLead: "Kratki, uporabni odgovori za organizatorje, pare in ekipe na dogodkih.",
    ctaTitle: "Vse fotografije gostov. En sam album.",
    ctaBody: "Ustvarite zasebno Guestcam galerijo, dobite QR kodo in pustite gostom, da nalagajo brez aplikacije.",
    ctaButton: "Začni brezplačno →",
  },
  hr: {
    eyebrow: "Guestcam vodiči",
    h1: "Više fotografija gostiju.",
    accent: "Manje traženja po WhatsAppu.",
    lead: "Praktični vodiči za QR kodove, prikupljanje fotografija i videa gostiju, privatne galerije i događaje — bez aplikacije i kompliciranja.",
    empty: "Novi vodiči stižu uskoro.", readMore: "Pročitaj vodič", featured: "Izdvojeni vodič", latest: "Najnoviji vodiči", latestLead: "Kratki i korisni odgovori za organizatore, parove i event timove.", ctaTitle: "Sve fotografije gostiju. Jedan album.", ctaBody: "Napravite privatnu Guestcam galeriju, preuzmite QR kod i omogućite gostima prijenos bez aplikacije.", ctaButton: "Počni besplatno →",
  },
  sr: {
    eyebrow: "Guestcam vodiči", h1: "Više fotografija gostiju.", accent: "Manje traženja po WhatsAppu.", lead: "Praktični vodiči za QR kodove, prikupljanje fotografija i videa gostiju, privatne galerije i događaje — bez aplikacije i komplikovanja.", empty: "Novi vodiči stižu uskoro.", readMore: "Pročitaj vodič", featured: "Izdvojeni vodič", latest: "Najnoviji vodiči", latestLead: "Kratki i korisni odgovori za organizatore, parove i event timove.", ctaTitle: "Sve fotografije gostiju. Jedan album.", ctaBody: "Napravite privatnu Guestcam galeriju, dobijte QR kod i omogućite gostima otpremanje bez aplikacije.", ctaButton: "Počni besplatno →",
  },
  de: {
    eyebrow: "Guestcam Ratgeber", h1: "Mehr Gästefotos.", accent: "Weniger WhatsApp-Chaos.", lead: "Praktische Ratgeber zu QR-Codes, Gästefotos und -videos, privaten Galerien und Events — ohne App und ohne komplizierte Einrichtung.", empty: "Neue Ratgeber folgen in Kürze.", readMore: "Ratgeber lesen", featured: "Ausgewählter Ratgeber", latest: "Neueste Ratgeber", latestLead: "Kurze, praktische Antworten für Paare, Veranstalter und Event-Teams.", ctaTitle: "Alle Gästefotos. Ein Album.", ctaBody: "Erstelle eine private Guestcam-Galerie, erhalte deinen QR-Code und lass Gäste ohne App hochladen.", ctaButton: "Kostenlos starten →",
  },
  en: {
    eyebrow: "Guestcam guides", h1: "More guest photos.", accent: "Less WhatsApp chasing.", lead: "Practical guides to QR codes, collecting guest photos and videos, private galleries and events — no app and no complicated setup.", empty: "New guides are coming soon.", readMore: "Read guide", featured: "Featured guide", latest: "Latest guides", latestLead: "Short, useful answers for couples, organisers and event teams.", ctaTitle: "Every guest photo. One album.", ctaBody: "Create a private Guestcam gallery, get your QR code and let guests upload without an app.", ctaButton: "Start free →",
  },
  es: {
    eyebrow: "Guías Guestcam", h1: "Más fotos de invitados.", accent: "Menos búsquedas por WhatsApp.", lead: "Guías prácticas sobre códigos QR, fotos y vídeos de invitados, galerías privadas y eventos — sin app y sin configuraciones complicadas.", empty: "Pronto publicaremos nuevas guías.", readMore: "Leer guía", featured: "Guía destacada", latest: "Guías más recientes", latestLead: "Respuestas breves y útiles para parejas, organizadores y equipos de eventos.", ctaTitle: "Todas las fotos de tus invitados. Un álbum.", ctaBody: "Crea una galería privada de Guestcam, obtén tu QR y deja que los invitados suban fotos sin app.", ctaButton: "Empieza gratis →",
  },
};

function blogUrl(lang: LangCode, slug: string) {
  return lang === "sl" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
}

function indexUrl(lang: LangCode) {
  return lang === "sl" ? "/blog" : `/${lang}/blog`;
}

function formatDate(date: string, lang: LangCode) {
  const locales: Record<LangCode, string> = { sl: "sl-SI", hr: "hr-HR", sr: "sr-RS", de: "de-DE", en: "en-GB", es: "es-ES" };
  return new Date(date).toLocaleDateString(locales[lang], { year: "numeric", month: "short", day: "numeric" });
}

function CategoryPill({ category, lang, inverted = false }: { category: BlogCategory; lang: LangCode; inverted?: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] ${inverted ? "bg-[#F4B400] text-black" : "bg-[#FFF1B8] text-[#6F5000]"}`}>
      {CATEGORY_LABEL[lang][category]}
    </span>
  );
}

export function BlogIndexPage({ posts, lang }: { posts: BlogPost[]; lang: LangCode }) {
  const t = COPY[lang];
  const featured = posts[0];
  const rest = posts.slice(1);
  const absoluteIndex = localeAbsoluteUrl(lang, indexUrl(lang));

  const itemList = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${absoluteIndex}#blog`,
    url: absoluteIndex,
    name: `${t.h1} ${t.accent}`,
    description: t.lead,
    inLanguage: lang,
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Guestcam", url: SITE_URL },
    blogPost: posts.slice(0, 20).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: localeAbsoluteUrl(lang, blogUrl(lang, post.slug)),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      description: post.description,
      ...(post.coverImage ? { image: post.coverImage } : {}),
      author: { "@type": "Organization", name: "Guestcam Team" },
      publisher: { "@id": `${SITE_URL}/#organization` },
    })),
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#111111]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />
      <SiteHeader lang={lang} hreflang={BLOG_HREFLANG} />

      <main>
        <section className="border-b border-black/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#8F6900] mb-5">{t.eyebrow}</p>
            <h1 className="max-w-5xl text-[clamp(2.8rem,7vw,6.5rem)] font-black tracking-[-.065em] leading-[.92]">
              {t.h1}<br />
              <span className="text-[#B88700]">{t.accent}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base sm:text-xl leading-relaxed text-black/60">{t.lead}</p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          {posts.length === 0 && <p className="text-center text-black/50 py-20">{t.empty}</p>}

          {featured && (
            <Link href={blogUrl(lang, featured.slug)} className="group block overflow-hidden rounded-[32px] bg-[#111111] text-white shadow-[0_24px_70px_rgba(17,17,17,.14)]">
              <div className="grid lg:grid-cols-[1.05fr_.95fr] min-h-[420px]">
                <div className="p-7 sm:p-11 lg:p-14 flex flex-col justify-between order-2 lg:order-1">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-7">
                      <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#F4B400]">{t.featured}</span>
                      <CategoryPill category={featured.category} lang={lang} inverted />
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-[-.05em] leading-[1.02] max-w-xl">{featured.title}</h2>
                    <p className="mt-5 text-white/65 text-base sm:text-lg leading-relaxed max-w-xl">{featured.tldr}</p>
                  </div>
                  <div className="mt-9 flex items-center justify-between gap-4">
                    <span className="inline-flex items-center rounded-full bg-[#F4B400] px-5 py-3 text-sm font-black text-black transition-transform group-hover:translate-x-1">{t.readMore} →</span>
                    <time className="text-xs text-white/45" dateTime={featured.publishedAt}>{formatDate(featured.publishedAt, lang)}</time>
                  </div>
                </div>
                <div className="order-1 lg:order-2 bg-[#F4B400] min-h-[250px] lg:min-h-full">
                  {featured.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.coverImage} alt={featured.coverAlt ?? featured.title} className="w-full h-full object-cover" fetchPriority="high" />
                  ) : (
                    <div className="w-full h-full min-h-[280px] flex items-center justify-center text-8xl">📸</div>
                  )}
                </div>
              </div>
            </Link>
          )}
        </section>

        {rest.length > 0 && (
          <section className="bg-[#F4B400] border-y border-black/10">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
              <div className="mb-9 sm:flex items-end justify-between gap-8">
                <h2 className="text-3xl sm:text-5xl font-black tracking-[-.05em]">{t.latest}</h2>
                <p className="mt-3 sm:mt-0 max-w-lg text-sm sm:text-base text-black/65">{t.latestLead}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((p) => (
                  <Link key={p.slug} href={blogUrl(lang, p.slug)} className="group flex flex-col overflow-hidden rounded-[26px] border border-black/10 bg-[#FFFDF8] transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,.12)]">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt={p.coverAlt ?? p.title} className="w-full h-48 object-cover" loading="lazy" decoding="async" />
                    ) : <div className="h-8 bg-[#111111]" />}
                    <div className="p-6 flex flex-1 flex-col">
                      <CategoryPill category={p.category} lang={lang} />
                      <h3 className="text-xl sm:text-2xl font-black tracking-[-.035em] mt-4 leading-[1.08]">{p.title}</h3>
                      <p className="text-sm text-black/55 line-clamp-3 mt-3 leading-relaxed">{p.tldr}</p>
                      <div className="mt-auto pt-6 flex items-center justify-between gap-3 text-xs text-black/45">
                        <time dateTime={p.publishedAt}>{formatDate(p.publishedAt, lang)}</time>
                        <span className="font-bold text-black/65">{p.readingTime} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="rounded-[34px] bg-[#111111] px-7 py-10 sm:px-12 sm:py-14 text-white sm:flex items-center justify-between gap-10">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#F4B400] mb-3">Guestcam</p>
              <h2 className="text-3xl sm:text-5xl font-black tracking-[-.05em] leading-[1]">{t.ctaTitle}</h2>
              <p className="mt-4 text-white/65 leading-relaxed">{t.ctaBody}</p>
            </div>
            <Link href="/dashboard/new" className="mt-7 sm:mt-0 inline-flex shrink-0 items-center rounded-full bg-[#F4B400] px-6 py-3.5 text-sm font-black text-black hover:scale-[1.03] transition-transform">
              {t.ctaButton}
            </Link>
          </div>
        </section>
      </main>

      <SeoFooter lang={lang} />
    </div>
  );
}
