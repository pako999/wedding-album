'use client';
import { useEffect, useRef, useState } from 'react';
import type { SuiteLang } from '@/lib/wedding-suite/contracts';
import { imageCopy } from '@/lib/wedding-suite/image-copy';
import { prepareWeddingImage } from '@/lib/wedding-suite/prepare-image';
import { pageCoverSource, safePageLink } from '@/lib/wedding-suite/page-design';
import { fieldClass, secondaryClass } from '@/components/wedding/WeddingViews';

export function WeddingImageField({ value, onChange, lang, label, uploadEndpoint, onUploadBusy }: {
 value: string; onChange: (url: string) => void; lang: SuiteLang; label: string;
 uploadEndpoint?: string; onUploadBusy?: (busy: boolean) => void;
}) {
 const t = imageCopy(lang); const input = useRef<HTMLInputElement>(null);
 const flight = useRef<AbortController | null>(null); const alive = useRef(true);
 const latest = useRef({ value, onChange, onUploadBusy });
 const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
 useEffect(() => { latest.current = { value, onChange, onUploadBusy }; }, [value, onChange, onUploadBusy]);
 useEffect(() => { alive.current = true; return () => { alive.current = false; flight.current?.abort(); }; }, []);
 async function upload(file: File) {
  if (!uploadEndpoint || flight.current) return;
  const controller = new AbortController(); flight.current = controller;
  const original = latest.current.value, notify = latest.current.onUploadBusy;
  setBusy(true); setError(''); setMessage(''); notify?.(true);
  const timeout = setTimeout(() => controller.abort(), 60_000);
  try {
   const blob = await prepareWeddingImage(file); controller.signal.throwIfAborted();
   const response = await fetch(uploadEndpoint, { method: 'PUT', headers: { 'Content-Type': blob.type }, body: blob, signal: controller.signal });
   const result = await response.json();
   if (!response.ok) throw new Error(result.error);
   const url = safePageLink(result.url); if (!url) throw new Error('invalid_image');
   if (!alive.current) return;
   // A slow upload must not replace a template/photo chosen while it was pending.
   if (latest.current.value !== original) { setMessage(t.superseded); return; }
   latest.current.onChange(url); setMessage(t.uploaded);
  } catch (cause) {
   if (alive.current) setError(cause instanceof Error && (cause.message === 'too_large' || cause.message === 'invalid_image') ? t[cause.message] : t.error);
  } finally {
   clearTimeout(timeout); flight.current = null; notify?.(false); if (alive.current) setBusy(false);
  }
 }
 const photo = pageCoverSource(value);
 return <div data-wedding-image-field className="min-w-0 space-y-3">
  {uploadEndpoint && <>
   <div className="flex flex-wrap items-center gap-3">
    {photo && <img src={photo} alt="" width={64} height={64} className="size-16 rounded-xl border border-stone-200 object-cover" />}
    <button type="button" disabled={busy} className={secondaryClass} onClick={() => input.current?.click()}>{busy ? t.uploading : t.upload}</button>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif" aria-label={`${t.upload} · ${label}`} className="sr-only" disabled={busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void upload(file); }} />
    {value && <button type="button" className="min-h-11 px-2 text-sm text-red-700 underline underline-offset-4" aria-label={`${t.remove} · ${label}`} onClick={() => { onChange(''); setError(''); setMessage(''); }}>{t.remove}</button>}
   </div>
   <p className="text-xs leading-5 text-stone-600">{t.hint}</p>
  </>}
  <label className="block text-sm">{label}<input type="text" inputMode="url" aria-label={label} className={fieldClass} placeholder="https://" value={value} onChange={event => { onChange(event.target.value); setError(''); setMessage(''); }} /></label>
  {busy && <p role="status" className="text-sm text-stone-600">{t.uploading}</p>}
  {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
  {message && <p role="status" className="text-sm text-stone-600">{message}</p>}
 </div>;
}
