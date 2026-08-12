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

/** Price of one set of printed QR table stands. Matches the amount the
 *  checkout route already used for `tableStands` before this was wired
 *  up to a UI. */
export const TABLE_STANDS_CENTS = 900;

/** Shipping zones. Serbia is listed on its own because it is NOT in the
 *  EU, so it can't fall through to the EU rate. */
export const SHIPPING = {
  SI: { cents: 350, carrier: "DPD / Pošta Slovenije" },
  HR: { cents: 350, carrier: "DPD / Hrvatska pošta" },
  RS: { cents: 900, carrier: "DPD / Pošta Srbije" },
  EU: { cents: 990, carrier: "UPS Express" },
} as const;

/** EU member states (ISO-3166-1 alpha-2), minus SI and HR which have
 *  their own domestic rate above. */
const EU_COUNTRIES = [
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SK",
] as const;

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
];

export interface ShippingQuote {
  cents: number;
  carrier: string;
  zone: "SI" | "HR" | "RS" | "EU";
}

/**
 * Shipping cost for a country code, or null when we don't ship there.
 * Returning null (rather than a default rate) is deliberate: quietly
 * charging an EU rate for a parcel to another continent would lose
 * money on every such order.
 */
export function quoteShipping(country: string | undefined | null): ShippingQuote | null {
  const c = (country ?? "").trim().toUpperCase();
  if (c === "SI") return { ...SHIPPING.SI, zone: "SI" };
  if (c === "HR") return { ...SHIPPING.HR, zone: "HR" };
  if (c === "RS") return { ...SHIPPING.RS, zone: "RS" };
  if ((EU_COUNTRIES as readonly string[]).includes(c)) return { ...SHIPPING.EU, zone: "EU" };
  return null;
}

/**
 * Total for the physical add-on (product + shipping) in cents.
 * Returns 0 when the add-on wasn't selected, and null when it was but
 * the destination isn't serviceable — callers should treat null as
 * "reject the order" rather than "charge nothing".
 */
export function addOnTotalCents(wanted: boolean, country: string | undefined | null): number | null {
  if (!wanted) return 0;
  const ship = quoteShipping(country);
  if (!ship) return null;
  return TABLE_STANDS_CENTS + ship.cents;
}

/** Formats cents as a plain euro string, e.g. 350 → "3,50 €". */
export function eur(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}
