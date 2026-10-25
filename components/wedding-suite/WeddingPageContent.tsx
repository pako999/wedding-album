import { localized, type PageDesign, type SuiteLang } from '@/lib/wedding-suite/contracts';
import { DEFAULT_PAGE, FONT_FAMILIES, fieldTheme, pageTheme, safePageLink } from '@/lib/wedding-suite/page-design';

/** The same saved text and styling are used in the organizer preview and guest page. */
export function WeddingPageContent({ page = DEFAULT_PAGE, lang, showTitle = true }: { page?: PageDesign; lang: SuiteLang; showTitle?: boolean }) {
  return <div className="space-y-5 rounded-3xl p-5 sm:p-7" style={pageTheme(page)}>
    {showTitle && localized(page.title, lang) && <h2 className="break-words text-4xl" style={{ color: page.accent, fontFamily: FONT_FAMILIES[page.headingFont] }}>{localized(page.title, lang)}</h2>}
    {page.sections.filter(section => section.visible).map(section => <section key={section.id} className="space-y-4 border-b border-current/15 pb-6 last:border-0">
      {localized(section.title, lang) && <h2 className="break-words text-3xl" style={{ color: page.accent, fontFamily: FONT_FAMILIES[page.headingFont] }}>{localized(section.title, lang)}</h2>}
      {section.fields.map(field => {
        const text = localized(field.text, lang);
        if (!text) return null;
        const style = fieldTheme(field, page);
        return field.type === 'heading' ? <h3 key={field.id} className="whitespace-pre-wrap break-words text-2xl" style={style}>{text}</h3>
          : field.type === 'link' && safePageLink(field.url) ? <a key={field.id} className="inline-block max-w-full break-words underline underline-offset-4" href={safePageLink(field.url)} target="_blank" rel="noopener noreferrer" style={style}>{text} ↗</a>
          : <p key={field.id} className="whitespace-pre-wrap break-words leading-7" style={style}>{text}</p>;
      })}
    </section>)}
  </div>;
}
