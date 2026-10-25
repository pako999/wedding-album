'use client';
import { useEffect, useState } from 'react';
import type { Lang } from '@/lib/i18n/translations';
import { WEDDING_PATHS } from '@/lib/wedding/contracts';
import { weddingCopy } from '@/lib/wedding/copy';
import { OFFER_COPY } from '@/lib/wedding-offer-copy';
import { WEDDING_OFFER_ID, PREMIUM_SALE_PERCENT } from '@/lib/plan-pricing';
import { localePublicPath } from '@/lib/urls';
import { useWeddingOffer } from './WeddingOfferPrice';

const RETURN_COPY: Record<Lang, string> = {
 sl: 'Dobrodošli nazaj — preverite preostale pakete.', hr: 'Dobro došli natrag — provjerite preostale pakete.', sr: 'Dobro došli nazad — proverite preostale pakete.',
 en: 'Welcome back — check the remaining packages.', de: 'Willkommen zurück — prüft die verbleibenden Pakete.', es: 'Bienvenidos de nuevo: consultad los paquetes restantes.',
};
const COOKIE = 'gc_wedding_offer_seen';
/** Optional returning-visitor greeting. Never controls prices or inventory. */
function useReturningVisitor() {
 const [returning, setReturning] = useState(false);
 useEffect(() => {
  const sync = () => {
   if (!window.Cookiebot?.consent?.marketing) {
    document.cookie = `${COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    setReturning(false); return;
   }
   const value = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
   const [campaign, stamp] = (value || '').split('~');
   const first = Number(stamp);
   if (campaign === WEDDING_OFFER_ID && Number.isFinite(first) && first > 0) {
    setReturning(Date.now() - first >= 86_400_000);
   } else {
    document.cookie = `${COOKIE}=${WEDDING_OFFER_ID}~${Date.now()}; Max-Age=2592000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
   }
  };
  sync();
  for (const name of ['CookiebotOnAccept','CookiebotOnDecline','CookiebotOnLoad']) window.addEventListener(name, sync);
  return () => { for (const name of ['CookiebotOnAccept','CookiebotOnDecline','CookiebotOnLoad']) window.removeEventListener(name, sync); };
 }, []);
 return returning;
}
export function WeddingOfferBanner({ lang }: { lang: Lang }) {
 const { quote } = useWeddingOffer(); const returning = useReturningVisitor(); const t = OFFER_COPY[lang];
 if (!quote?.verified || !quote.eligible) return null;
 const money = new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(quote.priceCents / 100);
 return <div data-wedding-offer-banner className="rounded-b-2xl border-t border-amber-400/50 bg-[#F4B400] px-4 py-3 text-center text-black">
  <a href={localePublicPath(lang, WEDDING_PATHS[lang])} className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-bold leading-5">
   <span className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">−{PREMIUM_SALE_PERCENT}%</span>
   <span>{weddingCopy(lang).plan} · {money}</span><span className="font-black underline underline-offset-4">{t.available.replace('{n}', String(quote.remaining))} →</span>
  </a>
  {returning && <p className="mt-1 text-xs font-medium">{RETURN_COPY[lang]}</p>}
 </div>;
}
