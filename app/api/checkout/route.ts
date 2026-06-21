import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createPayment, mollieConfigured, MollieError } from "@/lib/mollie";
import { validateDiscount } from "@/lib/discount";

export const runtime = "nodejs";

const PLAN_CONFIG: Record<string, { name: string; amount: number }> = {
  basic:        { name: "Guestcam Basic",                   amount: 3900 },
  plus:         { name: "Guestcam Plus",                    amount: 4900 },
  premium:      { name: "Guestcam Premium",                 amount: 7900 },
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
    discountCode?: string;
  };
  const { planId, albumSlug, tableStands, discountCode } = body;

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

  if (discountCode) {
    const disc = await validateDiscount(discountCode, planId);
    if (disc.valid) {
      baseCents = disc.finalCents;
      discountCodeId = disc.discountCodeId;
    }
  }

  const totalCents = baseCents + (tableStands ? 900 : 0);
  const description = plan.name + (tableStands ? " + Podstavki za mizo" : "");

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
      metadata: { albumSlug, planId, ...(discountCodeId ? { discountCodeId } : {}) },
    });

    // Persist payment ID so /api/mollie-return can reconcile if webhook hasn't fired yet.
    await db.update(albums)
      .set({ stripeSessionId: id })
      .where(eq(albums.slug, albumSlug));

    return NextResponse.json({ paymentUrl: checkoutUrl });
  } catch (err) {
    const status = err instanceof MollieError ? err.status : 500;
    const detail = err instanceof MollieError ? err.message : "Checkout failed";
    console.error("[mollie checkout] create payment failed:", err);
    return NextResponse.json({ error: detail }, { status: status >= 400 && status < 600 ? status : 500 });
  }
}
