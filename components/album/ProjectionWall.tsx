"use client";

/**
 * ProjectionWall — "Foto zid" live display designed for a projector or TV.
 *
 * Features:
 *  • Full-screen dark overlay with animated gradient blobs
 *  • Latest 13 photos/videos in a grid — newest photo featured (2×2)
 *  • Rose glow border + "NOVO" badge on the newest item
 *  • Staggered entrance animations
 *  • Uploader name + time on every tile
 *  • Live clock in header
 *  • Stats: photo count · video count · guest count
 *  • One-click browser fullscreen toggle
 *  • Keyboard Esc closes (when not in browser fullscreen)
 */

import { useState, useEffect, useRef } from "react";
import type { Album, Photo } from "@/lib/db/schema";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";

// First N tiles load eagerly (above-the-fold). Everything else gets
// loading="lazy" so the wall can host hundreds of photos without
// hammering the CDN on initial paint.
const EAGER_TILE_COUNT = 16;

/**
 * Rewrite a Bunny Stream embed URL to autoplay-muted-loop for the
 * projection wall. The url stored in `photo.blobUrl` looks like:
 *   https://iframe.mediadelivery.net/embed/<libId>/<videoId>?autoplay=false&loop=false&muted=false&preload=true&responsive=true
 * We need autoplay=true, loop=true, muted=true so the iframe plays
 * silently as a moving thumbnail. Falls back to returning the input
 * untouched if it's not a parseable URL.
 */
function buildStreamProjectionSrc(blobUrl: string): string {
  try {
    const u = new URL(blobUrl);
    u.searchParams.set("autoplay", "true");
    u.searchParams.set("loop",     "true");
    u.searchParams.set("muted",    "true");
    u.searchParams.set("preload",  "true");
    u.searchParams.set("responsive", "true");
    return u.toString();
  } catch {
    return blobUrl;
  }
}

function fmtTime(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "";
  const diff = Math.floor((Date.now() - dt.getTime()) / 60_000);
  if (diff < 1) return "Pravkar";
  if (diff < 60) return `${diff} min`;
  const hh = dt.getHours().toString().padStart(2, "0");
  const mm = dt.getMinutes().toString().padStart(2, "0");
  if (diff < 1440) return `Danes, ${hh}:${mm}`;
  return dt.toLocaleDateString("sl-SI", { day: "numeric", month: "short" }) + ` ${hh}:${mm}`;
}

function evtIcon(eventType: string): string {
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

interface Props {
  album: Album;
  photos: Photo[];
  onClose: () => void;
}

export function ProjectionWall({ album, photos, onClose }: Props) {
  const [now, setNow]   = useState(new Date());
  const [isFS, setIsFS] = useState(false);
  const rootRef         = useRef<HTMLDivElement>(null);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const h = () => setIsFS(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const toggleFS = async () => {
    try {
      if (!document.fullscreenElement) {
        await (rootRef.current ?? document.documentElement).requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {/* fullscreen not available */}
  };

  // Sort newest-first; show ALL items. The grid below is vertically
  // scrollable so even 200+ items work. Previously this was capped at
  // 13 — users couldn't see the rest of the gallery from the wall.
  const display = [...photos].sort((a, b) =>
    new Date(b.uploadedAt ?? 0).getTime() - new Date(a.uploadedAt ?? 0).getTime()
  );

  // Lightbox state — clicking a tile opens a full-screen view.
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const lightboxPhoto = lightboxIdx !== null ? display[lightboxIdx] : null;
  const closeLightbox = () => setLightboxIdx(null);
  const lightboxPrev = () => setLightboxIdx((i) =>
    i === null ? null : (i - 1 + display.length) % display.length,
  );
  const lightboxNext = () => setLightboxIdx((i) =>
    i === null ? null : (i + 1) % display.length,
  );

  // Keyboard nav for the lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
      if (e.key === "Escape")     closeLightbox();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIdx]);

  const photoCount     = photos.filter(p => !p.mimeType?.startsWith("video/")).length;
  const videoCount     = photos.filter(p =>  p.mimeType?.startsWith("video/")).length;
  const guestCount     = new Set(photos.map(p => p.uploaderName).filter(Boolean)).size;
  const timeStr        = now.toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" });
  const dateStr        = now.toLocaleDateString("sl-SI", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#06080f" }}
    >
      <style>{`
        @keyframes pwBlob1 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(50px,-40px) scale(1.25); }
        }
        @keyframes pwBlob2 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-40px,30px) scale(1.18); }
        }
        @keyframes pwBlob3 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(25px,50px) scale(1.12); }
        }
        @keyframes pwScan {
          from { transform: translateY(-4px); opacity: 0; }
          40%  { opacity: 1; }
          to   { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes pwIn {
          from { opacity: 0; transform: translateY(18px) scale(0.93); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes pwLiveDot {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.25; }
        }
        @keyframes pwBadge {
          0%  { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.15); }
          100%{ transform: scale(1);   opacity: 1; }
        }
      `}</style>

      {/* ── Animated background ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Colour blobs */}
        <div style={{
          position:"absolute", width:"600px", height:"600px", borderRadius:"50%",
          background:"rgba(255,201,77,0.10)",
          top:"-120px", left:"8%",
          animation:"pwBlob1 12s ease-in-out infinite alternate",
        }}/>
        <div style={{
          position:"absolute", width:"450px", height:"450px", borderRadius:"50%",
          background:"rgba(99,60,180,0.07)",
          bottom:"-60px", right:"12%",
          animation:"pwBlob2 15s ease-in-out infinite alternate",
        }}/>
        <div style={{
          position:"absolute", width:"320px", height:"320px", borderRadius:"50%",
          background:"rgba(255,201,77,0.05)",
          top:"45%", right:"4%",
          animation:"pwBlob3 9s ease-in-out infinite alternate",
        }}/>

        {/* Subtle scanning line */}
        <div style={{
          position:"absolute", left:0, right:0, height:"1px",
          background:"rgba(255,201,77,0.25)",
          animation:"pwScan 10s linear infinite",
        }}/>
      </div>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>

        {/* Left: event identity */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{evtIcon(album.eventType ?? "other")}</span>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight tracking-tight">{album.coupleName}</h1>
            <p className="text-white/35 text-xs mt-0.5">
              {album.weddingDate}{album.location ? ` · ${album.location}` : ""}
            </p>
          </div>
        </div>

        {/* Right: badges + controls */}
        <div className="flex items-center gap-5">

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4 text-white/40 text-sm tabular-nums">
            {photoCount > 0 && <span><strong className="text-white/70">{photoCount}</strong> foto</span>}
            {videoCount > 0 && <span><strong className="text-white/70">{videoCount}</strong> video</span>}
            {guestCount > 0 && <span><strong className="text-white/70">{guestCount}</strong> gostov</span>}
          </div>

          {/* LIVE badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background:"rgba(255,201,77,0.12)", border:"1px solid rgba(255,201,77,0.35)" }}>
            <span className="w-2 h-2 rounded-full shrink-0"
              style={{ background:"#C9820A", animation:"pwLiveDot 1.4s ease-in-out infinite" }}/>
            <span className="text-xs font-bold tracking-widest" style={{ color:"#C9820A" }}>V ŽIVO</span>
          </div>

          {/* Clock */}
          <div className="font-mono text-white/50 text-sm tabular-nums hidden md:block">
            {timeStr}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFS} title={isFS ? "Zapusti celozaslonski način" : "Celozaslonski način"}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-all">
            {isFS ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>

          {/* Close */}
          <button onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Photo grid ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-3" style={{ scrollbarGutter: "stable" }}>
        {display.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-5 opacity-15">📷</div>
            <p className="text-white/30 text-sm">Še ni fotografij. Povabite goste!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              // Fixed row height (rather than 1fr) so the grid grows to fit
              // every photo and the parent overflows / scrolls naturally
              // when there are more than ~16 tiles.
              gridAutoRows: "minmax(180px, 240px)",
              gap: "8px",
            }}
          >
            {display.map((photo, i) => {
              const isNewest      = i === 0;
              const isVideo       = photo.mimeType?.startsWith("video/") || !!photo.cfStreamVideoId;
              const isStreamVideo = !!photo.cfStreamVideoId;
              // For Bunny Stream videos the `blobUrl` is an iframe embed URL
              // (https://iframe.mediadelivery.net/embed/<lib>/<id>?…), NOT a
              // raw video file. Rendering it inside a <video src> just paints
              // a blank tile. Switch its query params to autoplay+loop+muted
              // and drop it into an <iframe> instead — same pattern the
              // public VideoCard uses, but tuned for a TV projection.
              const streamProjectionSrc = isStreamVideo
                ? buildStreamProjectionSrc(photo.blobUrl)
                : null;
              // Stagger animation only above the fold; below that we let
              // tiles snap in as the user scrolls — otherwise the cascade
              // makes scroll-jank visible.
              const animationDelay = i < EAGER_TILE_COUNT ? `${i * 0.055}s` : "0s";
              const loadingAttr: "eager" | "lazy" = i < EAGER_TILE_COUNT ? "eager" : "lazy";

              return (
                <div
                  key={photo.id}
                  onClick={() => setLightboxIdx(i)}
                  className="relative overflow-hidden rounded-xl bg-black/40 cursor-pointer group"
                  style={{
                    gridColumn: isNewest ? "span 2" : undefined,
                    gridRow:    isNewest ? "span 2" : undefined,
                    animation:  `pwIn 0.5s cubic-bezier(.4,0,.2,1) ${animationDelay} both`,
                  }}
                >
                  {/* Media */}
                  {isStreamVideo && streamProjectionSrc ? (
                    <iframe
                      src={streamProjectionSrc}
                      className="absolute inset-0 w-full h-full"
                      style={{ border: "none", pointerEvents: "none" }}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      title={photo.caption ?? "Video"}
                      loading={loadingAttr}
                    />
                  ) : isVideo ? (
                    <video
                      src={photo.blobUrl}
                      muted loop autoPlay playsInline
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      preload={i < EAGER_TILE_COUNT ? "auto" : "metadata"}
                    />
                  ) : (
                    <img
                      src={bunnyDisplayUrl(photo.thumbnailUrl ?? photo.blobUrl, isNewest ? 1200 : 600, 82)}
                      alt={photo.caption ?? ""}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading={loadingAttr}
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.onerror = null;
                        t.style.display = "none";
                      }}
                    />
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, transparent 100%)"
                  }}/>

                  {/* Uploader strip */}
                  <div className="absolute bottom-0 inset-x-0 flex items-center gap-2 px-3 py-2.5">
                    {photo.uploaderName && (
                      <div
                        className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
                        style={{
                          width:      isNewest ? "28px" : "20px",
                          height:     isNewest ? "28px" : "20px",
                          fontSize:   isNewest ? "11px" : "8px",
                          background: "#FFC94D",
                        }}
                      >
                        {photo.uploaderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {photo.uploaderName && (
                        <p className="text-white font-semibold truncate leading-tight"
                          style={{ fontSize: isNewest ? "14px" : "10px", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
                          {photo.uploaderName}
                        </p>
                      )}
                      <p className="text-white/50 leading-tight" style={{ fontSize: isNewest ? "11px" : "9px" }}>
                        {fmtTime(photo.uploadedAt)}
                      </p>
                    </div>

                    {/* "NOVO" badge on newest */}
                    {isNewest && (
                      <div
                        className="shrink-0 px-2.5 py-1 rounded-full text-white text-[11px] font-bold tracking-wide"
                        style={{
                          background: "#FFC94D",
                          animation: "pwBadge 0.4s cubic-bezier(.4,0,.2,1) 0.3s both",
                        }}
                      >
                        NOVO ✨
                      </div>
                    )}
                  </div>

                  {/* Glow border for newest */}
                  {isNewest && (
                    <div className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ border: "2px solid rgba(255,201,77,0.7)" }}/>
                  )}

                  {/* Subtle inner border for all others */}
                  {!isNewest && (
                    <div className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ border: "1px solid rgba(255,255,255,0.05)" }}/>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 flex items-center justify-between px-6 py-2.5 shrink-0 text-xs"
        style={{ borderTop:"1px solid rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.2)" }}>
        <span>Guestcam · guestcam.si</span>
        <span className="capitalize">{dateStr}</span>
      </footer>

      {/* ── Lightbox ────────────────────────────────────────────────────────── */}
      {lightboxPhoto && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            aria-label="Zapri"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Position indicator */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">
            {lightboxIdx + 1} / {display.length}
          </div>

          {/* Prev / Next */}
          {display.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                aria-label="Prejšnja"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                aria-label="Naslednja"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* The media itself */}
          <div className="relative max-w-[92vw] max-h-[88vh] w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {lightboxPhoto.cfStreamVideoId ? (
              <div className="w-full max-w-[88vw]" style={{ aspectRatio: "16/9" }}>
                <iframe
                  src={lightboxPhoto.blobUrl}
                  className="w-full h-full rounded-2xl"
                  style={{ border: "none" }}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  title={lightboxPhoto.caption ?? "Video"}
                  allowFullScreen
                />
              </div>
            ) : lightboxPhoto.mimeType?.startsWith("video/") ? (
              <video
                src={lightboxPhoto.blobUrl}
                controls
                autoPlay
                playsInline
                className="max-w-[92vw] max-h-[80vh] rounded-2xl"
              />
            ) : (
              <img
                src={bunnyDisplayUrl(lightboxPhoto.thumbnailUrl ?? lightboxPhoto.blobUrl, 2000, 90)}
                alt={lightboxPhoto.caption ?? ""}
                className="max-w-[92vw] max-h-[80vh] object-contain rounded-2xl"
              />
            )}
            {/* Uploader + time */}
            {(lightboxPhoto.uploaderName || lightboxPhoto.uploadedAt) && (
              <div className="mt-4 flex items-center gap-3 text-white">
                {lightboxPhoto.uploaderName && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[#0F1729]"
                    style={{ background: "#FFC94D" }}
                  >
                    {lightboxPhoto.uploaderName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  {lightboxPhoto.uploaderName && (
                    <p className="text-sm font-semibold">{lightboxPhoto.uploaderName}</p>
                  )}
                  <p className="text-xs text-white/50">{fmtTime(lightboxPhoto.uploadedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
