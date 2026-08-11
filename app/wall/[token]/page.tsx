import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyAlbumPassword } from "@/lib/album-password";
import { absoluteUrl } from "@/lib/urls";
import { getSponsors } from "@/lib/wall-sponsors";
import { WALL_COPY } from "@/lib/i18n/wall-translations";
import type { Lang } from "@/lib/i18n/translations";
import { withSchemaHealing } from "@/lib/db/bootstrap";
import {
  PhotoWall,
  WALL_BACKGROUNDS,
  WALL_TRANSITIONS,
  type WallBackground,
  type WallTransition,
  type WallOrientation,
} from "@/components/album/PhotoWall";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Keep in sync with WALL_PHOTO_LIMIT in the polling API route — this is
// just the initial server-rendered batch, the client polls for more.
const INITIAL_WALL_PHOTOS = 60;

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    pw?: string;
    /** Seconds each photo holds the centre stage. */
    dur?: string;
    /** "0" hides: side collage / QR / uploader names / event title / branding. */
    sides?: string;
    qr?: string;
    names?: string;
    title?: string;
    brand?: string;
    /** Background preset: photo | dark | light | warm. */
    bg?: string;
    /** Centre transition: fade | slide | kenburns. */
    fx?: string;
    /** Layout: auto | landscape | portrait. */
    orient?: string;
    /** Minutes between sponsor slides. 0 / absent = no sponsor slides. */
    admin?: string;
    /** Seconds a sponsor slide holds the centre stage. */
    addur?: string;
  }>;
}

/** Display options live in the wall URL rather than the database on
 *  purpose: the owner can tune the screen (or undo a change) mid-event
 *  by editing the link, the settings are shareable/bookmarkable, and
 *  adding an option needs no migration. Defaults are "everything on",
 *  so a bare /wall/<token> link behaves exactly as before. */
const flagOn = (v: string | undefined) => v !== "0";

function parseSlideMs(raw: string | undefined): number {
  const n = Number.parseFloat(raw ?? "");
  // Clamp to something sane — a 0.2s slideshow on a venue TV is a
  // strobe hazard, and 10 minutes is indistinguishable from frozen.
  if (!Number.isFinite(n)) return 6_000;
  return Math.round(Math.min(120, Math.max(2, n)) * 1000);
}

/** Sponsor cadence, in MINUTES. 0 (or absent/invalid) turns sponsor
 *  slides off entirely — that's the default, so a wall never shows ads
 *  unless the organiser deliberately asked for them. */
function parseAdEveryMs(raw: string | undefined): number {
  const n = Number.parseFloat(raw ?? "");
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(Math.min(120, Math.max(0.5, n)) * 60_000);
}

/** Sponsor slide duration, in SECONDS. */
function parseAdDurMs(raw: string | undefined): number {
  const n = Number.parseFloat(raw ?? "");
  if (!Number.isFinite(n)) return 8_000;
  return Math.round(Math.min(60, Math.max(2, n)) * 1000);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.wallToken, token) }).catch(() => null);
  if (!album) return { title: "Wall not found" };
  return {
    title: `${album.coupleName} — Photo Wall`,
    // Same private, link-only stance as the guest gallery — this is a
    // TV display of someone's event photos, never meant to be indexed.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true, "max-image-preview": "none", "max-snippet": -1 },
    },
  };
}

export default async function PhotoWallPage({ params, searchParams }: Props) {
  const { token } = await params;
  const sp = await searchParams;
  const { pw } = sp;
  const settings = {
    slideMs: parseSlideMs(sp.dur),
    showSides: flagOn(sp.sides),
    showQr: flagOn(sp.qr),
    showNames: flagOn(sp.names),
    showTitle: flagOn(sp.title),
    showBranding: flagOn(sp.brand),
    background: (sp.bg && sp.bg in WALL_BACKGROUNDS ? sp.bg : "photo") as WallBackground,
    transition: (sp.fx && sp.fx in WALL_TRANSITIONS ? sp.fx : "fade") as WallTransition,
    orientation: (sp.orient === "landscape" || sp.orient === "portrait"
      ? sp.orient
      : "auto") as WallOrientation,
    adEveryMs: parseAdEveryMs(sp.admin),
    adDurMs: parseAdDurMs(sp.addur),
  };

  const album = await withSchemaHealing(() =>
    db.query.albums.findFirst({ where: eq(albums.wallToken, token) }),
  ).catch(() => null);
  if (!album || !album.isPublished) notFound();

  // The wall follows the ALBUM's language — it's shown to guests in the
  // venue, not to the (Slovenian-dashboard) owner.
  const VALID: Lang[] = ["sl", "hr", "sr", "de", "en", "es"];
  const wallLang: Lang = (VALID as string[]).includes(album.defaultLang)
    ? (album.defaultLang as Lang)
    : "sl";
  const t = WALL_COPY[wallLang];

  if (album.password) {
    const ok = await verifyAlbumPassword(pw ?? "", album.password);
    if (!ok) {
      // No on-screen keyboard on a TV — nothing to do here but explain.
      // The owner's dashboard link already carries the right ?pw=.
      return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center px-8">
          <p className="font-serif text-white text-3xl mb-3">{album.coupleName}</p>
          <p className="text-white/50 text-lg max-w-sm">
            {t.passwordNeeded}
          </p>
        </div>
      );
    }
  }

  const albumPhotos = await db.query.photos
    .findMany({
      where: and(eq(photos.albumId, album.id), eq(photos.status, "published")),
      orderBy: [desc(photos.uploadedAt)],
      limit: INITIAL_WALL_PHOTOS,
    })
    .catch(() => []);

  const imagePhotos = albumPhotos
    .filter((p) => !p.mimeType?.startsWith("video/"))
    .reverse(); // oldest of the batch first, so the wall plays forward in time

  // The QR on the wall always points at the main gallery (for uploads),
  // not at this wall page — that link is deliberately the album's own
  // slug-based URL, separate from the wall's token-based one.
  const albumUrl = absoluteUrl(`/${album.slug}${pw ? `?pw=${encodeURIComponent(pw)}` : ""}`);

  // Sponsor slides. getSponsors never throws — if the table isn't there
  // yet the wall simply runs without them.
  const sponsors = settings.adEveryMs > 0 ? await getSponsors(album.id) : [];

  return (
    <PhotoWall
      token={token}
      pw={pw}
      coupleName={album.coupleName}
      albumUrl={albumUrl}
      initialPhotos={imagePhotos.map((p) => ({
        id: p.id,
        blobUrl: p.blobUrl,
        thumbnailUrl: p.thumbnailUrl,
        uploaderName: p.uploaderName,
      }))}
      sponsors={sponsors}
      settings={settings}
      t={t}
      isPremium={album.plan === "premium"}
    />
  );
}
