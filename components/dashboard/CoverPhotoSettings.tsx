"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";
import type { Album, Photo } from "@/lib/db/schema";
import type { DashboardLang } from "@/lib/i18n/dashboard-language";
import { ADMIN_SETTINGS_COPY } from "@/lib/i18n/admin-settings-copy";

/**
 * Cover-photo picker in album Settings.
 *
 * Two ways to set the public album page's hero image:
 *   1. Pick from photos already uploaded to this gallery (any plan that
 *      has at least one photo can do this). The cover endpoint creates a
 *      resized WebP copy, leaving the original gallery photo untouched.
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
  lang: DashboardLang;
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

export function CoverPhotoSettings({ album, lang, photos, initialPositionY }: Props) {
  const copy = ADMIN_SETTINGS_COPY[lang];
  const coverDescription: Record<DashboardLang, string> = {
    sl: "Velika slika na vrhu javne strani galerije. Izberite med naloženimi fotografijami ali naložite svojo (Plus / Poročni premium).",
    hr: "Velika fotografija na vrhu javne galerije. Odaberite već prenesenu fotografiju ili prenesite svoju (Plus / Vjenčani premium).",
    sr: "Velika fotografija na vrhu javne galerije. Izaberite već otpremljenu fotografiju ili otpremite svoju (Plus / Venčani premium).",
    en: "The large image at the top of your public gallery. Choose an uploaded photo or upload your own (Plus / Wedding Premium).",
    de: "Das große Bild oben auf Ihrer öffentlichen Galerie. Wählen Sie ein hochgeladenes Foto oder laden Sie ein eigenes hoch (Plus / Hochzeits-Premium).",
    es: "La imagen grande en la parte superior de tu galería pública. Elige una foto subida o sube la tuya (Plus / Premium para bodas).",
  };
  const coverDragHelp: Record<DashboardLang, string> = {
    sl: "Povlecite sliko v mobilnem predogledu ali izberite položaj. Celotna slika ostane vidna.",
    hr: "Povucite sliku u mobilnom prikazu ili odaberite položaj. Cijela slika ostaje vidljiva.",
    sr: "Prevucite sliku u mobilnom prikazu ili izaberite položaj. Cela slika ostaje vidljiva.",
    en: "Drag the image in the mobile preview or choose a position. The full image always remains visible.",
    de: "Ziehen Sie das Bild in der mobilen Vorschau oder wählen Sie eine Position. Das gesamte Bild bleibt sichtbar.",
    es: "Arrastra la imagen en la vista móvil o elige una posición. La imagen completa siempre permanece visible.",
  };
  const busyCopy: Record<DashboardLang, { uploading: string; removing: string }> = {
    sl: { uploading: "Nalaganje…", removing: "Odstranjevanje…" },
    hr: { uploading: "Prijenos…", removing: "Uklanjanje…" },
    sr: { uploading: "Отпремање…", removing: "Уклањање…" },
    en: { uploading: "Uploading…", removing: "Removing…" },
    de: { uploading: "Wird hochgeladen…", removing: "Wird entfernt…" },
    es: { uploading: "Subiendo…", removing: "Quitando…" },
  };
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
      const res = await fetch(`/api/albums/${album.slug}/cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId: p.id }),
      });
      if (!res.ok) throw new Error("save_failed");
      const positionRes = await fetch(`/api/albums/${album.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPositionY: 50 }),
      });
      if (!positionRes.ok) throw new Error("position_save_failed");
      updatePosition(50);
      setPickerOpen(false);
      router.refresh();
    } catch {
      setError(copy.saveCoverFailed);
    } finally {
      setBusy(null);
    }
  }

  async function uploadFromComputer(file: File) {
    setError(null);
    if (!ACCEPTED_MIME.has(file.type)) {
      setError(copy.allowedTypes);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError(copy.tooLarge);
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
        setError(copy.customCoverPaid);
        return;
      }
      if (!res.ok) throw new Error("upload_failed");
      const positionRes = await fetch(`/api/albums/${album.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPositionY: 50 }),
      });
      if (positionRes.ok) updatePosition(50);
      router.refresh();
    } catch {
      setError(copy.uploadCoverFailed);
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
      setError(copy.removeCoverFailed);
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
      setError(copy.savePositionFailed);
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
    const containScale = Math.min(
      bounds.width / image.naturalWidth,
      bounds.height / image.naturalHeight,
    );
    const freeSpaceY = bounds.height - image.naturalHeight * containScale;

    // The public cover now uses contain, so a wide banner can move only inside
    // the safe free space above/below it. A small fallback keeps keyboard and
    // pointer movement stable for photos that already fill the preview.
    return Math.max(freeSpaceY, bounds.height * 0.35, 1);
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
      drag.startPositionY + (draggedPixels / drag.movementRangeY) * 100,
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
      positionYRef.current + (event.key === "ArrowUp" ? -5 : 5),
    );
    void savePosition(nextPosition);
  }

  const currentCover = album.coverImageUrl;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{copy.cover}</label>
      <p className="text-xs text-gray-400 mb-2.5">
        {coverDescription[lang]}
      </p>

      {/* Desktop + phone previews use the same contain behavior as the public
          album. The phone preview is the drag surface because wide banners
          have the most vertical positioning room on narrow screens. */}
      <div className="mb-3 grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">{copy.desktopPreview}</p>
          <div className="relative aspect-[3/1] overflow-hidden rounded-xl border border-gray-200 bg-[#0F1729]">
            {currentCover ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bunnyDisplayUrl(currentCover)}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                  style={{ objectPosition: `50% ${positionY}%` }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bunnyDisplayUrl(currentCover)}
                  alt={copy.desktopPreview}
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{ objectPosition: `50% ${positionY}%` }}
                />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFF9EC] to-[#FFC94D] text-xs text-[#0F1729]/60">
                {lang === "en" ? "Default cover" : lang === "de" ? "Standard-Titelbild" : lang === "es" ? "Portada predeterminada" : lang === "hr" ? "Zadana naslovna fotografija" : lang === "sr" ? "Подразумевана насловна фотографија" : "Privzeta naslovnica"}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">{copy.mobilePreview}</p>
          <div
            ref={previewRef}
            role={currentCover ? "button" : undefined}
            tabIndex={currentCover ? 0 : undefined}
            aria-label={currentCover ? copy.moveCover : undefined}
            aria-describedby={currentCover ? "cover-drag-help" : undefined}
            aria-disabled={currentCover ? busy !== null : undefined}
            onPointerDown={currentCover ? handlePointerDown : undefined}
            onPointerMove={currentCover ? handlePointerMove : undefined}
            onPointerUp={currentCover ? finishPointerDrag : undefined}
            onPointerCancel={currentCover ? finishPointerDrag : undefined}
            onKeyDown={currentCover ? handlePositionKeyDown : undefined}
            className={`relative aspect-[4/3] overflow-hidden rounded-xl border bg-[#0F1729] select-none outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#C9820A] focus-visible:ring-offset-2 ${
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
                  src={bunnyDisplayUrl(currentCover)}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                  style={{ objectPosition: `50% ${positionY}%` }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={coverImageRef}
                  src={bunnyDisplayUrl(currentCover)}
                  alt={copy.mobilePreview}
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                  style={{ objectPosition: `50% ${positionY}%` }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center px-2">
                  <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                    {isDragging
                      ? copy.dropCover
                      : busy === "position"
                        ? copy.coverSaved
                        : copy.dragCover}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFF9EC] to-[#FFC94D] text-center text-xs text-[#0F1729]/60">
                {lang === "en" ? <>Default<br />cover</> : lang === "de" ? <>Standard-<br />Titelbild</> : lang === "es" ? <>Portada<br />predeterminada</> : lang === "hr" ? <>Zadana<br />naslovnica</> : lang === "sr" ? <>Подразумевана<br />насловна</> : <>Privzeta<br />naslovnica</>}
              </div>
            )}
          </div>
        </div>
      </div>

      {currentCover && (
        <div id="cover-drag-help" className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-600">
            {coverDragHelp[lang]}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([
              [copy.top, 0],
              [copy.middle, 50],
              [copy.bottom, 100],
            ] as const).map(([label, value]) => (
              <button
                key={value}
                type="button"
                onClick={() => void savePosition(value)}
                disabled={busy !== null}
                aria-pressed={positionY === value}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-wait disabled:opacity-60 ${
                  positionY === value
                    ? "border-[#FFC94D] bg-[#FFF3C4] text-[#6B4D00]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#FFC94D]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={busy !== null || eligible.length === 0}
          className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-[#0F1729] hover:border-[#FFC94D] hover:bg-[#FFF9EC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={eligible.length === 0 ? copy.noPhotos : ""}
        >
          {busy === "pick" ? copy.coverSaved : copy.chooseCover}
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
          title={canUpload ? copy.chooseComputer : copy.plusPremium}
        >
          {busy === "upload" ? busyCopy[lang].uploading : copy.uploadCover}
        </button>

        {currentCover && (
          <button
            type="button"
            onClick={removeCover}
            disabled={busy !== null}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
          >
            {busy === "remove" ? busyCopy[lang].removing : copy.removeCover}
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
          ⓘ {copy.coverUploadHelp}
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
                <h3 className="font-semibold text-[#0F1729]">{copy.chooseCoverTitle}</h3>
                <p className="text-xs text-gray-400">{copy.uploadedPhotos.replace("{count}", String(eligible.length))}</p>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                aria-label={copy.close}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex-1">
              {eligible.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  {copy.noEligiblePhotos}
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
