import { NextRequest } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { photos } from '@/lib/db/schema';
import { checkRateLimit } from '@/lib/rate-limit';
import { reply, sameOrigin, readGuestToken, newGuestToken, guestHash, setGuestCookie } from '@/lib/wedding/server';
import { suiteAttendees, suiteEntries } from '@/lib/wedding-suite/schema';
import { rsvpSchema, entrySchema, rsvpIsOpen } from '@/lib/wedding-suite/contracts';
import { SuiteError, suiteFailure, suiteGuest, attendeeFor, setInvitation, publicSuite, nextId, queueMail, saveRsvp } from '@/lib/wedding-suite/server';
export const runtime = 'nodejs';
type Context = { params: Promise<{ slug: string }> };
export async function GET(req: NextRequest, { params }: Context) {
 try {
  const { album, config } = await suiteGuest(req, (await params).slug);
  const token = readGuestToken(req) || newGuestToken();
  return setGuestCookie(reply(await publicSuite(req, album, config)), req, token);
 } catch (error) { return suiteFailure(error); }
}
export async function POST(req: NextRequest, { params }: Context) {
 if (!sameOrigin(req)) return reply({ error: 'invalid' }, 403);
 const limit = await checkRateLimit('wedding-suite-guest', 180, 60_000); if (!limit.ok) return limit.response;
 try {
  const body = await req.json(); if (!body || typeof body !== 'object') throw new SuiteError('invalid');
  const { album, config } = await suiteGuest(req, (await params).slug, body.action === 'invite' ? body.token : undefined);
  if (body.action === 'invite') {
   const attendee = typeof body.token === 'string' && await attendeeFor(req, album, body.token);
   if (!attendee) throw new SuiteError('guestOnly', 403);
   return setInvitation(reply({ ok: true, language: attendee.language }), req, album.slug, body.token);
  }
  if (body.action === 'preferences') {
   if (!['sl','hr','sr','en','de','es'].includes(body.language) || typeof body.notifications !== 'boolean') throw new SuiteError('invalid');
   const attendee = await attendeeFor(req, album); if (!attendee) throw new SuiteError('guestOnly', 403);
   await db.update(suiteAttendees).set({ language: body.language, notifications: body.notifications, updatedAt: new Date() }).where(and(eq(suiteAttendees.id, attendee.id), eq(suiteAttendees.albumId, album.id)));
   return reply({ ok: true });
  }
  if (body.action === 'rsvp') {
   const parsed = rsvpSchema.safeParse(body); if (!parsed.success || !config.features.rsvp) throw new SuiteError('invalid');
   if (!rsvpIsOpen(config.rsvpDeadline)) throw new SuiteError('closed', 409);
   const attendee = await attendeeFor(req, album); if (!attendee) throw new SuiteError('guestOnly', 403);
   if (parsed.data.companions.length > Math.min(config.maxCompanions, attendee.allowedCompanions) ||
      (parsed.data.menuId && !config.menuOptions.some(m => m.id === parsed.data.menuId))) throw new SuiteError('invalid');
   const { action: _, ...values } = parsed.data;
   if (values.attending !== 'yes') { values.companions = []; values.menuId = null; }
   const saved = await saveRsvp(album, config, attendee, values);
   await queueMail(req, album, config, saved, 'rsvp', nextId());
   return reply({ ok: true, language: saved.language });
  }
  if (body.action === 'seating') {
   if (!config.features.seating || typeof body.name !== 'string' || body.name.length > 180) throw new SuiteError('invalid');
   const attendee = await attendeeFor(req, album);
   let tableId = attendee?.tableId;
   if (!attendee) {
    const matching = await db.select({ tableId: suiteAttendees.tableId }).from(suiteAttendees)
     .where(and(eq(suiteAttendees.albumId, album.id), sql`lower(${suiteAttendees.name}) = lower(${body.name.trim()})`)).limit(2);
    if (matching.length !== 1) throw new SuiteError('guestOnly', 404);
    tableId = matching[0].tableId;
   }
   const table = config.tables.find(t => t.id === tableId);
   return reply({ table: table ? { name: table.name } : null });
  }
  if (body.action === 'entry') {
   const parsed = entrySchema.safeParse(body); if (!parsed.success) throw new SuiteError('invalid');
   const data = parsed.data; if (!config.features[data.kind] || (data.kind === 'capsule' && !config.capsuleUnlockAt)) throw new SuiteError('unavailable', 403);
   const token = readGuestToken(req); if (!token) throw new SuiteError('guestOnly', 403);
   if (data.kind === 'capsule' && data.photoId) throw new SuiteError('invalid');
   if (data.photoId) {
    const [photo] = await db.select().from(photos).where(and(eq(photos.id, data.photoId), eq(photos.albumId, album.id))).limit(1);
    if (!photo || photo.status === 'rejected' || (data.kind === 'video' && !photo.mimeType?.startsWith('video/'))) throw new SuiteError('invalid');
   }
   await db.insert(suiteEntries).values({ id: nextId(), albumId: album.id, guestHash: guestHash(album.id, token), kind: data.kind,
    name: data.name, message: data.message, photoId: data.photoId, language: data.language, approved: !album.moderationEnabled });
   return reply({ ok: true });
  }
  throw new SuiteError('invalid');
 } catch (error) { return suiteFailure(error); }
}
