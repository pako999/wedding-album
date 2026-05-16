"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  albumSlug: string;
  albumId: string;
  uploaderName: string;
  maxPhotos: number;
  currentCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadFile {
  file: File;
  preview: string;
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ACCEPTED_TYPES = { "image/jpeg": [], "image/png": [], "image/webp": [], "image/heic": [] };

export function UploadModal({
  albumSlug,
  albumId,
  uploaderName,
  maxPhotos,
  currentCount,
  onClose,
  onSuccess,
}: Props) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const remaining = maxPhotos - currentCount;

  const onDrop = useCallback(
    (accepted: File[]) => {
      const canAdd = Math.min(accepted.length, remaining - files.length);
      const newFiles: UploadFile[] = accepted.slice(0, canAdd).map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        status: "idle",
        progress: 0,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length, remaining]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: uploading || files.length >= remaining,
  });

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].preview);
      next.splice(idx, 1);
      return next;
    });
  };

  const uploadAll = async () => {
    if (files.length === 0 || uploading) return;
    setUploading(true);

    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === "done") continue;
      updated[i] = { ...updated[i], status: "uploading", progress: 10 };
      setFiles([...updated]);

      try {
        const formData = new FormData();
        formData.append("file", updated[i].file);
        formData.append("uploaderName", uploaderName);

        const res = await fetch(`/api/albums/${albumSlug}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Napaka" }));
          updated[i] = { ...updated[i], status: "error", error: err.error ?? "Napaka", progress: 0 };
        } else {
          updated[i] = { ...updated[i], status: "done", progress: 100 };
        }
      } catch {
        updated[i] = { ...updated[i], status: "error", error: "Omrežna napaka", progress: 0 };
      }

      setFiles([...updated]);
    }

    setUploading(false);
    const anyDone = updated.some((f) => f.status === "done");
    if (anyDone) setAllDone(true);
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
      <div className="relative w-full sm:max-w-lg bg-[#FAF7F2] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A96E]/20">
          <h2 className="font-serif text-xl font-light text-[#2C2825]">Naloži fotografije</h2>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {allDone ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-serif text-xl font-light text-[#2C2825] mb-1">
                {successCount} {successCount === 1 ? "fotografija naložena" : "fotografij naloženih"}
              </p>
              <p className="font-sans text-sm text-[#2C2825]/60 mb-6">Hvala za vaše spomine!</p>
              <button
                onClick={onSuccess}
                className="px-6 py-2.5 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm rounded-xl hover:bg-[#C9A96E] transition-colors"
              >
                Zapri
              </button>
            </div>
          ) : (
            <>
              {/* Dropzone */}
              {files.length < remaining && (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-[#C9A96E] bg-[#C9A96E]/5"
                      : "border-[#C9A96E]/30 hover:border-[#C9A96E]/60 hover:bg-[#C9A96E]/5"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-10 h-10 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.987 9.095H6.75z" />
                    </svg>
                  </div>
                  <p className="font-sans text-sm text-[#2C2825]/70">
                    {isDragActive ? "Spusti fotografije sem" : "Povleci ali klikni za izbiro"}
                  </p>
                  <p className="font-sans text-xs text-[#2C2825]/40 mt-1">
                    JPG, PNG, WEBP · max 20 MB · še {remaining - files.length} možnih
                  </p>
                </div>
              )}

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#C9A96E]/15">
                      <img
                        src={f.preview}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-[#2C2825] truncate">{f.file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {f.status === "idle" && (
                            <p className="font-sans text-xs text-[#2C2825]/40">
                              {(f.file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          )}
                          {f.status === "uploading" && (
                            <div className="flex-1 h-1.5 bg-[#C9A96E]/20 rounded-full overflow-hidden">
                              <div className="h-full bg-[#C9A96E] rounded-full animate-pulse w-1/2" />
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
                            <p className="font-sans text-xs text-red-500">{f.error}</p>
                          )}
                        </div>
                      </div>
                      {f.status === "idle" && (
                        <button
                          onClick={() => removeFile(i)}
                          className="p-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
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

        {/* Footer actions */}
        {!allDone && (
          <div className="px-6 py-4 border-t border-[#C9A96E]/20 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="font-sans text-sm text-[#2C2825]/60 hover:text-[#2C2825] transition-colors disabled:opacity-40"
            >
              Prekliči
            </button>
            <button
              onClick={uploadAll}
              disabled={files.length === 0 || uploading}
              className="px-6 py-2.5 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm font-medium rounded-xl hover:bg-[#C9A96E] transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Nalaganje…
                </>
              ) : (
                `Naloži ${files.length > 0 ? `(${files.length})` : ""}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
