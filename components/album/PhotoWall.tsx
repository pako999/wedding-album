"use client";

/**
 * PhotoWall — the TV-facing "photo wall" display.
 *
 * Meant to be opened once on a smart TV / Chromecast / tablet and left
 * running for the whole event: no controls, no interaction required.
 * Auto-advances through recent photos and polls the wall API every few
 * seconds so new guest uploads join the rotation on their own — nobody
 * has to touch the screen. A QR code stays pinned in the corner the
 * whole time so anyone glancing at the wall can scan it and add their
 * own photos immediately.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";

const SLIDE_MS = 6_000;
const POLL_MS = 8_000;

export interface WallPhoto {
  id: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  uploaderName: string | null;
}

interface Props {
  slug: string;
  pw?: string;
  coupleName: string;
  albumUrl: string;
  initialPhotos: WallPhoto[];
}

export function PhotoWall({ slug, pw, coupleName, albumUrl, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<WallPhoto[]>(initialPhotos);
  const [idx, setIdx] = useState(0);
  const [imgKey, setImgKey] = useState(0);
  const knownIds = useRef(new Set(initialPhotos.map((p) => p.id)));

  // Poll for new uploads. New photos are appended so they join the
  // rotation without resetting whatever is currently on screen.
  useEffect(() => {
    const pollUrl = `/api/albums/${slug}/wall${pw ? `?pw=${encodeURIComponent(pw)}` : ""}`;
    const id = setInterval(async () => {
      try {
        const res = await fetch(pollUrl, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { photos: WallPhoto[] };
        const fresh = data.photos.filter((p) => !knownIds.current.has(p.id));
        if (fresh.length === 0) return;
        fresh.forEach((p) => knownIds.current.add(p.id));
        // Newest first from the API — append in upload order so they
        // play in the order guests actually shared them.
        setPhotos((prev) => [...prev, ...fresh.reverse()]);
      } catch {
        // Offline TV / flaky wifi — just try again on the next tick.
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [slug, pw]);

  const advance = useCallback(() => {
    setIdx((i) => (photos.length > 0 ? (i + 1) % photos.length : 0));
    setImgKey((k) => k + 1);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const t = setTimeout(advance, SLIDE_MS);
    return () => clearTimeout(t);
  }, [advance, idx, photos.length]);

  const qrSrc =
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&qzone=1&format=png` +
    `&bgcolor=ffffff&color=0F1729&data=${encodeURIComponent(albumUrl)}`;

  const photo = photos[idx];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      <style>{`
        @keyframes wallIn {
          from { opacity: 0; transform: scale(1.05); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {photo ? (
        <>
          {/* Blurred ambient background fills any letterboxing */}
          <img
            src={bunnyDisplayUrl(photo.thumbnailUrl ?? photo.blobUrl, 400, 30)}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{ filter: "blur(32px)", opacity: 0.25 }}
          />
          <img
            key={imgKey}
            src={bunnyDisplayUrl(photo.blobUrl, 2400, 90)}
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            style={{ animation: "wallIn 0.7s cubic-bezier(.4,0,.2,1) forwards" }}
          />
          {photo.uploaderName && (
            <div className="absolute top-6 right-6 bg-black/45 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-lg">
              {photo.uploaderName}
            </div>
          )}
        </>
      ) : (
        // No photos yet — the QR is the whole point of this screen.
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <p className="font-serif text-white text-4xl mb-3">{coupleName}</p>
          <p className="text-white/50 text-xl">Skenirajte QR kodo in delite prve fotografije</p>
        </div>
      )}

      {/* Couple name, top-left */}
      <div className="absolute top-6 left-6 bg-black/45 backdrop-blur-sm px-5 py-2.5 rounded-full">
        <p className="text-white font-serif text-xl">{coupleName}</p>
      </div>

      {/* Persistent QR overlay, bottom-left */}
      <div className="absolute bottom-6 left-6 flex items-center gap-4 bg-black/55 backdrop-blur-sm rounded-2xl p-4">
        <img src={qrSrc} alt="QR koda za nalaganje fotografij" className="w-28 h-28 rounded-lg bg-white p-1.5 shrink-0" />
        <div className="max-w-[220px]">
          <p className="text-white font-semibold text-base leading-snug">Skenirajte in delite svoje fotografije!</p>
        </div>
      </div>
    </div>
  );
}
