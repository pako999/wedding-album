import { PAGE_COVER_IMAGES, SUITE_LANGS, type PageDesign, type LocaleText, type PageSection } from './contracts';
import { DEFAULT_PAGE } from './page-design';
import { builderCopy } from './builder-copy';
import { presentationCopy } from './presentation-copy';

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
 const sections = starterSections(nextId);
 sections[0].title = translated(lang => presentationCopy(lang).sampleCeremony);
 for (const [position, key] of (['sampleCeremonyText', 'sampleReceptionText', 'sampleTravelText'] as const).entries()) {
  sections[position].fields[0].text = translated(lang => presentationCopy(lang)[key]);
 }
 return { ...applyPageStyle(DEFAULT_PAGE, 'garden'), title: translated(() => 'Ana & Marko'),
  subtitle: translated(lang => presentationCopy(lang).sampleSubtitle), sections };
}
