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
 * We retry the payment status check several times to avoid the race condition
 * where Mollie redirects the browser before the payment is marked "paid" on
 * their servers. Then we apply the plan and bounce to the dashboard.
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
      // Retry up to 5× with 1 s delay — Mollie may redirect before the payment
      // status flips to "paid" on their side (race condition).
      let paid = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
        try {
          const payment = await getPayment(paymentId);
          if (isPaidStatus(payment.status)) {
            const planId = payment.metadata?.planId;
            if (planId) {
              await applyPlanToAlbum(slug, planId, paymentId);
              paid = true;
            }
            break;
          }
        } catch {
          // transient error — try again
        }
      }
      if (!paid) {
        console.warn("[mollie-return] payment not paid after retries:", paymentId);
      }
    }
  } catch (err) {
    console.error("[mollie-return] reconcile error:", err);
  }

  return NextResponse.redirect(new URL(`${dashboardUrl}?upgraded=1`, req.nextUrl.origin));
}
