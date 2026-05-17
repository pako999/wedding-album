"use client";

import { useState } from "react";
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
import type { Album, Photo } from "@/lib/db/schema";

interface Props {
  album: Album;
  photos: Photo[];
  passwordRequired: boolean;
  passwordCorrect: boolean;
  providedPassword?: string;
  initialLang: Lang;
}

export function AlbumGuestView({
  album,
  photos,
  passwordRequired,
  passwordCorrect,
  providedPassword,
  initialLang,
}: Props) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [nameSet, setNameSet] = useState(false);

  const t = translations[lang];

  const switchLang = (l: Lang) => {
    setLang(l);
    // Update URL param for shareable links (replaces current history entry silently)
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState({}, "", url.toString());
  };

  // ── Language switcher strip ──────────────────────────────────────────────────
  const LangSwitcher = () => (
    <div className="flex items-center gap-1.5 flex-wrap">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLang(l.code)}
          title={l.native}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-sans text-xs transition-all ${
            lang === l.code
              ? "bg-[#C9A96E] text-white shadow-sm"
              : "bg-white/60 text-[#2C2825]/60 hover:bg-white hover:text-[#2C2825] border border-[#C9A96E]/20"
          }`}
        >
          <span className="text-sm leading-none">{l.flag}</span>
          <span className="hidden sm:inline">{l.native}</span>
        </button>
      ))}
    </div>
  );

  // ── Password gate ────────────────────────────────────────────────────────────
  if (passwordRequired && !passwordCorrect) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 gap-6">
        <LangSwitcher />
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <p className="font-serif italic text-[#C9A96E] text-lg mb-2">{t.albumTitle}</p>
            <h1 className="font-serif text-3xl font-light text-[#2C2825]">{album.coupleName}</h1>
            <p className="font-sans text-sm text-[#2C2825]/60 mt-1">{album.weddingDate}</p>
          </div>
          <div className="border border-[#C9A96E]/30 bg-white/70 rounded-2xl p-8">
            <p className="font-sans text-sm text-[#2C2825]/70 mb-6">{t.passwordProtected}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (pwInput) {
                  const url = new URL(window.location.href);
                  url.searchParams.set("pw", pwInput);
                  url.searchParams.set("lang", lang);
                  router.push(url.pathname + url.search);
                }
              }}
              className="space-y-4"
            >
              <input
                type="password"
                value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                placeholder={t.passwordPlaceholder}
                className="w-full px-4 py-3 border border-[#C9A96E]/30 rounded-xl bg-white font-sans text-sm text-[#2C2825] placeholder:text-[#2C2825]/30 outline-none focus:border-[#C9A96E] transition-colors"
              />
              {pwError && (
                <p className="font-sans text-xs text-red-500">{t.wrongPassword}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm font-medium rounded-xl hover:bg-[#C9A96E] transition-colors duration-200"
              >
                {t.openAlbum}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Lightbox only for photos (not videos)
  const lightboxSlides = photos
    .filter((p) => !p.mimeType?.startsWith("video/"))
    .map((p) => ({
      src: p.blobUrl,
      width: p.width ?? 1200,
      height: p.height ?? 800,
      download: { url: p.blobUrl, filename: p.originalFilename ?? "photo.jpg" },
      description: p.caption ?? undefined,
    }));

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {album.coverImageUrl ? (
          <div className="relative h-64 sm:h-80 lg:h-96">
            <Image
              src={album.coverImageUrl}
              alt={album.coupleName}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-white text-center px-6">
              <p className="font-serif italic text-[#C9A96E] text-base mb-2">{t.albumTitle}</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-light leading-tight">{album.coupleName}</h1>
              <p className="font-sans text-sm mt-2 text-white/80">
                {album.weddingDate}{album.location ? ` · ${album.location}` : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F0E8D8] py-16 text-center border-b border-[#C9A96E]/20">
            <p className="font-serif italic text-[#C9A96E] text-base mb-3">{t.albumTitle}</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#2C2825]">{album.coupleName}</h1>
            <p className="font-sans text-sm mt-2 text-[#2C2825]/60">
              {album.weddingDate}{album.location ? ` · ${album.location}` : ""}
            </p>
          </div>
        )}
      </header>

      {/* ── Stats + lang bar ─────────────────────────────────────────────────── */}
      <div className="border-b border-[#C9A96E]/20 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <p className="font-sans text-xs text-[#2C2825]/60">{t.photos(photos.length)}</p>
            <CountdownTimer targetDate={album.weddingDate} translations={t} />
          </div>
          <LangSwitcher />
        </div>
      </div>

      {/* ── Upload bar ───────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#C9A96E]/10 to-[#C9A96E]/5 border-b border-[#C9A96E]/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {!nameSet ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (uploaderName.trim()) setNameSet(true);
              }}
              className="flex items-center gap-3 w-full sm:w-auto"
            >
              <p className="font-sans text-sm text-[#2C2825]/70 shrink-0">{t.yourName}</p>
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="flex-1 sm:w-48 px-3 py-2 border border-[#C9A96E]/30 rounded-lg bg-white font-sans text-sm outline-none focus:border-[#C9A96E] transition-colors"
              />
              <button
                type="submit"
                disabled={!uploaderName.trim()}
                className="px-4 py-2 bg-[#C9A96E] text-white font-sans text-sm rounded-lg hover:bg-[#B8945A] transition-colors disabled:opacity-40"
              >
                {t.confirm}
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm text-[#2C2825]/70">{t.hello(uploaderName)}</span>
                <button
                  onClick={() => setNameSet(false)}
                  className="font-sans text-xs text-[#C9A96E] underline"
                >
                  {t.change}
                </button>
              </div>
              <button
                onClick={() => setUploadOpen(true)}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm font-medium rounded-xl hover:bg-[#C9A96E] transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.987 9.095H6.75z" />
                </svg>
                {t.uploadPhotos}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Photo grid ───────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {photos.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="font-serif text-xl font-light text-[#2C2825]/60 mb-2">{t.noPhotosTitle}</p>
            <p className="font-sans text-sm text-[#2C2825]/40">{t.noPhotosDesc}</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {photos.map((photo, index) => {
              const isVideo = photo.mimeType?.startsWith("video/") ?? false;
              // Only image photos go into the lightbox
              const lightboxIdx = photos
                .slice(0, index + 1)
                .filter((p) => !p.mimeType?.startsWith("video/")).length - 1;

              return (
                <div
                  key={photo.id}
                  className="masonry-item group rounded-xl overflow-hidden bg-[#C9A96E]/5"
                >
                  {isVideo ? (
                    /* ── Video tile ── */
                    <div className="relative bg-black rounded-xl overflow-hidden">
                      {photo.cfStreamVideoId ? (
                        /* Cloudflare Stream — iframe player with HLS/adaptive quality */
                        <div style={{ position: "relative", paddingTop: "56.25%" }}>
                          <iframe
                            src={`https://iframe.videodelivery.net/${photo.cfStreamVideoId}?controls=true&autoplay=false&loop=false&muted=false&poster=${encodeURIComponent(`https://videodelivery.net/${photo.cfStreamVideoId}/thumbnails/thumbnail.jpg?time=1s&height=400`)}`}
                            style={{ border: "none", position: "absolute", top: 0, left: 0, height: "100%", width: "100%" }}
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        /* Native video (R2 / Vercel Blob) */
                        <video
                          src={photo.blobUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-auto block max-h-96 object-contain"
                          style={{ background: "#1a1a1a" }}
                        />
                      )}
                      {/* Video badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-1 pointer-events-none z-10">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span className="text-white text-[10px] font-medium">Video</span>
                      </div>
                      {photo.uploaderName && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 pointer-events-none z-10">
                          <p className="text-white text-xs truncate">{photo.uploaderName}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── Photo tile ── */
                    <div
                      className="relative cursor-pointer"
                      onClick={() => setLightboxIndex(lightboxIdx)}
                    >
                      <img
                        src={photo.thumbnailUrl ?? photo.blobUrl}
                        alt={photo.caption ?? ""}
                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end">
                        {photo.caption && (
                          <p className="font-sans text-xs text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 leading-snug line-clamp-2">
                            {photo.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="text-center py-8 border-t border-[#C9A96E]/20">
        <p className="font-sans text-xs text-[#2C2825]/40">
          {t.footerCredit} · <a href="https://wedflow.app" className="hover:text-[#C9A96E] transition-colors">wedflow.app</a>
        </p>
      </footer>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {photos.length > 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[Download, Counter]}
          styles={{ container: { backgroundColor: "rgba(44, 40, 37, 0.97)" } }}
        />
      )}

      {/* ── Upload modal ─────────────────────────────────────────────────────── */}
      {uploadOpen && (
        <UploadModal
          albumSlug={album.slug}
          albumId={album.id}
          uploaderName={uploaderName}
          maxPhotos={album.maxPhotos}
          currentCount={album.photoCount}
          lang={lang}
          onClose={() => setUploadOpen(false)}
          onSuccess={() => {
            setUploadOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
