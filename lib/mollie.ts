/**
 * Mollie Payments API client (plain fetch, no SDK).
 * Docs: https://docs.mollie.com/reference/create-payment
 */

export function mollieConfigured(): boolean {
  return !!process.env.MOLLIE_API_KEY;
}

export class MollieError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "MollieError";
    this.status = status;
  }
}

export interface MolliePayment {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  // Present once any refund has been processed. Both fields are absent
  // on payments that have never been refunded.
  amountRefunded?: { value: string; currency: string };
  amountRemaining?: { value: string; currency: string };
  description: string;
  method: string | null; // e.g. "ideal", "creditcard", "banktransfer"
  metadata: {
    albumSlug?: string;
    planId?: string;
    discountCodeId?: string;
    affiliateRef?: string;
    // Physical add-on. Mollie stores metadata as strings, so the flag is
    // "1" rather than a boolean. /api/checkout writes these; the webhook
    // and admin/payments read them back.
    tableStands?: string;
    standsQty?: string;
    standsVariant?: string;
    standsCents?: string;
    shipCountry?: string;
    shipCents?: string;
    shipCarrier?: string;
    shipCustoms?: string;
  } | null;
  createdAt: string;
  _links?: {
    checkout?: { href: string; type: string };
  };
}

async function mollieFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new MollieError("MOLLIE_API_KEY not set", 503);

  const res = await fetch(`https://api.mollie.com/v2${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (json as { detail?: string; title?: string } | null)?.detail ??
      (json as { detail?: string; title?: string } | null)?.title ??
      res.statusText;
    throw new MollieError(msg, res.status);
  }
  return json as T;
}

export async function createPayment(opts: {
  amountCents: number;
  currency?: string;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata: Record<string, string>;
}): Promise<{ id: string; checkoutUrl: string }> {
  const currency = opts.currency ?? "EUR";
  const value = (opts.amountCents / 100).toFixed(2);

  const payment = await mollieFetch<MolliePayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      amount: { value, currency },
      description: opts.description,
      redirectUrl: opts.redirectUrl,
      webhookUrl: opts.webhookUrl,
      metadata: opts.metadata,
    }),
  });

  const checkoutUrl = payment._links?.checkout?.href;
  if (!checkoutUrl) throw new MollieError("No checkout URL in Mollie response", 500);

  return { id: payment.id, checkoutUrl };
}

export async function getPayment(id: string): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>(`/payments/${encodeURIComponent(id)}`);
}

export function isPaidStatus(status: string): boolean {
  return status === "paid";
}

/** Status values that indicate a paid payment has been reversed in full. */
export function isRefundedStatus(status: string): boolean {
  return status === "refunded" || status === "charged_back";
}

export async function listPayments(limit = 50): Promise<MolliePayment[]> {
  if (!mollieConfigured()) return [];
  try {
    const res = await mollieFetch<{
      _embedded?: { payments?: MolliePayment[] };
    }>(`/payments?limit=${limit}`);
    return res._embedded?.payments ?? [];
  } catch {
    return [];
  }
}

/**
 * Retrieve the complete Mollie history for financial admin totals. Mollie's
 * endpoint returns at most 250 rows per page, so follow its `from` cursor until
 * no next page remains. A hard page cap prevents an unexpected API loop.
 */
export async function listAllPayments(maxPages = 100): Promise<MolliePayment[]> {
  if (!mollieConfigured()) return [];

  const payments: MolliePayment[] = [];
  let from: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const query = new URLSearchParams({ limit: "250", sort: "desc" });
    if (from) query.set("from", from);

    const result = await mollieFetch<{
      _embedded?: { payments?: MolliePayment[] };
      _links?: { next?: { href?: string } };
    }>(`/payments?${query.toString()}`);
    payments.push(...(result._embedded?.payments ?? []));

    const nextHref = result._links?.next?.href;
    if (!nextHref) break;
    const nextFrom = new URL(nextHref).searchParams.get("from");
    if (!nextFrom || nextFrom === from) break;
    from = nextFrom;
  }

  return payments;
}
