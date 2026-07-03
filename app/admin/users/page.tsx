import { db } from "@/lib/db";
import { albums, userPlanOverrides } from "@/lib/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { UserUpgradeMenu } from "@/components/admin/UserUpgradeMenu";

export const dynamic = "force-dynamic";

type PlanTier = "free" | "basic" | "plus" | "premium";
type PlanSource = "none" | "paid" | "admin" | "inherit";

interface UserRow {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: number | null;
  albumCount: number;
  paidAlbumCount: number;
  /** Best plan across all this user's active (non-expired) albums. */
  bestPlan: PlanTier;
  /** How they got that plan — real payment, admin grant, or inherited. */
  planSource: PlanSource;
  /** True if any active album has a comp tag (influencer/sponsor). */
  isComp: boolean;
}

const PLAN_RANK: Record<PlanTier, number> = { free: 0, basic: 1, plus: 2, premium: 3 };

/** Pick the higher-value of two plans. */
function betterPlan(a: PlanTier, b: PlanTier): PlanTier {
  return PLAN_RANK[a] >= PLAN_RANK[b] ? a : b;
}

export default async function AdminUsers() {
  // Source of truth = Clerk (every registered user, even if they never
  // created a gallery). Per-album detail is joined in so we can show the
  // same plan / paid-vs-admin-granted breakdown as the Galerije view.
  const now = new Date();
  const albumDetail = await db
    .select({
      ownerClerkId: albums.ownerClerkId,
      ownerEmail: albums.ownerEmail,
      plan: albums.plan,
      stripeSessionId: albums.stripeSessionId,
      expiresAt: albums.expiresAt,
    })
    .from(albums);

  interface AlbumStats {
    email: string | null;
    albumCount: number;
    paidAlbumCount: number;
    bestPlan: PlanTier;
    planSource: PlanSource;
    isComp: boolean;
  }
  const albumStats = new Map<string, AlbumStats>();
  for (const a of albumDetail) {
    const key = a.ownerClerkId;
    const cur = albumStats.get(key) ?? {
      email: null,
      albumCount: 0,
      paidAlbumCount: 0,
      bestPlan: "free" as PlanTier,
      planSource: "none" as PlanSource,
      isComp: false,
    };
    cur.albumCount++;
    if (a.ownerEmail && !cur.email) cur.email = a.ownerEmail;

    // An album is "active" for plan-badge purposes if not yet expired.
    const active = a.expiresAt == null || a.expiresAt > now;
    if (!active) {
      albumStats.set(key, cur);
      continue;
    }

    const plan = (a.plan ?? "free") as PlanTier;
    const sid = a.stripeSessionId ?? "";

    // Classify the payment source for this album.
    const isRealPaid = plan !== "free" && (sid.startsWith("txn_") || sid.startsWith("cs_"));
    const isComp    = sid === "comp:influencer" || sid === "comp:sponsor";
    const isAdmin   = isComp || sid.startsWith("admin-grant:") || sid.startsWith("admin-override:") || sid.startsWith("manual_fix");
    const isInherit = sid.startsWith("inherit:");

    if (isRealPaid) cur.paidAlbumCount++;
    if (isComp) cur.isComp = true;

    // Roll up the strongest plan across active albums, and record how it
    // was granted. Real payment > admin > inherit > none.
    if (PLAN_RANK[plan] > PLAN_RANK[cur.bestPlan]) {
      cur.bestPlan = plan;
      cur.planSource = isRealPaid ? "paid" : isAdmin ? "admin" : isInherit ? "inherit" : (plan !== "free" ? "paid" : "none");
    } else if (plan === cur.bestPlan && cur.planSource === "none" && plan !== "free") {
      cur.planSource = isRealPaid ? "paid" : isAdmin ? "admin" : "inherit";
    }
    albumStats.set(key, cur);
  }

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
      bestPlan: stats?.bestPlan ?? "free",
      planSource: stats?.planSource ?? "none",
      isComp: stats?.isComp ?? false,
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
      bestPlan: stats.bestPlan,
      planSource: stats.planSource,
      isComp: stats.isComp,
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
              <th className="px-4 py-3 font-medium">Paket</th>
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
                  <PlanBadge
                    plan={u.bestPlan}
                    source={u.planSource}
                    isComp={u.isComp}
                    hasAlbums={u.albumCount > 0}
                  />
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

/** Colour-coded plan badge that matches what admin sees in the Galerije
 *  table — so the two views agree at a glance. */
function PlanBadge({
  plan,
  source,
  isComp,
  hasAlbums,
}: {
  plan: PlanTier;
  source: PlanSource;
  isComp: boolean;
  hasAlbums: boolean;
}) {
  if (!hasAlbums) {
    return <span className="text-xs text-gray-300">brez galerij</span>;
  }
  if (plan === "free") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500">
        Free
      </span>
    );
  }
  // Comp badges (influencer/sponsor) get their own colour so they read
  // as "gift" instead of "paid customer".
  if (isComp) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-fuchsia-100 text-fuchsia-700">
        {plan} <span className="opacity-60">· comp</span>
      </span>
    );
  }
  const paletteByPlan: Record<Exclude<PlanTier, "free">, string> = {
    basic:   "bg-blue-100 text-blue-700",
    plus:    "bg-emerald-100 text-emerald-700",
    premium: "bg-amber-100 text-amber-700",
  };
  const labelBySource: Record<PlanSource, string> = {
    paid:    "plačan",
    admin:   "ročno",
    inherit: "podedovano",
    none:    "",
  };
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${paletteByPlan[plan]} w-fit`}>
        {plan}
      </span>
      {labelBySource[source] && (
        <span className="text-[10px] text-gray-400 lowercase">{labelBySource[source]}</span>
      )}
    </div>
  );
}
