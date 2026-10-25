'use client';
import { useCallback, useEffect, useState } from 'react';
import type { WeddingOfferQuote } from '@/lib/wedding-offer';
import type { Lang } from '@/lib/i18n/translations';
import { OFFER_COPY } from '@/lib/wedding-offer-copy';
import { PREMIUM_REGULAR_PRICE_CENTS } from '@/lib/plan-pricing';

export function useWeddingOffer(customer = false) {
  const [quote, setQuote] = useState<WeddingOfferQuote | null>(null);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/wedding-offer${customer ? '?customer=1' : ''}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('unavailable');
      setQuote(await res.json());
    } catch { setQuote(null); }
  }, [customer]);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => void refresh(), 30_000);
    const focus = () => void refresh(); window.addEventListener('focus', focus);
    return () => { clearTimeout(initial); clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [refresh]);
  return { quote, refresh };
}
export function WeddingOfferPrice({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const { quote } = useWeddingOffer(); const t = OFFER_COPY[lang];
  const money = (cents: number) => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(cents / 100);
  return <div data-wedding-offer className={compact ? 'my-3' : 'my-5 space-y-3 rounded-3xl bg-stone-950 p-6 text-white'}>
    <p className="text-xs font-bold uppercase tracking-wide">{quote?.eligible ? t.launch : t.standard}</p>
    <p className="mt-2 text-4xl font-black">{money(quote?.priceCents ?? PREMIUM_REGULAR_PRICE_CENTS)}</p>
    {lang === 'sr' && <p className="mt-2 text-xs opacity-75">≈ {new Intl.NumberFormat('sr-Latn-RS').format(Math.round((quote?.priceCents ?? PREMIUM_REGULAR_PRICE_CENTS) / 100 * 117.4))} RSD</p>}
    {quote?.verified && quote.eligible && <><p className="mt-2 text-sm">{t.available.replace('{n}', String(quote.remaining))}</p><p className="mt-2 text-xs leading-5 opacity-75">{t.terms}</p></>}
  </div>;
}
