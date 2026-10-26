import type { Lang } from '@/lib/i18n/translations';
import { weddingFeatureDetails } from '@/lib/wedding/feature-details';
import { presentationCopy } from '@/lib/wedding-suite/presentation-copy';
import { weddingCopy } from '@/lib/wedding/copy';

export function WeddingFeatureDetails({ lang = 'sl' }: { lang?: Lang } = {}) {
 const t = presentationCopy(lang), w = weddingCopy(lang);
 return <>
  <p className="mt-5 max-w-3xl text-base leading-8 text-stone-600">{t.detailsIntro}</p>
  <p className="mt-4 text-sm font-semibold text-stone-700">{t.openDetails}</p>
  <div className="mt-7 grid min-w-0 items-start gap-x-10 md:grid-cols-2">{weddingFeatureDetails(lang).map(feature => <article id={`funkcija-${feature.id}`} data-wedding-feature-detail key={feature.id} className="min-w-0 scroll-mt-44 border-b border-stone-300 py-2 [overflow-wrap:anywhere]">
   <details className="group">
    <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden"><h3 className="text-lg font-semibold leading-7 sm:text-xl">{feature.title}</h3><span aria-hidden="true" className="shrink-0 text-2xl font-light text-stone-600 transition-transform group-open:rotate-45">+</span></summary>
    <div className="space-y-5 pb-6"><p className="text-base leading-8 text-stone-600">{feature.body}</p><div><h4 className="text-sm font-semibold">{t.how}</h4><ul className="mt-3 space-y-3 text-sm leading-7 text-stone-700">{feature.points.map(point => <li className="flex items-start gap-3" key={point}><span aria-hidden="true" className="shrink-0 text-amber-800">✓</span><span className="min-w-0">{point}</span></li>)}</ul></div>{feature.example && <div className="rounded-xl bg-stone-100 p-4 text-sm leading-7"><p className="font-semibold">{t.idea}</p><p className="mt-1 text-stone-700">{feature.example}</p></div>}<a href={['urnik','meni','glasbene-zelje','foto-bingo'].includes(feature.id) ? '#experience' : '#guide'} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4">{w.preview} →</a></div>
   </details>
  </article>)}</div>
 </>;
}
