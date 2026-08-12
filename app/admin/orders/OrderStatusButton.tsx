"use client";

import { useState, useTransition } from "react";
import { updateStandOrderStatus } from "./actions";
import type { StandOrder } from "@/lib/db/schema";

type Status = StandOrder["status"];

/**
 * Advances a parcel through the fulfilment states, one step at a time.
 * Deliberately a single "next step" button rather than a dropdown of all
 * states: the flow is linear, and a dropdown invites setting "shipped"
 * on something that was never printed.
 */
const NEXT: Partial<Record<Status, { label: string; status: Status }>> = {
  pending:  { label: "Označi plačano",  status: "paid" },
  paid:     { label: "Dal v tisk",      status: "printing" },
  printing: { label: "Označi poslano",  status: "shipped" },
};

export function OrderStatusButton({ id, status }: { id: string; status: Status }) {
  const next = NEXT[status];
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  if (!next) {
    return <span className="text-xs text-gray-400">Zaključeno</span>;
  }
  return (
    <button
      type="button"
      disabled={pending || done}
      onClick={() => start(async () => {
        await updateStandOrderStatus(id, next.status);
        setDone(true);
      })}
      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0F1729] disabled:opacity-50"
      style={{ background: "linear-gradient(135deg,#FFD966,#FFC94D 60%,#F0B429)" }}
    >
      {pending ? "…" : next.label}
    </button>
  );
}
