"use client";

/**
 * Slideshow — fullscreen auto-advancing photo slideshow.
 *
 * Features:
 *  • Crossfade + subtle Ken-Burns effect between slides
 *  • Blurred current photo fills the letterbox background
 *  • Progress bar counts down to next slide
 *  • Play / Pause · Prev / Next · Close controls
 *  • Keyboard: Space / → = next, ← = prev, Esc = close, P = play/pause
 *  • Swipe left/right on touch screens
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { Photo } from "@/lib/db/schema";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";

const SLIDE_MS = 5_000;

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

interface Props {
  photos: Photo[];
  startIndex?: number;
  onClose: () => void;
}

export function Slideshow({ photos, startIndex = 0, onClose }: Props) {
  const images = photos.filter(p => !p.mimeType?.startsWith("video/"));
  const [idx, setIdx]         = useState(Math.min(startIndex, Math.max(0, images.length - 1)));
  const [playing, setPlaying] = useState(true);
  const [imgKey, setImgKey]   = useState(0); // changes → restarts CSS animation
  const touchX = useRef(0);

  const photo = images[idx];

  const go = useCallback((n: number) => {
    setIdx(n);
    setImgKey(k => k + 1);
  }, []);

  const prev = useCallback(() => go((idx - 1 + images.length) % images.length), [go, idx, images.length]);
  const next = useCallback(() => go((idx + 1) % images.length), [go, idx, images.length]);

  // Auto-advance
  useEffect(() => {
    if (!playing || images.length <= 1) return;
    const id = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(id);
  }, [playing, next, idx, images.length]);

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape")                         { onClose(); return; }
      if (e.key === "ArrowRight" || e.key === " ")    { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft")                      { e.preventDefault(); prev(); }
      if (e.key.toLowerCase() === "p")                setPlaying(v => !v);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev, onClose]);

  if (images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none">
      <style>{`
        @keyframes ssIn {
          from { opacity: 0; transform: scale(1.06); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ssProg {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      {/* ── Image area ─────────────────────────────────────────────────────── */}
      <div
        className="relative flex-1 overflow-hidden"
        onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) dx > 0 ? prev() : next();
        }}
      >
        {/* Blurred ambient background */}
        <img
          src={bunnyDisplayUrl(photo.thumbnailUrl ?? photo.blobUrl, 400, 30)}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ filter: "blur(28px)", opacity: 0.22 }}
        />

        {/* Main slide image */}
        <img
          key={imgKey}
          src={bunnyDisplayUrl(photo.blobUrl, 2400, 90)}
          alt={photo.caption ?? ""}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ animation: "ssIn 0.55s cubic-bezier(.4,0,.2,1) forwards" }}
        />

        {/* Caption */}
        {photo.caption && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-sm text-center bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl text-white text-sm leading-snug">
            {photo.caption}
          </div>
        )}

        {/* Prev / Next transparent click zones (fade in on hover) */}
        <button onClick={prev} aria-label="Prejšnja"
          className="absolute left-0 inset-y-0 w-24 sm:w-36 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 group">
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-extralight group-hover:bg-black/65 transition-all">
            ‹
          </div>
        </button>
        <button onClick={next} aria-label="Naslednja"
          className="absolute right-0 inset-y-0 w-24 sm:w-36 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 group">
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-extralight group-hover:bg-black/65 transition-all">
            ›
          </div>
        </button>

        {/* ── Top chrome ─────────────────────────────────────────────────── */}
        <div className="absolute top-0 inset-x-0 flex items-start justify-between px-4 pt-4 pointer-events-none">
          {/* Counter */}
          <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/70 text-xs font-medium tabular-nums pointer-events-auto">
            {idx + 1} / {images.length}
          </div>
          {/* Close */}
          <button onClick={onClose}
            className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-all text-lg">
            ✕
          </button>
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────────── */}
      <div className="h-[3px] bg-white/10" style={{ transformOrigin: "left" }}>
        {playing && images.length > 1 && (
          <div
            key={imgKey}
            className="h-full"
            style={{
              background: "#FFC94D",
              transformOrigin: "left",
              animation: `ssProg ${SLIDE_MS}ms linear forwards`,
            }}
          />
        )}
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-950/95 backdrop-blur-sm flex items-center gap-4 px-5 py-3">
        {/* Uploader info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {photo.uploaderName && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "#FFC94D" }}>
              {photo.uploaderName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            {photo.uploaderName && (
              <p className="text-white text-sm font-semibold truncate leading-tight">{photo.uploaderName}</p>
            )}
            <p className="text-white/40 text-[11px] leading-tight">{fmtTime(photo.uploadedAt)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={prev} aria-label="Prejšnja"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button onClick={() => setPlaying(v => !v)} aria-label={playing ? "Pavza" : "Predvajaj"}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
            style={{ background: "rgba(255,201,77,0.25)", border: "1px solid rgba(255,201,77,0.4)" }}>
            {playing ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button onClick={next} aria-label="Naslednja"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Speed hint */}
        <p className="hidden sm:block text-white/20 text-xs shrink-0">
          ← → ali prelistajte
        </p>
      </div>
    </div>
  );
}
