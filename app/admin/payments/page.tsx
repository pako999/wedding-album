import { listPayments, mollieConfigured, isPaidStatus, type MolliePayment } from "@/lib/mollie";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

async function safeList(): Promise<MolliePayment[]> {
  if (!mollieConfigured()) return [];
  try {
    return await listPayments(50);
  } catch (err) {
    console.error("[admin payments] mollie list failed:", err);
    return [];
  }
}

export default async function AdminPayments() {
  const payments = await safeList();
  const configured = mollieConfigured();

  const totalEur = payments
    .filter((p) => isPaidStatus(p.status) && p.amount.currency.toUpperCase() === "EUR")
    .reduce((sum, p) => sum + parseFloat(p.amount.value), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Plačila</h1>
        <p className="text-sm text-gray-500 mt-1">
          Zadnjih {payments.length} transakcij iz Mollie · skupaj plačano {totalEur.toFixed(2)}€
        </p>
      </header>

      {!configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>MOLLIE_API_KEY ni nastavljen.</strong> Dodajte ga v okoljske spremenljivke.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Galerija</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Znesek</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium text-right">ID</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {p.metadata?.albumSlug ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs uppercase font-semibold text-gray-700">
                  {p.metadata?.planId ?? "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-[#0F1729]">
                  {parseFloat(p.amount.value).toFixed(2)}{p.amount.currency === "EUR" ? "€" : ` ${p.amount.currency}`}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${
                    isPaidStatus(p.status)
                      ? "bg-green-50 text-green-700"
                      : p.status === "canceled" || p.status === "expired" || p.status === "failed"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-amber-50 text-amber-700"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {p.createdAt ? new Date(p.createdAt).toLocaleString("sl-SI") : "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-400">
                  {p.id}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  Ni Mollie transakcij.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
