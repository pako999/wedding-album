import { WeddingFeatureDetails } from './WeddingFeatureDetails';
import { WeddingOfferPrice } from './WeddingOfferPrice';
import { packageCopy, WEDDING_GUIDE_PATHS } from '@/lib/wedding/package-copy';
import type { Metadata } from 'next';
import { WeddingPageContent } from '@/components/wedding-suite/WeddingPageContent';
import { sampleWeddingPage } from '@/lib/wedding-suite/page-templates';
import { presentationCopy } from '@/lib/wedding-suite/presentation-copy';
import { WeddingWebsiteShowcase } from './WeddingWebsiteShowcase';
import { DEMO_WEDDING, demoWeddingDate } from '@/lib/wedding/demo';
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
export function weddingMetadata(lang:Lang):Metadata{const t=weddingCopy(lang);const links=weddingAlternates();const title=`${presentationCopy(lang).website} | ${t.plan} | Guestcam`;return {title,description:presentationCopy(lang).introduction,alternates:{canonical:links[lang],languages:withRegionalHreflang({...links,'x-default':links.sl})},robots:{index:true,follow:true},openGraph:{title,description:presentationCopy(lang).introduction,url:links[lang],type:'website',images:[ogImage(presentationCopy(lang).website,lang)]},twitter:{card:'summary_large_image',images:[localizedOgImageUrl(lang)]}};}

export function WeddingLandingPage({lang}: {lang:Lang}) {
 const t=weddingCopy(lang), p=packageCopy(lang), v=presentationCopy(lang);
 const create=localizedAccountPath(lang,'/dashboard/new?plan=premium');
 const sample=sampleWeddingPage();
 const guides=[{title:p.one,body:p.details},{title:p.two,body:p.design},{title:p.three,body:p.rsvp}];
 const sampleDate=`${demoWeddingDate(lang)} · ${DEMO_WEDDING.venue}`;
 return <><SiteHeader lang={lang} hreflang={weddingAlternates()}/><main className="w-full min-w-0 overflow-hidden bg-[#fffdf8] text-stone-900">
  <section className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 items-center gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 [&>*]:min-w-0">
   <div><p className="text-xs font-bold uppercase tracking-[.16em] text-amber-800">{t.plan}</p><h1 className="mt-5 [overflow-wrap:anywhere] font-serif text-5xl leading-[1.1] sm:text-6xl">{v.website}</h1><p className="mt-5 max-w-xl [overflow-wrap:anywhere] text-lg leading-8 text-stone-600">{v.introduction}</p><WeddingOfferPrice lang={lang}/><div className="flex flex-wrap gap-3"><a href={create} className="rounded-full bg-stone-900 px-7 py-4 font-bold text-white">{t.choose}</a><a href="#guide" className="rounded-full border border-stone-300 px-7 py-4 font-semibold">{t.preview}</a></div></div>
   <div className="min-w-0 rounded-2xl border border-stone-300 bg-white p-3 shadow-lg sm:p-4"><div className="mb-3 flex items-center justify-between gap-3 px-2 text-xs font-semibold text-stone-600"><span>Guestcam</span><span>{v.guestView}</span></div><WeddingPageContent page={{...sample,sections:[]}} lang={lang} meta={sampleDate} idPrefix="hero-"/><p className="px-3 pb-2 pt-4 text-xs leading-5 text-stone-600">{v.sampleLabel}</p></div>
  </section>
  <section id="guide" className="scroll-mt-40 border-y border-stone-200 bg-[#f5f6f3] py-14 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><h2 className="max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">{v.showcase}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-stone-600">{v.showcaseIntro}</p><WeddingWebsiteShowcase lang={lang}/><ol className="mt-10 grid gap-7 md:grid-cols-3">{guides.map((guide,index)=><li key={guide.title} className="border-t border-stone-300 pt-5"><span className="text-sm font-semibold text-stone-600">{index+1}</span><h3 className="mt-3 text-xl font-semibold">{guide.title}</h3><p className="mt-3 text-sm leading-7 text-stone-600">{guide.body}</p></li>)}</ol><a href={localePublicPath(lang,WEDDING_GUIDE_PATHS[lang])} className="mt-8 inline-flex rounded-full border border-stone-400 px-5 py-3 font-semibold">{p.readGuide} →</a></div></section>
  <section id="features" className="mx-auto max-w-7xl scroll-mt-40 px-5 py-14 sm:px-8 sm:py-20"><h2 className="max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">{v.detailsTitle}</h2><WeddingFeatureDetails lang={lang}/><ul className="mt-10 grid gap-4 rounded-2xl border border-stone-300 bg-white p-6 text-sm font-medium sm:grid-cols-2 lg:grid-cols-3">{[t.photosBenefit,t.videosBenefit,t.storageBenefit,t.zipBenefit,t.wallBenefit,'Film Studio',t.supportBenefit].map(label=><li key={label}>✓ {label}</li>)}</ul></section>
  <section id="experience" className="mx-auto max-w-6xl scroll-mt-40 px-5 pb-20 sm:px-8"><div className="mb-8"><h2 className="font-serif text-4xl sm:text-5xl">{t.nav}</h2><p className="mt-4 text-base leading-8 text-stone-600">{v.detailsIntro}</p></div><WeddingWalkthrough lang={lang}/></section>
  <section className="border-t border-stone-200 bg-[#f5f6f3] px-5 py-14 text-center sm:py-20"><div className="mx-auto max-w-xl"><h2 className="font-serif text-4xl sm:text-5xl">{p.all}</h2><WeddingOfferPrice lang={lang}/><a href={create} className="inline-flex rounded-full bg-stone-900 px-8 py-4 font-bold text-white">{t.choose} →</a></div></section>
 </main><SeoFooter lang={lang}/></>;
}
