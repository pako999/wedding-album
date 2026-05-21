import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Stripe ni konfiguriran" }, { status: 503 });

  const { id } = await params;
  const res = await fetch(`https://api.stripe.com/v1/promotion_codes/${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ active: "false" }).toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err.slice(0, 200) }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
