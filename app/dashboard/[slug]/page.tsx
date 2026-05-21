import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and, countDistinct } from "drizzle-orm";
import { AlbumAdminPanel } from "@/components/dashboard/AlbumAdminPanel";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; new?: string; upgraded?: string; plan?: string; session_id?: string }>;
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
  const {
    tab = "overview",
    new: isNewParam,
    upgraded: isUpgradedParam,
    plan: planParam,
    session_id: stripeSessionId,
  } = await searchParams;
  const isNew = isNewParam === "1";
  const isUpgraded = isUpgradedParam === "1";
  const paidPlan =
    planParam === "basic" || planParam === "plus" || planParam === "premium"
      ? planParam
      : undefined;

  // Webhook backstop: if the user arrived from Stripe Checkout with a
  // session_id, reconcile the upgrade *before* loading the album so the
  // page they see already reflects the new plan. Stripe webhooks can
  // fail to deliver (e.g. apex->www redirect drops the POST), but the
  // customer always hits this page after a successful payment, so this
  // gives us a hard guarantee that paid albums actually flip.
  if (isUpgraded && stripeSessionId) {
    const { reconcileStripeSession } = await import("@/lib/stripe-reconcile");
    const result = await reconcileStripeSession(stripeSessionId, slug);
    if (!result.ok) {
      console.warn("[reconcile] session", stripeSessionId, "→", result.reason);
    } else {
      console.log("[reconcile] applied", result.plan, "to", slug, `(${result.status})`);
    }
  }

  let album: (typeof albums.$inferSelect) | null = null;
  let albumPhotos: (typeof photos.$inferSelect)[] = [];
  let pendingCount = 0;
  let guestCount = 0;

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

      const [{ count }] = await db
        .select({ count: countDistinct(photos.uploaderName) })
        .from(photos)
        .where(and(eq(photos.albumId, album.id), eq(photos.status, "published")));
      guestCount = count ?? 0;
    }
  } catch (err) {
    console.error("[album page] DB error:", err);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F6FB" }}>
        <div className="bg-white rounded-2xl border border-amber-200 p-8 max-w-md text-center shadow">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="font-serif text-2xl text-[#0F1729] mb-2">Napaka pri nalaganju</h1>
          <p className="text-sm text-gray-500 mb-4">
            Prišlo je do napake z bazo podatkov. Poskusite znova čez trenutek.
          </p>
          <a href="/dashboard" className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold" style={{ background: "#FFC94D" }}>
            Nazaj na galerije
          </a>
        </div>
      </div>
    );
  }

  if (!album || album.ownerClerkId !== userId) {
    notFound();
  }

  // Surface the owner's Clerk email so the Settings tab can show
  // "you are signed in as …" — users have asked to easily confirm
  // which account a given album is on. Best-effort: if Clerk is down
  // we just pass null and the card renders an em-dash.
  let ownerEmail: string | null = null;
  try {
    const user = await currentUser();
    ownerEmail = user?.emailAddresses?.[0]?.emailAddress ?? null;
  } catch {
    ownerEmail = null;
  }

  return (
    <AlbumAdminPanel
      album={album}
      photos={albumPhotos}
      pendingCount={pendingCount}
      guestCount={guestCount}
      activeTab={tab as "overview" | "gallery" | "qr" | "settings" | "pending" | "film"}
      isNew={isNew}
      isUpgraded={isUpgraded}
      paidPlan={paidPlan}
      ownerEmail={ownerEmail}
    />
  );
}
