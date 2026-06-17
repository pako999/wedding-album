import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPayment, isPaidStatus, mollieConfigured } from "@/lib/mollie";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mollie redirects here after the customer completes (or abandons) the payment.
 * We reconcile the payment server-side and bounce to the dashboard.
 * This is a backstop — the primary reconcile happens in the webhook.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug") ?? "";
  const dashboardUrl = `/dashboard/${encodeURIComponent(slug)}`;

  if (!slug || !mollieConfigured()) {
    return NextResponse.redirect(new URL(`${dashboardUrl}?upgraded=1`, req.nextUrl.origin));
  }

  try {
    const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
    const paymentId = album?.stripeSessionId;

    if (paymentId?.startsWith("tr_")) {
      const payment = await getPayment(paymentId);
      if (isPaidStatus(payment.status)) {
        const planId = payment.metadata?.planId;
        if (planId) {
          await applyPlanToAlbum(slug, planId, paymentId);
        }
      }
    }
  } catch (err) {
    console.error("[mollie-return] reconcile error:", err);
  }

  return NextResponse.redirect(new URL(`${dashboardUrl}?upgraded=1`, req.nextUrl.origin));
}
