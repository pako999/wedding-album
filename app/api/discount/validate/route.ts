import { auth } from '@clerk/nextjs/server';
import { weddingOffer } from '@/lib/wedding-offer';
import { NextRequest, NextResponse } from "next/server";
import { validateDiscount } from "@/lib/discount";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Rate limit stops brute-force enumeration of promo codes.
  // 10 attempts per minute is well above a legitimate typo-and-retry.
  const rl = await checkRateLimit("discount-validate", 10, 60_000);
  if (!rl.ok) return rl.response;

  const { code, planId } = await req.json() as { code?: string; planId?: string };
  if (!code || !planId) {
    return NextResponse.json({ valid: false, error: "Manjkajoči parametri." }, { status: 400 });
  }
  let premiumBase: number | undefined;
  if (planId === 'premium') { const session = await auth().catch(() => ({ userId: null })); premiumBase = (await weddingOffer.quote(session.userId || '')).priceCents; }
  const result = await validateDiscount(code, planId, premiumBase);
  return NextResponse.json(result);
}
