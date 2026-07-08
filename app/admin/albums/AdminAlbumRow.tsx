"use client";

import { useState, useTransition } from "react";

type Plan = "free" | "basic" | "plus" | "premium";
type AdminPlan = Plan | "influencer" | "sponsor";

interface Props {
  slug: string;
  coupleName: string;
  ownerEmail: string | null;
  plan: Plan;
  filmTier: "free" | "pro" | "premium";
  maxPhotos: number;
  expiresAt: string | null;
  /** stripeSessionId — used to detect comp accounts ("comp:influencer" /
   *  "comp:sponsor") so the dropdown can pre-select the right pseudo-plan
   *  and a small badge shows the comp reason. */
  stripeSessionId?: string | null;
}

const PLANS: AdminPlan[] = ["free", "basic", "plus", "premium", "influencer", "sponsor"];

function initialAdminPlan(plan: Plan, sid?: string | null): AdminPlan {
  if (sid === "comp:influencer") return "influencer";
  if (sid === "comp:sponsor")    return "sponsor";
  return plan;
}

export function AdminAlbumRow({ slug, coupleName, ownerEmail, plan, filmTier, maxPhotos, expiresAt, stripeSessionId }: Props) {
  const [currentPlan, setCurrentPlan] = useState<AdminPlan>(initialAdminPlan(plan, stripeSessionId));
  const [saving, setSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const changePlan = (newPlan: AdminPlan) => {
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

  // Public gallery URL (what guests see at /<slug>). The album name and
  // a dedicated "Galerija" button both point here. Owner dashboard URL
  // (/dashboard/<slug>) is the second action.
  const galleryHref   = `/${slug}`;
  const dashboardHref = `/dashboard/${slug}`;

  const isComp = currentPlan === "influencer" || currentPlan === "sponsor";
  const compLabel = currentPlan === "influencer" ? "🎤 Influencer" : currentPlan === "sponsor" ? "🤝 Sponsor" : null;

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
      <td className="px-4 py-3">
        <a
          href={galleryHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-[#0F1729] underline decoration-[#FFC94D] decoration-2 underline-offset-4 hover:text-[#C9820A]"
        >
          {coupleName}
          <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <p className="text-xs text-gray-400">{slug}</p>
      </td>
      <td className="px-4 py-3">
        {ownerEmail ? (
          <a
            href={`mailto:${ownerEmail}`}
            className="text-xs text-gray-600 hover:text-[#C9820A] hover:underline break-all"
          >
            {ownerEmail}
          </a>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <select
          value={currentPlan}
          onChange={(e) => changePlan(e.target.value as AdminPlan)}
          disabled={saving}
          className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded border border-gray-200 bg-white disabled:opacity-50"
        >
          {PLANS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {isComp && compLabel && (
          <p className="text-[10px] text-fuchsia-600 mt-1 font-semibold">{compLabel} → Premium</p>
        )}
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
        {/* Two explicit actions — previously a single 'Odpri →' link
            that opened the dashboard (often invisible behind a popup
            blocker since target=_blank). Now both gallery and admin
            are reachable, each as a bordered button. */}
        <div className="inline-flex items-center gap-2">
          <a
            href={galleryHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-200 text-[#0F1729] bg-white hover:border-[#FFC94D] hover:bg-[#FFF9EC] transition-colors"
            title="Odpri javno galerijo (kar vidijo gostje)"
          >
            🖼️ Galerija
          </a>
          <a
            href={dashboardHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFC94D] text-[#0F1729] hover:opacity-90 transition-opacity"
            title="Odpri nadzorno ploščo galerije"
          >
            ⚙️ Admin
          </a>
        </div>
      </td>
    </tr>
  );
}
