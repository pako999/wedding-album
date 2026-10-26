import { translateSuite } from '@/lib/wedding/translate';
import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sameOrigin, reply } from '@/lib/wedding/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { suiteAttendees, suiteEmails, suiteEntries, suiteSettings } from '@/lib/wedding-suite/schema';
import { configSchema, attendeeSchema, capsuleIsOpen } from '@/lib/wedding-suite/contracts';
import { SuiteError, suiteFailure, suiteOwner, safeAttendee, invitationPath, visibleEntries, nextId, queueMail } from '@/lib/wedding-suite/server';
export const runtime = 'nodejs';
export const maxDuration = 60;
type Context = { params: Promise<{ slug: string }> };
export async function GET(req: NextRequest, { params }: Context) {
 try {
  const { album, config, configured } = await suiteOwner((await params).slug);
  const mailId = req.nextUrl.searchParams.get('mail');
  if (mailId) {
   const [mail] = await db.select({ html: suiteEmails.html }).from(suiteEmails).where(and(eq(suiteEmails.id, mailId), eq(suiteEmails.albumId, album.id))).limit(1);
   if (!mail) throw new SuiteError('unavailable', 404);
   return new NextResponse(mail.html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; base-uri 'none'; frame-ancestors 'self'", 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' } });
  }
  const [attendees, entries, emails] = await Promise.all([
   db.select().from(suiteAttendees).where(eq(suiteAttendees.albumId, album.id)).orderBy(suiteAttendees.name).limit(1000),
   visibleEntries(album, config, true),
   db.select({ id: suiteEmails.id, recipient: suiteEmails.recipient, language: suiteEmails.language, kind: suiteEmails.kind,
    subject: suiteEmails.subject, status: suiteEmails.status, createdAt: suiteEmails.createdAt }).from(suiteEmails).where(eq(suiteEmails.albumId, album.id)).orderBy(desc(suiteEmails.createdAt)).limit(100),
  ]);
  return reply({ config, configured, attendees: attendees.map(a => ({ ...safeAttendee(a), invitePath: invitationPath(a, album) })), entries, emails,
   guestPath: `/${encodeURIComponent(album.slug)}/celebrate`, preview: process.env.VERCEL_ENV !== 'production' || process.env.WEDDING_SUITE_SEND_EMAILS !== '1' });
 } catch (error) { return suiteFailure(error); }
}
export async function PUT(req: NextRequest, { params }: Context) {
 if (!sameOrigin(req)) return reply({ error: 'invalid' }, 403);
 try {
  const { album, config: old } = await suiteOwner((await params).slug);
  const config = configSchema.safeParse(await req.json()); if (!config.success) throw new SuiteError('invalid');
  // An undated capsule is a draft, unavailable to guests. It must not block saving
  // unrelated tables, menus or page content. Existing sealed messages stay locked below.
  if (old.capsuleUnlockAt && (!config.data.capsuleUnlockAt || new Date(config.data.capsuleUnlockAt) < new Date(old.capsuleUnlockAt))) {
   const [existing] = await db.select({ id: suiteEntries.id }).from(suiteEntries).where(and(eq(suiteEntries.albumId, album.id), eq(suiteEntries.kind, 'capsule'))).limit(1);
   if (existing) throw new SuiteError('locked', 409);
  }
  const attendeeTables = await db.select({ tableId: suiteAttendees.tableId }).from(suiteAttendees).where(eq(suiteAttendees.albumId, album.id));
  if (attendeeTables.some(row => row.tableId && !config.data.tables.some(table => table.id === row.tableId))) throw new SuiteError('tableInUse');
  let translationWarning = false;
  if (req.nextUrl.searchParams.get('translate') === '1') {
   try {
    const limit = await checkRateLimit(`wedding-translate:${album.id}`, 3, 60_000);
    if (!limit.ok) throw new Error('rate_limited');
    config.data = await translateSuite(config.data);
   } catch { translationWarning = true; }
  }
  await db.insert(suiteSettings).values({ albumId: album.id, config: config.data }).onConflictDoUpdate({ target: suiteSettings.albumId, set: { config: config.data, updatedAt: new Date() } });
  return reply({ ok: true, config: config.data, translationWarning });
 } catch (error) { return suiteFailure(error); }
}
export async function POST(req: NextRequest, { params }: Context) {
 if (!sameOrigin(req)) return reply({ error: 'invalid' }, 403);
 const limit = await checkRateLimit('wedding-suite-manage', 60, 60_000); if (!limit.ok) return limit.response;
 try {
  const { album, config } = await suiteOwner((await params).slug); const body = await req.json(); if (!body || typeof body !== 'object') throw new SuiteError('invalid');
  if (body.action === 'translate') {
   const input = configSchema.safeParse(body.config); if (!input.success) throw new SuiteError('invalid');
   const translationLimit = await checkRateLimit(`wedding-translate:${album.id}`, 3, 60_000);
   if (!translationLimit.ok) return translationLimit.response;
   // Return suggestions only. The editor merges unchanged text and saves through
   // its normal queue, so a slow translation cannot overwrite a newer edit.
   return reply({ ok: true, config: await translateSuite(input.data) });
  }
  if (body.action === 'attendee') {
   const input = attendeeSchema.safeParse(body.attendee); if (!input.success) throw new SuiteError('invalid');
   if (input.data.tableId && !config.tables.some(t => t.id === input.data.tableId)) throw new SuiteError('invalid');
   const { id, ...values } = input.data; values.email = values.email.toLowerCase();
   if (id) {
    const [updated] = await db.update(suiteAttendees).set({ ...values, updatedAt: new Date() }).where(and(eq(suiteAttendees.id, id), eq(suiteAttendees.albumId, album.id))).returning();
    if (!updated) throw new SuiteError('unavailable', 404);
    return reply({ ok: true, attendee: { ...safeAttendee(updated), invitePath: invitationPath(updated, album) } });
   }
   const [created] = await db.insert(suiteAttendees).values({ ...values, id: nextId(), albumId: album.id, tokenVersion: nextId() }).onConflictDoNothing().returning();
   if (!created) throw new SuiteError('invalid', 409);
   return reply({ ok: true, attendee: { ...safeAttendee(created), invitePath: invitationPath(created, album) } });
  }
  if (body.action === 'moderate') {
   if (typeof body.id !== 'string' || typeof body.approved !== 'boolean') throw new SuiteError('invalid');
   const [entry] = await db.select().from(suiteEntries).where(and(eq(suiteEntries.id, body.id), eq(suiteEntries.albumId, album.id))).limit(1);
   if (!entry) throw new SuiteError('unavailable', 404);
   if (entry.kind === 'capsule' && !capsuleIsOpen(config.capsuleUnlockAt)) throw new SuiteError('locked', 409);
   await db.update(suiteEntries).set({ approved: body.approved }).where(eq(suiteEntries.id, entry.id));
   return reply({ ok: true });
  }
  if (body.action === 'email') {
   const parsed = z.object({ kind: z.enum(['invitation', 'thanks', 'capsule']), ids: z.array(z.string().uuid()).min(1).max(50), requestId: z.string().uuid() }).safeParse(body);
   if (!parsed.success || !config.enabled) throw new SuiteError('invalid');
   const all = await db.select().from(suiteAttendees).where(eq(suiteAttendees.albumId, album.id));
   const selected = all.filter(a => parsed.data.ids.includes(a.id));
   if (selected.length !== new Set(parsed.data.ids).size) throw new SuiteError('invalid');
   const mailIds: string[] = [];
   for (const attendee of selected) { const id = await queueMail(req, album, config, attendee, parsed.data.kind, parsed.data.requestId); if (id) mailIds.push(id); }
   return reply({ ok: true, mailIds, preview: process.env.VERCEL_ENV !== 'production' || process.env.WEDDING_SUITE_SEND_EMAILS !== '1' });
  }
  throw new SuiteError('invalid');
 } catch (error) { return suiteFailure(error); }
}
