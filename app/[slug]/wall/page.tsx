import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyAlbumPassword } from "@/lib/album-password";
import { absoluteUrl } from "@/lib/urls";
import { PhotoWall } from "@/components/album/PhotoWall";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Keep in sync with WALL_PHOTO_LIMIT in the polling API route — this is
// just the initial server-rendered batch, the client polls for more.
const INITIAL_WALL_PHOTOS = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pw?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album) return { title: "Album not found" };
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
  const { slug } = await params;
  const { pw } = await searchParams;

  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album || !album.isPublished) notFound();

  if (album.password) {
    const ok = await verifyAlbumPassword(pw ?? "", album.password);
    if (!ok) {
      // No on-screen keyboard on a TV — nothing to do here but explain.
      // The owner's dashboard link already carries the right ?pw=.
      return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center px-8">
          <p className="font-serif text-white text-3xl mb-3">{album.coupleName}</p>
          <p className="text-white/50 text-lg max-w-sm">
            Ta galerija je zaščitena z geslom. Odprite povezavo za steno neposredno iz nadzorne plošče.
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

  const albumUrl = absoluteUrl(`/${slug}${pw ? `?pw=${encodeURIComponent(pw)}` : ""}`);

  return (
    <PhotoWall
      slug={slug}
      pw={pw}
      coupleName={album.coupleName}
      albumUrl={albumUrl}
      initialPhotos={imagePhotos.map((p) => ({
        id: p.id,
        blobUrl: p.blobUrl,
        thumbnailUrl: p.thumbnailUrl,
        uploaderName: p.uploaderName,
      }))}
    />
  );
}
