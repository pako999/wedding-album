import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq, or, ilike } from "drizzle-orm";
import { getPayment, isPaidStatus, mollieConfigured } from "@/lib/mollie";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, email } = await req.json() as { slug?: string; email?: string };
  if (!slug && !email) {
    return NextResponse.json({ error: "Provide slug or email" }, { status: 400 });
  }

  if (!mollieConfigured()) {
    return NextResponse.json({ error: "Mollie not configured" }, { status: 503 });
  }

  const album = await db.query.albums.findFirst({
    where: slug
      ? eq(albums.slug, slug)
      : ilike(albums.ownerEmail, `%${email}%`),
  });

  if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });

  const paymentId = album.stripeSessionId;
  if (!paymentId?.startsWith("tr_")) {
    return NextResponse.json({
      error: "No Mollie payment ID on this album",
      currentPlan: album.plan,
      slug: album.slug,
    }, { status: 422 });
  }

  const payment = await getPayment(paymentId);
  if (!isPaidStatus(payment.status)) {
    return NextResponse.json({
      error: `Payment status is '${payment.status}' — not paid`,
      paymentId,
      slug: album.slug,
    }, { status: 422 });
  }

  const planId = payment.metadata?.planId;
  if (!planId) {
    return NextResponse.json({ error: "No planId in payment metadata", paymentId }, { status: 422 });
  }

  const result = await applyPlanToAlbum(album.slug, planId, paymentId);
  return NextResponse.json({ ok: true, result, slug: album.slug, planId, paymentId });
}
