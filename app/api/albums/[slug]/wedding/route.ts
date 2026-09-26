import { bunnyDisplayUrl } from '@/lib/storage/bunny';
import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { photos } from '@/lib/db/schema';
import { getAlbumFlags } from '@/lib/album-flags';
import { checkRateLimit } from '@/lib/rate-limit';
import { weddingSongRequests, weddingBingoSubmissions } from '@/lib/wedding/schema';
import { guestAccess, safeSettings, reply, failure, sameOrigin, readGuestToken, newGuestToken, guestHash, setGuestCookie } from '@/lib/wedding/server';
export const runtime = 'nodejs';
type Context = {params: Promise<{slug: string}>};
const songFields = {id: weddingSongRequests.id, title: weddingSongRequests.title, artist: weddingSongRequests.artist, requestedBy: weddingSongRequests.requestedBy, note: weddingSongRequests.note, status: weddingSongRequests.status, createdAt: weddingSongRequests.createdAt};
export async function GET(req: NextRequest, {params}: Context) {
 try {
  const data = await guestAccess(req, (await params).slug); if (!data) return failure('unavailable', 404);
  const token = readGuestToken(req) ?? newGuestToken(); const hash = guestHash(data.album.id, token);
  const [counts, songs, flags] = await Promise.all([
   db.select({id: weddingBingoSubmissions.challengeId, total: sql<number>`count(*)`, mine: sql<number>`count(*) filter (where ${weddingBingoSubmissions.guestTokenHash} = ${hash})`}).from(weddingBingoSubmissions).innerJoin(photos, and(eq(photos.id, weddingBingoSubmissions.photoId), eq(photos.albumId, data.album.id))).where(and(eq(weddingBingoSubmissions.albumId, data.album.id), eq(photos.status, 'published'))).groupBy(weddingBingoSubmissions.challengeId),
   db.select(songFields).from(weddingSongRequests).where(and(eq(weddingSongRequests.albumId, data.album.id), eq(weddingSongRequests.guestTokenHash, hash))).orderBy(desc(weddingSongRequests.createdAt)).limit(30),
   getAlbumFlags(data.album.id),
  ]);
  const latest = flags.albumPermission === 'upload_only' ? [] : await db.selectDistinctOn([weddingBingoSubmissions.challengeId], {challengeId: weddingBingoSubmissions.challengeId, blobUrl: photos.blobUrl, thumbnailUrl: photos.thumbnailUrl}).from(weddingBingoSubmissions).innerJoin(photos, and(eq(photos.id, weddingBingoSubmissions.photoId), eq(photos.albumId, data.album.id))).where(and(eq(weddingBingoSubmissions.albumId, data.album.id), eq(photos.status, 'published'))).orderBy(weddingBingoSubmissions.challengeId, desc(weddingBingoSubmissions.createdAt)).limit(25);
  const response = reply({...safeSettings(data.settings), name: data.album.coupleName, date: data.album.weddingDate, albumId: data.album.id, maxPhotos: data.album.maxPhotos, photoCount: data.album.photoCount + data.album.pendingCount, moderationEnabled: data.album.moderationEnabled, requireGuestData: flags.guestDataCapture, allowBingoUpload: flags.allowPhotos && flags.albumPermission !== 'view_only', latestPhotos: Object.fromEntries(latest.map(row => [row.challengeId, bunnyDisplayUrl(row.thumbnailUrl ?? row.blobUrl, 480, 82)])), completed: Object.fromEntries(counts.map(r => [r.id, Number(r.total)])), mine: Object.fromEntries(counts.map(r => [r.id, Number(r.mine)])), myRequests: songs});
  return setGuestCookie(response, req, token);
 } catch (error) { console.error('[wedding/guest]', error); return failure('unavailable', 503); }
}
export async function POST(req: NextRequest, {params}: Context) {
 if (!sameOrigin(req)) return failure('forbidden', 403);
 try {
  const limit = await checkRateLimit('wedding-song-venue', 120, 60_000); if (!limit.ok) return failure('rateLimited', 429);
  const data = await guestAccess(req, (await params).slug); if (!data) return failure('unavailable', 404); if (!data.settings.requestsOpen) return failure('requestsPaused', 403);
  const body = await req.json().catch(() => null); const title = typeof body?.title === 'string' ? body.title.trim() : ''; const artist = typeof body?.artist === 'string' ? body.artist.trim() : ''; const requestedBy = typeof body?.requestedBy === 'string' ? body.requestedBy.trim() : ''; const note = typeof body?.note === 'string' ? body.note.trim() : '';
  if (!title || title.length > 160 || !requestedBy || requestedBy.length > 80 || artist.length > 160 || note.length > 500) return failure('invalid', 400);
  const token = readGuestToken(req); if (!token) return failure('refreshFirst', 409); const hash = guestHash(data.album.id, token);
  const recent = await db.select({total: sql<number>`count(*)`}).from(weddingSongRequests).where(and(eq(weddingSongRequests.albumId, data.album.id), eq(weddingSongRequests.guestTokenHash, hash), gte(weddingSongRequests.createdAt, new Date(Date.now() - 300_000))));
  if (Number(recent[0]?.total ?? 0) >= 5) return failure('rateLimited', 429);
  await db.insert(weddingSongRequests).values({id: randomUUID(), albumId: data.album.id, guestTokenHash: hash, title, artist, requestedBy, note});
  return reply({ok: true}, 201);
 } catch (error) { console.error('[wedding/song]', error); return failure('unavailable', 503); }
}
