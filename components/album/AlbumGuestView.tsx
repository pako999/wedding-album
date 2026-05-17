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

// Single universal brand palette — accent used only as a thin accent line,
// never as a full-page background tint. Keeps every event type visually consistent.
const BRAND = {
  accent:      "#C4738A",
  accentHover: "#9E5268",
  accentLight: "#FEF2F4",
  dark:        "#111827",
  muted:       "#6B7280",
  border:      "#E5E7EB",
  surface:     "#FFFFFF",
  bg:          "#F9FAFB",
};

function eventGreeting(eventType: string): string {
  switch (eventType) {
    case "wedding":     return "Dobrodošli na poroki";
    case "birthday":    return "Dobrodošli na rojstnem dnevu";
    case "anniversary": return "Dobrodošli na obletnici";
    case "party":       return "Dobrodošli na zabavi";
    case "baptism":     return "Dobrodošli na krstu";
    case "graduation":  return "Dobrodošli na maturi";
    default:            return "Dobrodošli";
  }
}

const BROKEN_IMG_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1.5'%3E%3Crect x='2' y='7' width='20' height='14' rx='3'/%3E%3Ccircle cx='12' cy='14' r='3'/%3E%3C/svg%3E";

export function AlbumGuestView({ album, photos, passwordRequired, passwordCorrect, providedPassword: _pw, initialLang }: Props) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cameraFilesRef = useRef<FileList | null>(null);

  const t = translations[lang];
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
  };

  // ── Password gate ─────────────────────────────────────────────────────────
  if (passwordRequired && !passwordCorrect) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: BRAND.bg }}>
        {/* Top accent line */}
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
              <form onSubmit={(e) => {
                e.preventDefault();
                if (pwInput) {
                  const url = new URL(window.location.href);
                  url.searchParams.set("pw", pwInput);
                  url.searchParams.set("lang", lang);
                  router.push(url.pathname + url.search);
                }
              }}>
                <input
                  type="password"
                  value={pwInput}
                  onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                  placeholder={t.passwordPlaceholder}
                  className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 transition-all mb-3"
                  style={{ borderColor: BRAND.border }}
                />
                {pwError && <p className="text-xs text-red-500 mb-3">{t.wrongPassword}</p>}
                <button type="submit" className="w-full py-3 text-white font-semibold rounded-xl transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: BRAND.dark }}>
                  {t.openAlbum}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Lang switcher footer */}
        <div className="flex justify-center gap-1 py-4">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => switchLang(l.code)} title={l.native}
              className="px-2 py-1 rounded-lg text-sm transition-all hover:bg-gray-100"
              style={lang === l.code ? { background: BRAND.accentLight, color: BRAND.accent } : { color: BRAND.muted }}
            >{l.flag}</button>
          ))}
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
    <div className="min-h-screen" style={{ background: BRAND.bg }}>

      {/* ── Top accent line ──────────────────────────────────────────────────── */}
      <div className="h-1 w-full" style={{ background: BRAND.accent }} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b" style={{ borderColor: BRAND.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: album name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg shrink-0">{evtIcon}</span>
            <span className="font-bold text-sm truncate" style={{ color: BRAND.dark }}>{album.coupleName}</span>
            {photos.length > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-xs font-medium shrink-0" style={{ color: BRAND.accent }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BRAND.accent }} />
                V živo
              </span>
            )}
          </div>

          {/* Right: lang + upload CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center gap-0.5">
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => switchLang(l.code)} title={l.native}
                  className="px-1.5 py-1 rounded-lg text-sm transition-all hover:bg-gray-100"
                  style={lang === l.code ? { background: BRAND.accentLight } : {}}
                >{l.flag}</button>
              ))}
            </div>

            {/* Upload button — only if not full */}
            {!albumFull && nameConfirmed && (
              <button
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: BRAND.dark }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="hidden sm:inline">Dodaj spomine</span>
                <span className="sm:hidden">Naloži</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Page body ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Album info row ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">

          {/* Cover image (if set) */}
          {album.coverImageUrl && (
            <div className="relative w-full sm:w-56 h-40 sm:h-36 rounded-2xl overflow-hidden shrink-0">
              <Image src={album.coverImageUrl} alt={album.coupleName} fill className="object-cover" priority />
            </div>
          )}

          {/* Album meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: BRAND.dark }}>{album.coupleName}</h1>
            <p className="text-sm mb-3" style={{ color: BRAND.muted }}>
              {album.weddingDate}{album.location ? ` · ${album.location}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: BRAND.muted }}>
              <span>{t.photos(photos.length)}</span>
              <CountdownTimer targetDate={album.weddingDate} translations={t} />
            </div>
          </div>

          {/* Mobile lang switcher */}
          <div className="flex sm:hidden items-center gap-0.5">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => switchLang(l.code)} title={l.native}
                className="px-1.5 py-1 rounded-lg text-sm transition-all hover:bg-gray-100"
                style={lang === l.code ? { background: BRAND.accentLight } : {}}
              >{l.flag}</button>
            ))}
          </div>
        </div>

        {/* ── Album full notice ───────────────────────────────────────────── */}
        {albumFull && (
          <div className="bg-white border rounded-2xl p-5 mb-6 flex items-start gap-3" style={{ borderColor: "#FCA5A5" }}>
            <span className="text-2xl shrink-0">🔒</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: BRAND.dark }}>Galerija je polna</p>
              <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>Lastnik mora nadgraditi paket, da gostje lahko nadaljujejo.</p>
            </div>
          </div>
        )}

        {/* ── Name + upload section ─────────────────────────────────────────── */}
        {!albumFull && (
          <div className="bg-white border rounded-2xl p-6 mb-8" style={{ borderColor: BRAND.border }}>
            {!nameConfirmed ? (
              /* Name entry */
              <div className="max-w-md">
                <p className="font-semibold text-sm mb-1" style={{ color: BRAND.dark }}>{eventGreeting(album.eventType ?? "other")} {evtIcon}</p>
                <p className="text-sm mb-4" style={{ color: BRAND.muted }}>Vnesite ime preden naložite fotografije — prikazano bo ob vaših posnetkih.</p>
                <div className="flex gap-2">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmName()}
                    placeholder="npr. Ana Novak"
                    autoComplete="given-name"
                    className="flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                    style={{ borderColor: BRAND.border }}
                  />
                  <button
                    onClick={confirmName}
                    disabled={!uploaderName.trim()}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30 hover:opacity-90 active:scale-[0.98] shrink-0"
                    style={{ background: BRAND.dark }}
                  >
                    Naprej →
                  </button>
                </div>
              </div>
            ) : (
              /* Upload actions */
              <div className="flex flex-wrap items-center gap-3">
                {/* Avatar + name */}
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: BRAND.accent }}>
                    {uploaderName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: BRAND.dark }}>{uploaderName}</span>
                  <button onClick={() => setNameConfirmed(false)} className="text-xs underline" style={{ color: BRAND.muted }}>Spremeni</button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {/* Camera */}
                  <label className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: BRAND.dark }}>
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                    Fotografiraj
                    <input type="file" accept="image/*,video/*" capture="environment" multiple className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => { if (e.target.files?.length) { cameraFilesRef.current = e.target.files; setUploadOpen(true); } }} />
                  </label>

                  {/* Gallery */}
                  <button
                    onClick={() => setUploadOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-gray-50 active:scale-[0.98]"
                    style={{ borderColor: BRAND.border, color: BRAND.dark }}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Naloži iz galerije
                  </button>
                </div>

                <p className="w-full text-xs mt-1" style={{ color: BRAND.muted }}>📷 Fotografije · 🎥 Videi · polna kakovost</p>
              </div>
            )}
          </div>
        )}

        {/* ── Gallery ──────────────────────────────────────────────────────── */}
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-25">{evtIcon}</div>
            <p className="text-sm" style={{ color: BRAND.muted }}>{t.noPhotosDesc}</p>
          </div>
        ) : (
          <>
            {/* Section label */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.muted }}>Skupni spomini</span>
              <div className="flex-1 h-px" style={{ background: BRAND.border }} />
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: BRAND.accent }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BRAND.accent }} />
                V živo
              </div>
            </div>

            <div className="masonry-grid">
              {photos.map((photo, index) => {
                const isVideo = photo.mimeType?.startsWith("video/") ?? false;
                const lightboxIdx = photos.slice(0, index + 1).filter((p) => !p.mimeType?.startsWith("video/")).length - 1;

                return (
                  <div key={photo.id} className="masonry-item group rounded-xl overflow-hidden bg-gray-100">
                    {isVideo ? (
                      <div className="relative bg-black rounded-xl overflow-hidden">
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
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-end rounded-xl">
                          {photo.uploaderName && (
                            <p className="text-xs text-white font-medium p-2.5 opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                              {photo.uploaderName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t mt-12 py-6 text-center" style={{ borderColor: BRAND.border }}>
        <p className="text-xs" style={{ color: BRAND.muted }}>
          Guestcam · <a href="https://guestcam.si" className="hover:underline">guestcam.si</a>
        </p>
      </footer>

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
