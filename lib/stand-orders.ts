import { db } from "@/lib/db";
import { standOrders, type NewStandOrder, type StandOrder } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

/**
 * Access layer for the printed-stand fulfilment record.
 *
 * Every function here swallows its errors. `stand_orders` is a new table,
 * and a deploy can reach production before its migration has run on every
 * database — if that made the checkout route throw, a missing fulfilment
 * row would take down the payment itself. Losing the parcel record is
 * recoverable (the Mollie metadata and the Telegram message still carry
 * the details); losing the sale is not.
 *
 * Reads return an empty list for the same reason: the admin Orders page
 * should say "nothing here" rather than 500 while a migration catches up.
 */

/** Records the physical side of an order. Returns false if it didn't stick,
 *  so callers can log without treating it as fatal. */
export async function recordStandOrder(row: NewStandOrder): Promise<boolean> {
  try {
    await db.insert(standOrders).values(row);
    return true;
  } catch (err) {
    // Loud on purpose: a dropped row means a customer paid for stands that
    // nobody is going to post unless someone reads the Telegram message.
    console.error("[stand-orders] failed to record order — parcel owed but not logged:", err);
    return false;
  }
}

export async function listStandOrders(limit = 200): Promise<StandOrder[]> {
  try {
    return await db.select().from(standOrders).orderBy(desc(standOrders.createdAt)).limit(limit);
  } catch (err) {
    console.warn("[stand-orders] list failed (table missing?):", err);
    return [];
  }
}

export async function setStandOrderStatus(
  id: string,
  status: StandOrder["status"],
): Promise<boolean> {
  try {
    await db.update(standOrders).set({ status }).where(eq(standOrders.id, id));
    return true;
  } catch (err) {
    console.error("[stand-orders] status update failed:", err);
    return false;
  }
}

/**
 * Flips the fulfilment row to paid once the payment clears. Keyed by the
 * Mollie payment id we stored as orderRef, so the webhook doesn't need to
 * know the row id.
 */
export async function markStandOrderPaid(orderRef: string): Promise<boolean> {
  try {
    await db.update(standOrders).set({ status: "paid" }).where(eq(standOrders.orderRef, orderRef));
    return true;
  } catch (err) {
    console.error("[stand-orders] mark paid failed:", err);
    return false;
  }
}
