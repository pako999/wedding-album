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

  const t = translations[lang];

  const switchLang = (l: Lang) => {
    setLang(l);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState({}, "", url.toString());
  };

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

  // ── Password gate ─────────────────────────────────────────────────────────────
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
              {pwError && <p className="font-sans text-xs text-red-500">{t.wrongPassword}</p>}
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

      {/* ── Hero header ───────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {album.coverImageUrl ? (
          <div className="relative h-64 sm:h-80 lg:h-96">
            <Image src={album.coverImageUrl} alt={album.coupleName} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-white text-center px-6">
              <p className="font-serif italic text-[#C9A96E] text-base mb-2">{t.albumTitle}</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-light leading-tight">{album.coupleName}</h1>
              <p className="font-sans text-sm mt-2 text-white/80">
                {album.weddingDate}{album.location ? ` · ${album.location}` : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F0E8D8] py-14 text-center border-b border-[#C9A96E]/20">
            {/* Heart icon */}
            <div className="w-14 h-14 rounded-full bg-[#C4738A]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#C4738A]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#2C2825]">{album.coupleName}</h1>
            <p className="font-sans text-sm mt-2 text-[#2C2825]/60">
              {album.weddingDate}{album.location ? ` · ${album.location}` : ""}
            </p>
          </div>
        )}
      </header>

      {/* ── Stats + lang ──────────────────────────────────────────────────────── */}
      <div className="border-b border-[#C9A96E]/20 bg-white/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <p className="font-sans text-xs text-[#2C2825]/60">{t.photos(photos.length)}</p>
            <CountdownTimer targetDate={album.weddingDate} translations={t} />
          </div>
          <LangSwitcher />
        </div>
      </div>

      {/* ── Upload section — always visible ──────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Welcome message */}
        <p className="text-center font-sans text-sm text-[#2C2825]/60 mb-5">
          Podelite spomine z nami ❤️
        </p>

        {/* Two prominent upload buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Camera / Take photo */}
          <label className="flex-1 flex items-center justify-center gap-3 px-6 py-5 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98]"
            style={{ background: "#1a1a2e", color: "white" }}>
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            <span className="font-semibold text-base">Fotografiraj zdaj</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setUploadOpen(true);
                }
              }}
            />
          </label>

          {/* Upload from gallery */}
          <button
            onClick={() => setUploadOpen(true)}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-2 border-[#2C2825]/15 bg-white hover:border-[#C9A96E]/60 hover:bg-[#FAF7F2] transition-all duration-200 active:scale-[0.98]"
          >
            <svg className="w-6 h-6 text-[#2C2825] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="font-semibold text-base text-[#2C2825]">Naloži iz galerije</span>
          </button>
        </div>

        {/* Divider */}
        {photos.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#C9A96E]/20" />
            <p className="font-sans text-xs text-[#2C2825]/40 font-medium tracking-wider uppercase">Zadnji spomini</p>
            <div className="flex-1 h-px bg-[#C9A96E]/20" />
          </div>
        )}
      </div>

      {/* ── Photo / video grid ───────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 pb-12">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="font-sans text-sm text-[#2C2825]/40">{t.noPhotosDesc}</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {photos.map((photo, index) => {
              const isVideo = photo.mimeType?.startsWith("video/") ?? false;
              const lightboxIdx = photos
                .slice(0, index + 1)
                .filter((p) => !p.mimeType?.startsWith("video/")).length - 1;

              return (
                <div key={photo.id} className="masonry-item group rounded-xl overflow-hidden bg-[#C9A96E]/5">
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
                          className="w-full h-auto block max-h-96 object-contain"
                          style={{ background: "#1a1a1a" }}
                        />
                      )}
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
                    <div className="relative cursor-pointer" onClick={() => setLightboxIndex(lightboxIdx)}>
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
                      {photo.uploaderName && (
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <p className="text-white text-[10px] truncate">{photo.uploaderName}</p>
                        </div>
                      )}
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
