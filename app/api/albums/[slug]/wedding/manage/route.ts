import { translateWedding } from '@/lib/wedding/translate';
import { checkRateLimit } from '@/lib/rate-limit';
import { randomBytes } from 'node:crypto';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { weddingSettings } from '@/lib/wedding/schema';
import { weddingLang, parseWeddingSettings } from '@/lib/wedding/contracts';
import { ownerAccess, weddingForAlbum, safeSettings, reply, failure, sameOrigin, digest, activePremium } from '@/lib/wedding/server';
export const runtime = 'nodejs';
export const maxDuration = 60;
type Context = {params: Promise<{slug: string}>};
export async function GET(_req: NextRequest, {params}: Context) {
 try { const access = await ownerAccess((await params).slug); if (access.response) return access.response; const row = await weddingForAlbum(access.album!.id); return reply({settings: safeSettings(row), sourceLang: weddingLang(access.album!.defaultLang), hasDjLink: !!row?.djTokenHash, eligible: activePremium(access.album!), published: access.album!.isPublished}); } catch (error) { console.error('[wedding/manage]', error); return failure('unavailable', 503); }
}
export async function PUT(req: NextRequest, {params}: Context) {
 if (!sameOrigin(req)) return failure('forbidden', 403);
 try { const access = await ownerAccess((await params).slug); if (access.response) return access.response; if (!activePremium(access.album!)) return failure('premiumRequired', 403); let settings = parseWeddingSettings(await req.json().catch(() => null)); if (!settings) return failure('invalid', 400);
 let translationWarning = false;
 if (req.nextUrl.searchParams.get('translate') === '1') {
  try {
   const limit = await checkRateLimit(`wedding-translate:${access.album!.id}`, 3, 60_000);
   if (!limit.ok) throw new Error('rate_limited');
   settings = await translateWedding(settings, weddingLang(req.nextUrl.searchParams.get('source'), weddingLang(access.album!.defaultLang)));
  } catch { translationWarning = true; }
 }
 await db.insert(weddingSettings).values({albumId: access.album!.id, ...settings}).onConflictDoUpdate({target: weddingSettings.albumId, set: {...settings, updatedAt: new Date()}}); return reply({ok: true, settings, translationWarning}); } catch (error) { console.error('[wedding/manage/save]', error); return failure('unavailable', 503); }
}
export async function POST(req: NextRequest, {params}: Context) {
 if (!sameOrigin(req)) return failure('forbidden', 403);
 try { const {slug} = await params; const access = await ownerAccess(slug); if (access.response) return access.response; if (!activePremium(access.album!)) return failure('premiumRequired', 403);
 const body = await req.json().catch(() => null);
 if (body?.action === 'translate') {
  const settings = parseWeddingSettings(body.settings); if (!settings) return failure('invalid', 400);
  const limit = await checkRateLimit(`wedding-translate:${access.album!.id}`, 3, 60_000); if (!limit.ok) return limit.response;
  // Suggestions only: AI must never write over edits already queued by autosave.
  return reply({ settings: await translateWedding(settings, weddingLang(body.source, weddingLang(access.album!.defaultLang))) });
 }
 if (body?.action) return failure('invalid', 400);
 const token = randomBytes(32).toString('base64url'); const [row] = await db.insert(weddingSettings).values({ albumId: access.album!.id, djTokenHash: digest(token) }).onConflictDoUpdate({ target: weddingSettings.albumId, set: { djTokenHash: digest(token), updatedAt: new Date() } }).returning({ id: weddingSettings.albumId }); if (!row) return failure('saveFirst', 409); return reply({token, path: `/${encodeURIComponent(slug)}/dj#token=${token}`}); } catch (error) { console.error('[wedding/manage/dj]', error); return failure('unavailable', 503); }
}
