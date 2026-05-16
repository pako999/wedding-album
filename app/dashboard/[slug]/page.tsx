import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { AlbumAdminPanel } from "@/components/dashboard/AlbumAdminPanel";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function AlbumAdminPage({ params, searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { slug } = await params;
  const { tab = "published" } = await searchParams;

  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });

  if (!album || album.ownerClerkId !== userId) {
    notFound();
  }

  // Fetch photos based on active tab
  const status =
    tab === "pending" ? "pending" :
    tab === "rejected" ? "rejected" :
    "published";

  const albumPhotos = await db.query.photos.findMany({
    where: and(eq(photos.albumId, album.id), eq(photos.status, status)),
    orderBy: (p, { desc }) => [desc(p.uploadedAt)],
  });

  // All pending count for badge
  const allPending = await db.query.photos.findMany({
    where: and(eq(photos.albumId, album.id), eq(photos.status, "pending")),
  });

  return (
    <AlbumAdminPanel
      album={album}
      photos={albumPhotos}
      pendingCount={allPending.length}
      activeTab={tab as "published" | "pending" | "rejected" | "settings" | "share" | "stats"}
    />
  );
}
