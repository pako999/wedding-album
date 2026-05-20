import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq, or, desc } from "drizzle-orm";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let userId: string | null = null;
  let userEmail: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
    if (userId) {
      const user = await currentUser();
      userEmail = user?.emailAddresses?.[0]?.emailAddress ?? null;
    }
  } catch {
    redirect("/sign-in");
  }
  if (!userId) redirect("/sign-in");

  let userAlbums: (typeof albums.$inferSelect)[] = [];
  let dbError = false;
  try {
    // Match by clerkId OR by email (for albums created via WedFlow integration
    // where the ownerClerkId comes from a different Clerk instance)
    const whereClause = userEmail
      ? or(eq(albums.ownerClerkId, userId!), eq(albums.ownerEmail, userEmail))
      : eq(albums.ownerClerkId, userId!);

    userAlbums = await db.query.albums.findMany({
      where: whereClause,
      orderBy: desc(albums.createdAt),
    });
  } catch (err) {
    console.error("[dashboard] DB error:", err);
    dbError = true;
  }

  // First-time owners (no albums yet) go straight into the create wizard so
  // the post-signup flow is one seamless step into onboarding instead of an
  // empty list with a CTA they have to click.
  if (!dbError && userAlbums.length === 0) {
    redirect("/dashboard/new");
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F6FB" }}>
      <DashboardNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* DB error banner */}
        {dbError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="text-amber-500 text-lg shrink-0">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Baza podatkov ni nastavljena</p>
              <p className="text-amber-700 text-xs mt-1">
                V Vercel nastavitvah dodajte <code className="bg-amber-100 px-1 rounded">DATABASE_URL</code> nato
                lokalno zaženite: <code className="bg-amber-100 px-1 rounded">npm run db:setup</code>
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-light text-[#0F1729]">Moje galerije</h1>
            <p className="text-sm text-[#0F1729]/50 mt-1">
              {userAlbums.length} {userAlbums.length === 1 ? "galerija" : "galerij"}
            </p>
          </div>
          {!dbError && (
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:brightness-95"
              style={{ background: "#1E3A8A" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nova galerija
            </Link>
          )}
        </div>

        {/* Empty state */}
        {userAlbums.length === 0 && !dbError ? (
          <div className="text-center py-24 bg-white border border-dashed rounded-2xl" style={{ borderColor: "rgba(30,58,138,0.3)" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(30,58,138,0.1)" }}>
              <svg className="w-9 h-9" style={{ color: "#1E3A8A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-light text-[#0F1729] mb-2">Ustvarite prvo galerijo</h2>
            <p className="text-sm text-[#0F1729]/40 mb-2 max-w-xs mx-auto">
              Poroka, rojstni dan, obletnica — ustvarite galerijo in zbirajte spomine.
            </p>
            <p className="text-xs text-[#0F1729]/30 mb-8">💍 🎂 💑 🎉 👶 🎓</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-2xl transition-all duration-200 hover:brightness-95"
              style={{ background: "#1E3A8A" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Ustvari prvo galerijo
            </Link>
            <p className="text-xs text-[#0F1729]/30 mt-4">Brezplačno · Do 200 fotografij · QR koda vključena</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {userAlbums.map((album) => (
              <Link
                key={album.id}
                href={`/dashboard/${album.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-sm hover:border-[#1E3A8A]/40"
                style={{ border: "1px solid #E5E7EB" }}
              >
                {/* Cover */}
                <div className="h-44 relative overflow-hidden" style={{ background: "#EAEEF6" }}>
                  {album.coverImageUrl ? (
                    <img
                      src={album.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <span className="text-5xl opacity-40">
                        {album.eventType === "wedding" ? "💍" :
                         album.eventType === "birthday" ? "🎂" :
                         album.eventType === "anniversary" ? "💑" :
                         album.eventType === "party" ? "🎉" :
                         album.eventType === "baptism" ? "👶" :
                         album.eventType === "graduation" ? "🎓" : "📸"}
                      </span>
                      <span className="text-xs" style={{ color: "rgba(30,58,138,0.5)" }}>Brez naslovnice</span>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      album.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {album.isPublished ? "Aktivno" : "Skrito"}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      album.plan === "premium" ? "text-white" :
                      album.plan === "plus"    ? "text-white bg-[#0F1729]" :
                      album.plan === "basic"   ? "text-white bg-indigo-600" :
                      "bg-white/80 text-[#0F1729]/50"
                    }`}
                    style={album.plan === "premium" ? { background: "#1E3A8A" } : undefined}>
                      {album.plan === "free" ? "Free" : album.plan === "basic" ? "Basic" : album.plan === "plus" ? "Plus" : "Premium"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-serif text-lg font-light text-[#0F1729] mb-0.5">{album.coupleName}</h3>
                  <p className="text-xs text-[#0F1729]/45 mb-4">
                    {album.weddingDate}{album.location ? ` · ${album.location}` : ""}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" style={{ color: "#1E3A8A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                      <span className="text-xs text-[#0F1729]/60">{album.photoCount} fotografij</span>
                    </div>
                    {album.pendingCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-xs text-amber-600 font-medium">{album.pendingCount} v čakanju</span>
                      </div>
                    )}
                    <span className="ml-auto text-xs text-[#0F1729]/30">{album.photoCount}/{album.maxPhotos}</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* + New album card */}
            <Link
              href="/dashboard/new"
              className="group flex flex-col items-center justify-center h-full min-h-[200px] bg-white rounded-2xl transition-all duration-200 hover:border-[#1E3A8A]/50"
              style={{ border: "1.5px dashed #D1D5DB" }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all group-hover:scale-110" style={{ background: "rgba(30,58,138,0.1)" }}>
                <svg className="w-5 h-5" style={{ color: "#1E3A8A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-sm font-semibold" style={{ color: "#1E3A8A" }}>Nova galerija</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
