'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { suiteCopy, suiteError } from '@/lib/wedding-suite/copy';
import { FEATURES, localized, suiteLang, rsvpIsOpen, type SuiteLang, type Feature, type EntryKind } from '@/lib/wedding-suite/contracts';
import type { SuiteGuestData } from '@/lib/wedding-suite/dto';
import { WeddingPanel, fieldClass, buttonClass, secondaryClass } from '@/components/wedding/WeddingViews';
import { LanguageSelect } from './LanguageSelect';
import { LANGUAGE_NAMES } from '@/lib/wedding-suite/copy';
import { VideoRecorder } from './VideoRecorder';
import { EntryMedia } from './EntryMedia';
const UploadModal = dynamic(() => import('@/components/album/UploadModal').then(module => module.UploadModal));

export function WeddingSuiteGuest({ slug, initialLang }: { slug: string; initialLang?: SuiteLang }) {
 const [lang, setLang] = useState<SuiteLang>(initialLang || 'sl'); const t = suiteCopy(lang); const languageRef = useRef<SuiteLang>(initialLang || 'sl'); const inviteRef = useRef<string | null>(null);
 const [data, setData] = useState<SuiteGuestData | null>(null); const [loading, setLoading] = useState(true);
 const [albumPassword, setAlbumPassword] = useState('');
 const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
 const [tab, setTab] = useState<Feature>('story'); const [name, setName] = useState(''); const [photoId, setPhotoId] = useState<string | null>(null);
 const [showUpload, setShowUpload] = useState(false); const [initialFiles, setInitialFiles] = useState<FileList | null>(null);
 const [recorded, setRecorded] = useState<File | null>(null); const [notifyLang, setNotifyLang] = useState<SuiteLang>(initialLang || 'sl');
 const [notifications, setNotifications] = useState(true); const [seating, setSeating] = useState<string | null>(null);
 const endpoint = `/api/albums/${encodeURIComponent(slug)}/wedding-suite`;
 const load = useCallback(async (first = false) => {
  try {
   if (first) {
    const fragment = new URLSearchParams(window.location.hash.slice(1)); const token = inviteRef.current || fragment.get('invite'); inviteRef.current = token;
    if (token) {
     window.history.replaceState(null, '', window.location.pathname + window.location.search);
     const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'invite', token }) });
     const result = await response.json(); if (!response.ok) throw new Error(result.error); inviteRef.current = null;
    }
   }
   const response = await fetch(endpoint, { cache: 'no-store' }); const result: SuiteGuestData & { error?: string } = await response.json();
   if (!response.ok) throw new Error(result.error); setData(result);
   if (first) {
    let chosen = initialLang || result.language;
    if (!initialLang) try { chosen = suiteLang(localStorage.getItem(`gc-suite-language:${slug}`), chosen); } catch {}
    languageRef.current = chosen; setLang(chosen); setNotifyLang(result.attendee?.language || chosen); setNotifications(result.attendee?.notifications ?? true);
    setName(result.attendee?.name || ''); const section = new URLSearchParams(window.location.search).get('section') as Feature; setTab(FEATURES.includes(section) && result.config.features[section] ? section : result.config.features.story ? 'story' : FEATURES.find(key => result.config.features[key]) || 'story');
   }
  } catch (cause) { setError(suiteError(languageRef.current, cause instanceof Error ? cause.message : '')); }
  finally { setLoading(false); }
 }, [endpoint, initialLang, slug]);
 useEffect(() => { void load(true); }, [load]);
 async function request(body: unknown, responseLanguage = lang) {
  setBusy(true); setError(''); setMessage('');
  try { const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
   const result = await response.json(); if (!response.ok) throw new Error(result.error); setMessage(suiteCopy(responseLanguage).success); await load(); return result;
  } catch (cause) { setError(suiteError(responseLanguage, cause instanceof Error ? cause.message : '')); return null; }
  finally { setBusy(false); }
 }
 function changeLang(value: SuiteLang) {
  languageRef.current = value; setLang(value); setNotifyLang(value);
  try { localStorage.setItem(`gc-suite-language:${slug}`, value); } catch {}
  const url = new URL(window.location.href); url.searchParams.set('lang', value); window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  if (data?.attendee) void request({ action: 'preferences', language: value, notifications }, value);
 }
 async function rsvp(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); const fields = new FormData(event.currentTarget);
  await request({ action: 'rsvp', language: notifyLang, notifications, attending: fields.get('attending'),
   companions: fields.getAll('companion').map(String).filter(value => value.trim()), menuId: fields.get('menuId') || null, note: fields.get('note') || '' });
 }
 async function entry(event: FormEvent<HTMLFormElement>, kind: EntryKind) {
  event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form);
  const result = await request({ action: 'entry', kind, name: name.trim(), message: fields.get('message') || '', photoId: kind === 'capsule' ? null : photoId, language: lang });
  if (result) { form.reset(); setPhotoId(null); setRecorded(null); }
 }
 function openRecorded() {
  if (!recorded || !name.trim()) return;
  const transfer = new DataTransfer(); transfer.items.add(recorded); setInitialFiles(transfer.files); setShowUpload(true);
 }
 const entryForm = (kind: EntryKind) => <form onSubmit={event => void entry(event, kind)} className="space-y-4">
  <label className="block text-sm font-medium">{t.name}<input className={fieldClass} required maxLength={180} value={name} onChange={event => setName(event.target.value)} autoComplete="name" /></label>
  <label className="block text-sm font-medium">{t.message}<textarea name="message" rows={4} required={kind !== 'video'} maxLength={5000} className={fieldClass} /></label>
  {kind === 'guestbook' && <button type="button" disabled={!name.trim() || busy} className={secondaryClass} onClick={() => { setInitialFiles(null); setShowUpload(true); }}>{t.chooseMedia}</button>}
  {kind === 'video' && <><VideoRecorder lang={lang} onFile={setRecorded} />{recorded && <div className="space-y-2"><p className="break-all text-sm">{recorded.name}</p><button type="button" className={secondaryClass} disabled={!name.trim()} onClick={openRecorded}>{t.uploadVideo}</button></div>}</>}
  {photoId && kind !== 'capsule' && <p className="text-sm text-emerald-700">✓ {t.saved}</p>}
  <button className={buttonClass} disabled={busy || (kind === 'video' && !photoId)}>{busy ? t.loading : t.submit}</button>
 </form>;
 const date = data?.album.date && new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${data.album.date.slice(0,10)}T12:00:00Z`));
 return <main lang={lang} className="min-h-screen bg-[#fcfaf6] px-4 py-6 text-stone-900 sm:py-10"><div className="mx-auto max-w-5xl space-y-6">
  <header className="sticky top-0 z-30 -mx-4 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 bg-[#fcfaf6]/95 px-4 py-3 backdrop-blur sm:rounded-b-2xl"><a className={secondaryClass} href={`/${encodeURIComponent(slug)}?lang=${lang}`}>← {t.back}</a><div className="min-w-44"><LanguageSelect label={t.language} value={lang} onChange={changeLang} /></div></header>
  <div className="rounded-3xl bg-stone-900 px-6 py-10 text-white sm:px-10"><p className="text-xs uppercase tracking-[.2em] text-amber-300">GuestCam</p><h1 className="mt-4 break-words font-serif text-4xl sm:text-6xl">{data?.album.name || t.title}</h1>{date && <p className="mt-4">{date}</p>}{data && <p className="mt-5 whitespace-pre-line leading-7 text-stone-200">{localized(data.config.welcome, lang)}</p>}</div>
  {loading && <p role="status">{t.loading}</p>}{error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}<button type="button" className="ml-3 underline" onClick={() => void load(true)}>{t.refresh}</button></div>}{message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{message}</p>}
  {data && <>{data.album.passwordProtected && <label className="block text-sm font-medium">{t.password}<input type="password" autoComplete="current-password" className={fieldClass} value={albumPassword} onChange={event => setAlbumPassword(event.target.value)} /></label>}<nav className="grid grid-cols-2 gap-2 rounded-2xl border bg-white p-2 sm:grid-cols-4" aria-label={t.title}>{FEATURES.filter(key => data.config.features[key]).map(key => <button type="button" aria-pressed={tab === key} key={key} onClick={() => { setTab(key); setPhotoId(null); setMessage(''); }} className={`min-h-12 rounded-xl px-2 py-3 text-sm font-semibold ${tab === key ? 'bg-stone-900 text-white' : 'hover:bg-amber-50'}`}>{t[key]}</button>)}</nav>
  {(tab === 'story' || tab === 'travel') && <WeddingPanel title={t[tab]}><div className="space-y-6">{data.config[tab].map(row => <article className="rounded-2xl border border-stone-200 p-5" key={row.id}>
   {row.date && <p className="mb-2 text-xs text-stone-500">{new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${row.date}T12:00:00Z`))}</p>}
   <h2 className="font-serif text-2xl">{localized(row.title, lang) || t.missingTranslation}</h2><p className="mt-3 whitespace-pre-wrap leading-7">{localized(row.text, lang)}</p>{row.url && tab === 'story' && <img src={row.url} alt={localized(row.title, lang)} className="mt-5 max-h-96 w-full rounded-2xl object-cover" />}
   {row.url && tab === 'travel' && <a className={`${secondaryClass} mt-4 inline-block`} href={row.url} target="_blank" rel="noreferrer">{t.link} ↗</a>}
  </article>)}</div></WeddingPanel>}
  {tab === 'rsvp' && <WeddingPanel title={t.rsvp}>{!data.attendee ? <p>{t.guestOnly}</p> : <><p className="mb-4 font-semibold">{data.attendee.name}</p><LanguageSelect label={t.notificationLanguage} value={notifyLang} onChange={setNotifyLang} /><p className="my-3 text-sm text-stone-500">{t.languageHint}</p><label className="my-4 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={notifications} onChange={e => setNotifications(e.target.checked)} />{t.notifications}</label><button className={`${secondaryClass} mb-5`} type="button" disabled={busy} onClick={() => void request({ action: 'preferences', language: notifyLang, notifications })}>{t.save}</button>
   {!rsvpIsOpen(data.config.rsvpDeadline) ? <p>{t.closed}</p> : <form className="space-y-4 border-t pt-5" onSubmit={event => void rsvp(event)}>
    <label className="block text-sm font-semibold">{t.attending}<select name="attending" className={fieldClass} defaultValue={data.attendee.attending === 'pending' ? 'maybe' : data.attendee.attending}>{(['yes','no','maybe'] as const).map(key => <option value={key} key={key}>{t[key]}</option>)}</select></label>
    {Array.from({ length: Math.min(data.attendee.allowedCompanions, data.config.maxCompanions) }, (_, index) => <label className="block text-sm" key={index}>{t.companions} {index + 1}<input className={fieldClass} name="companion" maxLength={180} defaultValue={data.attendee!.companions[index] || ''} /></label>)}
    {data.config.menuOptions.length > 0 && <label className="block text-sm">{t.menu}<select className={fieldClass} name="menuId" defaultValue={data.attendee.menuId || ''}><option value="">—</option>{data.config.menuOptions.map(row => <option value={row.id} key={row.id}>{localized(row.title, lang) || t.missingTranslation}</option>)}</select></label>}
    <label className="block text-sm">{t.note}<textarea name="note" maxLength={1000} rows={3} className={fieldClass} defaultValue={data.attendee.note} /></label><button className={buttonClass} disabled={busy}>{busy ? t.loading : t.submit}</button>
   </form>}</>}</WeddingPanel>}
  {tab === 'seating' && <WeddingPanel title={t.seating}><p className="mb-4 text-sm text-stone-600">{t.seatingHint}</p><form className="space-y-4" onSubmit={async event => { event.preventDefault(); const result = await request({ action: 'seating', name }); if (result) setSeating(result.table?.name || '—'); }}><label className="block text-sm">{t.name}<input className={fieldClass} required value={name} onChange={event => setName(event.target.value)} maxLength={180} /></label><button className={buttonClass} disabled={busy}>{t.seating}</button></form>{seating && <p className="mt-6 rounded-2xl bg-amber-50 p-6 text-center font-serif text-4xl">{seating}</p>}{data.config.seatingMapUrl && <img className="mt-6 max-w-full rounded-2xl" src={data.config.seatingMapUrl} alt={t.seating} />}</WeddingPanel>}
  {(tab === 'guestbook' || tab === 'video' || tab === 'capsule') && <WeddingPanel title={t[tab]}>
   {tab === 'capsule' && data.config.capsuleUnlockAt && <p className="mb-5 rounded-xl bg-amber-50 p-4 text-sm">{t.unlockAt}: {new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(data.config.capsuleUnlockAt))}</p>}
   {entryForm(tab)}<div className="mt-8 space-y-4">{data.entries.filter(row => row.kind === tab).map(row => <article className="space-y-3 rounded-2xl border p-5" key={row.id}>
    {row.locked ? <p>{t.locked}</p> : <><h3 className="font-bold">{row.name}</h3>{row.language && row.language !== lang && <p className="text-xs text-stone-500">{t.contentLanguage}: {LANGUAGE_NAMES[row.language]}</p>}<p className="whitespace-pre-wrap leading-7">{row.message}</p><EntryMedia entry={row} slug={slug} lang={lang} password={albumPassword} /></>}
   </article>)}</div>{tab === 'guestbook' && <a href={`/${encodeURIComponent(slug)}/celebrate/guestbook?lang=${lang}`} target="_blank" rel="noreferrer" className={`${secondaryClass} mt-4 inline-block`}>{t.export}</a>}
  </WeddingPanel>}
  {tab === 'thanks' && <WeddingPanel title={t.thanks}>{data.config.thankYouPhotoUrl && <img className="mb-6 max-h-96 w-full rounded-2xl object-cover" src={data.config.thankYouPhotoUrl} alt={data.album.name} />}<p className="whitespace-pre-wrap leading-7">{localized(data.config.thankYou, lang) || t.thanksIntro}</p><a href={`/${encodeURIComponent(slug)}?lang=${lang}`} className={`${buttonClass} mt-5 inline-block`}>{t.back}</a></WeddingPanel>}
  <footer className="py-5 text-center text-xs text-stone-500"><a href={`/${encodeURIComponent(slug)}/wedding?lang=${lang}`}>GuestCam · {t.title}</a></footer>
  </>}
 </div>{data && showUpload && <UploadModal albumSlug={slug} albumId={data.album.id} uploaderName={name.trim()} maxPhotos={data.album.maxPhotos} currentCount={data.album.photoCount} albumPassword={albumPassword} lang={lang} initialFiles={initialFiles} moderationEnabled={data.album.moderationEnabled} organiserName={data.album.name}
  onMediaUploaded={media => setPhotoId(media.id)} onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); void load(); }} />}</main>;
}
