import type { CSSProperties } from 'react';
import type { PageDesign, PageField } from './contracts';

export const DEFAULT_PAGE: PageDesign = {
  title: {}, headingFont: 'elegant', bodyFont: 'modern',
  background: '#fcfaf6', textColor: '#1c1917', accent: '#92400e', sections: [],
};
export const FONT_FAMILIES = {
  elegant: 'var(--font-cormorant, Georgia), Georgia, serif',
  modern: 'var(--font-dm-sans, Arial), Arial, sans-serif',
  classic: 'Georgia, "Times New Roman", serif',
  handwritten: '"Segoe Print", "Bradley Hand", cursive',
};

export function pageTheme(page = DEFAULT_PAGE): CSSProperties {
  return { backgroundColor: page.background, color: page.textColor, fontFamily: FONT_FAMILIES[page.bodyFont] };
}
export function fieldTheme(field: PageField, page = DEFAULT_PAGE): CSSProperties {
  return { color: field.color ?? (field.type === 'text' ? page.textColor : page.accent),
    fontFamily: FONT_FAMILIES[field.font ?? (field.type === 'heading' ? page.headingFont : page.bodyFont)] };
}
/** The live editor also renders unsaved drafts; keep unfinished/unsafe links inert. */
export function safePageLink(value?: string): string | undefined {
  try {
    const url = new URL(value || '');
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}
/** Keep both drag/drop and keyboard reordering immutable and bounded. */
export function movePageItem<T extends { id: string }>(items: T[], id: string, destination: number): T[] {
  const index = items.findIndex(item => item.id === id);
  if (index < 0 || destination < 0 || destination >= items.length || index === destination) return items;
  const result = [...items]; const [item] = result.splice(index, 1); result.splice(destination, 0, item);
  return result;
}
