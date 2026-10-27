import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { suiteOwner, suiteFailure } from '@/lib/wedding-suite/server';
import { sameOrigin, reply } from '@/lib/wedding/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { isBunnyStorageConfigured, uploadToBunnyStorage } from '@/lib/storage/bunny';
import { WEDDING_IMAGE_MAX_EDGE, WEDDING_IMAGE_TYPES, WEDDING_IMAGE_UPLOAD_LIMIT } from '@/lib/wedding-suite/images';
export const runtime = 'nodejs';
export const maxDuration = 60;

/** Upload artwork only. The editor saves its URL through the existing autosave queue. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
 if (!sameOrigin(req)) return reply({ error: 'invalid' }, 403);
 try {
  const { album } = await suiteOwner((await params).slug);
  const limit = await checkRateLimit(`wedding-images:${album.id}`, 20, 60_000); if (!limit.ok) return limit.response;
  if (!isBunnyStorageConfigured()) return reply({ error: 'unavailable' }, 503);
  const type = req.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (!WEDDING_IMAGE_TYPES.some(allowed => allowed === type) || !req.body) return reply({ error: 'invalid_image' }, 400);
  if (Number(req.headers.get('content-length')) > WEDDING_IMAGE_UPLOAD_LIMIT) return reply({ error: 'too_large' }, 413);
  const reader = req.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try {
   for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > WEDDING_IMAGE_UPLOAD_LIMIT) { await reader.cancel(); return reply({ error: 'too_large' }, 413); }
    chunks.push(value);
   }
  } catch { return reply({ error: 'invalid_image' }, 400); }
  finally { reader.releaseLock(); }
  if (!size) return reply({ error: 'invalid_image' }, 400);
  let optimized: Buffer;
  try {
   const image = sharp(Buffer.concat(chunks), { limitInputPixels: 100_000_000 });
   const meta = await image.metadata();
   if (!['jpeg','png','webp','heif','avif'].includes(meta.format || '')) return reply({ error: 'invalid_image' }, 400);
   optimized = await image.rotate().resize({ width: WEDDING_IMAGE_MAX_EDGE, height: WEDDING_IMAGE_MAX_EDGE, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch { return reply({ error: 'invalid_image' }, 400); }
  try {
   const key = `albums/${album.id}/wedding-site/${crypto.randomUUID()}.webp`;
   const url = await uploadToBunnyStorage(new Blob([Uint8Array.from(optimized)]).stream(), key, 'image/webp');
   if (new URL(url).protocol !== 'https:') throw new Error('Invalid storage URL');
   return reply({ url });
  } catch { return reply({ error: 'unavailable' }, 502); }
 } catch (cause) { return suiteFailure(cause); }
}
