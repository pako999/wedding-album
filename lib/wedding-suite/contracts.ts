import { z } from 'zod';

export const SUITE_LANGS = ['sl', 'hr', 'sr', 'en', 'de', 'es'] as const;
export type SuiteLang = typeof SUITE_LANGS[number];
export const FEATURES = ['guestbook', 'video', 'seating', 'rsvp', 'capsule', 'story', 'travel', 'thanks'] as const;
export type Feature = typeof FEATURES[number];
const language = z.enum(SUITE_LANGS);
const text = z.string().trim().max(5000);
const short = z.string().trim().max(180);
const id = z.string().uuid();
export const localeTextSchema = z.object({ sl: text.optional(), hr: text.optional(), sr: text.optional(), en: text.optional(), de: text.optional(), es: text.optional() }).strict();
export type LocaleText = z.infer<typeof localeTextSchema>;
const safeUrl = z.string().max(2000).refine(value => !value || (() => { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } })(), 'invalid');
const translatedRow = z.object({ id, date: z.union([z.iso.date(), z.literal('')]).optional(), title: localeTextSchema, text: localeTextSchema, url: safeUrl.optional() }).strict();
export const configSchema = z.object({
  enabled: z.boolean(), defaultLang: language,
  features: z.object({ guestbook: z.boolean(), video: z.boolean(), seating: z.boolean(), rsvp: z.boolean(), capsule: z.boolean(), story: z.boolean(), travel: z.boolean(), thanks: z.boolean() }).strict(),
  welcome: localeTextSchema, invitation: localeTextSchema, thankYou: localeTextSchema,
  story: z.array(translatedRow).max(30), travel: z.array(translatedRow).max(30),
  menuOptions: z.array(z.object({ id, title: localeTextSchema }).strict()).max(20),
  tables: z.array(z.object({ id, name: short.min(1), capacity: z.number().int().min(1).max(100) }).strict()).max(100),
  seatingMapUrl: safeUrl, thankYouPhotoUrl: safeUrl,
  capsuleUnlockAt: z.iso.datetime({ offset: true }).nullable(),
  rsvpDeadline: z.iso.datetime({ offset: true }).nullable(),
  maxCompanions: z.number().int().min(0).max(10),
}).strict();
export type SuiteConfig = z.infer<typeof configSchema>;
export const EMPTY_SUITE: SuiteConfig = { enabled: false, defaultLang: 'sl',
  features: { guestbook: true, video: true, seating: true, rsvp: true, capsule: true, story: true, travel: true, thanks: true },
  welcome: {}, invitation: {}, thankYou: {}, story: [], travel: [], menuOptions: [], tables: [], seatingMapUrl: '', thankYouPhotoUrl: '',
  capsuleUnlockAt: null, rsvpDeadline: null, maxCompanions: 1,
};
export const attendeeSchema = z.object({ id: id.optional(), name: short.min(1), email: z.email().max(254), language,
  tableId: id.nullable(), allowedCompanions: z.number().int().min(0).max(10) }).strict();
export const rsvpSchema = z.object({ action: z.literal('rsvp'), language,
  attending: z.enum(['yes', 'no', 'maybe']), companions: z.array(short.min(1)).max(10),
  menuId: id.nullable(), note: z.string().trim().max(1000), notifications: z.boolean() }).strict();
export const entrySchema = z.object({ action: z.literal('entry'), kind: z.enum(['guestbook', 'video', 'capsule']),
  name: short.min(1), message: text, photoId: id.nullable(), language }).strict()
  .refine(value => value.kind === 'video' ? !!value.photoId : !!value.message, 'invalid');
export type EntryKind = 'guestbook' | 'video' | 'capsule';
export function suiteLang(value: unknown, fallback: SuiteLang = 'sl'): SuiteLang { return SUITE_LANGS.includes(value as SuiteLang) ? value as SuiteLang : fallback; }
/** Never display a different language as though it were the selected translation. */
export function localized(value: LocaleText, lang: SuiteLang): string { return value[lang]?.trim() || ''; }
export function capsuleIsOpen(unlock: string | null, now = Date.now()): boolean { return !!unlock && new Date(unlock).getTime() <= now; }
export function rsvpIsOpen(deadline: string | null, now = Date.now()): boolean { return !deadline || new Date(deadline).getTime() >= now; }
