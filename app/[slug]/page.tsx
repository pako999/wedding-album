import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { AlbumGuestView } from "@/components/album/AlbumGuestView";
import { detectLang, type Lang } from "@/lib/i18n/translations";
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
    description: `Wedding album for ${album.coupleName}, ${album.weddingDate}`,
    openGraph: {
      title: `${album.coupleName} — Guestcam`,
      images: album.coverImageUrl ? [album.coverImageUrl] : [],
    },
  };
}

export default async function AlbumPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { pw, lang: langParam } = await searchParams;

  // Language detection: URL param > Accept-Language header > default sl
  const headersList = await headers();
  const acceptLang = headersList.get("accept-language");
  const lang: Lang = (langParam as Lang) ?? detectLang(acceptLang);

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

  return (
    <AlbumGuestView
      album={album}
      photos={albumPhotos}
      passwordRequired={passwordRequired}
      passwordCorrect={passwordCorrect}
      providedPassword={pw}
      initialLang={lang}
    />
  );
}
