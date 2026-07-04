import { db } from "@/lib/db";
import { albums, photos, referralConversions, guestEmails } from "@/lib/db/schema";
import { sql, desc, and, ne, count, eq, isNotNull, gt, or, like, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

const PLAN_PRICES: Record<string, number> = { basic: 39, plus: 49, premium: 99 };

export default async function AdminOverview() {
  // "Paid" means: plan != free AND a real payment reference is attached —
  // a Paddle transaction (txn_…) or a historical Stripe session (cs_…) —
  // AND the access window hasn't expired. Excludes manually-flipped test
  // rows (stripeSessionId starts with "manual_" / "comp:") and expired paid
  // plans. Keeps the dashboard honest.
  const now = new Date();
  const realPaidWhere = and(
    ne(albums.plan, "free"),
    or(like(albums.stripeSessionId, "txn_%"), like(albums.stripeSessionId, "cs_%")),
    or(isNull(albums.expiresAt), gt(albums.expiresAt, now)),
  );

  // Headline numbers
  const [{ totalAlbums }] = await db.select({ totalAlbums: count() }).from(albums);
  const [{ paidAlbums }]  = await db
    .select({ paidAlbums: count() })
    .from(albums)
    .where(realPaidWhere);
  const [{ totalPhotos }] = await db.select({ totalPhotos: count() }).from(photos);
  const [{ totalUsers }]  = await db
    .select({ totalUsers: sql<number>`COUNT(DISTINCT ${albums.ownerClerkId})` })
    .from(albums);

  // Plan breakdown counts every album by its plan column (for visibility),
  // but the revenue calc below applies the same realPaidWhere filter so
  // manual fixes don't inflate revenue.
  const planBreakdown = await db
    .select({ plan: albums.plan, n: count() })
    .from(albums)
    .groupBy(albums.plan);

  const paidByPlanRaw = await db
    .select({ plan: albums.plan, n: count() })
    .from(albums)
    .where(realPaidWhere)
    .groupBy(albums.plan);

  const recent = await db.query.albums.findMany({
    orderBy: [desc(albums.createdAt)],
    limit: 8,
  });

  // ── Referral engine (guest viral loop) metrics ──────────────────────────
  // Wrapped in try/catch so a DB that hasn't run migrations yet doesn't
  // crash the whole overview.
  let referralSignups = 0;
  let referralPaid = 0;
  let capturedGuestEmails = 0;
  let d3Sent = 0;
  let d21Sent = 0;
  try {
    const [{ c }] = await db.select({ c: count() }).from(referralConversions);
    referralSignups = c;
  } catch { /* table not migrated yet */ }
  try {
    const [{ c }] = await db
      .select({ c: count() })
      .from(referralConversions)
      .where(isNotNull(referralConversions.convertedToPaidAt));
    referralPaid = c;
  } catch { /* ignore */ }
  try {
    const [{ c }] = await db.select({ c: count() }).from(guestEmails);
    capturedGuestEmails = c;
    const [{ c: d3 }] = await db
      .select({ c: count() })
      .from(guestEmails)
      .where(isNotNull(guestEmails.d3SentAt));
    d3Sent = d3;
    const [{ c: d21 }] = await db
      .select({ c: count() })
      .from(guestEmails)
      .where(isNotNull(guestEmails.d21SentAt));
    d21Sent = d21;
  } catch { /* ignore */ }

  // K-factor: paid conversions ÷ paid albums. Each paid event is one couple
  // who could plausibly refer new couples, so it's the honest denominator.
  // A K of 1.0 = every paid event yields exactly one new paid event.
  const kFactor = paidAlbums > 0 ? referralPaid / paidAlbums : 0;

  // Rough lifetime revenue — derived from REAL paid albums only
  // (Stripe-anchored, non-expired). Manual DB flips and expired plans
  // are excluded so the dashboard total doesn't drift from Stripe.
  const revenueByPlan = paidByPlanRaw.map((row) => ({
    plan: row.plan,
    count: row.n,
    revenue: row.n * (PLAN_PRICES[row.plan] ?? 0),
  }));
  const totalRevenue = revenueByPlan.reduce((a, b) => a + b.revenue, 0);
  const paidByPlanMap = Object.fromEntries(paidByPlanRaw.map((r) => [r.plan, r.n]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Pregled</h1>
        <p className="text-sm text-gray-500 mt-1">Stanje platforme v realnem času.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Uporabniki"   value={totalUsers} icon="👥" />
        <Stat label="Galerije"     value={totalAlbums} icon="🖼️" />
        <Stat label="Plačani paketi" value={paidAlbums} icon="💎" />
        <Stat label="Fotografije"  value={totalPhotos} icon="📷" />
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-[#0F1729] mb-4">Paketi</h2>
        <div className="space-y-2">
          {planBreakdown.map((row) => {
            // For paid plans, show the count of REAL paid albums next to
            // the total (Real / Total) so the dashboard makes clear which
            // are Stripe-anchored vs manually flipped / expired.
            const real = paidByPlanMap[row.plan] ?? 0;
            return (
              <div key={row.plan} className="flex items-center justify-between gap-2 text-sm flex-wrap">
                <span className="font-medium capitalize text-gray-700">{row.plan}</span>
                <span className="text-gray-500 text-right">
                  {row.n} galerij{" "}
                  {row.plan !== "free" && (
                    <>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">({real} plačanih)</span>{" "}
                      <span className="ml-1 text-[#C9820A] font-semibold whitespace-nowrap">
                        {real * (PLAN_PRICES[row.plan] ?? 0)}€
                      </span>
                    </>
                  )}
                </span>
              </div>
            );
          })}
          <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between text-sm font-semibold">
            <span>Skupni prihodek (ocena)</span>
            <span className="text-[#C9820A]">{totalRevenue}€</span>
          </div>
        </div>
      </section>

      {/* ── Referral engine ────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-white to-[#FFF9EC] rounded-2xl border border-[#FFE3A2] p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🌱</span>
          <h2 className="font-semibold text-[#0F1729]">Viralna zanka (Referral engine)</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          Koliko novih plačanih dogodkov ustvari en plačan dogodek prek priporočil.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="K-faktor" value={kFactor.toFixed(2)} hint={kFactor >= 1 ? "viralno ≥ 1.0" : "pod-viralno"} />
          <MiniStat label="Prijave prek priporočil" value={referralSignups} hint="skupno" />
          <MiniStat label="Plačane konverzije" value={referralPaid} hint="dejansko kupili" />
          <MiniStat label="Zajeti e-maili gostov" value={capturedGuestEmails} hint={`D3: ${d3Sent} · D21: ${d21Sent}`} />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-[#0F1729] mb-4">Zadnje galerije</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="pb-2 font-medium">Ime</th>
              <th className="pb-2 font-medium">Paket</th>
              <th className="pb-2 font-medium">Ustvarjeno</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {recent.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 font-medium text-[#0F1729]">{a.coupleName}</td>
                <td className="py-2.5">
                  <PlanPill plan={a.plan} />
                </td>
                <td className="py-2.5 text-gray-500">{new Date(a.createdAt).toLocaleDateString("sl-SI")}</td>
                <td className="py-2.5 text-right">
                  <a href={`/admin/albums?q=${a.slug}`} className="text-xs text-[#C9820A] font-semibold hover:underline">
                    Uredi →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-xl border border-[#FFE3A2]/60 p-3">
      <p className="text-[10px] uppercase tracking-wide text-[#C9820A] font-bold mb-1">{label}</p>
      <p className="font-serif text-2xl text-[#0F1729] leading-none">{value}</p>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 min-w-0">
      <span className="absolute top-3 right-3 text-base">{icon}</span>
      <span className="block text-[10px] sm:text-xs uppercase tracking-wide text-gray-400 font-semibold pr-7 break-words leading-tight mb-2">
        {label}
      </span>
      <p className="font-serif text-2xl sm:text-3xl text-[#0F1729]">{value}</p>
    </div>
  );
}

export function PlanPill({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    free:    "bg-gray-100 text-gray-600",
    basic:   "bg-amber-50 text-amber-700",
    plus:    "bg-pink-50 text-pink-700",
    premium: "bg-violet-50 text-violet-700",
  };
  return (
    <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${styles[plan] ?? styles.free}`}>
      {plan}
    </span>
  );
}
