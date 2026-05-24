"use client";

/**
 * ZipDownloader
 *
 * Fetches all album photos/videos directly from the CDN in the browser,
 * streams them into a ZIP using client-zip, then triggers the download.
 *
 * Why client-side?
 *  • No server memory limit — Vercel functions cap at 1 GB
 *  • No 5-minute timeout — the browser can take as long as needed
 *  • Files are fetched in parallel from the CDN
 *  • Works for albums of any size (limited only by the user's browser + disk)
 *
 * For browsers that support the File System Access API (Chrome, Edge),
 * the ZIP streams directly to disk — zero RAM overhead.
 * Other browsers (Firefox, Safari) receive the ZIP as a blob, which is
 * buffered in memory first — fine for typical album sizes (< 4 GB).
 */

import { useEffect, useState } from "react";
import { downloadZip } from "client-zip";

interface Props {
  albumSlug: string;
  className?: string;
  children?: React.ReactNode;
}

type Phase = "idle" | "fetching-list" | "downloading" | "done" | "error";

export function ZipDownloader({ albumSlug, className, children }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0); // 0-100
  const [total, setTotal]       = useState(0);
  const [done, setDone]         = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  // Server-side hint about videos the API couldn't include (typically
  // Bunny Stream videos when BUNNY_STREAM_CDN_URL isn't set, or when
  // MP4 Fallback is disabled in the Bunny library). Shown in a small
  // amber banner under the "✓ Prenos končan" state so the user knows
  // why a photos-only ZIP arrived.
  const [skippedNote, setSkippedNote] = useState<string | null>(null);

  // Auto-return to idle so the button is clickable again. Without this,
  // the modern "showSaveFilePicker" branch leaves the button stuck on
  // "✓ Prenos končan" forever (no onClick), and the user can't trigger
  // another download without refreshing the page.
  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => {
      setPhase("idle");
      setProgress(0);
      setDone(0);
      setTotal(0);
      // Keep skippedNote visible until the user dismisses with another click,
      // so they don't miss the hint about why videos weren't included.
    }, 3000);
    return () => clearTimeout(t);
  }, [phase]);

  async function startDownload() {
    // Permit a fresh download from idle / error / done — only block while
    // a fetch/save is genuinely in flight.
    if (phase === "fetching-list" || phase === "downloading") return;
    setPhase("fetching-list");
    setProgress(0);
    setDone(0);
    setErrorMsg("");
    setSkippedNote(null);

    try {
      // 1. Fetch the list of file URLs from the server (lightweight JSON)
      const listRes = await fetch(`/api/albums/${albumSlug}/download-urls`);
      if (!listRes.ok) throw new Error("Seznama datotek ni bilo mogoče naložiti");
      const { files, slug, skipped } = await listRes.json() as {
        files: { name: string; url: string }[];
        slug: string;
        skipped?: { count: number; reason: string }[];
      };
      if (skipped && skipped.length > 0) {
        const totalSkipped = skipped.reduce((s, x) => s + x.count, 0);
        // Friendly translation — the raw server reason names env vars and
        // would confuse non-technical owners.
        setSkippedNote(
          `${totalSkipped} videoposnetkov ni mogoče vključiti v ZIP. ` +
          `V Bunny Stream knjižnici omogoči "MP4 Fallback" in nastavi ` +
          `BUNNY_STREAM_CDN_URL v Vercel okolju.`,
        );
      }

      if (files.length === 0) {
        throw new Error("Galerija nima datotek za prenos");
      }

      setTotal(files.length);
      setPhase("downloading");

      // 2. Build an async iterable that fetches each file and reports progress.
      // Use a plain local counter so progress updates are pure (no state setter
      // called inside another state setter's functional updater).
      let localDone = 0;
      const total = files.length;

      async function* fileIterator() {
        for (const file of files) {
          const res = await fetch(file.url);
          localDone++;
          if (!res.ok) {
            // Skip failed files silently — count them in progress anyway
            setDone(localDone);
            setProgress(Math.round((localDone / total) * 100));
            continue;
          }
          yield { name: file.name, input: res };
          setDone(localDone);
          setProgress(Math.round((localDone / total) * 100));
        }
      }

      const zipResponse = downloadZip(fileIterator());
      const filename = `guestcam-${slug}.zip`;

      // 3a. Modern browsers — stream directly to disk (no RAM overhead)
      if ("showSaveFilePicker" in window) {
        try {
          const handle = await (window as Window & {
            showSaveFilePicker: (opts: object) => Promise<FileSystemFileHandle>;
          }).showSaveFilePicker({ suggestedName: filename, types: [{ description: "ZIP arhiv", accept: { "application/zip": [".zip"] } }] });
          const writable = await handle.createWritable();
          await zipResponse.body!.pipeTo(writable);
          setPhase("done");
          return;
        } catch (err: unknown) {
          // User cancelled the save dialog — fall through to blob method
          if (err instanceof Error && err.name === "AbortError") {
            setPhase("idle");
            return;
          }
          // Any other error — fall through to blob fallback
        }
      }

      // 3b. Fallback — buffer as Blob, then trigger <a download>
      const blob = await zipResponse.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      setPhase("done");
      // The useEffect on `done` re-arms idle automatically (~3s), so we
      // don't need a manual reset timer here.
    } catch (err) {
      console.error("[ZipDownloader]", err);
      setErrorMsg(err instanceof Error ? err.message : "Prenos ni uspel");
      setPhase("error");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (phase === "fetching-list") {
    return (
      <button disabled className={className}>
        <svg className="w-4 h-4 animate-spin mr-1.5 inline" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Pripravljam seznam…
      </button>
    );
  }

  if (phase === "downloading") {
    return (
      <div className="flex flex-col gap-1 w-full">
        <button disabled className={className}>
          <svg className="w-4 h-4 animate-spin mr-1.5 inline" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Prenašam {done} / {total} ({progress}%)
        </button>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFC94D] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-amber-600 text-center">Ne zaprite okna med prenašanjem</p>
      </div>
    );
  }

  if (phase === "done") {
    // Clickable confirmation — taps re-trigger a fresh download right
    // away if the user wants another copy, otherwise the useEffect
    // returns the button to its idle "Prenesi ZIP" state after 3 s.
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <button onClick={startDownload} className={className} title="Klikni za ponoven prenos">
          ✓ Prenos končan — klikni za nov prenos
        </button>
        {skippedNote && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            ⚠ {skippedNote}
          </p>
        )}
      </div>
    );
  }

  if (phase === "error") {
    return (
      <button onClick={startDownload} className={className} title={errorMsg}>
        ⚠ Napaka — kliknite za ponoven poskus
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <button onClick={startDownload} className={className}>
        {children ?? "⬇ Prenesi vse (ZIP)"}
      </button>
      {skippedNote && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          ⚠ {skippedNote}
        </p>
      )}
    </div>
  );
}
