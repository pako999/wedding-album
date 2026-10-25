import { WeddingOfferPrice } from './WeddingOfferPrice';
import { packageCopy, weddingFeatures, WEDDING_GUIDE_PATHS } from '@/lib/wedding/package-copy';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { SeoFooter } from '@/components/SeoFooter';
import { WeddingWalkthrough } from './WeddingWalkthrough';
import type { Lang } from '@/lib/i18n/translations';
import { weddingCopy } from '@/lib/wedding/copy';
import { WEDDING_PATHS,WEDDING_LANGS } from '@/lib/wedding/contracts';
import { localeAbsoluteUrl,localePublicPath,localizedAccountPath } from '@/lib/urls';
import { withRegionalHreflang } from '@/lib/seo/hreflang';
import { ogImage, localizedOgImageUrl } from '@/lib/og';
export function weddingAlternates(){return Object.fromEntries(WEDDING_LANGS.map(lang=>[lang,localeAbsoluteUrl(lang,WEDDING_PATHS[lang])])) as Record<Lang,string>;}
export function weddingMetadata(lang:Lang):Metadata{const t=weddingCopy(lang);const links=weddingAlternates();return {title:`${t.plan} — GuestCam`,description:packageCopy(lang).intro,alternates:{canonical:links[lang],languages:withRegionalHreflang({...links,'x-default':links.sl})},robots:{index:true,follow:true},openGraph:{title:`${t.plan} — GuestCam`,description:packageCopy(lang).intro,url:links[lang],type:'website',images:[ogImage(t.plan,lang)]},twitter:{card:'summary_large_image',images:[localizedOgImageUrl(lang)]}};}
export function WeddingLandingPage({lang}: {lang:Lang}) {
 const t=weddingCopy(lang), p=packageCopy(lang), features=weddingFeatures(lang);
 const create=localizedAccountPath(lang,'/dashboard/new?plan=premium');
 const guides=[{title:p.one,body:p.details,image:'/hero/wedding-page-guide.png'},{title:p.two,body:p.design,image:'/hero/wedding-style-guide.png'},{title:p.three,body:p.rsvp,image:'/hero/scan.webp'}];
 return <><SiteHeader lang={lang} hreflang={weddingAlternates()}/><main className="overflow-hidden bg-[#fffdf8] text-stone-900">
  <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-2">
   <div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-800">{t.plan}</p><h1 className="mt-5 font-serif text-5xl leading-[1.04] sm:text-7xl">{p.all}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">{p.intro}</p><WeddingOfferPrice lang={lang}/><div className="flex flex-wrap gap-3"><Link href={create} className="rounded-full bg-stone-900 px-7 py-4 font-bold text-white">{t.choose}</Link><a href="#guide" className="rounded-full border border-stone-300 px-7 py-4 font-semibold">{t.preview} ↓</a></div></div>
   <div className="relative"><div className="relative aspect-[4/5] overflow-hidden rounded-[36px]"><Image src="/hero/homepage-wedding-couple.webp" alt={t.plan} fill priority quality={90} sizes="(max-width:1024px) 92vw, 46vw" className="object-cover"/></div><div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur"><p className="font-serif text-2xl">{p.one}</p><p className="mt-2 text-sm leading-6 text-stone-600">{t.schedule} · {t.menu} · {t.songs} · {t.bingo}</p></div></div>
  </section>
  <section id="guide" className="scroll-mt-24 border-y border-rose-100 bg-[#f7eeeb] py-16 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8"><h2 className="max-w-3xl font-serif text-4xl sm:text-5xl">{p.guide}</h2><Link href={localePublicPath(lang,WEDDING_GUIDE_PATHS[lang])} className="mt-6 inline-flex rounded-full border border-stone-400 px-5 py-3 font-semibold">{p.readGuide} →</Link><div className="mt-10 grid gap-6 lg:grid-cols-3">{guides.map((guide,index)=><article key={guide.title} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"><div className="relative aspect-[4/3] bg-stone-50"><Image src={guide.image} alt={guide.title} fill sizes="(max-width:1024px) 90vw, 30vw" className={index===2?'object-cover':'object-contain p-3'}/></div><div className="p-6"><p className="text-xs font-bold tracking-widest text-rose-800">0{index+1}</p><h3 className="mt-3 font-serif text-3xl">{guide.title}</h3><p className="mt-4 text-sm leading-7 text-stone-600">{guide.body}</p></div></article>)}</div></div></section>
  <section id="features" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"><p className="text-xs font-bold uppercase tracking-widest text-rose-800">{t.included}</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">{t.plan}</h2><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{features.map((feature,index)=><article key={feature.title} className="rounded-3xl border border-stone-200 bg-white p-6"><span className="text-xs font-semibold text-rose-800">{String(index+1).padStart(2,'0')}</span><h3 className="mt-3 text-xl font-bold">{feature.title}</h3><p className="mt-3 text-sm leading-7 text-stone-600">{feature.body}</p></article>)}</div><ul className="mt-8 grid gap-4 rounded-3xl bg-stone-900 p-7 text-white sm:grid-cols-2 lg:grid-cols-3">{[t.photosBenefit,t.videosBenefit,t.storageBenefit,t.zipBenefit,t.wallBenefit,'Film Studio',t.supportBenefit].map(label=><li key={label}>✓ {label}</li>)}</ul></section>
  <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20 sm:px-8"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-widest text-rose-800">{t.preview}</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">{t.organiser} → {t.guest} → {t.dj}</h2></div><WeddingWalkthrough lang={lang}/></section>
  <section className="bg-[#eee4d9] px-5 py-16 text-center sm:py-24"><div className="mx-auto max-w-xl"><h2 className="font-serif text-4xl sm:text-5xl">{p.all}</h2><WeddingOfferPrice lang={lang}/><Link href={create} className="inline-flex rounded-full bg-stone-900 px-8 py-4 font-bold text-white">{t.choose} →</Link></div></section>
 </main><SeoFooter lang={lang}/></>;
}
