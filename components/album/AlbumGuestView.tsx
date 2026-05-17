"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import { UploadModal } from "./UploadModal";
import { CountdownTimer } from "./CountdownTimer";
import { Slideshow } from "./Slideshow";
import { ProjectionWall } from "./ProjectionWall";
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

interface CommentItem {
  id: string;
  uploaderName: string;
  body: string;
  createdAt: string;
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
  const [slideshowOpen, setSlideshowOpen]     = useState(false);
  const [slideshowIdx, setSlideshowIdx]       = useState(0);
  const [projectionOpen, setProjectionOpen]   = useState(false);
  const [filmClips, setFilmClips]             = useState<{ videoUrl: string; sortOrder: number }[]>([]);
  const [filmPlayerOpen, setFilmPlayerOpen]   = useState(false);
  const [filmClipIdx, setFilmClipIdx]         = useState(0);

  // ── Reactions ─────────────────────────────────────────────────────────────
  const [likeCounts, setLikeCounts]             = useState<Record<string, number>>({});
  const [myLikes, setMyLikes]                   = useState<Set<string>>(new Set());
  const [commentMap, setCommentMap]             = useState<Record<string, CommentItem[]>>({});
  const [openCommentsPhoto, setOpenCommentsPhoto] = useState<string | null>(null); // photoId
  const [commentInput, setCommentInput]         = useState("");
  const [commentPosting, setCommentPosting]     = useState(false);
  const [turnstileToken, setTurnstileToken]     = useState<string | null>(null);

  const nameInputRef  = useRef<HTMLInputElement>(null);
  const cameraFilesRef = useRef<FileList | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const t       = translations[lang];
  const evtIcon = eventIcon(album.eventType ?? "other");
  const albumFull = album.plan === "free" && photos.length >= (album.maxPhotos ?? 20);

  // ── Load reactions + restore myLikes from localStorage ────────────────────
  useEffect(() => {
    // Restore persisted likes for this album
    try {
      const stored = localStorage.getItem(`likes-${album.slug}`);
      if (stored) setMyLikes(new Set(JSON.parse(stored) as string[]));
    } catch { /* ignore */ }

    fetch(`/api/albums/${album.slug}/reactions`)
      .then(r => r.json())
      .then((data: { likes: Record<string, number>; comments: Record<string, CommentItem[]> }) => {
        setLikeCounts(data.likes ?? {});
        setCommentMap(data.comments ?? {});
      })
      .catch(() => { /* non-fatal */ });
  }, [album.slug]);

  // ── Load completed film clips ─────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/albums/${album.slug}/film/status`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { generation: { status: string } | null; clips: { status: string; videoUrl: string | null; sortOrder: number }[] } | null) => {
        if (data?.generation?.status === "complete") {
          const done = data.clips
            .filter(c => c.status === "done" && c.videoUrl)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(c => ({ videoUrl: c.videoUrl!, sortOrder: c.sortOrder }));
          setFilmClips(done);
        }
      })
      .catch(() => { /* non-fatal */ });
  }, [album.slug]);

  // ── Cloudflare Turnstile ──────────────────────────────────────────────────
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY;
    if (!siteKey || !openCommentsPhoto || !nameConfirmed || !turnstileContainerRef.current) return;

    const container = turnstileContainerRef.current;
    setTurnstileToken(null);

    const render = () => {
      if (!container || !(window as { turnstile?: { render: (el: HTMLElement, opts: object) => void } }).turnstile) return;
      (window as { turnstile?: { render: (el: HTMLElement, opts: object) => void } }).turnstile!.render(container, {
        sitekey: siteKey,
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(null),
        "error-callback": () => setTurnstileToken(null),
        size: "invisible",
        appearance: "interaction-only",
      });
    };

    // If script already loaded, render immediately
    if ((window as { turnstile?: unknown }).turnstile) {
      render();
    } else {
      // Load script once
      if (!document.getElementById("cf-turnstile-script")) {
        const script = document.createElement("script");
        script.id = "cf-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.onload = render;
        document.head.appendChild(script);
      } else {
        // Script loading, wait
        const check = setInterval(() => {
          if ((window as { turnstile?: unknown }).turnstile) {
            clearInterval(check);
            render();
          }
        }, 100);
        return () => clearInterval(check);
      }
    }
  }, [openCommentsPhoto, nameConfirmed]);

  // ── Like toggle ───────────────────────────────────────────────────────────
  const toggleLike = useCallback((photoId: string) => {
    if (!uploaderName.trim()) return; // need a name first
    const alreadyLiked = myLikes.has(photoId);
    const action = alreadyLiked ? "unlike" : "like";

    // Optimistic update
    setMyLikes(prev => {
      const next = new Set(prev);
      alreadyLiked ? next.delete(photoId) : next.add(photoId);
      try { localStorage.setItem(`likes-${album.slug}`, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
    setLikeCounts(prev => ({
      ...prev,
      [photoId]: Math.max(0, (prev[photoId] ?? 0) + (alreadyLiked ? -1 : 1)),
    }));

    // Sync to server (fire-and-forget; reconcile on failure)
    fetch(`/api/albums/${album.slug}/photos/${photoId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploaderName: uploaderName.trim(), action }),
    })
      .then(r => r.json())
      .then((d: { count: number }) => {
        setLikeCounts(prev => ({ ...prev, [photoId]: d.count }));
      })
      .catch(() => {
        // Roll back optimistic update on error
        setMyLikes(prev => {
          const next = new Set(prev);
          alreadyLiked ? next.add(photoId) : next.delete(photoId);
          return next;
        });
        setLikeCounts(prev => ({
          ...prev,
          [photoId]: Math.max(0, (prev[photoId] ?? 0) + (alreadyLiked ? 1 : -1)),
        }));
      });
  }, [uploaderName, myLikes, album.slug]);

  // ── Post comment ─────────────────────────────────────────────────────────
  const postComment = useCallback(async () => {
    if (!openCommentsPhoto || !commentInput.trim() || !uploaderName.trim()) return;
    setCommentPosting(true);
    try {
      const res = await fetch(
        `/api/albums/${album.slug}/photos/${openCommentsPhoto}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploaderName: uploaderName.trim(), body: commentInput.trim(), turnstileToken: turnstileToken ?? undefined }),
        }
      );
      if (res.ok) {
        const newComment: CommentItem = await res.json();
        setCommentMap(prev => ({
          ...prev,
          [openCommentsPhoto]: [...(prev[openCommentsPhoto] ?? []), newComment],
        }));
        setCommentInput("");
      }
    } finally {
      setCommentPosting(false);
    }
  }, [openCommentsPhoto, commentInput, uploaderName, album.slug]);

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
                { id: "all",    label: "Vse",    labelMd: "Vse",          count: photos.length },
                { id: "photos", label: "Foto",   labelMd: "Fotografije",  count: photoCount },
                { id: "videos", label: "Video",  labelMd: "Videi",        count: videoCount },
              ] as { id: FilterTab; label: string; labelMd: string; count: number }[]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={filter === tab.id
                    ? { background: "white", color: BRAND.dark, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                    : { color: BRAND.muted }
                  }
                >
                  <span className="sm:hidden">{tab.label}</span>
                  <span className="hidden sm:inline">{tab.labelMd}</span>
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

            {/* Presentation buttons */}
            {photoCount > 0 && (
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setSlideshowIdx(0); setSlideshowOpen(true); }}
                  title="Diaprojekcija"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                  style={{ color: BRAND.muted }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                  </svg>
                  <span className="hidden lg:inline">Diapozitivi</span>
                </button>
                <button
                  onClick={() => setProjectionOpen(true)}
                  title="Foto zid (projekcija)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                  style={{ color: BRAND.muted }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  <span className="hidden lg:inline">Foto zid</span>
                </button>
                {filmClips.length > 0 && (
                  <button
                    onClick={() => { setFilmClipIdx(0); setFilmPlayerOpen(true); }}
                    title="Highlights film"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                    style={{ color: BRAND.muted }}
                  >
                    <span>🎬</span>
                    <span className="hidden lg:inline">Film</span>
                  </button>
                )}
              </div>
            )}

            {/* Upload section */}
            {!albumFull && (
              <div className="flex items-center gap-2 shrink-0">
                {!nameConfirmed ? (
                  <>
                    {/* Desktop: name input inline in toolbar */}
                    <div className="hidden sm:flex items-center gap-2">
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
                    {/* Mobile: pill that scrolls down to the big CTA */}
                    <button
                      onClick={() => document.getElementById("upload-cta")?.scrollIntoView({ behavior: "smooth" })}
                      className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: BRAND.accent }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Naloži
                    </button>
                  </>
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
          personFilter || filter !== "all" ? (
            /* Filtered empty — simple message */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="text-5xl mb-4 opacity-20">{filter === "videos" ? "🎥" : "📷"}</div>
              <p className="text-sm font-medium" style={{ color: BRAND.muted }}>
                {personFilter
                  ? `${personFilter} nima ${filter === "videos" ? "videoposnetkov" : "fotografij"}`
                  : filter === "videos" ? "Ni videoposnetkov"
                  : "Ni fotografij"}
              </p>
            </div>
          ) : !albumFull ? (
            /* Album is empty — big upload CTA */
            <div id="upload-cta" className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 text-4xl"
                style={{ background: BRAND.accentLight }}>
                📷
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: BRAND.dark }}>
                Bodi prvi, ki deli fotografijo!
              </h2>
              <p className="text-sm mb-8 max-w-xs" style={{ color: BRAND.muted }}>
                {t.noPhotosDesc}
              </p>
              {!nameConfirmed ? (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                  <input
                    type="text"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmName()}
                    placeholder="Vaše ime"
                    autoComplete="given-name"
                    className="w-full px-4 py-3 border rounded-2xl text-sm outline-none transition-all text-center"
                    style={{ borderColor: BRAND.border }}
                  />
                  <button
                    onClick={confirmName}
                    disabled={!uploaderName.trim()}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-30 hover:opacity-90 shrink-0"
                    style={{ background: BRAND.dark }}
                  >
                    Naprej →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white cursor-pointer transition-all hover:opacity-90 relative"
                    style={{ background: BRAND.accent }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                    Fotografiraj
                    <input type="file" accept="image/*,video/*" capture="environment" multiple className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => { if (e.target.files?.length) { cameraFilesRef.current = e.target.files; setUploadOpen(true); } }} />
                  </label>
                  <button
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all hover:bg-gray-50"
                    style={{ borderColor: BRAND.border, color: BRAND.dark }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Naloži iz galerije
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Album full */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="text-5xl mb-4">🔒</div>
              <p className="text-sm font-medium" style={{ color: BRAND.muted }}>{t.noPhotosDesc}</p>
            </div>
          )
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

                      {/* Uploader + time + reactions — below image */}
                      <div className="flex items-center gap-1.5 px-1 pt-1.5 pb-0.5">
                        {photo.uploaderName && <AvatarBubble name={photo.uploaderName} size={5} />}
                        <div className="min-w-0 flex-1">
                          {photo.uploaderName && (
                            <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: BRAND.dark }}>
                              {photo.uploaderName}
                            </p>
                          )}
                          <p className="text-[10px] leading-tight" style={{ color: BRAND.muted }}>
                            {formatUploadTime(photo.uploadedAt)}
                          </p>
                        </div>
                        {/* Like button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                          title={myLikes.has(photo.id) ? "Odstrani všeček" : "Všečkaj"}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold transition-all shrink-0"
                          style={myLikes.has(photo.id)
                            ? { background: "#FEF2F4", color: BRAND.accent }
                            : { background: "transparent", color: BRAND.muted }}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill={myLikes.has(photo.id) ? BRAND.accent : "none"} stroke={myLikes.has(photo.id) ? BRAND.accent : "currentColor"} strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                          {(likeCounts[photo.id] ?? 0) > 0 && (
                            <span>{likeCounts[photo.id]}</span>
                          )}
                        </button>
                        {/* Comment button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenCommentsPhoto(photo.id); setCommentInput(""); }}
                          title="Komentarji"
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold transition-all shrink-0"
                          style={{ background: "transparent", color: BRAND.muted }}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                          </svg>
                          {(commentMap[photo.id]?.length ?? 0) > 0 && (
                            <span>{commentMap[photo.id].length}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Mobile floating upload FAB ────────────────────────────────────── */}
      {!albumFull && nameConfirmed && photos.length > 0 && (
        <div className="sm:hidden fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2">
          <label className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transition-all active:scale-95"
            style={{ background: BRAND.accent, boxShadow: `0 4px 20px ${BRAND.accent}60` }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <input type="file" accept="image/*,video/*" capture="environment" multiple className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => { if (e.target.files?.length) { cameraFilesRef.current = e.target.files; setUploadOpen(true); } }} />
          </label>
          <button onClick={() => setUploadOpen(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95"
            style={{ background: BRAND.dark }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021.75 18V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t mt-8 py-6 text-center" style={{ borderColor: BRAND.border }}>
        <p className="text-xs" style={{ color: BRAND.muted }}>
          Guestcam · <a href="https://guestcam.si" className="hover:underline">guestcam.si</a>
        </p>
      </footer>

      {/* ── Comments panel ───────────────────────────────────────────────── */}
      {openCommentsPhoto && (() => {
        const photo = photos.find(p => p.id === openCommentsPhoto);
        const comments = commentMap[openCommentsPhoto] ?? [];
        return (
          <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" onClick={() => setOpenCommentsPhoto(null)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            {/* Panel */}
            <div
              className="relative w-full sm:w-[440px] max-h-[82vh] sm:max-h-[70vh] bg-white sm:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: BRAND.border }}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: BRAND.accent }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  <span className="font-semibold text-sm" style={{ color: BRAND.dark }}>
                    Komentarji
                    {comments.length > 0 && (
                      <span className="ml-1.5 text-xs font-normal" style={{ color: BRAND.muted }}>· {comments.length}</span>
                    )}
                  </span>
                </div>
                {photo?.uploaderName && (
                  <span className="text-xs" style={{ color: BRAND.muted }}>
                    Foto: <span className="font-medium">{photo.uploaderName}</span>
                  </span>
                )}
                <button onClick={() => setOpenCommentsPhoto(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-gray-100" style={{ color: BRAND.muted }}>
                  ✕
                </button>
              </div>

              {/* Comment list */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3 opacity-20">💬</div>
                    <p className="text-sm" style={{ color: BRAND.muted }}>Bodi prvi, ki komentira!</p>
                  </div>
                ) : comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <AvatarBubble name={c.uploaderName} size={7} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold" style={{ color: BRAND.dark }}>{c.uploaderName}</span>
                        <span className="text-[10px]" style={{ color: BRAND.muted }}>{formatUploadTime(c.createdAt)}</span>
                      </div>
                      <p className="text-sm leading-snug mt-0.5" style={{ color: BRAND.dark }}>{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment input */}
              <div className="border-t px-4 py-3 shrink-0" style={{ borderColor: BRAND.border }}>
                {!nameConfirmed ? (
                  <div className="space-y-2 py-1">
                    <p className="text-xs text-center font-medium" style={{ color: BRAND.muted }}>
                      Vnesi ime za komentar:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={uploaderName}
                        onChange={e => setUploaderName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && confirmName()}
                        placeholder="Vaše ime"
                        autoComplete="given-name"
                        autoFocus
                        className="flex-1 px-3 py-2 border rounded-xl text-sm outline-none transition-all"
                        style={{ borderColor: BRAND.border }}
                      />
                      <button
                        onClick={confirmName}
                        disabled={!uploaderName.trim()}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30 shrink-0 hover:opacity-90"
                        style={{ background: BRAND.accent }}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AvatarBubble name={uploaderName} size={7} />
                    <input
                      type="text"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && postComment()}
                      placeholder="Dodaj komentar…"
                      maxLength={500}
                      className="flex-1 px-3 py-2 border rounded-xl text-sm outline-none transition-all"
                      style={{ borderColor: BRAND.border }}
                    />
                    <div ref={turnstileContainerRef} className="hidden" />
                    <button
                      onClick={postComment}
                      disabled={!commentInput.trim() || commentPosting}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30 shrink-0"
                      style={{ background: BRAND.accent }}
                    >
                      {commentPosting ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Slideshow ────────────────────────────────────────────────────── */}
      {slideshowOpen && (
        <Slideshow
          photos={photos}
          startIndex={slideshowIdx}
          onClose={() => setSlideshowOpen(false)}
        />
      )}

      {/* ── Projection wall ──────────────────────────────────────────────── */}
      {projectionOpen && (
        <ProjectionWall
          album={album}
          photos={photos}
          onClose={() => setProjectionOpen(false)}
        />
      )}

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

      {/* ── Film player ─────────────────────────────────────────────────── */}
      {filmPlayerOpen && filmClips.length > 0 && (
        <FilmPlayer
          clips={filmClips}
          initialIndex={filmClipIdx}
          onClose={() => setFilmPlayerOpen(false)}
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

// ── Film Player ──────────────────────────────────────────────────────────────
interface FilmClip { videoUrl: string; sortOrder: number }

function FilmPlayer({ clips, initialIndex, onClose }: {
  clips: FilmClip[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement>(null);
  const clip = clips[idx];

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = useCallback(() => {
    setIdx(i => {
      if (i + 1 < clips.length) return i + 1;
      return i; // stay on last
    });
  }, [clips.length]);

  // Auto-advance when video ends
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
    const onEnded = () => next();
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [idx, next]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ background: "rgba(0,0,0,0.6)" }}>
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">🎬 Highlights film</span>
          <span className="text-white/50 text-xs">{idx + 1} / {clips.length}</span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Video */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <video
          ref={videoRef}
          key={clip.videoUrl}
          src={clip.videoUrl}
          className="max-w-full max-h-full object-contain"
          playsInline
          autoPlay
        />

        {/* Prev / Next overlays */}
        {idx > 0 && (
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {idx < clips.length - 1 && (
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1 py-4 shrink-0" style={{ background: "rgba(0,0,0,0.6)" }}>
        {clips.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`rounded-full transition-all ${i === idx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
