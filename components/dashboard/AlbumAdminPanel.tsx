"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "./DashboardNav";
import type { Album, Photo } from "@/lib/db/schema";

type Tab = "published" | "pending" | "rejected" | "settings" | "share" | "stats";

interface Props {
  album: Album;
  photos: Photo[];
  pendingCount: number;
  activeTab: Tab;
}

export function AlbumAdminPanel({ album, photos, pendingCount, activeTab }: Props) {
  const router = useRouter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://photos.wedflow.app";
  const albumUrl = `${appUrl}/${album.slug}`;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "published", label: "Objavljene" },
    { id: "pending", label: "V čakanju", badge: pendingCount },
    { id: "rejected", label: "Zavrnjene" },
    { id: "share", label: "Deljenje" },
    { id: "stats", label: "Statistika" },
    { id: "settings", label: "Nastavitve" },
  ];

  const navigateTab = (tab: Tab) => {
    router.push(`/dashboard/${album.slug}?tab=${tab}`);
  };

  const approvePhoto = async (photoId: string) => {
    await fetch(`/api/albums/${album.slug}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, action: "approve" }),
    });
    router.refresh();
  };

  const rejectPhoto = async (photoId: string) => {
    await fetch(`/api/albums/${album.slug}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, action: "reject" }),
    });
    router.refresh();
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm("Res želite izbrisati to fotografijo?")) return;
    await fetch(`/api/albums/${album.slug}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, action: "delete" }),
    });
    router.refresh();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <DashboardNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb + header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/dashboard" className="font-sans text-sm text-[#2C2825]/50 hover:text-[#C9A96E] transition-colors">
                Albumi
              </Link>
              <svg className="w-3 h-3 text-[#2C2825]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="font-sans text-sm text-[#2C2825]">{album.coupleName}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#2C2825]">{album.coupleName}</h1>
            <p className="font-sans text-sm text-[#2C2825]/50 mt-1">{album.weddingDate}{album.location ? ` · ${album.location}` : ""}</p>
          </div>

          <a
            href={albumUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 border border-[#C9A96E]/30 text-[#2C2825] font-sans text-sm rounded-xl hover:border-[#C9A96E] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Odpri album
          </a>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Fotografij", value: album.photoCount },
            { label: "V čakanju", value: pendingCount },
            { label: "Omejitev", value: `${album.photoCount}/${album.maxPhotos}` },
            { label: "Plan", value: album.plan },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-white border border-[#C9A96E]/20 rounded-lg px-3 py-2">
              <span className="font-sans text-xs text-[#2C2825]/50">{s.label}:</span>
              <span className="font-sans text-xs font-semibold text-[#2C2825]">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#C9A96E]/20 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigateTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 font-sans text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-[#2C2825] text-[#2C2825] font-medium"
                  : "border-transparent text-[#2C2825]/50 hover:text-[#2C2825]"
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] bg-amber-400 text-white text-[10px] font-bold rounded-full px-1">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {(activeTab === "published" || activeTab === "pending" || activeTab === "rejected") && (
          <div>
            {photos.length === 0 ? (
              <div className="text-center py-16 text-[#2C2825]/40 font-sans text-sm">
                Ni fotografij v tej kategoriji.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative bg-white border border-[#C9A96E]/15 rounded-xl overflow-hidden">
                    <img
                      src={photo.thumbnailUrl ?? photo.blobUrl}
                      alt={photo.caption ?? ""}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                    {/* Uploader name */}
                    <div className="p-2">
                      <p className="font-sans text-xs text-[#2C2825]/60 truncate">{photo.uploaderName ?? "Gost"}</p>
                    </div>
                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {activeTab === "pending" && (
                        <>
                          <button
                            onClick={() => approvePhoto(photo.id)}
                            title="Odobri"
                            className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => rejectPhoto(photo.id)}
                            title="Zavrni"
                            className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      {activeTab === "published" && (
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          title="Izbriši"
                          className="w-9 h-9 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "share" && (
          <div className="space-y-6 max-w-lg">
            {/* Album URL */}
            <div className="bg-white border border-[#C9A96E]/20 rounded-xl p-5">
              <p className="font-sans text-xs font-semibold text-[#2C2825]/50 uppercase tracking-widest mb-3">Povezava do albuma</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={albumUrl}
                  className="flex-1 px-3 py-2.5 bg-[#FAF7F2] border border-[#C9A96E]/20 rounded-lg font-sans text-sm text-[#2C2825] outline-none select-all"
                />
                <button
                  onClick={() => copyToClipboard(albumUrl)}
                  className="px-3 py-2.5 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm rounded-lg hover:bg-[#C9A96E] transition-colors whitespace-nowrap"
                >
                  Kopiraj
                </button>
              </div>
            </div>

            {/* QR Code */}
            {album.plan !== "free" && (
              <div className="bg-white border border-[#C9A96E]/20 rounded-xl p-5">
                <p className="font-sans text-xs font-semibold text-[#2C2825]/50 uppercase tracking-widest mb-3">QR koda</p>
                <div className="flex items-start gap-4">
                  <img
                    src={`/api/albums/${album.slug}/qr`}
                    alt="QR code"
                    className="w-28 h-28 border border-[#C9A96E]/20 rounded-lg p-2 bg-white"
                  />
                  <div className="space-y-2">
                    <a
                      href={`/api/albums/${album.slug}/qr?format=png`}
                      download={`album-qr-${album.slug}.png`}
                      className="block px-4 py-2 border border-[#C9A96E]/30 text-[#2C2825] font-sans text-sm rounded-lg hover:border-[#C9A96E] transition-colors text-center"
                    >
                      Prenesi PNG
                    </a>
                    <p className="font-sans text-xs text-[#2C2825]/40">Natisnite na povabila ali mize.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ZIP download */}
            {album.plan !== "free" && (
              <div className="bg-white border border-[#C9A96E]/20 rounded-xl p-5">
                <p className="font-sans text-xs font-semibold text-[#2C2825]/50 uppercase tracking-widest mb-3">Prenos fotografij</p>
                <a
                  href={`/api/albums/${album.slug}/download`}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm rounded-xl hover:bg-[#C9A96E] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Prenesi vse ({album.photoCount}) kot ZIP
                </a>
              </div>
            )}

            {album.plan === "free" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-sans text-sm text-amber-800">
                  <strong>QR koda in ZIP prenos</strong> sta na voljo v Pro in Premium planu.{" "}
                  <a href="https://wedflow.app/pricing" className="underline">Nadgradite</a>
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { label: "Skupaj fotografij", value: album.photoCount, icon: "📷" },
              { label: "V čakanju", value: pendingCount, icon: "⏳" },
              { label: "Omejitev plana", value: `${album.photoCount} / ${album.maxPhotos}`, icon: "📊" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-[#C9A96E]/20 rounded-xl p-6">
                <p className="text-2xl mb-3">{stat.icon}</p>
                <p className="font-serif text-3xl font-light text-[#2C2825] mb-1">{stat.value}</p>
                <p className="font-sans text-sm text-[#2C2825]/50">{stat.label}</p>
              </div>
            ))}

            {/* Progress bar */}
            <div className="sm:col-span-3 bg-white border border-[#C9A96E]/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-sans text-sm text-[#2C2825]/70">Fotografije</p>
                <p className="font-sans text-sm font-medium text-[#2C2825]">
                  {album.photoCount} / {album.maxPhotos}
                </p>
              </div>
              <div className="h-2 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#C9A96E]/15">
                <div
                  className="h-full bg-[#C9A96E] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (album.photoCount / album.maxPhotos) * 100)}%` }}
                />
              </div>
              {album.photoCount >= album.maxPhotos * 0.9 && (
                <p className="font-sans text-xs text-amber-600 mt-2">
                  Skoraj dosežena omejitev.{" "}
                  <a href="https://wedflow.app/pricing" className="underline">Nadgradite plan.</a>
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-lg space-y-6">
            <AlbumSettingsForm album={album} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Inline Settings Form ─────────────────────────────────────────────────────

function AlbumSettingsForm({ album }: { album: Album }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [coupleName, setCoupleName] = useState(album.coupleName);
  const [location, setLocation] = useState(album.location ?? "");
  const [notifyEmail, setNotifyEmail] = useState(album.notifyEmail ?? "");
  const [password, setPassword] = useState(album.password ?? "");
  const [moderationEnabled, setModerationEnabled] = useState(album.moderationEnabled);
  const [isPublished, setIsPublished] = useState(album.isPublished);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/albums/${album.slug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coupleName,
        location,
        notifyEmail,
        password,
        moderationEnabled,
        isPublished,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#C9A96E]/20 rounded-xl p-5 space-y-4">
        <p className="font-sans text-xs font-semibold text-[#2C2825]/50 uppercase tracking-widest">Splošno</p>

        <div>
          <label className="font-sans text-xs text-[#2C2825]/70 block mb-1.5">Ime para</label>
          <input
            value={coupleName}
            onChange={(e) => setCoupleName(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#C9A96E]/25 rounded-lg font-sans text-sm text-[#2C2825] bg-[#FAF7F2] outline-none focus:border-[#C9A96E] transition-colors"
          />
        </div>

        <div>
          <label className="font-sans text-xs text-[#2C2825]/70 block mb-1.5">Lokacija</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ljubljana"
            className="w-full px-3 py-2.5 border border-[#C9A96E]/25 rounded-lg font-sans text-sm text-[#2C2825] bg-[#FAF7F2] outline-none focus:border-[#C9A96E] transition-colors"
          />
        </div>

        <div>
          <label className="font-sans text-xs text-[#2C2825]/70 block mb-1.5">E-pošta za obvestila</label>
          <input
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="jaz@primer.si"
            className="w-full px-3 py-2.5 border border-[#C9A96E]/25 rounded-lg font-sans text-sm text-[#2C2825] bg-[#FAF7F2] outline-none focus:border-[#C9A96E] transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-[#C9A96E]/20 rounded-xl p-5 space-y-4">
        <p className="font-sans text-xs font-semibold text-[#2C2825]/50 uppercase tracking-widest">Dostop</p>

        <div>
          <label className="font-sans text-xs text-[#2C2825]/70 block mb-1.5">Geslo (neobvezno)</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Prazno = brez gesla"
            className="w-full px-3 py-2.5 border border-[#C9A96E]/25 rounded-lg font-sans text-sm text-[#2C2825] bg-[#FAF7F2] outline-none focus:border-[#C9A96E] transition-colors"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <button
            role="switch"
            aria-checked={isPublished}
            onClick={() => setIsPublished(!isPublished)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isPublished ? "bg-[#C9A96E]" : "bg-[#2C2825]/20"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className="font-sans text-sm text-[#2C2825]">Album je javno dostopen</span>
        </label>

        {album.plan !== "free" && (
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              role="switch"
              aria-checked={moderationEnabled}
              onClick={() => setModerationEnabled(!moderationEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${moderationEnabled ? "bg-[#C9A96E]" : "bg-[#2C2825]/20"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${moderationEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <span className="font-sans text-sm text-[#2C2825]">Moderacija (fotografije pred objavo preverite)</span>
          </label>
        )}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm font-medium rounded-xl hover:bg-[#C9A96E] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? "Shranjevanje…" : saved ? "✓ Shranjeno" : "Shrani spremembe"}
      </button>
    </div>
  );
}
