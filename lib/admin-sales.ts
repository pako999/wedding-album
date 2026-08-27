import { isPaidStatus, type MolliePayment } from "@/lib/mollie";

export const PAID_PLAN_IDS = ["basic", "plus", "premium"] as const;
export type PaidPlanId = (typeof PAID_PLAN_IDS)[number];

export interface PaidBankOrder {
  planId: string;
  planPrice: number;
  status: string;
}

interface PlanSales {
  count: number;
  revenueCents: number;
  mollieCount: number;
  mollieRevenueCents: number;
  bankCount: number;
  bankRevenueCents: number;
}

export interface PaidPlanSalesSummary {
  totalCount: number;
  totalRevenueCents: number;
  mollieCount: number;
  mollieRevenueCents: number;
  bankCount: number;
  bankRevenueCents: number;
  byPlan: Record<PaidPlanId, PlanSales>;
}

function emptyPlanSales(): PlanSales {
  return {
    count: 0,
    revenueCents: 0,
    mollieCount: 0,
    mollieRevenueCents: 0,
    bankCount: 0,
    bankRevenueCents: 0,
  };
}

function isPaidPlanId(value: string | undefined): value is PaidPlanId {
  return PAID_PLAN_IDS.some((plan) => plan === value);
}

function amountToCents(value: string | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

function metadataCents(value: string | undefined): number {
  const cents = Number.parseInt(value ?? "", 10);
  return Number.isFinite(cents) ? Math.max(0, cents) : 0;
}

/**
 * Actual package portion of a paid Mollie transaction. Physical QR stands and
 * their shipping are separate products, so they must not inflate package
 * revenue. Partial refunds reduce the recorded package revenue immediately.
 */
export function molliePackageRevenueCents(payment: MolliePayment): number {
  if (!isPaidStatus(payment.status) || payment.amount.currency.toUpperCase() !== "EUR") return 0;

  const grossCents = amountToCents(payment.amount.value);
  const refundedCents =
    payment.amountRefunded?.currency?.toUpperCase() === "EUR"
      ? amountToCents(payment.amountRefunded.value)
      : 0;
  const netCents = Math.max(0, grossCents - refundedCents);
  const addOnCents =
    metadataCents(payment.metadata?.standsCents) +
    metadataCents(payment.metadata?.shipCents);

  return Math.max(0, netCents - addOnCents);
}

/** Build the admin overview from actual successful payment records. */
export function summarizePaidPlanSales(
  molliePayments: MolliePayment[],
  bankOrders: PaidBankOrder[],
): PaidPlanSalesSummary {
  const byPlan: Record<PaidPlanId, PlanSales> = {
    basic: emptyPlanSales(),
    plus: emptyPlanSales(),
    premium: emptyPlanSales(),
  };

  for (const payment of molliePayments) {
    const planId = payment.metadata?.planId;
    if (!isPaidPlanId(planId) || !isPaidStatus(payment.status)) continue;
    const revenueCents = molliePackageRevenueCents(payment);
    if (revenueCents <= 0) continue;

    const plan = byPlan[planId];
    plan.count++;
    plan.mollieCount++;
    plan.revenueCents += revenueCents;
    plan.mollieRevenueCents += revenueCents;
  }

  for (const order of bankOrders) {
    if (order.status !== "paid" || !isPaidPlanId(order.planId)) continue;
    const revenueCents = Math.max(0, Math.round(order.planPrice * 100));
    if (revenueCents <= 0) continue;

    const plan = byPlan[order.planId];
    plan.count++;
    plan.bankCount++;
    plan.revenueCents += revenueCents;
    plan.bankRevenueCents += revenueCents;
  }

  return PAID_PLAN_IDS.reduce<PaidPlanSalesSummary>((summary, planId) => {
    const plan = byPlan[planId];
    summary.totalCount += plan.count;
    summary.totalRevenueCents += plan.revenueCents;
    summary.mollieCount += plan.mollieCount;
    summary.mollieRevenueCents += plan.mollieRevenueCents;
    summary.bankCount += plan.bankCount;
    summary.bankRevenueCents += plan.bankRevenueCents;
    return summary;
  }, {
    totalCount: 0,
    totalRevenueCents: 0,
    mollieCount: 0,
    mollieRevenueCents: 0,
    bankCount: 0,
    bankRevenueCents: 0,
    byPlan,
  });
}
