import { db } from "@/lib/db";
import { albums, userPlanOverrides, userMeta, userAttribution } from "@/lib/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { UserUpgradeMenu } from "@/components/admin/UserUpgradeMenu";
import { countryFlag, inferCountryFromLocation } from "@/lib/user-country";
import type { Channel } from "@/lib/attribution/signup";

export const dynamic = "force-dynamic";

type PlanTier = "free" | "basic" | "plus" | "premium";
type PlanSource = "none" | "paid" | "admin" | "inherit";

/** Acquisition-source row surfaced per user (null = signed up before we
 *  started tracking, or not yet captured). */
interface SourceInfo {
  channel: Channel | null;
  utmSource: string | null;
  utmCampaign: string | null;
  affiliateRef: string | null;
  referrerUrl: string | null;
}

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
  /** ISO-3166 alpha-2 country + how we know it. "ip" = geo header
   *  (reliable), "location" = inferred from album location text. */
  country: string | null;
  countrySource: "ip" | "location" | null;
  /** Where they came from when they registered (null = pre-tracking). */
  source: SourceInfo | null;
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
      location: albums.location,
    })
    .from(albums);

  interface AlbumStats {
    email: string | null;
    albumCount: number;
    paidAlbumCount: number;
    bestPlan: PlanTier;
    planSource: PlanSource;
    isComp: boolean;
    /** Country inferred from the first album location that matches. */
    inferredCountry: string | null;
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
      inferredCountry: null,
    };
    cur.albumCount++;
    if (a.ownerEmail && !cur.email) cur.email = a.ownerEmail;
    if (!cur.inferredCountry) cur.inferredCountry = inferCountryFromLocation(a.location);

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

  // Recorded IP countries (x-vercel-ip-country captured on album create +
  // dashboard visits). try/catch so a not-yet-migrated DB doesn't crash
  // the page — countries just show as inferred/— until migration runs.
  let ipCountries = new Map<string, string>();
  try {
    const metaRows = await db
      .select({ clerkId: userMeta.clerkId, country: userMeta.country })
      .from(userMeta);
    ipCountries = new Map(
      metaRows.filter((r) => r.country).map((r) => [r.clerkId, r.country!] as [string, string]),
    );
  } catch (err) {
    console.warn("[admin/users] user_meta query failed (run /api/migrate?):", err);
  }

  // Signup acquisition source (first-touch channel + details). try/catch so
  // a not-yet-migrated DB (no user_attribution table) doesn't crash the
  // page — the Vir column just shows "—" until migration runs.
  const sources = new Map<string, SourceInfo>();
  try {
    const rows = await db
      .select({
        clerkId: userAttribution.clerkId,
        channel: userAttribution.channel,
        utmSource: userAttribution.utmSource,
        utmCampaign: userAttribution.utmCampaign,
        affiliateRef: userAttribution.affiliateRef,
        referrerUrl: userAttribution.referrerUrl,
      })
      .from(userAttribution);
    for (const r of rows) {
      sources.set(r.clerkId, {
        channel: (r.channel as Channel | null) ?? null,
        utmSource: r.utmSource,
        utmCampaign: r.utmCampaign,
        affiliateRef: r.affiliateRef,
        referrerUrl: r.referrerUrl,
      });
    }
  } catch (err) {
    console.warn("[admin/users] user_attribution query failed (run /api/migrate?):", err);
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
    const ipCountry = ipCountries.get(u.id) ?? null;
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
      country: ipCountry ?? stats?.inferredCountry ?? null,
      countrySource: ipCountry ? "ip" : stats?.inferredCountry ? "location" : null,
      source: sources.get(u.id) ?? null,
    };
  });

  // Surface any DB-only owners whose Clerk record was deleted but who
  // still appear as album owners — otherwise admin loses sight of them.
  for (const [clerkId, stats] of albumStats) {
    if (clerkUsers.some((u) => u.id === clerkId)) continue;
    const ipCountry = ipCountries.get(clerkId) ?? null;
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
      country: ipCountry ?? stats.inferredCountry,
      countrySource: ipCountry ? "ip" : stats.inferredCountry ? "location" : null,
      source: sources.get(clerkId) ?? null,
    });
  }

  enriched.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  const withGallery = enriched.filter((u) => u.albumCount > 0).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1729]">Uporabniki</h1>
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
              <th className="px-4 py-3 font-medium">Država</th>
              <th className="px-4 py-3 font-medium">Vir</th>
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
                <td className="px-4 py-3">
                  {u.country ? (
                    <span
                      className="inline-flex items-center gap-1.5 text-sm text-gray-700"
                      title={u.countrySource === "ip"
                        ? "Zaznano iz IP naslova"
                        : "Ocenjeno iz lokacije dogodka"}
                    >
                      <span className="text-base leading-none">{countryFlag(u.country)}</span>
                      <span className="font-semibold">{u.country}</span>
                      {u.countrySource === "location" && (
                        <span className="text-[10px] text-gray-400">≈</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3"><SourceBadge source={u.source} /></td>
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
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
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

/** Acquisition-source badge for the Vir column. Shows the derived channel
 *  with a colour, and the most useful detail underneath (campaign,
 *  affiliate code, or referring host). Full details on hover (title). */
function SourceBadge({ source }: { source: SourceInfo | null }) {
  if (!source || !source.channel) {
    return <span className="text-xs text-gray-300">—</span>;
  }

  const meta: Record<Channel, { label: string; cls: string }> = {
    google_ads:     { label: "Google Ads", cls: "bg-blue-100 text-blue-700" },
    meta_ads:       { label: "Meta Ads",   cls: "bg-indigo-100 text-indigo-700" },
    affiliate:      { label: "Affiliate",  cls: "bg-fuchsia-100 text-fuchsia-700" },
    referral:       { label: "Priporočilo", cls: "bg-emerald-100 text-emerald-700" },
    organic_search: { label: "Organsko",   cls: "bg-green-100 text-green-700" },
    social:         { label: "Družbeno",   cls: "bg-sky-100 text-sky-700" },
    referral_web:   { label: "Povezava",   cls: "bg-teal-100 text-teal-700" },
    campaign:       { label: "Kampanja",   cls: "bg-amber-100 text-amber-700" },
    direct:         { label: "Direktno",   cls: "bg-gray-100 text-gray-500" },
  };
  const m = meta[source.channel];

  // Best single detail to show under the badge.
  let host = "";
  if (source.referrerUrl) {
    try { host = new URL(source.referrerUrl.startsWith("http") ? source.referrerUrl : `https://${source.referrerUrl}`).hostname.replace(/^www\./, ""); } catch { /* */ }
  }
  const detail =
    source.affiliateRef ? source.affiliateRef :
    source.utmCampaign  ? source.utmCampaign  :
    source.utmSource    ? source.utmSource    :
    host                ? host                : null;

  const tip = [
    source.utmSource && `utm_source=${source.utmSource}`,
    source.utmCampaign && `utm_campaign=${source.utmCampaign}`,
    source.affiliateRef && `ref=${source.affiliateRef}`,
    source.referrerUrl && `referrer=${source.referrerUrl}`,
  ].filter(Boolean).join(" · ") || m.label;

  return (
    <div className="flex flex-col gap-0.5" title={tip}>
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide w-fit ${m.cls}`}>
        {m.label}
      </span>
      {detail && (
        <span className="text-[10px] text-gray-400 truncate max-w-[140px]">{detail}</span>
      )}
    </div>
  );
}
