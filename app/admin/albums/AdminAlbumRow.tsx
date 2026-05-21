"use client";

import { useState, useTransition } from "react";

type Plan = "free" | "basic" | "plus" | "premium";

interface Props {
  slug: string;
  coupleName: string;
  ownerEmail: string | null;
  plan: Plan;
  filmTier: "free" | "pro" | "premium";
  maxPhotos: number;
  expiresAt: string | null;
}

const PLANS: Plan[] = ["free", "basic", "plus", "premium"];

export function AdminAlbumRow({ slug, coupleName, ownerEmail, plan, filmTier, maxPhotos, expiresAt }: Props) {
  const [currentPlan, setCurrentPlan] = useState<Plan>(plan);
  const [saving, setSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const changePlan = (newPlan: Plan) => {
    setError(null);
    setSaving(async () => {
      const res = await fetch(`/api/admin/albums/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: "Napaka" }));
        setError(msg || "Posodobitev ni uspela");
        return;
      }
      setCurrentPlan(newPlan);
    });
  };

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
      <td className="px-4 py-3">
        <a href={`/${slug}`} target="_blank" rel="noreferrer" className="font-medium text-[#0F1729] hover:text-[#C9820A]">
          {coupleName}
        </a>
        <p className="text-xs text-gray-400">{slug} · {ownerEmail ?? "—"}</p>
      </td>
      <td className="px-4 py-3">
        <select
          value={currentPlan}
          onChange={(e) => changePlan(e.target.value as Plan)}
          disabled={saving}
          className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded border border-gray-200 bg-white disabled:opacity-50"
        >
          {PLANS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {filmTier !== "free" && (
          <p className="text-[10px] text-violet-600 mt-1">🎬 Film {filmTier}</p>
        )}
        {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {maxPhotos >= 999_999 ? "∞" : maxPhotos.toLocaleString("sl-SI")}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {expiresAt ? new Date(expiresAt).toLocaleDateString("sl-SI") : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <a href={`/dashboard/${slug}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#C9820A] hover:underline">
          Odpri →
        </a>
      </td>
    </tr>
  );
}
