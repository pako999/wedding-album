import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and, countDistinct } from "drizzle-orm";
import { AlbumAdminPanel } from "@/components/dashboard/AlbumAdminPanel";
import { requireAdmin } from "@/lib/admin";

export const metadata = { robots: { index: false, follow: false } };


export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; new?: string; upgraded?: string; plan?: string; txn?: string }>;
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
    txn: paddleTxnId,
  } = await searchParams;
  const isNew = isNewParam === "1";
  const isUpgraded = isUpgradedParam === "1";
  const paidPlan =
    planParam === "basic" || planParam === "plus" || planParam === "premium"
      ? planParam
      : undefined;

  // Webhook backstop: if the user arrived from the Paddle.js checkout with a
  // transaction id, reconcile the upgrade *before* loading the album so the
  // page they see already reflects the new plan. Paddle webhooks can fail to
  // deliver (e.g. apex->www redirect drops the POST), but the customer always
  // hits this page after a successful payment, so this gives us a hard
  // guarantee that paid albums actually flip.
  if (isUpgraded && paddleTxnId) {
    const { reconcilePaddleTransaction } = await import("@/lib/paddle-reconcile");
    const result = await reconcilePaddleTransaction(paddleTxnId, slug);
    if (!result.ok) {
      console.warn("[reconcile] txn", paddleTxnId, "→", result.reason);
    } else {
      console.log("[reconcile] applied", result.plan, "to", slug, `(${result.status})`);
    }
  }

  let album: (typeof albums.$inferSelect) | null = null;
  let albumPhotos: (typeof photos.$inferSelect)[] = [];
  let pendingCount = 0;
  let guestCount = 0;

  // Fetch the current user's emails up front so the ownership check
  // can fall back to email matching. We walk ALL verified addresses
  // on the Clerk user — not just [0] — because Clerk doesn't
  // guarantee that the first email is the primary or the sign-in one.
  // The /admin gate (lib/admin.ts → pickAllowlistedEmail) and the
  // shared mutation helper (lib/album-ownership.ts) both walk the
  // full list; keep this in sync so the dashboard read path matches
  // every mutation path.
  let viewerEmails: string[] = [];
  try {
    const u = await currentUser();
    viewerEmails = (u?.emailAddresses ?? [])
      .map((e) => e.emailAddress?.toLowerCase())
      .filter((e): e is string => !!e);
  } catch {
    // ignore — fall back to ID-only match
  }
  const viewerEmail = viewerEmails[0] ?? null;
  const isOwnerOfAlbum = (
    a: { ownerClerkId: string; ownerEmail: string | null },
  ): boolean => {
    if (a.ownerClerkId === userId) return true;
    if (!a.ownerEmail) return false;
    const wanted = a.ownerEmail.toLowerCase();
    return viewerEmails.some((e) => e === wanted);
  };

  // Platform-admin override: an allowlisted + password-cookie'd admin
  // can open ANY album from /admin/albums → "Admin" button. Computed
  // once so the same gate applies to a 404'd slug and any subsequent
  // data fetches. Banner in AlbumAdminPanel keeps the admin aware
  // they're not on their own gallery.
  const platformAdmin = await requireAdmin();
  const isPlatformAdmin = !!platformAdmin;

  try {
    album = await db.query.albums.findFirst({
      where: eq(albums.slug, slug),
    }) ?? null;

    if (album && (isOwnerOfAlbum(album) || isPlatformAdmin)) {
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

  if (!album || (!isOwnerOfAlbum(album) && !isPlatformAdmin)) {
    notFound();
  }

  // Settings tab shows "you're signed in as …". When admin-impersonating
  // we want it to show the ALBUM'S owner email (so the admin knows
  // whose account they're touching), not the admin's own. Otherwise
  // the viewer is the owner — their email is the right one to show.
  const isOwner = isOwnerOfAlbum(album);
  const viewingAsAdmin = isPlatformAdmin && !isOwner;
  const ownerEmail: string | null = viewingAsAdmin
    ? album.ownerEmail ?? null
    : viewerEmail;

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
      viewingAsAdmin={viewingAsAdmin}
    />
  );
}

