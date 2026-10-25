'use client';
import { use, useEffect, useState } from 'react';
import { suiteLang } from '@/lib/wedding-suite/contracts';
import { suiteCopy } from '@/lib/wedding-suite/copy';
import type { SuiteGuestData } from '@/lib/wedding-suite/dto';
export default function GuestbookPrint({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
 const { slug } = use(params); const lang = suiteLang(use(searchParams).lang); const t = suiteCopy(lang);
 const [data, setData] = useState<SuiteGuestData | null>(null); const [failed, setFailed] = useState(false);
 useEffect(() => { const controller = new AbortController(); fetch(`/api/albums/${encodeURIComponent(slug)}/wedding-suite`, { signal: controller.signal, cache: 'no-store' }).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(setData).catch(() => { if (!controller.signal.aborted) setFailed(true); }); return () => controller.abort(); }, [slug]);
 return <main lang={lang} className="mx-auto max-w-3xl space-y-8 p-6 text-stone-900"><div className="flex flex-wrap gap-4 print:hidden"><a className="underline" href={`/${encodeURIComponent(slug)}/celebrate?lang=${lang}`}>← {t.back}</a><button type="button" onClick={() => window.print()} className="rounded-xl bg-stone-900 px-5 py-3 text-white" disabled={!data}>{t.export}</button></div><h1 className="font-serif text-4xl">{data?.album.name} · {t.guestbook}</h1>{failed && <p role="alert">{t.unavailable}</p>}{!data && !failed && <p>{t.loading}</p>}{data?.entries.filter(entry => entry.kind === 'guestbook' && !entry.locked).map(entry => <article className="break-inside-avoid space-y-4 border-b pb-8" key={entry.id}><h2 className="text-xl font-bold">{entry.name}</h2><p className="whitespace-pre-wrap leading-7">{entry.message}</p>{entry.url && !entry.mimeType?.startsWith('video/') && <img className="max-h-96 max-w-full rounded-xl" src={entry.url} alt={entry.name || t.photo} />}</article>)}</main>;
}
