"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import type { Album, Photo } from "@/lib/db/schema";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";

type Tab = "overview" | "gallery" | "qr" | "settings" | "pending";

interface Props {
  album: Album;
  photos: Photo[];
  pendingCount: number;
  activeTab: Tab;
  isNew?: boolean;
  isUpgraded?: boolean;
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function NewAlbumSuccess({ album }: { album: Album }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://guestcam.si";
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
        <h1 className="font-sans text-[28px] font-bold text-gray-900 mb-6 leading-snug">
          Vaša galerija je ustvarjena! 🎉
        </h1>

        {/* Info box */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left">
          <p className="text-sm font-semibold text-gray-600 mb-3">Tukaj lahko:</p>
          <ul className="space-y-2">
            {[
              "Preizkusite galerijo",
              "Naložite do 10 slik brezplačno",
              "Vidite, kako bo Guestcam izgledal na vašem dnevu 😊",
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

export function AlbumAdminPanel({ album, photos, pendingCount, activeTab, isNew, isUpgraded }: Props) {
  const router = useRouter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://guestcam.si";
  const albumUrl = `${appUrl}/${album.slug}`;
  const [driveClicked, setDriveClicked] = useState(false);

  const handleGoogleDrive = () => {
    // 1. Trigger ZIP download via hidden anchor
    const a = document.createElement("a");
    a.href = `/api/albums/${album.slug}/download`;
    a.download = `guestcam-${album.slug}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 2. Open Google Drive upload page in a new tab
    window.open("https://drive.google.com/drive/my-drive", "_blank", "noopener,noreferrer");

    // 3. Show brief confirmation state
    setDriveClicked(true);
    setTimeout(() => setDriveClicked(false), 4000);
  };

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
    album.plan === "plus"    ? "Plus"    :
    album.plan === "basic"   ? "Basic"   :
    "Brezplačno";

  const planBadgeClass =
    album.plan === "premium"
      ? "bg-rose-500 text-white"
      : album.plan === "plus"
      ? "bg-gray-900 text-white"
      : album.plan === "basic"
      ? "bg-indigo-600 text-white"
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
          <GuestcamLogo size="sm" showMark={true} />
        </div>

        {/* Gallery info */}
        <div className="px-5 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Tvoja galerija</p>
          <p className="font-bold text-sm text-gray-900 leading-tight truncate">{album.coupleName}</p>
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
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg mx-0 text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "border-l-2 border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          {pendingCount > 0 && (
            <button
              onClick={() => navigateTab("pending")}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === "pending"
                  ? "border-l-2 border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
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
            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 rounded-lg hover:text-red-500 transition-colors">
              <span>→</span> Odjava
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Upgrade success banner */}
        {isUpgraded && (
          <div
            className="flex items-center justify-between px-6 py-3 gap-4"
            style={{ background: "#F0FDF4" }}
          >
            <p className="text-sm text-green-700 font-medium">
              🎉 Paket aktiviran! Hvala za zaupanje.
            </p>
          </div>
        )}

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
            <p className="text-sm text-gray-400 mt-0.5">Upravljaj svojo galerijo.</p>
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
            <button
              onClick={handleGoogleDrive}
              disabled={driveClicked}
              title="Prenese ZIP in odpre Google Drive v novem oknu"
              className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-all"
              style={driveClicked
                ? { background: "#e8f5e9", borderColor: "#81c784", color: "#2e7d32" }
                : { background: "white", borderColor: "#e5e7eb", color: "#4b5563" }
              }
            >
              {driveClicked ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Drive odprt · ZIP se prenaša
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
                    <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5C.4 49.9 0 51.45 0 53h27.5z" fill="#00AC47"/>
                    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8L73.55 76.8z" fill="#EA4335"/>
                    <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.1.45-4.5 1.2z" fill="#00832D"/>
                    <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.1-.45 4.5-1.2z" fill="#2684FC"/>
                    <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h26.45c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00"/>
                  </svg>
                  Google Drive
                </>
              )}
            </button>
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
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start justify-between gap-3"
          >
            <div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mt-1">{card.label}</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-indigo-500 bg-indigo-50 shrink-0">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* QR Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Tvoja QR koda</h3>
            <p className="text-xs text-gray-400 mt-0.5">Natisni to kodo in jo postavi na mize.</p>
          </div>
          <a
            href={albumUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors self-start"
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
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Zadnje naloženo</h3>
            <Link href={`/dashboard/${album.slug}?tab=gallery`} className="text-xs text-indigo-600 hover:underline">
              Poglej vse
            </Link>
          </div>
          {last4.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 flex-1">
              {last4.map((photo) => (
                <img
                  key={photo.id}
                  src={bunnyDisplayUrl(photo.thumbnailUrl ?? photo.blobUrl)}
                  alt={photo.caption ?? ""}
                  className="w-full h-28 object-cover rounded-xl bg-gray-100"
                  loading="lazy"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.onerror = null;
                    t.style.objectFit = "none";
                    t.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1.5'%3E%3Crect x='2' y='7' width='20' height='14' rx='3'/%3E%3Ccircle cx='12' cy='14' r='3'/%3E%3Cpath d='M8 7V5a2 2 0 0 1 4 0v2'/%3E%3C/svg%3E";
                  }}
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
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          Ni fotografij v tej kategoriji.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden"
              >
                <img
                  src={bunnyDisplayUrl(photo.thumbnailUrl ?? photo.blobUrl)}
                  alt={photo.caption ?? ""}
                  className="w-full h-40 object-cover bg-gray-100"
                  loading="lazy"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.onerror = null;
                    t.style.objectFit = "none";
                    t.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1.5'%3E%3Crect x='2' y='7' width='20' height='14' rx='3'/%3E%3Ccircle cx='12' cy='14' r='3'/%3E%3Cpath d='M8 7V5a2 2 0 0 1 4 0v2'/%3E%3C/svg%3E";
                  }}
                />
                <div className="px-2 py-1.5">
                  <p className="text-xs text-gray-500 truncate">{photo.uploaderName ?? "Gost"}</p>
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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center gap-5">
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

function DeleteAlbumModal({
  album,
  onClose,
}: {
  album: Album;
  onClose: () => void;
}) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const slug = album.slug;
  const ready = confirmText === slug;

  const handleDelete = async () => {
    if (!ready) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/albums/${slug}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Brisanje ni uspelo");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Napaka");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Izbriši galerijo</h2>
            <p className="text-sm text-gray-500 mt-0.5">To dejanje je <strong>nepovratno</strong>. Vse fotografije, videi in podatki bodo trajno izbrisani.</p>
          </div>
        </div>

        {/* Confirmation input */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm text-red-700">
            Za potrditev vpiši ime galerije:
            <span className="ml-1 font-mono font-bold text-red-800 select-all">{slug}</span>
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={slug}
            autoFocus
            className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white outline-none transition-colors font-mono"
            style={{ borderColor: confirmText && !ready ? "#f87171" : ready ? "#22c55e" : "#e5e7eb" }}
          />
          {confirmText && !ready && (
            <p className="text-xs text-red-600">Besedilo se ne ujema</p>
          )}
          {ready && (
            <p className="text-xs text-green-600 font-medium">✓ Potrditev pravilna</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Prekliči
          </button>
          <button
            onClick={handleDelete}
            disabled={!ready || deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: ready ? "#dc2626" : "#fca5a5" }}
          >
            {deleting ? "Brišem…" : "Izbriši galerijo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AlbumSettingsForm({ album }: { album: Album }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none focus:border-indigo-400 transition-colors";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <h3 className="font-semibold text-gray-900">Nastavitve galerije</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ime galerije</label>
        <input value={coupleName} onChange={(e) => setCoupleName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
        <input
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lokacija</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ljubljana"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pozdravno sporočilo za goste</label>
        <textarea
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          rows={3}
          placeholder="Dobrodošli! Naložite svoje fotografije in delite spomine."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Geslo (neobvezno)</label>
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
        className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors bg-indigo-600 hover:bg-indigo-700"
      >
        {saving ? "Shranjevanje…" : saved ? "✓ Shranjeno" : "Shrani spremembe"}
      </button>

      {/* ── Danger Zone ─────────────────────────────────────────────────── */}
      <div className="border border-red-200 rounded-2xl p-5 space-y-3 mt-2" style={{ background: "#fff5f5" }}>
        <div>
          <h4 className="font-semibold text-red-700 text-sm">Nevarno območje</h4>
          <p className="text-xs text-red-500 mt-0.5">Spodnja dejanja so nepovratna. Nadaljuj previdno.</p>
        </div>
        <div className="flex items-center justify-between gap-4 bg-white border border-red-100 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Izbriši galerijo</p>
            <p className="text-xs text-gray-500 mt-0.5">Trajno izbriše galerijo in vse fotografije.</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-shrink-0 px-4 py-2 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Izbriši
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAlbumModal album={album} onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}
