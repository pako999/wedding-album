import { NextRequest, NextResponse } from "next/server";
import {
  addOnTotalCents, quoteShipping, standsPriceCents,
  DEFAULT_STAND_QTY, DEFAULT_STAND_VARIANT, type StandVariant,
} from "@/lib/print-service";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, bankOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendBankOrderConfirmation, sendAdminBankOrderEmail } from "@/lib/email/notifications";
import { notifyTelegram, htmlEscape } from "@/lib/telegram";
import { validateDiscount, incrementDiscountUsage } from "@/lib/discount";
import { recordStandOrder } from "@/lib/stand-orders";
import { checkAlbumOwnership } from "@/lib/album-ownership";

export const runtime = "nodejs";

const PLAN_LABELS = {
  basic:   { name: "Basic",   price: 39 },
  plus:    { name: "Plus",    price: 49 },
  premium: { name: "Premium", price: 99 },
} as const;

type BankPlanId = keyof typeof PLAN_LABELS;
const isBankPlanId = (value: unknown): value is BankPlanId =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(PLAN_LABELS, value);

interface BillingDetails {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  postalCode?: string;
  address: string;
  city: string;
  taxId?: string;
  country?: string;
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    tableStands?: boolean;
    standsQty?: number;
    standsVariant?: StandVariant;
    planId?: unknown;
    albumSlug?: unknown;
    billing?: BillingDetails;
    discountCode?: string;
  } | null;

  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const albumSlug = cleanText(body.albumSlug, 120);
  if (!isBankPlanId(body.planId) || !albumSlug) {
    return NextResponse.json({ error: "Invalid planId or albumSlug" }, { status: 400 });
  }
  const planId = body.planId;
  const billing = body.billing;
  const discountCode = cleanText(body.discountCode, 64) || undefined;
  const tableStands = body.tableStands === true;
  const standsQty = body.standsQty;
  const standsVariant = body.standsVariant;

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, albumSlug) })
    .catch(() => null);
  if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });

  // Bank-transfer orders are an owner/admin action. A public album slug must
  // never be enough to create an invoice order, send emails or consume a code.
  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return NextResponse.json({ error: owner.error }, { status: owner.status });
  }

  if (billing) {
    billing.name = cleanText(billing.name, 120);
    billing.companyName = cleanText(billing.companyName, 160) || undefined;
    billing.email = cleanText(billing.email, 160) || undefined;
    billing.phone = cleanText(billing.phone, 40) || undefined;
    billing.postalCode = cleanText(billing.postalCode, 24) || undefined;
    billing.address = cleanText(billing.address, 200);
    billing.city = cleanText(billing.city, 120);
    billing.taxId = cleanText(billing.taxId, 60) || undefined;
    billing.country = cleanText(billing.country, 2).toUpperCase() || undefined;
    if (!billing.name || !billing.address || !billing.city) {
      return NextResponse.json({ error: "Invalid billing details" }, { status: 400 });
    }
  }

  // Validate physical shipping BEFORE creating any order/email side effects.
  const standsCents = addOnTotalCents(tableStands, billing?.country, standsQty, standsVariant);
  if (standsCents === null) {
    return NextResponse.json({ error: "shipping_unavailable" }, { status: 400 });
  }
  const standsQuote = tableStands ? quoteShipping(billing?.country) : null;
  const standsQ = standsQty ?? DEFAULT_STAND_QTY;
  const standsV = standsVariant ?? DEFAULT_STAND_VARIANT;

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

  const planBase = PLAN_LABELS[planId];
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
  });

  await sendBankOrderConfirmation({
    to: email,
    coupleName: album.coupleName,
    planName: plan.name,
    planPrice: plan.price,
    albumSlug,
    billing,
  });

  const standsLines = tableStands && standsQuote
    ? `\n📦 <b>Podstavki za mize:</b> ${standsQ}× ${standsV === "gold" ? "zlati" : "leseni"} — ${((standsPriceCents(standsQ, standsV) ?? 0) / 100).toFixed(2)} € + poštnina ${(standsQuote.cents / 100).toFixed(2)} € (${htmlEscape(standsQuote.carrier)})\nDržava dostave: ${htmlEscape((billing?.country ?? "").toUpperCase())}${standsQuote.customs ? "\n⚠️ Izven EU — potrebna carinska (komercialna) faktura" : ""}`
    : "";

  if (tableStands && standsQuote) {
    const clean = (v?: string) => (v?.trim() ? v.trim() : null);
    const goods = standsPriceCents(standsQ, standsV) ?? 0;
    await recordStandOrder({
      albumSlug,
      source: "invoice",
      orderRef: null,
      planId,
      planName: plan.name,
      planCents: plan.price * 100,
      variant: standsV,
      qty: standsQ,
      standsCents: goods,
      shipCents: standsQuote.cents,
      shipCarrier: standsQuote.carrier,
      shipCountry: (billing?.country ?? "").toUpperCase() || null,
      shipCustoms: standsQuote.customs,
      totalCents: plan.price * 100 + goods + standsQuote.cents,
      recipientName:  clean(billing?.name),
      recipientPhone: clean(billing?.phone),
      recipientEmail: clean(billing?.email) ?? email,
      address:        clean(billing?.address),
      postalCode:     clean(billing?.postalCode),
      city:           clean(billing?.city),
      companyName:    clean(billing?.companyName),
      taxId:          clean(billing?.taxId),
    });
  }

  const billingLines = billing
    ? `\n👤 <b>Podatki za predračun:</b>\nIme: ${htmlEscape(billing.name)}${billing.companyName ? `\nPodjetje: ${htmlEscape(billing.companyName)}` : ""}${billing.email ? `\nEmail za račun: ${htmlEscape(billing.email)}` : ""}\nNaslov: ${htmlEscape(billing.address)}\nKraj: ${htmlEscape(billing.city)}${billing.taxId ? `\nDavčna: ${htmlEscape(billing.taxId)}` : ""}`
    : "";

  if (discountCodeId) {
    await incrementDiscountUsage(discountCodeId).catch(() => {});
  }

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

  if (!sent) console.error("[bank-order] Telegram notification failed for", albumSlug);
  return NextResponse.json({ success: true });
}
