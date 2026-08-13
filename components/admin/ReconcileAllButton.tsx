"use client";

import { useState, useTransition } from "react";

interface Result {
  examined: number;
  fixedCount: number;
  fixed: Array<{ slug: string; email: string | null; plan: string }>;
  skipped: Array<{ slug: string; reason: string }>;
  errors: number;
}

/**
 * Admin "reconcile all stuck payments" button. Finds every paid-but-free
 * album (Mollie payment id present, plan still free), re-checks Mollie,
 * and applies the plan. Idempotent — safe to click repeatedly.
 */
export function ReconcileAllButton() {
  const [busy, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Preveri vsa plačila in nadgradi galerije, ki so plačane a še vedno na FREE?",
      );
      if (!ok) return;
    }
    setResult(null);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/reconcile-all", { method: "POST" });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Napaka");
          return;
        }
        setResult(json as Result);
      } catch {
        setError("Napaka pri povezavi");
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#111111] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {busy ? "Preverjam…" : "🔄 Popravi plačane galerije"}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <div className="text-xs bg-white border border-gray-200 rounded-xl p-3 space-y-1.5">
          <p className="font-semibold text-[#111111]">
            Pregledanih {result.examined} · nadgrajenih {result.fixedCount}
            {result.errors > 0 && ` · napak ${result.errors}`}
          </p>
          {result.fixed.length > 0 && (
            <ul className="space-y-0.5">
              {result.fixed.map((f) => (
                <li key={f.slug} className="text-emerald-700">
                  ✓ {f.slug} → <strong>{f.plan.toUpperCase()}</strong>
                  {f.email ? ` (${f.email})` : ""}
                </li>
              ))}
            </ul>
          )}
          {result.fixedCount === 0 && result.examined === 0 && (
            <p className="text-gray-400">Ni zataknjenih plačil — vse je v redu.</p>
          )}
          {result.skipped.length > 0 && (
            <details className="text-gray-400">
              <summary className="cursor-pointer">Preskočenih: {result.skipped.length}</summary>
              <ul className="mt-1 space-y-0.5">
                {result.skipped.map((s) => (
                  <li key={s.slug}>· {s.slug} — {s.reason}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
