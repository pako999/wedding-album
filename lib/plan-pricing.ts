export const PREMIUM_REGULAR_PRICE_EUR = 189;
export const PREMIUM_REGULAR_PRICE_CENTS = PREMIUM_REGULAR_PRICE_EUR * 100;
export const PREMIUM_SALE_PERCENT = 40;
export const PREMIUM_SALE_PRICE_CENTS = Math.round(PREMIUM_REGULAR_PRICE_CENTS * (100 - PREMIUM_SALE_PERCENT) / 100);
export const PREMIUM_SALE_PRICE_EUR = PREMIUM_SALE_PRICE_CENTS / 100;
export const WEDDING_OFFER_CAPACITY = 20;
export const WEDDING_OFFER_BATCH_SIZE = 8;
// Keep the existing key so purchases, reservations and returning visitors survive expansion.
export const WEDDING_OFFER_ID = 'wedding-launch-189-40-eight-20261025';
export const BUSINESS_PRICE_EUR = 149;
export const BUSINESS_PRICE_CENTS = BUSINESS_PRICE_EUR * 100;

export const PLAN_SALE_PRICES_EUR = {
  basic: 39,
  plus: 49,
  premium: PREMIUM_REGULAR_PRICE_EUR,
  business: BUSINESS_PRICE_EUR,
} as const;
