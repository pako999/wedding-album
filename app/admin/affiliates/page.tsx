import Link from "next/link";
import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:   { label: "V čakanju", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  active:    { label: "Aktivno",   cls: "bg-green-50 text-green-700 border-green-200" },
  suspended: { label: "Ustavljeno",cls: "bg-orange-50 text-orange-700 border-orange-200" },
  rejected:  { label: "Zavrnjeno", cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

function fmtEur(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

async function loadAffiliates() {
  try {
    return await db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  } catch {
    return [];
  }
}

export default async function AdminAffiliatesPage() {
  const rows = await loadAffiliates();
  const counts = {
    pending: rows.filter((a) => a.status === "pending").length,
    active: rows.filter((a) => a.status === "active").length,
    suspended: rows.filter((a) => a.status === "suspended").length,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Partnerji</h1>
        <p className="text-sm text-gray-500 mt-1">
          {rows.length} skupaj · {counts.pending} v čakanju · {counts.active} aktivnih · {counts.suspended} ustavljenih
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-sm text-gray-500">Ni partnerjev.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Ime</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Koda</th>
                <th className="px-4 py-3 font-medium">%</th>
                <th className="px-4 py-3 font-medium">Kliki</th>
                <th className="px-4 py-3 font-medium">Naročila</th>
                <th className="px-4 py-3 font-medium">Skupaj</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const s = STATUS_LABEL[a.status] ?? { label: a.status, cls: "bg-gray-100 text-gray-500 border-gray-200" };
                return (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40">
                    <td className="px-4 py-3 font-medium text-[#0F1729]">{a.name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.email}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#1E3A8A]">{a.referralCode}</td>
                    <td className="px-4 py-3 text-gray-700">{a.commissionRate}%</td>
                    <td className="px-4 py-3 text-gray-700">{a.totalClicks}</td>
                    <td className="px-4 py-3 text-gray-700">{a.totalConversions}</td>
                    <td className="px-4 py-3 font-semibold text-[#0F1729]">{fmtEur(a.totalEarningsCents)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/affiliates/${a.id}`} className="text-xs text-[#1E3A8A] hover:underline">
                        Uredi →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
