import { NextRequest, NextResponse } from "next/server";
import { validateDiscount } from "@/lib/discount";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { code, planId } = await req.json() as { code?: string; planId?: string };
  if (!code || !planId) {
    return NextResponse.json({ valid: false, error: "Manjkajoči parametri." }, { status: 400 });
  }
  const result = await validateDiscount(code, planId);
  return NextResponse.json(result);
}
