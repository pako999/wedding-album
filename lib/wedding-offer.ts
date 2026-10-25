import { randomUUID } from 'node:crypto';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { PREMIUM_REGULAR_PRICE_CENTS, PREMIUM_SALE_PRICE_CENTS, WEDDING_OFFER_CAPACITY, WEDDING_OFFER_ID } from './plan-pricing';

export type WeddingOfferQuote = { verified: boolean; remaining: number | null; capacity: number; eligible: boolean; pending: boolean; priceCents: number };
export type OfferClaim = { attemptId: string; slot: number };
export class OfferConflict extends Error {}

/** Eight durable slots for this campaign; cookies and page views never consume inventory. */
export function createWeddingOfferStore(database: () => NeonQueryFunction<false, false>) {
  async function quote(customerId = ''): Promise<WeddingOfferQuote> {
    const unavailable: WeddingOfferQuote = { verified: false, remaining: null, capacity: WEDDING_OFFER_CAPACITY, eligible: false, pending: false, priceCents: PREMIUM_REGULAR_PRICE_CENTS };
    try {
      const rows = await database()`SELECT count(*)::int AS total,
        count(*) FILTER (WHERE state = 'available')::int AS remaining,
        max(CASE WHEN customer_id = ${customerId} THEN state ELSE NULL END) AS customer_state
        FROM wedding_offer_slots WHERE campaign_id = ${WEDDING_OFFER_ID}`;
      const row = rows[0];
      if (Number(row?.total) !== WEDDING_OFFER_CAPACITY) return unavailable;
      const remaining = Number(row.remaining);
      const eligible = remaining > 0 && !row.customer_state;
      return { verified: true, remaining, capacity: WEDDING_OFFER_CAPACITY, eligible, pending: row.customer_state === 'reserved', priceCents: eligible ? PREMIUM_SALE_PRICE_CENTS : PREMIUM_REGULAR_PRICE_CENTS };
    } catch { return unavailable; }
  }
  async function reserve(customerId: string, albumSlug: string, method: 'card' | 'invoice'): Promise<OfferClaim | null> {
    if (!customerId || !albumSlug) throw new OfferConflict('invalid_customer');
    const attemptId = randomUUID();
    // Row locks and SKIP LOCKED prevent two buyers claiming the final slot.
    // The unique customer index rolls back a competing claim by the same account.
    const rows = await database()`WITH candidate AS (
      SELECT slot FROM wedding_offer_slots WHERE campaign_id = ${WEDDING_OFFER_ID} AND state = 'available'
        AND NOT EXISTS (SELECT 1 FROM wedding_offer_slots WHERE campaign_id = ${WEDDING_OFFER_ID} AND customer_id = ${customerId})
      ORDER BY slot FOR UPDATE SKIP LOCKED LIMIT 1
    ) UPDATE wedding_offer_slots AS offer SET state = 'reserved', customer_id = ${customerId}, album_slug = ${albumSlug},
      method = ${method}, attempt_id = ${attemptId}, reserved_at = now()
      FROM candidate WHERE offer.campaign_id = ${WEDDING_OFFER_ID} AND offer.slot = candidate.slot
      RETURNING offer.slot`;
    return rows[0] ? { attemptId, slot: Number(rows[0].slot) } : null;
  }
  async function bind(attemptId: string, paymentRef: string) {
    const rows = await database()`UPDATE wedding_offer_slots SET payment_ref = ${paymentRef}
      WHERE campaign_id = ${WEDDING_OFFER_ID} AND attempt_id = ${attemptId} AND state = 'reserved'
      AND (payment_ref IS NULL OR payment_ref = ${paymentRef}) RETURNING slot`;
    if (!rows.length) throw new OfferConflict('offer_binding_failed');
  }
  async function settle(attemptId: string | undefined, paymentRef: string, albumSlug: string, paid: boolean) {
    if (!attemptId) return; // Historical payments never touch the new campaign.
    if (paid) {
      await database()`UPDATE wedding_offer_slots SET state = 'paid', payment_ref = ${paymentRef}
        WHERE attempt_id = ${attemptId} AND album_slug = ${albumSlug}
        AND (payment_ref IS NULL OR payment_ref = ${paymentRef}) AND state = 'reserved'`;
    } else {
      await database()`UPDATE wedding_offer_slots SET state = 'available', customer_id = NULL, album_slug = NULL,
        method = NULL, attempt_id = NULL, payment_ref = NULL, reserved_at = NULL
        WHERE attempt_id = ${attemptId} AND album_slug = ${albumSlug}
        AND (payment_ref IS NULL OR payment_ref = ${paymentRef}) AND state = 'reserved'`;
    }
  }
  async function settleBank(orderId: string, paid: boolean) {
    let rows;
    try {
      rows = await database()`SELECT attempt_id, album_slug FROM wedding_offer_slots
        WHERE payment_ref = ${`bank:${orderId}`} LIMIT 1`;
    } catch (cause) {
      // Existing invoices must still be payable before the optional campaign is installed.
      if (cause && typeof cause === 'object' && 'code' in cause && cause.code === '42P01') return;
      throw cause;
    }
    if (rows[0]) await settle(String(rows[0].attempt_id), `bank:${orderId}`, String(rows[0].album_slug), paid);
  }
  async function releaseRejected(attemptId: string) {
    await database()`UPDATE wedding_offer_slots SET state = 'available', customer_id = NULL, album_slug = NULL,
      method = NULL, attempt_id = NULL, payment_ref = NULL, reserved_at = NULL
      WHERE campaign_id = ${WEDDING_OFFER_ID} AND attempt_id = ${attemptId} AND payment_ref IS NULL AND state = 'reserved'`;
  }
  return { quote, reserve, bind, settle, settleBank, releaseRejected };
}

export const weddingOffer = createWeddingOfferStore(() => {
  if (!process.env.DATABASE_URL) throw new Error('Offer database unavailable');
  return neon(process.env.DATABASE_URL);
});
