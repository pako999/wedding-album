'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { WeddingOfferQuote } from '@/lib/wedding-offer';
import type { Lang } from '@/lib/i18n/translations';
import { OFFER_COPY } from '@/lib/wedding-offer-copy';
import { PREMIUM_REGULAR_PRICE_CENTS, PREMIUM_SALE_PERCENT } from '@/lib/plan-pricing';

export function useWeddingOffer(customer = false) {
  const [quote, setQuote] = useState<WeddingOfferQuote | null>(null);
  const mounted = useRef(false), closing = useRef(false);
  const request = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    if (!mounted.current || closing.current || document.visibilityState === 'hidden') return;
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    try {
      const res = await fetch(`/api/wedding-offer${customer ? '?customer=1' : ''}`, { cache: 'no-store', signal: controller.signal });
      if (!res.ok) throw new Error('unavailable');
      const next = await res.json();
      if (mounted.current && !closing.current && !controller.signal.aborted && request.current === controller) setQuote(next);
    } catch {
      if (mounted.current && !closing.current && !controller.signal.aborted && request.current === controller) setQuote(null);
    } finally { if (request.current === controller) request.current = null; }
  }, [customer]);
  useEffect(() => {
    mounted.current = true; closing.current = false;
    const initial = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => void refresh(), 30_000);
    let resume: ReturnType<typeof setTimeout> | undefined;
    // WebKit can emit focus while the old document is being dismissed. Defer
    // resuming so pagehide can cancel that read before a new fetch is started.
    const focus = () => { clearTimeout(resume); if (!closing.current && document.visibilityState === 'visible') resume = setTimeout(() => void refresh(), 150); };
    const hide = () => { closing.current = true; clearTimeout(initial); clearTimeout(resume); request.current?.abort(); };
    const show = (event: PageTransitionEvent) => { if (event.persisted) { closing.current = false; focus(); } };
    const visibility = () => { if (document.visibilityState === 'hidden') { clearTimeout(resume); request.current?.abort(); } else focus(); };
    window.addEventListener('focus', focus); window.addEventListener('pagehide', hide); window.addEventListener('pageshow', show); document.addEventListener('visibilitychange', visibility);
    return () => { mounted.current = false; closing.current = true; clearTimeout(initial); clearTimeout(resume); clearInterval(timer); request.current?.abort(); window.removeEventListener('focus', focus); window.removeEventListener('pagehide', hide); window.removeEventListener('pageshow', show); document.removeEventListener('visibilitychange', visibility); };
  }, [refresh]);
  return { quote, refresh };
}
export function WeddingOfferPrice({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const { quote } = useWeddingOffer(); const t = OFFER_COPY[lang];
  const money = (cents: number) => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(cents / 100);
  return <div data-wedding-offer className={compact ? 'my-3 min-w-0 max-w-full [overflow-wrap:anywhere]' : 'my-5 min-w-0 max-w-full [overflow-wrap:anywhere] space-y-3 rounded-3xl bg-stone-950 p-6 text-white'}>
    <p className="text-xs font-bold uppercase tracking-wide">{quote?.eligible ? t.launch : t.standard}</p>
    {quote?.verified && quote.eligible && <div className="mt-3 flex flex-wrap items-center gap-3"><span className="rounded-full bg-[#F4B400] px-3 py-1 text-sm font-black text-black">−{PREMIUM_SALE_PERCENT}%</span><del className="text-lg opacity-60">{money(PREMIUM_REGULAR_PRICE_CENTS)}</del></div>}
    <p className="mt-2 text-4xl font-black">{money(quote?.priceCents ?? PREMIUM_REGULAR_PRICE_CENTS)}</p>
    {lang === 'sr' && <p className="mt-2 text-xs opacity-75">≈ {new Intl.NumberFormat('sr-Latn-RS').format(Math.round((quote?.priceCents ?? PREMIUM_REGULAR_PRICE_CENTS) / 100 * 117.4))} RSD</p>}
    {quote?.verified && quote.eligible && <><p className="mt-2 text-sm">{t.available.replace('{n}', String(quote.remaining))}</p><p className="mt-2 text-xs leading-5 opacity-75">{t.terms}</p></>}
  </div>;
}
