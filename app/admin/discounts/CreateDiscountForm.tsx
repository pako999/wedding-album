"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateDiscountForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: "", percentOff: "", maxUses: "", expiresAt: "" });
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          percentOff: Number(form.percentOff),
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Napaka");
      setForm({ code: "", percentOff: "", maxUses: "", expiresAt: "" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Napaka");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-[#FFC94D] text-[#0F1729] font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        + Nova koda
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 w-80">
      <p className="font-semibold text-sm text-[#0F1729]">Nova koda za popust</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="space-y-2">
        <input
          required
          placeholder="Koda (npr. POROKA20)"
          value={form.code}
          onChange={set("code")}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#FFC94D] uppercase tracking-wider"
          style={{ borderColor: "#e5e7eb" }}
        />
        <input
          required
          type="number"
          min={1}
          max={100}
          placeholder="Popust v % (npr. 20)"
          value={form.percentOff}
          onChange={set("percentOff")}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#FFC94D]"
          style={{ borderColor: "#e5e7eb" }}
        />
        <input
          type="number"
          min={1}
          placeholder="Maks. uporab (prazno = neomejeno)"
          value={form.maxUses}
          onChange={set("maxUses")}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#FFC94D]"
          style={{ borderColor: "#e5e7eb" }}
        />
        <input
          type="date"
          placeholder="Velja do (prazno = brez roka)"
          value={form.expiresAt}
          onChange={set("expiresAt")}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#FFC94D]"
          style={{ borderColor: "#e5e7eb" }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 rounded-lg bg-[#FFC94D] text-[#0F1729] font-semibold text-sm disabled:opacity-60"
        >
          {loading ? "Ustvarjam…" : "Ustvari"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
        >
          Prekliči
        </button>
      </div>
    </form>
  );
}
