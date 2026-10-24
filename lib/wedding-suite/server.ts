import { neon } from '@neondatabase/serverless';
import { createHash, randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { albums, photos, type Album } from '@/lib/db/schema';
import { activePremium, ownerAccess, digest, reply } from '@/lib/wedding/server';
import { hasAlbumRequestAccess } from '@/lib/album-request-access';
import { bunnyDisplayUrl } from '@/lib/storage/bunny';
import { suiteSettings, suiteAttendees, suiteEntries, suiteEmails } from './schema';
import { EMPTY_SUITE, capsuleIsOpen, suiteLang, type SuiteConfig } from './contracts';
import { invitationToken, validInvitation } from './tokens';
import { weddingEmail, type MailKind } from './email';

export class SuiteError extends Error { constructor(public code: string, public status = 400) { super(code); } }
export function suiteFailure(cause: unknown) {
 if (cause instanceof SuiteError) return reply({ error: cause.code }, cause.status);
 console.error('[wedding-suite] Request failed', { type: cause instanceof Error ? cause.name : 'unknown' });
 return reply({ error: 'unavailable' }, 503);
}
export function assertSuiteEnvironment() {
 if (process.env.VERCEL_ENV === 'preview') {
  const host = process.env.DATABASE_URL && new URL(process.env.DATABASE_URL).hostname;
  if (!process.env.WEDDING_SUITE_DB_HOST || host !== process.env.WEDDING_SUITE_DB_HOST) throw new SuiteError('unavailable', 503);
 }
}
export async function settingsRecordFor(album: Album): Promise<{ config: SuiteConfig; configured: boolean }> {
 assertSuiteEnvironment();
 const [row] = await db.select().from(suiteSettings).where(eq(suiteSettings.albumId, album.id)).limit(1);
 return { config: row?.config || { ...EMPTY_SUITE, defaultLang: suiteLang(album.defaultLang) }, configured: !!row };
}
export async function settingsFor(album: Album): Promise<SuiteConfig> { return (await settingsRecordFor(album)).config; }
export async function suiteOwner(slug: string) {
 assertSuiteEnvironment();
 const access = await ownerAccess(slug);
 if (access.response || !access.album) throw new SuiteError('guestOnly', access.response?.status || 403);
 if (!activePremium(access.album)) throw new SuiteError('unavailable', 403);
 return { album: access.album, ...await settingsRecordFor(access.album) };
}
export async function suiteGuest(req: NextRequest, slug: string, invitation?: string) {
 assertSuiteEnvironment();
 const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
 if (!album || !album.isPublished || !activePremium(album)) throw new SuiteError('unavailable', 404);
 if (!await hasAlbumRequestAccess(req, slug, album) && !await attendeeFor(req, album, invitation)) throw new SuiteError('unavailable', 404);
 const config = await settingsFor(album);
 if (!config.enabled) throw new SuiteError('unavailable', 404);
 return { album, config };
}
export const suiteCookieName = (slug: string) => `gc_suite_${digest(slug).slice(0, 12)}`;
export async function attendeeFor(req: NextRequest, album: Album, supplied?: string) {
 const token = supplied || req.cookies.get(suiteCookieName(album.slug))?.value;
 if (!token || token.length > 100) return null;
 const id = token.split('.')[0];
 const [attendee] = await db.select().from(suiteAttendees).where(and(eq(suiteAttendees.albumId, album.id), eq(suiteAttendees.id, id))).limit(1);
 return attendee && validInvitation(token, attendee) ? attendee : null;
}
export function invitationPath(attendee: typeof suiteAttendees.$inferSelect, album: Album, section: 'rsvp' | 'thanks' | 'capsule' = 'rsvp') {
 return `/${encodeURIComponent(album.slug)}/celebrate?lang=${attendee.language}&section=${section}#invite=${invitationToken(attendee)}`;
}
export function setInvitation(response: ReturnType<typeof reply>, req: NextRequest, slug: string, token: string) {
 response.cookies.set(suiteCookieName(slug), token, { httpOnly: true, secure: new URL(req.url).protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 });
 return response;
}
export function safeAttendee(attendee: typeof suiteAttendees.$inferSelect | null) {
 if (!attendee) return null;
 const { tokenVersion: _, albumId: __, ...safe } = attendee;
 return safe;
}
export async function visibleEntries(album: Album, config: SuiteConfig, owner: boolean) {
 const rows = await db.select({ id: suiteEntries.id, kind: suiteEntries.kind, name: suiteEntries.name, message: suiteEntries.message,
  photoId: suiteEntries.photoId, language: suiteEntries.language, approved: suiteEntries.approved, createdAt: suiteEntries.createdAt,
  url: photos.blobUrl, mimeType: photos.mimeType, videoId: photos.cfStreamVideoId, mediaStatus: photos.status,
 }).from(suiteEntries).leftJoin(photos, and(eq(photos.id, suiteEntries.photoId), eq(photos.albumId, album.id)))
  .where(and(eq(suiteEntries.albumId, album.id), ...(!owner ? [eq(suiteEntries.approved, true)] : [])))
  .orderBy(desc(suiteEntries.createdAt)).limit(500);
 return rows.filter(row => owner || config.features[row.kind]).map(row => {
  if (row.kind === 'capsule' && !capsuleIsOpen(config.capsuleUnlockAt)) return { id: row.id, kind: row.kind, locked: true, createdAt: row.createdAt };
  if (!owner && row.photoId && row.mediaStatus !== 'published') return null;
  const { mediaStatus: _, ...safe } = row;
  return { ...safe, url: row.url && !row.videoId ? bunnyDisplayUrl(row.url) : row.url, locked: false };
 }).filter(Boolean);
}
export async function publicSuite(req: NextRequest, album: Album, config: SuiteConfig) {
 const [attendee, entries] = await Promise.all([attendeeFor(req, album), visibleEntries(album, config, false)]);
 return { album: { id: album.id, slug: album.slug, name: album.coupleName, date: album.weddingDate,
  maxPhotos: album.maxPhotos, photoCount: album.photoCount, passwordProtected: !!album.password, moderationEnabled: album.moderationEnabled },
  config, attendee: safeAttendee(attendee), entries, language: attendee?.language || config.defaultLang };
}
export async function queueMail(req: NextRequest, album: Album, config: SuiteConfig, attendee: typeof suiteAttendees.$inferSelect, kind: MailKind, requestId: string) {
 if (!attendee.notifications && kind !== 'invitation') return null;
 if (kind === 'capsule' && !capsuleIsOpen(config.capsuleUnlockAt)) throw new SuiteError('locked', 409);
 const origin = new URL(req.url).origin;
 const path = invitationPath(attendee, album, kind === 'thanks' ? 'thanks' : kind === 'capsule' ? 'capsule' : 'rsvp');
 // The request origin comes from the actual deployment, so preview links cannot point into production.
 const url = new URL(path, origin).href;
 const mail = weddingEmail({ kind, language: attendee.language, name: attendee.name, couple: album.coupleName,
  date: album.weddingDate, url, config });
 const id = createHash('sha256').update(`${album.id}:${attendee.id}:${kind}:${requestId}`).digest('hex');
 const send = process.env.VERCEL_ENV === 'production' && process.env.WEDDING_SUITE_SEND_EMAILS === '1';
 const [created] = await db.insert(suiteEmails).values({ id, albumId: album.id, attendeeId: attendee.id, kind, language: attendee.language,
  recipient: attendee.email, subject: mail.subject, html: mail.html, status: send ? 'sending' : 'preview' }).onConflictDoNothing().returning({ id: suiteEmails.id });
 if (!created) return id;
 if (send) {
  try {
   if (!process.env.RESEND_API_KEY) throw new Error('Mail not configured');
   const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.RESEND_FROM || 'GuestCam <noreply@guestcam.si>', to: [attendee.email], ...mail,
    tags: [{ name: 'category', value: `wedding_${kind}` }, { name: 'language', value: attendee.language }],
   }, { idempotencyKey: id });
   if (error || !data) throw new Error('Mail delivery failed');
   await db.update(suiteEmails).set({ status: 'sent', providerId: data.id }).where(eq(suiteEmails.id, id));
  } catch {
   await db.update(suiteEmails).set({ status: 'failed' }).where(eq(suiteEmails.id, id));
   throw new SuiteError('error', 503);
  }
 }
 return id;
}
export function nextId() { return randomUUID(); }

export async function suiteEnabled(album: Album) { try { return (await settingsFor(album)).enabled; } catch { return false; } }

/** Serialize RSVP writes per album; capacity is checked after the lock, in a fresh statement snapshot. */
export async function saveRsvp(album: Album, config: SuiteConfig, attendee: typeof suiteAttendees.$inferSelect,
 values: { language: typeof attendee.language; attending: 'yes' | 'no' | 'maybe'; companions: string[]; menuId: string | null; note: string; notifications: boolean }) {
 assertSuiteEnvironment();
 if (!process.env.DATABASE_URL) throw new SuiteError('unavailable', 503);
 const query = neon(process.env.DATABASE_URL);
 const capacity = config.tables.find(table => table.id === attendee.tableId)?.capacity || 100_000;
 const result = await query.transaction([
  query`SELECT pg_advisory_xact_lock(hashtext(${`guestcam:suite:rsvp:${album.id}`}))`,
  query`UPDATE wedding_suite_attendees SET
    language=${values.language}, attending=${values.attending}, companions=${JSON.stringify(values.companions)}::jsonb,
    menu_id=${values.menuId}, note=${values.note}, notifications=${values.notifications}, updated_at=now()
   WHERE id=${attendee.id} AND album_id=${album.id} AND table_id IS NOT DISTINCT FROM ${attendee.tableId}
    AND (${values.attending} <> 'yes' OR ${attendee.tableId}::text IS NULL OR
      (SELECT COALESCE(SUM(1 + jsonb_array_length(companions)), 0) FROM wedding_suite_attendees
       WHERE album_id=${album.id} AND table_id=${attendee.tableId} AND attending='yes' AND id<>${attendee.id})
      + 1 + ${values.companions.length} <= ${capacity})
   RETURNING id`,
 ]);
 if (!result[1]?.length) throw new SuiteError('invalid', 409);
 const [saved] = await db.select().from(suiteAttendees).where(and(eq(suiteAttendees.id, attendee.id), eq(suiteAttendees.albumId, album.id))).limit(1);
 return saved;
}
