"use client";

import { useState, useSyncExternalStore } from "react";

/**
 * SaveToPhotosButton
 *
 * Mobile-friendly alternative to the ZIP downloader. On phones the ZIP
 * lands in Files/Downloads where the user then has to manually unzip and
 * re-share each item to the Photos / Gallery app — most users give up.
 *
 * This button instead:
 *
 *  1. Fetches the full media list from /api/albums/:slug/download-urls
 *     (already used by the ZIP downloader — same auth, same list).
 *  2. For each file: fetches the bytes from Bunny CDN (CORS confirmed
 *     `Access-Control-Allow-Origin: *`), wraps in a `File`, and calls
 *     `navigator.share({ files: [...] })`. iOS shows the native share
 *     sheet with "Save Image" / "Save Video"; Android shows "Save to
 *     Gallery" / file-picker. One tap per batch → media lands directly
 *     in the user's Photos / Gallery app.
 *  3. Falls back to per-file `<a download>` if the browser doesn't
 *     support Web Share API with files (older iOS, desktop Firefox).
 *
 * The ZIP downloader stays alongside — it's still the right answer for
 * desktop users archiving the album.
 */

interface Props {
  albumSlug: string;
  className?: string;
}

type Phase = "idle" | "loading" | "sharing" | "done" | "error";

interface MediaFile { name: string; url: string }

/** Batch size for navigator.share(). iOS / Android typically handle
 *  ~10 files per share-sheet without complaint; bigger batches sometimes
 *  silently drop attachments. */
const SHARE_BATCH = 10;

const subscribeToBrowserCapabilities = () => () => {};

function supportsFileShare(): boolean {
  if (typeof navigator === "undefined") return false;
  if (!("share" in navigator) || !("canShare" in navigator)) return false;
  const canShare = (navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  }).canShare;
  if (typeof canShare !== "function") return false;
  try {
    return canShare.call(navigator, {
      files: [new File([new Blob([])], "probe.txt", { type: "text/plain" })],
    });
  } catch {
    return false;
  }
}

export function SaveToPhotosButton({ albumSlug, className }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supportsShare = useSyncExternalStore(
    subscribeToBrowserCapabilities,
    supportsFileShare,
    () => false,
  );

  async function fetchFile(url: string, name: string): Promise<File | null> {
    try {
      const res = await fetch(url, { mode: "cors", credentials: "omit" });
      if (!res.ok) return null;
      const blob = await res.blob();
      const type = blob.type || "application/octet-stream";
      return new File([blob], name.split("/").pop() ?? name, { type });
    } catch {
      return null;
    }
  }

  async function shareBatch(files: File[]) {
    if (files.length === 0) return;
    try {
      await navigator.share({
        files,
        title: `Guestcam — ${files.length === 1 ? "1 datoteka" : `${files.length} datotek`}`,
      });
    } catch (err) {
      // User cancelled the share-sheet — that's not an error per se,
      // but we stop the loop so they aren't bombarded with sheets.
      const e = err as { name?: string };
      if (e?.name === "AbortError") {
        throw new Error("CANCELLED");
      }
      throw err;
    }
  }

  async function downloadOne(file: MediaFile) {
    // Fallback for browsers that don't support Web Share API with files.
    // iOS pre-15 will prompt "Save Image to Photos?" on long-press of an
    // anchor with download attribute; modern Chrome on Android saves the
    // file to Downloads, then the user can move to Gallery.
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name.split("/").pop() ?? file.name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // small gap so we don't blow up the browser's download queue
    await new Promise((r) => setTimeout(r, 400));
  }

  async function run() {
    setErrorMsg(null);
    setPhase("loading");
    setProgress({ done: 0, total: 0 });

    // 1) Get the list
    let list: MediaFile[] = [];
    try {
      const res = await fetch(`/api/albums/${albumSlug}/download-urls`);
      if (!res.ok) throw new Error("list");
      const j = await res.json() as { files?: MediaFile[] };
      list = j.files ?? [];
    } catch {
      setPhase("error");
      setErrorMsg("Seznama datotek ni bilo mogoče naložiti.");
      return;
    }
    if (list.length === 0) {
      setPhase("error");
      setErrorMsg("Galerija je prazna.");
      return;
    }
    setProgress({ done: 0, total: list.length });
    setPhase("sharing");

    // 2) Fast path: native share-sheet on supported phones
    if (supportsShare) {
      for (let i = 0; i < list.length; i += SHARE_BATCH) {
        const batch = list.slice(i, i + SHARE_BATCH);
        const files: File[] = [];
        for (const item of batch) {
          const f = await fetchFile(item.url, item.name);
          if (f) files.push(f);
        }
        if (files.length === 0) continue;
        try {
          await shareBatch(files);
        } catch (err) {
          if ((err as Error).message === "CANCELLED") {
            // User dismissed the sheet — stop here, mark as done with
            // partial. They can re-open the dialog to continue.
            break;
          }
          setPhase("error");
          setErrorMsg("Sistem souporabe ni uspel. Poskusite znova ali uporabite ZIP prenos.");
          return;
        }
        setProgress((p) => ({ ...p, done: Math.min(p.total, p.done + batch.length) }));
      }
      setPhase("done");
      return;
    }

    // 3) Fallback: per-file <a download> with small delays
    for (const item of list) {
      await downloadOne(item);
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setPhase("done");
  }

  if (phase === "loading" || phase === "sharing") {
    return (
      <button
        disabled
        className={className ?? "flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg bg-white"}
      >
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Pripravljam… {progress.total > 0 && `${progress.done}/${progress.total}`}
      </button>
    );
  }

  if (phase === "done") {
    return (
      <button
        onClick={() => { setPhase("idle"); setProgress({ done: 0, total: 0 }); }}
        className={className ?? "flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-lg"}
        title="Končano — vse datoteke shranjene"
      >
        ✓ Shranjeno {progress.total > 0 && `(${progress.total})`}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={run}
        className={className ?? "flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"}
        title={supportsShare
          ? "Shrani vse fotografije in videe v Galerijo telefona — brez ZIP-a."
          : "Prenese vse datoteke ena za drugo. Na telefonu jih nato dolgo pritisnite → »Shrani sliko« / »Shrani video«."}
      >
        📱 Shrani v Galerijo
      </button>
      {errorMsg && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}
