"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
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
  /** Saved vertical focal point for the public cover crop. */
  initialPositionY: number;
}

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.webp,.heic,.heif";
const ACCEPTED_MIME = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif",
]);

type CoverDrag = {
  pointerId: number;
  startClientY: number;
  startPositionY: number;
  movementRangeY: number;
};

function clampCoverPosition(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function CoverPhotoSettings({ album, photos, initialPositionY }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const coverImageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<CoverDrag | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState<null | "pick" | "upload" | "remove" | "position">(null);
  const [error, setError] = useState<string | null>(null);
  const safeInitialPosition = clampCoverPosition(initialPositionY);
  const positionYRef = useRef(safeInitialPosition);
  const [positionY, setPositionY] = useState(safeInitialPosition);
  const [isDragging, setIsDragging] = useState(false);

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

  function updatePosition(nextPosition: number) {
    const value = clampCoverPosition(nextPosition);
    positionYRef.current = value;
    setPositionY(value);
    return value;
  }

  async function savePosition(nextPosition: number) {
    const value = updatePosition(nextPosition);
    setError(null);
    setBusy("position");
    try {
      const res = await fetch(`/api/albums/${album.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPositionY: value }),
      });
      if (!res.ok) throw new Error("position_save_failed");
      router.refresh();
    } catch {
      setError("Položaja naslovne fotografije ni bilo mogoče shraniti.");
    } finally {
      setBusy(null);
    }
  }

  function getVerticalMovementRange() {
    const preview = previewRef.current;
    const image = coverImageRef.current;
    if (!preview || !image || image.naturalWidth === 0 || image.naturalHeight === 0) {
      return preview?.getBoundingClientRect().height ?? 1;
    }

    const bounds = preview.getBoundingClientRect();
    const coverScale = Math.max(
      bounds.width / image.naturalWidth,
      bounds.height / image.naturalHeight,
    );
    const overflowY = image.naturalHeight * coverScale - bounds.height;

    // When the source already has the exact cover ratio, object-position has
    // no visible overflow. Keeping the preview height as a fallback still
    // lets the owner choose a focal point for narrower public/mobile layouts.
    return Math.max(overflowY, bounds.height, 1);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (busy !== null || event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startClientY: event.clientY,
      startPositionY: positionYRef.current,
      movementRangeY: getVerticalMovementRange(),
    };
    setError(null);
    setIsDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    const draggedPixels = event.clientY - drag.startClientY;
    updatePosition(
      drag.startPositionY - (draggedPixels / drag.movementRangeY) * 100,
    );
  }

  function finishPointerDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);

    const nextPosition = positionYRef.current;
    if (nextPosition !== drag.startPositionY) void savePosition(nextPosition);
  }

  function handlePositionKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (busy !== null || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;

    event.preventDefault();
    const nextPosition = updatePosition(
      positionYRef.current + (event.key === "ArrowUp" ? 5 : -5),
    );
    void savePosition(nextPosition);
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
      <div
        ref={previewRef}
        role={currentCover ? "button" : undefined}
        tabIndex={currentCover ? 0 : undefined}
        aria-label={currentCover ? "Premaknite naslovno fotografijo gor ali dol" : undefined}
        aria-describedby={currentCover ? "cover-drag-help" : undefined}
        aria-disabled={currentCover ? busy !== null : undefined}
        onPointerDown={currentCover ? handlePointerDown : undefined}
        onPointerMove={currentCover ? handlePointerMove : undefined}
        onPointerUp={currentCover ? finishPointerDrag : undefined}
        onPointerCancel={currentCover ? finishPointerDrag : undefined}
        onKeyDown={currentCover ? handlePositionKeyDown : undefined}
        className={`relative mb-3 aspect-[3/1] overflow-hidden rounded-xl border bg-gray-100 select-none outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#C9820A] focus-visible:ring-offset-2 ${
          currentCover
            ? busy !== null
              ? "cursor-wait border-gray-200"
              : isDragging
                ? "cursor-grabbing border-[#FFC94D] ring-4 ring-[#FFC94D]/25 touch-none"
                : "cursor-grab border-gray-200 touch-none"
            : "border-gray-200"
        }`}
      >
        {currentCover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={coverImageRef}
              src={bunnyDisplayUrl(currentCover)}
              alt="Trenutna naslovna fotografija"
              draggable={false}
              className="pointer-events-none h-full w-full object-cover"
              style={{ objectPosition: `50% ${positionY}%` }}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3">
              <span className="rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                {isDragging
                  ? "↕ Spustite za shranjevanje"
                  : busy === "position"
                    ? "Shranjujem položaj…"
                    : "↕ Zgrabite in premaknite sliko"}
              </span>
            </div>
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xs text-[#0F1729]/60"
            style={{ background: "linear-gradient(135deg, #FFF9EC 0%, #FFC94D 100%)" }}
          >
            Privzeta naslovnica (gradient)
          </div>
        )}
      </div>

      {currentCover && (
        <p id="cover-drag-help" className="mb-3 text-xs text-gray-500">
          Povlecite sliko gor ali dol. Položaj se samodejno shrani, ko jo spustite.
        </p>
      )}

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
