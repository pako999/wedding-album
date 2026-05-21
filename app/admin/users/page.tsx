import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

interface UserRow {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: number | null;
  albumCount: number;
  paidAlbumCount: number;
}

export default async function AdminUsers() {
  // Aggregate album counts per owner from our DB
  const rows = await db
    .select({
      clerkId: albums.ownerClerkId,
      email: sql<string | null>`MAX(${albums.ownerEmail})`,
      albumCount: count(),
      paidAlbumCount: sql<number>`SUM(CASE WHEN ${albums.plan} <> 'free' THEN 1 ELSE 0 END)`,
    })
    .from(albums)
    .groupBy(albums.ownerClerkId);

  // Enrich with Clerk profile (best-effort — falls back to DB if Clerk fails)
  const enriched: UserRow[] = await Promise.all(
    rows.map(async (r) => {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(r.clerkId);
        return {
          clerkId: r.clerkId,
          email: user.emailAddresses?.[0]?.emailAddress ?? r.email,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          createdAt: user.createdAt ?? null,
          albumCount: r.albumCount,
          paidAlbumCount: Number(r.paidAlbumCount ?? 0),
        };
      } catch {
        return {
          clerkId: r.clerkId,
          email: r.email,
          firstName: null,
          lastName: null,
          createdAt: null,
          albumCount: r.albumCount,
          paidAlbumCount: Number(r.paidAlbumCount ?? 0),
        };
      }
    }),
  );

  enriched.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Uporabniki</h1>
        <p className="text-sm text-gray-500 mt-1">{enriched.length} uporabnikov z vsaj eno galerijo.</p>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Uporabnik</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Galerije</th>
              <th className="px-4 py-3 font-medium">Plačane</th>
              <th className="px-4 py-3 font-medium">Registracija</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((u) => (
              <tr key={u.clerkId} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0F1729]">
                    {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                  </p>
                  <p className="font-mono text-[10px] text-gray-400">{u.clerkId}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700 font-semibold">{u.albumCount}</td>
                <td className="px-4 py-3">
                  {u.paidAlbumCount > 0 ? (
                    <span className="text-xs font-bold text-[#C9820A]">{u.paidAlbumCount}</span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("sl-SI") : "—"}
                </td>
              </tr>
            ))}
            {enriched.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                  Ni uporabnikov.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
