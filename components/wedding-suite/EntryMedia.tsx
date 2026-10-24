'use client';
import { useState } from 'react';
import type { EntryView } from '@/lib/wedding-suite/dto';
import type { SuiteLang } from '@/lib/wedding-suite/contracts';
import { suiteCopy } from '@/lib/wedding-suite/copy';
export function EntryMedia({ entry, slug, lang, password = '' }: { password?: string; entry: EntryView; slug: string; lang: SuiteLang }) {
 const [playback, setPlayback] = useState<{ url: string; playbackType?: string } | null>(null);
 const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const t = suiteCopy(lang);
 async function play() { setBusy(true); setError(''); try {
  const response = await fetch(`/api/albums/${encodeURIComponent(slug)}/video-playback-url?vid=${encodeURIComponent(entry.videoId!)}`, { headers: password ? { "x-album-password": password } : undefined });
  const value = await response.json(); if (!response.ok) throw new Error(); setPlayback(value);
 } catch { setError(t.unavailable); } finally { setBusy(false); } }
 if (entry.videoId) return <div>{!playback ? <button type="button" disabled={busy} onClick={() => void play()} className="min-h-11 rounded-xl border px-4">{busy ? t.loading : `▶ ${t.video}`}</button>
  : playback.playbackType === 'iframe' ? <iframe title={t.video} src={playback.url} allow="autoplay; fullscreen" allowFullScreen className="aspect-video w-full rounded-xl" /> : <video controls playsInline src={playback.url} className="max-h-96 w-full rounded-xl" />}
  {error && <p role="alert">{error}</p>}</div>;
 if (!entry.url) return null;
 return entry.mimeType?.startsWith('video/') ? <video controls preload="metadata" playsInline src={entry.url} className="max-h-96 w-full rounded-xl" /> : <img src={entry.url} alt={entry.name || t.photo} loading="lazy" className="max-h-96 max-w-full rounded-xl object-contain" />;
}
