"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type AdminPlan = "free" | "basic" | "plus" | "premium" | "influencer" | "sponsor";

const PLANS: { key: AdminPlan; label: string }[] = [
  { key: "free",       label: "Free" },
  { key: "basic",      label: "Basic" },
  { key: "plus",       label: "Plus" },
  { key: "premium",    label: "Premium" },
  { key: "influencer", label: "🎤 Influencer" },
  { key: "sponsor",    label: "🤝 Sponsor" },
];

export function UserUpgradeMenu({ clerkId, albumCount }: { clerkId: string; albumCount: number }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (albumCount === 0) {
    return <span className="text-[10px] text-gray-300">brez galerij</span>;
  }

  const apply = (plan: AdminPlan) => {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${clerkId}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(json.error ?? "Napaka");
        return;
      }
      setMsg(`✓ ${json.updated}`);
      router.refresh();
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      <select
        defaultValue=""
        disabled={busy}
        onChange={(e) => { const v = e.target.value as AdminPlan | ""; if (v) apply(v); e.currentTarget.value = ""; }}
        className="text-xs font-semibold px-2 py-1 rounded border border-gray-200 bg-white disabled:opacity-50"
      >
        <option value="" disabled>Nadgradi …</option>
        {PLANS.map((p) => (
          <option key={p.key} value={p.key}>{p.label}</option>
        ))}
      </select>
      {msg && <span className="text-[10px] text-gray-500">{msg}</span>}
    </div>
  );
}
