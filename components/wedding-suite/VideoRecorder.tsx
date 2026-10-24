'use client';
import { useEffect, useRef, useState } from 'react';
import { suiteCopy } from '@/lib/wedding-suite/copy';
import type { SuiteLang } from '@/lib/wedding-suite/contracts';
import { buttonClass, secondaryClass } from '@/components/wedding/WeddingViews';
export function VideoRecorder({ lang, onFile }: { lang: SuiteLang; onFile: (file: File) => void }) {
 const t = suiteCopy(lang);
 const recorder = useRef<MediaRecorder | null>(null);
 const stream = useRef<MediaStream | null>(null);
 const video = useRef<HTMLVideoElement>(null);
 const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const alive = useRef(true);
 const [recording, setRecording] = useState(false);
 const [error, setError] = useState('');
 const stop = () => { if (recorder.current?.state === 'recording') recorder.current.stop(); };
 useEffect(() => {
  alive.current = true;
  return () => { alive.current = false; if (timer.current) clearTimeout(timer.current); stop(); stream.current?.getTracks().forEach(track => track.stop()); };
 }, []);
 async function record() {
  setError('');
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setError(t.recorderUnsupported); return; }
  try {
   stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
   if (!alive.current) { stream.current.getTracks().forEach(track => track.stop()); return; }
   if (video.current) { video.current.srcObject = stream.current; void video.current.play().catch(() => {}); }
   const mimeType = ['video/mp4', 'video/webm;codecs=vp8,opus', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
   const instance = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
   recorder.current = instance; const parts: Blob[] = [];
   instance.ondataavailable = event => { if (event.data.size) parts.push(event.data); };
   instance.onstop = () => {
    if (timer.current) clearTimeout(timer.current);
    stream.current?.getTracks().forEach(track => track.stop());
    if (video.current) video.current.srcObject = null;
    if (!alive.current) return;
    setRecording(false);
    const type = instance.mimeType || mimeType || 'video/webm';
    const blob = new Blob(parts, { type });
    if (blob.size) onFile(new File([blob], `wedding-wish-${Date.now()}.${type.includes('mp4') ? 'mp4' : 'webm'}`, { type: type.split(';')[0] }));
   };
   instance.start(); setRecording(true); timer.current = setTimeout(stop, 60_000);
  } catch { stream.current?.getTracks().forEach(track => track.stop()); setError(t.recordPermission); }
 }
 return <div className="space-y-3"><p className="text-sm text-stone-600">{t.videoPrompt}</p>
  <video ref={video} autoPlay playsInline muted className={recording ? 'aspect-video w-full rounded-2xl bg-black' : 'hidden'} />
  {recording ? <button className={secondaryClass} type="button" onClick={stop}>{t.stopRecording}</button> : <button className={buttonClass} type="button" onClick={() => void record()}>{t.record} · 60 s</button>}
  <label className="block text-sm font-medium">{t.uploadVideo}<input type="file" accept="video/*" capture="user" className="mt-2 block max-w-full" disabled={recording} onChange={event => { const file = event.target.files?.[0]; if (file) onFile(file); event.target.value = ''; }} /></label>
  {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
 </div>;
}
