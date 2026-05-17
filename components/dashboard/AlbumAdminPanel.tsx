"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import type { Album, Photo } from "@/lib/db/schema";

type Tab = "overview" | "gallery" | "qr" | "settings" | "pending";

interface Props {
  album: Album;
  photos: Photo[];
  pendingCount: number;
  activeTab: Tab;
  isNew?: boolean;
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function NewAlbumSuccess({ album }: { album: Album }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://photos.wedflow.app";
  const albumUrl = `${appUrl}/${album.slug}`;
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full mx-4 text-center">
        {/* Green checkmark */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-serif text-[28px] font-bold text-[#1a1a2e] mb-6 leading-snug">
          Vaša galerija je ustvarjena! 🎉
        </h1>

        {/* Info box */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left">
          <p className="text-sm font-semibold text-gray-600 mb-3">Tukaj lahko:</p>
          <ul className="space-y-2">
            {[
              "Preizkusite galerijo",
              "Naložite do 10 slik brezplačno",
              "Vidite, kako bo WedFlow izgledal na vašem dnevu 😊",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded bg-green-100">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Primary button */}
        <a
          href={albumUrl}
          target="_blank"
          rel="noreferrer"
          className="block w-full py-3.5 rounded-xl text-white font-bold text-base mb-3 transition-opacity hover:opacity-90"
          style={{ background: "#4F46E5" }}
        >
          Odpri mojo galerijo →
        </a>

        {/* Secondary link */}
        <button
          onClick={() => router.push(`/dashboard/${album.slug}/print`)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Natisni QR predloge →
        </button>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function AlbumAdminPanel({ album, photos, pendingCount, activeTab, isNew }: Props) {
  const router = useRouter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://photos.wedflow.app";
  const albumUrl = `${appUrl}/${album.slug}`;

  // Show success screen if just created
  if (isNew) {
    return <NewAlbumSuccess album={album} />;
  }

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

  const planLabel =
    album.plan === "premium" ? "Premium" :
    album.plan === "pro"     ? "Plus"    :
    "Brezplačno";

  const planBadgeClass =
    album.plan === "premium"
      ? "bg-rose-500 text-white"
      : album.plan === "pro"
      ? "bg-gray-900 text-white"
      : "bg-gray-100 text-gray-600";

  // Last uploaded photo date
  const lastPhoto = photos[0];
  const lastUploadDate = lastPhoto
    ? new Date(lastPhoto.uploadedAt).toLocaleDateString("sl-SI", { day: "numeric", month: "short", year: "numeric" })
    : "-";

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "overview",  label: "Pregled",    icon: "🕐" },
    { id: "gallery",   label: "Galerija",   icon: "🖼" },
    { id: "qr",        label: "QR koda",    icon: "📱" },
    { id: "settings",  label: "Nastavitve", icon: "⚙️" },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#f9fafb" }}>
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        className="flex flex-col"
        style={{
          width: 220,
          minWidth: 220,
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5">
          <span className="font-bold text-xl text-[#1a1a2e]">
            WedFlow<span className="text-rose-400">.</span>
          </span>
        </div>

        {/* Gallery info */}
        <div className="px-5 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Tvoja galerija</p>
          <p className="font-bold text-sm text-[#111] leading-tight truncate">{album.coupleName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{album.weddingDate}</p>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${planBadgeClass}`}>
            {planLabel}
          </span>
        </div>

        {/* New gallery button */}
        <div className="px-4 pb-4">
          <Link
            href="/dashboard/new"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm text-gray-500 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Dodaj novo galerijo
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
                style={isActive ? { background: "#1a1a2e" } : {}}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          {pendingCount > 0 && (
            <button
              onClick={() => navigateTab("pending")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === "pending"
                  ? "text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
              style={activeTab === "pending" ? { background: "#1a1a2e" } : {}}
            >
              <span className="text-base leading-none">⏳</span>
              V čakanju
              <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 bg-amber-400 text-white text-[10px] font-bold rounded-full px-1">
                {pendingCount}
              </span>
            </button>
          )}
        </nav>

        {/* Sign out */}
        <div className="px-4 pb-5 pt-2">
          <SignOutButton>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 rounded-lg hover:bg-rose-50 transition-colors font-medium">
              <span>→</span> Odjava
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Upgrade banner (free plan only) */}
        {album.plan === "free" && (
          <div
            className="flex items-center justify-between px-6 py-3 gap-4"
            style={{ background: "#EEF2FF" }}
          >
            <p className="text-sm text-indigo-700 font-medium">
              Brezplačni paket (omejeno na 10 slik in 2 videa)
            </p>
            <Link
              href={`/dashboard/${album.slug}/upgrade`}
              className="flex-shrink-0 px-4 py-1.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#4F46E5" }}
            >
              Odkleni galerijo →
            </Link>
          </div>
        )}

        {/* Page header */}
        <div className="flex items-start justify-between px-8 pt-7 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === "overview"  && "Pregled galerije"}
              {activeTab === "gallery"   && "Galerija"}
              {activeTab === "qr"        && "QR koda"}
              {activeTab === "settings"  && "Nastavitve"}
              {activeTab === "pending"   && "Čakajoče fotografije"}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Upravljaj svoje poročne spomine.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={albumUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
            >
              🔗 Poglej kot gost
            </a>
            <a
              href={`/api/albums/${album.slug}/download`}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
            >
              ⬇ Prenesi vse (ZIP)
            </a>
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="flex-1 px-8 pb-8">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <OverviewTab
              album={album}
              photos={photos}
              albumUrl={albumUrl}
              lastUploadDate={lastUploadDate}
            />
          )}

          {/* GALLERY */}
          {(activeTab === "gallery" || activeTab === "pending") && (
            <GalleryTab
              album={album}
              photos={photos}
              activeTab={activeTab}
              approvePhoto={approvePhoto}
              rejectPhoto={rejectPhoto}
              deletePhoto={deletePhoto}
            />
          )}

          {/* QR */}
          {activeTab === "qr" && (
            <QrTab album={album} albumUrl={albumUrl} copyToClipboard={copyToClipboard} />
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="max-w-lg">
              <AlbumSettingsForm album={album} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({
  album,
  photos,
  albumUrl,
  lastUploadDate,
}: {
  album: Album;
  photos: Photo[];
  albumUrl: string;
  lastUploadDate: string;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(albumUrl)}&bgcolor=ffffff&color=1a1a2e&qzone=2&format=png`;
  const last4 = photos.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M1.5 18.75h21M3.75 9h.008v.008H3.75V9zm0 3h.008v.008H3.75V12z" />
              </svg>
            ),
            label: "Naložene slike",
            value: album.photoCount,
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            ),
            label: "Gostje",
            value: 0,
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            label: "Zadnja slika",
            value: lastUploadDate,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border p-5 shadow-sm"
            style={{ borderColor: "#e5e7eb" }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 mb-3">
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* QR Card */}
        <div className="bg-white rounded-xl border p-5 flex flex-col gap-4" style={{ borderColor: "#e5e7eb" }}>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Tvoja QR koda</h3>
            <p className="text-xs text-gray-400 mt-0.5">Natisni to kodo in jo postavi na mize.</p>
          </div>
          <a
            href={albumUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors self-start"
          >
            Skeniraj to QR kodo in preizkusi, kako deluje
          </a>
          <div className="flex flex-col items-center gap-3">
            <div className="text-gray-300 text-xl select-none">↓</div>
            <img
              src={qrUrl}
              alt="QR koda"
              className="w-48 h-48 rounded-lg border border-gray-100"
            />
          </div>
          <div className="flex gap-2">
            <a
              href={`/api/albums/${album.slug}/qr?format=png&design=1`}
              download={`qr-design-${album.slug}.png`}
              className="flex-1 py-2 text-xs text-center text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
            >
              ⬇ Prenesi QR kodo z designom
            </a>
            <a
              href={`/api/albums/${album.slug}/qr?format=png`}
              download={`qr-${album.slug}.png`}
              className="flex-1 py-2 text-xs text-center text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
            >
              ⬇ Prenesi samo QR kodo
            </a>
          </div>
        </div>

        {/* Recent photos card */}
        <div className="bg-white rounded-xl border p-5 flex flex-col gap-3" style={{ borderColor: "#e5e7eb" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Zadnje naloženo</h3>
            <Link href={`/dashboard/${album.slug}?tab=gallery`} className="text-xs text-blue-600 hover:underline">
              Poglej vse
            </Link>
          </div>
          {last4.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 flex-1">
              {last4.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.thumbnailUrl ?? photo.blobUrl}
                  alt={photo.caption ?? ""}
                  className="w-full h-28 object-cover rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Še ni naloženih fotografij.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Tab ─────────────────────────────────────────────────────────────

function GalleryTab({
  album,
  photos,
  activeTab,
  approvePhoto,
  rejectPhoto,
  deletePhoto,
}: {
  album: Album;
  photos: Photo[];
  activeTab: Tab;
  approvePhoto: (id: string) => void;
  rejectPhoto: (id: string) => void;
  deletePhoto: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">
          {activeTab === "pending" ? "Čakajoče fotografije" : "Vse fotografije"}
        </h2>
      </div>

      {photos.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm bg-white rounded-xl border" style={{ borderColor: "#e5e7eb" }}>
          Ni fotografij v tej kategoriji.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-white border rounded-xl overflow-hidden"
                style={{ borderColor: "#e5e7eb" }}
              >
                <img
                  src={photo.thumbnailUrl ?? photo.blobUrl}
                  alt={photo.caption ?? ""}
                  className="w-full h-36 object-cover"
                  loading="lazy"
                />
                <div className="p-2">
                  <p className="text-xs text-gray-400 truncate">{photo.uploaderName ?? "Gost"}</p>
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
                  {activeTab === "gallery" && (
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
          <div className="flex justify-center mt-6">
            <a
              href={`/${album.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-full hover:border-gray-400 transition-colors"
            >
              Naloži več
            </a>
          </div>
        </>
      )}
    </div>
  );
}

// ─── QR Tab ──────────────────────────────────────────────────────────────────

function QrTab({
  album,
  albumUrl,
  copyToClipboard,
}: {
  album: Album;
  albumUrl: string;
  copyToClipboard: (text: string) => void;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(albumUrl)}&bgcolor=ffffff&color=1a1a2e&qzone=2&format=png`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(albumUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-xl border p-6 flex flex-col items-center gap-5" style={{ borderColor: "#e5e7eb" }}>
        <img
          src={qrUrl}
          alt="QR koda"
          className="w-52 h-52 rounded-xl border border-gray-100"
        />

        {/* URL input + copy */}
        <div className="w-full flex items-center gap-2">
          <input
            readOnly
            value={albumUrl}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 text-sm font-semibold rounded-lg text-white transition-colors whitespace-nowrap"
            style={{ background: copied ? "#22c55e" : "#4F46E5" }}
          >
            {copied ? "Kopirano!" : "Kopiraj"}
          </button>
        </div>

        {/* Download buttons */}
        <div className="w-full flex gap-2">
          <a
            href={`/api/albums/${album.slug}/qr?format=png&design=1`}
            download={`qr-design-${album.slug}.png`}
            className="flex-1 py-2.5 text-sm text-center text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            Prenesi QR kodo z designom
          </a>
          <a
            href={`/api/albums/${album.slug}/qr?format=png`}
            download={`qr-${album.slug}.png`}
            className="flex-1 py-2.5 text-sm text-center text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            Prenesi samo QR kodo
          </a>
        </div>

        <Link
          href={`/dashboard/${album.slug}/print`}
          className="text-sm text-indigo-600 hover:underline"
        >
          Odpri predloge za tisk →
        </Link>
      </div>
    </div>
  );
}

// ─── Settings Form ────────────────────────────────────────────────────────────

function AlbumSettingsForm({ album }: { album: Album }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [coupleName, setCoupleName]           = useState(album.coupleName);
  const [weddingDate, setWeddingDate]         = useState(album.weddingDate);
  const [location, setLocation]               = useState(album.location ?? "");
  const [notifyEmail, setNotifyEmail]         = useState(album.notifyEmail ?? "");
  const [password, setPassword]               = useState(album.password ?? "");
  const [moderationEnabled, setModerationEnabled] = useState(album.moderationEnabled);
  const [isPublished, setIsPublished]         = useState(album.isPublished);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/albums/${album.slug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coupleName,
        weddingDate,
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

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white outline-none focus:border-indigo-400 transition-colors";

  return (
    <div className="bg-white rounded-xl border p-6 space-y-5" style={{ borderColor: "#e5e7eb" }}>
      <h3 className="font-semibold text-gray-900">Nastavitve galerije</h3>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Ime galerije</label>
        <input value={coupleName} onChange={(e) => setCoupleName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Datum</label>
        <input
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Lokacija</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ljubljana"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Pozdravno sporočilo za goste</label>
        <textarea
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          rows={3}
          placeholder="Dobrodošli na naši poroki! Naložite svoje fotografije in delite spomine z nami."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Geslo (neobvezno)</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Prazno = brez gesla"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            role="switch"
            aria-checked={isPublished}
            onClick={() => setIsPublished(!isPublished)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isPublished ? "bg-indigo-500" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className="text-sm text-gray-700">Galerija je javno dostopna</span>
        </label>

        {album.plan !== "free" && (
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              role="switch"
              aria-checked={moderationEnabled}
              onClick={() => setModerationEnabled(!moderationEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${moderationEnabled ? "bg-indigo-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${moderationEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <span className="text-sm text-gray-700">Moderacija fotografij pred objavo</span>
          </label>
        )}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
        style={{ background: "#1a1a2e" }}
      >
        {saving ? "Shranjevanje…" : saved ? "✓ Shranjeno" : "Shrani spremembe"}
      </button>
    </div>
  );
}
