import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { albums, type Album } from '@/lib/db/schema';
import { checkAlbumOwnership } from '@/lib/album-ownership';
import { hasAlbumRequestAccess } from '@/lib/album-request-access';
import { weddingSettings } from './schema';
import { type WeddingSettings } from './contracts';

export const PRIVATE_HEADERS = {'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer'};
export const GUEST_COOKIE = 'gc_wedding_guest';
export function reply(data: unknown, status = 200) { return NextResponse.json(data, {status, headers: PRIVATE_HEADERS}); }
export function failure(error: string, status: number) { return reply({error}, status); }
export function sameOrigin(req: NextRequest) { const origin = req.headers.get('origin'); return !origin || origin === new URL(req.url).origin; }
export function digest(token: string) { return createHash('sha256').update(token).digest('hex'); }
export function readGuestToken(req: NextRequest) { const token = req.cookies.get(GUEST_COOKIE)?.value; return token && /^[\w-]{43}$/.test(token) ? token : null; }
export function newGuestToken() { return randomBytes(32).toString('base64url'); }
export function guestHash(albumId: string, token: string) { return digest(`guestcam:wedding:${albumId}:${token}`); }
export function setGuestCookie(response: NextResponse, req: NextRequest, token: string) { response.cookies.set(GUEST_COOKIE, token, {httpOnly: true, secure: new URL(req.url).protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30}); return response; }
export function safeSettings(row?: Partial<WeddingSettings> | null): WeddingSettings { return {enabled: row?.enabled ?? false, requestsOpen: row?.requestsOpen ?? true, schedule: row?.schedule ?? [], menu: row?.menu ?? [], challenges: row?.challenges ?? []}; }
export function activePremium(album: Album) { return album.plan === 'premium' && (!album.expiresAt || album.expiresAt.getTime() > Date.now()); }
export async function albumBySlug(slug: string) { return db.query.albums.findFirst({where: eq(albums.slug, slug)}); }
export async function weddingForAlbum(albumId: string) { const [row] = await db.select().from(weddingSettings).where(eq(weddingSettings.albumId, albumId)).limit(1); return row ?? null; }
// Optional gallery entry must never make an existing album unavailable.
export async function weddingEnabled(album: Album) { if (!activePremium(album)) return false; try { return !!(await weddingForAlbum(album.id))?.enabled; } catch (error) { console.error('[wedding] Optional settings unavailable; album remains accessible', error); return false; } }
export async function ownerAccess(slug: string) { const album = await albumBySlug(slug); if (!album) return {response: failure('unavailable', 404)}; const owner = await checkAlbumOwnership(album); if (!owner.ok) return {response: failure(owner.status === 401 ? 'signIn' : 'forbidden', owner.status)}; return {album, owner}; }
export async function guestAccess(req: NextRequest, slug: string) { const album = await albumBySlug(slug); if (!album || !album.isPublished || !activePremium(album)) return null; if (!await hasAlbumRequestAccess(req, slug, album)) return null; const settings = await weddingForAlbum(album.id); return settings?.enabled ? {album, settings} : null; }
export async function djAccess(req: NextRequest, slug: string) { const album = await albumBySlug(slug); if (!album || !album.isPublished || !activePremium(album)) return null; const token = req.headers.get('authorization')?.match(/^Bearer ([\w-]{43})$/)?.[1]; if (!token) return null; const settings = await weddingForAlbum(album.id); if (!settings?.enabled || !settings.djTokenHash || !/^[a-f0-9]{64}$/.test(settings.djTokenHash)) return null; const valid = timingSafeEqual(Buffer.from(digest(token), 'hex'), Buffer.from(settings.djTokenHash, 'hex')); return valid ? {album, settings} : null; }
export async function bingoUploadContext(req: NextRequest, album: Album, challengeId: unknown) {
  if (challengeId === undefined || challengeId === null || challengeId === '') return null;
  if (typeof challengeId !== 'string' || !/^[\w-]{1,80}$/.test(challengeId) || !activePremium(album)) throw new Error('invalid');
  const settings = await weddingForAlbum(album.id); const token = readGuestToken(req);
  if (!settings?.enabled || !settings.challenges.some(c => c.id === challengeId) || !token) throw new Error('unavailable');
  return {challengeId, guestTokenHash: guestHash(album.id, token)};
}
