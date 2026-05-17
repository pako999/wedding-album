import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }
  const stripe = new Stripe(stripeKey);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const albumSlug = session.metadata?.albumSlug;
    const planId = session.metadata?.planId;

    if (!albumSlug || !planId) {
      console.error("[stripe webhook] missing metadata", session.metadata);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // Film tier upgrades — just set filmTier, no expiry
    if (planId === "film_pro" || planId === "film_premium") {
      const filmTier = planId === "film_pro" ? "pro" : "premium";
      try {
        await db
          .update(albums)
          .set({ filmTier: filmTier as "pro" | "premium", stripeSessionId: session.id })
          .where(eq(albums.slug, albumSlug));
      } catch (err) {
        console.error("[stripe webhook] DB update failed:", err);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }

    // Per-plan limits and expiry
    const planConfig: Record<string, { maxPhotos: number; daysAccess: number }> = {
      basic:   { maxPhotos: 1000,    daysAccess: 90  }, // 3 months
      plus:    { maxPhotos: 999_999, daysAccess: 365 }, // 1 year
      premium: { maxPhotos: 999_999, daysAccess: 365 }, // 1 year
    };
    const config = planConfig[planId];
    if (!config) {
      console.error("[stripe webhook] unknown planId:", planId);
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }
    const expiresAt = new Date(Date.now() + config.daysAccess * 24 * 60 * 60 * 1000);

    try {
      await db
        .update(albums)
        .set({
          plan: planId as "basic" | "plus" | "premium",
          stripeSessionId: session.id,
          maxPhotos: config.maxPhotos,
          expiresAt,
        })
        .where(eq(albums.slug, albumSlug));
    } catch (err) {
      console.error("[stripe webhook] DB update failed:", err);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
