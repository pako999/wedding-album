import { configSchema, SUITE_LANGS, type SuiteConfig, type LocaleText } from './contracts';

/** PostgreSQL jsonb can reorder keys. Whitespace normalization must not erase a typing buffer. */
export function suiteSnapshot(config: SuiteConfig): string {
 const parsed = configSchema.safeParse(config);
 return JSON.stringify(parsed.success ? parsed.data : config, (_key, value) =>
  value && typeof value === 'object' && !Array.isArray(value)
   ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])) : value);
}

/** Recover unfinished input without relaxing the server's save contract. */
export function isRecoverableSuiteDraft(value: unknown): value is SuiteConfig {
 const parsed = configSchema.safeParse(value);
 if (parsed.success) return true;
 return parsed.error.issues.every(issue => {
  const path = issue.path;
  const last = path.at(-1);
  if (issue.code === 'custom') {
   return (path.length === 1 && (last === 'seatingMapUrl' || last === 'thankYouPhotoUrl')) ||
    (path.length === 2 && path[0] === 'page' && last === 'coverImageUrl') ||
    (path.length === 3 && (path[0] === 'story' || path[0] === 'travel') && last === 'url') ||
    (path[0] === 'page' && path[1] === 'sections' && path[3] === 'fields' && (path.length === 5 || (path.length === 6 && last === 'url')));
  }
  if (issue.code !== 'too_small' && issue.code !== 'too_big') return false;
  return (path.length === 3 && path[0] === 'tables' && (last === 'name' || last === 'capacity')) || (path.length === 1 && last === 'maxCompanions');
 });
}

function textFields(config: SuiteConfig): Map<string, LocaleText> {
 const fields = new Map<string, LocaleText>([['welcome', config.welcome], ['invitation', config.invitation], ['thankYou', config.thankYou]]);
 for (const group of ['story', 'travel', 'menuOptions'] as const) for (const row of config[group]) {
  fields.set(`${group}:${row.id}:title`, row.title);
  if ('text' in row) fields.set(`${group}:${row.id}:text`, row.text);
 }
 if (config.page) {
  fields.set('page:title', config.page.title);
  if (config.page.subtitle) fields.set('page:subtitle', config.page.subtitle);
  for (const section of config.page.sections) {
   fields.set(`section:${section.id}:title`, section.title);
   for (const field of section.fields) fields.set(`section:${section.id}:field:${field.id}`, field.text);
  }
 }
 return fields;
}

export function translationFingerprint(config: SuiteConfig): string | null {
 const fields = [...textFields(config)];
 if (!fields.some(([, text]) => SUITE_LANGS.some(lang => text[lang]?.trim()) && SUITE_LANGS.some(lang => !text[lang]?.trim()))) return null;
 return JSON.stringify([config.defaultLang, fields]);
}

/** AI may fill blanks only in unchanged text fields; preserve newer text, styles and row order. */
export function mergeSuiteTranslations(current: SuiteConfig, source: SuiteConfig, translated: SuiteConfig): SuiteConfig {
 const result = structuredClone(current);
 const before = textFields(source), after = textFields(translated);
 for (const [key, text] of textFields(result)) {
  const original = before.get(key), completed = after.get(key);
  if (!original || !completed || JSON.stringify(original) !== JSON.stringify(text)) continue;
  for (const lang of SUITE_LANGS) if (!text[lang]?.trim() && completed[lang]?.trim()) text[lang] = completed[lang];
 }
 return result;
}
