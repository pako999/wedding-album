'use client';
import { TranslationOptions, TRANSLATION_COPY } from '@/components/wedding/TranslationOptions';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { EMPTY_SUITE, FEATURES, type SuiteLang, type SuiteConfig } from '@/lib/wedding-suite/contracts';
import { suiteCopy, suiteError } from '@/lib/wedding-suite/copy';
import type { AttendeeView, SuiteOwnerData } from '@/lib/wedding-suite/dto';
import { WeddingPanel, fieldClass, buttonClass, secondaryClass } from '@/components/wedding/WeddingViews';
import { LanguageSelect } from './LanguageSelect';
import { WeddingImageField } from './WeddingImageField';
import { imageCopy } from '@/lib/wedding-suite/image-copy';
import { WeddingPageBuilder } from './WeddingPageBuilder';
import { WeddingProgramEditor, type ProgramSaveHandle } from './WeddingProgramEditor';
import { weddingCopy } from '@/lib/wedding/copy';
import { presentationCopy } from '@/lib/wedding-suite/presentation-copy';
import { EntryMedia } from './EntryMedia';
import { useSuiteAutosave } from './useSuiteAutosave';
import { mergeSuiteTranslations, translationFingerprint } from '@/lib/wedding-suite/autosave';

type ManagerProps = { slug: string; lang: SuiteLang; plan: string; albumName?: string | null; eventDate?: string | null };
export function WeddingSuiteManager(props: ManagerProps) {
 return <WeddingSuiteEditor key={`${props.slug}:${props.lang}`} {...props} />;
}
function WeddingSuiteEditor({ slug, lang, plan, albumName, eventDate }: ManagerProps) {
 const t = suiteCopy(lang); const endpoint = `/api/albums/${encodeURIComponent(slug)}/wedding-suite/manage`;
 const [autoTranslate, setAutoTranslate] = useState(true); const [translationWarning, setTranslationWarning] = useState(false);
 const [data, setData] = useState<SuiteOwnerData | null>(null);
 const onSaved = useCallback((value: SuiteConfig) => setData(current => current ? { ...current, config: value, configured: true } : current), []);
 const autosave = useSuiteAutosave(endpoint, { ...EMPTY_SUITE, defaultLang: lang }, onSaved);
 const { config, setConfig, initialize } = autosave;
 const [translating, setTranslating] = useState(false); const [translationRetry, setTranslationRetry] = useState(0);
 const translationFlight = useRef(false); const translationAttempt = useRef<string | null>(null);
 const translationEnabled = useRef(autoTranslate);
 useEffect(() => { translationEnabled.current = autoTranslate; }, [autoTranslate]);
 const [editLang, setEditLang] = useState<SuiteLang>(lang); const [guestLang, setGuestLang] = useState<SuiteLang>(lang);
 const [loading, setLoading] = useState(true);
 const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
 const [activeUploads, setActiveUploads] = useState(0);
 const uploadBusy = useCallback((busy: boolean) => setActiveUploads(count => Math.max(0, count + (busy ? 1 : -1))), []);
 const imageEndpoint = `/api/albums/${encodeURIComponent(slug)}/wedding-suite/images`;
 useEffect(() => {
  if (!activeUploads) return;
  const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
  window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
 }, [activeUploads]);
 const [programSave, setProgramSave] = useState<ProgramSaveHandle | null>(null);
 const [selected, setSelected] = useState<string[]>([]);
 const load = useCallback(async (preserveConfig = false) => {
  if (plan !== 'premium') return;
  if (!preserveConfig) setLoading(true);
  try { const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(20_000) }); const result = await response.json();
   if (!response.ok) throw new Error(result.error); setError(''); setData(current => preserveConfig && current ? { ...result, config: current.config } : result); if (!preserveConfig) { initialize(result.configured ? result.config : { ...result.config, defaultLang: lang }); setGuestLang(result.configured ? result.config.defaultLang : lang); }
  } catch (cause) { setError(suiteError(lang, cause instanceof Error ? cause.message : '')); }
  finally { setLoading(false); }
 }, [endpoint, lang, plan, initialize, setGuestLang]);
 useEffect(() => { void Promise.resolve().then(() => load()); }, [load]);
 // Translation has its own request: basic saving never waits for an AI provider.
 useEffect(() => {
  if (!autoTranslate || !data || autosave.status !== 'saved' || translationFlight.current || autosave.recovery) return;
  const fingerprint = translationFingerprint(config);
  if (!fingerprint || fingerprint === translationAttempt.current) return;
  const timer = setTimeout(async () => {
   translationAttempt.current = fingerprint; translationFlight.current = true; setTranslating(true); setTranslationWarning(false);
   try {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'translate', config }), signal: AbortSignal.timeout(50_000) });
    const result = await response.json(); if (!response.ok) throw new Error('translation');
    if (translationEnabled.current) setConfig(current => mergeSuiteTranslations(current, config, result.config));
   } catch { setTranslationWarning(true); }
   finally { translationFlight.current = false; setTranslating(false); }
  }, 2500);
  return () => clearTimeout(timer);
 }, [autoTranslate, data, config, autosave.status, autosave.recovery, endpoint, setConfig, translating, translationRetry]);
 function saveNow() { translationAttempt.current = null; setTranslationRetry(value => value + 1); void Promise.all([autosave.flush(), programSave?.flush()]); }
 async function request(method: 'POST', body: unknown) {
  if (!await autosave.flush()) return null;
  setBusy(true); setError(''); setMessage('');
  try { const response = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
   const result = await response.json(); if (!response.ok) throw new Error(result.error); setMessage(t.saved); await load(true); return result;
  } catch (cause) { setError(suiteError(lang, cause instanceof Error ? cause.message : '')); return null; }
  finally { setBusy(false); }
 }
 const combinedStatus = activeUploads ? 'uploading' : [autosave.status, programSave?.status ?? 'loading'].sort((a, b) => ['error','invalid','saving','pending','loading','saved'].indexOf(a) - ['error','invalid','saving','pending','loading','saved'].indexOf(b))[0];
 const saveStatus = combinedStatus === 'uploading' ? imageCopy(lang).uploading : combinedStatus === 'saved' ? t.autoSaved : combinedStatus === 'saving' ? t.autoSaving : combinedStatus === 'pending' ? t.autoPending : combinedStatus === 'invalid' ? t.autoInvalid : combinedStatus === 'error' ? `${t.autoFailed} ${suiteError(lang, autosave.error || programSave?.error)}` : t.loading;
 function textField(key: 'welcome' | 'invitation' | 'thankYou', label: string) {
  return <label className="block space-y-1 text-sm font-medium" key={key}>{label}<textarea aria-label={label} className={fieldClass} rows={3} maxLength={5000}
   value={config[key][editLang] ?? ''} onChange={e => setConfig(c => ({ ...c, [key]: { ...c[key], [editLang]: e.target.value } }))} /></label>;
 }
 async function addGuest(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form);
  const result = await request('POST', { action: 'attendee', attendee: { name: fields.get('name'), email: fields.get('email'), language: guestLang,
   tableId: fields.get('tableId') || null, allowedCompanions: Number(fields.get('companions') || 0) } });
  if (result) form.reset();
 }
 async function updateGuest(guest: AttendeeView, changes: Partial<AttendeeView>) {
  const values = { ...guest, ...changes };
  await request('POST', { action: 'attendee', attendee: { id: values.id, name: values.name, email: values.email,
   language: values.language, tableId: values.tableId, allowedCompanions: values.allowedCompanions } });
 }
 async function copy(path: string) { try { await navigator.clipboard.writeText(new URL(path, window.location.origin).href); setMessage(t.copied); } catch { setError(t.error); } }
 const rows = (key: 'story' | 'travel') => <WeddingPanel title={t[key]} key={key}><div className="space-y-4">{config[key].map((row, index) => <div className="space-y-2 rounded-xl border p-4" key={row.id}>
  <div className="flex justify-between"><span>{index + 1}</span><button type="button" className="min-h-10 text-sm text-red-700" onClick={() => setConfig(c => ({ ...c, [key]: c[key].filter(r => r.id !== row.id) }))}>{t.remove}</button></div>
  {key === 'story' && <label className="block text-sm">{t.date}<input type="date" className={fieldClass} value={row.date || ''} onChange={e => setConfig(c => ({ ...c, [key]: c[key].map(r => r.id === row.id ? { ...r, date: e.target.value } : r) }))} /></label>}
  <label className="block text-sm">{t.message}<input className={fieldClass} maxLength={180} value={row.title[editLang] ?? ''} onChange={e => setConfig(c => ({ ...c, [key]: c[key].map(r => r.id === row.id ? { ...r, title: { ...r.title, [editLang]: e.target.value } } : r) }))} /></label>
  <textarea aria-label={t.message} rows={3} className={fieldClass} maxLength={5000} value={row.text[editLang] ?? ''} onChange={e => setConfig(c => ({ ...c, [key]: c[key].map(r => r.id === row.id ? { ...r, text: { ...r.text, [editLang]: e.target.value } } : r) }))} />
  {key === 'story' ? <WeddingImageField lang={lang} label={t.photo} value={row.url || ''} uploadEndpoint={imageEndpoint} onUploadBusy={uploadBusy} onChange={url => setConfig(c => ({ ...c, story: c.story.map(r => r.id === row.id ? { ...r, url } : r) }))} /> : <label className="block text-sm">{t.link}<input type="url" placeholder="https://" className={fieldClass} value={row.url || ''} onChange={e => setConfig(c => ({ ...c, travel: c.travel.map(r => r.id === row.id ? { ...r, url: e.target.value } : r) }))} /></label>}
 </div>)}</div><button type="button" className={`${secondaryClass} mt-3`} disabled={config[key].length >= 30} onClick={() => setConfig(c => ({ ...c, [key]: [...c[key], { id: crypto.randomUUID(), title: {}, text: {} }] }))}>+ {t.addRow}</button></WeddingPanel>;
 if (plan !== 'premium') return <WeddingPanel title={presentationCopy(lang).website}><p>{weddingCopy(lang).premiumRequired}</p></WeddingPanel>;
 if (!data) return <section id="wedding-suite" data-wedding-editor><WeddingPanel title={presentationCopy(lang).website}>
  {loading ? <p role="status">{t.loading}</p> : <><p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">{error || t.unavailable}</p><button type="button" className={secondaryClass} onClick={() => void load()}>{t.retryLoad}</button></>}
 </WeddingPanel></section>;
 return <section className="min-w-0 space-y-6" id="wedding-suite" data-wedding-editor>
  {autosave.recovery && <div role="alert" className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4"><p>{t.draftConflict}</p><button type="button" className={secondaryClass} onClick={() => autosave.resolveRecovery(true)}>{t.restoreDraft}</button> <button type="button" className={secondaryClass} onClick={() => autosave.resolveRecovery(false)}>{t.keepSaved}</button></div>}
  <fieldset disabled={!data || !!autosave.recovery} className="space-y-6"><WeddingPanel title={t.title}>
  {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
  <p role="status" className="mb-3 text-sm text-emerald-700">{message}</p>
  {data?.preview && <p className="mb-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">{t.deliveryPreview}</p>}
  <label className="flex items-center gap-3 font-semibold"><input type="checkbox" className="size-5" checked={config.enabled} onChange={e => setConfig(c => ({ ...c, enabled: e.target.checked }))} />{t.enabled}</label>
  <div className="my-5 grid gap-4 sm:grid-cols-2"><LanguageSelect label={t.defaultLanguage} value={config.defaultLang} onChange={value => setConfig(c => ({ ...c, defaultLang: value }))} /><LanguageSelect label={t.contentLanguage} value={editLang} onChange={setEditLang} /></div>
  <p className="mb-4 text-sm text-stone-600">{t.languageHint}</p><TranslationOptions lang={lang} enabled={autoTranslate} onEnabled={setAutoTranslate}/>{translating && <p role="status" className="my-3 text-sm text-stone-600">{t.translating}</p>}{translationWarning && <p role="status" className="my-3 text-sm text-amber-800">{TRANSLATION_COPY[lang].warning}</p>}
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{FEATURES.map(key => <label className="flex items-center gap-2 rounded-xl border p-3 text-sm" key={key}><input type="checkbox" checked={config.features[key]} onChange={e => setConfig(c => ({ ...c, features: { ...c.features, [key]: e.target.checked } }))} />{t[key]}</label>)}</div>
  {config.features.capsule && !config.capsuleUnlockAt && <p className="mt-3 text-sm text-amber-800">{t.capsuleDraft}</p>}
  <div className="mt-5 grid gap-4">{textField('welcome', t.welcome)}{textField('invitation', t.invitation)}{textField('thankYou', t.thanks)}</div>
  <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="block text-sm">{t.unlockAt}<input type="datetime-local" className={fieldClass} value={config.capsuleUnlockAt ? new Date(new Date(config.capsuleUnlockAt).getTime() - new Date(config.capsuleUnlockAt).getTimezoneOffset() * 60000).toISOString().slice(0,16) : ''} onChange={e => setConfig(c => ({ ...c, capsuleUnlockAt: e.target.value ? new Date(e.target.value).toISOString() : null }))} /></label>
   <label className="block text-sm">{t.deadline}<input type="datetime-local" className={fieldClass} value={config.rsvpDeadline ? new Date(new Date(config.rsvpDeadline).getTime() - new Date(config.rsvpDeadline).getTimezoneOffset() * 60000).toISOString().slice(0,16) : ''} onChange={e => setConfig(c => ({ ...c, rsvpDeadline: e.target.value ? new Date(e.target.value).toISOString() : null }))} /></label>
   <label className="block text-sm">{t.companions}<input type="number" min={0} max={10} className={fieldClass} value={config.maxCompanions} onChange={e => setConfig(c => ({ ...c, maxCompanions: Number(e.target.value) }))} /></label>
   <WeddingImageField lang={lang} label={`${t.photo} · ${t.thanks}`} value={config.thankYouPhotoUrl} uploadEndpoint={imageEndpoint} onUploadBusy={uploadBusy} onChange={url => setConfig(c => ({ ...c, thankYouPhotoUrl: url }))} />
  </div>
  <div className="mt-5 flex flex-wrap gap-3"><button type="button" className={buttonClass} disabled={!data || !!activeUploads || autosave.status === 'saving'} onClick={saveNow}>{autosave.status === 'saving' ? t.autoSaving : t.save}</button>
   {data && <a className={secondaryClass} href={`${data.guestPath}?lang=${editLang}`} target="_blank" rel="noreferrer">{t.guestLink} ↗</a>}
  </div></WeddingPanel>
  <WeddingPageBuilder value={config.page} lang={lang} editLang={editLang} onChange={page => setConfig(current => ({ ...current, page }))} uploadEndpoint={imageEndpoint} onUploadBusy={uploadBusy} />
  <WeddingProgramEditor slug={slug} lang={lang} editLang={editLang} autoTranslate={autoTranslate} albumName={albumName} eventDate={eventDate} onSaveState={setProgramSave} />
  <div className="grid gap-6 lg:grid-cols-2">{rows('story')}{rows('travel')}</div>
  <div className="grid gap-6 lg:grid-cols-2"><WeddingPanel title={t.seating}>
   <div className="space-y-3">{config.tables.map(table => <div className="grid grid-cols-[minmax(0,1fr)_90px_auto] gap-2" key={table.id}>
    <label className="text-xs">{t.table}<input className={fieldClass} maxLength={180} value={table.name} onChange={e => setConfig(c => ({ ...c, tables: c.tables.map(r => r.id === table.id ? { ...r, name: e.target.value } : r) }))} /></label>
    <label className="text-xs">{t.capacity}<input type="number" min={1} max={100} className={fieldClass} value={table.capacity} onChange={e => setConfig(c => ({ ...c, tables: c.tables.map(r => r.id === table.id ? { ...r, capacity: Number(e.target.value) } : r) }))} /></label>
    <button type="button" className="self-end min-h-11 px-2 text-sm text-red-700" onClick={() => setConfig(c => ({ ...c, tables: c.tables.filter(r => r.id !== table.id) }))}>{t.remove}</button>
   </div>)}</div><button className={`${secondaryClass} mt-3`} type="button" disabled={config.tables.length >= 100} onClick={() => setConfig(c => ({ ...c, tables: [...c.tables, { id: crypto.randomUUID(), name: `${t.table} ${c.tables.length + 1}`, capacity: 8 }] }))}>+ {t.addTable}</button>
   <div className="mt-4"><WeddingImageField lang={lang} label={`${t.seating} · ${t.photo}`} value={config.seatingMapUrl} uploadEndpoint={imageEndpoint} onUploadBusy={uploadBusy} onChange={url => setConfig(c => ({ ...c, seatingMapUrl: url }))} /></div>
  </WeddingPanel><WeddingPanel title={t.menu}>
   <div className="space-y-3">{config.menuOptions.map(row => <div className="flex items-center gap-2" key={row.id}><label className="flex-1 text-sm">{t.menu}<input className={fieldClass} maxLength={180} value={row.title[editLang] ?? ''} onChange={e => setConfig(c => ({ ...c, menuOptions: c.menuOptions.map(r => r.id === row.id ? { ...r, title: { ...r.title, [editLang]: e.target.value } } : r) }))} /></label><button type="button" className="text-sm text-red-700" onClick={() => setConfig(c => ({ ...c, menuOptions: c.menuOptions.filter(r => r.id !== row.id) }))}>{t.remove}</button></div>)}</div>
   <button type="button" className={`${secondaryClass} mt-3`} disabled={config.menuOptions.length >= 20} onClick={() => setConfig(c => ({ ...c, menuOptions: [...c.menuOptions, { id: crypto.randomUUID(), title: {} }] }))}>+ {t.addRow}</button>
  </WeddingPanel></div>
  <WeddingPanel title={t.guests}><form onSubmit={addGuest} className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-3">
   <label className="block text-sm">{t.name}<input name="name" required maxLength={180} className={fieldClass} /></label>
   <label className="block text-sm">{t.email}<input name="email" type="email" required maxLength={254} className={fieldClass} /></label>
   <LanguageSelect label={t.notificationLanguage} value={guestLang} onChange={setGuestLang} />
   <label className="block text-sm">{t.table}<select name="tableId" className={fieldClass}><option value="">—</option>{(data?.config.tables || []).map(table => <option key={table.id} value={table.id}>{table.name}</option>)}</select></label>
   <label className="block text-sm">{t.companions}<input name="companions" type="number" defaultValue={0} min={0} max={10} className={fieldClass} /></label>
   <button className={buttonClass} disabled={busy || !data}>{t.addGuest}</button>
  </form>
  <div className="mt-6 space-y-3">{data?.attendees.map(guest => <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4" key={guest.id}>
   <div className="min-w-0"><label className="flex items-center gap-2"><input type="checkbox" checked={selected.includes(guest.id)} onChange={e => setSelected(ids => e.target.checked ? [...ids, guest.id].slice(0,50) : ids.filter(id => id !== guest.id))} /><strong className="break-words">{guest.name}</strong></label><p className="break-all text-xs text-stone-500">{guest.email}</p><p className="mt-2 text-sm">{t[guest.attending === 'pending' ? 'pending' : guest.attending]} · {guest.companions.length + 1}</p>{guest.note && <p className="mt-2 text-sm">{guest.note}</p>}</div>
   <LanguageSelect label={t.notificationLanguage} value={guest.language} onChange={language => void updateGuest(guest, { language })} />
   <label className="text-sm">{t.table}<select className={fieldClass} value={guest.tableId || ''} disabled={busy} onChange={e => void updateGuest(guest, { tableId: e.target.value || null })}><option value="">—</option>{data.config.tables.map(table => <option key={table.id} value={table.id}>{table.name}</option>)}</select></label>
   <div className="flex flex-col items-start gap-2">{guest.invitePath && <button type="button" className={secondaryClass} onClick={() => void copy(guest.invitePath!)}>{t.copyLink}</button>}<button type="button" className={secondaryClass} disabled={busy} onClick={() => void request('POST', { action: 'email', kind: 'invitation', ids: [guest.id], requestId: crypto.randomUUID() })}>{data.preview ? t.preview : t.submit} · {t.invitation}</button></div>
  </div>)}</div>
  {selected.length > 0 && <div className="mt-4 flex flex-wrap gap-3">{(['invitation','thanks','capsule'] as const).map(kind => <button className={secondaryClass} type="button" disabled={busy} key={kind} onClick={() => void request('POST', { action: 'email', kind, ids: selected, requestId: crypto.randomUUID() })}>{data?.preview ? t.preview : t.submit} · {t[kind]} ({selected.length})</button>)}</div>}
  </WeddingPanel>
  <WeddingPanel title={t.entries}><div className="space-y-4">{data?.entries.map(entry => <article className="space-y-2 rounded-xl border p-4" key={entry.id}><h3 className="font-bold">{t[entry.kind]}</h3>{entry.locked ? <p>{t.locked}</p> : <><p className="font-semibold">{entry.name}</p><p className="whitespace-pre-wrap text-sm">{entry.message}</p><EntryMedia entry={entry} slug={slug} lang={lang} /><button type="button" className={secondaryClass} disabled={busy} onClick={() => void request('POST', { action: 'moderate', id: entry.id, approved: !entry.approved })}>{entry.approved ? t.reject : t.approve}</button></>}</article>)}</div><a href={`/${encodeURIComponent(slug)}/celebrate/guestbook?lang=${lang}`} className={`${secondaryClass} mt-4 inline-block`} target="_blank" rel="noreferrer">{t.export}</a></WeddingPanel>
  <WeddingPanel title={t.viewMail}><div className="space-y-3">{data?.emails.map(mail => <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4" key={mail.id}><div><p className="font-semibold">{mail.subject}</p><p className="break-all text-xs text-stone-600">{mail.recipient} · {mail.language.toUpperCase()} · {mail.status === 'preview' ? t.preview : mail.status === 'failed' ? t.error : mail.status === 'sent' ? t.saved : t.loading}</p>{mail.status === 'preview' && <p className="text-xs text-blue-800">{t.deliveryPreview}</p>}</div><a href={`${endpoint}?mail=${mail.id}`} target="_blank" rel="noreferrer" className={secondaryClass}>{t.preview} ↗</a></article>)}</div></WeddingPanel>
  </fieldset>
  <div data-autosave-state={combinedStatus} className="sticky bottom-3 z-10 space-y-2 rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur">
   <p role="status" aria-live="polite" className={`text-sm ${combinedStatus === 'error' || combinedStatus === 'invalid' ? 'text-red-800' : 'text-stone-700'}`}>{saveStatus}</p>
   {!data ? <button type="button" className={`${buttonClass} w-full`} onClick={() => void load()}>{t.retryLoad}</button> : <button type="button" className={`${buttonClass} w-full`} disabled={combinedStatus === 'uploading' || combinedStatus === 'saving' || !!autosave.recovery || !!programSave?.blocked} onClick={saveNow}>{combinedStatus === 'uploading' ? imageCopy(lang).uploading : combinedStatus === 'saving' ? t.autoSaving : combinedStatus === 'error' ? t.retrySave : t.save}</button>}
  </div>
 </section>;
}
