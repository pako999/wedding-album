import { NextRequest, NextResponse } from "next/server";
import {
  addOnTotalCents, quoteShipping, standsPriceCents,
  DEFAULT_STAND_QTY, DEFAULT_STAND_VARIANT, type StandVariant,
} from "@/lib/print-service";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, cardBilling } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createPayment, mollieConfigured, MollieError } from "@/lib/mollie";
import { validateDiscount } from "@/lib/discount";
import { getAffiliateRefFromCookie } from "@/lib/affiliate/attribution";
import { getGuestRefFromCookie } from "@/lib/referral/attribution";
import { recordStandOrder } from "@/lib/stand-orders";

export const runtime = "nodejs";

const PLAN_CONFIG: Record<string, { name: string; amount: number }> = {
  basic:        { name: "CamLove Basic",                   amount: 3900 },
  plus:         { name: "CamLove Plus",                    amount: 4900 },
  premium:      { name: "CamLove Premium",                 amount: 9900 },
  film_pro:     { name: "Film Studio Pro (100 foto)",        amount: 1000 },
  film_premium: { name: "Film Studio Premium (300 foto)",    amount: 2000 },
};

type PlanId = "basic" | "plus" | "premium" | "film_pro" | "film_premium";

export async function POST(req: NextRequest) {
  if (!mollieConfigured()) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    // Clerk error
  }
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    planId: PlanId;
    albumSlug: string;
    tableStands?: boolean;
    /** Number of stands. Validated server-side against the allowed range — an
     *  unknown quantity is rejected, never repriced to a nearest match. */
    standsQty?: number;
    /** Material. Unknown values are rejected by standsPriceCents,
     *  not defaulted — otherwise a bad value silently bills the
     *  cheaper material for the dearer product. */
    standsVariant?: StandVariant;
    discountCode?: string;
    billing?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      postalCode?: string;
      city?: string;
      companyName?: string;
      taxId?: string;
      /** ISO-3166 alpha-2. Required when tableStands is true — it is what
       *  the shipping rate is computed from. */
      country?: string;
    };
  };
  const { planId, albumSlug, tableStands, standsQty, standsVariant, discountCode, billing } = body;

  if (!planId || !albumSlug || !(planId in PLAN_CONFIG)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, albumSlug),
  });
  if (!album || album.ownerClerkId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = PLAN_CONFIG[planId];
  let baseCents = plan.amount;
  let discountCodeId: string | undefined;
  // Pull the referral code from the cookie. May be overridden below if
  // the buyer used a promo code that belongs to an affiliate — that
  // takes precedence over the cookie (most recent and explicit signal).
  let affiliateRef = await getAffiliateRefFromCookie();

  if (discountCode) {
    const disc = await validateDiscount(discountCode, planId);
    if (!disc.valid) {
      return NextResponse.json({ error: disc.error ?? "Discount code is no longer valid." }, { status: 409 });
    }
    baseCents = disc.finalCents;
    discountCodeId = disc.discountCodeId;
    // Resolve the affiliate (by id → referralCode) if this discount code
    // is tied to a partner. We carry the partner's referralCode in
    // Mollie metadata so the webhook can credit the commission.
    if (disc.affiliateId) {
      const { affiliates } = await import("@/lib/db/schema");
      const aff = await db.query.affiliates.findFirst({
        where: eq(affiliates.id, disc.affiliateId),
      }).catch(() => null);
      if (aff && aff.status === "active") affiliateRef = aff.referralCode;
    }
  }

  // Guest referral discount (P0). If no explicit discount code was
  // applied AND the buyer has a valid ?ref= cookie from another album,
  // give them 15% off and stash the source album's referralCode in
  // Mollie metadata so the webhook can flip referral_conversions to
  // "paid". Affiliate discount takes precedence — only one 15% applies.
  let guestRefCode: string | null = null;
  let guestRefTouchpoint: string | null = null;
  if (!discountCodeId) {
    const gref = await getGuestRefFromCookie();
    if (gref?.code) {
      const source = await db.query.albums.findFirst({
        where: eq(albums.referralCode, gref.code),
      }).catch(() => null);
      // Never apply self-referral, and never on the FIRST purchase of the
      // referring album itself (source.ownerClerkId !== buyer).
      if (source && source.ownerClerkId !== userId) {
        baseCents = Math.round(baseCents * 0.85);
        guestRefCode = gref.code;
        guestRefTouchpoint = gref.tp ?? null;
      }
    }
  }

  // Physical add-on. Priced SERVER-SIDE from the destination country —
  // the browser only says whether it wants stands and where to ship, the
  // same trust model the plan price already uses. A country we don't
  // ship to is rejected outright rather than silently charged a default
  // rate, which would lose money on every such parcel.
  const addOnCents = addOnTotalCents(!!tableStands, billing?.country, standsQty, standsVariant);
  if (addOnCents === null) {
    return NextResponse.json({ error: "shipping_unavailable" }, { status: 400 });
  }
  const ship = tableStands ? quoteShipping(billing?.country) : null;

  const totalCents = baseCents + addOnCents;
  const standsQ = standsQty ?? DEFAULT_STAND_QTY;
  const standsV = standsVariant ?? DEFAULT_STAND_VARIANT;
  const description = plan.name + (tableStands ? ` + ${standsQ}× QR podstavki za mize (${standsV === "gold" ? "zlati" : "leseni"}, s poštnino)` : "");

  const baseUrl = req.nextUrl.origin;
  // Mollie redirects back to /api/mollie-return which does reconcile then bounces to dashboard.
  const redirectUrl = `${baseUrl}/api/mollie-return?slug=${encodeURIComponent(albumSlug)}`;
  const webhookUrl = `${baseUrl}/api/webhooks/mollie`;

  try {
    const { id, checkoutUrl } = await createPayment({
      amountCents: totalCents,
      description,
      redirectUrl,
      webhookUrl,
      metadata: {
        albumSlug,
        planId,
        ...(discountCodeId ? { discountCodeId } : {}),
        ...(affiliateRef ? { affiliateRef } : {}),
        ...(guestRefCode ? { guestRefCode } : {}),
        ...(guestRefTouchpoint ? { guestRefTouchpoint } : {}),
        // Fulfilment needs to know a parcel is owed and where it goes —
        // the payment record is the only thing guaranteed to survive.
        ...(tableStands
          ? {
              tableStands: "1",
              standsQty: String(standsQ),
              standsVariant: standsV,
              standsCents: String(standsPriceCents(standsQ, standsV) ?? 0),
              shipCountry: (billing?.country ?? "").toUpperCase(),
              shipCents: String(ship?.cents ?? 0),
              shipCarrier: ship?.carrier ?? "",
              // Outside the EU customs union the parcel needs a
              // commercial invoice — flag it here so whoever packs it
              // doesn't have to re-derive it from the country code.
              ...(ship?.customs ? { shipCustoms: "1" } : {}),
            }
          : {}),
      },
    });

    // Persist payment ID so /api/mollie-return can reconcile if webhook hasn't fired yet.
    await db.update(albums)
      .set({ stripeSessionId: id })
      .where(eq(albums.slug, albumSlug));

    // Persist the billing details for invoicing — Mollie's hosted checkout
    // doesn't collect an address, so this form is the only source. Keyed by
    // the Mollie payment id; admin/payments + the paid webhook read it back.
    if (billing) {
      const clean = (v?: string) => (v?.trim() ? v.trim() : null);
      await db.insert(cardBilling).values({
        molliePaymentId: id,
        albumSlug,
        name:        clean(billing.name),
        email:       clean(billing.email),
        phone:       clean(billing.phone),
        address:     clean(billing.address),
        postalCode:  clean(billing.postalCode),
        city:        clean(billing.city),
        companyName: clean(billing.companyName),
        taxId:       clean(billing.taxId),
      }).onConflictDoNothing().catch((err) => console.error("[checkout] billing insert failed:", err));
    }

    // Physical fulfilment record. Written here rather than on the paid
    // webhook so the parcel is on the books the moment it's ordered — a
    // webhook that never fires would otherwise leave no queryable trace
    // that stands are owed. Status starts "pending" and the webhook flips
    // it to "paid"; admin filters on that so nothing ships unpaid.
    if (tableStands) {
      const clean = (v?: string) => (v?.trim() ? v.trim() : null);
      await recordStandOrder({
        albumSlug,
        source: "card",
        orderRef: id,
        planId,
        planName: plan.name,
        planCents: baseCents,
        variant: standsV,
        qty: standsQ,
        standsCents: standsPriceCents(standsQ, standsV) ?? 0,
        shipCents: ship?.cents ?? 0,
        shipCarrier: ship?.carrier ?? null,
        shipCountry: (billing?.country ?? "").toUpperCase() || null,
        shipCustoms: !!ship?.customs,
        totalCents,
        recipientName:  clean(billing?.name),
        recipientPhone: clean(billing?.phone),
        recipientEmail: clean(billing?.email),
        address:        clean(billing?.address),
        postalCode:     clean(billing?.postalCode),
        city:           clean(billing?.city),
        companyName:    clean(billing?.companyName),
        taxId:          clean(billing?.taxId),
      });
    }

    return NextResponse.json({ paymentUrl: checkoutUrl });
  } catch (err) {
    const status = err instanceof MollieError ? err.status : 500;
    const detail = err instanceof MollieError ? err.message : "Checkout failed";
    console.error("[mollie checkout] create payment failed:", err);
    return NextResponse.json({ error: detail }, { status: status >= 400 && status < 600 ? status : 500 });
  }
}
