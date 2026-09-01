import { db } from "@/lib/db";
import { albums, photos, referralConversions, guestEmails, bankOrders } from "@/lib/db/schema";
import { sql, desc, count, eq, isNotNull } from "drizzle-orm";
import { listAllPayments, mollieConfigured, type MolliePayment } from "@/lib/mollie";
import { summarizePaidPlanSales, type PaidPlanId } from "@/lib/admin-sales";

export const dynamic = "force-dynamic";

function eur(cents: number): string {
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default async function AdminOverview() {
  // Payment records — not the album plan column — are the financial source of
  // truth. The previous implementation only recognized historical Stripe /
  // Paddle IDs, so every Mollie sale and paid bank order incorrectly showed 0.
  const configured = mollieConfigured();
  let mollieLoadFailed = false;
  const molliePaymentsPromise: Promise<MolliePayment[]> = configured
    ? listAllPayments().catch((err) => {
        mollieLoadFailed = true;
        console.error("[admin overview] Mollie payment history failed:", err);
        return [];
      })
    : Promise.resolve([]);

  // Headline numbers
  const [
    [{ totalAlbums }],
    [{ totalPhotos }],
    [{ totalUsers }],
    planBreakdown,
    paidBankOrders,
    molliePayments,
  ] = await Promise.all([
    db.select({ totalAlbums: count() }).from(albums),
    db.select({ totalPhotos: count() }).from(photos),
    db.select({ totalUsers: sql<number>`COUNT(DISTINCT ${albums.ownerClerkId})` }).from(albums),
    db.select({ plan: albums.plan, n: count() }).from(albums).groupBy(albums.plan),
    db
      .select({ planId: bankOrders.planId, planPrice: bankOrders.planPrice, status: bankOrders.status })
      .from(bankOrders)
      .where(eq(bankOrders.status, "paid")),
    molliePaymentsPromise,
  ]);
  const sales = summarizePaidPlanSales(molliePayments, paidBankOrders);
  const paidAlbums = sales.totalCount;

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

  return (
    <div className="space-y-8">
      <header>
        <h1 className="gc-admin-page-title text-[#0F1729]">Pregled</h1>
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
        {(!configured || mollieLoadFailed) && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Mollie podatkov trenutno ni bilo mogoče prebrati. Prikaz vključuje samo plačane predračune in zato ni popoln.
          </div>
        )}
        <div className="space-y-2">
          {planBreakdown.map((row) => {
            const paid = row.plan in sales.byPlan
              ? sales.byPlan[row.plan as PaidPlanId]
              : null;
            const real = paid?.count ?? 0;
            return (
              <div key={row.plan} className="flex items-center justify-between gap-2 text-sm flex-wrap">
                <span className="font-medium capitalize text-gray-700">{row.plan}</span>
                <span className="text-gray-500 text-right">
                  {row.n} galerij{" "}
                  {row.plan !== "free" && (
                    <>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">({real} plačanih)</span>{" "}
                      <span className="ml-1 text-[#C9820A] font-semibold whitespace-nowrap">
                        {eur(paid?.revenueCents ?? 0)}
                      </span>
                    </>
                  )}
                </span>
              </div>
            );
          })}
          <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between text-sm font-semibold">
            <span>Skupni prihodek paketov</span>
            <span className="text-[#C9820A]">{eur(sales.totalRevenueCents)}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 pt-2 text-xs text-gray-500 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span>Mollie ({sales.mollieCount})</span>
              <span className="font-semibold text-gray-700">{eur(sales.mollieRevenueCents)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span>Predračuni ({sales.bankCount})</span>
              <span className="font-semibold text-gray-700">{eur(sales.bankRevenueCents)}</span>
            </div>
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
      <p className="text-2xl font-extrabold tracking-tight text-[#0F1729] leading-none">{value}</p>
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
      <p className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[#0F1729]">{value}</p>
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
