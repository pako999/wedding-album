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

  // ── Name state ───────────────────────────────────────────────────────────────
  const [uploaderName, setUploaderName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  const switchLang = (l: Lang) => {
    setLang(l);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState({}, "", url.toString());
  };

  const confirmName = () => {
    if (uploaderName.trim()) {
      setUploaderName(uploaderName.trim());
      setNameConfirmed(true);
    }
  };

  const LangSwitcher = () => (
    <div className="flex items-center gap-1 flex-wrap">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLang(l.code)}
          title={l.native}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-sans text-xs transition-all ${
            lang === l.code
              ? "bg-[#C4738A] text-white"
              : "text-[#2C2825]/40 hover:text-[#2C2825] hover:bg-black/5"
          }`}
        >
          <span>{l.flag}</span>
        </button>
      ))}
    </div>
  );

  // ── Password gate ─────────────────────────────────────────────────────────────
  if (passwordRequired && !passwordCorrect) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 gap-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <p className="font-serif italic text-[#C9A96E] text-lg mb-2">{t.albumTitle}</p>
            <h1 className="font-serif text-3xl font-light text-[#2C2825]">{album.coupleName}</h1>
            <p className="font-sans text-sm text-[#2C2825]/60 mt-1">{album.weddingDate}</p>
          </div>
          <div className="border border-[#C9A96E]/30 bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#C4738A]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#C4738A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p className="font-sans text-sm text-[#2C2825]/70 mb-5">{t.passwordProtected}</p>
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
              className="space-y-3"
            >
              <input
                type="password"
                value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                placeholder={t.passwordPlaceholder}
                className="w-full px-4 py-3 border border-[#C9A96E]/30 rounded-xl bg-[#FAF7F2] font-sans text-sm text-[#2C2825] placeholder:text-[#2C2825]/30 outline-none focus:border-[#C9A96E] transition-colors"
              />
              {pwError && <p className="font-sans text-xs text-red-500">{t.wrongPassword}</p>}
              <button type="submit" className="w-full py-3 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm font-medium rounded-xl hover:bg-[#C9A96E] transition-colors">
                {t.openAlbum}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Lightbox only for photos
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
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* ── Minimal top bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Heart icon */}
            <svg className="w-4 h-4 text-[#C4738A]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span className="font-semibold text-sm text-[#1a1a2e] truncate max-w-[180px]">{album.coupleName}</span>
          </div>
          <LangSwitcher />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Album header card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {album.coverImageUrl ? (
            <div className="relative h-48">
              <Image src={album.coverImageUrl} alt={album.coupleName} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                <h1 className="font-serif text-2xl font-light">{album.coupleName}</h1>
                <p className="font-sans text-xs text-white/70 mt-0.5">
                  {album.weddingDate}{album.location ? ` · ${album.location}` : ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-5 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#C4738A]/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#C4738A]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-light text-[#1a1a2e]">{album.coupleName}</h1>
              <p className="font-sans text-xs text-gray-400 mt-1">
                {album.weddingDate}{album.location ? ` · ${album.location}` : ""}
              </p>
            </div>
          )}

          {/* Stats row */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4">
            <p className="font-sans text-xs text-gray-400">{t.photos(photos.length)}</p>
            <CountdownTimer targetDate={album.weddingDate} translations={t} />
          </div>
        </div>

        {/* ── NAME STEP — big card, can't be missed ─────────────────────────── */}
        {!nameConfirmed ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Colored top strip */}
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #C4738A, #C9A96E)" }} />

            <div className="px-6 py-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#C4738A]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#C4738A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e] text-base">Dobrodošli! 👋</p>
                  <p className="text-xs text-gray-400">Vnesite ime preden naložite fotografije</p>
                </div>
              </div>

              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Vaše ime
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmName()}
                placeholder="npr. Ana Novak"
                autoComplete="given-name"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 font-sans text-base text-[#1a1a2e] placeholder:text-gray-300 outline-none focus:border-[#C4738A] focus:bg-white transition-all mb-4"
              />

              <button
                onClick={confirmName}
                disabled={!uploaderName.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-base text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{ background: uploaderName.trim() ? "linear-gradient(135deg, #C4738A, #C9A96E)" : "#d1d5db" }}
              >
                Začni deliti spomine →
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Ime bo prikazano ob vaših fotografijah
              </p>
            </div>
          </div>
        ) : (
          /* ── UPLOAD BUTTONS — shown after name ─────────────────────────────── */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #C4738A, #C9A96E)" }} />
            <div className="px-5 py-5">
              {/* Greeting */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#C4738A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {uploaderName.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-sm text-[#1a1a2e]">Zdravo, {uploaderName}! 😊</p>
                </div>
                <button
                  onClick={() => setNameConfirmed(false)}
                  className="text-xs text-gray-400 hover:text-[#C4738A] transition-colors"
                >
                  Spremeni ime
                </button>
              </div>

              {/* Two upload buttons */}
              <div className="flex flex-col gap-3">
                {/* Take photo with camera */}
                <label className="relative flex items-center justify-center gap-3 px-5 py-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] select-none"
                  style={{ background: "#1a1a2e" }}>
                  <svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <span className="font-bold text-white text-base">Fotografiraj zdaj</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.length) setUploadOpen(true);
                    }}
                  />
                </label>

                {/* Upload from gallery */}
                <button
                  onClick={() => setUploadOpen(true)}
                  className="flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-[#C4738A]/40 hover:bg-[#C4738A]/5 transition-all active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 text-[#1a1a2e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="font-bold text-[#1a1a2e] text-base">Naloži iz galerije</span>
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-3">
                📷 Fotografije · 🎥 Videi · polna kakovost
              </p>
            </div>
          </div>
        )}

        {/* ── Recent photos label ────────────────────────────────────────────── */}
        {photos.length > 0 && (
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest whitespace-nowrap">
              Zadnji spomini
            </span>
            <div className="flex items1-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-500 font-medium">V živo</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* ── Photo / video grid ─────────────────────────────────────────────── */}
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">{t.noPhotosDesc}</p>
          </div>
        ) : (
          <div className="masonry-grid pb-8">
            {photos.map((photo, index) => {
              const isVideo = photo.mimeType?.startsWith("video/") ?? false;
              const lightboxIdx = photos
                .slice(0, index + 1)
                .filter((p) => !p.mimeType?.startsWith("video/")).length - 1;

              return (
                <div key={photo.id} className="masonry-item group rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                  {isVideo ? (
                    <div className="relative bg-black rounded-xl overflow-hidden">
                      {photo.cfStreamVideoId ? (
                        <div style={{ position: "relative", paddingTop: "56.25%" }}>
                          <iframe
                            src={photo.blobUrl}
                            style={{ border: "none", position: "absolute", top: 0, left: 0, height: "100%", width: "100%" }}
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          src={photo.blobUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-auto block max-h-80 object-contain"
                          style={{ background: "#111" }}
                        />
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
                        src={photo.thumbnailUrl ?? photo.blobUrl}
                        alt={photo.caption ?? ""}
                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-end">
                        {photo.uploaderName && (
                          <p className="font-sans text-xs text-white/90 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
        )}

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <footer className="text-center py-4 border-t border-gray-100">
          <p className="font-sans text-xs text-gray-400">
            {t.footerCredit} · <a href="https://wedflow.app" className="hover:text-[#C4738A] transition-colors">wedflow.app</a>
          </p>
        </footer>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      {photos.length > 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[Download, Counter]}
          styles={{ container: { backgroundColor: "rgba(0,0,0,0.95)" } }}
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
          onClose={() => setUploadOpen(false)}
          onNameChange={(name) => setUploaderName(name)}
          onSuccess={() => {
            setUploadOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
