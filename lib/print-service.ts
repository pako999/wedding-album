/**
 * Printed QR table stands — the physical add-on sold alongside a plan.
 *
 * This module is the SINGLE source of truth for what the add-on costs
 * and what shipping costs where. Both the checkout API and the invoice
 * (bank order) API compute totals from here, from the country code
 * only — the client never sends a price. That mirrors how plan prices
 * already work in /api/checkout: the browser says WHICH plan, the
 * server decides what it costs.
 *
 * All amounts are in cents to avoid floating-point money.
 */

/**
 * Stands come in two materials, priced per piece. There is deliberately
 * NO volume discount: the price is a flat unit rate at any quantity, so
 * the total is a straight multiplication. Amounts include VAT.
 *
 * `image` is the real product photograph; `imageFallback` is a drawn SVG
 * of the same product. The checkout card requests the photo and swaps to
 * the drawing only if it 404s, so the two photo files can be added to
 * public/print/ at any time — including after this ships — and appear
 * without a code change or a broken image in between.
 *
 * The photos want to be roughly 800×900 WebP (~2× the 400px card slot,
 * so they stay sharp on phone retina screens as well as desktop) and
 * shot portrait, since a table stand is taller than it is wide.
 */
export type StandVariant = "wood" | "gold";

/** Weight of the printed card, quoted in the product description so
 *  "printed" means something concrete to the buyer. */
export const PAPER_GSM = 200;

/** Minimum days between ordering and the event for standard print and
 *  delivery. Stated at the point of purchase rather than buried in a
 *  confirmation email — a wedding date cannot be moved, so someone
 *  ordering four days out needs to know before they pay, not after. */
export const LEAD_TIME_DAYS = 10;

export const STAND_VARIANTS: {
  id: StandVariant;
  /**
   * What the customer is charged per stand. These are the all-in retail
   * prices: printing on 200 g paper is ALREADY inside them, so nothing
   * is added on top here or anywhere downstream.
   */
  unitCents: number;
  image: string;
  imageFallback: string;
}[] = [
  { id: "wood", unitCents: 300, image: "/print/stand-wood.webp", imageFallback: "/print/stand-wood.svg" },
  { id: "gold", unitCents: 450, image: "/print/stand-gold.webp", imageFallback: "/print/stand-gold.svg" },
];

/** Preselected material — the cheaper one, so the first number the
 *  customer sees is the lowest we charge. */
export const DEFAULT_STAND_VARIANT: StandVariant = "wood";

/** Quantity preselected when the add-on is ticked; roughly a typical
 *  wedding's table count. */
export const DEFAULT_STAND_QTY = 10;

/** Upper bound on a self-serve order. Past this it's a conversation
 *  about lead time and a pallet, not a checkout button — and it stops a
 *  mistyped quantity from becoming a five-figure charge. */
export const MAX_STAND_QTY = 500;

export function standUnitCents(variant: StandVariant): number | null {
  return STAND_VARIANTS.find((v) => v.id === variant)?.unitCents ?? null;
}

/**
 * Volume breaks. The unit price is flat at every quantity EXCEPT these
 * two thresholds — there is no sliding scale in between. Ordered
 * largest-first so the first match is the best one the order qualifies
 * for; they are thresholds ("100 or more"), not exact counts, or 101
 * stands would cost more than 100.
 */
export const VOLUME_BREAKS: { minQty: number; percentOff: number }[] = [
  { minQty: 200, percentOff: 20 },
  { minQty: 100, percentOff: 15 },
];

/** Discount percentage an order of `qty` qualifies for, 0 if none. */
export function volumeDiscountPercent(qty: number): number {
  return VOLUME_BREAKS.find((b) => qty >= b.minQty)?.percentOff ?? 0;
}

/**
 * Price for `qty` stands of a material, in cents, or null when either
 * input is one we don't sell. Null rather than a clamped or defaulted
 * value so a tampered request is rejected instead of quietly repriced.
 */
export function standsPriceCents(qty: number, variant: StandVariant): number | null {
  const unit = standUnitCents(variant);
  if (unit === null) return null;
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_STAND_QTY) return null;
  const gross = unit * qty;
  const off = volumeDiscountPercent(qty);
  return off === 0 ? gross : Math.round(gross * (1 - off / 100));
}

/** Effective per-stand price after any volume break, for the "x,xx €/kos"
 *  hint under the quantity field. */
export function effectiveUnitCents(qty: number, variant: StandVariant): number | null {
  const total = standsPriceCents(qty, variant);
  return total === null ? null : Math.round(total / qty);
}

/**
 * Because the breaks are thresholds, an order just below one costs MORE
 * than a bigger order: 99 stands is 148,50 € but 100 is 127,50 €. That
 * is inherent to threshold pricing, not a rounding artefact — so rather
 * than let a customer pay more for less, surface the better deal.
 *
 * Returns the quantity to suggest and what they'd save, or null when
 * the current quantity is already the best price.
 */
export function betterVolumeOffer(
  qty: number,
  variant: StandVariant,
): { qty: number; saveCents: number } | null {
  const current = standsPriceCents(qty, variant);
  if (current === null) return null;
  for (const b of [...VOLUME_BREAKS].reverse()) {
    if (qty >= b.minQty || b.minQty > MAX_STAND_QTY) continue;
    const at = standsPriceCents(b.minQty, variant);
    if (at !== null && at < current) return { qty: b.minQty, saveCents: current - at };
  }
  return null;
}

/** Shipping zones. Serbia is listed on its own because it is NOT in the
 *  EU, so it can't fall through to the EU rate.
 *
 *  INTL covers the non-EU neighbours we ship to (BA, ME, MK, plus UK and
 *  Switzerland) at the same 9,90 € as the EU zone. It is a SEPARATE zone
 *  rather than an alias of EU because these are customs destinations —
 *  the parcel needs a commercial invoice — and keeping the zone distinct
 *  means fulfilment can tell the two apart even though the price matches
 *  today. */
export const SHIPPING = {
  SI: { cents: 350, carrier: "DPD / Pošta Slovenije" },
  HR: { cents: 350, carrier: "DPD / Hrvatska pošta" },
  RS: { cents: 900, carrier: "DPD / Pošta Srbije" },
  EU: { cents: 990, carrier: "UPS Express" },
  INTL: { cents: 990, carrier: "UPS Express" },
} as const;

/** EU member states (ISO-3166-1 alpha-2), minus SI and HR which have
 *  their own domestic rate above. */
const EU_COUNTRIES = [
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SK",
] as const;

/** Non-EU destinations we ship to at the same rate as the EU zone.
 *  Serbia is deliberately NOT here — it has its own 9,00 € rate. */
const INTL_COUNTRIES = ["BA", "ME", "MK", "GB", "CH"] as const;

/** Countries we ship to, in the order they should appear in a picker:
 *  home markets first, then the EU alphabetically. */
export const SHIPPING_COUNTRIES: { code: string; name: string }[] = [
  { code: "SI", name: "Slovenija" },
  { code: "HR", name: "Hrvaška" },
  { code: "RS", name: "Srbija" },
  { code: "AT", name: "Avstrija" },
  { code: "BE", name: "Belgija" },
  { code: "BG", name: "Bolgarija" },
  { code: "CY", name: "Ciper" },
  { code: "CZ", name: "Češka" },
  { code: "DK", name: "Danska" },
  { code: "EE", name: "Estonija" },
  { code: "FI", name: "Finska" },
  { code: "FR", name: "Francija" },
  { code: "GR", name: "Grčija" },
  { code: "IE", name: "Irska" },
  { code: "IT", name: "Italija" },
  { code: "LV", name: "Latvija" },
  { code: "LT", name: "Litva" },
  { code: "LU", name: "Luksemburg" },
  { code: "HU", name: "Madžarska" },
  { code: "MT", name: "Malta" },
  { code: "DE", name: "Nemčija" },
  { code: "NL", name: "Nizozemska" },
  { code: "PL", name: "Poljska" },
  { code: "PT", name: "Portugalska" },
  { code: "RO", name: "Romunija" },
  { code: "SK", name: "Slovaška" },
  { code: "ES", name: "Španija" },
  { code: "SE", name: "Švedska" },
  { code: "BA", name: "Bosna in Hercegovina" },
  { code: "ME", name: "Črna gora" },
  { code: "MK", name: "Severna Makedonija" },
  { code: "CH", name: "Švica" },
  { code: "GB", name: "Združeno kraljestvo" },
];

export interface ShippingQuote {
  cents: number;
  carrier: string;
  zone: "SI" | "HR" | "RS" | "EU" | "INTL";
  /** True when the parcel leaves the EU customs union and needs a
   *  commercial invoice attached. Fulfilment reads this; it does not
   *  change the price. */
  customs: boolean;
}

/**
 * Shipping cost for a country code, or null when we don't ship there.
 * Returning null (rather than a default rate) is deliberate: quietly
 * charging an EU rate for a parcel to another continent would lose
 * money on every such order.
 */
export function quoteShipping(country: string | undefined | null): ShippingQuote | null {
  const c = (country ?? "").trim().toUpperCase();
  if (c === "SI") return { ...SHIPPING.SI, zone: "SI", customs: false };
  if (c === "HR") return { ...SHIPPING.HR, zone: "HR", customs: false };
  if (c === "RS") return { ...SHIPPING.RS, zone: "RS", customs: true };
  if ((EU_COUNTRIES as readonly string[]).includes(c)) {
    return { ...SHIPPING.EU, zone: "EU", customs: false };
  }
  if ((INTL_COUNTRIES as readonly string[]).includes(c)) {
    return { ...SHIPPING.INTL, zone: "INTL", customs: true };
  }
  return null;
}

/**
 * Total for the physical add-on (bundle + shipping) in cents.
 * Returns 0 when the add-on wasn't selected, and null when it was but
 * the quantity isn't a bundle we sell or the destination isn't
 * serviceable — callers must treat null as "reject the order" rather
 * than "charge nothing", or a tampered request ships stands for free.
 */
export function addOnTotalCents(
  wanted: boolean,
  country: string | undefined | null,
  qty: number = DEFAULT_STAND_QTY,
  variant: StandVariant = DEFAULT_STAND_VARIANT,
): number | null {
  if (!wanted) return 0;
  const stands = standsPriceCents(qty, variant);
  if (stands === null) return null;
  const ship = quoteShipping(country);
  if (!ship) return null;
  return stands + ship.cents;
}

/** Formats cents as a plain euro string, e.g. 350 → "3,50 €". */
export function eur(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}
