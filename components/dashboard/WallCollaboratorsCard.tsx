"use client";

import { useEffect, useState } from "react";

/**
 * Wall collaborators — invite a DJ / venue tech / co-organiser to manage
 * ONLY the Photo Wall (settings + sponsor slides) at
 * /dashboard/<slug>/wall. Scoped on purpose: no photos, no album
 * settings, no billing.
 */

interface Collaborator { id: string; email: string }

interface Props {
  albumSlug: string;
  ownerEmail: string | null;
}

export function WallCollaboratorsCard({ albumSlug, ownerEmail }: Props) {
  const [rows, setRows] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/albums/${albumSlug}/collaborators`)
      .then((r) => r.json())
      .then((d: { collaborators?: Collaborator[] }) => setRows(d.collaborators ?? []))
      .catch(() => {});
  }, [albumSlug]);

  async function invite() {
    const v = email.trim().toLowerCase();
    if (!v) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/albums/${albumSlug}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error === "invalid_email" ? "Neveljaven e-poštni naslov." : "Dodajanje ni uspelo."); return; }
      setRows(d.collaborators ?? []);
      setEmail("");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    setRows((r) => r.filter((x) => x.id !== id));
    await fetch(`/api/albums/${albumSlug}/collaborators?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  }

  const wallAdminUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard/${albumSlug}/wall` : `/dashboard/${albumSlug}/wall`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-bold text-gray-900 mb-1">👥 Sodelavci foto stene</h3>
      <p className="text-xs text-gray-500 mb-4">
        Povabite osebe (DJ, tehnik na lokaciji …), ki lahko urejajo <strong>samo foto steno</strong> —
        njene nastavitve in sponzorske slike. Do fotografij, nastavitev albuma in plačil nimajo dostopa.
      </p>

      <div className="flex gap-2 mb-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void invite(); }}
          placeholder="ime@email.com"
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#F4B400]"
        />
        <button
          type="button"
          onClick={() => void invite()}
          disabled={busy || !email.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#111111] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#FFCC3D,#F4B400 60%,#D69E00)" }}
        >
          Povabi
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <p className="text-[11px] text-gray-400 mb-4">
        Sodelavec se prijavi s tem e-poštnim naslovom (potrjenim) in odpre povezavo spodaj.
      </p>

      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 mb-4">
        <div className="flex items-center justify-between px-4 py-2.5 text-sm">
          <span className="text-gray-800">{ownerEmail ?? "—"}</span>
          <span className="text-xs font-semibold text-gray-400">Lastnik</span>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-800 break-all">{r.email}</span>
            <span className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#8F6900]">Foto stena</span>
              <button type="button" onClick={() => void remove(r.id)} className="text-xs text-gray-400 hover:text-red-600">
                Odstrani
              </button>
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-3 text-xs text-gray-400">Še ni povabljenih sodelavcev.</p>
        )}
      </div>

      <button
        type="button"
        onClick={async () => {
          try { await navigator.clipboard.writeText(wallAdminUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* shown below anyway */ }
        }}
        className="w-full text-left rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-xs text-gray-500 hover:border-gray-400"
      >
        {copied ? "Kopirano ✓" : <>Povezava za sodelavce: <code className="text-gray-700">{`/dashboard/${albumSlug}/wall`}</code> — klikni za kopiranje</>}
      </button>
    </div>
  );
}
