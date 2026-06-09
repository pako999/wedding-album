import { listTransactions, paddleConfigured, PADDLE_ENV, isPaidStatus, type PaddleTransaction } from "@/lib/paddle";

export const metadata = { robots: { index: false, follow: false } };


export const dynamic = "force-dynamic";

async function safeList(): Promise<PaddleTransaction[]> {
  if (!paddleConfigured()) return [];
  try {
    return await listTransactions(50);
  } catch (err) {
    console.error("[admin payments] paddle list failed:", err);
    return [];
  }
}

const DASHBOARD_BASE =
  PADDLE_ENV === "live"
    ? "https://vendors.paddle.com/transactions-v2"
    : "https://sandbox-vendors.paddle.com/transactions-v2";

function eur(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  return currency.toUpperCase() === "EUR" ? `${amount}€` : `${amount} ${currency.toUpperCase()}`;
}

export default async function AdminPayments() {
  const txns = await safeList();
  const configured = paddleConfigured();

  const totalEur = txns
    .filter((t) => isPaidStatus(t.status) && (t.details?.totals?.currency_code ?? "EUR").toUpperCase() === "EUR")
    .reduce((sum, t) => sum + Number(t.details?.totals?.grand_total ?? "0") / 100, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Plačila</h1>
        <p className="text-sm text-gray-500 mt-1">
          Zadnjih {txns.length} transakcij iz Paddle · skupaj plačano {totalEur.toFixed(2)}€
          {PADDLE_ENV === "sandbox" && " · sandbox"}
        </p>
      </header>

      {!configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>PADDLE_API_KEY ni nastavljen.</strong> Lokalno ne morem brati transakcij.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Stranka</th>
              <th className="px-4 py-3 font-medium">Galerija</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Znesek</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium text-right">Paddle</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => {
              const cents = Number(t.details?.totals?.grand_total ?? "0");
              const currency = t.details?.totals?.currency_code ?? "EUR";
              return (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-400">{t.customer?.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{t.custom_data?.albumSlug ?? "—"}</td>
                  <td className="px-4 py-3 text-xs uppercase font-semibold text-gray-700">{t.custom_data?.planId ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-[#0F1729]">{eur(cents, currency)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${
                      isPaidStatus(t.status)
                        ? "bg-green-50 text-green-700"
                        : t.status === "canceled"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-amber-50 text-amber-700"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{t.created_at ? new Date(t.created_at).toLocaleString("sl-SI") : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`${DASHBOARD_BASE}/${t.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[#C9820A] hover:underline"
                    >
                      Odpri →
                    </a>
                  </td>
                </tr>
              );
            })}
            {txns.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  Ni Paddle transakcij.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

