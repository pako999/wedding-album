import type { Lang } from './i18n/translations';
import type { WeddingOfferQuote } from './wedding-offer';
import { PREMIUM_REGULAR_PRICE_CENTS } from './plan-pricing';
import { weddingPriceSummary } from './wedding-offer-copy';
import { weddingCopy } from './wedding/copy';
import { WEDDING_PATHS } from './wedding/contracts';
import { localeAbsoluteUrl } from './urls';

/** Search markup must use the same verified quote as checkout, not a permanent sale. */
export function weddingStructuredOffer(lang: Lang, quote?: WeddingOfferQuote | null) {
  const discounted = !!(quote?.verified && quote.eligible);
  return {
    '@type': 'Offer', name: weddingCopy(lang).plan,
    price: ((discounted ? quote.priceCents : PREMIUM_REGULAR_PRICE_CENTS) / 100).toFixed(2),
    priceCurrency: 'EUR', url: localeAbsoluteUrl(lang, WEDDING_PATHS[lang]),
    availability: `https://schema.org/${discounted ? 'LimitedAvailability' : 'InStock'}`,
    description: weddingPriceSummary(lang),
  };
}
