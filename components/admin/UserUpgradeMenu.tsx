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

export function UserUpgradeMenu({
  clerkId,
  albumCount,
  pendingOverride,
}: {
  clerkId: string;
  albumCount: number;
  pendingOverride?: string | null;
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

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
      if (plan === "free") {
        setMsg("✓ preklicano");
      } else if (json.created) {
        setMsg("✓ galerija ustvarjena");
      } else if (json.updated > 0) {
        setMsg(`✓ ${json.updated} galerij posodobljenih`);
      } else {
        setMsg("✓ shranjeno");
      }
      router.refresh();
    });
  };

  return (
    <div className="inline-flex flex-col gap-1">
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
      {pendingOverride && (
        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block w-fit">
          čaka {pendingOverride}
        </span>
      )}
    </div>
  );
}
