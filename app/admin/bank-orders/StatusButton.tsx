"use client";

import { updateOrderStatus } from "./actions";

const NEXT: Record<string, { label: string; status: "pending" | "paid" | "cancelled" }> = {
  pending:   { label: "Označi plačano", status: "paid" },
  paid:      { label: "Razveljavi",     status: "cancelled" },
  cancelled: { label: "Ponastavi",      status: "pending" },
};

export function StatusButton({ id, status }: { id: string; status: string }) {
  const next = NEXT[status];
  if (!next) return null;
  return (
    <button
      onClick={() => updateOrderStatus(id, next.status)}
      className="mt-1 text-[10px] font-semibold text-[#C9820A] hover:underline"
    >
      {next.label}
    </button>
  );
}
