import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliates, discountCodes } from "@/lib/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { sendAffiliatePromoCodeEmail } from "@/lib/email/notifications";

export const dynamic = "force-dynamic";

/**
 * GET — current promo code for this affiliate (or null).
 * POST — create a new promo code for the affiliate. Body: { code, percentOff }.
 *        Disables any existing code for the same affiliate first, then sends
 *        the affiliate an email with full details + share template.
 * PATCH — update an existing promo code (code / percentOff / isActive).
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const promo = await db.query.discountCodes.findFirst({
    where: and(eq(discountCodes.affiliateId, id), eq(discountCodes.isActive, true)),
  });
  return NextResponse.json({ promo: promo ?? null });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    code?: string;
    percentOff?: number;
  };

  const code = (body.code ?? "").toUpperCase().trim();
  if (!/^[A-Z0-9]{3,30}$/.test(code)) {
    return NextResponse.json(
      { error: "Koda mora vsebovati 3–30 znakov, samo A–Z in 0–9." },
      { status: 400 },
    );
  }
  const percentOff = Math.round(body.percentOff ?? 0);
  if (!Number.isFinite(percentOff) || percentOff < 1 || percentOff > 100) {
    return NextResponse.json(
      { error: "Popust mora biti med 1 in 100 %." },
      { status: 400 },
    );
  }

  const affiliate = await db.query.affiliates.findFirst({
    where: eq(affiliates.id, id),
  });
  if (!affiliate) {
    return NextResponse.json({ error: "Partner ne obstaja." }, { status: 404 });
  }

  // Code uniqueness check across the whole table (not just this affiliate).
  const existing = await db.query.discountCodes.findFirst({
    where: eq(discountCodes.code, code),
  });
  if (existing && existing.affiliateId !== id) {
    return NextResponse.json(
      { error: `Koda ${code} že obstaja in pripada drugemu uporabniku.` },
      { status: 409 },
    );
  }

  // Deactivate any older codes the affiliate previously had — we keep
  // them in the table for historical reporting but only one is active
  // at a time.
  await db.update(discountCodes).set({ isActive: false }).where(
    and(
      eq(discountCodes.affiliateId, id),
      ne(discountCodes.code, code),
    ),
  );

  let row: typeof discountCodes.$inferSelect | undefined;
  if (existing) {
    [row] = await db.update(discountCodes).set({
      percentOff,
      isActive: true,
      affiliateId: id,
    }).where(eq(discountCodes.id, existing.id)).returning();
  } else {
    [row] = await db.insert(discountCodes).values({
      code,
      percentOff,
      isActive: true,
      affiliateId: id,
      // Affiliate codes don't expire and don't have usage caps by default;
      // an admin can still cap them via the /admin/discounts page later.
      maxUses: null,
      expiresAt: null,
    }).returning();
  }

  // Notify the affiliate with full details + share template.
  await sendAffiliatePromoCodeEmail({
    to: affiliate.email,
    name: affiliate.name,
    locale: affiliate.preferredLocale,
    code,
    percentOff,
  }).catch((err) => console.error("[promo code email] failed:", err));

  return NextResponse.json({ promo: row });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    isActive?: boolean;
  };

  // Always operate on the affiliate's most recent code (the one shown
  // in the admin UI). Without `orderBy desc(createdAt)` the toggle could
  // resurrect a historical deactivated code instead of touching the live one.
  const current = await db.query.discountCodes.findFirst({
    where: eq(discountCodes.affiliateId, id),
    orderBy: desc(discountCodes.createdAt),
  });
  if (!current) return NextResponse.json({ error: "Ni promo kode." }, { status: 404 });

  const [row] = await db.update(discountCodes).set({
    ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
  }).where(eq(discountCodes.id, current.id)).returning();

  return NextResponse.json({ promo: row });
}
