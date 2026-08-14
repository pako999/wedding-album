"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { setStandOrderStatus } from "@/lib/stand-orders";
import type { StandOrder } from "@/lib/db/schema";

export async function updateStandOrderStatus(id: string, status: StandOrder["status"]) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Unauthorized");

  await setStandOrderStatus(id, status);
  revalidatePath("/admin/orders");
}
