import crypto from "node:crypto";

/**
 * Minimal Paddle Billing server client (no SDK — plain fetch + Node crypto).
 *
 * We use server-created Transactions with *non-catalog* (ad-hoc) prices so the
 * checkout mirrors the old Stripe flow: prices are built on the fly per plan,
 * with no pre-created catalog Products/Prices to maintain. The client opens the
 * Paddle.js overlay with the returned transaction id.
 *
 * Environment is selected via PADDLE_ENV ("live" → api.paddle.com, anything
 * else → sandbox-api.paddle.com), so sandbox testing never touches production.
 */

export const PADDLE_ENV: "live" | "sandbox" =
  process.env.PADDLE_ENV === "live" ? "live" : "sandbox";

const API_BASE =
  PADDLE_ENV === "live"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

export function paddleConfigured(): boolean {
  return !!process.env.PADDLE_API_KEY;
}

export class PaddleError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "PaddleError";
    this.status = status;
    this.body = body;
  }
}

async function paddleFetch<T>(
  path: string,
  init?: { method?: string; body?: string },
): Promise<T> {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new PaddleError("PADDLE_API_KEY not set", 503, null);

  const res = await fetch(`${API_BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: init?.body,
    cache: "no-store",
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      (json as { error?: { detail?: string } } | null)?.error?.detail ??
      res.statusText;
    throw new PaddleError(detail, res.status, json);
  }
  return (json as { data: T }).data;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export interface AdHocLineItem {
  /** Customer-facing product name, e.g. "Guestcam Basic". */
  name: string;
  /** Price in the smallest currency unit (cents), e.g. 3900 for €39.00. */
  amountCents: number;
}

export interface PaddleTransaction {
  id: string;
  status: string;
  custom_data?: Record<string, string> | null;
  created_at?: string;
  details?: {
    totals?: { grand_total?: string; currency_code?: string };
  };
  customer?: { email?: string } | null;
}

/**
 * Create a one-off transaction with ad-hoc prices. Returns the transaction id
 * (txn_…) which the client passes to Paddle.Checkout.open({ transactionId }).
 */
export async function createTransaction(opts: {
  items: AdHocLineItem[];
  currency?: string;
  customData?: Record<string, string>;
}): Promise<PaddleTransaction> {
  const currency = opts.currency ?? "EUR";
  const body = {
    items: opts.items.map((it) => ({
      quantity: 1,
      price: {
        name: it.name,
        description: it.name,
        unit_price: { amount: String(it.amountCents), currency_code: currency },
        tax_mode: "account_setting",
        product: { name: it.name, tax_category: "standard" as const },
      },
    })),
    currency_code: currency,
    collection_mode: "automatic" as const,
    custom_data: opts.customData ?? {},
  };
  return paddleFetch<PaddleTransaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getTransaction(id: string): Promise<PaddleTransaction> {
  return paddleFetch<PaddleTransaction>(
    `/transactions/${encodeURIComponent(id)}?include=customer`,
  );
}

export async function listTransactions(limit = 50): Promise<PaddleTransaction[]> {
  return paddleFetch<PaddleTransaction[]>(
    `/transactions?per_page=${limit}&order_by=created_at[DESC]&include=customer`,
  );
}

/** A Paddle transaction counts as a completed sale at these statuses. */
export function isPaidStatus(status: string): boolean {
  return status === "completed" || status === "paid" || status === "billed";
}

// ─── Discounts ──────────────────────────────────────────────────────────────

export interface PaddleDiscount {
  id: string;
  code: string | null;
  status: string;
  type: string;
  amount: string;
  currency_code?: string | null;
  usage_limit?: number | null;
  times_used?: number;
  expires_at?: string | null;
}

export async function listDiscounts(limit = 50): Promise<PaddleDiscount[]> {
  return paddleFetch<PaddleDiscount[]>(`/discounts?per_page=${limit}&order_by=created_at[DESC]`);
}

export async function createDiscount(opts: {
  code: string;
  type: "percentage" | "flat";
  /** percentage → percent value (e.g. 10); flat → euros (e.g. 5 → €5). */
  amount: number;
  currency?: string;
  description: string;
  /** Total number of times the code may be redeemed (null = unlimited). */
  maxRedemptions?: number | null;
  /** Days from now until the code expires (null = never). */
  expiresInDays?: number | null;
}): Promise<PaddleDiscount> {
  const body: Record<string, unknown> = {
    description: opts.description,
    code: opts.code,
    enabled_for_checkout: true,
    recur: false,
  };
  if (opts.type === "percentage") {
    body.type = "percentage";
    body.amount = String(opts.amount);
  } else {
    body.type = "flat";
    body.amount = String(Math.round(opts.amount * 100));
    body.currency_code = opts.currency ?? "EUR";
  }
  if (opts.maxRedemptions && opts.maxRedemptions > 0) {
    body.usage_limit = opts.maxRedemptions;
  }
  if (opts.expiresInDays && opts.expiresInDays > 0) {
    body.expires_at = new Date(Date.now() + opts.expiresInDays * 86_400_000).toISOString();
  }
  return paddleFetch<PaddleDiscount>("/discounts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function archiveDiscount(id: string): Promise<void> {
  await paddleFetch<PaddleDiscount>(`/discounts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "archived" }),
  });
}

// ─── Webhook signature ────────────────────────────────────────────────────────

/**
 * Verify a Paddle webhook. The `Paddle-Signature` header looks like
 * "ts=1700000000;h1=<hex>". The signed payload is `${ts}:${rawBody}` HMAC-SHA256
 * with the destination's secret. Constant-time compared.
 */
export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;

  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(";")) {
    const idx = segment.indexOf("=");
    if (idx === -1) continue;
    parts[segment.slice(0, idx).trim()] = segment.slice(idx + 1).trim();
  }
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");

  const a = Buffer.from(computed);
  const b = Buffer.from(h1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
