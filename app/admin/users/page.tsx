import { db } from "@/lib/db";
import { albums, userPlanOverrides } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { UserUpgradeMenu } from "@/components/admin/UserUpgradeMenu";

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
  // Source of truth = Clerk (every registered user, even if they never
  // created a gallery). Album counts are joined in from our DB.
  //
  // "Paid" counts ONLY albums with a real payment reference attached —
  // a Paddle transaction (txn_…) or a historical Stripe session (cs_…).
  // Excluded:
  //   • manual admin flips (stripeSessionId LIKE "manual_…"/"comp:…")
  //   • expired paid plans (expiresAt < now)
  const now = new Date();
  const albumRows = await db
    .select({
      clerkId: albums.ownerClerkId,
      email: sql<string | null>`MAX(${albums.ownerEmail})`,
      albumCount: count(),
      paidAlbumCount: sql<number>`SUM(CASE
        WHEN ${albums.plan} <> 'free'
          AND (${albums.stripeSessionId} LIKE 'txn_%' OR ${albums.stripeSessionId} LIKE 'cs_%')
          AND (${albums.expiresAt} IS NULL OR ${albums.expiresAt} > ${now})
        THEN 1 ELSE 0
      END)`,
    })
    .from(albums)
    .groupBy(albums.ownerClerkId);

  const albumStats = new Map(
    albumRows.map((r) => [
      r.clerkId,
      { email: r.email, albumCount: r.albumCount, paidAlbumCount: Number(r.paidAlbumCount ?? 0) },
    ]),
  );

  // Pending plan overrides (admin upgrades waiting to be consumed on the
  // user's first album creation). Wrapped in try/catch so a fresh DB
  // without the user_plan_overrides table (migration not yet run) does
  // not crash the whole admin page — the badges just won't show until
  // /api/migrate is hit.
  let overrides = new Map<string, string>();
  try {
    const overrideRows = await db
      .select({ clerkId: userPlanOverrides.clerkId, plan: userPlanOverrides.plan, compTag: userPlanOverrides.compTag })
      .from(userPlanOverrides);
    overrides = new Map(
      overrideRows.map((r) => [r.clerkId, r.compTag ? r.compTag.replace("comp:", "") : r.plan] as [string, string]),
    );
  } catch (err) {
    console.warn("[admin/users] user_plan_overrides query failed (run /api/migrate?):", err);
  }

  // Pull every Clerk user (paginate; the API caps each page at 500).
  const client = await clerkClient();
  const clerkUsers: Awaited<ReturnType<typeof client.users.getUserList>>["data"] = [];
  let offset = 0;
  const PAGE = 100;
  while (true) {
    const { data } = await client.users.getUserList({ limit: PAGE, offset });
    clerkUsers.push(...data);
    if (data.length < PAGE) break;
    offset += PAGE;
    if (offset >= 5000) break; // safety: don't fetch beyond 5k in one render
  }

  const enriched: UserRow[] = clerkUsers.map((u) => {
    const stats = albumStats.get(u.id);
    return {
      clerkId: u.id,
      email: u.emailAddresses?.[0]?.emailAddress ?? stats?.email ?? null,
      firstName: u.firstName ?? null,
      lastName: u.lastName ?? null,
      createdAt: u.createdAt ?? null,
      albumCount: stats?.albumCount ?? 0,
      paidAlbumCount: stats?.paidAlbumCount ?? 0,
    };
  });

  // Surface any DB-only owners whose Clerk record was deleted but who
  // still appear as album owners — otherwise admin loses sight of them.
  for (const [clerkId, stats] of albumStats) {
    if (clerkUsers.some((u) => u.id === clerkId)) continue;
    enriched.push({
      clerkId,
      email: stats.email,
      firstName: null,
      lastName: null,
      createdAt: null,
      albumCount: stats.albumCount,
      paidAlbumCount: stats.paidAlbumCount,
    });
  }

  enriched.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  const withGallery = enriched.filter((u) => u.albumCount > 0).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Uporabniki</h1>
        <p className="text-sm text-gray-500 mt-1">
          {enriched.length} registriranih · {withGallery} z vsaj eno galerijo
        </p>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Uporabnik</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Galerije</th>
              <th className="px-4 py-3 font-medium">Plačane</th>
              <th className="px-4 py-3 font-medium">Registracija</th>
              <th className="px-4 py-3 font-medium">Ročna nadgradnja</th>
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
                <td className="px-4 py-3">
                  <UserUpgradeMenu
                    clerkId={u.clerkId}
                    albumCount={u.albumCount}
                    pendingOverride={overrides.get(u.clerkId) ?? null}
                  />
                </td>
              </tr>
            ))}
            {enriched.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
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
