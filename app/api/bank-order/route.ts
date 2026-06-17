import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, bankOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendBankOrderConfirmation } from "@/lib/email/notifications";
import { notifyTelegram, htmlEscape } from "@/lib/telegram";

export const runtime = "nodejs";

const PLAN_LABELS: Record<string, { name: string; price: number }> = {
  basic:   { name: "Basic",   price: 39 },
  plus:    { name: "Plus",    price: 49 },
  premium: { name: "Premium", price: 79 },
};

interface BillingDetails {
  name: string;
  companyName?: string;
  email?: string;
  address: string;
  city: string;
  taxId?: string;
}

export async function POST(req: NextRequest) {
  const { planId, albumSlug, billing } = await req.json() as {
    planId: string;
    albumSlug: string;
    billing?: BillingDetails;
  };

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
      { error: "Ni e-poštnega naslova za ta album. Pišite nam na info@guestcam.si" },
      { status: 400 },
    );
  }

  const plan = PLAN_LABELS[planId] ?? { name: planId, price: 0 };

  // Persist the order so admin can see it and issue an invoice
  await db.insert(bankOrders).values({
    albumSlug,
    email,
    planId,
    planName: plan.name,
    planPrice: plan.price,
    billingName: billing?.name ?? null,
    billingCompanyName: billing?.companyName ?? null,
    billingEmail: billing?.email ?? null,
    billingAddress: billing?.address ?? null,
    billingCity: billing?.city ?? null,
    billingTaxId: billing?.taxId ?? null,
  }).catch((err) => console.error("[bank-order] DB insert failed:", err));

  await sendBankOrderConfirmation({
    to: email,
    coupleName: album.coupleName,
    planName: plan.name,
    planPrice: plan.price,
    albumSlug,
    billing,
  });

  // Telegram notification — all billing details included for invoice creation
  const billingLines = billing
    ? `\n👤 <b>Podatki za predračun:</b>\nIme: ${htmlEscape(billing.name)}${billing.companyName ? `\nPodjetje: ${htmlEscape(billing.companyName)}` : ""}${billing.email ? `\nEmail za račun: ${htmlEscape(billing.email)}` : ""}\nNaslov: ${htmlEscape(billing.address)}\nKraj: ${htmlEscape(billing.city)}${billing.taxId ? `\nDavčna: ${htmlEscape(billing.taxId)}` : ""}`
    : "";

  const sent = await notifyTelegram(
    `🏦 <b>Novo naročilo po predračunu</b>\n` +
    `Album: <code>${htmlEscape(albumSlug)}</code>\n` +
    `Paket: ${htmlEscape(plan.name)} — ${plan.price}€\n` +
    `Email: ${htmlEscape(email)}` +
    billingLines +
    `\nDatum: ${new Date().toLocaleString("sl-SI")}`,
  );

  if (!sent) {
    console.error("[bank-order] Telegram notification failed for", albumSlug);
  }

  return NextResponse.json({ success: true });
}
