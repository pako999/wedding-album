"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AddLocalQrSource({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/local/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, label, tableNumber }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "QR ni bilo mogoče ustvariti.");
      setLabel("");
      setTableNumber("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "QR ni bilo mogoče ustvariti.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-xl bg-[color:var(--ink)] px-3.5 py-2.5 text-xs font-semibold text-[color:var(--paper)]"
      >
        + Dodaj QR
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-[color:var(--hairline)] bg-[color:var(--paper)] p-4">
      <div className="grid sm:grid-cols-[1fr_.6fr] gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold">Oznaka</span>
          <input
            autoFocus
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Terasa · Miza 4"
            className="w-full min-w-0 rounded-xl border border-[color:var(--hairline)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--honey)]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold">Miza / št.</span>
          <input
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="4"
            className="w-full min-w-0 rounded-xl border border-[color:var(--hairline)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--honey)]"
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          disabled={saving}
          className="rounded-lg bg-[color:var(--honey)] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Ustvarjam…" : "Ustvari QR"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(""); }}
          className="rounded-lg border border-[color:var(--hairline)] bg-white px-4 py-2.5 text-xs font-semibold"
        >
          Prekliči
        </button>
      </div>
    </form>
  );
}
