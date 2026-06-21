"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DiscountToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/discounts/${id}/disable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded transition-opacity ${
        isActive
          ? "bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-700"
          : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700"
      } disabled:opacity-50`}
    >
      {loading ? "…" : isActive ? "Aktivna" : "Izklopljena"}
    </button>
  );
}
