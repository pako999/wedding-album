"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import { UploadModal } from "./UploadModal";
import { CountdownTimer } from "./CountdownTimer";
import type { Album, Photo } from "@/lib/db/schema";

interface Props {
  album: Album;
  photos: Photo[];
  passwordRequired: boolean;
  passwordCorrect: boolean;
  providedPassword?: string;
}

export function AlbumGuestView({
  album,
  photos,
  passwordRequired,
  passwordCorrect,
  providedPassword,
}: Props) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [nameSet, setNameSet] = useState(false);

  // Password gate
  if (passwordRequired && !passwordCorrect) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <p className="font-serif italic text-[#C9A96E] text-lg mb-2">Poročni album</p>
            <h1 className="font-serif text-3xl font-light text-[#2C2825]">{album.coupleName}</h1>
            <p className="font-sans text-sm text-[#2C2825]/60 mt-1">{album.weddingDate}</p>
          </div>
          <div className="border border-[#C9A96E]/30 bg-white/70 rounded-2xl p-8">
            <p className="font-sans text-sm text-[#2C2825]/70 mb-6">
              Ta album je zaščiten z geslom.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (pwInput) {
                  router.push(`/${album.slug}?pw=${encodeURIComponent(pwInput)}`);
                }
              }}
              className="space-y-4"
            >
              <input
                type="password"
                value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                placeholder="Geslo"
                className="w-full px-4 py-3 border border-[#C9A96E]/30 rounded-xl bg-white font-sans text-sm text-[#2C2825] placeholder:text-[#2C2825]/30 outline-none focus:border-[#C9A96E] transition-colors"
              />
              {pwError && (
                <p className="font-sans text-xs text-red-500">Napačno geslo.</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm font-medium rounded-xl hover:bg-[#C9A96E] transition-colors duration-200"
              >
                Odpri album
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Name gate before uploading
  const handleUploadClick = () => {
    if (!nameSet) return; // show name input first
    setUploadOpen(true);
  };

  const lightboxSlides = photos.map((p) => ({
    src: p.blobUrl,
    width: p.width ?? 1200,
    height: p.height ?? 800,
    download: { url: p.blobUrl, filename: p.originalFilename ?? "foto.jpg" },
    description: p.caption ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero header */}
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
              <p className="font-serif italic text-[#C9A96E] text-base mb-2">Poročni album</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-light leading-tight">{album.coupleName}</h1>
              <p className="font-sans text-sm mt-2 text-white/80">{album.weddingDate}{album.location ? ` · ${album.location}` : ""}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F0E8D8] py-16 text-center border-b border-[#C9A96E]/20">
            <p className="font-serif italic text-[#C9A96E] text-base mb-3">Poročni album</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#2C2825]">{album.coupleName}</h1>
            <p className="font-sans text-sm mt-2 text-[#2C2825]/60">{album.weddingDate}{album.location ? ` · ${album.location}` : ""}</p>
          </div>
        )}
      </header>

      {/* Stats bar */}
      <div className="border-b border-[#C9A96E]/20 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <p className="font-sans text-xs text-[#2C2825]/60">
            {photos.length} {photos.length === 1 ? "fotografija" : "fotografij"}
          </p>
          <div className="flex items-center gap-3">
            {/* Countdown */}
            <CountdownTimer targetDate={album.weddingDate} />
          </div>
        </div>
      </div>

      {/* Upload bar */}
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
              <p className="font-sans text-sm text-[#2C2825]/70 shrink-0">Vaše ime:</p>
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                placeholder="Ana Novak"
                className="flex-1 sm:w-48 px-3 py-2 border border-[#C9A96E]/30 rounded-lg bg-white font-sans text-sm outline-none focus:border-[#C9A96E] transition-colors"
              />
              <button
                type="submit"
                disabled={!uploaderName.trim()}
                className="px-4 py-2 bg-[#C9A96E] text-white font-sans text-sm rounded-lg hover:bg-[#B8945A] transition-colors disabled:opacity-40"
              >
                Potrdi
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm text-[#2C2825]/70">Zdravo, <strong>{uploaderName}</strong></span>
                <button
                  onClick={() => setNameSet(false)}
                  className="font-sans text-xs text-[#C9A96E] underline"
                >
                  Spremeni
                </button>
              </div>
              <button
                onClick={() => setUploadOpen(true)}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm font-medium rounded-xl hover:bg-[#C9A96E] transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.987 9.095H6.75z" />
                </svg>
                Naloži fotografije
              </button>
            </>
          )}
        </div>
      </div>

      {/* Photo grid */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {photos.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="font-serif text-xl font-light text-[#2C2825]/60 mb-2">Še ni fotografij</p>
            <p className="font-sans text-sm text-[#2C2825]/40">Bodite prvi, ki naloži spomin.</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="masonry-item group cursor-pointer rounded-xl overflow-hidden bg-[#C9A96E]/5"
                onClick={() => setLightboxIndex(index)}
              >
                <div className="relative">
                  <img
                    src={photo.thumbnailUrl ?? photo.blobUrl}
                    alt={photo.caption ?? ""}
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end">
                    {photo.caption && (
                      <p className="font-sans text-xs text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 leading-snug line-clamp-2">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[#C9A96E]/20">
        <p className="font-sans text-xs text-[#2C2825]/40">
          Poročni album · <a href="https://wedflow.app" className="hover:text-[#C9A96E] transition-colors">WedFlow</a>
        </p>
      </footer>

      {/* Lightbox */}
      {photos.length > 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[Download, Counter]}
          styles={{
            container: { backgroundColor: "rgba(44, 40, 37, 0.97)" },
          }}
        />
      )}

      {/* Upload modal */}
      {uploadOpen && (
        <UploadModal
          albumSlug={album.slug}
          albumId={album.id}
          uploaderName={uploaderName}
          maxPhotos={album.maxPhotos}
          currentCount={album.photoCount}
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
