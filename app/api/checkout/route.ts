import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createTransaction, paddleConfigured, PaddleError, type AdHocLineItem } from "@/lib/paddle";

export const runtime = "nodejs";

const PLAN_CONFIG: Record<string, { name: string; amount: number }> = {
  basic:      { name: "Guestcam Basic",         amount: 3900 },
  plus:       { name: "Guestcam Plus",           amount: 4900 },
  premium:    { name: "Guestcam Premium",        amount: 7900 },
  film_pro:   { name: "Film Studio Pro (100 foto)",     amount: 1000 }, // €10
  film_premium: { name: "Film Studio Premium (300 foto)", amount: 2000 }, // €20
};

type PlanId = "basic" | "plus" | "premium" | "film_pro" | "film_premium";

export async function POST(req: NextRequest) {
  if (!paddleConfigured()) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

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

  const items: AdHocLineItem[] = [{ name: plan.name, amountCents: plan.amount }];
  if (tableStands) {
    items.push({ name: "Guestcam Podstavki za mizo", amountCents: 900 });
  }

  // Create a Paddle transaction with ad-hoc prices. The client opens the
  // Paddle.js overlay with the returned transaction id; both the webhook
  // (transaction.completed) and the success-URL reconcile read planId/albumSlug
  // back from custom_data.
  try {
    const txn = await createTransaction({
      items,
      currency: "EUR",
      customData: { albumSlug, planId },
    });
    return NextResponse.json({ transactionId: txn.id });
  } catch (err) {
    const status = err instanceof PaddleError ? err.status : 500;
    const detail = err instanceof PaddleError ? err.message : "Checkout failed";
    console.error("[paddle checkout] create transaction failed:", err);
    return NextResponse.json({ error: detail }, { status: status >= 400 && status < 600 ? status : 500 });
  }
}
