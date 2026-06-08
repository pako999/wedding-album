"use server";

import { db } from "@/lib/db";
import { bankOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const PLAN_LABELS: Record<string, { name: string; price: number }> = {
  basic:   { name: "Basic",   price: 39 },
  plus:    { name: "Plus",    price: 49 },
  premium: { name: "Premium", price: 79 },
};

export async function addManualOrder(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Unauthorized");

  const planId = formData.get("planId") as string;
  const plan = PLAN_LABELS[planId] ?? { name: planId, price: 0 };

  await db.insert(bankOrders).values({
    albumSlug:      (formData.get("albumSlug") as string).trim(),
    email:          (formData.get("email") as string).trim(),
    planId,
    planName:       plan.name,
    planPrice:      plan.price,
    billingName:    (formData.get("billingName") as string)?.trim() || null,
    billingAddress: (formData.get("billingAddress") as string)?.trim() || null,
    billingCity:    (formData.get("billingCity") as string)?.trim() || null,
    billingTaxId:   (formData.get("billingTaxId") as string)?.trim() || null,
    status:         "pending",
  });

  revalidatePath("/admin/bank-orders");
}

export async function updateOrderStatus(id: string, status: "pending" | "paid" | "cancelled") {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Unauthorized");

  await db.update(bankOrders).set({ status }).where(eq(bankOrders.id, id));
  revalidatePath("/admin/bank-orders");
}
