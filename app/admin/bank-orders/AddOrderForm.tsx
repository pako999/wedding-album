"use client";

import { useState } from "react";
import { addManualOrder } from "./actions";

export function AddOrderForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await addManualOrder(fd);
    setSaving(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-[#0F1729] text-white text-sm font-semibold rounded-lg hover:bg-[#1a2540] transition-colors"
      >
        + Dodaj ročno
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-semibold text-[#0F1729]">Ročni vnos naročila</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Slug galerije *</label>
          <input name="albumSlug" required placeholder="ana-jt2k"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email stranke *</label>
          <input name="email" type="email" required placeholder="stranka@email.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Paket *</label>
          <select name="planId" required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]">
            <option value="basic">Basic — 39€</option>
            <option value="plus">Plus — 49€</option>
            <option value="premium">Premium — 79€</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ime / naziv podjetja</label>
          <input name="billingName" placeholder="Ana Novak"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ulica in hišna številka</label>
          <input name="billingAddress" placeholder="Dunajska cesta 1"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Poštna številka in kraj</label>
          <input name="billingCity" placeholder="1000 Ljubljana"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Davčna številka</label>
          <input name="billingTaxId" placeholder="SI12345678"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>
        <div className="col-span-2 flex gap-2 justify-end pt-1">
          <button type="button" onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            Prekliči
          </button>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-[#C9820A] text-white text-sm font-semibold rounded-lg hover:bg-[#b57008] disabled:opacity-50 transition-colors">
            {saving ? "Shranjujem…" : "Shrani"}
          </button>
        </div>
      </form>
    </div>
  );
}
