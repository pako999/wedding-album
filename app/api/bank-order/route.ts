import { NextRequest, NextResponse } from "next/server";
import { addOnTotalCents, quoteShipping, standsPriceCents, DEFAULT_STAND_QTY } from "@/lib/print-service";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, bankOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendBankOrderConfirmation, sendAdminBankOrderEmail } from "@/lib/email/notifications";
import { notifyTelegram, htmlEscape } from "@/lib/telegram";
import { validateDiscount, incrementDiscountUsage } from "@/lib/discount";

export const runtime = "nodejs";

const PLAN_LABELS: Record<string, { name: string; price: number }> = {
  basic:   { name: "Basic",   price: 39 },
  plus:    { name: "Plus",    price: 49 },
  premium: { name: "Premium", price: 99 },
};

interface BillingDetails {
  name: string;
  companyName?: string;
  email?: string;
  address: string;
  city: string;
  taxId?: string;
  /** ISO-3166 alpha-2 — drives the shipping rate for printed stands. */
  country?: string;
}

export async function POST(req: NextRequest) {
  const { planId, albumSlug, billing, discountCode, tableStands, standsQty } = await req.json() as {
    tableStands?: boolean;
    standsQty?: number;
    planId: string;
    albumSlug: string;
    billing?: BillingDetails;
    discountCode?: string;
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

  const planBase = PLAN_LABELS[planId] ?? { name: planId, price: 0 };
  let finalPrice = planBase.price;
  let discountCodeId: string | undefined;
  let discountPercent: number | undefined;

  if (discountCode) {
    const disc = await validateDiscount(discountCode, planId);
    if (disc.valid) {
      finalPrice = disc.finalPrice;
      discountCodeId = disc.discountCodeId;
      discountPercent = disc.percentOff;
    }
  }

  const plan = { name: planBase.name, price: finalPrice };

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
  // Physical add-on. Priced server-side exactly as on the card path, so
  // an invoice order can't be talked into free shipping. An unshippable
  // country is rejected rather than quietly invoiced without postage.
  const standsCents = addOnTotalCents(!!tableStands, billing?.country, standsQty);
  if (standsCents === null) {
    return NextResponse.json({ error: "shipping_unavailable" }, { status: 400 });
  }
  const standsQuote = tableStands ? quoteShipping(billing?.country) : null;
  const standsQ = standsQty ?? DEFAULT_STAND_QTY;
  // Whoever raises the proforma has to know a parcel is owed — without
  // this the customer pays and nothing ever ships.
  const standsLines = tableStands && standsQuote
    ? `\n📦 <b>Podstavki za mize:</b> ${standsQ}× — ${((standsPriceCents(standsQ) ?? 0) / 100).toFixed(2)} € + poštnina ${(standsQuote.cents / 100).toFixed(2)} € (${htmlEscape(standsQuote.carrier)})\nDržava dostave: ${htmlEscape((billing?.country ?? "").toUpperCase())}${standsQuote.customs ? "\n⚠️ Izven EU — potrebna carinska (komercialna) faktura" : ""}`
    : "";

  const billingLines = billing
    ? `\n👤 <b>Podatki za predračun:</b>\nIme: ${htmlEscape(billing.name)}${billing.companyName ? `\nPodjetje: ${htmlEscape(billing.companyName)}` : ""}${billing.email ? `\nEmail za račun: ${htmlEscape(billing.email)}` : ""}\nNaslov: ${htmlEscape(billing.address)}\nKraj: ${htmlEscape(billing.city)}${billing.taxId ? `\nDavčna: ${htmlEscape(billing.taxId)}` : ""}`
    : "";

  // Increment discount usage immediately (invoice is committed)
  if (discountCodeId) {
    await incrementDiscountUsage(discountCodeId).catch(() => {});
  }

  // Admin email — contains all billing details needed to issue an invoice
  await sendAdminBankOrderEmail({
    albumSlug,
    planName: plan.name,
    planPrice: plan.price,
    customerEmail: email,
    billing,
  });

  const discountLine = discountPercent
    ? `\nPopust: ${discountPercent}% (koda: ${htmlEscape(discountCode ?? "")})`
    : "";

  const sent = await notifyTelegram(
    `🏦 <b>Novo naročilo po predračunu</b>\n` +
    `Album: <code>${htmlEscape(albumSlug)}</code>\n` +
    `Paket: ${htmlEscape(plan.name)} — ${plan.price}€` +
    discountLine +
    `\nEmail: ${htmlEscape(email)}` +
    billingLines +
    standsLines +
    `\nDatum: ${new Date().toLocaleString("sl-SI")}`,
  );

  if (!sent) {
    console.error("[bank-order] Telegram notification failed for", albumSlug);
  }

  return NextResponse.json({ success: true });
}
