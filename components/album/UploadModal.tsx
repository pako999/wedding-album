"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { translations, type Lang } from "@/lib/i18n/translations";
import { LEAD_COPY } from "@/lib/i18n/lead-translations";
import { GuestReferralCta } from "@/components/album/GuestReferralCta";

interface Props {
  albumSlug: string;
  albumId: string;
  uploaderName: string;
  maxPhotos: number;
  currentCount: number;
  lang: Lang;
  onClose: () => void;
  /** Called when the guest closes the success screen. `emailCaptured`
   *  tells the gallery whether they already left their email here — if
   *  not, the gallery shows a follow-up email banner so the offer isn't
   *  lost when they close the modal without scrolling to the form. */
  onSuccess: (info?: { emailCaptured: boolean }) => void;
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
  /** Events/business package: collect name, surname and email from the
   *  guest before they can upload. Off for ordinary galleries. */
  requireGuestData?: boolean;
  /** Event/organiser name, used in the marketing-consent wording so the
   *  guest can see who they'd be consenting to hear from. */
  organiserName?: string;
  /** Album's own referral code — shown to the guest after upload as an
   *  invite to create their own gallery with 15% off. Optional; if
   *  null (e.g. legacy album pre-backfill) the CTA hides itself. */
  referralCode?: string | null;
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

// This is only an anti-abuse safety ceiling. We do NOT resize/re-encode normal
// phone photos before upload. A 20 MB, 30 MB or 50 MB image is uploaded to
// Bunny as the exact original file. The gallery uses Bunny Image Optimizer for
// smaller display variants; ZIP downloads use the original Bunny object.
const MAX_IMAGE_MB = 250;
const MAX_VIDEO_MB = 500;

function fmt(bytes: number) { return (bytes / 1024 / 1024).toFixed(1) + " MB"; }

/** Pixel dimensions of the original image file, or null when they can't be read
 *  (HEIC on some browsers, corrupt file …). These dimensions describe the same
 *  original bytes that are stored in Bunny. */
async function readImageDims(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/")) return null;
  try {
    const bmp = await createImageBitmap(file);
    const dims = { width: bmp.width, height: bmp.height };
    bmp.close();
    return dims;
  } catch {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }
}

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
  // Preserve the original bytes. No browser-side resize or JPEG re-encode.
  const file = rawFile;
  const dims = await readImageDims(file);

  // Ask the server which upload path to use.
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
    | { type: "bunny-s3";      presignedUrl: string; publicUrl: string; key: string }
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
    }, albumPassword);
    onProgress(100);
    return "uploaded";
  }

  // ── Bunny Storage S3: original browser file → Bunny directly ──────────────
  if (urlData.type === "bunny-s3") {
    onProgress(8);
    const put = await fetch(urlData.presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!put.ok) throw new Error(`Bunny direct upload failed: ${put.status}`);
    onProgress(92);
    await saveUpload(albumSlug, {
      blobUrl: urlData.publicUrl,
      ...(dims ?? {}),
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
      momentId,
    }, albumPassword);
    onProgress(100);
    return "uploaded";
  }

  // ── Bunny Storage legacy proxy fallback ────────────────────────────────────
  if (urlData.type === "bunny-storage") {
    const publicUrl = await retryingXhrUpload(
      `/api/albums/${albumSlug}/bunny-upload?key=${encodeURIComponent(urlData.key)}`,
      file,
      pct => onProgress(Math.round(pct * 0.9)),
      albumPassword,
    );
    onProgress(92);
    await saveUpload(albumSlug, {
      blobUrl: publicUrl,
      ...(dims ?? {}),
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
      momentId,
    }, albumPassword);
    onProgress(100);
    return "uploaded";
  }

  // ── Cloudflare R2 legacy compatibility ─────────────────────────────────────
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
      ...(dims ?? {}),
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
      momentId,
    }, albumPassword);
    onProgress(100);
    return "uploaded";
  }

  // ── Cloudflare Stream (legacy / fallback) ─────────────────────────────────
  if (urlData.type === "stream") {
    await uploadViaCFStream(file, urlData.uploadUrl, onProgress);
    await saveUpload(albumSlug, {
      cfStreamVideoId: urlData.videoId,
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
      momentId,
    }, albumPassword);
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
    ...(dims ?? {}),
    mimeType: file.type,
    originalFilename: file.name,
    sizeBytes: file.size,
    uploaderName,
    momentId,
  }, albumPassword);
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
      chunkSize: 50 * 1024 * 1024,
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
 * the promise rejects with a retriable error. The component's visibility-change
 * handler will then automatically retry failed files when the user returns.
 */
const STALL_MS = 25_000;

interface UploadHttpError extends Error { status?: number; retryAfterMs?: number }

const RETRIABLE = new Set([0, 429, 500, 502, 503, 504]);
const BACKOFF_MS = [2_000, 5_000, 10_000, 20_000];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function retryingXhrUpload(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
  albumPassword = "",
): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    try {
      return await xhrUpload(url, file, onProgress, albumPassword);
    } catch (err) {
      lastErr = err;
      const e = err as UploadHttpError;
      if (e?.message === "STALL") throw err;
      const status = e?.status;
      if (status === undefined || !RETRIABLE.has(status)) throw err;
      if (attempt === BACKOFF_MS.length) break;
      const base = e.retryAfterMs ?? BACKOFF_MS[attempt];
      await sleep(base + Math.random() * 1000);
      onProgress(0);
    }
  }
  throw lastErr;
}

function xhrUpload(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
  albumPassword = "",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    let stallTimer: ReturnType<typeof setTimeout> | null = null;
    const resetStall = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => {
        xhr.abort();
        reject(new Error("STALL"));
      }, STALL_MS);
    };
    const clearStall = () => { if (stallTimer) clearTimeout(stallTimer); stallTimer = null; };

    xhr.upload.addEventListener("progress", (e) => {
      resetStall();
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
        const err = new Error(`Upload failed (${xhr.status}): ${xhr.responseText.slice(0, 200)}`) as UploadHttpError;
        err.status = xhr.status;
        const ra = xhr.getResponseHeader("Retry-After");
        if (ra) {
          const secs = Number(ra);
          if (Number.isFinite(secs)) err.retryAfterMs = secs * 1000;
        }
        reject(err);
      }
    });

    xhr.addEventListener("error", () => {
      clearStall();
      const err = new Error("Network error during upload") as UploadHttpError;
      err.status = 0;
      reject(err);
    });
    xhr.addEventListener("abort", () => { clearStall(); reject(new Error("STALL")); });

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    if (albumPassword) xhr.setRequestHeader("x-album-password", albumPassword);
    resetStall();
    xhr.send(file);
  });
}

async function saveUpload(slug: string, body: object, albumPassword = "") {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (albumPassword) headers["x-album-password"] = albumPassword;
  const res = await fetch(`/api/albums/${slug}/save-upload`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UploadModal({ albumSlug, albumId, uploaderName, maxPhotos, currentCount, lang, onClose, onSuccess, onNameChange: _onNameChange, initialFiles, accent = "#C9820A", albumPassword = "", moments = [], defaultMomentId = null, referralCode = null, requireGuestData = false, organiserName = "" }: Props) {
  const t = translations[lang];
  const lead = LEAD_COPY[lang];

  const leadStorageKey = `gc_lead_${albumSlug}`;
  const [leadDone, setLeadDone] = useState(() => {
    if (!requireGuestData) return true;
    try {
      return localStorage.getItem(leadStorageKey) === "1";
    } catch {
      return false;
    }
  });

  const [leadFirst, setLeadFirst] = useState("");
  const [leadLast, setLeadLast] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadError, setLeadError] = useState("");

  const submitLead = async () => {
    setLeadError("");
    if (!leadFirst.trim() || !leadLast.trim() || !leadEmail.trim()) {
      setLeadError(lead.errRequired); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(leadEmail.trim())) {
      setLeadError(lead.errEmail); return;
    }
    setLeadSaving(true);
    try {
      const res = await fetch(`/api/albums/${albumSlug}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: leadFirst.trim(),
          lastName: leadLast.trim(),
          email: leadEmail.trim(),
          marketingConsent: leadConsent,
          consentText: leadConsent ? lead.consentLabel(organiserName || "organizator") : undefined,
          locale: lang,
        }),
      });
      if (!res.ok) { setLeadError(lead.errGeneric); return; }
      try { localStorage.setItem(leadStorageKey, "1"); } catch {/* ignore */}
      setLeadDone(true);
    } catch {
      setLeadError(lead.errGeneric);
    } finally {
      setLeadSaving(false);
    }
  };
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [momentId, setMomentId] = useState<string>(defaultMomentId ?? "");
  const [droppedCount, setDroppedCount] = useState(0);
  const [saveLinkEmail, setSaveLinkEmail] = useState("");
  const [saveLinkSending, setSaveLinkSending] = useState(false);
  const [saveLinkSent, setSaveLinkSent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = Math.max(0, maxPhotos - currentCount);
  const isDemo = albumSlug === "ana-marko-13ka";
  const hasUploaded = files.some(f => f.status === "done" || f.status === "skipped");
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  const uploadingRef = useRef(false);
  const filesRef = useRef(files);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect -- mount-once ingest
  useEffect(() => { if (initialFiles?.length) addFiles(initialFiles); }, []);

  useEffect(() => {
    if (!uploading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [uploading]);

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
        .catch(() => {});
    }
  }, [uploading]);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      setFiles(prev =>
        prev.map(f =>
          f.status === "queued" || f.status === "error"
            ? { ...f, status: "idle", error: undefined }
            : f,
        ),
      );
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  const retryRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const handler = () => {
      if (document.hidden) return;
      if (uploadingRef.current) return;
      const stalled = filesRef.current.filter(f => f.status === "error");
      if (stalled.length === 0) return;
      setFiles(prev =>
        prev.map(f => f.status === "error" ? { ...f, status: "idle", progress: 0, error: undefined } : f),
      );
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

      // Originals are uploaded as-is; there is no pre-upload optimization step.
      updateFile(f.id, { status: "uploading", progress: 5 });

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

  useEffect(() => { retryRef.current = uploadAll; });

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

  const sendAlbumLink = async () => {
    const email = saveLinkEmail.trim();
    if (!email || saveLinkSending || saveLinkSent) return;
    setSaveLinkSending(true);
    try {
      await fetch(`/api/albums/${albumSlug}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          delayMinutes: 0,
          marketingConsent,
          locale: lang,
        }),
      });
      setSaveLinkSent(true);
      if (typeof window !== "undefined") {
        const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
        if (typeof gtag === "function") {
          gtag("event", "guest_email_captured", {
            marketing_consent: marketingConsent,
            locale: lang,
          });
        }
      }
    } catch {
      // silently ignore — not critical
    } finally {
      setSaveLinkSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-x-hidden">
      <div className="absolute inset-0 bg-[#0F1729]/70 backdrop-blur-sm" onClick={!uploading ? onClose : undefined} />

      <div className="relative w-full max-w-[100vw] sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col overflow-hidden"
        style={{ maxHeight: "92dvh", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <h2 className="min-w-0 flex-1 text-xl font-extrabold tracking-tight text-[#0F1729] truncate">{t.uploadModalTitle}</h2>
            <button onClick={onClose} disabled={uploading} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-40">
              <svg className="w-4 h-4 text-[#0F1729]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[10px] text-[#0F1729]/40 px-2 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ background: `${accent}1A` }}>📷 {t.maxImageSize(MAX_IMAGE_MB)}</span>
            <span className="text-[10px] text-[#0F1729]/40 px-2 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ background: `${accent}1A` }}>📹 {t.maxVideoSize(MAX_VIDEO_MB)}</span>
            <span className="text-[10px] text-green-600 font-medium whitespace-nowrap">{t.fullQuality}</span>
          </div>
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

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4">
          {!leadDone ? (
            <div className="space-y-3 min-w-0">
              <div>
                <p className="text-lg font-extrabold tracking-tight text-[#0F1729]">{lead.title}</p>
                <p className="font-sans text-xs text-[#0F1729]/55 mt-0.5">{lead.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={leadFirst}
                  onChange={(e) => setLeadFirst(e.target.value)}
                  placeholder={lead.firstName}
                  autoComplete="given-name"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-[#0F1729] bg-white outline-none focus:border-[#C9820A]"
                />
                <input
                  value={leadLast}
                  onChange={(e) => setLeadLast(e.target.value)}
                  placeholder={lead.lastName}
                  autoComplete="family-name"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-[#0F1729] bg-white outline-none focus:border-[#C9820A]"
                />
              </div>
              <input
                type="email"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                placeholder={lead.email}
                autoComplete="email"
                inputMode="email"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-[#0F1729] bg-white outline-none focus:border-[#C9820A]"
              />
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leadConsent}
                  onChange={(e) => setLeadConsent(e.target.checked)}
                  className="mt-0.5 shrink-0 accent-[#C9820A]"
                />
                <span className="text-[11px] text-[#0F1729]/60 leading-snug">
                  {lead.consentLabel(organiserName || "organizator")}
                  <span className="block text-[#0F1729]/40 mt-0.5">{lead.consentOptional}</span>
                </span>
              </label>
              <p className="text-[11px] text-[#0F1729]/40 leading-snug">{lead.privacyNote}</p>
              {leadError && <p className="text-xs text-red-600">{leadError}</p>}
              <button
                onClick={submitLead}
                disabled={leadSaving}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ background: accent }}
              >
                {leadSaving ? "…" : lead.submit}
              </button>
            </div>
          ) : allDone ? (
            <div className="text-center py-8 min-w-0">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xl font-extrabold tracking-tight text-[#0F1729] mb-1 break-words">{t.successTitle(success)}</p>
              <p className="font-sans text-sm text-[#0F1729]/60 mb-3 break-words">{t.successDesc}</p>
              <p className="font-sans text-xs text-[#0F1729]/45 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-6 leading-relaxed break-words">
                {isDemo ? t.demoUploadNote : t.approvalNote}
              </p>
              <button
                onClick={() => onSuccess({ emailCaptured: saveLinkSent })}
                className="px-6 py-2.5 text-[#F2F4F8] font-sans text-sm rounded-xl transition-colors"
                style={{ background: "#0F1729" }}
                onMouseEnter={e => { e.currentTarget.style.background = accent; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#0F1729"; }}
              >
                {t.closeWindow}
              </button>

              <div className="mt-5 pt-4 border-t border-gray-100 text-left">
                <p className="text-xs font-semibold text-[#0F1729]/70 mb-1">📧 {t.saveLinkTitle}</p>
                <p className="text-xs text-[#0F1729]/40 mb-3">{t.saveLinkDesc}</p>
                {saveLinkSent ? (
                  <p className="text-xs text-green-600 font-medium text-center py-2">{t.saveLinkSent}</p>
                ) : (
                  <>
                    <div className="flex gap-2 min-w-0">
                      <input
                        type="email"
                        size={1}
                        value={saveLinkEmail}
                        onChange={e => setSaveLinkEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendAlbumLink()}
                        placeholder="vas@email.com"
                        autoComplete="email"
                        className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400"
                      />
                      <button
                        onClick={sendAlbumLink}
                        disabled={saveLinkSending || !saveLinkEmail.trim()}
                        className="shrink-0 px-4 py-2 text-sm rounded-xl text-white font-medium transition-all disabled:opacity-40"
                        style={{ background: accent }}
                      >
                        {saveLinkSending ? "…" : t.saveLinkSend}
                      </button>
                    </div>
                    <label className="mt-2 flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        className="mt-0.5 shrink-0 accent-[#C9820A]"
                      />
                      <span className="text-[11px] text-[#0F1729]/60 leading-snug">
                        {t.marketingConsentLabel}
                      </span>
                    </label>
                  </>
                )}
              </div>

              <GuestReferralCta
                referralCode={referralCode}
                lang={lang}
                sourceAlbumSlug={albumSlug}
              />
            </div>
          ) : (
            <>
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
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 shrink-0 space-y-3">
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
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>{t.doNotCloseWindow}</span>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={hasUploaded ? () => onSuccess({ emailCaptured: saveLinkSent }) : onClose}
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
