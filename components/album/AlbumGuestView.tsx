"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import { UploadModal } from "./UploadModal";
import { ReminderModal } from "./ReminderModal";
import { CountdownTimer } from "./CountdownTimer";
import { Slideshow } from "./Slideshow";
import { ProjectionWall } from "./ProjectionWall";
import { PoweredByBadge } from "./PoweredByBadge";
import { translations, LANGS, type Lang, type Translations } from "@/lib/i18n/translations";
import { bunnyDisplayUrl, bunnyOriginalUrl } from "@/lib/storage/bunny";
import { getAlbumTheme } from "@/lib/album-themes";
import type { Album, Photo, Moment } from "@/lib/db/schema";

interface Props {
  album: Album;
  photos: Photo[];
  moments: Moment[];
  passwordRequired: boolean;
  passwordCorrect: boolean;
  providedPassword?: string;
  initialLang: Lang;
  /** True when the signed-in viewer owns this album — shows the back-to-admin bar. */
  isOwner?: boolean;
}

type FilterTab = "all" | "photos" | "videos";
type SortMode = "newest" | "oldest" | "mostLiked";

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

/** Human-readable relative/absolute upload time, localized via translations */
function formatUploadTime(date: Date | string | null | undefined, t: Translations): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1)   return t.justNow;
  if (diffMins < 60)  return t.minutesAgo(diffMins);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 24) return t.todayAt(`${hh}:${mm}`);
  const diffDays  = Math.floor(diffMs / 86_400_000);
  if (diffDays === 1) return t.yesterdayAt(`${hh}:${mm}`);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + ` ${hh}:${mm}`;
}

const BRAND = {
  accent:      "#C9820A",
  accentHover: "#152C66",
  accentLight: "#EAEEF6",
  dark:        "#111827",
  muted:       "#6B7280",
  border:      "#E5E7EB",
  bg:          "#F9FAFB",
};

/** Public demo album — guests browse freely but cannot upload. */
const DEMO_ALBUM_SLUG = "ana-marko-13ka";

const BROKEN_IMG_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1.5'%3E%3Crect x='2' y='7' width='20' height='14' rx='3'/%3E%3Ccircle cx='12' cy='14' r='3'/%3E%3C/svg%3E";

/* Avatar initial bubble shared by photo captions + video cards.
   `size` is a Tailwind spacing step (1 step = 0.25rem); sized via inline
   style so any value works without relying on dynamic class generation. */
function AvatarBubble({ name, size = 5, accent = BRAND.accent }: { name: string; size?: number; accent?: string }) {
  const px = size * 4;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        background: accent,
        width: `${px}px`,
        height: `${px}px`,
        fontSize: size <= 5 ? "9px" : size <= 7 ? "11px" : "13px",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function AlbumGuestView({ album, photos, moments, passwordRequired, passwordCorrect, providedPassword, initialLang, isOwner = false }: Props) {
  const router = useRouter();
  const [lang, setLang]                 = useState<Lang>(initialLang);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [uploadOpen, setUploadOpen]     = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [pwInput, setPwInput]           = useState("");
  const [pwError, setPwError]           = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [filter, setFilter]             = useState<FilterTab>("all");
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null);
  const [sortMode, setSortMode]         = useState<SortMode>("newest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [reactionsOnly, setReactionsOnly] = useState(false);
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
  // Lightbox info panel (likes + comments for the currently shown photo)
  const [lightboxViewIndex, setLightboxViewIndex] = useState(0);
  const [lightboxPanelOpen, setLightboxPanelOpen] = useState(false); // mobile bottom sheet
  const [lightboxDesktopPanelOpen, setLightboxDesktopPanelOpen] = useState(true); // desktop side panel
  // When a guest taps "like" in the lightbox without a name yet, highlight the
  // name-entry field and remember the photo to like once the name is confirmed.
  const [lightboxNamePrompt, setLightboxNamePrompt] = useState(false);
  const pendingLikeRef = useRef<string | null>(null);

  const nameInputRef  = useRef<HTMLInputElement>(null);
  const lbNameInputRef = useRef<HTMLInputElement>(null);
  const cameraFilesRef = useRef<FileList | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const t       = translations[lang];
  const evtIcon = eventIcon(album.eventType ?? "other");
  const albumFull = album.plan === "free" && photos.length >= (album.maxPhotos ?? 20);

  // ── Demo album: uploads allowed, but a tester is capped at 5 photos ───────
  const isDemo = album.slug === DEMO_ALBUM_SLUG;
  /** Open the upload modal. */
  const openUpload = useCallback(() => {
    setUploadOpen(true);
  }, []);

  // ── Owner-chosen theme (dark hero hue + accent color) ─────────────────────
  const theme = getAlbumTheme(album.theme);
  // Soft, flat tint of the accent for light-background accent elements
  const accentTint = `${theme.accent}14`; // ~8% alpha — flat tint, no gradient

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

  // ── Load completed montage film ───────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/albums/${album.slug}/film/status`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { generation: { status: string; videoUrl: string | null } | null } | null) => {
        if (data?.generation?.status === "complete" && data.generation.videoUrl) {
          setFilmClips([{ videoUrl: data.generation.videoUrl, sortOrder: 0 }]);
        }
      })
      .catch(() => { /* non-fatal */ });
  }, [album.slug]);

  // ── Close sort menu on outside click ──────────────────────────────────────
  useEffect(() => {
    if (!sortMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortMenuOpen]);

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

  // ── Lightbox panel ↔ comment target sync ──────────────────────────────────
  // While the lightbox is open, the info panel reuses the existing comment
  // pipeline (postComment / turnstile effect) by pointing `openCommentsPhoto`
  // at the currently shown photo. The standalone comments modal is suppressed
  // whenever the lightbox is open, so the two never collide.

  // ── Like toggle ───────────────────────────────────────────────────────────
  // Core like logic — takes the guest name explicitly so it can be invoked
  // straight after a name is confirmed (before `uploaderName` state settles).
  const likeWithName = useCallback((photoId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
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
      body: JSON.stringify({ uploaderName: trimmed, action }),
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
  }, [myLikes, album.slug]);

  const toggleLike = useCallback((photoId: string) => {
    if (!uploaderName.trim()) return; // need a name first
    likeWithName(photoId, uploaderName);
  }, [uploaderName, likeWithName]);

  /* Lightbox like handler — if the guest has no name yet, reveal & focus the
     name-entry field and remember which photo to like once confirmed, instead
     of being a dead disabled button. */
  const handleLightboxLike = useCallback((photoId: string) => {
    if (uploaderName.trim() && nameConfirmed) {
      likeWithName(photoId, uploaderName);
      return;
    }
    pendingLikeRef.current = photoId;
    setLightboxNamePrompt(true);
    setLightboxPanelOpen(true); // ensure the bottom sheet (with the input) is open on mobile
    requestAnimationFrame(() => {
      const el = lbNameInputRef.current;
      if (el) {
        el.focus();
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    });
  }, [uploaderName, nameConfirmed, likeWithName]);

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

  // ── Filtered collection (type + person + my reactions) ────────────────────
  const filteredPhotos = photos
    .filter(p => {
      if (filter === "photos" &&  p.mimeType?.startsWith("video/")) return false;
      if (filter === "videos" && !p.mimeType?.startsWith("video/")) return false;
      if (personFilter && p.uploaderName !== personFilter) return false;
      if (selectedMomentId && p.momentId !== selectedMomentId) return false;
      if (reactionsOnly && !myLikes.has(p.id)) return false;
      return true;
    })
    .slice() // copy before sorting — don't mutate the prop array
    .sort((a, b) => {
      if (sortMode === "mostLiked") {
        return (likeCounts[b.id] ?? 0) - (likeCounts[a.id] ?? 0);
      }
      const ta = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const tb = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return sortMode === "oldest" ? ta - tb : tb - ta;
    });
  const filteredImages = filteredPhotos.filter(p => !p.mimeType?.startsWith("video/"));
  const filteredVideos = filteredPhotos.filter(p =>  p.mimeType?.startsWith("video/"));

  // "My uploads" = guest's confirmed name appears among uploaders
  const hasMyUploads = nameConfirmed && uploaders.includes(uploaderName.trim());

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
    setLightboxNamePrompt(false);
    // If the guest tapped "like" before having a name, register that like now.
    const pending = pendingLikeRef.current;
    if (pending) {
      pendingLikeRef.current = null;
      likeWithName(pending, uploaderName.trim());
    }
  };

  // ── Lightbox slides — mirror the currently displayed images (filtered+sorted) ──
  const lightboxSlides = filteredImages.map(p => ({
    src: bunnyDisplayUrl(p.blobUrl, 2400, 90),
    width: p.width ?? 2400,
    height: p.height ?? 1600,
    download: { url: bunnyOriginalUrl(p.blobUrl), filename: p.originalFilename ?? "photo.jpg" },
    description: p.caption ?? undefined,
  }));

  const getLightboxIdx = (photo: Photo): number =>
    filteredImages.findIndex(p => p.id === photo.id);

  const lightboxOpen = lightboxIndex >= 0;
  // Photo currently shown in the lightbox (drives the info panel)
  const lightboxPhoto: Photo | undefined = lightboxOpen ? filteredImages[lightboxViewIndex] : undefined;

  // Keep the comment pipeline pointed at the lightbox's current photo while open.
  useEffect(() => {
    if (lightboxOpen && lightboxPhoto) {
      setOpenCommentsPhoto(lightboxPhoto.id);
      setCommentInput("");
    }
  }, [lightboxOpen, lightboxPhoto?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Password gate ─────────────────────────────────────────────────────────
  if (passwordRequired && !passwordCorrect) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: BRAND.bg }}>
        <div className="h-1 w-full shrink-0" style={{ background: theme.accent }} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">{evtIcon}</div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND.dark }}>{album.coupleName}</h1>
              <p className="text-sm mt-1" style={{ color: BRAND.muted }}>{album.weddingDate}{album.location ? ` · ${album.location}` : ""}</p>
            </div>
            <div className="bg-white rounded-2xl border p-8" style={{ borderColor: BRAND.border }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: accentTint }}>
                <svg className="w-6 h-6" style={{ color: theme.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
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
                  style={lang === l.code ? { background: accentTint } : { color: BRAND.muted }}>{l.flag}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Owner-only top bar — quick exit back to the admin dashboard while
          previewing the public gallery. */}
      {isOwner && (
        <div className="bg-[#FFC94D] border-b border-[#F0B429]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F1729]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Pregledujete kot gost
            </p>
            <Link
              href={`/dashboard/${album.slug}`}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#0F1729] text-white text-xs sm:text-sm font-bold hover:brightness-125 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Nadzorna plošča
            </Link>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          HERO HEADER
      ════════════════════════════════════════════════════════════════════ */}
      <div className="relative">
        {album.coverImageUrl ? (
          <div className="relative h-72 sm:h-96 lg:h-[460px] w-full overflow-hidden">
            <Image src={album.coverImageUrl} alt={album.coupleName} fill className="object-cover" priority />
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
            <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 pt-5">
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <span>{evtIcon}</span>
                <span>{t.eventLabel(album.eventType ?? "other")}</span>
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
                <span>{t.photoCount(photoCount)}{videoCount > 0 ? ` · ${t.videoCount(videoCount)}` : ""}</span>
                {photos.length > 0 && (
                  <span className="flex items-center gap-1 text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-white inline-block" />
                    {t.live}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative pt-14 pb-14 sm:pt-16 sm:pb-20 px-6 text-center overflow-hidden" style={{ background: theme.heroBg }}>
            <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 pt-4">
              <div className="flex items-center gap-2 text-white/70 text-xs font-medium uppercase tracking-[0.18em]">
                <span className="text-sm">{evtIcon}</span>
                <span>{t.eventLabel(album.eventType ?? "other")}</span>
              </div>
              <div className="flex items-center gap-1">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => switchLang(l.code)} className="px-1.5 py-1 rounded-lg text-sm transition-all hover:bg-white/10"
                    style={lang === l.code ? { background: "rgba(255,255,255,0.22)" } : { color: "rgba(255,255,255,0.7)" }}>{l.flag}</button>
                ))}
              </div>
            </div>
            <div className="relative max-w-2xl mx-auto pt-6">
              {/* Event emoji in a refined ring */}
              <div className="mx-auto mb-7 w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-full flex items-center justify-center text-4xl sm:text-5xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}>
                {evtIcon}
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
                {album.coupleName}
              </h1>
              {/* Date · location row, framed by thin dividers */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
                <span className="h-px w-8 sm:w-12" style={{ background: "rgba(255,255,255,0.3)" }} />
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 text-white/75 text-xs sm:text-sm uppercase tracking-[0.14em]">
                  <span>{album.weddingDate}</span>
                  {album.location && <><span className="text-white/40">·</span><span>{album.location}</span></>}
                </div>
                <span className="h-px w-8 sm:w-12" style={{ background: "rgba(255,255,255,0.3)" }} />
              </div>
              {photos.length > 0 && (
                <p className="text-white/65 text-xs tracking-wide mb-6">
                  {t.photoCount(photoCount)}{videoCount > 0 ? ` · ${t.videoCount(videoCount)}` : ""}
                </p>
              )}
              {/* Countdown as a tasteful pill — translucent white on the navy hero */}
              <div className="inline-flex items-center rounded-full px-5 py-2"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <CountdownTimer targetDate={album.weddingDate} translations={t} accent="#FFFFFF" />
              </div>
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
          <div className="flex items-center justify-between gap-3 py-2.5">

            {/* Type filter pills */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1 shrink-0">
              {([
                { id: "all",    label: t.filterAllShort,    labelMd: t.filterAll,          count: photos.length },
                { id: "photos", label: t.filterPhotosShort, labelMd: t.filterPhotos,  count: photoCount },
                { id: "videos", label: t.filterVideosShort, labelMd: t.filterVideos,        count: videoCount },
              ] as { id: FilterTab; label: string; labelMd: string; count: number }[]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={filter === tab.id
                    ? { background: "white", color: BRAND.dark, border: `1px solid ${BRAND.border}` }
                    : { color: BRAND.muted, border: "1px solid transparent" }
                  }
                >
                  <span className="sm:hidden">{tab.label}</span>
                  <span className="hidden sm:inline">{tab.labelMd}</span>
                  {tab.count > 0 && (
                    <span className="text-[11px] font-semibold leading-none px-1.5 py-0.5 rounded-full tabular-nums"
                      style={filter === tab.id
                        ? { background: accentTint, color: theme.accent }
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
                  title={t.slideshow}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                  style={{ color: BRAND.muted }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                  </svg>
                  <span className="hidden lg:inline">{t.slideshowShort}</span>
                </button>
                <button
                  onClick={() => setProjectionOpen(true)}
                  title={t.photoWallTitle}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                  style={{ color: BRAND.muted }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  <span className="hidden lg:inline">{t.photoWall}</span>
                </button>
                {filmClips.length > 0 && (
                  <button
                    onClick={() => { setFilmClipIdx(0); setFilmPlayerOpen(true); }}
                    title={t.highlightsFilm}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
                    style={{ color: BRAND.muted }}
                  >
                    <span>🎬</span>
                    <span className="hidden lg:inline">{t.film}</span>
                  </button>
                )}
              </div>
            )}

            {/* Upload section — shown once the guest has entered a name.
                Name entry lives in the prominent banner below the toolbar,
                so nothing here can push the toolbar off a narrow screen. */}
            {!albumFull && nameConfirmed && (
              <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5">
                      <AvatarBubble name={uploaderName} size={7} accent={theme.accent} />
                      <button onClick={() => setNameConfirmed(false)} className="text-xs underline" style={{ color: BRAND.muted }}>{uploaderName}</button>
                    </div>
                    <label className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:opacity-90" style={{ background: BRAND.dark }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                      <span className="hidden sm:inline">{t.takePhoto}</span>
                      <input type="file" accept="image/*,video/*" capture="environment" multiple className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (!e.target.files?.length) return;
                          cameraFilesRef.current = e.target.files;
                          setUploadOpen(true);
                        }} />
                    </label>
                    <button onClick={openUpload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all hover:bg-gray-50"
                      style={{ borderColor: BRAND.border, color: BRAND.dark }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="hidden sm:inline">{t.uploadShort}</span>
                    </button>
                  </div>
              </div>
            )}
          </div>

          {/* Row 2 — sort + quick filters + person filter chips */}
          {(photos.length > 0) && (
            <div className="flex items-center gap-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>

              {/* Sort menu */}
              <div className="relative flex-shrink-0" ref={sortMenuRef}>
                <button
                  onClick={() => setSortMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                  style={{ background: "white", color: BRAND.dark, borderColor: BRAND.border }}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M6 12h12M10 16.5h4" />
                  </svg>
                  <span>
                    {sortMode === "newest" ? t.sortNewest : sortMode === "oldest" ? t.sortOldest : t.sortMostLiked}
                  </span>
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {sortMenuOpen && (
                  <div
                    className="absolute left-0 top-full mt-1 z-30 w-44 rounded-xl border bg-white py-1 shadow-lg"
                    style={{ borderColor: BRAND.border }}
                  >
                    {([
                      { id: "newest" as SortMode, label: t.sortNewest },
                      { id: "oldest" as SortMode, label: t.sortOldest },
                      { id: "mostLiked" as SortMode, label: t.sortMostLiked },
                    ]).map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setSortMode(opt.id); setSortMenuOpen(false); }}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium transition-all hover:bg-gray-50"
                        style={{ color: sortMode === opt.id ? theme.accent : BRAND.dark }}
                      >
                        {opt.label}
                        {sortMode === opt.id && (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="h-4 w-px flex-shrink-0" style={{ background: BRAND.border }} />

              {/* My uploads — shortcut into the per-person filter */}
              {hasMyUploads && (() => {
                const active = personFilter === uploaderName.trim();
                return (
                  <button
                    onClick={() => setPersonFilter(active ? null : uploaderName.trim())}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                    style={active
                      ? { background: theme.accent, color: "white", borderColor: theme.accent }
                      : { background: "white", color: BRAND.dark, borderColor: BRAND.border }}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    {t.myUploads}
                  </button>
                );
              })()}

              {/* My reactions — only photos the guest has liked */}
              {nameConfirmed && (
                <button
                  onClick={() => setReactionsOnly(o => !o)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                  style={reactionsOnly
                    ? { background: theme.accent, color: "white", borderColor: theme.accent }
                    : { background: "white", color: BRAND.dark, borderColor: BRAND.border }}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24"
                    fill={reactionsOnly ? "white" : "none"}
                    stroke={reactionsOnly ? "white" : "currentColor"} strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  {t.myReactions}
                </button>
              )}

              {/* Person filter chips (only if 2+ distinct uploaders) */}
              {uploaders.length >= 2 && (
                <>
                  <span className="h-4 w-px flex-shrink-0" style={{ background: BRAND.border }} />
                  <button
                    onClick={() => setPersonFilter(null)}
                    className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                    style={personFilter === null
                      ? { background: BRAND.dark, color: "white", borderColor: BRAND.dark }
                      : { background: "white", color: BRAND.muted, borderColor: BRAND.border }}
                  >
                    {t.everyone}
                  </button>

                  {uploaders.map(name => {
                    const active = personFilter === name;
                    return (
                      <button
                        key={name}
                        onClick={() => setPersonFilter(active ? null : name)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                        style={active
                          ? { background: theme.accent, color: "white", borderColor: theme.accent }
                          : { background: "white", color: BRAND.dark, borderColor: BRAND.border }}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center font-bold"
                          style={{
                            fontSize: "9px",
                            background: active ? "rgba(255,255,255,0.25)" : accentTint,
                            color:      active ? "white"                  : theme.accent,
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </span>
                        {name}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Row 3 — moment tabs (only if the album has moments) */}
          {moments.length > 0 && (
            <div className="flex items-center gap-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => setSelectedMomentId(null)}
                className="flex-shrink-0 px-3.5 py-1 rounded-full text-xs font-semibold transition-all border"
                style={selectedMomentId === null
                  ? { background: theme.accent, color: "white", borderColor: theme.accent }
                  : { background: "white", color: BRAND.dark, borderColor: BRAND.border }}
              >
                {t.momentsAll}
              </button>
              {moments.map(m => {
                const active = selectedMomentId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMomentId(active ? null : m.id)}
                    className="flex-shrink-0 px-3.5 py-1 rounded-full text-xs font-semibold transition-all border"
                    style={active
                      ? { background: theme.accent, color: "white", borderColor: theme.accent }
                      : { background: "white", color: BRAND.dark, borderColor: BRAND.border }}
                  >
                    {m.name}
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

        {/* Demo album notice — uploads stay private, this rule is demo-only */}
        {isDemo && (
          <div
            className="mb-6 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed font-medium"
            style={{ borderColor: accentTint, background: accentTint, color: BRAND.dark }}
          >
            {t.demoUploadNote}
          </div>
        )}

        {/* Name-entry onboarding — the guest enters a name before uploading.
            (Empty albums use the big empty-state CTA instead.) */}
        {!albumFull && !nameConfirmed && photos.length > 0 && (
          <div
            className="mb-6 rounded-2xl border bg-white px-5 py-6 sm:px-8 sm:py-7"
            style={{ borderColor: BRAND.border }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: accentTint }}
              >
                👋
              </div>
              <p className="text-base sm:text-lg font-semibold leading-snug" style={{ color: BRAND.dark }}>
                {t.nameOnboardPrompt}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <input
                ref={nameInputRef}
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && uploaderName.trim()) { confirmName(); openUpload(); }
                }}
                placeholder={t.yourNamePlaceholder}
                autoComplete="given-name"
                className="w-full sm:w-64 px-4 py-3 border rounded-2xl text-base outline-none transition-all"
                style={{ borderColor: BRAND.border }}
              />
              <button
                onClick={() => { confirmName(); openUpload(); }}
                disabled={!uploaderName.trim()}
                className="px-7 py-3 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-30 hover:opacity-90 shrink-0"
                style={{ background: BRAND.dark }}
              >
                {t.uploadShort}
              </button>
            </div>
          </div>
        )}

        {/* Album full notice */}
        {albumFull && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-xl shrink-0">🔒</span>
            <div>
              <p className="font-semibold text-sm text-red-800">{t.galleryFull}</p>
              <p className="text-xs text-red-600 mt-0.5">{t.galleryFullDesc}</p>
            </div>
          </div>
        )}

        {/* Person filter active banner */}
        {personFilter && (
          <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: accentTint, background: accentTint }}>
            <AvatarBubble name={personFilter} size={6} accent={theme.accent} />
            <span className="font-medium" style={{ color: BRAND.dark }}>
              {t.photosFrom} <strong>{personFilter}</strong>
            </span>
            <button
              onClick={() => setPersonFilter(null)}
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-lg transition-all hover:bg-white/60"
              style={{ color: theme.accent }}
            >
              {t.clear}
            </button>
          </div>
        )}

        {/* Empty state */}
        {filteredPhotos.length === 0 ? (
          reactionsOnly || personFilter || selectedMomentId || filter !== "all" ? (
            /* Filtered empty — simple message */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="text-5xl mb-4 opacity-20">
                {reactionsOnly ? "🤍" : filter === "videos" ? "🎥" : "📷"}
              </div>
              <p className="text-sm font-medium" style={{ color: BRAND.muted }}>
                {reactionsOnly
                  ? t.noMyReactions
                  : personFilter === uploaderName.trim() && nameConfirmed
                  ? t.noMyUploads
                  : personFilter
                  ? (filter === "videos" ? t.personNoVideos(personFilter) : t.personNoPhotos(personFilter))
                  : filter === "videos" ? t.noVideos
                  : t.noPhotos}
              </p>
            </div>
          ) : !albumFull ? (
            /* Album is empty — big upload CTA */
            <div id="upload-cta" className="py-12 sm:py-20 px-4">
              <div className="mx-auto max-w-md rounded-3xl border bg-white px-6 py-12 sm:px-10 sm:py-14 text-center"
                style={{ borderColor: BRAND.border }}>
                <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-3xl"
                  style={{ background: accentTint }}>
                  📷
                </div>
                <h2 className="font-serif text-2xl font-bold mb-2.5" style={{ color: BRAND.dark }}>
                  {t.beFirstToShare}
                </h2>
                <p className="text-sm leading-relaxed mb-8 max-w-xs mx-auto" style={{ color: BRAND.muted }}>
                  {t.beFirstToShareHint}
                </p>
                {!nameConfirmed ? (
                  <div className="flex flex-col items-center gap-2.5 w-full max-w-xs mx-auto">
                    <input
                      type="text"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmName()}
                      placeholder={t.yourNamePlaceholder}
                      autoComplete="given-name"
                      className="w-full px-4 py-3 border rounded-2xl text-sm outline-none transition-all text-center"
                      style={{ borderColor: BRAND.border }}
                    />
                    <button
                      onClick={confirmName}
                      disabled={!uploaderName.trim()}
                      className="w-full px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-30 hover:opacity-90"
                      style={{ background: BRAND.dark }}
                    >
                      {t.next}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white cursor-pointer transition-all hover:opacity-90 relative"
                      style={{ background: theme.accent }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                      {t.takePhoto}
                      <input type="file" accept="image/*,video/*" capture="environment" multiple className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (!e.target.files?.length) return;
                          cameraFilesRef.current = e.target.files;
                          setUploadOpen(true);
                        }} />
                    </label>
                    <button
                      onClick={openUpload}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all hover:bg-gray-50"
                      style={{ borderColor: BRAND.border, color: BRAND.dark }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      {t.uploadFromGallery}
                    </button>
                  </div>
                )}
                {/* Secondary actions: upload reminder */}
                <div className="mt-6 flex flex-col items-center gap-2">
                  <button
                    onClick={() => setReminderOpen(true)}
                    className="text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-70"
                    style={{ color: BRAND.muted }}
                  >
                    {t.remindMeLink}
                  </button>
                </div>
              </div>
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
                  {t.videosSection} · {filteredVideos.length}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos.map(photo => <VideoCard key={photo.id} photo={photo} t={t} accent={theme.accent} />)}
                </div>
              </div>
            )}

            {/* ── Videos-only view ────────────────────────────────────────── */}
            {filter === "videos" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map(photo => <VideoCard key={photo.id} photo={photo} t={t} accent={theme.accent} />)}
              </div>
            )}

            {/* ── Photo masonry ────────────────────────────────────────────── */}
            {filter !== "videos" && filteredImages.length > 0 && (
              <div>
                {filter === "all" && (
                  <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.muted }}>
                    {t.photosSection} · {filteredImages.length}
                  </h2>
                )}
                <div className="masonry-grid">
                  {filteredImages.map((photo) => (
                    <div
                      key={photo.id}
                      className="masonry-item group cursor-pointer"
                      onClick={() => {
                        const idx = getLightboxIdx(photo);
                        setLightboxViewIndex(idx);
                        setLightboxPanelOpen(false);
                        setLightboxDesktopPanelOpen(true);
                        setLightboxIndex(idx);
                      }}
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
                        {photo.uploaderName && <AvatarBubble name={photo.uploaderName} size={5} accent={theme.accent} />}
                        <div className="min-w-0 flex-1">
                          {photo.uploaderName && (
                            <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: BRAND.dark }}>
                              {photo.uploaderName}
                            </p>
                          )}
                          <p className="text-[10px] leading-tight" style={{ color: BRAND.muted }}>
                            {formatUploadTime(photo.uploadedAt, t)}
                          </p>
                        </div>
                        {/* Like button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                          title={myLikes.has(photo.id) ? t.unlike : t.like}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold transition-all shrink-0"
                          style={myLikes.has(photo.id)
                            ? { background: "#FEE2E2", color: "#EF4444" }
                            : { background: "transparent", color: BRAND.muted }}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill={myLikes.has(photo.id) ? "#EF4444" : "none"} stroke={myLikes.has(photo.id) ? "#EF4444" : "currentColor"} strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                          {(likeCounts[photo.id] ?? 0) > 0 && (
                            <span>{likeCounts[photo.id]}</span>
                          )}
                        </button>
                        {/* Comment button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenCommentsPhoto(photo.id); setCommentInput(""); }}
                          title={t.comments}
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
          <label className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transition-all active:scale-95 hover:brightness-95"
            style={{ background: theme.accent }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <input type="file" accept="image/*,video/*" capture="environment" multiple className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                if (!e.target.files?.length) return;
                cameraFilesRef.current = e.target.files;
                setUploadOpen(true);
              }} />
          </label>
          <button onClick={openUpload}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95"
            style={{ background: BRAND.dark }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021.75 18V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      {/* Referral engine — the PoweredByBadge is non-removable across all
          plans (incl. Premium) so every guest sees the CTA. Attribution is
          via ?ref=<album.referralCode>&tp=gallery_footer picked up by
          middleware. */}
      <footer className="border-t mt-8 py-6 text-center flex flex-col items-center gap-3" style={{ borderColor: BRAND.border }}>
        <PoweredByBadge referralCode={album.referralCode ?? null} lang={lang} />
        <p className="text-[10px]" style={{ color: BRAND.muted }}>
          © {new Date().getFullYear()} Guestcam
        </p>
      </footer>

      {/* ── Comments panel ───────────────────────────────────────────────── */}
      {openCommentsPhoto && !lightboxOpen && (() => {
        const photo = photos.find(p => p.id === openCommentsPhoto);
        const comments = commentMap[openCommentsPhoto] ?? [];
        return (
          <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" onClick={() => setOpenCommentsPhoto(null)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            {/* Panel */}
            <div
              className="relative w-full sm:w-[440px] max-h-[82vh] sm:max-h-[70vh] bg-white sm:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: BRAND.border }}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: theme.accent }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  <span className="font-semibold text-sm" style={{ color: BRAND.dark }}>
                    {t.comments}
                    {comments.length > 0 && (
                      <span className="ml-1.5 text-xs font-normal" style={{ color: BRAND.muted }}>· {comments.length}</span>
                    )}
                  </span>
                </div>
                {photo?.uploaderName && (
                  <span className="text-xs" style={{ color: BRAND.muted }}>
                    {t.photoBy} <span className="font-medium">{photo.uploaderName}</span>
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
                    <p className="text-sm" style={{ color: BRAND.muted }}>{t.beFirstToComment}</p>
                  </div>
                ) : comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <AvatarBubble name={c.uploaderName} size={7} accent={theme.accent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold" style={{ color: BRAND.dark }}>{c.uploaderName}</span>
                        <span className="text-[10px]" style={{ color: BRAND.muted }}>{formatUploadTime(c.createdAt, t)}</span>
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
                      {t.enterNameToComment}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={uploaderName}
                        onChange={e => setUploaderName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && confirmName()}
                        placeholder={t.yourNamePlaceholder}
                        autoComplete="given-name"
                        autoFocus
                        className="flex-1 px-3 py-2 border rounded-xl text-sm outline-none transition-all"
                        style={{ borderColor: BRAND.border }}
                      />
                      <button
                        onClick={confirmName}
                        disabled={!uploaderName.trim()}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30 shrink-0 hover:opacity-90"
                        style={{ background: theme.accent }}
                      >
                        {t.ok}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AvatarBubble name={uploaderName} size={7} accent={theme.accent} />
                    <input
                      type="text"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && postComment()}
                      placeholder={t.addComment}
                      maxLength={500}
                      className="flex-1 px-3 py-2 border rounded-xl text-sm outline-none transition-all"
                      style={{ borderColor: BRAND.border }}
                    />
                    <button
                      onClick={postComment}
                      disabled={!commentInput.trim() || commentPosting}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30 shrink-0"
                      style={{ background: theme.accent }}
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

      {/* Invisible Turnstile widget host — always mounted so the panel and the
          standalone comments modal can both reuse the existing comment flow. */}
      <div ref={turnstileContainerRef} className="hidden" aria-hidden="true" />

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxSlides.length > 0 && (() => {
        const PANEL_W = 340; // px — desktop side panel width
        const lbComments = lightboxPhoto ? (commentMap[lightboxPhoto.id] ?? []) : [];
        const lbLiked    = lightboxPhoto ? myLikes.has(lightboxPhoto.id) : false;
        const lbLikes    = lightboxPhoto ? (likeCounts[lightboxPhoto.id] ?? 0) : 0;

        /* The likes + comments panel body — shared by desktop side panel and
           mobile bottom sheet. Reuses toggleLike / postComment / comment state.
           `onCollapse` (desktop only) renders a chevron "hide" control. */
        const renderPanelBody = (onCollapse?: () => void) => lightboxPhoto && (
          <div className="flex flex-col h-full min-h-0">
            {/* ── Header: uploader avatar + name + like ───────────────────── */}
            <div className="shrink-0 px-4 pt-4 pb-3.5 border-b" style={{ borderColor: BRAND.border }}>
              <div className="flex items-center gap-3">
                {lightboxPhoto.uploaderName
                  ? <AvatarBubble name={lightboxPhoto.uploaderName} size={9} accent={theme.accent} />
                  : <div className="w-9 h-9 rounded-full shrink-0" style={{ background: BRAND.bg }} />}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: theme.accent }}>
                    {t.eventLabel(album.eventType ?? "other")}
                  </p>
                  {lightboxPhoto.uploaderName && (
                    <p className="text-sm font-bold leading-tight truncate" style={{ color: BRAND.dark }}>
                      {lightboxPhoto.uploaderName}
                    </p>
                  )}
                  <p className="text-[11px] leading-tight mt-0.5" style={{ color: BRAND.muted }}>
                    {formatUploadTime(lightboxPhoto.uploadedAt, t)}
                  </p>
                </div>
                {/* Desktop collapse / hide control */}
                {onCollapse && (
                  <button
                    onClick={onCollapse}
                    title={t.hideInfo}
                    aria-label={t.hideInfo}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 hover:bg-gray-100"
                    style={{ color: BRAND.muted }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Like button — full-width, prominent. Never disabled: when the
                  guest has no name yet, tapping it reveals the name-entry field
                  (see handleLightboxLike) instead of being a dead button. */}
              <button
                onClick={() => handleLightboxLike(lightboxPhoto.id)}
                title={lbLiked ? t.unlike : t.like}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={lbLiked
                  ? { background: "#FEE2E2", color: "#EF4444" }
                  : { background: BRAND.bg, color: BRAND.muted, border: `1px solid ${BRAND.border}` }}
              >
                <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill={lbLiked ? "#EF4444" : "none"} stroke={lbLiked ? "#EF4444" : "currentColor"} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span>{lbLiked ? t.unlike : t.like}</span>
                {lbLikes > 0 && (
                  <span className="ml-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full tabular-nums"
                    style={lbLiked ? { background: "#EF4444", color: "white" } : { background: "white", color: BRAND.muted }}>
                    {lbLikes}
                  </span>
                )}
              </button>
            </div>

            {/* ── Comment list ────────────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3.5 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: BRAND.muted }}>
                {t.comments}{lbComments.length > 0 && <span style={{ color: theme.accent }}> · {lbComments.length}</span>}
              </p>
              {lbComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-2xl"
                  style={{ background: BRAND.bg, border: `1px dashed ${BRAND.border}` }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2.5" style={{ background: accentTint }}>
                    <svg className="w-5 h-5" fill="none" stroke={theme.accent} viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: BRAND.dark }}>{t.beFirstToComment}</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {lbComments.map((c, i) => (
                    <li key={c.id} className="flex items-start gap-2.5 py-2.5"
                      style={i > 0 ? { borderTop: `1px solid ${BRAND.border}` } : undefined}>
                      <AvatarBubble name={c.uploaderName} size={8} accent={theme.accent} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold truncate" style={{ color: BRAND.dark }}>{c.uploaderName}</span>
                          <span className="text-[10px] shrink-0" style={{ color: BRAND.muted }}>{formatUploadTime(c.createdAt, t)}</span>
                        </div>
                        <p className="text-sm leading-snug mt-0.5 break-words" style={{ color: "#374151" }}>{c.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ── Add comment / name entry (pinned bottom) ────────────────── */}
            <div className="border-t px-3 py-3 shrink-0" style={{ borderColor: BRAND.border, background: BRAND.bg }}>
              {!nameConfirmed ? (
                <div className="space-y-2 py-0.5">
                  <p className="text-xs text-center font-medium" style={{ color: lightboxNamePrompt ? "#EF4444" : BRAND.muted }}>
                    {lightboxNamePrompt ? t.enterNameToLike : t.enterNameToComment}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      ref={lbNameInputRef}
                      type="text"
                      value={uploaderName}
                      onChange={e => setUploaderName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && confirmName()}
                      onFocus={e => e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })}
                      placeholder={t.yourNamePlaceholder}
                      autoComplete="given-name"
                      className="flex-1 px-3.5 py-2.5 bg-white border rounded-full text-sm outline-none transition-all focus:ring-2"
                      style={{ borderColor: lightboxNamePrompt ? "#EF4444" : BRAND.border }}
                    />
                    <button
                      onClick={confirmName}
                      disabled={!uploaderName.trim()}
                      className="px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-30 shrink-0 hover:opacity-90"
                      style={{ background: theme.accent }}
                    >
                      {t.ok}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AvatarBubble name={uploaderName} size={8} accent={theme.accent} />
                  <div className="flex-1 flex items-center gap-1 bg-white border rounded-full pl-3.5 pr-1 py-1" style={{ borderColor: BRAND.border }}>
                    <input
                      type="text"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && postComment()}
                      onFocus={e => {
                        // Keep the input above the on-screen keyboard on mobile.
                        const el = e.currentTarget;
                        setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
                      }}
                      placeholder={t.addComment}
                      maxLength={500}
                      className="flex-1 min-w-0 py-1.5 text-sm outline-none bg-transparent"
                    />
                    <button
                      onClick={postComment}
                      disabled={!commentInput.trim() || commentPosting}
                      title={t.addComment}
                      aria-label={t.addComment}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30 shrink-0 hover:opacity-90"
                      style={{ background: theme.accent }}
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
                </div>
              )}
            </div>
          </div>
        );

        return (
          <Lightbox
            open={lightboxIndex >= 0}
            close={() => { setLightboxIndex(-1); setLightboxPanelOpen(false); setLightboxDesktopPanelOpen(true); setOpenCommentsPhoto(null); setLightboxNamePrompt(false); pendingLikeRef.current = null; }}
            index={lightboxIndex}
            slides={lightboxSlides}
            plugins={[Download, Counter]}
            /* Keep the controlled `index` in sync with swipes/arrows — without
               this, the controlled prop snaps every swipe back to the photo
               the lightbox was opened on. */
            on={{ view: ({ index }) => { setLightboxViewIndex(index); setLightboxIndex(index); } }}
            styles={{ container: { backgroundColor: "rgba(0,0,0,0.97)" } }}
            /* When the desktop panel is OPEN the container also carries
               `guestcam-lightbox--panel`; globals.css scopes the right-padding
               + toolbar/arrow shift to that class, so a hidden panel ⇒ no
               padding ⇒ the photo uses the full lightbox width. */
            className={`guestcam-lightbox${lightboxDesktopPanelOpen ? " guestcam-lightbox--panel" : ""}`}
            render={{
              /* Inject the panel as a custom control (absolute positioned) */
              controls: () => lightboxPhoto ? (
                <>
                  {/* Desktop: fixed-width side panel, full height — collapsible */}
                  {lightboxDesktopPanelOpen ? (
                    <div
                      className="hidden lg:flex flex-col absolute top-0 right-0 bottom-0 bg-white shadow-2xl z-[1]"
                      style={{ width: PANEL_W }}
                    >
                      {renderPanelBody(() => setLightboxDesktopPanelOpen(false))}
                    </div>
                  ) : (
                    /* Hidden state — a tasteful pill to re-open the panel */
                    <button
                      onClick={() => setLightboxDesktopPanelOpen(true)}
                      title={t.showInfo}
                      className="hidden lg:flex absolute top-4 right-4 z-[2] items-center gap-2 pl-3 pr-3.5 py-2 rounded-full text-sm font-semibold text-white shadow-xl transition-all hover:opacity-95"
                      style={{ background: theme.accent }}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                      <span>{t.showInfo}</span>
                      {(lbLikes > 0 || lbComments.length > 0) && (
                        <span className="flex items-center gap-1 ml-0.5 text-xs font-bold tabular-nums">
                          {lbLikes > 0 && (
                            <span className="flex items-center gap-0.5">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                              </svg>
                              {lbLikes}
                            </span>
                          )}
                          {lbComments.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                              </svg>
                              {lbComments.length}
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Mobile: toggle button + bottom sheet */}
                  <button
                    onClick={() => setLightboxPanelOpen(o => !o)}
                    className="lg:hidden absolute left-1/2 -translate-x-1/2 bottom-4 z-[2] flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg"
                    style={{ background: theme.accent }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={lbLiked ? "white" : "none"} stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    {lightboxPanelOpen ? t.hideInfo : t.showInfo}
                    {(lbLikes > 0 || lbComments.length > 0) && !lightboxPanelOpen && (
                      <span className="ml-0.5 opacity-90">· {lbLikes + lbComments.length}</span>
                    )}
                  </button>

                  {lightboxPanelOpen && (
                    /* The overlay is `fixed` and sized with dynamic viewport
                       units (100dvh) so that on iOS Safari it tracks the
                       *visible* viewport when the on-screen keyboard opens —
                       the sheet stays anchored to the bottom of what the user
                       actually sees, never pushed off-screen. */
                    <div
                      className="lg:hidden fixed inset-x-0 top-0 z-[2] flex flex-col justify-end"
                      style={{ height: "100dvh" }}
                      onClick={() => setLightboxPanelOpen(false)}
                    >
                      <div className="absolute inset-0 bg-black/40" />
                      <div
                        className="relative bg-white rounded-t-2xl flex flex-col overflow-hidden shadow-2xl"
                        style={{ maxHeight: "85dvh" }}
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex justify-center pt-2 pb-1 shrink-0">
                          <div className="w-10 h-1 rounded-full" style={{ background: BRAND.border }} />
                        </div>
                        <div className="flex-1 min-h-0 flex flex-col">{renderPanelBody()}</div>
                      </div>
                    </div>
                  )}
                </>
              ) : null,
            }}
          />
        );
      })()}

      {/* ── Upload modal ──────────────────────────────────────────────────── */}
      {uploadOpen && (
        <UploadModal
          albumSlug={album.slug}
          albumId={album.id}
          uploaderName={uploaderName}
          maxPhotos={isDemo ? album.photoCount + 5 : album.maxPhotos}
          currentCount={album.photoCount}
          lang={lang}
          accent={theme.accent}
          albumPassword={providedPassword ?? ""}
          moments={moments}
          defaultMomentId={selectedMomentId}
          initialFiles={cameraFilesRef.current}
          referralCode={album.referralCode ?? null}
          onClose={() => { cameraFilesRef.current = null; setUploadOpen(false); }}
          onNameChange={(name) => setUploaderName(name)}
          onSuccess={() => { cameraFilesRef.current = null; setUploadOpen(false); router.refresh(); }}
        />
      )}

      {/* ── Upload reminder modal ─────────────────────────────────────────── */}
      {reminderOpen && (
        <ReminderModal
          albumSlug={album.slug}
          lang={lang}
          accent={theme.accent}
          onClose={() => setReminderOpen(false)}
        />
      )}

      {/* ── Film player ─────────────────────────────────────────────────── */}
      {filmPlayerOpen && filmClips.length > 0 && (
        <FilmPlayer
          clips={filmClips}
          initialIndex={filmClipIdx}
          onClose={() => setFilmPlayerOpen(false)}
          t={t}
        />
      )}
    </div>
  );
}

/* ── VideoCard ────────────────────────────────────────────────────────────── */
function VideoCard({ photo, t, accent = BRAND.accent }: { photo: Photo; t: Translations; accent?: string }) {
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
        {photo.uploaderName && <AvatarBubble name={photo.uploaderName} size={6} accent={accent} />}
        <div className="min-w-0">
          {photo.uploaderName && (
            <p className="text-xs font-semibold text-gray-100 truncate">{photo.uploaderName}</p>
          )}
          <p className="text-[10px] text-gray-400">{formatUploadTime(photo.uploadedAt, t)}</p>
        </div>
      </div>
    </div>
  );
}

// ── Film Player ──────────────────────────────────────────────────────────────
interface FilmClip { videoUrl: string; sortOrder: number }

function FilmPlayer({ clips, initialIndex, onClose, t }: {
  clips: FilmClip[];
  initialIndex: number;
  onClose: () => void;
  t: Translations;
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
          <span className="text-white font-bold text-sm">🎬 {t.highlightsFilm}</span>
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
