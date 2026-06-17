import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({ error: "Discounts are managed via Mollie dashboard" }, { status: 501 });
}
