import { createHmac, timingSafeEqual } from 'node:crypto';
export function invitationToken(attendee: { id: string; albumId: string; tokenVersion: string }, secret = process.env.WEDDING_INVITE_SECRET) {
  if (!secret || secret.length < 32) throw new Error('Wedding invitation signing is not configured');
  return `${attendee.id}.${createHmac('sha256', secret).update(`${attendee.albumId}:${attendee.id}:${attendee.tokenVersion}`).digest('base64url')}`;
}
export function validInvitation(token: string, attendee: { id: string; albumId: string; tokenVersion: string }, secret = process.env.WEDDING_INVITE_SECRET) {
  if (!/^[a-f0-9-]{36}\.[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const expected = invitationToken(attendee, secret);
  return token.length === expected.length && timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
