import { randomBytes } from 'node:crypto';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { weddingSettings } from '@/lib/wedding/schema';
import { parseWeddingSettings } from '@/lib/wedding/contracts';
import { ownerAccess, weddingForAlbum, safeSettings, reply, failure, sameOrigin, digest, activePremium } from '@/lib/wedding/server';
export const runtime = 'nodejs';
type Context = {params: Promise<{slug: string}>};
export async function GET(_req: NextRequest, {params}: Context) {
 try { const access = await ownerAccess((await params).slug); if (access.response) return access.response; const row = await weddingForAlbum(access.album!.id); return reply({settings: safeSettings(row), hasDjLink: !!row?.djTokenHash, eligible: activePremium(access.album!), published: access.album!.isPublished}); } catch (error) { console.error('[wedding/manage]', error); return failure('unavailable', 503); }
}
export async function PUT(req: NextRequest, {params}: Context) {
 if (!sameOrigin(req)) return failure('forbidden', 403);
 try { const access = await ownerAccess((await params).slug); if (access.response) return access.response; if (!activePremium(access.album!)) return failure('premiumRequired', 403); const settings = parseWeddingSettings(await req.json().catch(() => null)); if (!settings) return failure('invalid', 400); await db.insert(weddingSettings).values({albumId: access.album!.id, ...settings}).onConflictDoUpdate({target: weddingSettings.albumId, set: {...settings, updatedAt: new Date()}}); return reply({ok: true, settings}); } catch (error) { console.error('[wedding/manage/save]', error); return failure('unavailable', 503); }
}
export async function POST(req: NextRequest, {params}: Context) {
 if (!sameOrigin(req)) return failure('forbidden', 403);
 try { const {slug} = await params; const access = await ownerAccess(slug); if (access.response) return access.response; if (!activePremium(access.album!)) return failure('premiumRequired', 403); const token = randomBytes(32).toString('base64url'); const [row] = await db.update(weddingSettings).set({djTokenHash: digest(token), updatedAt: new Date()}).where(eq(weddingSettings.albumId, access.album!.id)).returning({id: weddingSettings.albumId}); if (!row) return failure('saveFirst', 409); return reply({token, path: `/${encodeURIComponent(slug)}/dj#token=${token}`}); } catch (error) { console.error('[wedding/manage/dj]', error); return failure('unavailable', 503); }
}
