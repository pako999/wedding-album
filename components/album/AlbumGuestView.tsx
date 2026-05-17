"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import { UploadModal } from "./UploadModal";
import { CountdownTimer } from "./CountdownTimer";
import { translations, LANGS, type Lang } from "@/lib/i18n/translations";
import { bunnyDisplayUrl, bunnyOriginalUrl } from "@/lib/storage/bunny";
import type { Album, Photo } from "@/lib/db/schema";

interface Props {
  album: Album;
  photos: Photo[];
  passwordRequired: boolean;
  passwordCorrect: boolean;
  providedPassword?: string;
  initialLang: Lang;
}

type FilterTab = "all" | "photos" | "videos";

function eventIcon(eventType: string): string {
  switch (eventType) {
    case "wedding":     return "💍";
    case "birthday":    return "🎂";
    case "anniversary": return "🥂";
    case "party":       return "🎉";
    case "baptism":     return "🕊️";
    case "graduation":  return "🎓";
    default:            return "📸";
  }
}

function eventLabel(eventType: string): string {
  switch (eventType) {
    case "wedding":     return "Poroka";
    case "birthday":    return "Rojstni dan";
    case "anniversary": return "Obletnica";
    case "party":       return "Zabava";
    case "baptism":     return "Krst";
    case "graduation":  return "Matura";
    default:            return "Dogodek";
  }
}

/** Human-readable relative/absolute upload time (Slovenian) */
function formatUploadTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1)   return "Pravkar";
  if (diffMins < 60)  return `${diffMins} min`;
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 24) return `Danes, ${hh}:${mm}`;
  const diffDays  = Math.floor(diffMs / 86_400_000);
  if (diffDays === 1) return `Včeraj, ${hh}:${mm}`;
  return d.toLocaleDateString("sl-SI", { day: "numeric", month: "short" }) + ` ${hh}:${mm}`;
}

const BRAND = {
  accent:      "#C4738A",
  accentHover: "#9E5268",
  accentLight: "#FEF2F4",
  dark:        "#111827",
  muted:       "#6B7280",
  border:      "#E5E7EB",
  bg:          "#F9FAFB",
};

const BROKEN_IMG_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1.5'%3E%3Crect x='2' y='7' width='20' height='14' rx='3'/%3E%3Ccircle cx='12' cy='14' r='3'/%3E%3C/svg%3E";

/* Avatar initial bubble shared by photo captions + video cards */
function AvatarBubble({ name, size = 5 }: { name: string; size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ background: BRAND.accent, fontSize: size <= 5 ? "9px" : "11px" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function AlbumGuestView({ album, photos, passwordRequired, passwordCorrect, providedPassword: _pw, initialLang }: Props) {
  const router = useRouter();
  const [lang, setLang]                 = useState<Lang>(initialLang);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [uploadOpen, setUploadOpen]     = useState(false);
  const [pwInput, setPwInput]           = useState("");
  const [pwError, setPwError]           = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [filter, setFilter]             = useState<FilterTab>("all");
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const nameInputRef  = useRef<HTMLInputElement>(null);
  const cameraFilesRef = useRef<FileList | null>(null);

  const t       = translations[lang];
  const evtIcon = eventIcon(album.eventType ?? "other");
  const albumFull = album.plan === "free" && photos.length >= (album.maxPhotos ?? 20);

  // ── Uploader list (sorted by upload count desc) ───────────────────────────
  const uploaders: string[] = (() => {
    const counts = new Map<string, number>();
    for (const p of photos) {
      if (p.uploaderName) counts.set(p.uploaderName, (counts.get(p.uploaderName) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([n]) => n);
  })();

  // ── Counts (total, not affected by filters) ───────────────────────────────
  const photoCount = photos.filter(p => !p.mimeType?.startsWith("video/")).length;
  const videoCount = photos.filter(p =>  p.mimeType?.startsWith("video/")).length;

  // ── Filtered collection (type + person) ───────────────────────────────────
  const filteredPhotos = photos.filter(p => {
    if (filter === "photos" &&  p.mimeType?.startsWith("video/")) return false;
    if (filter === "videos" && !p.mimeType?.startsWith("video/")) return false;
    if (personFilter && p.uploaderName !== personFilter) return false;
    return true;
  });
  const filteredImages = filteredPhotos.filter(p => !p.mimeType?.startsWith("video/"));
  const filteredVideos = filteredPhotos.filter(p =>  p.mimeType?.startsWith("video/"));

  const switchLang = (l: Lang) => {
    setLang(l);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState({}, "", url.toString());
  };

  const confirmName = () => {
    if (!uploaderName.trim()) return;
    setUploaderName(uploaderName.trim());
    setNameConfirmed(true);
  };

  // ── Lightbox slides — all non-video photos (unaffected by filters) ─────────
  const lightboxSlides = photos
    .filter(p => !p.mimeType?.startsWith("video/"))
    .map(p => ({
      src: bunnyDisplayUrl(p.blobUrl, 2400, 90),
      width: p.width ?? 2400,
      height: p.height ?? 1600,
      download: { url: bunnyOriginalUrl(p.blobUrl), filename: p.originalFilename ?? "photo.jpg" },
      description: p.caption ?? undefined,
    }));

  const getLightboxIdx = (photo: Photo): number => {
    const allImages = photos.filter(p => !p.mimeType?.startsWith("video/"));
    return allImages.findIndex(p => p.id === photo.id);
  };

  // ── Password gate ─────────────────────────────────────────────────────────
  if (passwordRequired && !passwordCorrect) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: BRAND.bg }}>
        <div className="h-1 w-full shrink-0" style={{ background: BRAND.accent }} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">{evtIcon}</div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND.dark }}>{album.coupleName}</h1>
              <p className="text-sm mt-1" style={{ color: BRAND.muted }}>{album.weddingDate}{album.location ? ` · ${album.location}` : ""}</p>
            </div>
            <div className="bg-white rounded-2xl border p-8" style={{ borderColor: BRAND.border }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: BRAND.accentLight }}>
                <svg className="w-6 h-6" style={{ color: BRAND.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <p className="text-sm text-center mb-5" style={{ color: BRAND.muted }}>{t.passwordProtected}</p>
              <form onSubmit={(e) => { e.preventDefault(); if (pwInput) { const url = new URL(window.location.href); url.searchParams.set("pw", pwInput); url.searchParams.set("lang", lang); router.push(url.pathname + url.search); } }}>
                <input type="password" value={pwInput} onChange={(e) => { setPwInput(e.target.value); setPwError(false); }} placeholder={t.passwordPlaceholder}
                  className="w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all mb-3" style={{ borderColor: BRAND.border }} />
                {pwError && <p className="text-xs text-red-500 mb-3">{t.wrongPassword}</p>}
                <button type="submit" className="w-full py-3 text-white font-semibold rounded-xl transition-all hover:opacity-90" style={{ background: BRAND.dark }}>{t.openAlbum}</button>
              </form>
            </div>
            <div className="flex justify-center gap-1 mt-6">
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => switchLang(l.code)} className="px-2 py-1 rounded-lg text-sm transition-all hover:bg-white"
                  style={lang === l.code ? { background: BRAND.accentLight } : { color: BRAND.muted }}>{l.flag}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ════════════════════════════════════════════════════════════════════
          HERO HEADER
      ════════════════════════════════════════════════════════════════════ */}
      <div className="relative">
        {album.coverImageUrl ? (
          <div className="relative h-72 sm:h-96 lg:h-[460px] w-full overflow-hidden">
            <Image src={album.coverImageUrl} alt={album.coupleName} fill className="object-cover" priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 100%)" }} />
            <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 pt-5">
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <span>{evtIcon}</span>
                <span>{eventLabel(album.eventType ?? "other")}</span>
              </div>
              <div className="flex items-center gap-1">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => switchLang(l.code)} className="px-1.5 py-1 rounded-lg text-sm transition-all hover:bg-white/20"
                    style={lang === l.code ? { background: "rgba(255,255,255,0.25)" } : {}}>{l.flag}</button>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 px-6 pb-8 sm:px-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">{album.coupleName}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-sm">
                <span>{album.weddingDate}</span>
                {album.location && <><span>·</span><span>{album.location}</span></>}
                <span>·</span>
                <span>{photoCount} foto{videoCount > 0 ? ` · ${videoCount} video` : ""}</span>
                {photos.length > 0 && (
                  <span className="flex items-center gap-1 text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-white inline-block" />
                    V živo
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 px-6 text-center overflow-hidden" style={{ background: BRAND.dark }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #C4738A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C4738A 0%, transparent 40%)" }} />
            <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 pt-4">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <span>{evtIcon}</span>
                <span>{eventLabel(album.eventType ?? "other")}</span>
              </div>
              <div className="flex items-center gap-1">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => switchLang(l.code)} className="px-1.5 py-1 rounded-lg text-sm transition-all hover:bg-white/10"
                    style={lang === l.code ? { background: "rgba(196,115,138,0.3)" } : { color: "rgba(255,255,255,0.5)" }}>{l.flag}</button>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="text-5xl sm:text-6xl mb-5">{evtIcon}</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">{album.coupleName}</h1>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-white/50 text-sm mb-6">
                <span>{album.weddingDate}</span>
                {album.location && <><span>·</span><span>{album.location}</span></>}
                {photos.length > 0 && <><span>·</span><span>{photoCount} foto{videoCount > 0 ? ` · ${videoCount} video` : ""}</span></>}
              </div>
              <CountdownTimer targetDate={album.weddingDate} translations={t} />
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          STICKY TOOLBAR
      ════════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 bg-white border-b" style={{ borderColor: BRAND.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Row 1 — type filter + upload */}
          <div className="flex items-center justify-between gap-4 py-3">

            {/* Type filter pills */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
              {([
                { id: "all",    label: "Vse",         count: photos.length },
                { id: "photos", label: "Fotografije",  count: photoCount },
                { id: "videos", label: "Videi",        count: videoCount },
              ] as { id: FilterTab; label: string; count: number }[]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={filter === tab.id
                    ? { background: "white", color: BRAND.dark, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                    : { color: BRAND.muted }
                  }
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={filter === tab.id
                        ? { background: BRAND.accentLight, color: BRAND.accent }
                        : { background: "transparent", color: BRAND.muted }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Upload section */}
            {!albumFull && (
              <div className="flex items-center gap-2 shrink-0">
                {!nameConfirmed ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmName()}
                      placeholder="Vaše ime"
                      autoComplete="given-name"
                      className="w-36 sm:w-44 px-3 py-1.5 border rounded-xl text-sm outline-none transition-all"
                      style={{ borderColor: BRAND.border }}
                    />
                    <button
                      onClick={confirmName}
                      disabled={!uploaderName.trim()}
                      className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30 hover:opacity-90"
                      style={{ background: BRAND.dark }}
                    >
                      Naprej →
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5">
                      <AvatarBubble name={uploaderName} size={7} />
                      <button onClick={() => setNameConfirmed(false)} className="text-xs underline" style={{ color: BRAND.muted }}>{uploaderName}</button>
                    </div>
                    <label className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:opacity-90" style={{ background: BRAND.dark }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                      <span className="hidden sm:inline">Fotografiraj</span>
                      <input type="file" accept="image/*,video/*" capture="environment" multiple className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => { if (e.target.files?.length) { cameraFilesRef.current = e.target.files; setUploadOpen(true); } }} />
                    </label>
                    <button onClick={() => setUploadOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all hover:bg-gray-50"
                      style={{ borderColor: BRAND.border, color: BRAND.dark }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="hidden sm:inline">Naloži</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 2 — person filter chips (only if 2+ distinct uploaders) */}
          {uploaders.length >= 2 && (
            <div className="flex items-center gap-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {/* "Vsi" chip */}
              <button
                onClick={() => setPersonFilter(null)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                style={personFilter === null
                  ? { background: BRAND.dark, color: "white", borderColor: BRAND.dark }
                  : { background: "white", color: BRAND.muted, borderColor: BRAND.border }}
              >
                Vsi
              </button>

              {uploaders.map(name => {
                const active = personFilter === name;
                return (
                  <button
                    key={name}
                    onClick={() => setPersonFilter(active ? null : name)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                    style={active
                      ? { background: BRAND.accent, color: "white", borderColor: BRAND.accent }
                      : { background: "white", color: BRAND.dark, borderColor: BRAND.border }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center font-bold"
                      style={{
                        fontSize: "9px",
                        background: active ? "rgba(255,255,255,0.25)" : BRAND.accentLight,
                        color:      active ? "white"                  : BRAND.accent,
                      }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </span>
                    {name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          GALLERY
      ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">

        {/* Album full notice */}
        {albumFull && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-xl shrink-0">🔒</span>
            <div>
              <p className="font-semibold text-sm text-red-800">Galerija je polna</p>
              <p className="text-xs text-red-600 mt-0.5">Lastnik mora nadgraditi paket za nadaljevanje.</p>
            </div>
          </div>
        )}

        {/* Person filter active banner */}
        {personFilter && (
          <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: BRAND.accentLight, background: BRAND.accentLight }}>
            <AvatarBubble name={personFilter} size={6} />
            <span className="font-medium" style={{ color: BRAND.dark }}>
              Fotografije od: <strong>{personFilter}</strong>
            </span>
            <button
              onClick={() => setPersonFilter(null)}
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-lg transition-all hover:bg-white/60"
              style={{ color: BRAND.accent }}
            >
              Počisti ✕
            </button>
          </div>
        )}

        {/* Empty state */}
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="text-5xl mb-4 opacity-20">{filter === "videos" ? "🎥" : "📷"}</div>
            <p className="text-sm font-medium" style={{ color: BRAND.muted }}>
              {personFilter
                ? `${personFilter} nima ${filter === "videos" ? "videoposnetkov" : "fotografij"}`
                : filter === "videos" ? "Ni videoposnetkov"
                : filter === "photos" ? "Ni fotografij"
                : t.noPhotosDesc}
            </p>
          </div>
        ) : (
          <>
            {/* ── Videos section (in "all" view) ──────────────────────────── */}
            {filter === "all" && filteredVideos.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.muted }}>
                  Videi · {filteredVideos.length}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos.map(photo => <VideoCard key={photo.id} photo={photo} />)}
                </div>
              </div>
            )}

            {/* ── Videos-only view ────────────────────────────────────────── */}
            {filter === "videos" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map(photo => <VideoCard key={photo.id} photo={photo} />)}
              </div>
            )}

            {/* ── Photo masonry ────────────────────────────────────────────── */}
            {filter !== "videos" && filteredImages.length > 0 && (
              <div>
                {filter === "all" && (
                  <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.muted }}>
                    Fotografije · {filteredImages.length}
                  </h2>
                )}
                <div className="masonry-grid">
                  {filteredImages.map((photo) => (
                    <div
                      key={photo.id}
                      className="masonry-item group cursor-pointer"
                      onClick={() => setLightboxIndex(getLightboxIdx(photo))}
                    >
                      {/* Image */}
                      <div className="relative rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={bunnyDisplayUrl(photo.thumbnailUrl ?? photo.blobUrl, 800, 82)}
                          alt={photo.caption ?? ""}
                          className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = BROKEN_IMG_SRC;
                            e.currentTarget.style.minHeight = "120px";
                            e.currentTarget.style.objectFit = "none";
                            e.currentTarget.style.background = "#f3f4f6";
                          }}
                        />
                        {/* Subtle hover tint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      </div>

                      {/* Uploader + time — below image, not on it */}
                      <div className="flex items-center gap-1.5 px-1 pt-1.5 pb-0.5">
                        {photo.uploaderName && <AvatarBubble name={photo.uploaderName} size={5} />}
                        <div className="min-w-0">
                          {photo.uploaderName && (
                            <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: BRAND.dark }}>
                              {photo.uploaderName}
                            </p>
                          )}
                          <p className="text-[10px] leading-tight" style={{ color: BRAND.muted }}>
                            {formatUploadTime(photo.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t mt-8 py-6 text-center" style={{ borderColor: BRAND.border }}>
        <p className="text-xs" style={{ color: BRAND.muted }}>
          Guestcam · <a href="https://guestcam.si" className="hover:underline">guestcam.si</a>
        </p>
      </footer>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxSlides.length > 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[Download, Counter]}
          styles={{ container: { backgroundColor: "rgba(0,0,0,0.97)" } }}
        />
      )}

      {/* ── Upload modal ──────────────────────────────────────────────────── */}
      {uploadOpen && (
        <UploadModal
          albumSlug={album.slug}
          albumId={album.id}
          uploaderName={uploaderName}
          maxPhotos={album.maxPhotos}
          currentCount={album.photoCount}
          lang={lang}
          initialFiles={cameraFilesRef.current}
          onClose={() => { cameraFilesRef.current = null; setUploadOpen(false); }}
          onNameChange={(name) => setUploaderName(name)}
          onSuccess={() => { cameraFilesRef.current = null; setUploadOpen(false); router.refresh(); }}
        />
      )}
    </div>
  );
}

/* ── VideoCard ────────────────────────────────────────────────────────────── */
function VideoCard({ photo }: { photo: Photo }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 flex flex-col">
      {/* Video player */}
      {photo.cfStreamVideoId ? (
        <div style={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
            src={photo.blobUrl}
            style={{ border: "none", position: "absolute", top: 0, left: 0, height: "100%", width: "100%" }}
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
            allowFullScreen
          />
        </div>
      ) : (
        <video src={photo.blobUrl} controls playsInline preload="metadata" className="w-full h-auto block" style={{ maxHeight: "360px" }} />
      )}

      {/* Uploader + time */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-900">
        {photo.uploaderName && <AvatarBubble name={photo.uploaderName} size={6} />}
        <div className="min-w-0">
          {photo.uploaderName && (
            <p className="text-xs font-semibold text-gray-100 truncate">{photo.uploaderName}</p>
          )}
          <p className="text-[10px] text-gray-400">{formatUploadTime(photo.uploadedAt)}</p>
        </div>
      </div>
    </div>
  );
}
