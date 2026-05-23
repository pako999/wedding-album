"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";
import type { Album, Photo } from "@/lib/db/schema";

/**
 * Cover-photo picker in album Settings.
 *
 * Two ways to set the public album page's hero image:
 *   1. Pick from photos already uploaded to this gallery (any plan that
 *      has at least one photo can do this — uses the existing
 *      /api/albums/[slug]/settings PATCH with coverImageUrl).
 *   2. Upload a fresh image from the user's computer (Plus / Premium
 *      only — gated server-side by /api/albums/[slug]/cover too).
 *
 * Free + Basic plans see the "from gallery" option enabled (so they
 * can at least promote one of their guest photos to the cover) and the
 * "upload custom" option with a small Premium upgrade nudge.
 *
 * Removing the cover (DELETE on /cover) is also wired so the page
 * falls back to the brand gradient.
 */

interface Props {
  album: Album;
  /** All published photos so the "pick from gallery" modal can render them. */
  photos: Photo[];
}

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.webp,.heic,.heif";
const ACCEPTED_MIME = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif",
]);

export function CoverPhotoSettings({ album, photos }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState<null | "pick" | "upload" | "remove">(null);
  const [error, setError] = useState<string | null>(null);

  const canUpload = album.plan === "plus" || album.plan === "premium";

  // Only published, image (not video) media is eligible as a cover.
  const eligible = photos.filter(
    (p) => !p.mimeType?.startsWith("video/") && p.status === "published",
  );

  async function setFromUploaded(p: Photo) {
    setError(null);
    setBusy("pick");
    try {
      const res = await fetch(`/api/albums/${album.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: p.thumbnailUrl ?? p.blobUrl }),
      });
      if (!res.ok) throw new Error("save_failed");
      setPickerOpen(false);
      router.refresh();
    } catch {
      setError("Nastavitve naslovne fotografije ni bilo mogoče shraniti.");
    } finally {
      setBusy(null);
    }
  }

  async function uploadFromComputer(file: File) {
    setError(null);
    if (!ACCEPTED_MIME.has(file.type)) {
      setError("Neveljaven tip datoteke. Dovoljeni: JPG, PNG, WEBP, HEIC.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Datoteka je prevelika (največ 15 MB).");
      return;
    }
    setBusy("upload");
    try {
      const res = await fetch(`/api/albums/${album.slug}/cover`, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (res.status === 402) {
        setError("Lastna naslovna fotografija je na voljo s paketom Plus ali Premium.");
        return;
      }
      if (!res.ok) throw new Error("upload_failed");
      router.refresh();
    } catch {
      setError("Nalaganje naslovne fotografije ni uspelo. Poskusite znova.");
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function removeCover() {
    setError(null);
    setBusy("remove");
    try {
      const res = await fetch(`/api/albums/${album.slug}/cover`, { method: "DELETE" });
      if (!res.ok) throw new Error("remove_failed");
      router.refresh();
    } catch {
      setError("Naslovne fotografije ni bilo mogoče odstraniti.");
    } finally {
      setBusy(null);
    }
  }

  const currentCover = album.coverImageUrl;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Naslovna fotografija</label>
      <p className="text-xs text-gray-400 mb-2.5">
        Velika slika na vrhu javne strani galerije. Lahko izberete iz naloženih
        fotografij ali naložite svojo (Plus / Premium).
      </p>

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-[3/1] mb-3 relative">
        {currentCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bunnyDisplayUrl(currentCover)}
            alt="Trenutna naslovna fotografija"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xs text-[#0F1729]/60"
            style={{ background: "linear-gradient(135deg, #FFF9EC 0%, #FFC94D 100%)" }}
          >
            Privzeta naslovnica (gradient)
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={busy !== null || eligible.length === 0}
          className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-[#0F1729] hover:border-[#FFC94D] hover:bg-[#FFF9EC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={eligible.length === 0 ? "V galeriji še ni fotografij — naloži kakšno najprej." : ""}
        >
          {busy === "pick" ? "Shranjujem…" : "🖼️ Izberi iz galerije"}
        </button>

        <button
          type="button"
          onClick={() => canUpload && fileInput.current?.click()}
          disabled={busy !== null || !canUpload}
          className="px-3 py-2 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          style={
            canUpload
              ? { borderColor: "#FFC94D", background: "#FFF9EC", color: "#0F1729" }
              : { borderColor: "#e5e7eb", background: "white", color: "#9ca3af" }
          }
          title={canUpload ? "Naloži lastno naslovno fotografijo z računalnika." : "Na voljo s paketom Plus ali Premium."}
        >
          {busy === "upload" ? "Nalagam…" : "💻 Naloži z računalnika"}
        </button>

        {currentCover && (
          <button
            type="button"
            onClick={removeCover}
            disabled={busy !== null}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
          >
            {busy === "remove" ? "Odstranjujem…" : "Odstrani"}
          </button>
        )}

        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFromComputer(f);
          }}
        />
      </div>

      {!canUpload && (
        <p className="text-[11px] text-amber-700 mt-2">
          ⓘ Nalaganje lastne naslovne fotografije je na voljo s paketom <strong>Plus</strong> ali
          <strong> Premium</strong>. Izbira iz naloženih fotografij deluje na vseh paketih.
        </p>
      )}

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {/* Picker modal */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#0F1729]">Izberi naslovno fotografijo</h3>
                <p className="text-xs text-gray-400">Iz {eligible.length} naloženih fotografij.</p>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                aria-label="Zapri"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex-1">
              {eligible.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  V galeriji še ni primernih fotografij za naslovnico.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {eligible.map((p) => {
                    const isCurrent = currentCover && (p.blobUrl === currentCover || p.thumbnailUrl === currentCover);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFromUploaded(p)}
                        disabled={busy !== null}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          isCurrent
                            ? "border-[#FFC94D] ring-2 ring-[#FFC94D]/40"
                            : "border-transparent hover:border-[#FFC94D]"
                        } disabled:opacity-50`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bunnyDisplayUrl(p.thumbnailUrl ?? p.blobUrl)}
                          alt={p.caption ?? ""}
                          className="w-full h-full object-cover bg-gray-100"
                          loading="lazy"
                        />
                        {isCurrent && (
                          <span className="absolute top-1.5 right-1.5 bg-[#FFC94D] text-[#0F1729] text-[10px] font-bold uppercase rounded px-1.5 py-0.5">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
