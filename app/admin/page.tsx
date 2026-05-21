import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { sql, desc, ne, count, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const PLAN_PRICES: Record<string, number> = { basic: 39, plus: 49, premium: 79 };

export default async function AdminOverview() {
  // Headline numbers
  const [{ totalAlbums }] = await db.select({ totalAlbums: count() }).from(albums);
  const [{ paidAlbums }]  = await db
    .select({ paidAlbums: count() })
    .from(albums)
    .where(ne(albums.plan, "free"));
  const [{ totalPhotos }] = await db.select({ totalPhotos: count() }).from(photos);
  const [{ totalUsers }]  = await db
    .select({ totalUsers: sql<number>`COUNT(DISTINCT ${albums.ownerClerkId})` })
    .from(albums);

  const planBreakdown = await db
    .select({ plan: albums.plan, n: count() })
    .from(albums)
    .groupBy(albums.plan);

  const recent = await db.query.albums.findMany({
    orderBy: [desc(albums.createdAt)],
    limit: 8,
  });

  // Rough lifetime revenue from plan column (snapshot, not Stripe-accurate)
  const revenueByPlan = planBreakdown
    .filter((row) => row.plan !== "free")
    .map((row) => ({ plan: row.plan, count: row.n, revenue: row.n * (PLAN_PRICES[row.plan] ?? 0) }));
  const totalRevenue = revenueByPlan.reduce((a, b) => a + b.revenue, 0);

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
          {planBreakdown.map((row) => (
            <div key={row.plan} className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize text-gray-700">{row.plan}</span>
              <span className="text-gray-500">
                {row.n} galerij{" "}
                {row.plan !== "free" && (
                  <span className="ml-2 text-[#C9820A] font-semibold">
                    {row.n * (PLAN_PRICES[row.plan] ?? 0)}€
                  </span>
                )}
              </span>
            </div>
          ))}
          <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between text-sm font-semibold">
            <span>Skupni prihodek (ocena)</span>
            <span className="text-[#C9820A]">{totalRevenue}€</span>
          </div>
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

function Stat({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</span>
        <span className="text-base">{icon}</span>
      </div>
      <p className="font-serif text-3xl text-[#0F1729]">{value}</p>
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
