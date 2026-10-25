import Image from 'next/image';
import { WEDDING_DETAILS_SL } from '@/lib/wedding/feature-details-sl';

export function WeddingFeatureDetails() {
 return <>
  <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">Kaj lahko pripravita pred poroko, kako sodelujejo gostje in kaj vama ostane po slavju? Spoznajta vsako funkcijo, njen potek in konkreten primer uporabe. Dodatne poročne funkcije vključita po svojih željah.</p>
  <nav aria-label="Poiščita funkcijo" className="mt-6 flex flex-wrap gap-2">{[['urejevalnik','Urejanje strani'],['vabila','Vabila in odgovori'],['urnik','Na poročni dan'],['galerija','Fotografije in spomini']].map(([id,label])=><a key={id} href={`#funkcija-${id}`} className="rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-semibold">{label} ↓</a>)}</nav>
  <div className="mt-10 grid min-w-0 grid-cols-1 gap-7 lg:grid-cols-2">{WEDDING_DETAILS_SL.map((feature,index)=>{
   const screenshot=!feature.image.startsWith('/');
   const image=screenshot?`/hero/wedding-features/${feature.image}.png`:feature.image;
   return <article id={`funkcija-${feature.id}`} data-wedding-feature-detail key={feature.id} className="min-w-0 scroll-mt-48 overflow-hidden rounded-3xl border border-stone-200 bg-white [overflow-wrap:anywhere]">
    <figure className="border-b border-stone-100 bg-[#f7f3ed]"><a href={image} target="_blank" rel="noreferrer" aria-label={`Povečaj sliko: ${feature.title}`} className="relative block aspect-[4/3]"><Image src={image} alt={feature.alt} fill sizes="(max-width:1023px) 90vw, 46vw" className={screenshot?'object-contain p-3 sm:p-5':'object-cover'}/></a><figcaption className="px-5 pb-4 text-xs leading-5 text-stone-500">{screenshot?'Primer dejanskega vmesnika z vzorčnimi podatki. Kliknita za večji prikaz.':'Fotografija za ponazoritev uporabe funkcije.'}</figcaption></figure>
    <div className="p-5 sm:p-8"><p className="text-xs font-bold tracking-widest text-rose-800">{String(index+1).padStart(2,'0')}</p><h3 className="mt-3 font-serif text-3xl leading-tight">{feature.title}</h3><p className="mt-4 text-base leading-7 text-stone-600">{feature.body}</p><h4 className="mt-6 text-sm font-bold">Kako jo uporabita</h4><ul className="mt-3 space-y-3 text-sm leading-6 text-stone-700">{feature.points.map(point=><li className="flex items-start gap-2" key={point}><span aria-hidden="true" className="shrink-0 text-rose-800">✓</span><span className="min-w-0">{point}</span></li>)}</ul><div className="mt-6 rounded-2xl bg-[#fff8eb] p-4 text-sm leading-6"><p className="font-bold text-amber-900">Ideja za vajino poroko</p><p className="mt-1 text-stone-700">{feature.example}</p></div></div>
   </article>;
  })}</div>
 </>;
}
