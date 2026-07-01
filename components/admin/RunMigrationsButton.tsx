"use client";

import { useState, useTransition } from "react";

/** Small utility button placed in the admin sidebar footer. Idempotent
 *  server call — safe to click any time. Toast shows the result. */
export function RunMigrationsButton() {
  const [busy, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/run-migrations", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      setMsg({
        ok: res.ok,
        text: res.ok
          ? "✓ Migracije zagnane"
          : (json.error ?? "Napaka").slice(0, 120),
      });
      setTimeout(() => setMsg(null), 5000);
    });
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-[#FFF9EC] hover:border-[#FFC94D] hover:text-[#0F1729] transition-colors disabled:opacity-50"
      >
        {busy ? "Zagon…" : "🔧 Popravi bazo"}
      </button>
      {msg && (
        <p className={`text-[10px] px-1 ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
