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

interface EventTheme {
  gradient: string;
  accent: string;
  accentHover: string;
  pageBg: string;
  liveColor: string;
  inputFocus: string;
  greeting: string;
}

function getEventTheme(eventType: string): EventTheme {
  switch (eventType) {
    case "wedding":
      return { gradient: "linear-gradient(135deg,#C9A96E,#C4738A)", accent: "#C9A96E", accentHover: "#b8874a", pageBg: "#FFFBF7", liveColor: "#C9A96E", inputFocus: "focus:border-[#C9A96E]", greeting: "Dobrodošli! 💍" };
    case "birthday":
      return { gradient: "linear-gradient(135deg,#7C3AED,#F59E0B)", accent: "#7C3AED", accentHover: "#6D28D9", pageBg: "#FAFAFF", liveColor: "#7C3AED", inputFocus: "focus:border-[#7C3AED]", greeting: "Dobrodošli! 🎂" };
    case "anniversary":
      return { gradient: "linear-gradient(135deg,#1E3A5F,#D4A574)", accent: "#D4A574", accentHover: "#b8874a", pageBg: "#F8F5EF", liveColor: "#D4A574", inputFocus: "focus:border-[#D4A574]", greeting: "Dobrodošli! 🥂" };
    case "party":
      return { gradient: "linear-gradient(135deg,#EC4899,#8B5CF6)", accent: "#EC4899", accentHover: "#DB2777", pageBg: "#FFF5F9", liveColor: "#EC4899", inputFocus: "focus:border-[#EC4899]", greeting: "Dobrodošli! 🎉" };
    case "baptism":
      return { gradient: "linear-gradient(135deg,#0EA5E9,#38BDF8)", accent: "#0EA5E9", accentHover: "#0284C7", pageBg: "#F0F9FF", liveColor: "#0EA5E9", inputFocus: "focus:border-[#0EA5E9]", greeting: "Dobrodošli! 🕊️" };
    case "graduation":
      return { gradient: "linear-gradient(135deg,#1E40AF,#F59E0B)", accent: "#1E40AF", accentHover: "#1E3A8A", pageBg: "#EFF6FF", liveColor: "#1E40AF", inputFocus: "focus:border-[#1E40AF]", greeting: "Dobrodošli! 🎓" };
    default:
      return { gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)", accent: "#6366F1", accentHover: "#4F46E5", pageBg: "#F5F5FF", liveColor: "#6366F1", inputFocus: "focus:border-indigo-500", greeting: "Dobrodošli! 👋" };
  }
}

const BROKEN_IMG_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1.5'%3E%3Crect x='2' y='7' width='20' height='14' rx='3'/%3E%3Ccircle cx='12' cy='14' r='3'/%3E%3Cpath d='M8 7V5a2 2 0 0 1 4 0v2'/%3E%3C/svg%3E";

export function AlbumGuestView({ album, photos, passwordRequired, passwordCorrect, providedPassword: _pw, initialLang }: Props) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [showNameSheet, setShowNameSheet] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cameraFilesRef = useRef<FileList | null>(null);

  const t = translations[lang];
  const theme = getEventTheme(album.eventType ?? "other");
  const evtIcon = eventIcon(album.eventType ?? "other");
  const albumFull = album.plan === "free" && photos.length >= (album.maxPhotos ?? 20);

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
    setShowNameSheet(false);
  };

  const handleUploadTap = (withCamera = false) => {
    if (!nameConfirmed) {
      setShowNameSheet(true);
      setTimeout(() => nameInputRef.current?.focus(), 80);
      return;
    }
    if (withCamera) {
      // Will be handled by the file input
      return;
    }
    setUploadOpen(true);
  };

  // ── Password gate ─────────────────────────────────────────────────────────
  if (passwordRequired && !passwordCorrect) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: theme.pageBg }}>
        {/* Gradient top bar */}
        <div className="fixed top-0 inset-x-0 h-1" style={{ background: theme.gradient }} />

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{evtIcon}</div>
            <h1 className="text-3xl font-bold text-gray-900">{album.coupleName}</h1>
            <p className="text-sm text-gray-400 mt-1">{album.weddingDate}{album.location ? ` · ${album.location}` : ""}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
            <div className="h-1 w-full" style={{ background: theme.gradient }} />
            <div className="p-7">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: theme.accent + "15" }}>
                <svg className="w-7 h-7" style={{ color: theme.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <p className="text-center text-sm text-gray-500 mb-5">{t.passwordProtected}</p>
              <form onSubmit={(e) => { e.preventDefault(); if (pwInput) { const url = new URL(window.location.href); url.searchParams.set("pw", pwInput); url.searchParams.set("lang", lang); router.push(url.pathname + url.search); } }}>
                <input
                  type="password"
                  value={pwInput}
                  onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                  placeholder={t.passwordPlaceholder}
                  className={`w-full px-4 py-3.5 border-2 border-gray-100 rounded-2xl bg-gray-50 text-sm text-gray-900 placeholder:text-gray-300 outline-none ${theme.inputFocus} focus:bg-white transition-all mb-3`}
                />
                {pwError && <p className="text-xs text-red-500 mb-3">{t.wrongPassword}</p>}
                <button type="submit" className="w-full py-3.5 text-white font-bold rounded-2xl transition-all active:scale-[0.98]" style={{ background: theme.gradient }}>
                  {t.openAlbum}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lightboxSlides = photos
    .filter((p) => !p.mimeType?.startsWith("video/"))
    .map((p) => ({
      src: bunnyDisplayUrl(p.blobUrl, 2400, 90),
      width: p.width ?? 2400,
      height: p.height ?? 1600,
      download: { url: bunnyOriginalUrl(p.blobUrl), filename: p.originalFilename ?? "photo.jpg" },
      description: p.caption ?? undefined,
    }));

  return (
    <div className="min-h-screen" style={{ background: theme.pageBg }}>

      {/* ── Sticky top bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between px-4 h-13 max-w-screen-2xl mx-auto" style={{ height: "52px" }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg leading-none shrink-0">{evtIcon}</span>
            <span className="font-bold text-sm text-gray-900 truncate">{album.coupleName}</span>
            {photos.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: theme.liveColor }} />
                <span className="text-xs font-medium" style={{ color: theme.liveColor }}>V živo</span>
              </div>
            )}
          </div>
          {/* Lang switcher */}
          <div className="flex items-center gap-0.5">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => switchLang(l.code)} title={l.native}
                className="px-1.5 py-1 rounded-lg text-sm transition-all"
                style={lang === l.code ? { background: theme.accent + "20" } : {}}
              >
                {l.flag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero section ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Gradient accent strip */}
        <div className="h-1 w-full" style={{ background: theme.gradient }} />

        {album.coverImageUrl ? (
          <div className="relative h-64 sm:h-80 lg:h-96">
            <Image src={album.coverImageUrl} alt={album.coupleName} fill className="object-cover" priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
            <div className="absolute bottom-0 inset-x-0 p-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">{album.coupleName}</h1>
              <p className="text-sm text-white/70">{album.weddingDate}{album.location ? ` · ${album.location}` : ""}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-white/60">{t.photos(photos.length)}</span>
                <CountdownTimer targetDate={album.weddingDate} translations={t} />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-8 text-center relative" style={{ background: `${theme.accent}08` }}>
            <div className="text-5xl mb-3 leading-none">{evtIcon}</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{album.coupleName}</h1>
            <p className="text-sm text-gray-400">{album.weddingDate}{album.location ? ` · ${album.location}` : ""}</p>
            <div className="flex items-center justify-center gap-5 mt-4">
              <span className="text-xs text-gray-400">{t.photos(photos.length)}</span>
              <CountdownTimer targetDate={album.weddingDate} translations={t} />
              {photos.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse sm:hidden" style={{ background: theme.liveColor }} />
                  <span className="text-xs font-medium sm:hidden" style={{ color: theme.liveColor }}>V živo</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Album full notice ───────────────────────────────────────────────── */}
      {albumFull && (
        <div className="mx-4 my-4 rounded-2xl overflow-hidden" style={{ border: "1px solid #FCA5A5", background: "#FFF5F5" }}>
          <div className="h-1" style={{ background: "linear-gradient(90deg,#F87171,#EF4444)" }} />
          <div className="px-5 py-4 text-center">
            <div className="text-2xl mb-1">🔒</div>
            <p className="font-bold text-sm text-gray-800">Galerija je polna</p>
            <p className="text-xs text-gray-500 mt-1">Lastnik mora nadgraditi paket za nadaljevanje.</p>
          </div>
        </div>
      )}

      {/* ── Gallery ─────────────────────────────────────────────────────────── */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="text-5xl mb-4 opacity-30">{evtIcon}</div>
          <p className="text-sm text-gray-400">{t.noPhotosDesc}</p>
        </div>
      ) : (
        <div className="px-1.5 pt-3 pb-32">
          {/* Live label */}
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="flex-1 h-px" style={{ background: `${theme.accent}30` }} />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.liveColor }} />
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.liveColor }}>Zadnji spomini</span>
            </div>
            <div className="flex-1 h-px" style={{ background: `${theme.accent}30` }} />
          </div>

          <div className="masonry-grid">
            {photos.map((photo, index) => {
              const isVideo = photo.mimeType?.startsWith("video/") ?? false;
              const lightboxIdx = photos.slice(0, index + 1).filter((p) => !p.mimeType?.startsWith("video/")).length - 1;

              return (
                <div key={photo.id} className="masonry-item group rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                  {isVideo ? (
                    <div className="relative bg-black rounded-2xl overflow-hidden">
                      {photo.cfStreamVideoId ? (
                        <div style={{ position: "relative", paddingTop: "56.25%" }}>
                          <iframe src={photo.blobUrl} style={{ border: "none", position: "absolute", top: 0, left: 0, height: "100%", width: "100%" }} allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" allowFullScreen />
                        </div>
                      ) : (
                        <video src={photo.blobUrl} controls playsInline preload="metadata" className="w-full h-auto block max-h-80 object-contain" style={{ background: "#111" }} />
                      )}
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5 pointer-events-none z-10">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        <span className="text-white text-[10px] font-medium">Video</span>
                      </div>
                      {photo.uploaderName && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 pointer-events-none z-10">
                          <p className="text-white text-xs truncate">{photo.uploaderName}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative cursor-pointer" onClick={() => setLightboxIndex(lightboxIdx)}>
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
                      {/* Hover overlay with uploader name */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end rounded-2xl">
                        {photo.uploaderName && (
                          <p className="text-xs text-white/90 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity font-medium truncate w-full">
                            {photo.uploaderName}
                          </p>
                        )}
                      </div>
                      {/* Tap hint on mobile */}
                      <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="text-center pb-36 pt-2">
        <p className="text-xs text-gray-300">
          Guestcam · <a href="https://guestcam.si" className="hover:text-gray-500 transition-colors">guestcam.si</a>
        </p>
      </footer>

      {/* ── Fixed bottom upload bar ──────────────────────────────────────────── */}
      {!albumFull && (
        <div
          className="fixed bottom-0 inset-x-0 z-20 px-4 pb-safe"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            paddingBottom: "max(16px, env(safe-area-inset-bottom))",
            paddingTop: "12px",
          }}
        >
          {!nameConfirmed ? (
            /* Single CTA before name */
            <button
              onClick={() => handleUploadTap()}
              className="w-full py-3.5 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: theme.gradient }}
            >
              <span className="text-lg leading-none">📸</span>
              Dodaj spomine
            </button>
          ) : (
            /* Two upload buttons after name confirmed */
            <div className="flex gap-3">
              <label className="relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] text-white font-bold text-sm" style={{ background: "#111" }}>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Fotografiraj
                <input type="file" accept="image/*,video/*" capture="environment" multiple className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => { if (e.target.files?.length) { cameraFilesRef.current = e.target.files; setUploadOpen(true); } }} />
              </label>

              <button
                onClick={() => setUploadOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all active:scale-[0.98]"
                style={{ borderColor: theme.accent, color: theme.accent, background: theme.accent + "10" }}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Iz galerije
              </button>
            </div>
          )}

          {/* Name hint */}
          {nameConfirmed && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: theme.accent }}>
                {uploaderName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-500">{uploaderName}</span>
              <button onClick={() => { setNameConfirmed(false); }} className="text-[10px] text-gray-400 underline ml-1">Spremeni</button>
            </div>
          )}
        </div>
      )}

      {/* ── Name entry bottom sheet ──────────────────────────────────────────── */}
      {showNameSheet && (
        <div className="fixed inset-0 z-40 flex items-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: "blur(4px)" }} onClick={() => setShowNameSheet(false)} />
          {/* Sheet */}
          <div className="relative w-full rounded-t-3xl overflow-hidden" style={{ background: "white" }}>
            <div className="h-1 w-full" style={{ background: theme.gradient }} />
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="px-6 pt-3 pb-8" style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}>
              <div className="text-2xl text-center mb-1">{evtIcon}</div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-1">{theme.greeting}</h2>
              <p className="text-sm text-gray-400 text-center mb-6">Vnesite ime preden naložite fotografije</p>

              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vaše ime</label>
              <input
                ref={nameInputRef}
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmName()}
                placeholder="npr. Ana Novak"
                autoComplete="given-name"
                className={`w-full px-4 py-4 border-2 border-gray-100 rounded-2xl bg-gray-50 text-base text-gray-900 placeholder:text-gray-300 outline-none ${theme.inputFocus} focus:bg-white transition-all mb-4`}
              />

              <button
                onClick={confirmName}
                disabled={!uploaderName.trim()}
                className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all disabled:opacity-30 active:scale-[0.98]"
                style={{ background: theme.gradient }}
              >
                Naprej →
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Ime bo prikazano ob vaših fotografijah</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      {photos.length > 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[Download, Counter]}
          styles={{ container: { backgroundColor: "rgba(0,0,0,0.97)" } }}
        />
      )}

      {/* ── Upload modal ──────────────────────────────────────────────────────── */}
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
