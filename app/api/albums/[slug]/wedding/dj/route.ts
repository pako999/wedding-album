import { NextRequest } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { weddingSongRequests } from '@/lib/wedding/schema';
import { djAccess, reply, failure, sameOrigin } from '@/lib/wedding/server';
import type { SongStatus } from '@/lib/wedding/contracts';
export const runtime = 'nodejs';
type Context = {params: Promise<{slug: string}>};
export async function GET(req: NextRequest, {params}: Context) {
 try { const access = await djAccess(req, (await params).slug); if (!access) return failure('invalidDjLink', 403); const songs = await db.select({id: weddingSongRequests.id, title: weddingSongRequests.title, artist: weddingSongRequests.artist, requestedBy: weddingSongRequests.requestedBy, note: weddingSongRequests.note, status: weddingSongRequests.status, createdAt: weddingSongRequests.createdAt}).from(weddingSongRequests).where(eq(weddingSongRequests.albumId, access.album.id)).orderBy(asc(weddingSongRequests.createdAt)).limit(500); return reply({name: access.album.coupleName, requestsOpen: access.settings.requestsOpen, songs}); } catch (error) { console.error('[wedding/dj]', error); return failure('unavailable', 503); }
}
export async function PATCH(req: NextRequest, {params}: Context) {
 if (!sameOrigin(req)) return failure('forbidden', 403);
 try { const access = await djAccess(req, (await params).slug); if (!access) return failure('invalidDjLink', 403); const body = await req.json().catch(() => null); const statuses: SongStatus[] = ['new','accepted','played','declined']; if (typeof body?.id !== 'string' || !statuses.includes(body.status)) return failure('invalid', 400); const [row] = await db.update(weddingSongRequests).set({status: body.status}).where(and(eq(weddingSongRequests.id, body.id), eq(weddingSongRequests.albumId, access.album.id))).returning({id: weddingSongRequests.id}); return row ? reply({ok: true}) : failure('unavailable', 404); } catch (error) { console.error('[wedding/dj/update]', error); return failure('unavailable', 503); }
}
