import { db } from "@/lib/db";
import { bankOrders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function loadOrders() {
  try {
    return await db.select().from(bankOrders).orderBy(desc(bankOrders.createdAt));
  } catch {
    return [];
  }
}

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700",
  paid:      "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_LABEL: Record<string, string> = {
  pending:   "Čaka plačilo",
  paid:      "Plačano",
  cancelled: "Preklicano",
};

export default async function AdminBankOrders() {
  const orders = await loadOrders();

  const totalPending = orders.filter((o) => o.status === "pending").reduce((s, o) => s + o.planPrice, 0);
  const totalPaid    = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.planPrice, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Naročila po predračunu</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} naročil · čaka plačilo: {totalPending}€ · plačano: {totalPaid}€
        </p>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium">Galerija</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Podatki za račun</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 last:border-0 align-top">
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleString("sl-SI")}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{o.albumSlug}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-[#0F1729]">{o.planName}</span>
                  <span className="ml-1 text-gray-500">{o.planPrice}€</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 break-all">{o.email}</td>
                <td className="px-4 py-3 text-xs text-gray-700 leading-relaxed">
                  {o.billingName ? (
                    <div>
                      <p className="font-semibold">{o.billingName}</p>
                      {o.billingAddress && <p>{o.billingAddress}</p>}
                      {o.billingCity   && <p>{o.billingCity}</p>}
                      {o.billingTaxId  && <p className="text-gray-500">Davčna: {o.billingTaxId}</p>}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Brez podatkov</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${STATUS_STYLE[o.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  Še ni naročil po predračunu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
