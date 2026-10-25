import type { SuiteConfig, SuiteLang, EntryKind } from './contracts';
export interface AttendeeView { id: string; name: string; email: string; language: SuiteLang; tableId: string | null; allowedCompanions: number;
 attending: 'yes' | 'no' | 'maybe' | 'pending'; companions: string[]; menuId: string | null; note: string; notifications: boolean; invitePath?: string }
export interface EntryView { id: string; kind: EntryKind; locked: boolean; name?: string; message?: string; photoId?: string | null;
 language?: SuiteLang; approved?: boolean; createdAt: string; url?: string | null; videoId?: string | null; mimeType?: string | null }
export interface MailView { id: string; recipient: string; subject: string; language: SuiteLang; kind: 'invitation' | 'rsvp' | 'thanks' | 'capsule'; status: 'preview' | 'sending' | 'sent' | 'failed'; createdAt: string }
export interface SuiteOwnerData { configured: boolean; config: SuiteConfig; attendees: AttendeeView[]; entries: EntryView[]; emails: MailView[]; guestPath: string; preview: boolean }
export interface SuiteGuestData { config: SuiteConfig; attendee: AttendeeView | null; entries: EntryView[]; language: SuiteLang;
 album: { id: string; slug: string; name: string; date: string; maxPhotos: number; photoCount: number; moderationEnabled: boolean; passwordProtected: boolean } }
