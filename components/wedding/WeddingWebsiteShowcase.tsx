'use client';
import { useState } from 'react';
import type { SuiteLang } from '@/lib/wedding-suite/contracts';
import { sampleWeddingPage } from '@/lib/wedding-suite/page-templates';
import { presentationCopy } from '@/lib/wedding-suite/presentation-copy';
import { WeddingPageContent } from '@/components/wedding-suite/WeddingPageContent';
import { WeddingPageBuilder } from '@/components/wedding-suite/WeddingPageBuilder';
import { DEMO_WEDDING, demoWeddingDate, weddingDemoCopy } from '@/lib/wedding/demo';

export function WeddingWebsiteShowcase({ lang }: { lang: SuiteLang }) {
 const t = presentationCopy(lang);
 const [page, setPage] = useState(sampleWeddingPage);
 const [view, setView] = useState<'guestView' | 'editorView'>('guestView');
 const demo = weddingDemoCopy(lang);
 const date = `${demoWeddingDate(lang)} · ${DEMO_WEDDING.venue} · ${demo.location}`;
 return <div data-wedding-showcase className="mt-10 min-w-0 overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-lg">
  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 px-4 py-4 sm:px-6"><p className="text-sm font-semibold">{t.website}</p><div className="grid w-full max-w-full grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 sm:w-auto" role="group" aria-label={t.showcase}>{(['guestView', 'editorView'] as const).map(key => <button type="button" key={key} aria-pressed={view === key} onClick={() => setView(key)} className={`min-h-11 min-w-0 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm ${view === key ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-200'}`}>{t[key]}</button>)}</div></div>
  <p className="border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600 sm:px-6">{demo.notice}</p>
  <div className={view === 'editorView' ? 'p-3 sm:p-6' : 'mx-auto max-w-4xl p-3 sm:p-8'}>{view === 'editorView'
   ? <WeddingPageBuilder value={page} lang={lang} editLang={lang} onChange={setPage} />
   : <WeddingPageContent page={page} lang={lang} meta={date} idPrefix="showcase-" showcaseStyle />}</div>
 </div>;
}
