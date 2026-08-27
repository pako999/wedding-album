"use client";

import { useEffect, useRef, useState } from "react";
import { WELCOME_FONT_STACKS, type WelcomeFont } from "@/lib/album-appearance";
import { optimizeAppearanceImage, type AppearanceKind } from "@/lib/optimize-image-client";
import { LANGS, type Lang } from "@/lib/i18n/translations";
import {
  eventAppearanceAdminCopy,
  normalizeEventAdminLang,
} from "@/lib/i18n/event-appearance-admin";

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

interface HeaderSettings {
  showEventName: boolean;
  showLocation: boolean;
}

const EMPTY: Appearance = {
  logoUrl: null,
  accentColor: null,
  backgroundUrl: null,
  welcomeEnabled: false,
  welcomeTitle: null,
  welcomeText: null,
  welcomeButton: null,
  welcomeBgUrl: null,
  welcomeFont: "elegant",
};

const DEFAULT_HEADER: HeaderSettings = {
  showEventName: true,
  showLocation: true,
};

const MAX_SOURCE_MB = 25;

function Toggle({ on, onChange, label }: { on: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-[#FFC94D]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function FileBtn({
  kind,
  label,
  current,
  replaceLabel,
  removeLabel,
  onPick,
  onRemove,
}: {
  kind: AppearanceKind;
  label: string;
  current: string | null;
  replaceLabel: string;
  removeLabel: string;
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
          {current ? replaceLabel : label}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(kind, f);
            e.target.value = "";
          }}
        />
      </label>
      {current && (
        <button
          type="button"
          onClick={() => onRemove(kind)}
          className="text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-2"
        >
          {removeLabel}
        </button>
      )}
    </div>
  );
}

export function EventAppearanceCard({ albumSlug, coupleName }: { albumSlug: string; coupleName: string }) {
  const [a, setA] = useState<Appearance>(EMPTY);
  const [lang, setLang] = useState<Lang>("sl");
  const [header, setHeader] = useState<HeaderSettings>(DEFAULT_HEADER);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = eventAppearanceAdminCopy[lang];

  useEffect(() => {
    fetch(`/api/albums/${albumSlug}/appearance`)
      .then((r) => r.json())
      .then((d: { appearance?: Appearance | null }) => {
        if (d.appearance) setA({ ...EMPTY, ...d.appearance });
      })
      .catch(() => {});

    fetch(`/api/albums/${albumSlug}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { defaultLang?: unknown; header?: Partial<HeaderSettings> } | null) => {
        if (!d) return;
        setLang(normalizeEventAdminLang(d.defaultLang));
        if (d.header) setHeader({ ...DEFAULT_HEADER, ...d.header });
      })
      .catch(() => {});
  }, [albumSlug]);

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
      } finally {
        setSaving(false);
      }
    }, 500);
  }

  async function saveAlbumSetting(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/albums/${albumSlug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("settings_save_failed");
    } catch {
      setUploadError(c.uploadFailed);
    } finally {
      setSaving(false);
    }
  }

  function changeLanguage(next: Lang) {
    setLang(next);
    void saveAlbumSetting({ defaultLang: next });
  }

  function changeHeader(key: keyof HeaderSettings, value: boolean) {
    setHeader((prev) => ({ ...prev, [key]: value }));
    void saveAlbumSetting({ [key]: value });
  }

  async function upload(kind: AppearanceKind, file: File) {
    setUploadError(null);
    if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
      setUploadError(c.tooLarge(MAX_SOURCE_MB));
      return;
    }
    setSaving(true);
    try {
      const { blob, contentType } = await optimizeAppearanceImage(file, kind);
      if (blob.size > 10 * 1024 * 1024) {
        setUploadError(c.tooLargeOptimized);
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
        setUploadError(d?.error === "Unsupported file type" ? c.unsupportedType : c.uploadFailed);
      }
    } catch {
      setUploadError(c.connectionUploadFailed);
    } finally {
      setSaving(false);
    }
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
        setUploadError(c.deleteFailed);
      }
    } catch {
      setUploadError(c.connectionDeleteFailed);
    } finally {
      setSaving(false);
    }
  }

  const accent = a.accentColor ?? "#FFC94D";
  const title = a.welcomeTitle || coupleName;
  const text = a.welcomeText || c.welcomeTextPlaceholder;
  const button = a.welcomeButton || c.next;
  const fonts: { id: WelcomeFont; label: string }[] = [
    { id: "elegant", label: c.fontElegant },
    { id: "modern", label: c.fontModern },
    { id: "script", label: c.fontScript },
    { id: "classic", label: c.fontClassic },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">{c.title}</h3>
        {saving && <span className="text-xs text-gray-400">{c.saving}</span>}
      </div>
      <p className="text-xs text-gray-500 mb-3">{c.intro}</p>
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
        {c.eventLink} <strong>/{albumSlug}?event=1</strong>. {c.eventLinkSuffix}
      </div>

      {uploadError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {uploadError}
        </p>
      )}

      <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{c.defaultLanguage}</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-2">{c.defaultLanguageDesc}</p>
          <select
            value={lang}
            onChange={(e) => changeLanguage(e.target.value as Lang)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-[#FFC94D]"
          >
            {LANGS.map((item) => (
              <option key={item.code} value={item.code}>{item.flag} {item.native}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-semibold text-gray-900">{c.albumHeader}</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">{c.albumHeaderDesc}</p>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">{c.showEventName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.showEventNameDesc}</p>
              </div>
              <Toggle on={header.showEventName} onChange={(v) => changeHeader("showEventName", v)} label={c.showEventName} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">{c.showLocation}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.showLocationDesc}</p>
              </div>
              <Toggle on={header.showLocation} onChange={(v) => changeHeader("showLocation", v)} label={c.showLocation} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,220px] gap-6">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{c.logoTitle}</p>
            <p className="text-xs text-gray-500 mb-2">{c.logoDesc}</p>
            <FileBtn
              kind="logo"
              label={c.uploadLogo}
              current={a.logoUrl}
              replaceLabel={c.replace}
              removeLabel={c.remove}
              onPick={upload}
              onRemove={removeAsset}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{c.brandColor}</p>
            <p className="text-xs text-gray-500 mb-2">{c.brandColorDesc}</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accent}
                onChange={(e) => update({ accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <code className="text-xs text-gray-500">{accent}</code>
              {a.accentColor && (
                <button
                  type="button"
                  onClick={() => update({ accentColor: null })}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  {c.reset}
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{c.backgroundTitle}</p>
            <p className="text-xs text-gray-500 mb-2">{c.backgroundDesc}</p>
            <FileBtn
              kind="background"
              label={c.uploadBackground}
              current={a.backgroundUrl}
              replaceLabel={c.replace}
              removeLabel={c.remove}
              onPick={upload}
              onRemove={removeAsset}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center justify-between gap-4 mb-3 cursor-pointer">
              <span>
                <span className="block text-sm font-semibold text-gray-900">{c.welcomeTitle}</span>
                <span className="block text-xs text-gray-500">{c.welcomeDesc}</span>
              </span>
              <Toggle
                on={a.welcomeEnabled}
                onChange={(value) => update({ welcomeEnabled: value })}
                label={c.welcomeTitle}
              />
            </label>
            {a.welcomeEnabled && (
              <div className="space-y-3">
                <input
                  value={a.welcomeTitle ?? ""}
                  placeholder={coupleName}
                  onChange={(e) => update({ welcomeTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FFC94D]"
                />
                <textarea
                  value={a.welcomeText ?? ""}
                  placeholder={c.welcomeTextPlaceholder}
                  rows={2}
                  onChange={(e) => update({ welcomeText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FFC94D]"
                />
                <div className="flex gap-3">
                  <input
                    value={a.welcomeButton ?? ""}
                    placeholder={c.next}
                    onChange={(e) => update({ welcomeButton: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FFC94D]"
                  />
                  <select
                    value={a.welcomeFont}
                    onChange={(e) => update({ welcomeFont: e.target.value as WelcomeFont })}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none"
                  >
                    {fonts.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <FileBtn
                  kind="welcome"
                  label={c.welcomeBackground}
                  current={a.welcomeBgUrl}
                  replaceLabel={c.replace}
                  removeLabel={c.remove}
                  onPick={upload}
                  onRemove={removeAsset}
                />
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2 text-center">{c.preview}</p>
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
                <div className="mt-2 rounded-lg bg-white/15 px-2 py-1.5 text-[9px] text-gray-200">{c.namePlaceholder}</div>
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
