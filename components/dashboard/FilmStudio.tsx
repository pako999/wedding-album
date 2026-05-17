"use client";

/**
 * FilmStudio — dashboard component for generating Kling AI video clips
 * from album photos. Drop it inside any tab content area.
 *
 * Tiers:
 *   free      → max 48 photos  (default, ~3-4 min film)
 *   pro       → max 100 photos (€10 one-time)
 *   premium   → max 300 photos (€20 one-time)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { Album } from "@/lib/db/schema";

interface PhotoItem {
  id: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  uploaderName: string | null;
}

interface ClipItem {
  id: string;
  photoId: string;
  photoUrl: string;
  status: "queued" | "processing" | "done" | "failed";
  videoUrl: string | null;
  errorMessage: string | null;
  sortOrder: number;
}

interface GenerationStatus {
  id: string;
  status: "queued" | "processing" | "complete" | "failed";
  clipsTotal: number;
  clipsDone: number;
  clipsFailed: number;
  createdAt: string;
  completedAt: string | null;
}

const POLL_MS = 4_000;

const TIER_LIMITS: Record<string, number> = { free: 48, pro: 100, premium: 300 };
const TIER_LABELS: Record<string, string> = { free: "Free", pro: "Pro", premium: "Premium" };
const TIER_COLORS: Record<string, string> = {
  free:    "bg-gray-100 text-gray-600",
  pro:     "bg-blue-100 text-blue-700",
  premium: "bg-violet-100 text-violet-700",
};

export function FilmStudio({ album }: { album: Album }) {
  const [generation, setGeneration] = useState<GenerationStatus | null>(null);
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [allPhotos, setAllPhotos]           = useState<PhotoItem[]>([]);
  const [selectedIds, setSelectedIds]       = useState<Set<string>>(new Set());
  const [photosLoading, setPhotosLoading]   = useState(false);
  const [pickerOpen, setPickerOpen]         = useState(false);

  const filmTier = (album.filmTier ?? "free") as "free" | "pro" | "premium";
  const tierLimit = TIER_LIMITS[filmTier];
  const totalPhotos = album.photoCount ?? 0;
  const photosToGenerate = selectedIds.size > 0 ? selectedIds.size : Math.min(totalPhotos, tierLimit);

  // ── Poll status ─────────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/albums/${album.slug}/film/status`);
      if (!res.ok) return;
      const data = await res.json() as {
        generation: GenerationStatus | null;
        clips: ClipItem[];
      };
      setGeneration(data.generation);
      setClips(data.clips);

      if (data.generation?.status === "complete" || data.generation?.status === "failed") {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch { /* ignore */ }
  }, [album.slug]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    setPhotosLoading(true);
    fetch(`/api/albums/${album.slug}/photos`)
      .then(r => r.json())
      .then((d: { photos?: PhotoItem[] }) => {
        const list = d.photos ?? [];
        setAllPhotos(list);
        // Default: select first min(20, tierLimit) photos
        const defaultCount = Math.min(20, tierLimit);
        setSelectedIds(new Set(list.slice(0, defaultCount).map(p => p.id)));
      })
      .catch(() => { /* non-fatal */ })
      .finally(() => setPhotosLoading(false));
  }, [album.slug, tierLimit]);

  useEffect(() => {
    if (!generation) return;
    if (generation.status === "processing" || generation.status === "queued") {
      pollRef.current = setInterval(async () => {
        fetch("/api/cron/poll-kling").catch(() => {});
        await fetchStatus();
      }, POLL_MS);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [generation?.status, fetchStatus]);

  // ── Test connection ─────────────────────────────────────────────────────────
  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/albums/${album.slug}/film/test`);
      const data = await res.json() as { ok: boolean; httpStatus?: number; klingResponse?: unknown; error?: string; detail?: string };
      if (data.ok) {
        setTestResult(`✅ Kling API OK (HTTP ${data.httpStatus})`);
      } else {
        const detail = data.detail ?? JSON.stringify(data.klingResponse ?? data.error ?? "Unknown error");
        setTestResult(`❌ ${detail}`);
      }
    } catch (e) {
      setTestResult(`❌ Network error: ${String(e)}`);
    } finally {
      setTesting(false);
    }
  };

  // ── Upgrade film tier via Stripe ─────────────────────────────────────────────
  const upgradeFilm = async (planId: "film_pro" | "film_premium") => {
    setUpgrading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, albumSlug: album.slug }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Napaka pri plačilu.");
        setUpgrading(null);
      }
    } catch {
      setError("Napaka pri povezavi s plačilnim sistemom.");
      setUpgrading(null);
    }
  };

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

  // ── Start generation ────────────────────────────────────────────────────────
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
  const isComplete   = generation?.status === "complete";
  const doneClips    = clips.filter(c => c.status === "done" && c.videoUrl);
  const pct = generation ? Math.round((generation.clipsDone / Math.max(1, generation.clipsTotal)) * 100) : 0;

  // Cost: each 5-sec clip ~€0.05
  const estimatedCostEur = (photosToGenerate * 0.05).toFixed(2);

  return (
    <div className="space-y-6">

      {/* ── Header card ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="h-1.5 w-full" style={{
          background: "linear-gradient(to right, #C4738A, #9b59b6, #3498db)"
        }} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🎬 Film Studio
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                  Kling AI
                </span>
                {/* Tier badge */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[filmTier]}`}>
                  {TIER_LABELS[filmTier]}
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                Vsako fotografijo pretvori v 5-sekundni kinematografski video posnetek
                z gladkim gibanjem kamere. Idealno za highlights film.
              </p>
            </div>

            {/* Cost + limit pill */}
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400">Ocenjena cena</p>
              <p className="text-lg font-bold text-gray-900">
                ~€{estimatedCostEur}
              </p>
              <p className="text-[10px] text-gray-400">
                {photosToGenerate} foto × €0.05 / posnetek
              </p>
              {totalPhotos > tierLimit && (
                <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                  Omejeno na {tierLimit} (od {totalPhotos})
                </p>
              )}
            </div>
          </div>

          {/* Tier limit bar */}
          <div className="mt-4 mb-5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{photosToGenerate} / {tierLimit} foto za generiranje</span>
              <span className="font-medium">{Math.round((photosToGenerate / tierLimit) * 100)}% kapacitete</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (photosToGenerate / tierLimit) * 100)}%`,
                  background: "linear-gradient(to right, #C4738A, #9b59b6)",
                }}
              />
            </div>
          </div>

          {/* Start / status */}
          <div className="space-y-3">
            {!generation ? (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={startGeneration}
                  disabled={starting || totalPhotos === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #C4738A, #9b59b6)" }}
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
                      Generiraj film ({photosToGenerate} foto)
                    </>
                  )}
                </button>
                {totalPhotos === 0 && (
                  <p className="text-xs text-gray-400">Najprej naloži vsaj eno fotografijo.</p>
                )}
              </div>
            ) : isProcessing ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse inline-block" />
                    Generiram posnetke…
                  </span>
                  <span className="text-gray-500 tabular-nums">
                    {generation.clipsDone} / {generation.clipsTotal}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(to right, #C4738A, #9b59b6)",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Vsak posnetek traja ~2–4 minute. Stran lahko zaprete — generiranje teče v ozadju.
                </p>
              </div>
            ) : isComplete ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {doneClips.length} posnetkov generirano!
                </div>
                <button
                  onClick={startGeneration}
                  disabled={starting}
                  className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                >
                  Generiraj znova
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-700 bg-red-50 px-3 py-2 rounded-xl">
                    ⚠️ Generiranje ni uspelo
                  </div>
                  <button onClick={startGeneration} disabled={starting}
                    className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors">
                    Poskusi znova
                  </button>
                  <button onClick={testConnection} disabled={testing}
                    className="text-xs text-violet-500 hover:text-violet-700 underline transition-colors">
                    {testing ? "Testiram…" : "Testiraj API povezavo"}
                  </button>
                </div>
                {clips.find(c => c.errorMessage) && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg font-mono break-all">
                    {clips.find(c => c.errorMessage)?.errorMessage}
                  </p>
                )}
                {testResult && (
                  <p className={`text-xs px-3 py-2 rounded-lg font-mono break-all ${testResult.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {testResult}
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
                  {selectedIds.size} / {Math.min(20, tierLimit)} priporočenih
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Priporočamo 20 najboljših — to naredi ~100s highlight film.
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
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-violet-300 hover:text-violet-700 transition-all"
                  >
                    Prvih {n}
                  </button>
                ))}
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
                        sel ? "ring-2 ring-violet-500 ring-offset-1" : atLimit ? "opacity-40" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={photo.thumbnailUrl ?? photo.blobUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {sel && (
                        <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
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

      {/* ── Upgrade card (only shown when not on premium) ─────────────────── */}
      {filmTier !== "premium" && (
        <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border border-violet-100 p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
            ✨ Povečaj kapaciteto filma
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Enkratno plačilo za ta album. Omejitev se trajno poveča.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filmTier === "free" && (
              <UpgradeOption
                title="Pro"
                price="€10"
                photos={100}
                duration="~8 min"
                current={false}
                loading={upgrading === "film_pro"}
                onUpgrade={() => upgradeFilm("film_pro")}
                highlight={false}
              />
            )}
            <UpgradeOption
              title="Premium"
              price="€20"
              photos={300}
              duration="~25 min"
              current={false}
              loading={upgrading === "film_premium"}
              onUpgrade={() => upgradeFilm("film_premium")}
              highlight={true}
            />
          </div>
        </div>
      )}

      {/* ── Clip reel ────────────────────────────────────────────────────── */}
      {clips.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            Posnetki
            <span className="text-xs font-normal text-gray-400">
              {doneClips.length}/{clips.length} pripravljenih
            </span>
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
            {clips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
          {doneClips.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Klikni posamezni posnetek → desni klik → &quot;Shrani video&quot; za prenos.
                {doneClips.length > 3 && " Za množični prenos kontaktiraj podporo."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Info cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "⚡", title: "Kling AI v1.6", body: "State-of-the-art model za image-to-video generiranje." },
          { icon: "⏱️", title: "5 sek / posnetek", body: "Vsak posnetek je 5 sekund, 16:9, do 1080p." },
          { icon: "🎞️", title: "~2–4 min čakanja", body: "Kling AI oblak procesira posnetke vzporedno." },
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

// ── Upgrade option card ──────────────────────────────────────────────────────

function UpgradeOption({
  title, price, photos, duration, loading, onUpgrade, highlight,
}: {
  title: string;
  price: string;
  photos: number;
  duration: string;
  current: boolean;
  loading: boolean;
  onUpgrade: () => void;
  highlight: boolean;
}) {
  return (
    <div className={`relative rounded-xl border p-4 flex flex-col gap-3 ${highlight ? "border-violet-300 bg-white" : "border-gray-200 bg-white/60"}`}>
      {highlight && (
        <div className="absolute -top-2.5 left-4 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          Priporočeno
        </div>
      )}
      <div>
        <p className="text-sm font-bold text-gray-900">{title} <span className="text-violet-600">{price}</span></p>
        <p className="text-xs text-gray-500 mt-0.5">do {photos} fotografij · {duration} film</p>
      </div>
      <button
        onClick={onUpgrade}
        disabled={loading}
        className={`w-full py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
          highlight
            ? "bg-violet-600 text-white hover:bg-violet-700"
            : "bg-gray-800 text-white hover:bg-gray-900"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Preusmerjam…
          </span>
        ) : `Nadgradi na ${title}`}
      </button>
    </div>
  );
}

// ── Single clip card ─────────────────────────────────────────────────────────

function ClipCard({ clip }: { clip: ClipItem }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div
      className="relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-900 group"
      style={{ width: 180, aspectRatio: "16/9" }}
    >
      {clip.status === "done" && clip.videoUrl ? (
        <>
          <video
            ref={videoRef}
            src={clip.videoUrl}
            loop
            playsInline
            className="w-full h-full object-cover"
            onEnded={() => setPlaying(false)}
          />
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-full bg-white/90 flex items-center justify-center transition-all ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
              {playing ? (
                <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </div>
          </button>
          <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white text-[9px] font-bold">
            {clip.sortOrder + 1}
          </div>
        </>
      ) : clip.status === "failed" ? (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <img src={clip.photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <span className="text-lg relative z-10">⚠️</span>
          <span className="text-[10px] text-red-300 relative z-10">Napaka</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-1.5 relative">
          <img src={clip.photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <svg className="w-5 h-5 text-white/60 animate-spin relative z-10" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-[9px] text-white/50 relative z-10 uppercase tracking-wider">
            {clip.status === "queued" ? "V čakanju" : "Generira…"}
          </span>
        </div>
      )}
    </div>
  );
}
