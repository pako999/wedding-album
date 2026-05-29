import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { archiveDiscount, paddleConfigured, PaddleError } from "@/lib/paddle";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!paddleConfigured()) {
    return NextResponse.json({ error: "Paddle ni konfiguriran" }, { status: 503 });
  }

  const { id } = await params;
  try {
    await archiveDiscount(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof PaddleError ? err.message : err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 502 });
  }
}
