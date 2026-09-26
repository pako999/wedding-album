import type { Lang } from '@/lib/i18n/translations';

export type WeddingRow = { id: string; title: string; detail: string; time?: string };
export type WeddingSettings = { enabled: boolean; requestsOpen: boolean; schedule: WeddingRow[]; menu: WeddingRow[]; challenges: WeddingRow[] };
export type SongStatus = 'new' | 'accepted' | 'played' | 'declined';
export type WeddingSong = { id: string; title: string; artist: string; requestedBy: string; note: string; status: SongStatus; createdAt: string };
export type WeddingGuestData = WeddingSettings & { name: string; date: string; albumId: string; maxPhotos: number; photoCount: number; moderationEnabled: boolean; requireGuestData: boolean; allowBingoUpload: boolean; latestPhotos: Record<string, string>; completed: Record<string, number>; mine: Record<string, number>; myRequests: WeddingSong[] };
export const WEDDING_PATHS: Record<Lang, string> = { sl: '/porocni-paket', hr: '/hr/vjencani-paket', sr: '/sr/vencani-paket', en: '/en/wedding-package', de: '/de/hochzeitspaket', es: '/es/paquete-boda' };
export const WEDDING_LANGS: Lang[] = ['sl', 'hr', 'sr', 'en', 'de', 'es'];
export function weddingLang(value: unknown, fallback: Lang = 'sl'): Lang { return WEDDING_LANGS.includes(value as Lang) ? value as Lang : fallback; }
export const EMPTY_WEDDING: WeddingSettings = { enabled: false, requestsOpen: true, schedule: [], menu: [], challenges: [] };
export function parseWeddingSettings(value: unknown): WeddingSettings | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.enabled !== 'boolean' || typeof v.requestsOpen !== 'boolean') return null;
  function rows(key: string, max: number): WeddingRow[] | null {
    const data = v[key];
    if (!Array.isArray(data) || data.length > max) return null;
    const ids = new Set<string>(); const result: WeddingRow[] = [];
    for (const item of data) {
      if (!item || typeof item !== 'object') return null;
      const {id, title, detail, time} = item;
      if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id) || ids.has(id) || typeof title !== 'string' || !title.trim() || title.length > 160 || typeof detail !== 'string' || detail.length > 1000 || (time !== undefined && (typeof time !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)))) return null;
      ids.add(id); result.push({id, title: title.trim(), detail: detail.trim(), ...(time ? {time} : {})});
    }
    return result;
  }
  const schedule = rows('schedule', 40), menu = rows('menu', 40), challenges = rows('challenges', 25);
  return schedule && menu && challenges ? {enabled: v.enabled, requestsOpen: v.requestsOpen, schedule, menu, challenges} : null;
}
