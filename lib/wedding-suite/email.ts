import { suiteCopy } from './copy';
import { localized, type SuiteConfig, type SuiteLang } from './contracts';
export type MailKind = 'invitation' | 'rsvp' | 'thanks' | 'capsule';
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export function weddingEmail(input: { kind: MailKind; language: SuiteLang; name: string; couple: string; date: string; url: string; config: SuiteConfig }) {
 const t = suiteCopy(input.language);
 const key = input.kind;
 const subject = `${t[`${key}Subject`]} · ${input.couple}`;
 const body = input.kind === 'invitation' ? localized(input.config.invitation, input.language) : input.kind === 'thanks' ? localized(input.config.thankYou, input.language) : '';
 const intro = body || t[`${key}Intro`];
 const date = new Intl.DateTimeFormat(input.language, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${input.date.slice(0, 10)}T12:00:00Z`));
 const url = new URL(input.url); if (url.protocol !== 'https:' && !(url.hostname === 'localhost' && url.protocol === 'http:')) throw new Error('Invalid invitation origin');
 const html = `<!doctype html><html lang="${input.language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#fcfaf6;color:#292524;font-family:Arial,sans-serif"><main style="max-width:600px;margin:auto;padding:36px 24px"><p>GuestCam</p><h1>${escape(input.couple)}</h1><p>${escape(date)}</p><p>${escape(input.name)},</p><p style="line-height:1.7;white-space:pre-line">${escape(intro)}</p><a href="${escape(url.href)}" style="display:inline-block;padding:14px 22px;background:#292524;color:white;border-radius:12px;text-decoration:none">${escape(key === 'invitation' ? t.invitationCta : t.guestLink)}</a><p style="font-size:12px;color:#78716c;margin-top:32px">${escape(t.languageHint)}</p></main></body></html>`;
 return { subject, html };
}
