"use client";

/**
 * PhotoWall — the TV-facing "photo wall" display.
 *
 * Meant to be opened once on a smart TV / Chromecast / tablet and left
 * running for the whole event: no controls, no interaction required.
 *
 * Layout: one large photo holds the centre stage while smaller recent
 * shots sit scattered down both sides. Newly uploaded photos FLY IN from
 * the nearest edge into a side slot (with a brief highlight ring) so the
 * room notices the moment someone shares something, then get shuffled
 * into the general rotation like everything else.
 *
 * Everything is driven off a poll of the wall API, so nobody ever has to
 * touch the screen. A QR code stays pinned in the corner the whole time
 * for anyone who wants to add their own photos.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";
import { GuestcamLogo } from "@/components/GuestcamLogo";

const POLL_MS = 8_000;     // how often we check for new uploads
const SHUFFLE_MS = 11_000; // how often the side thumbnails reshuffle

export interface WallPhoto {
  id: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  uploaderName: string | null;
}

/** Display options, all driven by query params on the wall URL so the
 *  owner can tune the screen without a redeploy or a DB write. */
export interface WallSettings {
  /** Milliseconds each photo holds the centre stage. */
  slideMs: number;
  showSides: boolean;
  showQr: boolean;
  showNames: boolean;
  showTitle: boolean;
  showBranding: boolean;
}

/** Scatter positions for the side thumbnails. Deliberately hand-placed
 *  (rather than an even grid) so the wall reads as a collage instead of
 *  a filmstrip — sizes and tilts vary to keep it lively.
 *
 *  The vertical bands dodge the fixed overlays: the branding pill sits
 *  top-left and the QR card bottom-left, so the left column is kept
 *  between roughly 12% and 70% of the viewport height. Thumbnails also
 *  render at a FIXED height (see THUMB_RATIO) — letting a 9:16 phone
 *  photo size itself would push the lowest left thumbnail straight into
 *  the QR card on shorter screens. */
const SIDE_SLOTS = [
  { side: "left",  top: "12%", edge: "2.5%", size: 132, rot: -4 },
  { side: "left",  top: "36%", edge: "5.5%", size: 106, rot:  3 },
  { side: "left",  top: "56%", edge: "2%",   size: 140, rot: -2 },
  { side: "right", top: "13%", edge: "3%",   size: 120, rot:  4 },
  { side: "right", top: "41%", edge: "1.5%", size: 148, rot: -3 },
  { side: "right", top: "69%", edge: "5%",   size: 110, rot:  2 },
] as const;

/** Thumbnail height as a multiple of its width. Keeps the collage tidy
 *  and, more importantly, makes the layout predictable regardless of
 *  each photo's real aspect ratio. */
const THUMB_RATIO = 1.15;

type SlotAnim = "fly" | "fade" | "none";
interface SlotState {
  photo: WallPhoto | null;
  anim: SlotAnim;
  /** Bumped on every change so React remounts the <img> and the CSS
   *  animation restarts from frame 0. */
  key: number;
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props {
  token: string;
  pw?: string;
  coupleName: string;
  albumUrl: string;
  initialPhotos: WallPhoto[];
  settings: WallSettings;
}

export function PhotoWall({ token, pw, coupleName, albumUrl, initialPhotos, settings }: Props) {
  const [photos, setPhotos] = useState<WallPhoto[]>(initialPhotos);
  // initialPhotos arrives oldest-first, so the last entry is the newest.
  const [center, setCenter] = useState<WallPhoto | null>(
    initialPhotos.length ? initialPhotos[initialPhotos.length - 1] : null,
  );
  const [centerKey, setCenterKey] = useState(0);

  const knownIds = useRef(new Set(initialPhotos.map((p) => p.id)));
  const keyCounter = useRef(0);
  const nextKey = () => ++keyCounter.current;
  /** Play queue for the centre stage — refilled (reshuffled) on wrap. */
  const queue = useRef<WallPhoto[]>([]);
  /** Round-robin cursor so consecutive arrivals land in different slots. */
  const slotCursor = useRef(0);

  const [slots, setSlots] = useState<SlotState[]>(() => {
    const recent = [...initialPhotos].reverse(); // newest first
    return SIDE_SLOTS.map((_, i) => ({
      photo: recent.length ? recent[i % recent.length] : null,
      anim: "none" as SlotAnim,
      key: 0,
    }));
  });

  // ── Poll for new uploads ────────────────────────────────────────────
  // Fresh photos are appended to the pool AND flown into a side slot, so
  // the room sees them arrive rather than waiting for the rotation.
  useEffect(() => {
    const pollUrl = `/api/wall/${token}${pw ? `?pw=${encodeURIComponent(pw)}` : ""}`;
    const id = setInterval(async () => {
      try {
        const res = await fetch(pollUrl, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { photos: WallPhoto[] };
        const fresh = data.photos.filter((p) => !knownIds.current.has(p.id));
        if (fresh.length === 0) return;
        fresh.forEach((p) => knownIds.current.add(p.id));
        // API returns newest first — flip so they play in upload order.
        const arrivals = fresh.reverse();
        setPhotos((prev) => [...prev, ...arrivals]);
        setSlots((prev) => {
          const next = [...prev];
          arrivals.forEach((p) => {
            const i = slotCursor.current % SIDE_SLOTS.length;
            slotCursor.current += 1;
            next[i] = { photo: p, anim: "fly", key: nextKey() };
          });
          return next;
        });
      } catch {
        // Offline TV / flaky venue wifi — just try again on the next tick.
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [token, pw]);

  // ── Centre stage rotation ───────────────────────────────────────────
  const advance = useCallback(() => {
    if (photos.length === 0) return;
    if (queue.current.length === 0) queue.current = shuffled(photos);
    let next = queue.current.pop() ?? null;
    // Avoid showing the same photo twice in a row when the pool is big
    // enough for it to matter.
    if (next && center && next.id === center.id && photos.length > 1) {
      if (queue.current.length === 0) queue.current = shuffled(photos);
      next = queue.current.pop() ?? next;
    }
    if (!next) return;
    setCenter(next);
    setCenterKey(nextKey());
  }, [photos, center]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const t = setTimeout(advance, settings.slideMs);
    return () => clearTimeout(t);
  }, [advance, centerKey, photos.length, settings.slideMs]);

  // ── Reshuffle the side thumbnails ───────────────────────────────────
  useEffect(() => {
    if (!settings.showSides || photos.length === 0) return;
    const id = setInterval(() => {
      setSlots((prev) => {
        // Prefer photos that aren't currently centre stage so the wall
        // isn't showing the same shot big and small simultaneously.
        const pool = shuffled(
          photos.length > 1 && center ? photos.filter((p) => p.id !== center.id) : photos,
        );
        if (pool.length === 0) return prev;
        return prev.map((s, i) => ({
          photo: pool[i % pool.length],
          anim: "fade" as SlotAnim,
          key: nextKey(),
        }));
      });
    }, SHUFFLE_MS);
    return () => clearInterval(id);
  }, [photos, center, settings.showSides]);

  const qrSrc =
    `https://api.qrserver.com/v1/create-qr-code/?size=260x260&qzone=1&format=png` +
    `&bgcolor=ffffff&color=0F1729&data=${encodeURIComponent(albumUrl)}`;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      <style>{`
        @keyframes wallCenterIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes wallFlyLeft {
          0%   { opacity: 0; transform: translate3d(-60vw, 12vh, 0) scale(.45); }
          70%  { opacity: 1; }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes wallFlyRight {
          0%   { opacity: 0; transform: translate3d(60vw, 12vh, 0) scale(.45); }
          70%  { opacity: 1; }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes wallSlotFade {
          from { opacity: 0; transform: scale(.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        /* Highlight ring that pulses once as a new photo lands. */
        @keyframes wallNewRing {
          0%   { box-shadow: 0 0 0 0 rgba(255,201,77,.85); }
          100% { box-shadow: 0 0 0 22px rgba(255,201,77,0); }
        }
      `}</style>

      {center ? (
        <>
          {/* Blurred ambient background fills any letterboxing */}
          <img
            src={bunnyDisplayUrl(center.thumbnailUrl ?? center.blobUrl, 400, 30)}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{ filter: "blur(34px)", opacity: 0.28 }}
          />
          {/* Centre stage. Inset so the side collage has room to breathe. */}
          <div className="absolute inset-y-[4%] inset-x-[16%] flex items-center justify-center">
            <img
              key={centerKey}
              src={bunnyDisplayUrl(center.blobUrl, 2000, 90)}
              alt=""
              className="max-w-full max-h-full object-contain rounded-2xl"
              style={{
                animation: "wallCenterIn .7s cubic-bezier(.4,0,.2,1) forwards",
                boxShadow: "0 24px 80px rgba(0,0,0,.6)",
              }}
            />
          </div>
          {settings.showNames && center.uploaderName && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-5 py-2 rounded-full text-white/90 text-lg">
              {center.uploaderName}
            </div>
          )}
        </>
      ) : (
        // No photos yet — the QR is the whole point of this screen.
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <p className="font-serif text-white text-5xl mb-4">{coupleName}</p>
          <p className="text-white/50 text-2xl">Skenirajte QR kodo in delite prve fotografije</p>
        </div>
      )}

      {/* ── Side collage ─────────────────────────────────────────────── */}
      {settings.showSides &&
        SIDE_SLOTS.map((slot, i) => {
          const state = slots[i];
          if (!state?.photo) return null;
          const pos =
            slot.side === "left"
              ? { top: slot.top, left: slot.edge }
              : { top: slot.top, right: slot.edge };
          const anim =
            state.anim === "fly"
              ? `${slot.side === "left" ? "wallFlyLeft" : "wallFlyRight"} 1.15s cubic-bezier(.16,.9,.3,1) forwards`
              : state.anim === "fade"
                ? "wallSlotFade .8s ease-out forwards"
                : undefined;
          return (
            <div
              key={i}
              className="absolute"
              style={{ ...pos, width: slot.size, transform: `rotate(${slot.rot}deg)` }}
            >
              <img
                key={state.key}
                src={bunnyDisplayUrl(state.photo.thumbnailUrl ?? state.photo.blobUrl, 320, 78)}
                alt=""
                className="w-full rounded-xl border-2 border-white/80 object-cover"
                style={{
                  height: Math.round(slot.size * THUMB_RATIO),
                  animation: anim,
                  boxShadow: "0 10px 34px rgba(0,0,0,.55)",
                  ...(state.anim === "fly"
                    ? { animationName: `${slot.side === "left" ? "wallFlyLeft" : "wallFlyRight"}, wallNewRing` }
                    : null),
                }}
              />
            </div>
          );
        })}

      {/* Couple name — top-right, so it never collides with the branding. */}
      {settings.showTitle && (
        <div className="absolute top-6 right-6 bg-black/45 backdrop-blur-sm px-5 py-2.5 rounded-full">
          <p className="text-white font-serif text-xl">{coupleName}</p>
        </div>
      )}

      {/* Branding — top-left */}
      {settings.showBranding && (
        <a
          href="https://www.guestcam.si"
          target="_blank"
          rel="noreferrer"
          className="absolute top-6 left-6 flex items-center gap-2.5 bg-black/45 backdrop-blur-sm pl-3 pr-4 py-2 rounded-full no-underline"
        >
          <GuestcamLogo size="sm" variant="onDark" />
          <span className="text-white/45 text-xs whitespace-nowrap">Powered by guestcam.si</span>
        </a>
      )}

      {/* Persistent QR overlay — bottom-left */}
      {settings.showQr && (
        <div className="absolute bottom-6 left-6 flex items-center gap-4 bg-black/55 backdrop-blur-sm rounded-2xl p-4">
          <img
            src={qrSrc}
            alt="QR koda za nalaganje fotografij"
            className="w-28 h-28 rounded-lg bg-white p-1.5 shrink-0"
          />
          <div className="max-w-[220px]">
            <p className="text-white font-semibold text-base leading-snug">
              Skenirajte in delite svoje fotografije!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
