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
/** Fly-in animation length. A freshly uploaded photo is promoted to the
 *  centre stage once its fly-in finishes, so the room gets both the
 *  arrival animation AND the big reveal. */
const FLY_MS = 1_150;

export interface WallPhoto {
  id: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  uploaderName: string | null;
}

/** Background presets. `photo` (the default) uses a blurred copy of the
 *  current photo; the rest are flat colours for venues that want a
 *  calmer screen. `tone` drives the overlay/text colours so the pills
 *  stay readable on light backgrounds. */
export const WALL_BACKGROUNDS = {
  photo: { css: "#000000", tone: "dark",  blur: true  },
  dark:  { css: "#0F1729", tone: "dark",  blur: false },
  light: { css: "#F2F4F8", tone: "light", blur: false },
  warm:  { css: "#FFF9EC", tone: "light", blur: false },
} as const;
export type WallBackground = keyof typeof WALL_BACKGROUNDS;

/** Centre-stage transition styles. `kenburns` runs for the whole slide
 *  duration rather than a fixed length, so its animation is composed at
 *  render time from settings.slideMs. */
export const WALL_TRANSITIONS = {
  fade:     "wallCenterFade .7s cubic-bezier(.4,0,.2,1) forwards",
  slide:    "wallCenterSlide .75s cubic-bezier(.22,1,.36,1) forwards",
  kenburns: null, // composed below — needs the slide duration
} as const;
export type WallTransition = keyof typeof WALL_TRANSITIONS;

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
  background: WallBackground;
  transition: WallTransition;
  orientation: WallOrientation;
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

/** Portrait equivalent, for vertical screens and totems. A tall screen
 *  has no room for side columns without squeezing the centre stage to
 *  nothing, so the collage moves into bands above and below it. Left/
 *  right here means which half of the band the thumbnail sits in; the
 *  fly-in still comes from the nearer horizontal edge. */
const PORTRAIT_SLOTS = [
  { side: "left",  top: "8%",  edge: "6%",  size: 118, rot: -4 },
  { side: "right", top: "9%",  edge: "8%",  size: 100, rot:  3 },
  { side: "right", top: "18%", edge: "28%", size:  92, rot: -2 },
  { side: "left",  top: "74%", edge: "7%",  size: 118, rot:  3 },
  { side: "right", top: "75%", edge: "6%",  size: 108, rot: -3 },
  { side: "left",  top: "70%", edge: "30%", size:  92, rot:  2 },
] as const;

/** Both layouts expose the same number of slots, so the slot STATE is
 *  orientation-agnostic — only the positions differ at render time. */
const SLOT_COUNT = SIDE_SLOTS.length;

/** Thumbnail height as a multiple of its width. Keeps the collage tidy
 *  and, more importantly, makes the layout predictable regardless of
 *  each photo's real aspect ratio. */
const THUMB_RATIO = 1.15;

export type WallOrientation = "auto" | "landscape" | "portrait";

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
  /** True while the centre stage is showing a just-uploaded photo, so we
   *  can badge it. Cleared by the next ordinary rotation. */
  const [centerIsNew, setCenterIsNew] = useState(false);

  const knownIds = useRef(new Set(initialPhotos.map((p) => p.id)));
  const keyCounter = useRef(0);
  const nextKey = () => ++keyCounter.current;
  /** Play queue for the centre stage — refilled (reshuffled) on wrap. */
  const queue = useRef<WallPhoto[]>([]);
  /** Round-robin cursor so consecutive arrivals land in different slots. */
  const slotCursor = useRef(0);
  /** Pending "promote to centre" timers, cleared on unmount. */
  const promoteTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => promoteTimers.current.forEach(clearTimeout), []);

  // ── Orientation ─────────────────────────────────────────────────────
  // "auto" follows the actual screen so the same link works on a
  // landscape TV and a vertical totem; the explicit values let an owner
  // force a layout when the display reports something unhelpful.
  const [isPortrait, setIsPortrait] = useState(settings.orientation === "portrait");
  useEffect(() => {
    if (settings.orientation !== "auto") {
      setIsPortrait(settings.orientation === "portrait");
      return;
    }
    const mq = window.matchMedia("(orientation: portrait)");
    const apply = () => setIsPortrait(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.orientation]);

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
            const i = slotCursor.current % SLOT_COUNT;
            slotCursor.current += 1;
            next[i] = { photo: p, anim: "fly", key: nextKey() };
          });
          return next;
        });
        // Once the fly-in lands, promote the newest arrival to the centre
        // stage. Seeing your own photo go big within seconds of sharing is
        // the single biggest driver of more uploads from the room.
        const newest = arrivals[arrivals.length - 1];
        const t = setTimeout(() => {
          setCenter(newest);
          setCenterKey(nextKey());
          setCenterIsNew(true);
        }, FLY_MS);
        promoteTimers.current.push(t);
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
    setCenterIsNew(false);
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

  // Overlay chrome adapts to the background so the pills stay legible on
  // the light presets (white-on-white would be invisible).
  const bg = WALL_BACKGROUNDS[settings.background] ?? WALL_BACKGROUNDS.photo;
  const isLight = bg.tone === "light";
  const pillStyle = {
    background: isLight ? "rgba(255,255,255,.78)" : "rgba(0,0,0,.45)",
    color: isLight ? "#0F1729" : "#ffffff",
  };
  const mutedColor = isLight ? "rgba(15,23,41,.55)" : "rgba(255,255,255,.55)";

  // Ken Burns drifts for the full slide, so it can't be a fixed-length
  // constant like the other two.
  const centerAnimation =
    settings.transition === "kenburns"
      ? `wallCenterFade .7s cubic-bezier(.4,0,.2,1) forwards, wallKenBurns ${settings.slideMs}ms ease-out forwards`
      : (WALL_TRANSITIONS[settings.transition] ?? WALL_TRANSITIONS.fade);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: bg.css }}
    >
      <style>{`
        @keyframes wallCenterFade {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes wallCenterSlide {
          from { opacity: 0; transform: translate3d(6vw, 0, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        /* Slow drift for the whole slide — the classic "Ken Burns" look. */
        @keyframes wallKenBurns {
          from { transform: scale(1) translate3d(0, 0, 0); }
          to   { transform: scale(1.09) translate3d(-1.2%, -1.2%, 0); }
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
        @keyframes wallBadgeIn {
          from { opacity: 0; transform: translateY(14px) scale(.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {center ? (
        <>
          {/* Blurred ambient background fills any letterboxing. Only for
              the "photo" preset — the flat presets stay flat on purpose. */}
          {bg.blur && (
            <img
              src={bunnyDisplayUrl(center.thumbnailUrl ?? center.blobUrl, 400, 30)}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-110"
              style={{ filter: "blur(34px)", opacity: 0.28 }}
            />
          )}
          {/* Centre stage. Inset so the collage has room to breathe —
              side columns in landscape, top/bottom bands in portrait. */}
          <div
            className="absolute flex items-center justify-center"
            style={
              isPortrait
                ? { top: "30%", bottom: "32%", left: "5%", right: "5%" }
                : { top: "4%", bottom: "4%", left: "16%", right: "16%" }
            }
          >
            <img
              key={centerKey}
              src={bunnyDisplayUrl(center.blobUrl, 2000, 90)}
              alt=""
              className="max-w-full max-h-full object-contain rounded-2xl"
              style={{
                animation: centerAnimation,
                boxShadow: isLight ? "0 18px 60px rgba(15,23,41,.28)" : "0 24px 80px rgba(0,0,0,.6)",
              }}
            />
          </div>
          {(centerIsNew || (settings.showNames && center.uploaderName)) && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
              {centerIsNew && (
                <span
                  className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider text-[#0F1729]"
                  style={{ background: "#FFC94D", animation: "wallBadgeIn .5s cubic-bezier(.2,1.2,.3,1) forwards" }}
                >
                  Pravkar deljeno
                </span>
              )}
              {settings.showNames && center.uploaderName && (
                <span className="backdrop-blur-sm px-5 py-2 rounded-full text-lg" style={pillStyle}>
                  {center.uploaderName}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        // No photos yet. Early in the event this screen has exactly one
        // job — get the first guest to scan — so the QR goes full size,
        // centred, instead of sitting small in the corner.
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <p className="font-serif text-5xl mb-3" style={{ color: isLight ? "#0F1729" : "#ffffff" }}>
            {coupleName}
          </p>
          <p className="text-2xl mb-10" style={{ color: mutedColor }}>
            Skenirajte in delite prve fotografije
          </p>
          {settings.showQr && (
            <img
              src={qrSrc}
              alt="QR koda za nalaganje fotografij"
              className="w-[34vmin] h-[34vmin] rounded-3xl bg-white p-[2vmin]"
              style={{ boxShadow: "0 24px 80px rgba(0,0,0,.6)" }}
            />
          )}
        </div>
      )}

      {/* ── Side collage ─────────────────────────────────────────────── */}
      {settings.showSides &&
        (isPortrait ? PORTRAIT_SLOTS : SIDE_SLOTS).map((slot, i) => {
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
                  boxShadow: isLight ? "0 8px 26px rgba(15,23,41,.22)" : "0 10px 34px rgba(0,0,0,.55)",
                  ...(state.anim === "fly"
                    ? { animationName: `${slot.side === "left" ? "wallFlyLeft" : "wallFlyRight"}, wallNewRing` }
                    : null),
                }}
              />
            </div>
          );
        })}

      {/* Couple name — top-right, so it never collides with the branding.
          Hidden while the wall is empty, where the name is already the
          headline of the centred call-to-action. */}
      {settings.showTitle && center && (
        <div className="absolute top-6 right-6 backdrop-blur-sm px-5 py-2.5 rounded-full" style={pillStyle}>
          <p className="font-serif text-xl">{coupleName}</p>
        </div>
      )}

      {/* Branding — top-left */}
      {settings.showBranding && (
        <a
          href="https://www.guestcam.si"
          target="_blank"
          rel="noreferrer"
          className="absolute top-6 left-6 flex items-center gap-2.5 backdrop-blur-sm pl-3 pr-4 py-2 rounded-full no-underline"
          style={{ background: pillStyle.background }}
        >
          <GuestcamLogo size="sm" variant={isLight ? "onLight" : "onDark"} />
          <span className="text-xs whitespace-nowrap" style={{ color: mutedColor }}>
            Powered by guestcam.si
          </span>
        </a>
      )}

      {/* Persistent QR overlay — bottom-left. Suppressed while the wall is
          empty, where the full-size centred QR above takes over. */}
      {settings.showQr && center && (
        <div
          className="absolute bottom-6 left-6 flex items-center gap-4 backdrop-blur-sm rounded-2xl p-4"
          style={{ background: isLight ? "rgba(255,255,255,.85)" : "rgba(0,0,0,.55)" }}
        >
          <img
            src={qrSrc}
            alt="QR koda za nalaganje fotografij"
            className="w-28 h-28 rounded-lg bg-white p-1.5 shrink-0"
          />
          <div className="max-w-[220px]">
            <p className="font-semibold text-base leading-snug" style={{ color: pillStyle.color }}>
              Skenirajte in delite svoje fotografije!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
