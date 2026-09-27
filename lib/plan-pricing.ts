export const PREMIUM_REGULAR_PRICE_EUR = 129;
export const PREMIUM_SALE_PERCENT = 35;
/** 129 € × 65% = 83.85 €, presented and charged as 84 €. */
export const PREMIUM_SALE_PRICE_EUR = 84;
export const PREMIUM_SALE_PRICE_CENTS = PREMIUM_SALE_PRICE_EUR * 100;

export const PLAN_SALE_PRICES_EUR = {
  basic: 39,
  plus: 49,
  premium: PREMIUM_SALE_PRICE_EUR,
} as const;
