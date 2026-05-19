"use client";

/**
 * FilmStudio — dashboard component for generating ONE montage video
 * from album photos via the Shotstack API.
 *
 * The real photos are used as-is (no AI re-rendering — faces untouched),
 * combined into a single film with Ken-Burns motion + crossfade transitions.
 *
 * Tiers (max photos in the montage):
 *   free      → locked (upgrade required)
 *   pro       → max 100 photos
 *   premium   → max 300 photos
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { Album } from "@/lib/db/schema";

interface PhotoItem {
  id: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  uploaderName: string | null;
}

interface GenerationStatus {
  id: string;
  status: "queued" | "processing" | "complete" | "failed";
  videoUrl: string | null;
  clipsTotal: number;
  createdAt: string;
  completedAt: string | null;
}

const POLL_MS = 5_000;

const TIER_LIMITS: Record<string, number> = { free: 48, pro: 100, premium: 300 };
const TIER_LABELS: Record<string, string> = { free: "Free", pro: "Pro", premium: "Premium" };
const TIER_COLORS: Record<string, string> = {
  free:    "bg-gray-100 text-gray-600",
  pro:     "bg-blue-100 text-blue-700",
  premium: "bg-violet-100 text-violet-700",
};

export function FilmStudio({ album }: { album: Album }) {
  const filmTier = (album.filmTier ?? "free") as "free" | "pro" | "premium";

  // Free tier: render the locked upgrade gate instead of the generator.
  if (filmTier === "free") {
    return <FreeTierGate album={album} />;
  }

  return <FilmGenerator album={album} filmTier={filmTier} />;
}

// ── Free-tier upgrade gate ───────────────────────────────────────────────────

function FreeTierGate({ album }: { album: Album }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="h-1.5 w-full" style={{ background: "#1E3A8A" }} />
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">🎬</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Film Studio je na voljo s paketom Premium
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Združi najlepše fotografije albuma v en kinematografski film z
          mehkimi prehodi in gibanjem kamere — fotografije ostanejo
          nespremenjene, brez umetne inteligence na obrazih.
        </p>
        <a
          href={`/dashboard/${album.slug}/upgrade`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#1E3A8A" }}
        >
          ✨ Nadgradi na Premium
        </a>
      </div>
    </div>
  );
}

// ── Film generator (Pro / Premium) ───────────────────────────────────────────

function FilmGenerator({
  album,
  filmTier,
}: {
  album: Album;
  filmTier: "pro" | "premium";
}) {
  const tierLimit = TIER_LIMITS[filmTier];

  const [generation, setGeneration] = useState<GenerationStatus | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [allPhotos, setAllPhotos]         = useState<PhotoItem[]>([]);
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());
  const [photosLoading, setPhotosLoading] = useState(false);
  const [pickerOpen, setPickerOpen]       = useState(true);

  // ── Poll status ─────────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/albums/${album.slug}/film/status`);
      if (!res.ok) return;
      const data = await res.json() as { generation: GenerationStatus | null };
      setGeneration(data.generation);
      if (
        data.generation?.status === "complete" ||
        data.generation?.status === "failed"
      ) {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch { /* ignore */ }
  }, [album.slug]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ── Load photos for the picker ──────────────────────────────────────────────
  useEffect(() => {
    setPhotosLoading(true);
    fetch(`/api/albums/${album.slug}/photos`)
      .then(r => r.json())
      .then((d: { photos?: PhotoItem[] }) => {
        const list = d.photos ?? [];
        setAllPhotos(list);
        // Default: select up to min(30, tierLimit) photos
        const defaultCount = Math.min(30, tierLimit);
        setSelectedIds(new Set(list.slice(0, defaultCount).map(p => p.id)));
      })
      .catch(() => { /* non-fatal */ })
      .finally(() => setPhotosLoading(false));
  }, [album.slug, tierLimit]);

  // ── Keep polling while the montage is rendering ─────────────────────────────
  useEffect(() => {
    if (!generation) return;
    if (generation.status === "processing" || generation.status === "queued") {
      pollRef.current = setInterval(fetchStatus, POLL_MS);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [generation?.status, fetchStatus]);

  // ── Toggle photo selection ──────────────────────────────────────────────────
  const togglePhoto = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < tierLimit) {
        next.add(id);
      }
      return next;
    });
  };

  // ── Start montage generation ────────────────────────────────────────────────
  const startGeneration = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/albums/${album.slug}/film/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoIds: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Napaka pri zagonu generiranja.");
        return;
      }
      await fetchStatus();
      pollRef.current = setInterval(fetchStatus, POLL_MS);
    } catch {
      setError("Napaka pri povezavi. Prosimo, poskusite znova.");
    } finally {
      setStarting(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isProcessing = generation?.status === "processing" || generation?.status === "queued";
  const isComplete   = generation?.status === "complete" && !!generation.videoUrl;
  const isFailed     = generation?.status === "failed";
  const photoCount   = selectedIds.size;
  // ~3.5s per photo
  const estDuration  = Math.round(photoCount * 3.5);

  return (
    <div className="space-y-6">

      {/* ── Header card ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: "#1E3A8A" }} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🎬 Film Studio
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[filmTier]}`}>
                  {TIER_LABELS[filmTier]}
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                Združi izbrane fotografije v en kinematografski film z gibanjem
                kamere in mehkimi prehodi. Fotografije ostanejo nespremenjene.
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400">Predviden film</p>
              <p className="text-lg font-bold text-gray-900">~{estDuration}s</p>
              <p className="text-[10px] text-gray-400">
                {photoCount} foto × ~3,5s
              </p>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-4 mb-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{photoCount} / {tierLimit} izbranih fotografij</span>
              <span className="font-medium">
                {Math.round((photoCount / tierLimit) * 100)}% kapacitete
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (photoCount / tierLimit) * 100)}%`,
                  background: "#1E3A8A",
                }}
              />
            </div>
          </div>

          {/* Start / status */}
          <div className="space-y-3">
            {isProcessing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block" />
                  <span className="font-medium text-gray-700">
                    Ustvarjam film…
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full animate-pulse"
                    style={{ width: "60%", background: "#1E3A8A" }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Sestavljanje filma traja navadno ~1–3 minute. Stran lahko
                  zaprete — generiranje teče v ozadju.
                </p>
              </div>
            ) : isComplete ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-xl w-fit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Film je pripravljen!
                </div>
                <video
                  controls
                  src={generation!.videoUrl!}
                  className="w-full rounded-xl bg-black"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    href={generation!.videoUrl!}
                    download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: "#1E3A8A" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Prenesi film
                  </a>
                  <button
                    onClick={startGeneration}
                    disabled={starting}
                    className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                  >
                    Ustvari nov film
                  </button>
                </div>
              </div>
            ) : isFailed ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700 bg-red-50 px-3 py-2 rounded-xl">
                  ⚠️ Generiranje filma ni uspelo
                </div>
                <button
                  onClick={startGeneration}
                  disabled={starting}
                  className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                >
                  Poskusi znova
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={startGeneration}
                  disabled={starting || photoCount === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90"
                  style={{ background: "#1E3A8A" }}
                >
                  {starting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Zaganjam…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                      </svg>
                      Ustvari film ({photoCount} foto)
                    </>
                  )}
                </button>
                {photoCount === 0 && (
                  <p className="text-xs text-gray-400">
                    Izberi vsaj eno fotografijo spodaj.
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Photo picker ─────────────────────────────────────────────────── */}
      {allPhotos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setPickerOpen(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                🎞️ Izberi fotografije za film
                <span className="text-xs font-normal text-gray-400">
                  {selectedIds.size} / {tierLimit}
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Izbrane fotografije se združijo v en film po vrstnem redu.
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {pickerOpen && (
            <div className="border-t border-gray-100 p-4">
              {/* Quick select buttons */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs text-gray-500">Hitro izberi:</span>
                {[10, 20, 30].filter(n => n <= Math.min(allPhotos.length, tierLimit)).map(n => (
                  <button
                    key={n}
                    onClick={() => setSelectedIds(new Set(allPhotos.slice(0, n).map(p => p.id)))}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-700 transition-all"
                  >
                    Prvih {n}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedIds(new Set(allPhotos.slice(0, tierLimit).map(p => p.id)))}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-700 transition-all"
                >
                  Vse ({Math.min(allPhotos.length, tierLimit)})
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-red-300 hover:text-red-600 transition-all"
                >
                  Počisti
                </button>
                {selectedIds.size >= tierLimit && (
                  <span className="text-xs text-amber-600 font-medium ml-auto">
                    Dosežena meja {tierLimit} za tvoj nivo
                  </span>
                )}
              </div>

              {/* Photo grid */}
              {photosLoading && <p className="text-xs text-gray-400 py-2">Nalagam fotografije…</p>}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5 max-h-72 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                {allPhotos.map(photo => {
                  const sel = selectedIds.has(photo.id);
                  const atLimit = !sel && selectedIds.size >= tierLimit;
                  return (
                    <button
                      key={photo.id}
                      onClick={() => togglePhoto(photo.id)}
                      disabled={atLimit}
                      title={photo.uploaderName ?? ""}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                        sel ? "ring-2 ring-blue-700 ring-offset-1" : atLimit ? "opacity-40" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnailUrl ?? photo.blobUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {sel && (
                        <div className="absolute inset-0 bg-blue-900/20 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#1E3A8A" }}>
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Info cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "🖼️", title: "Prave fotografije", body: "Tvoje fotografije ostanejo nespremenjene — brez umetne inteligence na obrazih." },
          { icon: "🎥", title: "Gibanje kamere", body: "Mehki Ken-Burns učinki in prelivi med fotografijami." },
          { icon: "⏱️", title: "~1–3 min čakanja", body: "Film se sestavi v oblaku in je takoj pripravljen za prenos." },
        ].map(card => (
          <div key={card.title} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-xs font-bold text-gray-700 mb-1">{card.title}</p>
            <p className="text-xs text-gray-500">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
