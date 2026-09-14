import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { localCoupons } from "@/lib/db/local-rewards-schema";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const normalized = decodeURIComponent(code).trim().toUpperCase();
  if (!/^GC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)) {
    return new Response("Invalid coupon", { status: 400 });
  }

  try {
    const [coupon] = await db
      .select({ id: localCoupons.id })
      .from(localCoupons)
      .where(eq(localCoupons.code, normalized))
      .limit(1);
    if (!coupon) return new Response("Coupon not found", { status: 404 });

    const redeemUrl = `${req.nextUrl.origin}/dashboard/local/redeem/${encodeURIComponent(normalized)}`;
    const svg = await QRCode.toString(redeemUrl, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: { dark: "#14181F", light: "#FFFFFF" },
    });

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "private, max-age=300",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return new Response("Local Rewards not ready", { status: 503 });
  }
}
