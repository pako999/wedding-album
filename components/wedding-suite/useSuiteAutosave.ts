'use client';

import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
import { configSchema, type SuiteConfig } from '@/lib/wedding-suite/contracts';
import { isRecoverableSuiteDraft, suiteSnapshot } from '@/lib/wedding-suite/autosave';

export type SaveState = 'loading' | 'saved' | 'pending' | 'saving' | 'error' | 'invalid';
type Draft<T> = { base: string; config: T };
type SaveContract<T> = {
 parse: (value: unknown) => T | null;
 snapshot: (value: T) => string;
 recoverable: (value: unknown) => value is T;
 response: (result: Record<string, unknown>) => unknown;
 storagePrefix: string;
};
const suiteContract: SaveContract<SuiteConfig> = {
 parse: value => { const result = configSchema.safeParse(value); return result.success ? result.data : null; },
 snapshot: suiteSnapshot, recoverable: isRecoverableSuiteDraft,
 response: result => result.config, storagePrefix: 'wedding-suite-draft',
};
export function useSuiteAutosave(endpoint: string, initial: SuiteConfig, onSaved: (value: SuiteConfig) => void) {
 return useSettingsAutosave(endpoint, initial, onSaved, suiteContract);
}

/** One write at a time. A response must never replace edits made while it was pending. */
export function useSettingsAutosave<T extends object>(endpoint: string, initial: T, onSaved: (value: T) => void, contract: SaveContract<T>) {
 const [config, setValue] = useState(initial);
 const [status, setStatus] = useState<SaveState>('loading');
 const [error, setError] = useState('');
 const [recovery, setRecovery] = useState<Draft<T> | null>(null);
 const latest = useRef(initial);
 const saved = useRef('');
 const ready = useRef(false);
 const conflict = useRef<Draft<T> | null>(null);
 const flight = useRef<Promise<boolean> | null>(null);
 const controller = useRef<AbortController | null>(null);
 // Config drafts only: never persist the guest list, invitation tokens or email queue.
 const storageKey = `${contract.storagePrefix}:${endpoint}`;
 const persist = useCallback(() => {
  if (!ready.current || conflict.current) return;
  try {
   if (contract.snapshot(latest.current) === saved.current) sessionStorage.removeItem(storageKey);
   else sessionStorage.setItem(storageKey, JSON.stringify({ base: saved.current, config: latest.current }));
  } catch { /* Saving to the server still works when browser storage is unavailable. */ }
 }, [storageKey, contract]);

 const initialize = useCallback((value: T) => {
  if (ready.current) return;
  saved.current = contract.snapshot(value); latest.current = value; ready.current = true;
  try {
   const draft: Draft<T> = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
   if (draft && typeof draft.base === 'string' && contract.recoverable(draft.config) && contract.snapshot(draft.config) !== saved.current) {
    if (draft.base === saved.current) latest.current = draft.config;
    else { conflict.current = draft; setRecovery(draft); }
   }
  } catch { /* Ignore corrupt or obsolete drafts. */ }
  setValue(latest.current);
  setStatus(contract.snapshot(latest.current) === saved.current ? 'saved' : 'pending');
  persist();
 }, [persist, storageKey, contract]);

 const setConfig = useCallback((change: SetStateAction<T>) => {
  const next = typeof change === 'function' ? change(latest.current) : change;
  latest.current = next; setValue(next); setError('');
  if (ready.current) setStatus(flight.current ? 'saving' : contract.snapshot(next) === saved.current ? 'saved' : 'pending');
  persist();
 }, [persist, contract]);

 const resolveRecovery = useCallback((restore: boolean) => {
  const draft = conflict.current; conflict.current = null; setRecovery(null);
  if (restore && draft) setConfig(draft.config); else persist();
 }, [persist, setConfig]);

 const flush = useCallback(async function save(): Promise<boolean> {
  if (!ready.current || conflict.current) return false;
  if (flight.current) { if (!await flight.current) return false; return save(); }
  const snapshot = latest.current; const serialized = contract.snapshot(snapshot);
  if (serialized === saved.current) { setStatus('saved'); return true; }
  if (!contract.parse(snapshot)) { setStatus('invalid'); return false; }
  setStatus('saving'); setError('');
  const requestController = new AbortController(); controller.current = requestController;
  const timeout = setTimeout(() => requestController.abort(), 20_000);
  const pending = (async () => {
   try {
    const response = await fetch(`${endpoint}?translate=0`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: serialized, signal: requestController.signal });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'unavailable');
    const parsed = contract.parse(contract.response(result));
    if (!parsed) throw new Error('unavailable');
    saved.current = contract.snapshot(parsed);
    // Keep the raw input buffer, including trailing spaces typed before a pause.
    // The server's trimmed response is the comparison baseline, not an editor reset.
    onSaved(parsed); persist();
    setStatus(contract.snapshot(latest.current) === saved.current ? 'saved' : 'pending');
    return true;
   } catch (cause) {
    setError(cause instanceof Error ? cause.message : 'unavailable'); setStatus('error'); persist(); return false;
   } finally {
    clearTimeout(timeout); if (controller.current === requestController) controller.current = null;
   }
  })();
  flight.current = pending;
  const ok = await pending; flight.current = null;
  return ok && contract.snapshot(latest.current) !== saved.current ? save() : ok;
 }, [endpoint, persist, onSaved, contract]);

 useEffect(() => {
  if (status !== 'pending' || recovery) return;
  const timer = setTimeout(() => { void flush(); }, 800);
  return () => clearTimeout(timer);
 }, [config, status, recovery, flush]);
 useEffect(() => {
  const online = () => { void flush(); };
  const leaving = (event: BeforeUnloadEvent) => {
   if (ready.current && contract.snapshot(latest.current) !== saved.current) { event.preventDefault(); event.returnValue = ''; }
  };
  // WebKit rejects new fetches from a document being dismissed. Keep its draft
  // locally, and retry when the tab becomes visible rather than during unload.
  let resumeTimer: ReturnType<typeof setTimeout> | undefined;
  const hiding = () => { clearTimeout(resumeTimer); persist(); controller.current?.abort(); };
  const visibility = () => {
   persist(); clearTimeout(resumeTimer);
   // Closing a beforeunload prompt can briefly report "visible" before pagehide.
   if (document.visibilityState === 'visible') resumeTimer = setTimeout(() => { void flush(); }, 800);
  };
  window.addEventListener('online', online); window.addEventListener('beforeunload', leaving); window.addEventListener('pagehide', hiding); document.addEventListener('visibilitychange', visibility);
  return () => { clearTimeout(resumeTimer); window.removeEventListener('online', online); window.removeEventListener('beforeunload', leaving); window.removeEventListener('pagehide', hiding); document.removeEventListener('visibilitychange', visibility); };
 }, [flush, persist, contract]);
 return { config, setConfig, initialize, status, error, flush, recovery, resolveRecovery };
}
