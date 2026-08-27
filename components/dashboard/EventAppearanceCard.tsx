"use client";

import { useEffect, useRef, useState } from "react";
import { WELCOME_FONT_STACKS, type WelcomeFont } from "@/lib/album-appearance";
import { optimizeAppearanceImage, type AppearanceKind } from "@/lib/optimize-image-client";

/**
 * Appearance & welcome-screen editor with a live phone preview — the
 * host sees exactly what a guest's Event / Photo Wall entry surface will
 * look like while they type. Saves through the owner-gated /appearance API;
 * server-side validation is the gate, this card is the convenience.
 */

interface Appearance {
  logoUrl: string | null;
  accentColor: string | null;
  backgroundUrl: string | null;
  welcomeEnabled: boolean;
  welcomeTitle: string | null;
  welcomeText: string | null;
  welcomeButton: string | null;
  welcomeBgUrl: string | null;
  welcomeFont: WelcomeFont;
}

const EMPTY: Appearance = {
  logoUrl: null, accentColor: null, backgroundUrl: null,
  welcomeEnabled: false, welcomeTitle: null, welcomeText: null,
  welcomeButton: null, welcomeBgUrl: null, welcomeFont: "elegant",
};

const FONTS: { id: WelcomeFont; label: string }[] = [
  { id: "elegant", label: "Elegantna (serif)" },
  { id: "modern", label: "Moderna (sans)" },
  { id: "script", label: "Pisana" },
  { id: "classic", label: "Klasična" },
];

/** Source files larger than this are refused before any work happens —
 *  matches nothing real: cameras top out well under it, and anything
 *  bigger is a mis-pick (video, RAW). */
const MAX_SOURCE_MB = 25;

/** Stable upload/remove control shared by all appearance image slots. */
function FileBtn({ kind, label, current, onPick, onRemove }: {
  kind: AppearanceKind;
  label: string;
  current: string | null;
  onPick: (kind: AppearanceKind, file: File) => void;
  onRemove: (kind: AppearanceKind) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-3 cursor-pointer">
        {current
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={current} alt="" className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-0.5 border border-gray-200" />
          : <span className="w-12 h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xl">+</span>}
        <span className="text-xs font-semibold text-[#C9820A] underline underline-offset-2">
          {current ? "Zamenjaj" : label}
        </span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(kind, f); e.target.value = ""; }} />
      </label>
      {current && (
        <button
          type="button"
          onClick={() => onRemove(kind)}
          className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-2"
        >
          Odstrani
        </button>
      )}
    </div>
  );
}

export function EventAppearanceCard({ albumSlug, coupleName }: { albumSlug: string; coupleName: string }) {
  const [a, setA] = useState<Appearance>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/albums/${albumSlug}/appearance`)
      .then((r) => r.json())
      .then((d: { appearance?: Appearance | null }) => { if (d.appearance) setA({ ...EMPTY, ...d.appearance }); })
      .catch(() => {});
  }, [albumSlug]);

  /** Optimistic local update + debounced PATCH, so typing a title
   *  doesn't fire a request per keystroke. */
  function update(patch: Partial<Appearance>) {
    setA((prev) => ({ ...prev, ...patch }));
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/albums/${albumSlug}/appearance`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      } finally { setSaving(false); }
    }, 500);
  }

  async function upload(kind: AppearanceKind, file: File) {
    setUploadError(null);
    if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
      setUploadError(`Slika je prevelika (največ ${MAX_SOURCE_MB} MB). Izberite manjšo datoteko.`);
      return;
    }
    setSaving(true);
    try {
      // Downscale + re-encode to WebP in the browser: a phone photo
      // becomes a few hundred KB before it ever leaves the device.
      const { blob, contentType } = await optimizeAppearanceImage(file, kind);
      if (blob.size > 10 * 1024 * 1024) {
        setUploadError("Slika je tudi po optimizaciji prevelika (največ 10 MB).");
        return;
      }
      const res = await fetch(`/api/albums/${albumSlug}/appearance?kind=${kind}`, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });
      const d = await res.json().catch(() => null);
      if (res.ok && d?.appearance) {
        setA({ ...EMPTY, ...d.appearance });
      } else {
        setUploadError(d?.error === "Unsupported file type"
          ? "Ta vrsta datoteke ni podprta. Uporabite JPG, PNG ali WebP."
          : `Nalaganje ni uspelo${d?.error ? `: ${d.error}` : ""}. Poskusite znova.`);
      }
    } catch {
      setUploadError("Nalaganje ni uspelo. Preverite povezavo in poskusite znova.");
    } finally { setSaving(false); }
  }

  async function removeAsset(kind: AppearanceKind) {
    setUploadError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/albums/${albumSlug}/appearance?kind=${kind}`, { method: "DELETE" });
      const d = await res.json().catch(() => null);
      if (res.ok && d?.appearance) {
        setA({ ...EMPTY, ...d.appearance });
      } else {
        setUploadError(`Brisanje ni uspelo${d?.error ? `: ${d.error}` : ""}. Poskusite znova.`);
      }
    } catch {
      setUploadError("Brisanje ni uspelo. Preverite povezavo in poskusite znova.");
    } finally {
      setSaving(false);
    }
  }

  const accent = a.accentColor ?? "#FFC94D";
  const title = a.welcomeTitle || coupleName;
  const text = a.welcomeText || "Delite svoje fotografije z nami!";
  const button = a.welcomeButton || "Naprej";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">🎨 Videz in pozdravni zaslon</h3>
        {saving && <span className="text-xs text-gray-400">Shranjujem…</span>}
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Nastavitve veljajo samo za Event / Photo Wall povezavo in Foto zid. Običajna galerija ostane standardna.
      </p>
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
        Event povezava: <strong>/{albumSlug}?event=1</strong>. Tu lahko vsak element kadarkoli dodate, zamenjate ali odstranite.
      </div>
      {uploadError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {uploadError}
        </p>
      )}

      <div className="grid lg:grid-cols-[1fr,220px] gap-6">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Logotip eventa</p>
            <p className="text-xs text-gray-500 mb-2">Poljubno razmerje — širok ali kvadraten. Prikazan na Event povezavi in Foto zidu.</p>
            <FileBtn kind="logo" label="Naloži logotip" current={a.logoUrl} onPick={upload} onRemove={removeAsset} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Barva blagovne znamke</p>
            <p className="text-xs text-gray-500 mb-2">Uporabljena za gumbe in poudarke na Event / Photo Wall površinah.</p>
            <div className="flex items-center gap-3">
              <input type="color" value={accent}
                onChange={(e) => update({ accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <code className="text-xs text-gray-500">{accent}</code>
              {a.accentColor && (
                <button type="button" onClick={() => update({ accentColor: null })} className="text-xs text-gray-400 hover:text-gray-600 underline">
                  Ponastavi
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Ozadje event galerije</p>
            <p className="text-xs text-gray-500 mb-2">Slika v ozadju samo na Event povezavi; običajna galerija ostane svetla.</p>
            <FileBtn kind="background" label="Naloži ozadje" current={a.backgroundUrl} onPick={upload} onRemove={removeAsset} />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center justify-between gap-4 mb-3 cursor-pointer">
              <span>
                <span className="block text-sm font-semibold text-gray-900">Pozdravni zaslon</span>
                <span className="block text-xs text-gray-500">Prikaže se samo na Event povezavi, ob gostovem prvem obisku.</span>
              </span>
              <button type="button" role="switch" aria-checked={a.welcomeEnabled}
                onClick={() => update({ welcomeEnabled: !a.welcomeEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${a.welcomeEnabled ? "bg-[#FFC94D]" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${a.welcomeEnabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </label>
            {a.welcomeEnabled && (
              <div className="space-y-3">
                <input value={a.welcomeTitle ?? ""} placeholder={coupleName}
                  onChange={(e) => update({ welcomeTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FFC94D]" />
                <textarea value={a.welcomeText ?? ""} placeholder="Delite svoje fotografije z nami!" rows={2}
                  onChange={(e) => update({ welcomeText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FFC94D]" />
                <div className="flex gap-3">
                  <input value={a.welcomeButton ?? ""} placeholder="Naprej"
                    onChange={(e) => update({ welcomeButton: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FFC94D]" />
                  <select value={a.welcomeFont}
                    onChange={(e) => update({ welcomeFont: e.target.value as WelcomeFont })}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none">
                    {FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <FileBtn kind="welcome" label="Ozadje pozdravnega zaslona" current={a.welcomeBgUrl} onPick={upload} onRemove={removeAsset} />
              </div>
            )}
          </div>
        </div>

        {/* Live phone preview — mirrors WelcomeScreen's real layout. */}
        <div className="hidden lg:block">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 text-center">Predogled</p>
          <div className="rounded-[2rem] border-[6px] border-[#0F1729] overflow-hidden bg-[#0F1729] shadow-xl">
            <div className="relative aspect-[9/17] bg-gray-800">
              {a.welcomeBgUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.welcomeBgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(10,14,25,.86) 0%, rgba(10,14,25,.25) 55%, rgba(10,14,25,.35) 100%)" }} />
              {a.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.logoUrl} alt="" className="absolute top-3 left-1/2 -translate-x-1/2 h-9 w-auto max-w-[60%] rounded-lg object-contain border border-white/40" />
              )}
              <div className="absolute inset-x-3 bottom-3">
                <p className="text-white text-lg leading-tight" style={{ fontFamily: WELCOME_FONT_STACKS[a.welcomeFont] }}>{title}</p>
                <p className="text-gray-200 text-[10px] mt-1">{text}</p>
                <div className="mt-2 rounded-lg bg-white/15 px-2 py-1.5 text-[9px] text-gray-200">Ime …</div>
                <div className="mt-1.5 rounded-lg text-center py-1.5 text-[10px] font-bold text-[#0F1729]" style={{ background: accent }}>
                  {button}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}