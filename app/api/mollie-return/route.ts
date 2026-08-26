import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPayment, isPaidStatus, mollieConfigured } from "@/lib/mollie";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dashboardRedirect(req: NextRequest, slug: string, params: Record<string, string> = {}) {
  const base = slug ? `/dashboard/${encodeURIComponent(slug)}` : "/dashboard";
  const url = new URL(base, req.nextUrl.origin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
}

/**
 * Mollie redirects here after the customer completes (or abandons) payment.
 *
 * The return page is only a convenience reconciliation path; the Mollie
 * webhook remains the source of truth. Never show `upgraded=1` until Mollie's
 * authenticated API confirms this exact payment belongs to this exact album
 * and the plan application succeeds.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim() ?? "";
  if (!slug) return dashboardRedirect(req, "", { payment: "invalid" });
  if (!mollieConfigured()) {
    return dashboardRedirect(req, slug, { payment: "unavailable" });
  }

  try {
    const album = await db.query.albums.findFirst({
      columns: { stripeSessionId: true },
      where: eq(albums.slug, slug),
    });
    const paymentId = album?.stripeSessionId?.trim() ?? "";

    if (!/^tr_[A-Za-z0-9]+$/.test(paymentId)) {
      console.warn("[mollie-return] album has no valid Mollie payment ref:", slug);
      return dashboardRedirect(req, slug, { payment: "pending" });
    }

    // Retry briefly because Mollie can redirect the browser before its status
    // endpoint has moved from open/pending to paid.
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const payment = await getPayment(paymentId);
        if (!isPaidStatus(payment.status)) continue;

        // Critical binding check: a slug in the return URL is user-controlled.
        // Only reconcile when Mollie's server-owned metadata points back to the
        // same album. This prevents one album's payment reference from ever
        // being applied to a different slug through a crafted return URL.
        if (payment.metadata?.albumSlug !== slug) {
          console.error("[mollie-return] payment/album metadata mismatch", {
            requestedSlug: slug,
            paymentId,
            metadataSlug: payment.metadata?.albumSlug ?? null,
          });
          return dashboardRedirect(req, slug, { payment: "invalid" });
        }

        const planId = payment.metadata?.planId;
        if (!planId) {
          console.error("[mollie-return] paid payment missing plan metadata:", paymentId);
          return dashboardRedirect(req, slug, { payment: "invalid" });
        }

        const applied = await applyPlanToAlbum(slug, planId, paymentId);
        if (!applied) {
          console.error("[mollie-return] unknown paid plan:", planId);
          return dashboardRedirect(req, slug, { payment: "invalid" });
        }

        const params: Record<string, string> = { upgraded: "1" };
        if (payment.amount?.value) params.amount = payment.amount.value;
        return dashboardRedirect(req, slug, params);
      } catch (err) {
        if (attempt === 4) {
          console.error("[mollie-return] Mollie reconciliation failed after retries:", err);
        }
      }
    }

    console.warn("[mollie-return] payment not paid after retries:", paymentId);
    return dashboardRedirect(req, slug, { payment: "pending" });
  } catch (err) {
    console.error("[mollie-return] reconcile error:", err);
    return dashboardRedirect(req, slug, { payment: "error" });
  }
}
