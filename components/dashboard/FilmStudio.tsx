"use client";

/**
 * FilmStudio — dashboard component for generating Kling AI video clips
 * from album photos.  Drop it inside any tab content area.
 *
 * Flow:
 *  1. "Generiraj film" → POST /api/albums/[slug]/film/generate
 *  2. Poll /api/albums/[slug]/film/status every 4 s while processing
 *  3. Show a scrollable clip reel once clips start arriving
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { Album } from "@/lib/db/schema";

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

export function FilmStudio({ album }: { album: Album }) {
  const [generation, setGeneration] = useState<GenerationStatus | null>(null);
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      // Stop polling once complete/failed
      if (data.generation?.status === "complete" || data.generation?.status === "failed") {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch { /* ignore */ }
  }, [album.slug]);

  // Load existing status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Keep polling while processing — also kick the server-side Kling poll cron
  useEffect(() => {
    if (!generation) return;
    if (generation.status === "processing" || generation.status === "queued") {
      pollRef.current = setInterval(async () => {
        // Nudge the poll-kling cron so we don't wait a full 2 min interval
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

  // ── Start generation ────────────────────────────────────────────────────────
  const startGeneration = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/albums/${album.slug}/film/generate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Napaka pri zagonu generiranja.");
        return;
      }
      // Start polling immediately
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

  // ── Cost estimate ───────────────────────────────────────────────────────────
  const totalPhotos = (album.photoCount ?? 0);
  const estimatedCostEur = (totalPhotos * 0.05).toFixed(2); // ~$0.05 = ~€0.046

  return (
    <div className="space-y-6">

      {/* ── Header card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Gradient banner */}
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
              </h2>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                Vsako fotografijo pretvori v 5-sekundni kinematografski video posnetek
                z glasnim gibanjem kamere. Idealno za highlights film.
              </p>
            </div>

            {/* Cost pill */}
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400">Ocenjena cena</p>
              <p className="text-lg font-bold text-gray-900">
                ~€{estimatedCostEur}
              </p>
              <p className="text-[10px] text-gray-400">{totalPhotos} foto × €0.05 / posnetek</p>
            </div>
          </div>

          {/* Start / status */}
          <div className="mt-5">
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
                      Generiraj film
                    </>
                  )}
                </button>
                {totalPhotos === 0 && (
                  <p className="text-xs text-gray-400">Najprej naloži vsaj eno fotografijo.</p>
                )}
              </div>
            ) : isProcessing ? (
              /* Progress bar */
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
              /* Failed */
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
                {/* Show first clip error so we know what went wrong */}
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
              <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Clip reel ──────────────────────────────────────────────────── */}
      {clips.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            Posnetki
            <span className="text-xs font-normal text-gray-400">
              {doneClips.length}/{clips.length} pripravljenih
            </span>
          </h3>

          {/* Horizontal scroll reel */}
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
            {clips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>

          {/* Download all */}
          {doneClips.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">
                Klikni posamezni posnetek → desni klik → &quot;Shrani video&quot; za prenos.
                {doneClips.length > 3 && " Za množični prenos kontaktiraj podporo."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Info cards ─────────────────────────────────────────────────── */}
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
          {/* Play/pause overlay */}
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
          {/* Sort order badge */}
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
        /* Queued / processing */
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
