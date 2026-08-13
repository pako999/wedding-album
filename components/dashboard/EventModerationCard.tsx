"use client";

import { useState } from "react";
import type { AlbumFlags, AlbumPermission } from "@/lib/album-flags";

/**
 * Event moderation & permission controls, modelled on what event hosts
 * expect from tools like Kululu: manual approval, allowed media types,
 * what guests may do in the album, downloads and likes.
 *
 * Every toggle saves immediately through PATCH /settings — the same
 * owner-gated endpoint the rest of the settings use — and the server
 * re-validates every value, so this card is convenience, not the gate.
 */

interface Props {
  albumSlug: string;
  initialFlags: AlbumFlags;
  initialModeration: boolean;
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-40 ${on ? "bg-[#F4B400]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function EventModerationCard({ albumSlug, initialFlags, initialModeration }: Props) {
  const [flags, setFlags] = useState(initialFlags);
  const [moderation, setModeration] = useState(initialModeration);
  const [saving, setSaving] = useState(false);

  async function save(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      await fetch(`/api/albums/${albumSlug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } finally {
      setSaving(false);
    }
  }

  const setFlag = <K extends keyof AlbumFlags>(key: K, value: AlbumFlags[K]) => {
    setFlags((f) => ({ ...f, [key]: value }));
    void save({ [key]: value });
  };

  const PERMISSIONS: { id: AlbumPermission; title: string; desc: string }[] = [
    { id: "view_upload", title: "Ogled in nalaganje", desc: "Gostje nalagajo nove fotografije in vidijo obstoječe." },
    { id: "view_only",   title: "Samo ogled",         desc: "Gostje vidijo galerijo, ne morejo pa nalagati." },
    { id: "upload_only", title: "Samo nalaganje",     desc: "Gostje nalagajo, galerije drugih pa ne vidijo." },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">🛡 Moderacija in dovoljenja</h3>
        {saving && <span className="text-xs text-gray-400">Shranjujem…</span>}
      </div>
      <p className="text-xs text-gray-500 mb-2">Nadzor nad tem, kaj gostje lahko naložijo in počnejo v albumu.</p>

      <Row title="Ročno potrjevanje fotografij" desc="Fotografije gostov se prikažejo šele, ko jih odobrite — v albumu in na foto steni.">
        <Toggle on={moderation} onChange={(v) => { setModeration(v); void save({ moderationEnabled: v }); }} />
      </Row>

      <Row title="Samodejni filter vsebine" desc="Samodejno zaznavanje neprimernih fotografij.">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gray-100 text-gray-400">Kmalu</span>
      </Row>

      <Row title="Dovoljene vrste medijev" desc="Kaj lahko gostje nalagajo. Vsaj ena vrsta mora ostati vključena.">
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={flags.allowPhotos}
              disabled={flags.allowPhotos && !flags.allowVideos}
              onChange={(e) => setFlag("allowPhotos", e.target.checked)}
              className="w-4 h-4 accent-[#F4B400]"
            />
            Fotografije
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={flags.allowVideos}
              disabled={flags.allowVideos && !flags.allowPhotos}
              onChange={(e) => setFlag("allowVideos", e.target.checked)}
              className="w-4 h-4 accent-[#F4B400]"
            />
            Videi
          </label>
        </div>
      </Row>

      <div className="py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">Dovoljenja digitalnega albuma</p>
        <p className="text-xs text-gray-500 mt-0.5 mb-3">Kaj gostje lahko počnejo v spletnem albumu.</p>
        <div className="grid sm:grid-cols-3 gap-2">
          {PERMISSIONS.map((p) => {
            const active = flags.albumPermission === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setFlag("albumPermission", p.id)}
                aria-pressed={active}
                className="text-left rounded-xl border-2 p-3 transition-all"
                style={{ borderColor: active ? "#F4B400" : "#e5e7eb", background: active ? "#FFF9E8" : "#fff" }}
              >
                <span className="block text-sm font-semibold text-gray-900">{p.title}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Row title="Onemogoči prenos za goste" desc="Skrije gumb za prenos, da gostje ne morejo shranjevati fotografij iz albuma.">
        <Toggle on={flags.disableDownload} onChange={(v) => setFlag("disableDownload", v)} />
      </Row>

      <Row title="Onemogoči všečke" desc="Izklopi možnost všečkanja fotografij v albumu.">
        <Toggle on={flags.disableLikes} onChange={(v) => setFlag("disableLikes", v)} />
      </Row>
    </div>
  );
}
