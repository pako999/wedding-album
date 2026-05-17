"use client";

import { useState, useCallback, useRef } from "react";
import { upload } from "@vercel/blob/client";
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
  preview: string | null;  // null for videos before thumbnail generation
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

function formatMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

export function UploadModal({
  albumSlug,
  albumId,
  uploaderName,
  maxPhotos,
  currentCount,
  lang,
  onClose,
  onSuccess,
}: Props) {
  const t = translations[lang];
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = Math.max(0, maxPhotos - currentCount);

  const addFiles = useCallback((rawFiles: FileList | File[]) => {
    const arr = Array.from(rawFiles);
    const toAdd: UploadFile[] = [];

    for (const f of arr) {
      if (files.length + toAdd.length >= remaining) break;
      if (!ALL_ACCEPTED.includes(f.type)) continue;

      const isVideo = ACCEPTED_VIDEOS.includes(f.type);
      const maxBytes = isVideo ? MAX_VIDEO_MB * 1024 * 1024 : MAX_IMAGE_MB * 1024 * 1024;
      if (f.size > maxBytes) continue;

      toAdd.push({
        id: crypto.randomUUID(),
        file: f,
        preview: isVideo ? null : URL.createObjectURL(f),
        status: "idle",
        progress: 0,
        isVideo,
      });
    }

    setFiles((prev) => [...prev, ...toAdd]);
  }, [files.length, remaining]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const uploadAll = async () => {
    if (files.length === 0 || uploading) return;
    setUploading(true);

    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === "done") continue;

      updated[i] = { ...updated[i], status: "uploading", progress: 5 };
      setFiles([...updated]);

      try {
        const f = updated[i].file;
        const ext = f.name.split(".").pop() ?? "bin";
        const blobPath = `albums/${albumId}/${crypto.randomUUID()}.${ext}`;

        // Upload directly from browser → Vercel Blob (no body-size limit)
        const blob = await upload(blobPath, f, {
          access: "public",
          handleUploadUrl: `/api/albums/${albumSlug}/upload`,
          clientPayload: JSON.stringify({ uploaderName }),
          multipart: true,           // chunked upload for large videos
          onUploadProgress: ({ percentage }) => {
            updated[i] = { ...updated[i], progress: Math.round(percentage * 0.9) };
            setFiles([...updated]);
          },
        });

        // Client calls save-upload so record is in DB immediately (webhook is backup)
        const saveRes = await fetch(`/api/albums/${albumSlug}/save-upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blobUrl: blob.url,
            mimeType: f.type,
            originalFilename: f.name,
            sizeBytes: f.size,
            uploaderName,
          }),
        });

        if (!saveRes.ok) {
          const err = await saveRes.json().catch(() => ({}));
          throw new Error(err.error ?? "Save failed");
        }

        updated[i] = { ...updated[i], status: "done", progress: 100 };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        updated[i] = { ...updated[i], status: "error", error: msg, progress: 0 };
      }

      setFiles([...updated]);
    }

    setUploading(false);
    if (updated.some((f) => f.status === "done")) setAllDone(true);
  };

  const successCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2C2825]/70 backdrop-blur-sm"
        onClick={!uploading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-[#FAF7F2] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A96E]/20 shrink-0">
          <div>
            <h2 className="font-serif text-xl font-light text-[#2C2825]">{t.uploadModalTitle}</h2>
            <p className="text-xs text-[#2C2825]/40 mt-0.5">Fotografije · Videi · Do {MAX_VIDEO_MB} MB</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#C9A96E]/10 transition-colors disabled:opacity-40"
          >
            <svg className="w-4 h-4 text-[#2C2825]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {allDone ? (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-serif text-xl font-light text-[#2C2825] mb-1">{t.successTitle(successCount)}</p>
              <p className="font-sans text-sm text-[#2C2825]/60 mb-6">{t.successDesc}</p>
              <button
                onClick={onSuccess}
                className="px-6 py-2.5 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm rounded-xl hover:bg-[#C9A96E] transition-colors"
              >
                {t.close}
              </button>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              {files.length < remaining && (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none ${
                    dragOver
                      ? "border-[#C9A96E] bg-[#C9A96E]/8 scale-[1.01]"
                      : "border-[#C9A96E]/30 hover:border-[#C9A96E]/60 hover:bg-[#C9A96E]/5"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALL_ACCEPTED.join(",")}
                    className="hidden"
                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                  />
                  <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="font-sans text-sm font-semibold text-[#2C2825]/80 mb-1">
                    {dragOver ? "Spusti datoteke" : "Izberi ali povleci datoteke"}
                  </p>
                  <p className="font-sans text-xs text-[#2C2825]/40">
                    Fotografije (JPEG, PNG, HEIC) · Videi (MP4, MOV) · Do {remaining} datotek
                  </p>
                </div>
              )}

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#C9A96E]/15">
                      {/* Thumb */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#C9A96E]/10 flex items-center justify-center">
                        {f.isVideo ? (
                          <svg className="w-6 h-6 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                          </svg>
                        ) : f.preview ? (
                          <img src={f.preview} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-[#2C2825] truncate font-medium">{f.file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {f.status === "idle" && (
                            <p className="font-sans text-xs text-[#2C2825]/40">
                              {f.isVideo ? "📹" : "📷"} {formatMB(f.file.size)}
                            </p>
                          )}
                          {f.status === "uploading" && (
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex-1 h-1.5 bg-[#C9A96E]/15 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#C9A96E] rounded-full transition-all duration-300"
                                  style={{ width: `${f.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-[#C9A96E] font-medium shrink-0">{f.progress}%</span>
                            </div>
                          )}
                          {f.status === "done" && (
                            <p className="font-sans text-xs text-green-600 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Naloženo
                            </p>
                          )}
                          {f.status === "error" && (
                            <p className="font-sans text-xs text-red-500 truncate">{f.error}</p>
                          )}
                        </div>
                      </div>

                      {f.status === "idle" && (
                        <button onClick={() => removeFile(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!allDone && (
          <div className="px-6 py-4 border-t border-[#C9A96E]/20 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              disabled={uploading}
              className="font-sans text-sm text-[#2C2825]/60 hover:text-[#2C2825] transition-colors disabled:opacity-40"
            >
              {t.cancel}
            </button>
            <button
              onClick={uploadAll}
              disabled={files.length === 0 || uploading}
              className="px-6 py-2.5 rounded-2xl text-white font-sans text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background: "#C9A96E", boxShadow: files.length > 0 && !uploading ? "0 4px 14px rgba(201,169,110,0.4)" : "none" }}
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Nalagam...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Naloži {files.length > 0 ? `(${files.length})` : ""}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
