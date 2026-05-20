import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { albums, photos, moments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { AlbumGuestView } from "@/components/album/AlbumGuestView";
import { type Lang } from "@/lib/i18n/translations";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pw?: string; lang?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });
  if (!album) return { title: "Album not found" };
  return {
    title: `${album.coupleName} — Guestcam`,
    description: `Poročni album za ${album.coupleName}, ${album.weddingDate}`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${album.coupleName} — Guestcam`,
      images: album.coverImageUrl ? [album.coverImageUrl] : [],
    },
  };
}

export default async function AlbumPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { pw, lang: langParam } = await searchParams;

  // Album language: explicit ?lang= param, otherwise default to Slovenian.
  const lang: Lang = (langParam as Lang) ?? "sl";

  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });

  if (!album || !album.isPublished) {
    notFound();
  }

  // Password gate (server-side check)
  const passwordRequired = !!album.password;
  const passwordCorrect = !album.password || pw === album.password;

  // Fetch published photos
  const albumPhotos = passwordCorrect
    ? await db.query.photos.findMany({
        where: and(
          eq(photos.albumId, album.id),
          eq(photos.status, "published")
        ),
        orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.uploadedAt)],
      })
    : [];

  // Fetch the album's moments (named sub-galleries)
  const albumMoments = await db.query.moments.findMany({
    where: eq(moments.albumId, album.id),
    orderBy: (m, { asc }) => [asc(m.sortOrder), asc(m.createdAt)],
  });

  return (
    <AlbumGuestView
      album={album}
      photos={albumPhotos}
      moments={albumMoments}
      passwordRequired={passwordRequired}
      passwordCorrect={passwordCorrect}
      providedPassword={pw}
      initialLang={lang}
    />
  );
}
