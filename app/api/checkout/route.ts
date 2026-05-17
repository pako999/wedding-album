import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://guestcam.si";

const PLAN_CONFIG: Record<string, { name: string; amount: number }> = {
  basic:      { name: "Guestcam Basic",         amount: 3900 },
  plus:       { name: "Guestcam Plus",           amount: 4900 },
  premium:    { name: "Guestcam Premium",        amount: 7900 },
  film_pro:   { name: "Film Studio Pro (100 foto)",     amount: 1000 }, // €10
  film_premium: { name: "Film Studio Premium (300 foto)", amount: 2000 }, // €20
};

type PlanId = "basic" | "plus" | "premium" | "film_pro" | "film_premium";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }
  const stripe = new Stripe(stripeKey);

  // Auth — verify the caller is logged in
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
  };

  const { planId, albumSlug, tableStands } = body;

  if (!planId || !albumSlug || !(planId in PLAN_CONFIG)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Verify the user owns this album
  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, albumSlug),
  });

  if (!album || album.ownerClerkId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = PLAN_CONFIG[planId];

  const lineItems: Stripe.Checkout.SessionCreateParams["line_items"] = [
    {
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: plan.amount,
        product_data: { name: plan.name },
      },
    },
  ];

  if (tableStands) {
    lineItems!.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: 900,
        product_data: { name: "Guestcam Podstavki za mizo" },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "link"],
    line_items: lineItems,
    success_url: `${APP_URL}/dashboard/${albumSlug}?upgraded=1`,
    cancel_url: `${APP_URL}/dashboard/${albumSlug}/upgrade`,
    allow_promotion_codes: true,
    metadata: {
      albumSlug,
      planId,
    },
  });

  return NextResponse.json({ url: session.url });
}
