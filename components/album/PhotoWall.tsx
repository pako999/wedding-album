"use client";

/**
 * PhotoWall — the TV-facing "photo wall" display.
 *
 * Opened once on a smart TV / Chromecast / tablet and left running for
 * the whole event: no controls, no interaction required.
 *
 * Layout: one large photo holds the centre stage while smaller recent
 * shots drift continuously past it — up the left and right columns on a
 * landscape screen, across the top and bottom bands in portrait. Each
 * thumbnail picks up a different photo every time it recycles, so the
 * collage keeps changing on its own.
 *
 * A freshly uploaded photo is dropped into a drifting slot with a
 * highlight ring and then promoted to the centre stage, so the room sees
 * it arrive. Sponsor slides (if the organiser uploaded any) take the
 * centre stage on a timer in between guest photos.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import type { WallCopy } from "@/lib/i18n/wall-translations";

const POLL_MS = 8_000; // how often we check for new uploads

export interface WallPhoto {
  id: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  uploaderName: string | null;
}

export interface WallSponsor {
  id: string;
  imageUrl: string;
  caption: string | null;
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
 *  render time from the slide duration. */
export const WALL_TRANSITIONS = {
  fade:     "wallCenterFade .7s cubic-bezier(.4,0,.2,1) forwards",
  slide:    "wallCenterSlide .75s cubic-bezier(.22,1,.36,1) forwards",
  kenburns: null,
} as const;
export type WallTransition = keyof typeof WALL_TRANSITIONS;

export type WallOrientation = "auto" | "landscape" | "portrait";

/**
 * Drifting thumbnail tracks.
 *
 * Landscape: fixed x near an edge, travelling vertically. The columns sit
 * inside the 16% margin the centre stage leaves free, so a thumbnail
 * never crosses the main photo.
 *
 * Portrait: fixed y in the top/bottom band, travelling horizontally —
 * a tall screen has no room for side columns without squeezing the stage
 * to nothing.
 *
 * Negative delays start each track partway through its cycle so the
 * screen is already populated on load instead of everything entering
 * together. Durations are deliberately uneven so the tracks never fall
 * into a visible lockstep.
 */
const DRIFT_TRACKS = [
  { side: "left",  edge: "2.5%", band: "8%",  size: 132, rot: -4, dur: 46, delay: -2 },
  { side: "left",  edge: "6%",   band: "26%", size: 106, rot:  3, dur: 38, delay: -15 },
  { side: "left",  edge: "2%",   band: "44%", size: 140, rot: -2, dur: 53, delay: -30 },
  { side: "right", edge: "3%",   band: "62%", size: 120, rot:  4, dur: 44, delay: -8 },
  { side: "right", edge: "1.5%", band: "78%", size: 148, rot: -3, dur: 50, delay: -24 },
  { side: "right", edge: "5%",   band: "90%", size: 110, rot:  2, dur: 41, delay: -36 },
] as const;

const SLOT_COUNT = DRIFT_TRACKS.length;

/** Thumbnail height as a multiple of its width — keeps the collage tidy
 *  regardless of each photo's real aspect ratio. */
const THUMB_RATIO = 1.15;

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
  /** Milliseconds between sponsor slides. 0 disables them entirely. */
  adEveryMs: number;
  /** Milliseconds a sponsor slide holds the centre stage. */
  adDurMs: number;
}

interface SlotState {
  photo: WallPhoto | null;
  /** Highlight ring, set when a brand-new upload lands in this slot. */
  ring: boolean;
}

/** What the centre stage is currently showing. */
type CenterItem =
  | { kind: "photo"; photo: WallPhoto; isNew: boolean }
  | { kind: "ad"; sponsor: WallSponsor };

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
  sponsors: WallSponsor[];
  settings: WallSettings;
  t: WallCopy;
  /** False for Free/Basic/Plus — the wall still runs (so owners can try
   *  it before buying) but carries a Premium notice. */
  isPremium: boolean;
}

export function PhotoWall({
  token,
  pw,
  coupleName,
  albumUrl,
  initialPhotos,
  sponsors,
  settings,
  t,
  isPremium,
}: Props) {
  const [photos, setPhotos] = useState<WallPhoto[]>(initialPhotos);
  // initialPhotos arrives oldest-first, so the last entry is the newest.
  const [center, setCenter] = useState<CenterItem | null>(
    initialPhotos.length
      ? { kind: "photo", photo: initialPhotos[initialPhotos.length - 1], isNew: false }
      : null,
  );
  const [centerKey, setCenterKey] = useState(0);

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
  /** When the next sponsor slide is due, and which one is next up. */
  const nextAdAt = useRef<number>(Date.now() + settings.adEveryMs);
  const adCursor = useRef(0);
  /** Latest photo pool, for callbacks that must not re-subscribe. */
  const photosRef = useRef(photos);
  useEffect(() => { photosRef.current = photos; }, [photos]);

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
    return DRIFT_TRACKS.map((_, i) => ({
      photo: recent.length ? recent[i % recent.length] : null,
      ring: false,
    }));
  });

  // ── Poll for new uploads ────────────────────────────────────────────
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
        // Drop each arrival into a drifting slot, ringed so the room
        // notices it join the wall.
        setSlots((prev) => {
          const next = [...prev];
          arrivals.forEach((p) => {
            const i = slotCursor.current % SLOT_COUNT;
            slotCursor.current += 1;
            next[i] = { photo: p, ring: true };
          });
          return next;
        });
        // Then give the newest one the centre stage. Seeing your own
        // photo go big within seconds of sharing is the single biggest
        // driver of more uploads from the room.
        const newest = arrivals[arrivals.length - 1];
        const t = setTimeout(() => {
          setCenter({ kind: "photo", photo: newest, isNew: true });
          setCenterKey(nextKey());
        }, 900);
        promoteTimers.current.push(t);
      } catch {
        // Offline TV / flaky venue wifi — just try again on the next tick.
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [token, pw]);

  // ── Centre stage rotation ───────────────────────────────────────────
  const advance = useCallback(() => {
    const pool = photosRef.current;

    // A sponsor slide is due? Show it instead of the next photo. Guarded
    // on there being at least one photo so an empty wall still shows the
    // "scan me" call to action rather than an ad reel.
    if (settings.adEveryMs > 0 && sponsors.length > 0 && pool.length > 0 && Date.now() >= nextAdAt.current) {
      const sponsor = sponsors[adCursor.current % sponsors.length];
      adCursor.current += 1;
      nextAdAt.current = Date.now() + settings.adEveryMs + settings.adDurMs;
      setCenter({ kind: "ad", sponsor });
      setCenterKey(nextKey());
      return;
    }

    if (pool.length === 0) return;
    if (queue.current.length === 0) queue.current = shuffled(pool);
    let next = queue.current.pop() ?? null;
    // Avoid showing the same photo twice in a row when the pool is big
    // enough for it to matter.
    if (next && center?.kind === "photo" && next.id === center.photo.id && pool.length > 1) {
      if (queue.current.length === 0) queue.current = shuffled(pool);
      next = queue.current.pop() ?? next;
    }
    if (!next) return;
    setCenter({ kind: "photo", photo: next, isNew: false });
    setCenterKey(nextKey());
  }, [center, sponsors, settings.adEveryMs, settings.adDurMs]);

  useEffect(() => {
    if (photos.length === 0) return;
    const hold = center?.kind === "ad" ? settings.adDurMs : settings.slideMs;
    const t = setTimeout(advance, hold);
    return () => clearTimeout(t);
  }, [advance, centerKey, photos.length, settings.slideMs, settings.adDurMs, center?.kind]);

  /** Recycle a drifting slot each time it completes a lap. */
  const recycleSlot = useCallback((i: number) => {
    setSlots((prev) => {
      const pool = photosRef.current;
      if (pool.length === 0) return prev;
      const currentId = center?.kind === "photo" ? center.photo.id : null;
      // Prefer something that isn't already centre stage, so the wall
      // isn't showing the same shot big and small at once.
      const candidates = pool.length > 1 && currentId ? pool.filter((p) => p.id !== currentId) : pool;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const next = [...prev];
      next[i] = { photo: pick ?? prev[i].photo, ring: false };
      return next;
    });
  }, [center]);

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
  const holdMs = center?.kind === "ad" ? settings.adDurMs : settings.slideMs;
  const centerAnimation =
    settings.transition === "kenburns"
      ? `wallCenterFade .7s cubic-bezier(.4,0,.2,1) forwards, wallKenBurns ${holdMs}ms ease-out forwards`
      : (WALL_TRANSITIONS[settings.transition] ?? WALL_TRANSITIONS.fade);

  const centerPhoto = center?.kind === "photo" ? center.photo : null;
  const centerAd = center?.kind === "ad" ? center.sponsor : null;

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: bg.css }}>
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
        /* Continuous travel for the side collage. Starts and ends fully
           off-screen so a thumbnail never pops in or out mid-air, and
           fades at both ends so the entry/exit is soft. */
        @keyframes wallDriftUp {
          0%   { transform: translate3d(0, 118vh, 0); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translate3d(0, -45vh, 0); opacity: 0; }
        }
        @keyframes wallDriftAcross {
          0%   { transform: translate3d(115vw, 0, 0); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translate3d(-45vw, 0, 0); opacity: 0; }
        }
        /* Highlight ring that pulses as a new photo joins the wall. */
        @keyframes wallNewRing {
          0%   { box-shadow: 0 0 0 0 rgba(255,201,77,.9); }
          100% { box-shadow: 0 0 0 24px rgba(255,201,77,0); }
        }
        @keyframes wallBadgeIn {
          from { opacity: 0; transform: translateY(14px) scale(.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {center ? (
        <>
          {/* Blurred ambient background fills any letterboxing. Only for
              the "photo" preset — the flat presets stay flat on purpose.
              Never derived from a sponsor slide. */}
          {bg.blur && centerPhoto && (
            <img
              src={bunnyDisplayUrl(centerPhoto.thumbnailUrl ?? centerPhoto.blobUrl, 400, 30)}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-110"
              style={{ filter: "blur(34px)", opacity: 0.28 }}
            />
          )}

          {/* Centre stage. Inset so the collage has room to breathe —
              side columns in landscape, top/bottom bands in portrait. */}
          <div
            className="absolute flex items-center justify-center z-[2]"
            style={
              isPortrait
                ? { top: "30%", bottom: "32%", left: "5%", right: "5%" }
                : { top: "4%", bottom: "4%", left: "16%", right: "16%" }
            }
          >
            <img
              key={centerKey}
              src={centerAd ? centerAd.imageUrl : bunnyDisplayUrl(centerPhoto!.blobUrl, 2000, 90)}
              alt=""
              className="max-w-full max-h-full object-contain rounded-2xl"
              style={{
                animation: centerAnimation,
                boxShadow: isLight ? "0 18px 60px rgba(15,23,41,.28)" : "0 24px 80px rgba(0,0,0,.6)",
              }}
            />
          </div>

          {/* Caption strip under the stage */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[3]">
            {centerAd ? (
              <>
                <span
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
                  style={{ background: pillStyle.background, color: mutedColor }}
                >
                  {t.sponsor}
                </span>
                {centerAd.caption && (
                  <span className="backdrop-blur-sm px-5 py-2 rounded-full text-lg" style={pillStyle}>
                    {centerAd.caption}
                  </span>
                )}
              </>
            ) : (
              <>
                {center.kind === "photo" && center.isNew && (
                  <span
                    className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider text-[#0F1729]"
                    style={{ background: "#FFC94D", animation: "wallBadgeIn .5s cubic-bezier(.2,1.2,.3,1) forwards" }}
                  >
                    {t.justShared}
                  </span>
                )}
                {settings.showNames && centerPhoto?.uploaderName && (
                  <span className="backdrop-blur-sm px-5 py-2 rounded-full text-lg" style={pillStyle}>
                    {centerPhoto.uploaderName}
                  </span>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        // No photos yet. Early in the event this screen has exactly one
        // job — get the first guest to scan — so the QR goes full size,
        // centred, instead of sitting small in the corner.
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-[2]">
          <p className="font-serif text-5xl mb-3" style={{ color: isLight ? "#0F1729" : "#ffffff" }}>
            {coupleName}
          </p>
          <p className="text-2xl mb-10" style={{ color: mutedColor }}>
            {t.emptyPrompt}
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

      {/* ── Drifting side collage ────────────────────────────────────── */}
      {settings.showSides &&
        DRIFT_TRACKS.map((track, i) => {
          const state = slots[i];
          if (!state?.photo) return null;
          // Landscape: pinned near a side edge, travelling vertically.
          // Portrait: pinned in a horizontal band, travelling across.
          const pos: React.CSSProperties = isPortrait
            ? { top: track.band, left: 0 }
            : track.side === "left"
              ? { left: track.edge, top: 0 }
              : { right: track.edge, top: 0 };
          return (
            <div
              key={i}
              className="absolute z-[1]"
              style={{
                ...pos,
                width: track.size,
                animation: `${isPortrait ? "wallDriftAcross" : "wallDriftUp"} ${track.dur}s linear ${track.delay}s infinite`,
                willChange: "transform",
              }}
              onAnimationIteration={() => recycleSlot(i)}
            >
              <img
                src={bunnyDisplayUrl(state.photo.thumbnailUrl ?? state.photo.blobUrl, 320, 78)}
                alt=""
                className="w-full rounded-xl border-2 border-white/80 object-cover"
                style={{
                  height: Math.round(track.size * THUMB_RATIO),
                  transform: `rotate(${track.rot}deg)`,
                  boxShadow: isLight ? "0 8px 26px rgba(15,23,41,.22)" : "0 10px 34px rgba(0,0,0,.55)",
                  animation: state.ring ? "wallNewRing 1.6s ease-out" : undefined,
                }}
              />
            </div>
          );
        })}

      {/* Couple name — top-right, so it never collides with the branding.
          Hidden while the wall is empty, where the name is already the
          headline of the centred call-to-action. */}
      {settings.showTitle && center && (
        <div className="absolute top-6 right-6 backdrop-blur-sm px-5 py-2.5 rounded-full z-[3]" style={pillStyle}>
          <p className="font-serif text-xl">{coupleName}</p>
        </div>
      )}

      {/* Branding — top-left */}
      {settings.showBranding && (
        <a
          href="https://www.guestcam.si"
          target="_blank"
          rel="noreferrer"
          className="absolute top-6 left-6 flex items-center gap-2.5 backdrop-blur-sm pl-3 pr-4 py-2 rounded-full no-underline z-[3]"
          style={{ background: pillStyle.background }}
        >
          <GuestcamLogo size="sm" variant={isLight ? "onLight" : "onDark"} />
          <span className="text-xs whitespace-nowrap" style={{ color: mutedColor }}>
            Powered by guestcam.si
          </span>
        </a>
      )}

      {/* Premium notice. The wall deliberately still runs on every plan so
          an owner can set it up and see it working before paying — this
          just makes clear it ships with Premium. Bottom-right, opposite
          the QR, so it never covers the call to action. */}
      {!isPremium && (
        <div
          className="absolute bottom-6 right-6 px-4 py-2 rounded-full backdrop-blur-sm z-[3]"
          style={{ background: pillStyle.background }}
        >
          <p className="text-xs" style={{ color: mutedColor }}>
            <span style={{ color: "#FFC94D" }}>★</span> {t.premiumOnly}
          </p>
        </div>
      )}

      {/* Persistent QR overlay — bottom-left. Suppressed while the wall is
          empty, where the full-size centred QR above takes over. */}
      {settings.showQr && center && (
        <div
          className="absolute bottom-6 left-6 flex items-center gap-4 backdrop-blur-sm rounded-2xl p-4 z-[3]"
          style={{ background: isLight ? "rgba(255,255,255,.85)" : "rgba(0,0,0,.55)" }}
        >
          <img
            src={qrSrc}
            alt="QR koda za nalaganje fotografij"
            className="w-28 h-28 rounded-lg bg-white p-1.5 shrink-0"
          />
          <div className="max-w-[220px]">
            <p className="font-semibold text-base leading-snug" style={{ color: pillStyle.color }}>
              {t.qrPrompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
