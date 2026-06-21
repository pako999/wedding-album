"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { translations, type Lang } from "@/lib/i18n/translations";

interface Props {
  albumSlug: string;
  albumId: string;
  uploaderName: string;
  maxPhotos: number;
  currentCount: number;
  lang: Lang;
  onClose: () => void;
  onSuccess: () => void;
  onNameChange?: (name: string) => void;
  /** Files pre-selected before the modal opened (e.g. camera capture). */
  initialFiles?: FileList | null;
  /** Event-specific accent color for accent elements (dropzone, progress, button). */
  accent?: string;
  /** Album password (if the album is password-protected) — sent with upload requests. */
  albumPassword?: string;
  /** Album moments (named sub-galleries) — if non-empty, a Moment selector is shown. */
  moments?: { id: string; name: string }[];
  /** Pre-selected moment id for the Moment selector. */
  defaultMomentId?: string | null;
}

interface UploadFile {
  id: string;
  file: File;
  preview: string | null;
  status: "idle" | "compressing" | "uploading" | "done" | "error" | "skipped" | "queued";
  progress: number;
  error?: string;
  isVideo: boolean;
}

const ACCEPTED_IMAGES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"];
const ACCEPTED_VIDEOS = ["video/mp4", "video/quicktime", "video/mov", "video/webm", "video/mpeg", "video/3gpp", "video/avi"];
const ALL_ACCEPTED = [...ACCEPTED_IMAGES, ...ACCEPTED_VIDEOS];
const MAX_IMAGE_MB = 50;
const MAX_VIDEO_MB = 500;

// Vercel's serverless proxy hard-caps request bodies at 4.5 MB regardless of
// runtime config, and the bunny-upload Node route is the bottleneck. We have
// to keep the OUTPUT under ~4.2 MB (with a safety margin for HTTP overhead).
//
// Strategy:
//   • Don't touch anything ≤ TARGET_OUTPUT_BYTES — already small enough.
//   • Above that, resize to MAX_PX on the long edge and re-encode JPEG at
//     QUALITY_HIGH (0.95). For most iPhone shots this lands at 2.5–4 MB —
//     visually indistinguishable from the original.
//   • If the high-quality re-encode is still over the cap (very high-megapixel
//     phones, e.g. Samsung 200 MP), step down to QUALITY_FALLBACK (0.85)
//     rather than 413ing the whole upload.
//
// 4096 px on the long edge is the max useful resolution for screen viewing
// AND for printing up to ~13" wide at 300 dpi (standard photobook size).
// Anything above that is invisible detail on every realistic output.
const TARGET_OUTPUT_BYTES = 3.8 * 1024 * 1024; // 3.8 MB — well under the 4.5 MB Vercel cap
const COMPRESS_MAX_PX     = 4096;              // 4 K (was 3840) — slightly higher ceiling
const QUALITY_HIGH        = 0.95;              // visually indistinguishable (was 0.88)
const QUALITY_FALLBACK    = 0.85;              // used only if HIGH still over cap

/**
 * Resize + re-encode a large image using canvas before it's uploaded.
 * Returns the original file if:
 *  - it's already small enough
 *  - it's a video / GIF
 *  - the browser can't decode it (e.g. HEIC on non-Safari — caught and ignored)
 */
async function maybeCompress(file: File): Promise<File> {
  if (file.size <= TARGET_OUTPUT_BYTES) return file;
  if (file.type.startsWith("video/") || file.type === "image/gif") return file;

  return new Promise<File>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Scale down to COMPRESS_MAX_PX on the longest edge, preserve aspect ratio
      let { width, height } = img;
      if (width > COMPRESS_MAX_PX || height > COMPRESS_MAX_PX) {
        if (width >= height) {
          height = Math.round((height * COMPRESS_MAX_PX) / width);
          width = COMPRESS_MAX_PX;
        } else {
          width = Math.round((width * COMPRESS_MAX_PX) / height);
          height = COMPRESS_MAX_PX;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      const toFile = (blob: Blob | null, q: number) => {
        if (!blob) return null;
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        const f = new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
        // Tag with the quality used — handy for debugging "why is this so big/small"
        // via the browser dev tools without re-running the encode.
        Object.defineProperty(f, "__compressQuality", { value: q, enumerable: false });
        return f;
      };

      // Try high quality first. If it lands over the Vercel cap, re-encode at
      // the fallback quality. Two passes is cheap on the same canvas.
      canvas.toBlob(
        (blob) => {
          const high = toFile(blob, QUALITY_HIGH);
          if (!high) { resolve(file); return; }
          if (high.size <= TARGET_OUTPUT_BYTES) { resolve(high); return; }

          canvas.toBlob(
            (b2) => {
              const fb = toFile(b2, QUALITY_FALLBACK);
              resolve(fb ?? high);
            },
            "image/jpeg",
            QUALITY_FALLBACK,
          );
        },
        "image/jpeg",
        QUALITY_HIGH,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // can't decode (e.g. HEIC on Chrome) — upload original, let server return 413 with clear msg
    };

    img.src = objectUrl;
  });
}

function fmt(bytes: number) { return (bytes / 1024 / 1024).toFixed(1) + " MB"; }

/** Upload a single file using the best available backend. */
async function uploadFile(
  rawFile: File,
  albumSlug: string,
  albumId: string,
  uploaderName: string,
  onProgress: (pct: number) => void,
  albumPassword: string,
  momentId: string | null,
): Promise<"uploaded" | "duplicate"> {
  // 0. Compress if the image is too large for Vercel's 4.5 MB proxy limit
  const file = await maybeCompress(rawFile);

  // 1. Ask server which upload path to use
  const urlRes = await fetch(`/api/albums/${albumSlug}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-album-password": albumPassword },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  });
  if (!urlRes.ok) {
    const errBody = await urlRes.text().catch(() => "");
    let errMsg = errBody;
    try { errMsg = (JSON.parse(errBody) as { error?: string }).error ?? errBody; } catch { /* raw text */ }
    throw new Error(errMsg);
  }

  type UrlData =
    | { type: "bunny-stream";  uploadUrl: string; videoId: string; signature: string; expiration: number; libraryId: string }
    | { type: "bunny-storage"; key: string }
    | { type: "r2";            presignedUrl: string; publicUrl: string; key: string }
    | { type: "stream";        uploadUrl: string; videoId: string }
    | { type: "vercel-blob" }
    | { type: "duplicate" };

  const urlData = await urlRes.json() as UrlData;

  // Server detected an identical file already in this album — skip it.
  if (urlData.type === "duplicate") return "duplicate";

  // ── Bunny Stream (tus direct upload) ──────────────────────────────────────
  if (urlData.type === "bunny-stream") {
    await uploadViaBunnyStream(file, urlData, onProgress);
    await saveUpload(albumSlug, {
      cfStreamVideoId: urlData.videoId,
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
      momentId,
    });
    onProgress(100);
    return "uploaded";
  }

  // ── Bunny Storage (XHR proxy — real byte-level progress) ────────────────────
  if (urlData.type === "bunny-storage") {
    const publicUrl = await xhrUpload(
      `/api/albums/${albumSlug}/bunny-upload?key=${encodeURIComponent(urlData.key)}`,
      file,
      // Scale to 0-90 % so the final save step fills the last 10 %
      pct => onProgress(Math.round(pct * 0.9)),
    );
    onProgress(92);
    await saveUpload(albumSlug, {
      blobUrl: publicUrl,
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
      momentId,
    });
    onProgress(100);
    return "uploaded";
  }

  // ── Cloudflare R2 (presigned PUT) ─────────────────────────────────────────
  if (urlData.type === "r2") {
    onProgress(10);
    const put = await fetch(urlData.presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!put.ok) throw new Error(`R2 upload failed: ${put.status}`);
    onProgress(80);
    await saveUpload(albumSlug, {
      blobUrl: urlData.publicUrl,
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
      momentId,
    });
    onProgress(100);
    return "uploaded";
  }

  // ── Cloudflare Stream (tus) ───────────────────────────────────────────────
  if (urlData.type === "stream") {
    await uploadViaCFStream(file, urlData.uploadUrl, onProgress);
    await saveUpload(albumSlug, {
      cfStreamVideoId: urlData.videoId,
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
      momentId,
    });
    onProgress(100);
    return "uploaded";
  }

  // ── Vercel Blob fallback ──────────────────────────────────────────────────
  const { upload } = await import("@vercel/blob/client");
  onProgress(10);
  const blob = await upload(
    `albums/${albumId}/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "bin"}`,
    file,
    {
      access: "public",
      handleUploadUrl: `/api/albums/${albumSlug}/upload`,
      clientPayload: JSON.stringify({ uploaderName }),
      multipart: true,
      onUploadProgress: ({ percentage }) => onProgress(Math.round(percentage * 0.85)),
    },
  );
  onProgress(88);
  await saveUpload(albumSlug, {
    blobUrl: blob.url,
    mimeType: file.type,
    originalFilename: file.name,
    sizeBytes: file.size,
    uploaderName,
    momentId,
  });
  onProgress(100);
  return "uploaded";
}

/** tus upload for Bunny Stream */
async function uploadViaBunnyStream(
  file: File,
  creds: { uploadUrl: string; videoId: string; signature: string; expiration: number; libraryId: string },
  onProgress: (pct: number) => void,
): Promise<void> {
  const { Upload } = await import("tus-js-client");

  return new Promise((resolve, reject) => {
    const tus = new Upload(file, {
      endpoint: creds.uploadUrl,
      chunkSize: 50 * 1024 * 1024, // 50 MB chunks
      retryDelays: [0, 2000, 5000],
      headers: {
        AuthorizationSignature: creds.signature,
        AuthorizationExpire: String(creds.expiration),
        VideoId: creds.videoId,
        LibraryId: String(creds.libraryId),
      },
      metadata: { filetype: file.type, title: file.name },
      onProgress(uploaded, total) {
        onProgress(Math.round((uploaded / total) * 90));
      },
      onSuccess() { resolve(); },
      onError(err) { reject(err); },
    });
    tus.start();
  });
}

/** tus upload for Cloudflare Stream (legacy / fallback) */
async function uploadViaCFStream(
  file: File,
  uploadUrl: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  const { Upload } = await import("tus-js-client");

  return new Promise((resolve, reject) => {
    const tus = new Upload(file, {
      uploadUrl,
      chunkSize: 50 * 1024 * 1024,
      retryDelays: [0, 2000, 5000],
      metadata: { name: file.name, filetype: file.type },
      onProgress(uploaded, total) {
        onProgress(Math.round((uploaded / total) * 90));
      },
      onSuccess() { resolve(); },
      onError(err) { reject(err); },
    });
    tus.start();
  });
}

/**
 * Upload a file via XMLHttpRequest so we get real upload-progress events.
 * Returns the `publicUrl` from the JSON response.
 *
 * Stall detection: if no upload progress is reported for STALL_MS milliseconds
 * (e.g. because the phone was locked or backgrounded), the XHR is aborted and
 * the promise rejects with a retriable error.  The component's visibility-change
 * handler will then automatically retry failed files when the user returns.
 */
const STALL_MS = 25_000; // 25 s — typical iOS background grace period is ~30 s

function xhrUpload(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Stall timer — reset on every progress tick; fires if transfer freezes
    let stallTimer: ReturnType<typeof setTimeout> | null = null;
    const resetStall = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => {
        xhr.abort();
        reject(new Error("STALL")); // special code so caller can retry silently
      }, STALL_MS);
    };
    const clearStall = () => { if (stallTimer) clearTimeout(stallTimer); stallTimer = null; };

    xhr.upload.addEventListener("progress", (e) => {
      resetStall(); // any progress resets the stall clock
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      clearStall();
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { publicUrl?: string; error?: string };
          if (data.publicUrl) {
            resolve(data.publicUrl);
          } else {
            reject(new Error(data.error ?? "No URL returned from storage"));
          }
        } catch {
          reject(new Error("Invalid response from storage proxy"));
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText.slice(0, 200)}`));
      }
    });

    xhr.addEventListener("error", () => { clearStall(); reject(new Error("Network error during upload")); });
    xhr.addEventListener("abort", () => { clearStall(); reject(new Error("STALL")); });

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    resetStall(); // start the stall clock immediately on send
    xhr.send(file);
  });
}

async function saveUpload(slug: string, body: object) {
  const res = await fetch(`/api/albums/${slug}/save-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UploadModal({ albumSlug, albumId, uploaderName, maxPhotos, currentCount, lang, onClose, onSuccess, onNameChange: _onNameChange, initialFiles, accent = "#C9820A", albumPassword = "", moments = [], defaultMomentId = null }: Props) {
  const t = translations[lang];
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [momentId, setMomentId] = useState<string>(defaultMomentId ?? "");
  const [droppedCount, setDroppedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = Math.max(0, maxPhotos - currentCount);
  const isDemo = albumSlug === "ana-marko-13ka";
  const hasUploaded = files.some(f => f.status === "done" || f.status === "skipped");
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  // Keep a ref so async callbacks always see latest values
  const uploadingRef = useRef(false);
  const filesRef     = useRef(files);
  useEffect(() => { uploadingRef.current = uploading; }, [uploading]);
  useEffect(() => { filesRef.current = files; }, [files]);

  const addFiles = useCallback((raw: FileList | File[]) => {
    const toAdd: UploadFile[] = [];
    let dropped = 0;
    for (const f of Array.from(raw)) {
      if (!ALL_ACCEPTED.includes(f.type)) continue;
      const isVideo = ACCEPTED_VIDEOS.includes(f.type);
      const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (f.size > maxMB * 1024 * 1024) continue;
      if (files.length + toAdd.length >= remaining) { dropped++; continue; }
      toAdd.push({ id: crypto.randomUUID(), file: f, preview: isVideo ? null : URL.createObjectURL(f), status: "idle", progress: 0, isVideo });
    }
    if (dropped > 0) setDroppedCount(n => n + dropped);
    setFiles(p => [...p, ...toAdd]);
  }, [files.length, remaining]);

  // Pre-load files captured before the modal opened (camera snap / pre-selected files)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initialFiles?.length) addFiles(initialFiles); }, []);

  // Block accidental tab/window close while uploading
  useEffect(() => {
    if (!uploading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [uploading]);

  // ── Wake Lock — keep screen on while uploading ────────────────────────────
  // Prevents the phone from auto-locking during an upload session.
  // Supported on Chrome/Edge/Android; silently ignored on iOS Safari.
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    if (!uploading) {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
      return;
    }
    if ("wakeLock" in navigator) {
      (navigator as Navigator & { wakeLock: { request(t: string): Promise<WakeLockSentinel> } })
        .wakeLock.request("screen")
        .then((lock) => { wakeLockRef.current = lock; })
        .catch(() => {}); // silently ignore — not critical
    }
  }, [uploading]);

  // ── Offline / online detection ────────────────────────────────────────────
  // When the device loses connectivity, newly queued files are held in
  // "queued" state. When the connection returns the `online` event resets
  // them to "idle" and the auto-start effect picks them up automatically.
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      setFiles(prev =>
        prev.map(f => f.status === "queued" ? { ...f, status: "idle", error: undefined } : f),
      );
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // ── Visibility-change auto-retry ─────────────────────────────────────────
  // When the user switches back to the browser (after phone lock or app switch),
  // any uploads that stalled get an "error" status (from the 25 s stall timeout).
  // This handler resets those error files and restarts the upload automatically.
  const retryRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const handler = () => {
      if (document.hidden) return;
      // Only act if we're not already uploading (stall timeout already fired)
      if (uploadingRef.current) return;
      const stalled = filesRef.current.filter(f => f.status === "error");
      if (stalled.length === 0) return;
      // Reset stalled files to idle so uploadAll() will retry them
      setFiles(prev =>
        prev.map(f => f.status === "error" ? { ...f, status: "idle", progress: 0, error: undefined } : f),
      );
      // Trigger retry via ref (avoids stale closure)
      retryRef.current?.();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  const removeFile = (id: string) => setFiles(p => {
    const f = p.find(x => x.id === id);
    if (f?.preview) URL.revokeObjectURL(f.preview);
    return p.filter(x => x.id !== id);
  });

  const updateFile = (id: string, patch: Partial<UploadFile>) =>
    setFiles(p => p.map(f => f.id === id ? { ...f, ...patch } : f));

  const uploadAll = async () => {
    if (!files.length || uploading) return;
    setUploading(true);

    for (const f of files) {
      if (f.status === "done" || f.status === "skipped") continue;

      // Show "Optimizira…" if this image is large enough to need compression
      const needsCompress = !f.isVideo && f.file.size > TARGET_OUTPUT_BYTES;
      if (needsCompress) updateFile(f.id, { status: "compressing", progress: 0 });
      else updateFile(f.id, { status: "uploading", progress: 5 });

      try {
        const result = await uploadFile(
          f.file, albumSlug, albumId, uploaderName,
          pct => updateFile(f.id, { status: "uploading", progress: pct }),
          albumPassword,
          momentId || null,
        );
        updateFile(f.id, { status: result === "duplicate" ? "skipped" : "done", progress: 100 });
      } catch (err) {
        const msg = err instanceof Error ? err.message : t.genericError;
        // STALL = phone was locked/backgrounded — don't show red error text,
        // visibility-change handler will auto-retry when user returns
        const isStall = msg === "STALL";
        updateFile(f.id, {
          status: "error",
          error: isStall ? undefined : msg,
          progress: 0,
        });
      }
    }

    setUploading(false);
    setAllDone(filesRef.current.some(f => f.status === "done"));
  };

  // Keep retry ref up to date so the visibility handler can call latest uploadAll
  useEffect(() => { retryRef.current = uploadAll; });

  // Auto-start the upload as soon as files are added — no "Naloži" button needed.
  // If the device is offline, mark files as "queued" instead; the online
  // handler above will flip them back to "idle" and this effect fires again.
  useEffect(() => {
    if (!uploading && files.some(f => f.status === "idle")) {
      if (!navigator.onLine) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFiles(prev => prev.map(f =>
          f.status === "idle" ? { ...f, status: "queued" } : f,
        ));
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void uploadAll();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, uploading]);

  const success = files.filter(f => f.status === "done").length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-[#0F1729]/70 backdrop-blur-sm" onClick={!uploading ? onClose : undefined} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-serif text-xl font-light text-[#0F1729]">{t.uploadModalTitle}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-[#0F1729]/40 px-2 py-0.5 rounded-full font-medium" style={{ background: `${accent}1A` }}>📷 {t.maxImageSize(MAX_IMAGE_MB)}</span>
              <span className="text-[10px] text-[#0F1729]/40 px-2 py-0.5 rounded-full font-medium" style={{ background: `${accent}1A` }}>📹 {t.maxVideoSize(MAX_VIDEO_MB)}</span>
              <span className="text-[10px] text-green-600 font-medium">{t.fullQuality}</span>
            </div>
          </div>
          <button onClick={onClose} disabled={uploading} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-40">
            <svg className="w-4 h-4 text-[#0F1729]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isOffline && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-200 text-blue-800 text-xs shrink-0">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12v.01M15.536 8.464a5 5 0 010 7.072M8.464 8.464a5 5 0 000 7.072" />
            </svg>
            <span>{t.offlineBanner}</span>
          </div>
        )}

        {droppedCount > 0 && (
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs shrink-0">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>{t.filesDropped(droppedCount)}</span>
            <button onClick={() => setDroppedCount(0)} className="ml-auto shrink-0 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {allDone ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-serif text-xl font-light text-[#0F1729] mb-1">{t.successTitle(success)}</p>
              <p className="font-sans text-sm text-[#0F1729]/60 mb-3">{t.successDesc}</p>
              {/* Approval note — demo albums show a "not public" notice instead */}
              <p className="font-sans text-xs text-[#0F1729]/45 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-6 leading-relaxed">
                {isDemo ? t.demoUploadNote : t.approvalNote}
              </p>
              <button
                onClick={onSuccess}
                className="px-6 py-2.5 text-[#F2F4F8] font-sans text-sm rounded-xl transition-colors"
                style={{ background: "#0F1729" }}
                onMouseEnter={e => { e.currentTarget.style.background = accent; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#0F1729"; }}
              >
                {t.closeWindow}
              </button>
            </div>
          ) : (
            <>
              {/* Moment selector */}
              {moments.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#0F1729]/60 mb-1.5">{t.momentLabel}</label>
                  <select
                    value={momentId}
                    onChange={(e) => setMomentId(e.target.value)}
                    disabled={uploading}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-[#0F1729] bg-white outline-none disabled:opacity-50"
                  >
                    <option value="">{t.momentNone}</option>
                    {moments.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Drop zone */}
              {files.length < remaining && (
                <div
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => inputRef.current?.click()}
                  onMouseEnter={e => { if (!dragOver) { e.currentTarget.style.borderColor = `${accent}99`; e.currentTarget.style.background = `${accent}0D`; } }}
                  onMouseLeave={e => { if (!dragOver) { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.background = "transparent"; } }}
                  className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer select-none transition-all"
                  style={dragOver
                    ? { borderColor: accent, background: `${accent}14` }
                    : { borderColor: "#D1D5DB", background: "transparent" }}
                >
                  <input ref={inputRef} type="file" multiple accept={ALL_ACCEPTED.join(",")} className="hidden" onChange={e => e.target.files && addFiles(e.target.files)} />
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${accent}1A` }}>
                    <svg className="w-6 h-6" style={{ color: accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="font-sans text-sm font-semibold text-[#0F1729]/80 mb-1">
                    {dragOver ? t.dropFiles : t.selectPhotosVideos}
                  </p>
                  <p className="font-sans text-xs text-[#0F1729]/40">{t.fileTypesHint(remaining)}</p>
                </div>
              )}

              {/* File list */}
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-200">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: `${accent}1A` }}>
                    {f.isVideo
                      ? <svg className="w-6 h-6" style={{ color: accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
                      : f.preview ? <img src={f.preview} alt="" className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-[#0F1729] truncate font-medium">{f.file.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {f.status === "idle" && <p className="text-xs text-[#0F1729]/40">{f.isVideo ? "📹" : "📷"} {fmt(f.file.size)}</p>}
                      {f.status === "compressing" && (
                        <p className="text-xs text-amber-600 flex items-center gap-1.5 font-medium">
                          <svg className="w-3 h-3 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          {t.optimizing}
                        </p>
                      )}
                      {f.status === "uploading" && (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${accent}26` }}>
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${f.progress}%`, background: accent }} />
                          </div>
                          <span className="text-xs font-semibold shrink-0" style={{ color: accent }}>{f.progress}%</span>
                        </div>
                      )}
                      {f.status === "done" && <p className="text-xs text-green-600 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t.fileUploaded}</p>}
                      {f.status === "skipped" && <p className="text-xs text-gray-400 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t.alreadyUploaded}</p>}
                      {f.status === "queued" && <p className="text-xs text-blue-500 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{t.fileQueued}</p>}
                      {f.status === "error" && <p className="text-xs text-red-500 truncate">{f.error}</p>}
                    </div>
                  </div>
                  {f.status === "idle" && (
                    <button onClick={() => removeFile(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 shrink-0">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {!allDone && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-3">
            {/* Overall progress bar — visible only while uploading */}
            {uploading && (() => {
              const total = files.length;
              const done = files.filter(f => f.status === "done").length;
              const avgPct = total > 0
                ? Math.round(files.reduce((s, f) => s + f.progress, 0) / total)
                : 0;
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#0F1729]/50 font-medium">
                      {done < total ? t.uploadingProgress(done + 1, total) : t.saving}
                    </span>
                    <span className="text-xs font-bold" style={{ color: accent }}>{avgPct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: `${accent}26` }}>
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${avgPct}%`, background: accent }}
                    />
                  </div>
                  {/* Keep-screen-on warning */}
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>{t.doNotCloseWindow}</span>
                  </div>
                </div>
              );
            })()}

            {/* Single action — uploading starts automatically, so the footer
                only needs a clear, visible close button. */}
            <button
              onClick={hasUploaded ? onSuccess : onClose}
              disabled={uploading}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-60"
              style={{ background: uploading ? "#94A3B8" : accent }}
            >
              {uploading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t.uploading}</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>{t.closeWindow}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
