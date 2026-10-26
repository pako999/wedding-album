"use client";
import { useState } from 'react';
import type { Lang } from '@/lib/i18n/translations';
import { weddingCopy } from '@/lib/wedding/copy';
import { DEMO_WEDDING, demoWeddingDate, weddingDemo, weddingDemoCopy } from '@/lib/wedding/demo';
import type { WeddingRow } from '@/lib/wedding/contracts';
import { sampleWeddingPage } from '@/lib/wedding-suite/page-templates';
import { WeddingPageContent } from '@/components/wedding-suite/WeddingPageContent';
import { WeddingPanel, ScheduleView, MenuView, BingoView, SongList, fieldClass } from './WeddingViews';

// Shared production views, fictional data, and local state only: no album or API writes.
export function WeddingWalkthrough({ lang }: { lang: Lang }) {
 return <WeddingDemo key={lang} lang={lang} />;
}

function WeddingDemo({ lang }: { lang: Lang }) {
 const t = weddingCopy(lang), copy = weddingDemoCopy(lang);
 const [tab, setTab] = useState<'organiser' | 'guest' | 'dj'>('guest');
 const [data, setData] = useState(() => weddingDemo(lang));
 const [page] = useState(sampleWeddingPage);
 function updateRow(kind: 'schedule' | 'menu', id: string, update: Partial<WeddingRow>) {
  setData(current => ({ ...current, [kind]: current[kind].map(row => row.id === id ? { ...row, ...update } : row) }));
 }
 return <div data-wedding-walkthrough className="min-w-0 overflow-hidden rounded-[30px] border border-stone-200 bg-stone-100 shadow-xl [overflow-wrap:anywhere]">
  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 py-4 sm:px-7">
   <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Guestcam · {t.preview}</p>
   <div className="grid w-full max-w-full grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 sm:w-auto" role="group" aria-label={t.preview}>
    {(['organiser', 'guest', 'dj'] as const).map(key => <button type="button" key={key} className={`min-h-11 min-w-0 rounded-lg px-2 py-2 text-xs font-bold sm:px-5 ${tab === key ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200'}`} aria-pressed={tab === key} onClick={() => setTab(key)}>{t[key]}</button>)}
   </div>
  </div>
  <p className="border-b border-stone-200 bg-white px-4 py-4 text-xs leading-6 text-stone-600 sm:px-7">{copy.notice}</p>
  <div className="min-w-0 p-4 sm:p-8">
   {tab === 'guest' ? <div data-demo-guest className="space-y-5">
    <WeddingPageContent page={{ ...page, sections: [] }} lang={lang} meta={`${demoWeddingDate(lang)} · ${DEMO_WEDDING.venue} · ${copy.location}`} idPrefix="experience-" />
    <div className="border-y border-stone-300 px-1 py-6 sm:px-3"><h3 className="text-xl font-semibold text-stone-900">{copy.qrTitle}</h3><p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">{copy.qrText}</p></div>
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
     <div data-demo-schedule className="min-w-0"><WeddingPanel title={t.schedule}><ScheduleView rows={data.schedule} lang={lang} /></WeddingPanel></div>
     <div data-demo-menu className="min-w-0"><WeddingPanel title={t.menu}><MenuView rows={data.menu} lang={lang} /></WeddingPanel></div>
    </div>
    <WeddingPanel title={t.bingo}><p className="mb-5 max-w-3xl text-sm leading-7 text-stone-600">{copy.bingoIntro}</p><BingoView rows={data.challenges} completed={data.completed} lang={lang} preview /></WeddingPanel>
   </div> : tab === 'dj' ? <div data-demo-dj className="space-y-5">
    <p className="max-w-3xl text-sm leading-7 text-stone-600">{copy.djIntro}</p>
    <WeddingPanel title={t.dj}><SongList lang={lang} songs={data.songs} onStatus={(id, status) => setData(current => ({ ...current, songs: current.songs.map(song => song.id === id ? { ...song, status } : song) }))} /></WeddingPanel>
   </div> : <div data-demo-organiser className="space-y-5">
    <p className="max-w-3xl text-sm leading-7 text-stone-600">{copy.organiserIntro}</p>
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">{(['schedule', 'menu'] as const).map(kind => <WeddingPanel key={kind} title={t[kind]} badge={t.organiser}>
     <div className="space-y-5">{data[kind].map(row => <fieldset key={row.id} className="min-w-0 space-y-3 border-b border-stone-200 pb-5 last:border-0 last:pb-0">
      <legend className="mb-3 max-w-full break-words text-sm font-semibold text-stone-600">{row.time ? `${row.time} · ` : ''}{row.title}</legend>
      {kind === 'schedule' && <label className="block text-xs font-semibold text-stone-700">{t.time}<input type="time" className={`${fieldClass} mt-2`} value={row.time || ''} onChange={event => updateRow(kind, row.id, { time: event.target.value })} /></label>}
      <label className="block text-xs font-semibold text-stone-700">{t.rowTitle}<input className={`${fieldClass} mt-2`} maxLength={160} value={row.title} onChange={event => updateRow(kind, row.id, { title: event.target.value })} /></label>
      <label className="block text-xs font-semibold text-stone-700">{t.rowDetail}<textarea className={`${fieldClass} mt-2 min-h-28`} maxLength={1000} value={row.detail} onChange={event => updateRow(kind, row.id, { detail: event.target.value })} /></label>
     </fieldset>)}</div>
    </WeddingPanel>)}</div>
   </div>}
  </div>
 </div>;
}
