import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendBankOrderConfirmation } from "@/lib/email/notifications";

export const runtime = "nodejs";

const PLAN_LABELS: Record<string, { name: string; price: number }> = {
  basic:   { name: "Basic",   price: 39 },
  plus:    { name: "Plus",    price: 49 },
  premium: { name: "Premium", price: 79 },
};

export async function POST(req: NextRequest) {
  const { planId, albumSlug } = await req.json() as { planId: string; albumSlug: string };

  if (!planId || !albumSlug) {
    return NextResponse.json({ error: "planId and albumSlug required" }, { status: 400 });
  }

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, albumSlug) })
    .catch(() => null);

  if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });

  // Resolve email: album notifyEmail → album ownerEmail → Clerk current user
  let email = album.notifyEmail ?? album.ownerEmail ?? null;
  if (!email) {
    try {
      const user = await currentUser();
      email = user?.emailAddresses?.[0]?.emailAddress ?? null;
    } catch { /* Clerk unavailable */ }
  }

  if (!email) {
    return NextResponse.json(
      { error: "Ni e-poštnega naslova za ta album. Pišite nam na hello@guestcam.si" },
      { status: 400 },
    );
  }

  const plan = PLAN_LABELS[planId] ?? { name: planId, price: 0 };

  await sendBankOrderConfirmation({
    to: email,
    coupleName: album.coupleName,
    planName: plan.name,
    planPrice: plan.price,
    albumSlug,
  });

  // Internal Telegram notification
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🏦 <b>Novo naročilo po predračunu</b>\nAlbum: <code>${albumSlug}</code>\nPaket: ${plan.name} — ${plan.price}€\nEmail: ${email}\nDatum: ${new Date().toLocaleString("sl-SI")}`,
        parse_mode: "HTML",
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
