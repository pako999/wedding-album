import { localized, type PageDesign, type SuiteLang } from '@/lib/wedding-suite/contracts';
import { DEFAULT_PAGE, FONT_FAMILIES, fieldTheme, pageTheme, pageCoverSource, safePageLink } from '@/lib/wedding-suite/page-design';
import { presentationCopy } from '@/lib/wedding-suite/presentation-copy';

/** This is the real guest presentation, also used by the editor and public demo. */
export function WeddingPageContent({ page = DEFAULT_PAGE, lang, showTitle = true, fallbackTitle, meta, intro, headingLevel = 2, idPrefix = '', showcaseStyle = false }: {
 page?: PageDesign; lang: SuiteLang; showTitle?: boolean; fallbackTitle?: string; meta?: string; intro?: string; headingLevel?: 1 | 2; idPrefix?: string; showcaseStyle?: boolean;
}) {
 const t = presentationCopy(lang);
 const title = localized(page.title, lang) || fallbackTitle;
 const photo = pageCoverSource(page.coverImageUrl);
 const sections = page.sections.filter(section => section.visible);
 const Heading = headingLevel === 1 ? 'h1' : 'h2';
 return <div data-wedding-page-content className={`min-w-0 overflow-hidden rounded-2xl [overflow-wrap:anywhere] ${showcaseStyle ? "border border-stone-200 shadow-sm" : ""}`} style={pageTheme(page)}>
  {showTitle && <div data-wedding-cover className={`relative isolate grid min-h-72 place-items-center overflow-hidden px-6 py-14 text-center sm:min-h-96 sm:px-10 ${photo ? 'bg-stone-900 text-white' : 'border-b border-current/10'}`}>
   {photo && <><img src={photo} alt={t.photoAlt} width={1600} height={1067} fetchPriority={headingLevel === 1 ? 'high' : 'auto'} className="absolute inset-0 z-0 h-full w-full object-cover" /><div className="pointer-events-none absolute inset-0 z-10 bg-black/55" /></>}
   <div className="relative z-20 max-w-xl"><p className={`text-xs font-semibold uppercase tracking-[.2em] ${photo ? 'text-white' : ''}`}>{t.ourWedding}</p>
    <Heading className="my-5 text-5xl leading-[1.12] sm:text-6xl" style={{ fontFamily: FONT_FAMILIES[page.headingFont] }}>{title || t.yourNames}</Heading>
    {meta && <p className="text-sm font-medium leading-6">{meta}</p>}
    {localized(page.subtitle || {}, lang) && <p className="mx-auto mt-5 max-w-md text-base leading-7">{localized(page.subtitle || {}, lang)}</p>}
   </div>
  </div>}
  {sections.length > 1 && <nav aria-label={t.content} className={`flex flex-wrap justify-center gap-x-5 gap-y-3 border-b border-current/10 px-5 py-5 text-xs font-semibold sm:text-sm ${showcaseStyle ? "bg-white/80 backdrop-blur" : ""}`}>{sections.map(section => <a key={section.id} href={`#${idPrefix}section-${section.id}`} className="underline-offset-4 hover:underline">{localized(section.title, lang)}</a>)}</nav>}
  {intro && <p className="mx-auto max-w-2xl whitespace-pre-line px-6 pt-10 text-center text-base leading-8 sm:px-10">{intro}</p>}
  <div className={`mx-auto max-w-4xl px-5 sm:px-10 ${showcaseStyle ? "space-y-5 py-6 sm:space-y-7 sm:py-10" : "max-w-3xl"}`}>{sections.map(section => <section id={`${idPrefix}section-${section.id}`} key={section.id} className={`scroll-mt-32 space-y-5 ${showcaseStyle ? "rounded-3xl border border-stone-200/80 bg-white/90 px-5 py-7 shadow-[0_10px_30px_rgba(54,45,33,.06)] sm:px-10 sm:py-10" : "border-b border-current/10 py-9 last:border-0 sm:py-12"}`}>
   {localized(section.title, lang) && <><h2 className={`text-3xl leading-tight sm:text-4xl ${showcaseStyle ? "text-center" : ""}`} style={{ color: page.accent, fontFamily: FONT_FAMILIES[page.headingFont] }}>{localized(section.title, lang)}</h2>{showcaseStyle && <div className="mx-auto h-px w-14" style={{ backgroundColor: page.accent }} />}</>}
   {section.fields.map(field => {
    const text = localized(field.text, lang);
    if (field.type === 'image') {
     const src = safePageLink(field.url); if (!src) return null;
     return <figure key={field.id} className="space-y-3"><img src={src} alt={text} width={1600} height={1067} loading="lazy" className="h-auto w-full rounded-2xl object-contain" />{text && <figcaption className="text-center text-sm leading-6" style={{ color: page.textColor }}>{text}</figcaption>}</figure>;
    }
    if (!text) return null;
    const style = fieldTheme(field, page);
    const lines = text.split(/\r?\n/);
    const timed = lines[0]?.match(/^(\d{1,2}:\d{2})\s*[·•–-]\s*(.+)$/);
    if (showcaseStyle && field.type === 'text' && timed) return <article key={field.id} className="flex gap-4 rounded-2xl border border-stone-200 bg-[#fffdf9] p-4 sm:p-5"><span className="h-fit shrink-0 rounded-xl px-3 py-2 text-sm font-bold" style={{ color: page.accent, backgroundColor: page.accent + "14" }}>{timed[1]}</span><div className="min-w-0"><h3 className="font-serif text-xl leading-snug" style={{ color: page.textColor }}>{timed[2]}</h3>{lines.slice(1).join("\n").trim() && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">{lines.slice(1).join("\n").trim()}</p>}</div></article>;
    if (showcaseStyle && field.type === 'text' && lines.length > 1 && lines[0].trim().length <= 90) return <article key={field.id} className="rounded-2xl border border-stone-200 bg-[#fffdf9] p-4 sm:p-5"><h3 className="font-serif text-xl leading-snug" style={{ color: page.accent }}>{lines[0]}</h3>{lines.slice(1).join("\n").trim() && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-600">{lines.slice(1).join("\n").trim()}</p>}</article>;
    return field.type === 'heading' ? <h3 key={field.id} className={"whitespace-pre-wrap text-2xl leading-snug " + (showcaseStyle ? "font-serif" : "")} style={style}>{text}</h3>
     : field.type === 'link' && safePageLink(field.url) ? <a key={field.id} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-current/25 px-4 py-3 text-sm font-semibold underline-offset-4 hover:underline" href={safePageLink(field.url)} target="_blank" rel="noopener noreferrer" style={style}>{text} ↗</a>
     : <p key={field.id} className={"whitespace-pre-wrap text-base leading-8 " + (showcaseStyle ? "rounded-2xl border border-stone-200 bg-[#fffdf9] p-4 sm:p-5" : "")} style={style}>{text}</p>;
   })}
  </section>)}</div>
 </div>;
}
