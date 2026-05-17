import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { AlbumAdminPanel } from "@/components/dashboard/AlbumAdminPanel";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; new?: string }>;
}

export default async function AlbumAdminPage({ params, searchParams }: Props) {
  // Auth — must NOT redirect inside try block
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    // Clerk error — treat as unauthenticated
  }
  if (!userId) redirect("/sign-in");

  const { slug } = await params;
  const { tab = "overview", new: isNewParam } = await searchParams;
  const isNew = isNewParam === "1";

  let album: (typeof albums.$inferSelect) | null = null;
  let albumPhotos: (typeof photos.$inferSelect)[] = [];
  let pendingCount = 0;

  try {
    album = await db.query.albums.findFirst({
      where: eq(albums.slug, slug),
    }) ?? null;

    if (album && album.ownerClerkId === userId) {
      const status =
        tab === "pending"  ? "pending"  :
        tab === "rejected" ? "rejected" :
        "published";

      albumPhotos = await db.query.photos.findMany({
        where: and(eq(photos.albumId, album.id), eq(photos.status, status)),
        orderBy: (p, { desc }) => [desc(p.uploadedAt)],
      });

      const allPending = await db.query.photos.findMany({
        where: and(eq(photos.albumId, album.id), eq(photos.status, "pending")),
      });
      pendingCount = allPending.length;
    }
  } catch (err) {
    console.error("[album page] DB error:", err);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FDF4F5" }}>
        <div className="bg-white rounded-2xl border border-amber-200 p-8 max-w-md text-center shadow">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="font-serif text-2xl text-[#2C2825] mb-2">Napaka pri nalaganju</h1>
          <p className="text-sm text-gray-500 mb-4">
            Prišlo je do napake z bazo podatkov. Poskusite znova čez trenutek.
          </p>
          <a href="/dashboard" className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold" style={{ background: "#C4738A" }}>
            Nazaj na galerije
          </a>
        </div>
      </div>
    );
  }

  if (!album || album.ownerClerkId !== userId) {
    notFound();
  }

  return (
    <AlbumAdminPanel
      album={album}
      photos={albumPhotos}
      pendingCount={pendingCount}
      activeTab={tab as "overview" | "gallery" | "qr" | "settings" | "pending"}
      isNew={isNew}
    />
  );
}
