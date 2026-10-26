import { parseWeddingSettings, WEDDING_LANGS, type WeddingSettings } from './contracts';

export function weddingSnapshot(settings: WeddingSettings): string {
 return JSON.stringify(parseWeddingSettings(settings) ?? settings, (_key, value) =>
  value && typeof value === 'object' && !Array.isArray(value)
   ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])) : value);
}
export function recoverableWeddingDraft(value: unknown): value is WeddingSettings {
 if (!value || typeof value !== 'object') return false;
 const copy = structuredClone(value) as WeddingSettings;
 for (const key of ['schedule', 'menu', 'challenges'] as const) {
  if (!Array.isArray(copy[key])) return false;
  for (const row of copy[key]) {
   if (!row || typeof row.title !== 'string') return false;
   // Empty rows and time inputs are unfinished local drafts, never valid server writes.
   if (!row.title.trim()) row.title = 'draft';
   if (row.time === '') delete row.time;
  }
 }
 return !!parseWeddingSettings(copy);
}
export const weddingSaveContract = {
 parse: parseWeddingSettings, snapshot: weddingSnapshot, recoverable: recoverableWeddingDraft,
 response: (result: Record<string, unknown>) => result.settings, storagePrefix: 'wedding-program-draft',
};
export function weddingTranslationFingerprint(settings: WeddingSettings): string | null {
 const rows = [...settings.schedule, ...settings.menu, ...settings.challenges];
 return rows.some(row => WEDDING_LANGS.some(lang => lang !== row.sourceLang &&
  (!row.translations?.[lang]?.title?.trim() || (!!row.detail.trim() && !row.translations?.[lang]?.detail?.trim()))))
  ? weddingSnapshot(settings) : null;
}
export function mergeWeddingTranslations(current: WeddingSettings, source: WeddingSettings, translated: WeddingSettings): WeddingSettings {
 const result = structuredClone(current);
 for (const group of ['schedule', 'menu', 'challenges'] as const) for (const row of result[group]) {
  const before = source[group].find(item => item.id === row.id), after = translated[group].find(item => item.id === row.id);
  if (!before || !after || row.sourceLang !== before.sourceLang) continue;
  for (const field of ['title', 'detail'] as const) {
   if (row[field] !== before[field]) continue;
   const unchanged = WEDDING_LANGS.every(other => row.translations?.[other]?.[field] === before.translations?.[other]?.[field]);
   if (!unchanged) continue;
   for (const lang of WEDDING_LANGS) {
    if (lang === row.sourceLang || row.translations?.[lang]?.[field]?.trim() || !after.translations?.[lang]?.[field]?.trim()) continue;
    // Preserve edits in any language made while AI was working on this field.
    row.translations = { ...row.translations, [lang]: { ...row.translations?.[lang], [field]: after.translations[lang]![field] } };
   }
  }
 }
 return result;
}
