import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Graceful fallback if Clerk is not yet configured
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    redirect("/sign-in");
  }
  if (!userId) redirect("/sign-in");

  // Graceful fallback if DB is not yet configured
  let userAlbums: (typeof albums.$inferSelect)[] = [];
  let dbError = false;
  try {
    userAlbums = await db.query.albums.findMany({
      where: eq(albums.ownerClerkId, userId),
      orderBy: desc(albums.createdAt),
    });
  } catch (err) {
    console.error("[dashboard] DB error:", err);
    dbError = true;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <DashboardNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* DB not configured banner */}
        {dbError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <span className="text-amber-500 text-lg shrink-0">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Baza podatkov ni nastavljena</p>
              <p className="text-amber-700 text-xs mt-0.5">
                V Vercel nastavitvah dodajte <code className="bg-amber-100 px-1 rounded">DATABASE_URL</code> in zaženite{" "}
                <code className="bg-amber-100 px-1 rounded">npx drizzle-kit push</code>, da ustvarite tabele.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-light text-[#2C2825]">Vaši albumi</h1>
            <p className="font-sans text-sm text-[#2C2825]/60 mt-1">{userAlbums.length} {userAlbums.length === 1 ? "album" : "albumov"}</p>
          </div>
          <Link
            href="https://wedflow.app/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#C9A96E]/30 text-[#2C2825] font-sans text-sm rounded-xl hover:border-[#C9A96E] hover:bg-[#C9A96E]/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            WedFlow
          </Link>
        </div>

        {userAlbums.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#C9A96E]/30 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="font-serif text-xl font-light text-[#2C2825]/60 mb-2">Še nimate albuma</p>
            <p className="font-sans text-sm text-[#2C2825]/40 mb-6">Ustvarite album v vašem WedFlow profilu.</p>
            <Link
              href="https://wedflow.app/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm rounded-xl hover:bg-[#C9A96E] transition-colors"
            >
              Pojdi na WedFlow
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {userAlbums.map((album) => (
              <Link
                key={album.id}
                href={`/dashboard/${album.slug}`}
                className="group block bg-white border border-[#C9A96E]/20 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#C9A96E]/40 transition-all duration-200"
              >
                {/* Cover */}
                <div className="h-40 bg-gradient-to-br from-[#FAF7F2] to-[#F0E8D8] relative overflow-hidden">
                  {album.coverImageUrl ? (
                    <img
                      src={album.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#C9A96E]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`font-sans text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
                      album.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {album.isPublished ? "Aktivno" : "Skrito"}
                    </span>
                  </div>
                  {/* Plan badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`font-sans text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
                      album.plan === "premium" ? "bg-[#C9A96E] text-white" :
                      album.plan === "pro" ? "bg-[#2C2825] text-[#FAF7F2]" :
                      "bg-white/80 text-[#2C2825]/60"
                    }`}>
                      {album.plan}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-serif text-lg font-light text-[#2C2825] mb-1">{album.coupleName}</h3>
                  <p className="font-sans text-xs text-[#2C2825]/50 mb-3">{album.weddingDate}{album.location ? ` · ${album.location}` : ""}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                      <span className="font-sans text-xs text-[#2C2825]/70">{album.photoCount}</span>
                    </div>
                    {album.pendingCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="font-sans text-xs text-amber-600 font-medium">{album.pendingCount} v čakanju</span>
                      </div>
                    )}
                    <div className="ml-auto font-sans text-xs text-[#2C2825]/40">
                      {album.photoCount}/{album.maxPhotos}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
