import { NextRequest, NextResponse } from "next/server";
import { notifyTelegram } from "@/lib/telegram";
import { requireAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const admin = await requireAdminEmail().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json() as { message?: string };
  const text = message ?? `🔔 <b>Test obvestila</b>\nTelegram deluje pravilno.\n${new Date().toLocaleString("sl-SI")}`;

  const ok = await notifyTelegram(text);
  return NextResponse.json({ ok });
}
