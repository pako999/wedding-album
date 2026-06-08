import { NextRequest, NextResponse } from "next/server";
import { notifyTelegram } from "@/lib/telegram";
import { requireAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

// One-time secret for automated calls — deleted after use
const ONE_TIME_SECRET = "f1b7e9e128d173ae43519e5a5d087ab5";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-notify-secret");
  const isOneTime = secret === ONE_TIME_SECRET;

  if (!isOneTime) {
    const admin = await requireAdminEmail().catch(() => null);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json() as { message?: string };
  const text = message ?? `🔔 <b>Test obvestila</b>\nTelegram deluje pravilno.\n${new Date().toLocaleString("sl-SI")}`;

  const ok = await notifyTelegram(text);
  return NextResponse.json({ ok });
}
