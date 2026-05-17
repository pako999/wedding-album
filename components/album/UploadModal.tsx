"use client";

import { useState, useCallback, useRef } from "react";
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
}

interface UploadFile {
  id: string;
  file: File;
  preview: string | null;
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  isVideo: boolean;
}

const ACCEPTED_IMAGES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif"];
const ACCEPTED_VIDEOS = ["video/mp4", "video/quicktime", "video/mov", "video/webm", "video/mpeg", "video/3gpp", "video/avi"];
const ALL_ACCEPTED = [...ACCEPTED_IMAGES, ...ACCEPTED_VIDEOS];
const MAX_IMAGE_MB = 50;
const MAX_VIDEO_MB = 500;

function fmt(bytes: number) { return (bytes / 1024 / 1024).toFixed(1) + " MB"; }

/** Upload a single file using the best available backend. */
async function uploadFile(
  file: File,
  albumSlug: string,
  albumId: string,
  uploaderName: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  // 1. Ask server which upload path to use
  const urlRes = await fetch(`/api/albums/${albumSlug}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  });
  if (!urlRes.ok) throw new Error(await urlRes.text());

  type UrlData =
    | { type: "bunny-stream";  uploadUrl: string; videoId: string; signature: string; expiration: number; libraryId: string }
    | { type: "bunny-storage"; key: string }
    | { type: "r2";            presignedUrl: string; publicUrl: string; key: string }
    | { type: "stream";        uploadUrl: string; videoId: string }
    | { type: "vercel-blob" };

  const urlData = await urlRes.json() as UrlData;

  // ── Bunny Stream (tus direct upload) ──────────────────────────────────────
  if (urlData.type === "bunny-stream") {
    await uploadViaBunnyStream(file, urlData, onProgress);
    await saveUpload(albumSlug, {
      cfStreamVideoId: urlData.videoId,
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
    });
    onProgress(100);
    return;
  }

  // ── Bunny Storage (streaming proxy via our route handler) ─────────────────
  if (urlData.type === "bunny-storage") {
    onProgress(10);
    const proxyRes = await fetch(
      `/api/albums/${albumSlug}/bunny-upload?key=${encodeURIComponent(urlData.key)}`,
      { method: "PUT", body: file, headers: { "Content-Type": file.type } },
    );
    if (!proxyRes.ok) throw new Error(`Bunny Storage upload failed: ${proxyRes.status}`);
    const { publicUrl } = await proxyRes.json() as { publicUrl: string };
    onProgress(80);
    await saveUpload(albumSlug, {
      blobUrl: publicUrl,
      mimeType: file.type,
      originalFilename: file.name,
      sizeBytes: file.size,
      uploaderName,
    });
    onProgress(100);
    return;
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
    });
    onProgress(100);
    return;
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
    });
    onProgress(100);
    return;
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
  });
  onProgress(100);
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

async function saveUpload(slug: string, body: object) {
  const res = await fetch(`/api/albums/${slug}/save-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UploadModal({ albumSlug, albumId, uploaderName, maxPhotos, currentCount, lang, onClose, onSuccess }: Props) {
  const t = translations[lang];
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = Math.max(0, maxPhotos - currentCount);

  const addFiles = useCallback((raw: FileList | File[]) => {
    const toAdd: UploadFile[] = [];
    for (const f of Array.from(raw)) {
      if (files.length + toAdd.length >= remaining) break;
      if (!ALL_ACCEPTED.includes(f.type)) continue;
      const isVideo = ACCEPTED_VIDEOS.includes(f.type);
      const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (f.size > maxMB * 1024 * 1024) continue;
      toAdd.push({ id: crypto.randomUUID(), file: f, preview: isVideo ? null : URL.createObjectURL(f), status: "idle", progress: 0, isVideo });
    }
    setFiles(p => [...p, ...toAdd]);
  }, [files.length, remaining]);

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
      if (f.status === "done") continue;
      updateFile(f.id, { status: "uploading", progress: 5 });
      try {
        await uploadFile(
          f.file, albumSlug, albumId, uploaderName,
          pct => updateFile(f.id, { progress: pct })
        );
        updateFile(f.id, { status: "done", progress: 100 });
      } catch (err) {
        updateFile(f.id, { status: "error", error: err instanceof Error ? err.message : "Napaka", progress: 0 });
      }
    }

    setUploading(false);
    setAllDone(files.some(f => f.status !== "error"));
  };

  const success = files.filter(f => f.status === "done").length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-[#2C2825]/70 backdrop-blur-sm" onClick={!uploading ? onClose : undefined} />

      <div className="relative w-full sm:max-w-lg bg-[#FAF7F2] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A96E]/20 shrink-0">
          <div>
            <h2 className="font-serif text-xl font-light text-[#2C2825]">{t.uploadModalTitle}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-[#2C2825]/40 bg-[#C9A96E]/10 px-2 py-0.5 rounded-full font-medium">📷 Do {MAX_IMAGE_MB} MB</span>
              <span className="text-[10px] text-[#2C2825]/40 bg-[#C9A96E]/10 px-2 py-0.5 rounded-full font-medium">📹 Videi do {MAX_VIDEO_MB} MB</span>
              <span className="text-[10px] text-green-600 font-medium">Polna kakovost</span>
            </div>
          </div>
          <button onClick={onClose} disabled={uploading} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#C9A96E]/10 disabled:opacity-40">
            <svg className="w-4 h-4 text-[#2C2825]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {allDone ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-serif text-xl font-light text-[#2C2825] mb-1">{t.successTitle(success)}</p>
              <p className="font-sans text-sm text-[#2C2825]/60 mb-6">{t.successDesc}</p>
              <button onClick={onSuccess} className="px-6 py-2.5 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm rounded-xl hover:bg-[#C9A96E] transition-colors">
                {t.close}
              </button>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              {files.length < remaining && (
                <div
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer select-none transition-all ${dragOver ? "border-[#C9A96E] bg-[#C9A96E]/8 scale-[1.01]" : "border-[#C9A96E]/30 hover:border-[#C9A96E]/60 hover:bg-[#C9A96E]/5"}`}
                >
                  <input ref={inputRef} type="file" multiple accept={ALL_ACCEPTED.join(",")} className="hidden" onChange={e => e.target.files && addFiles(e.target.files)} />
                  <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="font-sans text-sm font-semibold text-[#2C2825]/80 mb-1">
                    {dragOver ? "Spusti datoteke" : "Izberi fotografije in videe"}
                  </p>
                  <p className="font-sans text-xs text-[#2C2825]/40">JPEG · PNG · HEIC · MP4 · MOV · do {remaining} datotek</p>
                </div>
              )}

              {/* File list */}
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#C9A96E]/15">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#C9A96E]/10 flex items-center justify-center">
                    {f.isVideo
                      ? <svg className="w-6 h-6 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
                      : f.preview ? <img src={f.preview} alt="" className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-[#2C2825] truncate font-medium">{f.file.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {f.status === "idle" && <p className="text-xs text-[#2C2825]/40">{f.isVideo ? "📹" : "📷"} {fmt(f.file.size)}</p>}
                      {f.status === "uploading" && (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 h-1.5 bg-[#C9A96E]/15 rounded-full overflow-hidden">
                            <div className="h-full bg-[#C9A96E] rounded-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                          </div>
                          <span className="text-xs text-[#C9A96E] font-semibold shrink-0">{f.progress}%</span>
                        </div>
                      )}
                      {f.status === "done" && <p className="text-xs text-green-600 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Naloženo</p>}
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
          <div className="px-6 py-4 border-t border-[#C9A96E]/20 flex items-center justify-between gap-3 shrink-0">
            <button onClick={onClose} disabled={uploading} className="text-sm text-[#2C2825]/60 hover:text-[#2C2825] transition-colors disabled:opacity-40">{t.cancel}</button>
            <button
              onClick={uploadAll}
              disabled={files.length === 0 || uploading}
              className="px-6 py-2.5 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background: "#C9A96E", boxShadow: files.length > 0 && !uploading ? "0 4px 14px rgba(201,169,110,0.4)" : "none" }}
            >
              {uploading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Nalagam…</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>Naloži {files.length > 0 ? `(${files.length})` : ""}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
