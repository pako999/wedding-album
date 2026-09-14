import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { LocalCampaignForm } from "@/components/local/LocalCampaignForm";

export const dynamic = "force-dynamic";

export default async function NewLocalCampaignPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userAlbums = await db.query.albums.findMany({
    where: eq(albums.ownerClerkId, userId),
    orderBy: desc(albums.createdAt),
  });

  if (!userAlbums.length) redirect("/dashboard/new");

  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--honey)]">Guestcam Local</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Nova Rewards kampanja</h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-[color:var(--muted)]">
            Izberi galerijo lokala, nastavi nagrado in pripravi prvi QR za mizo. Fotografije ostanejo v obstoječem Guestcam albumu.
          </p>
        </div>

        <LocalCampaignForm
          albums={userAlbums.map((album) => ({
            id: album.id,
            name: album.coupleName,
            slug: album.slug,
            location: album.location,
          }))}
        />
      </main>
    </div>
  );
}
