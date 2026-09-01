import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { isWallCollaborator } from "@/lib/wall-collaborators";
import { getOrCreateWallToken } from "@/lib/wall-token";
import { PhotoWallCard } from "@/components/dashboard/PhotoWallCard";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SITE_URL } from "@/lib/urls";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

/**
 * Wall-only management page — what an invited collaborator (DJ, venue
 * tech) gets. Owners can use it too, but its purpose is to be the ONLY
 * page a collaborator can reach: wall settings and sponsor slides,
 * nothing else. Photos, album settings and billing stay owner-only.
 */
export default async function WallAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { /* unauthenticated */ }
  if (!userId) redirect("/sign-in");

  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album) notFound();

  const owner = await checkAlbumOwnership(album);
  const collaborator = owner.ok ? false : await isWallCollaborator(album.id);
  // notFound rather than 403: a non-invited signed-in user shouldn't even
  // learn that this album slug exists.
  if (!owner.ok && !collaborator) notFound();

  const wallToken = await getOrCreateWallToken(album.id, album.wallToken);
  const wallAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F7" }}>
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <GuestcamLogo size="sm" showMark={false} />
          <span className="text-xs text-gray-400">
            {collaborator ? "Sodelavec · samo foto stena" : (
              <Link href={`/dashboard/${album.slug}?tab=events`} className="text-[#8C6218] hover:underline">
                ← Nazaj na nadzorno ploščo
              </Link>
            )}
          </span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="gc-admin-page-title text-gray-900 mb-1">Foto stena — {album.coupleName}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Nastavitve žive foto stene in sponzorskih slik za ta dogodek.
        </p>
        <PhotoWallCard
          wallUrl={`${wallAppUrl}/wall/${wallToken}`}
          hasPassword={!!album.password}
          albumSlug={album.slug}
          moderationEnabled={album.moderationEnabled}
          pendingCount={album.pendingCount ?? 0}
          plan={album.plan}
        />
      </main>
    </div>
  );
}
