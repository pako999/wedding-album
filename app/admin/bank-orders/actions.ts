"use server";

import { db } from "@/lib/db";
import { bankOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";
import { weddingOffer } from '@/lib/wedding-offer';
import { BUSINESS_PRICE_EUR, PREMIUM_REGULAR_PRICE_EUR } from "@/lib/plan-pricing";

const PLAN_LABELS: Record<string, { name: string; price: number }> = {
  basic:   { name: "Basic",   price: 39 },
  plus:    { name: "Plus",    price: 49 },
  premium: { name: "Poročni premium", price: PREMIUM_REGULAR_PRICE_EUR },
  business: { name: "Poslovni", price: BUSINESS_PRICE_EUR },
};

export async function addManualOrder(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Unauthorized");

  const planId = formData.get("planId") as string;
  const plan = PLAN_LABELS[planId];
  if (!plan) throw new Error("Neznan paket");

  await db.insert(bankOrders).values({
    albumSlug:          (formData.get("albumSlug") as string).trim(),
    email:              (formData.get("email") as string).trim(),
    planId,
    planName:           plan.name,
    planPrice:          plan.price,
    billingName:        (formData.get("billingName") as string)?.trim() || null,
    billingCompanyName: (formData.get("billingCompanyName") as string)?.trim() || null,
    billingEmail:       (formData.get("billingEmail") as string)?.trim() || null,
    billingAddress:     (formData.get("billingAddress") as string)?.trim() || null,
    billingCity:        (formData.get("billingCity") as string)?.trim() || null,
    billingTaxId:       (formData.get("billingTaxId") as string)?.trim() || null,
    status:             "pending",
  });

  revalidatePath("/admin/bank-orders");
}

export async function updateOrderStatus(id: string, status: "pending" | "paid" | "cancelled") {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Unauthorized");

  const order = await db.query.bankOrders.findFirst({ where: eq(bankOrders.id, id) });
  if (!order) throw new Error("Naročilo ne obstaja");
  if (status === "paid" && order.status !== "paid") {
    const applied = await applyPlanToAlbum(order.albumSlug, order.planId, `bank:${order.id}`);
    if (!applied) throw new Error("Paket ni bil aktiviran; preverite album in naročilo");
  }
  await db.update(bankOrders).set({ status }).where(eq(bankOrders.id, id));
  if (status === 'paid' || order.status === 'paid') await weddingOffer.settleBank(id, true);
  else if (status === 'cancelled') await weddingOffer.settleBank(id, false);
  revalidatePath("/admin/bank-orders");
}
