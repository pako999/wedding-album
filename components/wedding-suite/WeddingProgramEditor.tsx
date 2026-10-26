'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_WEDDING, parseWeddingSettings, weddingRowText, type WeddingRow } from '@/lib/wedding/contracts';
import { defaultChallenges, weddingCopy, weddingError } from '@/lib/wedding/copy';
import { weddingSaveContract, weddingTranslationFingerprint, mergeWeddingTranslations } from '@/lib/wedding/autosave';
import { suiteCopy } from '@/lib/wedding-suite/copy';
import type { SuiteLang } from '@/lib/wedding-suite/contracts';
import { builderCopy } from '@/lib/wedding-suite/builder-copy';
import { presentationCopy } from '@/lib/wedding-suite/presentation-copy';
import { type SaveState, useSettingsAutosave } from './useSuiteAutosave';
import { WeddingPanel, fieldClass, secondaryClass } from '@/components/wedding/WeddingViews';
import { WeddingSettingsLivePreview } from '@/components/wedding/WeddingSettingsLivePreview';
import { TRANSLATION_COPY } from '@/components/wedding/TranslationOptions';

export type ProgramSaveHandle = { status: SaveState; error: string; flush: () => Promise<boolean>; blocked: boolean };
type Group = 'schedule' | 'menu' | 'challenges';
export function WeddingProgramEditor({ slug, lang, editLang, autoTranslate, albumName, eventDate, onSaveState }: {
 slug: string; lang: SuiteLang; editLang: SuiteLang; autoTranslate: boolean; albumName?: string | null; eventDate?: string | null; onSaveState: (handle: ProgramSaveHandle) => void;
}) {
 const t = weddingCopy(lang), s = suiteCopy(lang), p = presentationCopy(lang);
 const endpoint = `/api/albums/${encodeURIComponent(slug)}/wedding/manage`;
 const onSaved = useCallback(() => {}, []);
 const autosave = useSettingsAutosave(endpoint, EMPTY_WEDDING, onSaved, weddingSaveContract);
 const { config: settings, setConfig: setSettings, initialize } = autosave;
 const [loaded, setLoaded] = useState(false), [error, setError] = useState(''), [hasDj, setHasDj] = useState(false), [djLink, setDjLink] = useState(''), [busy, setBusy] = useState(false);
 const [group, setGroup] = useState<Group>('schedule');
 const [translationWarning, setTranslationWarning] = useState(false);
 const attempt = useRef<string | null>(null), translating = useRef(false), translationEnabled = useRef(autoTranslate);
 useEffect(() => { translationEnabled.current = autoTranslate; }, [autoTranslate]);
 const load = useCallback(async () => {
  setError('');
  try {
   const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(20_000) }); const result = await response.json();
   if (!response.ok || !result.eligible) throw new Error(result.error || 'premiumRequired');
   const parsed = parseWeddingSettings(result.settings); if (!parsed) throw new Error('unavailable');
   // Old rows without sourceLang keep their album language, even when editing translations.
   for (const key of ['schedule', 'menu', 'challenges'] as const) for (const row of parsed[key]) row.sourceLang ??= result.sourceLang ?? lang;
   initialize(parsed); setHasDj(result.hasDjLink); setLoaded(true); return true;
  } catch (cause) { setError(weddingError(lang, cause instanceof Error ? cause.message : '')); return false; }
 }, [endpoint, initialize, lang]);
 useEffect(() => { void Promise.resolve().then(() => load()); }, [load]);
 useEffect(() => {
  if (!loaded || !autoTranslate || autosave.status !== 'saved' || autosave.recovery || translating.current) return;
  const fingerprint = weddingTranslationFingerprint(settings);
  if (!fingerprint || fingerprint === attempt.current) return;
  const timer = setTimeout(async () => {
   attempt.current = fingerprint; translating.current = true; setTranslationWarning(false);
   try {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'translate', settings, source: lang }), signal: AbortSignal.timeout(50_000) });
    const result = await response.json(); const parsed = parseWeddingSettings(result.settings);
    if (!response.ok || !parsed) throw new Error('translation');
    if (translationEnabled.current) setSettings(current => mergeWeddingTranslations(current, settings, parsed));
   } catch { setTranslationWarning(true); }
   finally { translating.current = false; }
  }, 2500);
  return () => clearTimeout(timer);
 }, [loaded, autoTranslate, autosave.status, autosave.recovery, settings, endpoint, lang, setSettings]);
 function edit(row: WeddingRow, key: 'title' | 'detail' | 'time', value: string) {
  setSettings(current => ({ ...current, [group]: current[group].map(item => {
   if (item.id !== row.id) return item;
   const sourceLang = item.sourceLang ?? lang;
   return key === 'time' || editLang === sourceLang ? { ...item, sourceLang, [key]: value }
    : { ...item, sourceLang, translations: { ...item.translations, [editLang]: { ...item.translations?.[editLang], [key]: value } } };
  }) }));
 }
 async function createDj() {
  if (hasDj && !window.confirm(t.rotateConfirm)) return;
  if (!await autosave.flush()) return;
  setBusy(true); setError('');
  try {
   const response = await fetch(endpoint, { method: 'POST' }); const result = await response.json();
   if (!response.ok) throw new Error(result.error);
   const url = new URL(result.path, location.origin); url.searchParams.set('lang', lang); setDjLink(url.href); setHasDj(true);
  } catch (cause) { setError(weddingError(lang, cause instanceof Error ? cause.message : '')); }
  finally { setBusy(false); }
 }
 useEffect(() => { onSaveState({ status: error && !loaded ? 'error' : autosave.status, error: error || autosave.error, flush: loaded ? autosave.flush : load, blocked: !!autosave.recovery }); }, [autosave.status, autosave.error, autosave.flush, autosave.recovery, loaded, error, load, onSaveState]);
 const status = autosave.status === 'saved' ? s.autoSaved : autosave.status === 'saving' ? s.autoSaving : autosave.status === 'pending' ? s.autoPending : autosave.status === 'invalid' ? s.autoInvalid : autosave.status === 'error' ? `${s.autoFailed} ${weddingError(lang, autosave.error)}` : t.loading;
 return <WeddingPanel title={t.schedule}>
  <div data-wedding-program-editor className="space-y-5">
   <p className="text-sm leading-6 text-stone-600">{p.programHint}</p>
   {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
   {!loaded ? <button type="button" className={secondaryClass} onClick={() => void load()}>{error ? s.retryLoad : t.loading}</button> : <>
    {autosave.recovery && <div role="alert" className="space-y-3 rounded-xl bg-amber-50 p-4"><p>{s.draftConflict}</p><button type="button" className={secondaryClass} onClick={() => autosave.resolveRecovery(true)}>{s.restoreDraft}</button> <button type="button" className={secondaryClass} onClick={() => autosave.resolveRecovery(false)}>{s.keepSaved}</button></div>}
    <div className="grid min-w-0 gap-6 xl:grid-cols-2"><fieldset disabled={!!autosave.recovery} className="min-w-0 space-y-5">
     <label className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm font-semibold"><input type="checkbox" className="mt-1 size-5" checked={settings.enabled} onChange={event => setSettings(current => ({ ...current, enabled: event.target.checked }))}/>{t.enabled}</label>
     <label className="block text-sm font-semibold">{builderCopy(lang).category}<select aria-label={builderCopy(lang).category} className={fieldClass} value={group} onChange={event => setGroup(event.target.value as Group)}>{(['schedule', 'menu', 'challenges'] as const).map(key => <option key={key} value={key}>{key === 'challenges' ? t.bingo : t[key]}</option>)}</select></label>
     {settings[group].map((row, index) => <div key={row.id} className="space-y-3 rounded-xl border border-stone-200 p-4">
      <div className="flex items-center justify-between"><span className="text-xs text-stone-500">{index + 1}</span><button type="button" className="min-h-11 px-2 text-sm text-red-700" onClick={() => setSettings(current => ({ ...current, [group]: current[group].filter(item => item.id !== row.id) }))}>{t.remove}</button></div>
      {group === 'schedule' && <label className="block text-sm">{t.time}<input type="time" className={fieldClass} value={row.time || ''} onChange={event => edit(row, 'time', event.target.value)}/></label>}
      <label className="block text-sm">{t.rowTitle}<input className={fieldClass} maxLength={160} value={weddingRowText(row, editLang, 'title', false)} onChange={event => edit(row, 'title', event.target.value)}/></label>
      <label className="block text-sm">{t.rowDetail}<textarea className={fieldClass} rows={3} maxLength={1000} value={weddingRowText(row, editLang, 'detail', false)} onChange={event => edit(row, 'detail', event.target.value)}/></label>
     </div>)}
     <div className="flex flex-wrap gap-3"><button type="button" className={secondaryClass} disabled={settings[group].length >= (group === 'challenges' ? 25 : 40)} onClick={() => setSettings(current => ({ ...current, [group]: [...current[group], { id: crypto.randomUUID(), sourceLang: editLang, title: '', detail: '', ...(group === 'schedule' ? { time: '18:00' } : {}) }] }))}>+ {t.add}</button>
      {group === 'challenges' && !settings.challenges.length && <button type="button" className={secondaryClass} onClick={() => setSettings(current => ({ ...current, challenges: defaultChallenges(editLang) }))}>{t.photoBingoFeatured}</button>}</div>
     <div className="space-y-3 border-t border-stone-200 pt-5"><h3 className="font-semibold">{t.dj}</h3><p className="text-sm leading-6 text-stone-600">{t.djHelp}</p>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="size-5" checked={settings.requestsOpen} onChange={event => setSettings(current => ({ ...current, requestsOpen: event.target.checked }))}/>{t.requestsOpen}</label>
      <button type="button" disabled={busy} className={secondaryClass} onClick={() => void createDj()}>{t.createDj}</button>
      {djLink && <div className="space-y-2"><input readOnly aria-label={t.dj} className={fieldClass} value={djLink} onFocus={event => event.target.select()}/><button type="button" className={secondaryClass} onClick={() => { void navigator.clipboard.writeText(djLink).catch(() => setError(t.error)); }}>{t.copy}</button></div>}
     </div>
    </fieldset><WeddingSettingsLivePreview lang={editLang} data={settings} name={albumName} eventDate={eventDate}/></div>
    {translationWarning && <p role="status" className="text-sm text-amber-800">{TRANSLATION_COPY[lang].warning}</p>}
    <p data-program-save-state={autosave.status} role="status" aria-live="polite" className={`text-sm ${['error', 'invalid'].includes(autosave.status) ? 'text-red-800' : 'text-stone-600'}`}>{status}</p>
    {autosave.status === 'error' && <button type="button" className={secondaryClass} onClick={() => void autosave.flush()}>{s.retrySave}</button>}
   </>}
  </div>
 </WeddingPanel>;
}
