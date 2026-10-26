import { PAGE_COVER_IMAGES, SUITE_LANGS, type PageDesign, type LocaleText, type PageSection } from './contracts';
import { DEFAULT_PAGE } from './page-design';
import { builderCopy } from './builder-copy';
import { DEMO_WEDDING, weddingDemo, weddingDemoCopy } from '@/lib/wedding/demo';
import { weddingCopy } from '@/lib/wedding/copy';

export const PAGE_STYLES = {
 garden: { headingFont: 'elegant', bodyFont: 'modern', background: '#ffffff', textColor: '#272b25', accent: '#465c42', image: PAGE_COVER_IMAGES[0] },
 timeless: { headingFont: 'classic', bodyFont: 'modern', background: '#fffdf8', textColor: '#292524', accent: '#805842', image: PAGE_COVER_IMAGES[1] },
 modern: { headingFont: 'modern', bodyFont: 'modern', background: '#ffffff', textColor: '#202625', accent: '#365c5b', image: PAGE_COVER_IMAGES[2] },
} as const;
export type PageStyle = keyof typeof PAGE_STYLES;

export function applyPageStyle(page: PageDesign, style: PageStyle): PageDesign {
 const { image, ...appearance } = PAGE_STYLES[style];
 return { ...page, ...appearance, coverImageUrl: image };
}
function translated(text: (lang: typeof SUITE_LANGS[number]) => string): LocaleText {
 return Object.fromEntries(SUITE_LANGS.map(lang => [lang, text(lang)]));
}
/** Start with structure, without publishing sample dates, places or names to a real event. */
export function starterSections(nextId: () => string = () => crypto.randomUUID()): PageSection[] {
 return (['ceremony', 'reception', 'travel'] as const).map(category => ({ id: nextId(), category, visible: true,
  title: translated(lang => builderCopy(lang)[category]), fields: [{ id: nextId(), type: 'text', text: {} }],
 }));
}
/** Explicitly labelled, multilingual demo content; never an organizer's actual event. */
export function sampleWeddingPage(): PageDesign {
 let index = 0;
 const nextId = () => `52000000-0000-4000-8000-${String(++index).padStart(12, '0')}`;
 const categories = ['custom', 'ceremony', 'reception', 'travel', 'accommodation', 'custom'] as const;
 const sections: PageSection[] = categories.map((category, index) => ({
  id: nextId(), category, visible: true,
  title: translated(lang => weddingDemoCopy(lang).page[index][0]),
  fields: [{ id: nextId(), type: 'text', text: translated(lang => weddingDemoCopy(lang).page[index][1]) }],
 }));
 // The website and event walkthrough start from the same program and dishes.
 sections.splice(3, 0, ...(['schedule', 'menu'] as const).map(kind => ({
  id: nextId(), category: 'custom' as const, visible: true,
  title: translated(lang => weddingCopy(lang)[kind]),
  fields: weddingDemo('sl')[kind].map((_, index) => ({ id: nextId(), type: 'text' as const,
   text: translated(lang => {
    const row = weddingDemo(lang)[kind][index];
    return `${row.time ? `${row.time} · ` : ''}${row.title}\n${row.detail}`;
   }),
  })),
 })));
 return { ...applyPageStyle(DEFAULT_PAGE, 'garden'), title: translated(() => DEMO_WEDDING.names),
  subtitle: translated(lang => weddingDemoCopy(lang).subtitle), sections };
}
